import React from 'react'
import { parseTrackKey } from '../lib/compatibility'

const CommonTracksDescription = ({ tracks }) => {
  const parsedTracks = tracks.map(parseTrackKey)

  return (
    <div>
      <p>
        {' '}
        You both love <span className='highlight-word'>tracks</span> like{' '}
        {parsedTracks.map(({ artist, track }, i) => (
          <React.Fragment key={tracks[i]}>
            {i === parsedTracks.length - 1 ? (
              <>
                and{' '}
                <span className='bold'>
                  {track} <span style={{ fontWeight: 'normal' }}>by</span>{' '}
                  {artist}.
                </span>
              </>
            ) : (
              <span className='bold'>
                {track} <span style={{ fontWeight: 'normal' }}>by</span>{' '}
                {artist},{' '}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default CommonTracksDescription
