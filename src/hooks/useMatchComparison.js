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

// derives the compatibility score, shared-item lists, and any "user not
// found"/api-error state from the two users' fetched data. a pure
// function of its inputs, so it's a useMemo rather than state kept in
// sync via a useEffect -- the previous version had a one-paint flash
// where the shared lists lagged a render behind the data actually
// landing, since the effect that computed them only ran *after* the
// render triggered by the submit handler's setUsernameOneData/
// setUsernameTwoData calls.
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
