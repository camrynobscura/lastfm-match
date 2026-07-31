// converts a list of Last.fm items (artists or tracks) into a
// { key: playcount } map -- keyFn decides the key (artist name, or
// "Artist :: Track" for tracks)
//
// a bare object is treated as a single item, not zero: Last.fm's JSON API
// has a documented quirk on some endpoints where a one-result list comes
// back as `{ ...one item }` instead of `[{ ...one item }]`. Live-tested
// against user.gettopartists/gettoptracks specifically and it didn't
// reproduce there (forcing a single-result page still came back as a real
// one-element array) -- this is cheap insurance against that changing, not
// a fix for an observed failure. anything else that isn't an array or an
// object (missing entirely, e.g. a response shaped `{ topartists: {} }`)
// is treated as no items: this runs inside a useMemo during render, and
// throwing here would blank the whole page instead of showing the
// "nothing in common" copy an empty list already produces.
export function toPlaycountMap(items, keyFn) {
  const list = Array.isArray(items)
    ? items
    : items && typeof items === 'object'
      ? [items]
      : []

  return list.reduce((acc, item) => {
    acc[keyFn(item)] = Number(item.playcount)
    return acc
  }, {})
}

// the single source of truth for how a shared track's key is built and
// taken apart -- keeps that in one place instead of every consumer
// re-parsing the "Artist :: Track" string its own way
const TRACK_KEY_SEPARATOR = ' :: '

export function toTrackKey(artistName, trackName) {
  return `${artistName}${TRACK_KEY_SEPARATOR}${trackName}`
}

// note the separator is matched on its first occurrence, so an artist whose
// own name contains " :: " would take the split point with it. no real
// handling for that -- it needs the literal sequence in a name, and any
// escaping scheme would cost more than the case is worth.
export function parseTrackKey(key) {
  const i = key.indexOf(TRACK_KEY_SEPARATOR)
  // without this, a key that isn't a track key slices into nonsense --
  // indexOf returns -1, and "Creep" comes back as { artist: "Cree",
  // track: "ep" } rather than failing in any visible way
  if (i === -1) return { artist: '', track: key }

  return {
    artist: key.slice(0, i),
    track: key.slice(i + TRACK_KEY_SEPARATOR.length),
  }
}

// a and b are { key: playcount } maps for the same kind of item (both
// artists, or both tracks). returns a "boost" score: for every shared
// item, the smaller of the two people's share of their own total
// listening to it. not Jaccard, so one person having a much bigger
// library doesn't drag the score down just for that.
export function getScore(a, b) {
  const setA = new Set(Object.keys(a))
  const setB = new Set(Object.keys(b))
  const shared = [...setA].filter((k) => setB.has(k))

  const totalA = Object.values(a).reduce((s, v) => s + v, 0)
  const totalB = Object.values(b).reduce((s, v) => s + v, 0)

  let boost = 0
  for (const item of shared) {
    boost += Math.min(a[item] / totalA, b[item] / totalB)
  }

  return boost
}

// the shared items between a and b, ranked by combined share of each
// person's listening (not raw playcount), so one heavy listener's raw
// counts can't dominate the order
export function getShared(a, b) {
  const setB = new Set(Object.keys(b))
  const totalA = Object.values(a).reduce((s, v) => s + v, 0)
  const totalB = Object.values(b).reduce((s, v) => s + v, 0)
  return Object.keys(a)
    .filter((k) => setB.has(k))
    .map((k) => ({ key: k, playcountOne: a[k], playcountTwo: b[k] }))
    .sort(
      (x, y) =>
        y.playcountOne / totalA +
        y.playcountTwo / totalB -
        (x.playcountOne / totalA + x.playcountTwo / totalB),
    )
}

// artistsA/artistsB/tracksA/tracksB are { key: playcount } maps (see
// toPlaycountMap). combines an artist score (60%) and a track score
// (40%) -- artists weighted more heavily since track overlap is rarer --
// then stretches the result into a friendlier 0-100 range.
export function musicCompatibility(artistsA, artistsB, tracksA, tracksB) {
  const artistScore = getScore(artistsA, artistsB)
  const trackScore = getScore(tracksA, tracksB)

  const combined = artistScore * 0.6 + trackScore * 0.4

  return {
    // fourth root stretches low raw overlap scores into a friendlier
    // 0-100 range
    score: Math.round(Math.pow(combined, 1 / 4) * 100),
    sharedArtists: getShared(artistsA, artistsB),
    sharedTracks: getShared(tracksA, tracksB),
  }
}
