import { useEffect, useRef, useState } from 'react'
import { getTopArtists, getTopTracks } from '../services/api'
import { useMatchComparison } from '../hooks/useMatchComparison'
import { describeMatch } from '../lib/resultSummary'
import DownArrow from './DownArrow'
import ErrorMessage from './ErrorMessage'
import Footer from './Footer'
import MatchDescription from './MatchDescription'
import MatchTable from './MatchTable'

// only one ErrorMessage is ever rendered, so a static id is fine -- lets
// the invalid username field(s) point at it via aria-describedby
const ERROR_ID = 'match-error'

// shorter than the loading box's visible copy on purpose: role="status" is
// polite, so it reads to the end, and a long sentence still being spoken
// when results arrive delays the summary that actually matters
const LOADING_ANNOUNCEMENT = 'Loading'

const Home = () => {
  // scroll targets (the score box as loading starts, the shared-artists
  // panel once results land) and focus targets after a failed submit
  const scoreRef = useRef(null)
  const sharedArtistsRef = useRef(null)
  const usernameOneRef = useRef(null)
  const usernameTwoRef = useRef(null)
  // identifies the newest search, so an older one that lands after it can
  // tell it has been superseded and drop its result
  const latestSearch = useRef(0)
  // what the in-flight search is asking for, so an impatient repeat of the
  // same thing can be dropped while a genuinely different one still runs
  const inFlightSearch = useRef(null)

  // data from form input
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')

  let [staticUsernameOne, setStaticUsernameOne] = useState('')
  let [staticUsernameTwo, setStaticUsernameTwo] = useState('')

  let [timePeriod, setTimePeriod] = useState('1month')

  // data from api
  let [usernameOneData, setUsernameOneData] = useState()
  let [usernameTwoData, setUsernameTwoData] = useState()

  // errors handleSubmit sets itself (empty fields, network failures). they
  // can't be derived from the fetched data, unlike "user not found", which
  // comes from useMatchComparison below.
  const [submitError, setSubmitError] = useState(null)
  const [submitInvalidField, setSubmitInvalidField] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  // handed to ErrorMessage as its key: two submits producing the same
  // message would otherwise leave the DOM untouched, and never re-announce
  const [submitCount, setSubmitCount] = useState(0)

  const {
    score: compatibilityScore,
    sharedArtists: matchingArtists,
    sharedTracks: matchingTracks,
    error: derivedError,
    invalidField: derivedInvalidField,
  } = useMatchComparison(
    usernameOneData,
    usernameTwoData,
    staticUsernameOne,
    staticUsernameTwo,
  )

  // a submit-time error (empty field, network failure) wins; otherwise use
  // what the fetched data says. while a search is in flight, hide the
  // previous error: once staticUsernameOne/Two update, derivedError would
  // briefly pair the *old* fetch's data with the *new* username text and
  // show a stale message before the new fetch resolves.
  const error = isLoading ? null : submitError || derivedError
  // 'one' | 'two' | 'both' | null -- drives aria-invalid/aria-describedby.
  // null means no specific field is at fault (e.g. a network failure)
  const invalidField = isLoading ? null : submitInvalidField || derivedInvalidField

  // what the live region announces across the whole flow. one always-mounted
  // region, not one per state: a region appearing together with its text is
  // announced unreliably (LoadingIndicator owned this once, and was silent).
  //
  // composed from the values, not read off the rendered results -- wrapping
  // the visible score would fire on every frame of its 2s count-up. empty on
  // error, which ErrorMessage's role="alert" already covers.
  let statusMessage = ''
  if (isLoading) {
    statusMessage = LOADING_ANNOUNCEMENT
  } else if (hasSubmitted && !error) {
    statusMessage = describeMatch(
      compatibilityScore,
      matchingArtists.map((artist) => artist.key),
      matchingTracks.map((track) => track.key),
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitInvalidField(null)
    setHasSubmitted(false)
    setSubmitCount((n) => n + 1)

    // trimmed everywhere from here on, not just for the empty check. Last.fm
    // tolerates surrounding spaces on lookup, so a stray one still finds the
    // user -- but it reaches the caption, and the profile link built from it
    // ("/user/++rj++") 404s.
    const trimmedOne = usernameOne.trim()
    const trimmedTwo = usernameTwo.trim()

    if (!trimmedOne && !trimmedTwo) {
      setSubmitError('Enter a username for both listeners.')
      setSubmitInvalidField('both')
      return
    }
    if (!trimmedOne) {
      setSubmitError('Enter a username for listener one.')
      setSubmitInvalidField('one')
      return
    }
    if (!trimmedTwo) {
      setSubmitError('Enter a username for listener two.')
      setSubmitInvalidField('two')
      return
    }

    // an impatient second press of Match, while the same search is already
    // running, would fire another four requests for the answer already on
    // its way. a *different* search still goes ahead and supersedes the
    // first, so changing your mind mid-search keeps working.
    //
    // not `disabled` on the button: disabling the element the user just
    // pressed drops focus to <body>, which is the same trap the "see more"
    // button had.
    const searchKey = JSON.stringify([trimmedOne, trimmedTwo, timePeriod])
    if (isLoading && inFlightSearch.current === searchKey) return
    inFlightSearch.current = searchKey

    setStaticUsernameOne(trimmedOne)
    setStaticUsernameTwo(trimmedTwo)
    setIsLoading(true)

    // submitting again before the first search returns leaves two in flight,
    // and the slower one lands last. without this the abandoned search's data
    // overwrote the newer results while the caption still named the newer
    // pair -- one pair's names above the other pair's artists. every write
    // below is skipped once a newer search has started.
    const searchId = ++latestSearch.current
    const superseded = () => searchId !== latestSearch.current

    try {
      const [
        usernameOneTopArtists,
        usernameTwoTopArtists,
        usernameOneTopTracks,
        usernameTwoTopTracks,
      ] = await Promise.all([
        getTopArtists(trimmedOne, timePeriod),
        getTopArtists(trimmedTwo, timePeriod),
        getTopTracks(trimmedOne, timePeriod),
        getTopTracks(trimmedTwo, timePeriod),
      ])

      if (superseded()) return

      setUsernameOneData({
        artists: usernameOneTopArtists,
        tracks: usernameOneTopTracks,
      })
      setUsernameTwoData({
        artists: usernameTwoTopArtists,
        tracks: usernameTwoTopTracks,
      })
    } catch (err) {
      if (superseded()) return
      // fetch itself throws TypeError for network-level failures (offline,
      // DNS, CORS); anything else (bad JSON, etc) is a more generic failure
      setSubmitError(
        err instanceof TypeError
          ? 'Could not reach Last.fm — check your connection and try again.'
          : 'Something went wrong. Please try again.',
      )
    } finally {
      // an abandoned search must not clear the loading state out from under
      // the one that replaced it
      if (!superseded()) {
        inFlightSearch.current = null
        setIsLoading(false)
        setHasSubmitted(true)
      }
    }
  }

  // after a failed submit, put the cursor in the field that needs fixing --
  // focus would otherwise sit on the button, leaving someone who can't see
  // the form knowing what to fix but not where.
  //
  // keyed on submitCount so it fires once per submit (including a repeat of
  // the same error) and never on an unrelated re-render. submitInvalidField
  // only: "user not found" lands seconds later, and taking focus then would
  // interrupt whatever the user moved on to.
  useEffect(() => {
    if (!submitInvalidField) return
    // 'both' -> the first field, as the first thing needing attention
    const target =
      submitInvalidField === 'two'
        ? usernameTwoRef.current
        : usernameOneRef.current
    target?.focus()
  }, [submitCount, submitInvalidField])

  // nudge the loading box into view as loading starts. scrollIntoView has no
  // concept of "and then a little more", so the distance is computed by
  // hand: how far below the fold the box's bottom edge sits, plus overshoot.
  useEffect(() => {
    if (isLoading) {
      const el = scoreRef.current
      if (!el) return

      const overflow = el.getBoundingClientRect().bottom - window.innerHeight
      // only scroll if the box actually needs it -- a tall viewport where
      // it's already fully visible shouldn't jump
      if (overflow > 0) {
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
        const OVERSHOOT = 30
        // an absolute target (not a relative scrollBy delta) so this stays
        // accurate even if it fires while another scroll is still animating
        window.scrollTo({
          top: window.scrollY + overflow + OVERSHOOT,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        })
      }
    }
  }, [isLoading])

  // once results land, scroll so the shared-artists section's top edge sits
  // at the bottom of the viewport: the results card fully visible, the next
  // section peeking in at the fold.
  //
  // the shared lists are in the deps so a resubmit that changes them without
  // changing hasSubmitted/isLoading/error still re-fires this.
  useEffect(() => {
    if (hasSubmitted && !isLoading && !error) {
      const el = sharedArtistsRef.current
      if (!el) return

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches

      const scrollToTop = () => {
        const distance = el.getBoundingClientRect().top - window.innerHeight
        // only scroll down to it -- don't yank the page backward if it's
        // already past this point
        if (distance > 0) {
          window.scrollTo({
            top: window.scrollY + distance,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          })
        }
      }

      if (prefersReducedMotion) {
        scrollToTop()
      } else {
        // .shared-list-panel has its own entrance animation (rise-in, a
        // translateY(12px) -> 0 transition) -- getBoundingClientRect
        // includes in-flight transforms, so measuring immediately would
        // catch it mid-animation and land short. wait for it to finish.
        el.addEventListener('animationend', scrollToTop, { once: true })
        return () => el.removeEventListener('animationend', scrollToTop)
      }
    }
  }, [hasSubmitted, isLoading, error, matchingArtists, matchingTracks])

  return (
    <>
      <header className='head'>
        {/* the period is part of the brand, but read aloud it lands as
            "last period fm match". aria-label supplies the spoken form; the
            visible text is unchanged. keep the two in sync if either moves */}
        <h1 aria-label='Last fm Match'>
          Last<span className='dot'>.</span>fm Match
        </h1>
        <p className='app-description'>
          Enter two{' '}
          <a href='https://www.last.fm' target='_blank' rel='noreferrer'>
            Last.fm
          </a>{' '}
          usernames to discover their music compatibility, plus the artists
          and tracks they have in common.
        </p>
      </header>
      <main className='content'>
        <div className='form'>
          <form className='form-content' onSubmit={handleSubmit}>
            <div className='field-row'>
              <div className='field'>
                <label className='field-label' htmlFor='username-one'>
                  Listener one
                </label>
                <div className='input-wrap'>
                  <span className='at' aria-hidden='true'>
                    @
                  </span>
                  <input
                    id='username-one'
                    ref={usernameOneRef}
                    type='text'
                    className='search-input'
                    value={usernameOne}
                    onChange={(e) => setUsernameOne(e.target.value)}
                    aria-required='true'
                    aria-invalid={
                      invalidField === 'one' || invalidField === 'both'
                    }
                    aria-describedby={
                      invalidField === 'one' || invalidField === 'both'
                        ? ERROR_ID
                        : undefined
                    }
                  />
                </div>
              </div>
              <span className='vs-x' aria-hidden='true'>
                ×
              </span>
              <div className='field'>
                <label className='field-label' htmlFor='username-two'>
                  Listener two
                </label>
                <div className='input-wrap'>
                  <span className='at' aria-hidden='true'>
                    @
                  </span>
                  <input
                    id='username-two'
                    ref={usernameTwoRef}
                    type='text'
                    className='search-input'
                    value={usernameTwo}
                    onChange={(e) => setUsernameTwo(e.target.value)}
                    aria-required='true'
                    aria-invalid={
                      invalidField === 'two' || invalidField === 'both'
                    }
                    aria-describedby={
                      invalidField === 'two' || invalidField === 'both'
                        ? ERROR_ID
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>
            <div className='form-foot'>
              <div className='date-field'>
                <label className='field-label' htmlFor='time-period'>
                  Date range
                </label>
                <div className='select'>
                  <select
                    id='time-period'
                    name='time-period'
                    defaultValue='1month'
                    onChange={(e) => setTimePeriod(e.target.value)}
                  >
                    <option value='7day'>1 Week</option>
                    <option value='1month'>1 Month</option>
                    <option value='3month'>3 Months</option>
                    <option value='6month'>6 Months</option>
                    <option value='12month'>1 Year</option>
                    <option value='overall'>All Time</option>
                  </select>
                </div>
              </div>
              <button type='submit'>
                Match
                <span className='arrow' aria-hidden='true'>
                  →
                </span>
              </button>
            </div>
          </form>
        </div>
        {/* points at whatever's about to appear below the form. bounces only
        while loading, then settles once something has landed */}
        {(isLoading || hasSubmitted) && (
          <DownArrow variant='to-results' animate={isLoading} />
        )}
        <ErrorMessage
          message={error}
          scrollRef={error ? scoreRef : null}
          id={ERROR_ID}
          announceKey={submitCount}
        />
        {/* the one status region for the whole flow -- nothing else here
        announces. rendered unconditionally with only its text swapping; see
        statusMessage above for why it can't mount alongside its content */}
        <p className='sr-only' role='status'>
          {statusMessage}
        </p>
        <MatchDescription
          score={compatibilityScore}
          matchingArtists={matchingArtists.map((artist) => artist.key)}
          matchingTracks={matchingTracks.map((track) => track.key)}
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
          staticUsernameOne={staticUsernameOne}
          staticUsernameTwo={staticUsernameTwo}
          scrollRef={error ? null : scoreRef}
        />
        {/* only when there's a shared-list panel below to point at. bounces
        3 times then settles (.down-arrow-wrap--to-secondary) */}
        {hasSubmitted &&
          !isLoading &&
          !error &&
          (matchingArtists.length > 0 || matchingTracks.length > 0) && (
            <DownArrow variant='to-secondary' animate />
          )}
        <MatchTable
          heading='shared artists'
          items={matchingArtists}
          dark
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
          staticUsernameOne={staticUsernameOne}
          staticUsernameTwo={staticUsernameTwo}
          scrollRef={sharedArtistsRef}
        />
        <MatchTable
          heading='shared tracks'
          items={matchingTracks}
          isTracks
          dark
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
          staticUsernameOne={staticUsernameOne}
          staticUsernameTwo={staticUsernameTwo}
        />
      </main>
      {/* only once full results have landed -- sits at the true bottom of
      the page, so scrolling down to it is what reveals it */}
      {hasSubmitted && !isLoading && !error && <Footer />}
    </>
  )
}

export default Home
