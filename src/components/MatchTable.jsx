import { useEffect, useRef, useState } from 'react'
import { parseTrackKey } from '../lib/compatibility'
import { getDisplayPage } from '../lib/pagination'
import { artistUrl, trackUrl } from '../lib/lastfmLinks'

const PAGE_SIZE = 10
// both match their element's font in index.scss. measured via canvas rather
// than sized in ch: the "0" glyph ch is based on runs wider than SUSE Mono's
// other characters, which left a gap between the username and the bar.
const BAR_USERNAME_FONT = "600 11.2px 'SUSE Mono', monospace"
const PLAYS_FONT = "600 12.8px 'SUSE Mono', monospace"
// .rank's font (1.4rem * 16px root)
const RANK_FONT = "700 22.4px 'Barlow Condensed', sans-serif"
// the clear space between the rank and the name, matching what a two-digit
// rank left in the old fixed 34px column
const RANK_GAP = 10

let measureCanvasContext
function measureTextWidth(text, font) {
  if (!measureCanvasContext) {
    measureCanvasContext = document.createElement('canvas').getContext('2d')
  }
  measureCanvasContext.font = font
  return measureCanvasContext.measureText(text).width
}

const BarLine = ({ cls, count, max, username }) => {
  const width = max > 0 ? Math.round((count / max) * 100) : 0

  return (
    <div className='bar-line'>
      <div className='bar-username' title={username}>
        {username}
      </div>
      <div className='bar-track' aria-hidden='true'>
        <span className={`fill ${cls}`} style={{ width: `${width}%` }} />
      </div>
      <div className='plays'>
        {count}
        <span className='sr-only'> {count === 1 ? 'play' : 'plays'}</span>
      </div>
    </div>
  )
}

const SharedRow = ({
  rank,
  name,
  artist,
  playcountOne,
  playcountTwo,
  max,
  staticUsernameOne,
  staticUsernameTwo,
}) => {
  // a track row links to the track's page, an artist row to the artist's.
  // null when the name is missing, in which case the plain text renders
  const href = artist ? trackUrl(artist, name) : artistUrl(name)

  return (
    <div className='row'>
      <div className='rank'>{String(rank).padStart(2, '0')}.</div>
      <div className='row-name'>
        <div className='primary' title={name}>
          {href ? (
            <a href={href} target='_blank' rel='noreferrer'>
              {name}
            </a>
          ) : (
            name
          )}
        </div>
        {artist && (
          <div className='secondary'>
            {/* the prefix stays outside the link so only the name is the
                target, and the link text reads as just the artist */}
            <span className='by-prefix'>by </span>
            <a href={artistUrl(artist)} target='_blank' rel='noreferrer'>
              {artist}
            </a>
          </div>
        )}
      </div>
      <div className='bars'>
        <BarLine
          cls='one'
          count={playcountOne}
          max={max}
          username={staticUsernameOne}
        />
        <BarLine
          cls='two'
          count={playcountTwo}
          max={max}
          username={staticUsernameTwo}
        />
      </div>
    </div>
  )
}

