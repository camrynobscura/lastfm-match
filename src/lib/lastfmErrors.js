// Last.fm error codes we want friendlier copy for; any other code falls
// back to Last.fm's own message text
const LASTFM_ERROR_MESSAGES = {
  10: "There's a problem with this app's Last.fm API key.",
  11: "Last.fm's service is temporarily offline. Try again in a bit.",
  16: 'Last.fm had a temporary hiccup processing that. Try again.',
  29: 'Last.fm is rate-limiting requests right now. Wait a moment and try again.',
}

// data is one user's {artists, tracks} api results -- returns a friendly
// error naming that user, or null if neither call errored
export function describeUserError(data, username) {
  const failed = data.artists.error
    ? data.artists
    : data.tracks.error
      ? data.tracks
      : null
  if (!failed) return null
  if (failed.error === 6) {
    return { code: 6, text: `"${username}" wasn't found on Last.fm.` }
  }
  return {
    code: failed.error,
    text: LASTFM_ERROR_MESSAGES[failed.error] || failed.message,
  }
}

// combines both listeners' errors into the one line the error box shows.
//
// the dedupe matters more than it looks: a fault that isn't about either
// username -- a suspended or invalid key, a rate limit, Last.fm being down
// -- fails both requests with the same code, so joining the two texts
// blindly printed the same sentence twice.
export function combineUserErrors(errorOne, errorTwo, usernameOne, usernameTwo) {
  if (!errorOne && !errorTwo) return null

  // both names bad: one sentence naming both reads better than two
  if (errorOne?.code === 6 && errorTwo?.code === 6) {
    return `Neither "${usernameOne}" nor "${usernameTwo}" were found on Last.fm.`
  }

  const texts = [errorOne, errorTwo].filter(Boolean).map((e) => e.text)
  return [...new Set(texts)].join(' ')
}
