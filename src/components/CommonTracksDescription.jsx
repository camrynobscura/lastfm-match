import React from 'react'
import { parseTrackKey } from '../lib/compatibility'
import { listJoiner } from '../lib/resultSummary'

const CommonTracksDescription = ({ tracks }) => {
  const parsedTracks = tracks.map(parseTrackKey)

  return (
    <div>
      <p>
        {' '}
        You both love <span className='highlight-word'>tracks</span> like{' '}
        {parsedTracks.map(({ artist, track }, i) => (
          <React.Fragment key={tracks[i]}>
            {listJoiner(i, parsedTracks.length)}
            <span className='bold'>
              {track} <span style={{ fontWeight: 'normal' }}>by</span> {artist}
              {i === parsedTracks.length - 1 ? '.' : ''}
            </span>
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default CommonTracksDescription
