import { useState } from 'react'

const Home = () => {
  // data from form input
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')

  // data from api
  let [usernameOneData, setusernameOneData] = useState()
  let [usernameTwoData, setusernameTwoData] = useState()

  // component status data
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function handleSubmit(e) {
    e.preventDefault()

    // check if fields are empty
    if (!usernameOne.trim()) return
    if (!usernameTwo.trim()) return

    if (isLoading) return
    setIsLoading(true)
    try {

      // make api request with two usernames
      let usernameOneResults = await searchUsername(usernameOne)
      let usernameTwoResults = await searchUsername(usernameTwo)

      // save the results
      setusernameOneData(usernameOneResults)
      setusernameTwoData(usernameTwoResults)

      // compare the two data objects

      setError(null)
    } catch (err) {
      console.log(err)
      setError('request failed')
    } finally {
      setIsLoading(false)
    }
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
          <button type='submit'>Match</button>
        </form>
      </div>
    </div>
  )
}

export default Home
