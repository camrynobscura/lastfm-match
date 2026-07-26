// Builds links back to Last.fm's own pages for the artists, tracks and
// listeners this app displays.
//
// The API terms ask that links from a page showing artist/album/track
// information point at the matching Last.fm catalogue page, and links from
// a page showing a user's profile information point at that user's page.

const BASE = 'https://www.last.fm'

// Last.fm writes a space as "+" and percent-encodes the rest.
// encodeURIComponent handles everything except the space, which it renders
// as %20 -- Last.fm resolves that too, but "+" is the form its own links
// use, so match it.
//
// A name containing "/" (AC/DC) becomes %2F, which is exactly how Last.fm
// writes that URL itself. Their server currently answers it with a 502, so
// the link is correct but the destination is broken on their end; there is
// no alternative encoding that fixes it.
const slug = (value) => encodeURIComponent(value).replace(/%20/g, '+')

// each returns null for a missing name, so a caller can fall back to plain
// text rather than rendering a link to nowhere
export const artistUrl = (artist) =>
  artist ? `${BASE}/music/${slug(artist)}` : null

// "_" is Last.fm's own separator between the artist and the track
export const trackUrl = (artist, track) =>
  artist && track ? `${BASE}/music/${slug(artist)}/_/${slug(track)}` : null

export const userUrl = (user) => (user ? `${BASE}/user/${slug(user)}` : null)
