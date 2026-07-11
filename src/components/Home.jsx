import { useEffect, useState } from 'react'
import { getTopArtists, getTopTracks } from '../services/api'
import MatchDescription from './MatchDescription'
import MatchTable from './MatchTable'
const exampleUsernameOne = import.meta.env.VITE_USERNAME_ONE
const exampleUsernameTwo = import.meta.env.VITE_USERNAME_TWO

const Home = () => {
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
  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStaticUsernameOne(usernameOne)
    setStaticUsernameTwo(usernameTwo)
    setError(null)
    setHasSubmitted(false)
    setCompatibilityScore(0)
    // check if fields are empty
    if (!usernameOne.trim()) return
    if (!usernameTwo.trim()) return

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

      // let comparisonData = await compareUsers()

      setError(null)
    } catch (err) {
      console.log(err)
      setError('request failed')
    } finally {
      setIsLoading(false)
      setHasSubmitted(true)
    }

    // compare the two data objects
    // compareUsers()
  }

  useEffect(() => {
    if (usernameOneData && usernameTwoData) {
      // console.log('un1')
      // console.log(usernameOneData)
      // console.log('un2')
      // console.log(usernameTwoData.artists.message)
      if (usernameOneData.artists.message || usernameTwoData.artists.message) {
        if (usernameOneData.artists.error) {
          setError(usernameOneData.artists.message)
          // console.log(usernameOneData.artists.message)
        }
        if (usernameTwoData.artists.error) {
          setError(usernameTwoData.artists.message)
          // console.log(usernameTwoData.artists.message)
        }
      } else {
        console.log('data is loaded')
        console.log('usernameonedata', usernameOneData)
        console.log('usernametwodata', usernameTwoData)

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
          return Object.keys(a).filter((k) => setB.has(k))
        }

        const result = musicCompatibility(
          currentUserOneTopArtists,
          currentUserTwoTopArtists,
          currentUserOneTopTracks,
          currentUserTwoTopTracks,
        )
        console.log('SCORE____________', result.score) // combined %
        console.log(result.sharedArtists) // ['Radiohead', 'Lorde']
        console.log(result.sharedTracks) // ['Creep', 'Karma Police']
        console.log(result)

        /////////////

        setMatchingTracks(result.sharedTracks)
        setMatchingArtists(result.sharedArtists)
        setCompatibilityScore(result.score)
      }
    }
  }, [usernameOneData, usernameTwoData])

  return (
    <div>
      <div className='head'>
        <h1>Last.fm Match</h1>
        <p className='app-description'>
          Enter your last.fm username and a friend's to find your music
          compatability rating and see what artists and tracks you have in
          common!
        </p>
      </div>
      <div className='content'>
        <div>
          <div className='form'>
            <form className='form-content' onSubmit={handleSubmit}>
              <input
                // name='username '
                type='text'
                placeholder='Username 1'
                className='search-input'
                value={usernameOne}
                onChange={(e) => setUsernameOne(e.target.value)}
              />
              <input
                type='text'
                placeholder='Username 2'
                className='search-input'
                value={usernameTwo}
                onChange={(e) => setUsernameTwo(e.target.value)}
              />
              <div className='select'>
                <select
                  defaultValue='1month'
                  name=''
                  id=''
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <option value='7day'>1 Week</option>
                  <option value='1month'>1 Month</option>
                  <option value='3month'>3 Months</option>
                  <option value='6month'>6 Months</option>
                  <option value='12month'>1 Year</option>
                  <option value='overall'>All Time</option>
                </select>
                <span class='focus'></span>
              </div>
              <button type='submit'>Match</button>
            </form>
          </div>
        </div>
        <MatchDescription
          score={compatibilityScore}
          matchingArtists={matchingArtists}
          matchingTracks={matchingTracks}
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
          staticUsernameOne={staticUsernameOne}
          staticUsernameTwo={staticUsernameTwo}
        />
        <MatchTable
          matchingArtists={matchingArtists}
          isLoading={isLoading}
          hasSubmitted={hasSubmitted}
          error={error}
        />
      </div>
    </div>
  )
}

export default Home
