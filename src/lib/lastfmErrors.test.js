import { describe, it, expect } from 'vitest'
import { combineUserErrors, describeUserError } from './lastfmErrors'

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

describe('combineUserErrors', () => {
  const notFound = (name) => ({ code: 6, text: `"${name}" wasn't found on Last.fm.` })
  const suspended = {
    code: 26,
    text: 'API Key Suspended - This application is not allowed to make requests to the web services',
  }

  it('returns null when neither listener errored', () => {
    expect(combineUserErrors(null, null, 'a', 'b')).toBeNull()
  })

  it('passes a single error through', () => {
    expect(combineUserErrors(notFound('ghost'), null, 'ghost', 'rj')).toBe(
      '"ghost" wasn\'t found on Last.fm.',
    )
  })

  it('names both listeners in one sentence when neither exists', () => {
    expect(combineUserErrors(notFound('a'), notFound('b'), 'a', 'b')).toBe(
      'Neither "a" nor "b" were found on Last.fm.',
    )
  })

  it('says a global failure once, not once per listener', () => {
    // a suspended key, a rate limit or an outage fails BOTH requests with
    // the same code -- joining them blindly printed the sentence twice
    const combined = combineUserErrors(suspended, suspended, 'a', 'b')
    expect(combined).toBe(suspended.text)
    expect(combined.match(/API Key Suspended/g)).toHaveLength(1)
  })

  it('still reports two genuinely different problems', () => {
    const combined = combineUserErrors(notFound('ghost'), suspended, 'ghost', 'b')
    expect(combined).toContain('"ghost" wasn\'t found')
    expect(combined).toContain('API Key Suspended')
  })
})
