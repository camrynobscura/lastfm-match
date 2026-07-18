import { useEffect, useState } from 'react'
import { parseTrackKey } from '../lib/compatibility'
import { getDisplayPage } from '../lib/pagination'

const PAGE_SIZE = 10

const BarLine = ({ cls, count, max, username }) => {
  const width = max > 0 ? Math.round((count / max) * 100) : 0

  return (
    <div className='bar-line'>
      <div className='bar-track' aria-hidden='true'>
        <span className={`fill ${cls}`} style={{ width: `${width}%` }} />
      </div>
      <div className='plays'>
        <span className={`plays-dot ${cls}`} aria-hidden='true' />
        <span className='sr-only'>{username}: </span>
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
            <span className='sr-only'>by </span>
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

  const { displayed, visible, hasMore, max } = getDisplayPage(
    items,
    visibleCount,
  )

  return (
    <div className='shared-list-panel' ref={scrollRef}>
      <div className={dark ? 'match-table match-table--dark' : 'match-table'}>
        <div className='match-table-lists'>
          <section>
            <div className='section-head'>
              <h2 className='shared-list-heading'>
                {heading} <span className='count'>({displayed.length})</span>
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
            <div className='rows'>
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
                    Math.min(count + PAGE_SIZE, displayed.length),
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
