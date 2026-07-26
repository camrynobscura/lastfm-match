// The browser talks to our own Netlify function, never to Last.fm. The
// API key lives server-side (see netlify/functions/lastfm.js), so nothing
// here carries a credential and none ends up in the bundle.
//
// Locally this needs `netlify dev` rather than `npm run dev` -- Vite alone
// doesn't serve functions, so this path would 404.
const ENDPOINT = '/.netlify/functions/lastfm'

const call = async (method, user, period) => {
  const params = new URLSearchParams({ method, user, period })
  const response = await fetch(`${ENDPOINT}?${params}`)

  // parsed regardless of status, same as when this called Last.fm
  // directly: a missing user comes back as 404 *with* a JSON error body,
  // and describeUserError reads that body rather than the status
  return response.json()
}

export const getTopArtists = (user, time) => call('user.gettopartists', user, time)

export const getTopTracks = (user, time) => call('user.gettoptracks', user, time)
