import { describe, expect, it } from 'vitest'
import { artistUrl, trackUrl, userUrl } from './lastfmLinks'

describe('artistUrl', () => {
  it('links a plain name', () => {
    expect(artistUrl('Radiohead')).toBe('https://www.last.fm/music/Radiohead')
  })

  it('writes spaces as + , the form Last.fm uses', () => {
    expect(artistUrl('Arctic Monkeys')).toBe(
      'https://www.last.fm/music/Arctic+Monkeys',
    )
  })

  it('percent-encodes accented characters', () => {
    expect(artistUrl('Sigur Rós')).toBe(
      'https://www.last.fm/music/Sigur+R%C3%B3s',
    )
  })

  it('encodes characters that would otherwise change the URL', () => {
    // & would start a query param, ? would start a query string, and #
    // would start a fragment -- all have to survive as part of the name
    expect(artistUrl('Above & Beyond')).toBe(
      'https://www.last.fm/music/Above+%26+Beyond',
    )
    expect(artistUrl('Panic! At The Disco')).toBe(
      'https://www.last.fm/music/Panic%21+At+The+Disco',
    )
  })

  it('encodes a slash so it stays part of the name, not a path segment', () => {
    expect(artistUrl('AC/DC')).toBe('https://www.last.fm/music/AC%2FDC')
  })

  it('returns null rather than a link to nowhere', () => {
    expect(artistUrl('')).toBeNull()
    expect(artistUrl(undefined)).toBeNull()
  })
})

describe('trackUrl', () => {
  it('puts Last.fm’s "_" separator between artist and track', () => {
    expect(trackUrl('Arctic Monkeys', 'Do I Wanna Know?')).toBe(
      'https://www.last.fm/music/Arctic+Monkeys/_/Do+I+Wanna+Know%3F',
    )
  })

  it('escapes brackets, which Last.fm 502s on when left literal', () => {
    // encodeURIComponent leaves "(" and ")" alone; Last.fm answers 502 for
    // the literal form and 200 for the escaped one. bracketed track names
    // are common enough that this covers a lot of links
    expect(trackUrl('The Kooks', 'See The Sun (Alternate Version)')).toBe(
      'https://www.last.fm/music/The+Kooks/_/See+The+Sun+%28Alternate+Version%29',
    )
  })

  it('needs both halves', () => {
    expect(trackUrl('Radiohead', '')).toBeNull()
    expect(trackUrl('', 'Creep')).toBeNull()
  })
})

describe('userUrl', () => {
  it('links to the listener’s profile', () => {
    expect(userUrl('rj')).toBe('https://www.last.fm/user/rj')
  })

  it('encodes a name that would otherwise break the path', () => {
    expect(userUrl('a/b')).toBe('https://www.last.fm/user/a%2Fb')
  })

  it('returns null for a missing name', () => {
    expect(userUrl(undefined)).toBeNull()
  })
})
