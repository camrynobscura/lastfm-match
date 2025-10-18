import { useState, useContext } from 'react'

const Home = () => {
  let [usernameOne, setUsernameOne] = useState('')
  let [usernameTwo, setUsernameTwo] = useState('')


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
        <form>
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
