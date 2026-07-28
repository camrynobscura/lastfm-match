import React from 'react'
import { listJoiner } from '../lib/resultSummary'

const CommonArtistsDescription = ({ artists }) => {
  return (
    <div className='artists-description'>
      <p>
        You both love <span className='highlight-word'>artists</span> like{' '}
        {artists.map((artist, i) => (
          <React.Fragment key={artist}>
            {listJoiner(i, artists.length)}
            <span className='bold'>
              {artist}
              {i === artists.length - 1 ? '.' : ''}
            </span>
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default CommonArtistsDescription
