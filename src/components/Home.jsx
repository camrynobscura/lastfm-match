import { useEffect, useState } from 'react'
import { getTopArtists, getTopTracks } from '../services/api'
import MatchDescription from './MatchDescription'
import MatchTable from './MatchTable'

const Home = () => {
  // data from form input
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')

  let [staticUsernameOne, setStaticUsernameOne] = useState('')
  let [staticUsernameTwo, setStaticUsernameTwo] = useState('')

  let [timePeriod, setTimePeriod] = useState('7day')
  let [matchingArtists, setMatchingArtists] = useState([])
  let [matchingTracks, setMatchingTracks] = useState([])

  // data from api
  let [usernameOneData, setusernameOneData] = useState()
  let [usernameTwoData, setusernameTwoData] = useState()

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
      setusernameOneData({
        artists: usernameOneTopArtists,
        tracks: usernameOneTopTracks,
      })
      setusernameTwoData({
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
      console.log('un1')
      console.log(usernameOneData)
      console.log('un2')
      console.log(usernameTwoData.artists.message)
      if (usernameOneData.artists.message || usernameTwoData.artists.message) {
        if (usernameOneData.artists.error) {
          setError(usernameOneData.artists.message)
          console.log(usernameOneData.artists.message)
        }
        if (usernameTwoData.artists.error) {
          setError(usernameTwoData.artists.message)
          console.log(usernameTwoData.artists.message)
        }
      } else {
        console.log('data is loaded')
        console.log('usernameonedata', usernameOneData)

        // find matching artists
        let currentUserOneTopArtists =
          usernameOneData.artists.topartists.artist.map((artist) => artist.name)
        let currentUserTwoTopArtists =
          usernameTwoData.artists.topartists.artist.map((artist) => artist.name)

        let filteredArtists = currentUserOneTopArtists.filter((artist) =>
          currentUserTwoTopArtists.includes(artist)
        )

        // console.log(filteredArtists)
        setMatchingArtists(filteredArtists)

        // find matching tracks
        let currentUserOneTopTracks =
          usernameOneData.tracks.toptracks.track.map((track) => track.name)
        let currentUserTwoTopTracks =
          usernameTwoData.tracks.toptracks.track.map((track) => track.name)

        // find watch tracks appear on both lists
        let filteredTracks = currentUserOneTopTracks.filter((artist) =>
          currentUserTwoTopTracks.includes(artist)
        )

        // using filteredTracks, get the artists for those tracks
        // let tracksWithArtists = filteredTracks.tracks.toptracks.track.map(
        //   (track) => ({
        //     trackName: track.name,
        //     artist: track.artist.name,
        //   })
        // )
        // console.log(usernameOneData.tracks)

        let tracksWithArtists = []
        usernameOneData.tracks.toptracks.track.forEach((track) => {
          if (filteredTracks.includes(track.name)) {
            // console.log('hit')
            console.log(track.name)
            // console.log(track.artist.name)
            tracksWithArtists.push({trackName: track.name, trackArtists: track.artist.name})
          }

          // console.log(track)
        })
        // console.log('filtered tracks')
        console.log(tracksWithArtists)
        setMatchingTracks(tracksWithArtists)
      }
    }
  }, [usernameOneData, usernameTwoData])

  return (
    <div>
      <div className='head'>
        <h1>Last.fm Match</h1>
        <p className='app-description'>
          Find out how compatible your music taste is with another user. Enter
          your username and a friend's to see what artists and tracks you have
          in common.
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
