// Links back to Last.fm's own pages, which the API terms ask for: artist,
// album and track names should point at the matching catalogue page, and a
// listener's name at their profile.

const BASE = 'https://www.last.fm'

// encodeURIComponent leaves ! ' ( ) * alone, treating them as safe.
// Last.fm's server disagrees about the brackets -- a track path with a
// literal "(" answers 502, the same path with %28 answers 200 -- and
// bracketed track names are common ("(Live)", "(feat. ...)").
const escapeLeftovers = (encoded) =>
  encoded.replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  )

// "+" for a space is the form Last.fm's own links use; %20 also resolves.
//
// "/" in a name (AC/DC) becomes %2F, exactly how Last.fm writes that URL
// itself. Their server 502s on it anyway, so the link is right and the
// destination is broken upstream; no other encoding helps.
const slug = (value) =>
  escapeLeftovers(encodeURIComponent(value)).replace(/%20/g, '+')

// null for a missing name, so a caller can render plain text instead of a
// link to nowhere
export const artistUrl = (artist) =>
  artist ? `${BASE}/music/${slug(artist)}` : null

// "_" is Last.fm's own separator between the artist and the track
export const trackUrl = (artist, track) =>
  artist && track ? `${BASE}/music/${slug(artist)}/_/${slug(track)}` : null

export const userUrl = (user) => (user ? `${BASE}/user/${slug(user)}` : null)
