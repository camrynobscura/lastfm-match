import { useEffect, useRef, useState } from 'react'
import { getTopArtists, getTopTracks } from '../services/api'
import DownArrow from './DownArrow'
import ErrorMessage from './ErrorMessage'
import MatchDescription from './MatchDescription'
import MatchTable from './MatchTable'
const exampleUsernameOne = import.meta.env.VITE_USERNAME_ONE
const exampleUsernameTwo = import.meta.env.VITE_USERNAME_TWO

// only one ErrorMessage is ever rendered, so a static id is fine -- lets
// the invalid username field(s) point at it via aria-describedby
const ERROR_ID = 'match-error'

// Last.fm error codes we want friendlier copy for; any other code falls
// back to Last.fm's own message text
const LASTFM_ERROR_MESSAGES = {
  10: "There's a problem with this app's Last.fm API key.",
  11: "Last.fm's service is temporarily offline. Try again in a bit.",
  16: 'Last.fm had a temporary hiccup processing that. Try again.',
  29: 'Last.fm is rate-limiting requests right now. Wait a moment and try again.',
}

// data is one user's {artists, tracks} api results -- returns a friendly
// error naming that user, or null if neither call errored
function describeUserError(data, username) {
  const failed = data.artists.error
    ? data.artists
    : data.tracks.error
      ? data.tracks
      : null
  if (!failed) return null
  if (failed.error === 6) {
    return { code: 6, text: `"${username}" wasn't found on Last.fm.` }
  }
  return {
    code: failed.error,
    text: LASTFM_ERROR_MESSAGES[failed.error] || failed.message,
  }
}

