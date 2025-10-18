import { useState } from 'react'
import { searchUsername } from '../services/api'

const Home = () => {
  // data from form input
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')
  let [timePeriod, setTimePeriod] = useState('1month')

  // data from api
  let [usernameOneData, setusernameOneData] = useState()
  let [usernameTwoData, setusernameTwoData] = useState()

  // component status data
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('hello')
    // console.log(timePeriod)

    // check if fields are empty
    // if (!usernameOne.trim()) return
    // if (!usernameTwo.trim()) return



    // if (isLoading) return
    // setIsLoading(true)
    try {
      console.log('hello')
      // make api request with two usernames
      let usernameOneResults = await searchUsername(usernameOne, timePeriod)
      let usernameTwoResults = await searchUsername(usernameTwo, timePeriod)

      // save the results
      setusernameOneData(usernameOneResults)
      setusernameTwoData(usernameTwoResults)

      // compare the two data objects
      compareUsers(usernameOneData, usernameTwoData)

      setError(null)
    } catch (err) {
      console.log(err)
      setError('request failed')
    } finally {
      setIsLoading(false)
    }
  }

  function compareUsers(userOne, userTwo) {
    console.log(userOne)
    console.log(userTwo)
  }

  return (
    <div>
      <div className='intro'>
        <h1>Last.fm Match</h1>
        <p>
          Find out how compatible your music taste is with another user. Enter
          your username and a friend's to see what artists and tracks you have
          in common.
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
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
          <select name='' id='' onChange={(e) => setTimePeriod(e.target.value)}>
            <option defaultValue value='7day'>1 Week</option>
            <option value='1month'>1 Month</option>
            <option value='3month'>3 Months</option>
            <option value='6month'>6 Months</option>
            <option value='12month'>1 Year</option>
            <option value='overall'>All Time</option>
          </select>
          <button type='submit'>Match</button>
        </form>
      </div>
    </div>
  )
}

export default Home
