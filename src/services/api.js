// The browser talks to our own function, never to Last.fm, so nothing here
// carries a credential (see netlify/functions/lastfm.js).
const ENDPOINT = '/.netlify/functions/lastfm'

const call = async (method, user, period) => {
  const params = new URLSearchParams({ method, user, period })
  const response = await fetch(`${ENDPOINT}?${params}`)

  // parsed regardless of status: a missing user is a 404 *with* a JSON
  // error body, and describeUserError reads the body, not the status
  return response.json()
}

export const getTopArtists = (user, time) => call('user.gettopartists', user, time)

export const getTopTracks = (user, time) => call('user.gettoptracks', user, time)
