// Runs on Netlify, never in a browser -- the only place the Last.fm API key
// exists. LASTFM_API_KEY has no VITE_ prefix on purpose: Vite inlines only
// VITE_* into the client build, so an unprefixed name can't reach it.
const API_KEY = process.env.LASTFM_API_KEY

// Only what the app actually calls. Without this the endpoint would be an
// open proxy to the whole Last.fm API for anyone who found the URL.
const ALLOWED_METHODS = new Set(['user.gettopartists', 'user.gettoptracks'])

const LIMIT = 500

// The API terms require caching "in accordance with the HTTP headers sent
// with web service responses", so Last.fm's own Cache-Control wins when it
// sends one. These are the fallbacks: charts move slowly, while an error
// should clear soon after whatever caused it is fixed.
const DEFAULT_CACHE = 'public, max-age=300'
const ERROR_CACHE = 'public, max-age=30'

// Netlify's CDN keys on the full URL, and method/user/period are all in the
// query string, so identical searches collapse onto one upstream request.
// That matters here because every request now reaches Last.fm from Netlify's
// IPs rather than each visitor's -- without this the site is one busy client.
const cacheHeaders = (upstreamCacheControl, ok) => {
  const value = upstreamCacheControl || (ok ? DEFAULT_CACHE : ERROR_CACHE)
  return {
    'content-type': 'application/json',
    'cache-control': value,
    'netlify-cdn-cache-control': value,
  }
}

// errors are shaped like Last.fm's own ({ message, error }) so they flow
// through describeUserError untouched. code 10 already maps to friendly
// copy about the API key; codes it doesn't know fall back to `message`.
const lastfmShapedError = (message, error, status) =>
  new Response(JSON.stringify({ message, error }), {
    status,
    // never cached: these describe the state of this request or this
    // deployment (a bad method, a missing key), not anything about Last.fm
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
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
    // status *and* body pass through untouched: "user not found" is a 404
    // that still carries { message, error: 6 }, and the app reads that body
    // to name the bad username. throwing on !ok would make it generic.
    return new Response(await res.text(), {
      status: res.status,
      headers: cacheHeaders(res.headers.get('cache-control'), res.ok),
    })
  } catch {
    return lastfmShapedError('Could not reach Last.fm. Try again.', 8, 502)
  }
}
