import { useEffect, useState } from 'react'
import { parseTrackKey } from '../lib/compatibility'
import { getDisplayPage } from '../lib/pagination'

const PAGE_SIZE = 10
// matches .bar-username's font in index.scss -- ch units approximate a
// monospace font's character width using the "0" glyph, but that glyph
// runs wider than SUSE Mono's other characters, leaving a gap between the
// username and the bar. measuring the actual rendered text via canvas gets
// an exact pixel width instead of an approximation.
const BAR_USERNAME_FONT = "600 11.2px 'SUSE Mono', monospace"
// matches .plays's font (0.8rem * 16px root = 12.8px) -- used to size the
// play-count column to the widest number so counts stay left-aligned in
// one tidy column, flush to the section's right edge
const PLAYS_FONT = "600 12.8px 'SUSE Mono', monospace"

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
  return (
    <div className='row'>
      <div className='rank'>{String(rank).padStart(2, '0')}.</div>
      <div className='row-name'>
        <div className='primary' title={name}>
          {name}
        </div>
        {artist && (
          <div className='secondary'>
            <span className='by-prefix'>by </span>
            {artist}
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

  // fresh results start back at the first page
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [items])

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

  // a <section> is only exposed as a landmark once it has an accessible
  // name, so point it at the heading it already contains -- that promotes
  // both panels into the screen reader's landmark list. derived from
  // `heading` so the two instances ("shared artists"/"shared tracks") get
  // distinct ids
  const headingId = `${heading.replace(/\s+/g, '-')}-heading`

  return (
    <div className='shared-list-panel' ref={scrollRef}>
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
              style={{
                '--username-col-width': usernameColWidth,
                '--plays-col-width': playsColWidth,
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
              <button
                type='button'
                className='see-more'
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(count + PAGE_SIZE, items.length),
                  )
                }
              >
                See more {heading}
                <span className='plus' aria-hidden='true'>
                  +
                </span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default MatchTable
