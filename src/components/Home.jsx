import { useEffect, useState } from 'react'
import { getTopArtists } from '../services/api'
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
      let usernameOneResults = await getTopArtists(usernameOne, timePeriod)
      let usernameTwoResults = await getTopArtists(usernameTwo, timePeriod)

      // save the results
      setusernameOneData(usernameOneResults)
      setusernameTwoData(usernameTwoResults)

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
      console.log(usernameOneData)
      console.log(usernameTwoData)
      if (usernameOneData.message || usernameTwoData.message) {
        if (usernameOneData.error) {
          setError(usernameOneData.message)
          console.log(usernameOneData.message)
        }
        if (usernameTwoData.error) {
          setError(usernameTwoData.message)
          console.log(usernameTwoData.message)
        }
      } else {
        console.log('data is loaded')

        let userOneArtists = usernameOneData.topartists.artist.map(
          (artist) => artist.name
        )
        let userTwoArtists = usernameTwoData.topartists.artist.map(
          (artist) => artist.name
        )

        let filteredArrays = userOneArtists.filter((artist) =>
          userTwoArtists.includes(artist)
        )

        console.log(filteredArrays)
        setMatchingArtists(filteredArrays)
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
