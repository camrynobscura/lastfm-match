// Builds links back to Last.fm's own pages for the artists, tracks and
// listeners this app displays.
//
// The API terms ask that links from a page showing artist/album/track
// information point at the matching Last.fm catalogue page, and links from
// a page showing a user's profile information point at that user's page.

const BASE = 'https://www.last.fm'

// encodeURIComponent leaves ! ' ( ) * alone -- they predate the current URL
// spec and it still treats them as safe. Last.fm's server disagrees about
// the brackets: a track path holding a literal "(" answers 502, while the
// same path with %28/%29 answers 200. Bracketed track names are common
// ("(Live)", "(Remastered)", "(feat. ...)"), so escape that whole set by
// hand rather than leave a large share of track links broken.
const escapeLeftovers = (encoded) =>
  encoded.replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  )

// Last.fm writes a space as "+" and percent-encodes the rest. The space
// arrives here as %20, which Last.fm also resolves, but "+" is the form its
// own links use, so match it.
//
// A name containing "/" (AC/DC) becomes %2F, which is exactly how Last.fm
// writes that URL itself. Their server answers it with a 502 anyway, so the
// link is correct but the destination is broken on their end; no other
// encoding fixes it.
const slug = (value) =>
  escapeLeftovers(encodeURIComponent(value)).replace(/%20/g, '+')

// each returns null for a missing name, so a caller can fall back to plain
// text rather than rendering a link to nowhere
export const artistUrl = (artist) =>
  artist ? `${BASE}/music/${slug(artist)}` : null

// "_" is Last.fm's own separator between the artist and the track
export const trackUrl = (artist, track) =>
  artist && track ? `${BASE}/music/${slug(artist)}/_/${slug(track)}` : null

export const userUrl = (user) => (user ? `${BASE}/user/${slug(user)}` : null)
