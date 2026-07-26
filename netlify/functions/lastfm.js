// Runs on Netlify, never in a browser. This is the only place the Last.fm
// API key exists: the browser calls this endpoint instead of Last.fm, so
// the key is never shipped in the bundle.
//
// LASTFM_API_KEY deliberately has no VITE_ prefix -- Vite only inlines
// variables that start with VITE_, so an unprefixed name can't reach the
// client build even by accident.
const API_KEY = process.env.LASTFM_API_KEY

// Only what the app actually calls. Without this the endpoint would be an
// open proxy to the whole Last.fm API for anyone who found the URL.
const ALLOWED_METHODS = new Set(['user.gettopartists', 'user.gettoptracks'])

const LIMIT = 500

// errors are shaped like Last.fm's own ({ message, error }) so they flow
// through describeUserError untouched. code 10 already maps to friendly
// copy about the API key; codes it doesn't know fall back to `message`.
const lastfmShapedError = (message, error, status) =>
  new Response(JSON.stringify({ message, error }), {
    status,
    headers: { 'content-type': 'application/json' },
  })

export default async (req) => {
  const params = new URL(req.url).searchParams
  const method = params.get('method')
  const user = params.get('user')
  const period = params.get('period')

  if (!API_KEY) {
    return lastfmShapedError('Server is missing its Last.fm API key.', 10, 500)
  }
  if (!ALLOWED_METHODS.has(method)) {
    return lastfmShapedError(`Unsupported method: ${method}`, 3, 400)
  }
  if (!user || !period) {
    return lastfmShapedError('Missing user or period.', 6, 400)
  }

  const url =
    `https://ws.audioscrobbler.com/2.0/?method=${method}` +
    `&user=${encodeURIComponent(user)}` +
    `&period=${encodeURIComponent(period)}` +
    `&api_key=${API_KEY}&format=json&limit=${LIMIT}`

  try {
    const res = await fetch(url)
    // status *and* body pass straight through. Last.fm answers "user not
    // found" with a 404 that still carries { message, error: 6 }, and the
    // app reads that body to name the bad username -- collapsing the
    // status or swallowing the body would turn a helpful message into a
    // generic failure.
    return new Response(await res.text(), {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    })
  } catch {
    return lastfmShapedError('Could not reach Last.fm. Try again.', 8, 502)
  }
}
