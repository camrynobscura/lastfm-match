// converts a list of Last.fm items (artists or tracks) into a
// { key: playcount } map -- keyFn decides the key (artist name, or
// "Artist :: Track" for tracks)
export function toPlaycountMap(items, keyFn) {
  return items.reduce((acc, item) => {
    acc[keyFn(item)] = Number(item.playcount)
    return acc
  }, {})
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