const Home = () => {
  // the score/description section -- what we scroll into view once
  // loading starts
  const scoreRef = useRef(null)
  // the shared-artists panel -- scrolled to (once results land) so its
  // top edge sits at the bottom of the viewport
  const sharedArtistsRef = useRef(null)

  // data from form input
  let [usernameOne, setUsernameOne] = useState(exampleUsernameOne)
  let [usernameTwo, setUsernameTwo] = useState(exampleUsernameTwo)

  let [staticUsernameOne, setStaticUsernameOne] = useState('')
  let [staticUsernameTwo, setStaticUsernameTwo] = useState('')

  let [timePeriod, setTimePeriod] = useState('1month')
  let [matchingArtists, setMatchingArtists] = useState([])
  let [matchingTracks, setMatchingTracks] = useState([])
  let [compatibilityScore, setCompatibilityScore] = useState(0)

  // data from api
  let [usernameOneData, setUsernameOneData] = useState()
  let [usernameTwoData, setUsernameTwoData] = useState()

  // component status data
  const [error, setError] = useState(null)
  // which username field(s) the current error is about ('one' | 'two' |
  // 'both' | null) -- drives aria-invalid/aria-describedby on the inputs.
  // null means the error isn't about a specific field (e.g. a network
  // failure), so neither input gets marked invalid.
  const [invalidField, setInvalidField] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInvalidField(null)
    setHasSubmitted(false)
    setCompatibilityScore(0)
    setMatchingArtists([])
    setMatchingTracks([])

    const trimmedOne = usernameOne.trim()
    const trimmedTwo = usernameTwo.trim()

    if (!trimmedOne && !trimmedTwo) {
      setError('Enter a username for both listeners.')
      setInvalidField('both')
      return
    }
    if (!trimmedOne) {
      setError('Enter a username for listener one.')
      setInvalidField('one')
      return
    }
    if (!trimmedTwo) {
      setError('Enter a username for listener two.')
      setInvalidField('two')
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
      setError(
        err instanceof TypeError
          ? 'Could not reach Last.fm — check your connection and try again.'
          : 'Something went wrong. Please try again.',
      )
    } finally {
      setIsLoading(false)
      setHasSubmitted(true)
    }
  }

  useEffect(() => {
    if (usernameOneData && usernameTwoData) {
      const errorOne = describeUserError(usernameOneData, staticUsernameOne)
      const errorTwo = describeUserError(usernameTwoData, staticUsernameTwo)

      if (errorOne || errorTwo) {
        setInvalidField(errorOne && errorTwo ? 'both' : errorOne ? 'one' : 'two')
        if (errorOne?.code === 6 && errorTwo?.code === 6) {
          setError(
            `Neither "${staticUsernameOne}" nor "${staticUsernameTwo}" were found on Last.fm.`,
          )
        } else {
          setError(
            [errorOne, errorTwo]
              .filter(Boolean)
              .map((e) => e.text)
              .join(' '),
          )
        }
      } else {
        // find matching artists
        let currentUserOneTopArtists =
          usernameOneData.artists.topartists.artist.reduce((acc, obj) => {
            acc[obj.name] = Number(obj.playcount)
            return acc
          }, {})

        let currentUserTwoTopArtists =
          usernameTwoData.artists.topartists.artist.reduce((acc, obj) => {
            acc[obj.name] = Number(obj.playcount)
            return acc
          }, {})

        let currentUserOneTopTracks =
          usernameOneData.tracks.toptracks.track.reduce((acc, obj) => {
            acc[obj.artist.name + ' :: ' + obj.name] = Number(obj.playcount)
            return acc
          }, {})

        let currentUserTwoTopTracks =
          usernameTwoData.tracks.toptracks.track.reduce((acc, obj) => {
            acc[obj.artist.name + ' :: ' + obj.name] = Number(obj.playcount)
            return acc
          }, {})

        function musicCompatibility(artists_a, artists_b, tracks_a, tracks_b) {
          const artistScore = getScore(artists_a, artists_b)
          const trackScore = getScore(tracks_a, tracks_b)

          const combined = artistScore * 0.6 + trackScore * 0.4
          // artists weighted more heavily because track overlap is rarer

          return {
            // fourth root stretches low raw overlap scores into a friendlier 0-100 range
            score: Math.round(Math.pow(combined, 1 / 4) * 100),
            sharedArtists: getShared(artists_a, artists_b),
            sharedTracks: getShared(tracks_a, tracks_b),
          }
        }

        function getScore(a, b) {
          const setA = new Set(Object.keys(a))
          const setB = new Set(Object.keys(b))
          const shared = [...setA].filter((k) => setB.has(k))

          const totalA = Object.values(a).reduce((s, v) => s + v, 0)
          const totalB = Object.values(b).reduce((s, v) => s + v, 0)

          let boost = 0
          for (const item of shared) {
            boost += Math.min(a[item] / totalA, b[item] / totalB)
          }

          return boost
          // just using boost, no jaccard, so scores aren't dragged down
        }

        function getShared(a, b) {
          const setB = new Set(Object.keys(b))
          const totalA = Object.values(a).reduce((s, v) => s + v, 0)
          const totalB = Object.values(b).reduce((s, v) => s + v, 0)
          return Object.keys(a)
            .filter((k) => setB.has(k))
            .map((k) => ({ key: k, playcountOne: a[k], playcountTwo: b[k] }))
            .sort(
              (x, y) =>
                y.playcountOne / totalA +
                y.playcountTwo / totalB -
                (x.playcountOne / totalA + x.playcountTwo / totalB),
            )
          // ranked by combined share of each person's listening, so one
          // heavy listener's raw counts can't dominate the order
        }

        const result = musicCompatibility(
          currentUserOneTopArtists,
          currentUserTwoTopArtists,
          currentUserOneTopTracks,
          currentUserTwoTopTracks,
        )
        setMatchingTracks(result.sharedTracks)
        setMatchingArtists(result.sharedArtists)
        setCompatibilityScore(result.score)
      }
    }
  }, [usernameOneData, usernameTwoData, staticUsernameOne, staticUsernameTwo])

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
  // matchingArtists is in the deps because it lands in a separate render
  // from hasSubmitted/isLoading (a different effect sets it once the api
  // data is processed) -- this re-fires once that catches up and the
  // shared-artists panel actually exists to scroll to.
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
          Enter your last.fm username and a friend's to find your music
          compatibility rating and see what artists and tracks you have in
          common!
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
                    type='text'
                    placeholder='Username 1'
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
                    type='text'
                    placeholder='Username 2'
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
        />
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
        -- never animated */}
        {hasSubmitted &&
          !isLoading &&
          !error &&
          (matchingArtists.length > 0 || matchingTracks.length > 0) && (
            <DownArrow variant='to-secondary' />
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
    </>
  )
}

export default Home
