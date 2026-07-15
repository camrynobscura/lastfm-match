import { useEffect, useState } from 'react'

const SharedItem = ({
  rank,
  name,
  artist,
  playcountOne,
  playcountTwo,
  staticUsernameOne,
  staticUsernameTwo,
}) => {
  let [isOpen, setIsOpen] = useState(false)

  const playLabel = (count) => `${count} ${count === 1 ? 'play' : 'plays'}`

  return (
    <div className={isOpen ? 'shared-item open' : 'shared-item'}>
      <button
        type='button'
        className='shared-item-head'
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className='shared-item-rank'>{rank}</span>
        <span className='shared-item-name' title={name}>
          {name}
          {artist && <span className='shared-item-artist'>{artist}</span>}
        </span>
        <span className='plus-minus' />
      </button>
      <div className='shared-item-body'>
        <div className='shared-item-inner'>
          <div className='play-row'>
            <span className='play-user'>{staticUsernameOne}</span>
            <span>{playLabel(playcountOne)}</span>
          </div>
          <div className='play-row'>
            <span className='play-user'>{staticUsernameTwo}</span>
            <span>{playLabel(playcountTwo)}</span>
          </div>
        </div>
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
}) => {
  let [isExpanded, setIsExpanded] = useState(false)

  // fresh results start collapsed again
  useEffect(() => {
    setIsExpanded(false)
  }, [items])

  if (error || isLoading || !hasSubmitted) return null
  // nothing in this list: MatchDescription already explains it
  if (items.length === 0) return null

  // keep the list browsable: top 100
  const displayed = items.slice(0, 100)

  return (
    <div className='secondary-results'>
      <div className='match-table'>
        <button
          type='button'
          className='match-table-toggle'
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? `hide all ${heading}` : `see all ${heading}`}
          <span className='plus-minus' />
        </button>
        <div
          className={
            isExpanded ? 'match-table-reveal open' : 'match-table-reveal'
          }
        >
          <div className='match-table-reveal-inner'>
            <div className='match-table-lists'>
              <section>
                <h2 className='shared-list-heading'>
                  {heading} <span>({displayed.length})</span>
                </h2>
                {displayed.map((item, i) => {
                  // track keys look like "Artist :: Track"
                  const separator = isTracks ? item.key.indexOf(' :: ') : -1
                  return (
                    <SharedItem
                      key={item.key}
                      rank={i + 1}
                      name={isTracks ? item.key.slice(separator + 4) : item.key}
                      artist={
                        isTracks ? item.key.slice(0, separator) : undefined
                      }
                      playcountOne={item.playcountOne}
                      playcountTwo={item.playcountTwo}
                      staticUsernameOne={staticUsernameOne}
                      staticUsernameTwo={staticUsernameTwo}
                    />
                  )
                })}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchTable
