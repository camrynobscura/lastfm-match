import { useMemo } from 'react'
import {
  musicCompatibility,
  toPlaycountMap,
  toTrackKey,
} from '../lib/compatibility'
import { combineUserErrors, describeUserError } from '../lib/lastfmErrors'

const EMPTY_RESULT = {
  score: 0,
  sharedArtists: [],
  sharedTracks: [],
  error: null,
  invalidField: null,
}

// derives the score, shared-item lists and any error state from the two
// users' fetched data. a useMemo rather than state synced by an effect:
// an effect only runs *after* the render the new data triggers, which left
// a one-paint flash where the shared lists lagged the score.
export function useMatchComparison(
  usernameOneData,
  usernameTwoData,
  usernameOne,
  usernameTwo,
) {
  return useMemo(() => {
    if (!usernameOneData || !usernameTwoData) return EMPTY_RESULT

    const errorOne = describeUserError(usernameOneData, usernameOne)
    const errorTwo = describeUserError(usernameTwoData, usernameTwo)

    if (errorOne || errorTwo) {
      const invalidField =
        errorOne && errorTwo ? 'both' : errorOne ? 'one' : 'two'
      const error = combineUserErrors(
        errorOne,
        errorTwo,
        usernameOne,
        usernameTwo,
      )
      return { ...EMPTY_RESULT, error, invalidField }
    }

    const artistsA = toPlaycountMap(
      usernameOneData.artists.topartists.artist,
      (a) => a.name,
    )
    const artistsB = toPlaycountMap(
      usernameTwoData.artists.topartists.artist,
      (a) => a.name,
    )
    const tracksA = toPlaycountMap(
      usernameOneData.tracks.toptracks.track,
      (t) => toTrackKey(t.artist.name, t.name),
    )
    const tracksB = toPlaycountMap(
      usernameTwoData.tracks.toptracks.track,
      (t) => toTrackKey(t.artist.name, t.name),
    )

    const result = musicCompatibility(artistsA, artistsB, tracksA, tracksB)
    return {
      score: result.score,
      sharedArtists: result.sharedArtists,
      sharedTracks: result.sharedTracks,
      error: null,
      invalidField: null,
    }
  }, [usernameOneData, usernameTwoData, usernameOne, usernameTwo])
}
