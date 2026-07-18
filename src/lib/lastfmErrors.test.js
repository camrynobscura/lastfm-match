import { describe, it, expect } from 'vitest'
import { describeUserError } from './lastfmErrors'

const ok = { topartists: { artist: [] } }

describe('describeUserError', () => {
  it('returns null when neither call errored', () => {
    const data = { artists: ok, tracks: ok }
    expect(describeUserError(data, 'turtlepuff')).toBeNull()
  })

  it('names the username for a code-6 (not found) error', () => {
    const data = {
      artists: { error: 6, message: 'User not found' },
      tracks: ok,
    }
    expect(describeUserError(data, 'nobody123')).toEqual({
      code: 6,
      text: '"nobody123" wasn\'t found on Last.fm.',
    })
  })

  it('checks the tracks call when the artists call succeeded', () => {
    const data = {
      artists: ok,
      tracks: { error: 6, message: 'User not found' },
    }
    expect(describeUserError(data, 'nobody123')).toEqual({
      code: 6,
      text: '"nobody123" wasn\'t found on Last.fm.',
    })
  })

  it('maps known Last.fm error codes to friendlier copy', () => {
    const data = { artists: { error: 29, message: 'Rate limit exceeded' }, tracks: ok }
    expect(describeUserError(data, 'someone').text).toMatch(/rate-limiting/i)
  })

  it('falls back to the API message for unmapped error codes', () => {
    const data = { artists: { error: 999, message: 'Something weird' }, tracks: ok }
    expect(describeUserError(data, 'someone')).toEqual({
      code: 999,
      text: 'Something weird',
    })
  })
})
