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
