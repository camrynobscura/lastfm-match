import { parseTrackKey } from './compatibility'

// How many shared items the prose names before stopping. Exported so the
// visible description and the spoken summary truncate at the same point --
// they read the same sentences, and a mismatch would have a screen reader
// hear names that aren't on screen.
export const ARTIST_LIMIT = 5
export const TRACK_LIMIT = 3

// "no shared artists" / "1 shared artist" / "14 shared artists"
export const countPhrase = (count, noun) =>
  count === 0 ? `no ${noun}s` : `${count} ${noun}${count === 1 ? '' : 's'}`

// The punctuation that goes *before* item i of n in a written list:
// "A." / "A and B." / "A, B, and C."
//
// shared with the visible prose components, which build the same list out
// of styled spans and so can't use the joined string below. deriving both
// from one rule is what keeps the spoken and visible copy identical.
export const listJoiner = (index, total) => {
  if (index === 0) return ''
  if (index === total - 1) return total > 2 ? ', and ' : ' and '
  return ', '
}

const sentenceList = (items) =>
  items.map((item, i) => `${listJoiner(i, items.length)}${item}`).join('')

// tracks are keyed "Artist :: Track"; spoken the way the visible copy reads
const trackPhrase = (key) => {
  const { artist, track } = parseTrackKey(key)
  return `${track} by ${artist}`
}

// The single sentence the status region speaks once results land.
//
// Built from the values rather than read off the page: ScoreDisplay counts
// its number up over 2s, so a live region wrapping the rendered result would
// fire on every frame of that.
export function describeMatch(score, artistKeys, trackKeys) {
  const parts = [
    `${Math.round(score)}% compatible.`,
    `${countPhrase(artistKeys.length, 'shared artist')}, ` +
      `${countPhrase(trackKeys.length, 'shared track')}.`,
  ]

  if (artistKeys.length > 0) {
    const named = artistKeys.slice(0, ARTIST_LIMIT)
    parts.push(`You both love artists like ${sentenceList(named)}.`)
  }
  if (trackKeys.length > 0) {
    const named = trackKeys.slice(0, TRACK_LIMIT).map(trackPhrase)
    parts.push(`You both love tracks like ${sentenceList(named)}.`)
  }

  return parts.join(' ')
}
