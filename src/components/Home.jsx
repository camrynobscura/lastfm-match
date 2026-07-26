import { useEffect, useRef, useState } from 'react'
import { getTopArtists, getTopTracks } from '../services/api'
import { useMatchComparison } from '../hooks/useMatchComparison'
import DownArrow from './DownArrow'
import ErrorMessage from './ErrorMessage'
import Footer from './Footer'
import MatchDescription from './MatchDescription'
import MatchTable from './MatchTable'

// only one ErrorMessage is ever rendered, so a static id is fine -- lets
// the invalid username field(s) point at it via aria-describedby
const ERROR_ID = 'match-error'

// "no shared artists" / "1 shared artist" / "14 shared artists"
const countPhrase = (count, noun) =>
  count === 0 ? `no ${noun}s` : `${count} ${noun}${count === 1 ? '' : 's'}`

// deliberately shorter than the loading box's visible copy ("finding your
// compatibility score..."). role="status" is polite, so it waits for a gap
// and then reads to the end -- a long sentence still being spoken when the
// results arrive pushes the summary, the message that actually matters, to
// the back of the queue. searches often finish inside that sentence.
const LOADING_ANNOUNCEMENT = 'Loading'

const Home = () => {
  // the score/description section -- what we scroll into view once
  // loading starts
  const scoreRef = useRef(null)
  // the shared-artists panel -- scrolled to (once results land) so its
  // top edge sits at the bottom of the viewport
  const sharedArtistsRef = useRef(null)
  // the two username inputs -- focused after a failed submit so the field
  // that needs fixing is where the cursor lands
  const usernameOneRef = useRef(null)
  const usernameTwoRef = useRef(null)

  // data from form input
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')

  let [staticUsernameOne, setStaticUsernameOne] = useState('')
  let [staticUsernameTwo, setStaticUsernameTwo] = useState('')

  let [timePeriod, setTimePeriod] = useState('1month')

  // data from api
  let [usernameOneData, setUsernameOneData] = useState()
  let [usernameTwoData, setUsernameTwoData] = useState()

  // errors set directly by handleSubmit (empty fields, network/generic
  // failures) -- not derivable from usernameOneData/usernameTwoData, so
  // these stay as real state. "user not found" errors, by contrast, are
  // derived from the fetched data and come from useMatchComparison below.
  const [submitError, setSubmitError] = useState(null)
  const [submitInvalidField, setSubmitInvalidField] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  // bumped on every submit, and handed to ErrorMessage as its key. two
  // submits that produce the same error message would otherwise leave the
  // DOM untouched, so the error box never re-announces (see ErrorMessage)
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

  // a submit-time error (empty field, network failure) takes precedence;
  // otherwise fall back to whatever the fetched data itself says. while a
  // new search is in flight, hide any previous error immediately -- once
  // staticUsernameOne/Two update to the new username, derivedError would
  // otherwise briefly recombine the *previous* fetch's stale
  // usernameOneData/usernameTwoData with the *new* username text, showing
  // a stale error message before the new fetch has even resolved.
  const error = isLoading ? null : submitError || derivedError
  // which username field(s) the current error is about ('one' | 'two' |
  // 'both' | null) -- drives aria-invalid/aria-describedby on the inputs.
  // null means the error isn't about a specific field (e.g. a network
  // failure), so neither input gets marked invalid.
  const invalidField = isLoading ? null : submitInvalidField || derivedInvalidField

  // what the live region below announces, across the whole flow: the
  // waiting state first, then the outcome. one always-mounted region rather
  // than one per state -- a region that appears together with its text is
  // announced unreliably (LoadingIndicator used to own this and was silent
  // in VoiceOver). the announced wording is its own thing, not the
  // indicator's visible copy -- see LOADING_ANNOUNCEMENT above.
  //
  // the summary is composed from the score/list values rather than read off
  // the rendered results: ScoreDisplay animates its number from 0 up to the
  // final score over 2s, so a region wrapping the visible score would fire
  // on every one of those ~120 frames. counts match the visible "shared
  // artists (N)" headings. stays empty on error -- ErrorMessage's
  // role="alert" announces that case.
  let statusMessage = ''
  if (isLoading) {
    statusMessage = LOADING_ANNOUNCEMENT
  } else if (hasSubmitted && !error) {
    statusMessage =
      `${Math.round(compatibilityScore)}% compatible. ` +
      `${countPhrase(matchingArtists.length, 'shared artist')}, ` +
      `${countPhrase(matchingTracks.length, 'shared track')}.`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitInvalidField(null)
    setHasSubmitted(false)
    setSubmitCount((n) => n + 1)

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

    setStaticUsernameOne(usernameOne)
    setStaticUsernameTwo(usernameTwo)
    setIsLoading(true)

    try {
      // make api request with two usernames
      let usernameOneTopArtists = await getTopArtists(usernameOne, timePeriod)
      let usernameTwoTopArtists = await getTopArtists(usernameTwo, timePeriod)

      let usernameOneTopTracks = await getTopTracks(usernameOne, timePeriod)
      let usernameTwoTopTracks = await getTopTracks(usernameTwo, timePeriod)

      // save the results
      setUsernameOneData({
        artists: usernameOneTopArtists,
        tracks: usernameOneTopTracks,
      })
      setUsernameTwoData({
        artists: usernameTwoTopArtists,
        tracks: usernameTwoTopTracks,
      })
    } catch (err) {
      // fetch itself throws TypeError for network-level failures (offline,
      // DNS, CORS); anything else (bad JSON, etc) is a more generic failure
      setSubmitError(
        err instanceof TypeError
          ? 'Could not reach Last.fm — check your connection and try again.'
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsLoading(false)
      setHasSubmitted(true)
    }
  }

  // after a failed submit, put the cursor in the field that needs fixing.
  // the error text says what's wrong, but focus would otherwise stay on the
  // Match button -- so someone who can't see the form knows what to fix
  // without knowing where it is. landing on the input reads out its label
  // and invalid state, which confirms the target.
  //
  // keyed on submitCount so it fires exactly once per submit (including a
  // repeat of the same error) and never on an unrelated re-render, which
  // would yank focus out of whatever field was being typed in.
  //
  // submitInvalidField only, never the derived one: "user not found" lands
  // seconds later, once the fetch resolves, and grabbing focus at that
  // point would interrupt whatever the user had moved on to.
  useEffect(() => {
    if (!submitInvalidField) return
    // 'both' -> the first field, as the first thing needing attention
    const target =
      submitInvalidField === 'two'
        ? usernameTwoRef.current
        : usernameOneRef.current
    target?.focus()
  }, [submitCount, submitInvalidField])

  // nudge the loading box into view the moment loading starts, so the
  // equalizer bars are visible right away. goes a bit past just bringing
  // the box's bottom edge flush with the viewport -- scrollIntoView has no
  // concept of "and then a little more," so this computes the scroll
  // distance by hand instead: how far below the fold the box's bottom
  // edge currently sits, plus a fixed overshoot.
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

  // once results land, scroll further down so the shared-artists section's
  // top edge sits right at the bottom of the viewport -- the results card
  // is fully visible, with the next section peeking in right at the fold.
  //
  // matchingArtists/matchingTracks are in the deps so this re-fires if a
  // resubmit changes the shared lists without changing hasSubmitted/
  // isLoading/error (e.g. two searches in a row that both succeed).
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
        <h1>
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
        {/* points at whatever's about to appear below the form -- the
        loading bars, then the results (or the error box) in its place.
        only bounces while loading; settles once something's landed */}
        {(isLoading || hasSubmitted) && (
          <DownArrow variant='to-results' animate={isLoading} />
        )}
        <ErrorMessage
          message={error}
          scrollRef={error ? scoreRef : null}
          id={ERROR_ID}
          announceKey={submitCount}
        />
        {/* the one status region for the whole flow -- neither the loading
        box nor the results announce anything on their own.

        rendered unconditionally, with only its text swapping: a live
        region inserted into the DOM at the same moment as its content is
        announced unreliably across screen reader/browser pairs. role
        ="status" is aria-live="polite" + aria-atomic, so it waits its turn
        and reads the whole sentence rather than just the changed part */}
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
        {/* only when there's actually a shared-list panel below to point at
        -- bounces 3 times (see .down-arrow-wrap--to-secondary in
        index.scss) then settles, rather than animating forever */}
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