const MatchTable = ({
  heading,
  items,
  isTracks,
  isLoading,
  hasSubmitted,
  staticUsernameOne,
  staticUsernameTwo,
  error,
  dark,
  scrollRef,
}) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [announcement, setAnnouncement] = useState('')
  const rowsRef = useRef(null)
  // index of the first row revealed by the last press, when that press also
  // removed the button. null the rest of the time
  const rowToFocus = useRef(null)

  // fresh results start back at the first page
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setAnnouncement('')
  }, [items])

  // the button unmounts on the press that exhausts the list, and focus fell
  // to <body> with it -- the next Tab then restarted from the top of the
  // page. move it to the first row that press revealed instead: the row name
  // is a link, so the focus ring is already visible there.
  useEffect(() => {
    const index = rowToFocus.current
    if (index === null) return
    rowToFocus.current = null

    const row = rowsRef.current?.querySelectorAll('.row')[index]
    if (!row) return
    // a row whose name built no link isn't focusable on its own; tabIndex -1
    // makes it focusable without adding it to the tab order
    const target = row.querySelector('a') ?? row
    if (target === row) row.tabIndex = -1
    target.focus()
  }, [visibleCount])

  const showMore = () => {
    const firstNewRow = visibleCount
    const next = Math.min(visibleCount + PAGE_SIZE, items.length)
    // only claim focus when the button is about to disappear -- while it
    // survives, leaving focus on it is what lets you press it again
    if (next >= items.length) rowToFocus.current = firstNewRow
    setVisibleCount(next)
    setAnnouncement(
      next >= items.length
        ? `Showing all ${items.length} ${heading}.`
        : `Showing ${next} of ${items.length} ${heading}.`,
    )
  }

  if (error || isLoading || !hasSubmitted) return null
  // nothing in this list: MatchDescription already explains it
  if (items.length === 0) return null

  const { visible, hasMore, max } = getDisplayPage(items, visibleCount)

  // the username column shrinks to fit whichever of the two names is
  // longer (so a short name like "rj" doesn't leave a gap before the bar),
  // capped at 100px for long names
  const usernameColWidth = `${Math.min(
    100,
    Math.max(
      measureTextWidth(staticUsernameOne, BAR_USERNAME_FONT),
      measureTextWidth(staticUsernameTwo, BAR_USERNAME_FONT),
    ),
  )}px`

  // size the play-count column to the widest number in the whole list
  // (max, already computed above for the bar scaling). the counts stay
  // left-aligned, so the widest number sits flush to the section's right
  // edge and shorter ones line up under it. Math.ceil so a fractional
  // measurement never clips the final digit.
  const playsColWidth = `${Math.ceil(
    measureTextWidth(String(max), PLAYS_FONT),
  )}px`

  // the rank column was a flat 34px, which fits "99." but not "100." -- the
  // number ran into the name once a list passed 99 rows, which it can now
  // that nothing caps it. size it to the highest rank this list will show
  // (padStart keeps a minimum of two digits, so short lists are unchanged)
  const rankColWidth = `${Math.ceil(
    measureTextWidth(
      `${String(items.length).padStart(2, '0')}.`,
      RANK_FONT,
    ),
  ) + RANK_GAP}px`

  // a <section> is only exposed as a landmark once it has an accessible
  // name, so point it at the heading it already contains -- that promotes
  // both panels into the screen reader's landmark list. derived from
  // `heading` so the two instances ("shared artists"/"shared tracks") get
  // distinct ids
  const headingId = `${heading.replace(/\s+/g, '-')}-heading`

  return (
    <div
      className={
        isTracks
          ? 'shared-list-panel shared-list-panel--tracks'
          : 'shared-list-panel'
      }
      ref={scrollRef}
    >
      <div className={dark ? 'match-table match-table--dark' : 'match-table'}>
        <div className='match-table-lists'>
          <section aria-labelledby={headingId}>
            <div className='section-head'>
              <h2 className='shared-list-heading' id={headingId}>
                {heading} <span className='count'>({items.length})</span>
              </h2>
              <div className='legend'>
                <span className='key'>
                  <span className='swatch one' />
                  {staticUsernameOne}
                </span>
                <span className='key'>
                  <span className='swatch two' />
                  {staticUsernameTwo}
                </span>
              </div>
            </div>
            <div
              className='rows'
              ref={rowsRef}
              style={{
                '--username-col-width': usernameColWidth,
                '--plays-col-width': playsColWidth,
                '--rank-col-width': rankColWidth,
              }}
            >
              {visible.map((item, i) => {
                const { artist, track } = isTracks
                  ? parseTrackKey(item.key)
                  : { artist: undefined, track: item.key }
                return (
                  <SharedRow
                    key={item.key}
                    rank={i + 1}
                    name={track}
                    artist={artist}
                    playcountOne={item.playcountOne}
                    playcountTwo={item.playcountTwo}
                    max={max}
                    staticUsernameOne={staticUsernameOne}
                    staticUsernameTwo={staticUsernameTwo}
                  />
                )
              })}
            </div>
            {hasMore && (
              <button type='button' className='see-more' onClick={showMore}>
                See more {heading}
                <span className='plus' aria-hidden='true'>
                  +
                </span>
              </button>
            )}
            {/* rows appearing is a silent change otherwise -- nothing about
                the new content is announced, and the button's own label
                doesn't change */}
            <p className='sr-only' role='status'>
              {announcement}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MatchTable
