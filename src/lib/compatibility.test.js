import { describe, it, expect } from 'vitest'
import {
  toPlaycountMap,
  getScore,
  getShared,
  musicCompatibility,
  toTrackKey,
  parseTrackKey,
} from './compatibility'

describe('toTrackKey / parseTrackKey', () => {
  it('round-trips an artist and track name', () => {
    const key = toTrackKey('Charli XCX', 'Von dutch')
    expect(key).toBe('Charli XCX :: Von dutch')
    expect(parseTrackKey(key)).toEqual({
      artist: 'Charli XCX',
      track: 'Von dutch',
    })
  })

  it('only splits on the first separator, in case a name contains " :: "', () => {
    const key = toTrackKey('Artist', 'Track :: With Colons')
    expect(parseTrackKey(key)).toEqual({
      artist: 'Artist',
      track: 'Track :: With Colons',
    })
  })
})

describe('toPlaycountMap', () => {
  it('keys items by keyFn and coerces playcount to a number', () => {
    const items = [
      { name: 'Charli XCX', playcount: '42' },
      { name: 'Chappell Roan', playcount: '7' },
    ]
    expect(toPlaycountMap(items, (a) => a.name)).toEqual({
      'Charli XCX': 42,
      'Chappell Roan': 7,
    })
  })

  it('supports composite keys (artist + track)', () => {
    const items = [
      { artist: { name: 'Charli XCX' }, name: 'Von dutch', playcount: '5' },
    ]
    expect(
      toPlaycountMap(items, (t) => `${t.artist.name} :: ${t.name}`),
    ).toEqual({ 'Charli XCX :: Von dutch': 5 })
  })
})

describe('getScore', () => {
  it('returns 0 when there is no overlap', () => {
    expect(getScore({ a: 10 }, { b: 10 })).toBe(0)
  })

  it('returns 1 when listening is identical and fully shared', () => {
    expect(getScore({ x: 10 }, { x: 10 })).toBe(1)
  })

  it('uses the smaller share, so a heavier listener does not inflate the score', () => {
    // A: x is 1/10 of their listening. B: x is 100/100 (all) of theirs.
    const a = { x: 1, y: 9 }
    const b = { x: 100 }
    expect(getScore(a, b)).toBeCloseTo(0.1)
  })

  it('sums the boost across every shared item', () => {
    const a = { x: 5, y: 5 } // 50/50 split, total 10
    const b = { x: 5, y: 5, z: 10 } // total 20
    // x: min(5/10, 5/20) = 0.25, y: min(5/10, 5/20) = 0.25
    expect(getScore(a, b)).toBeCloseTo(0.5)
  })
})

describe('getShared', () => {
  it('only includes keys present in both maps', () => {
    const a = { x: 10, y: 5 }
    const b = { x: 3, z: 1 }
    expect(getShared(a, b)).toEqual([
      { key: 'x', playcountOne: 10, playcountTwo: 3 },
    ])
  })

  it('ranks by combined share of each listener\'s total, not raw playcount', () => {
    // a's total is 1000, b's total is 10
    const a = { high: 900, low: 10 }
    const b = { high: 1, low: 9 }
    // high: 900/1000 + 1/10 = 1.0. low: 10/1000 + 9/10 = 0.91
    // "high" has a bigger combined share despite "low" being nearly all of b's listening
    const result = getShared(a, b)
    expect(result.map((item) => item.key)).toEqual(['high', 'low'])
  })
})

describe('musicCompatibility', () => {
  it('scores 100 when artists and tracks fully match', () => {
    const artists = { A: 10 }
    const tracks = { 'A :: song': 10 }
    const result = musicCompatibility(artists, artists, tracks, tracks)
    expect(result.score).toBe(100)
    expect(result.sharedArtists).toEqual([
      { key: 'A', playcountOne: 10, playcountTwo: 10 },
    ])
    expect(result.sharedTracks).toEqual([
      { key: 'A :: song', playcountOne: 10, playcountTwo: 10 },
    ])
  })

  it('scores 0 when nothing overlaps', () => {
    const result = musicCompatibility(
      { A: 10 },
      { B: 10 },
      { 'A :: song': 10 },
      { 'B :: song': 10 },
    )
    expect(result.score).toBe(0)
    expect(result.sharedArtists).toEqual([])
    expect(result.sharedTracks).toEqual([])
  })

  it('weights artist overlap more than track overlap', () => {
    const sharedArtists = { A: 10 }
    const sharedTracks = { 'A :: song': 10 }

    // only artists match (60% weight)
    const artistsOnly = musicCompatibility(
      sharedArtists,
      sharedArtists,
      { 'X :: other': 10 },
      { 'Y :: other': 10 },
    )
    // only tracks match (40% weight)
    const tracksOnly = musicCompatibility(
      { A: 10 },
      { C: 10 },
      sharedTracks,
      sharedTracks,
    )

    expect(artistsOnly.score).toBeGreaterThan(tracksOnly.score)
  })
})
