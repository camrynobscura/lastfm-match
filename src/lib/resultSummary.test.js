import { describe, expect, it } from 'vitest'
import { countPhrase, describeMatch } from './resultSummary'

const artists = ['Olivia Rodrigo', 'Lady Gaga', 'The Beatles']
const tracks = ['Sublime :: Santeria', 'Vance Joy :: Riptide']

describe('countPhrase', () => {
  it('pluralises, and says "no" rather than "0"', () => {
    expect(countPhrase(0, 'shared artist')).toBe('no shared artists')
    expect(countPhrase(1, 'shared artist')).toBe('1 shared artist')
    expect(countPhrase(14, 'shared artist')).toBe('14 shared artists')
  })
})

describe('describeMatch', () => {
  it('leads with the score and the counts', () => {
    expect(describeMatch(48, artists, tracks)).toContain(
      '48% compatible. 3 shared artists, 2 shared tracks.',
    )
  })

  it('rounds the score, since it arrives fractional', () => {
    expect(describeMatch(47.6, [], [])).toContain('48% compatible.')
  })

  it('names the artists as a spoken list', () => {
    expect(describeMatch(48, artists, [])).toContain(
      'You both love artists like Olivia Rodrigo, Lady Gaga and The Beatles.',
    )
  })

  it('reads a track as "track by artist", not the raw key', () => {
    const out = describeMatch(48, [], tracks)
    expect(out).toContain(
      'You both love tracks like Santeria by Sublime and Riptide by Vance Joy.',
    )
    expect(out).not.toContain('::')
  })

  it('does not put "and" in front of a lone name', () => {
    expect(describeMatch(48, ['Radiohead'], [])).toContain(
      'You both love artists like Radiohead.',
    )
  })

  it('truncates to the same counts the visible prose shows', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const manyTracks = many.map((n) => `Artist ${n} :: Track ${n}`)
    const out = describeMatch(90, many, manyTracks)
    expect(out).toContain('artists like a, b, c, d and e.')
    expect(out).not.toContain('f')
    expect(out).toContain('Track a by Artist a')
    expect(out).not.toContain('Track d')
    // the counts still report the full totals, only the naming is truncated
    expect(out).toContain('7 shared artists, 7 shared tracks.')
  })

  it('omits a list entirely when nothing is shared', () => {
    const out = describeMatch(0, [], [])
    expect(out).toBe('0% compatible. no shared artists, no shared tracks.')
  })

  it('keeps the half that exists when only one list has items', () => {
    const out = describeMatch(20, [], tracks)
    expect(out).not.toContain('love artists')
    expect(out).toContain('love tracks')
  })
})
