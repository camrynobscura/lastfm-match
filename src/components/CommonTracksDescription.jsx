import React from 'react'

const CommonTracksDescription = ({tracks}) => {
  return (
    <div className='tracks-description'>
      <p>
        {' '}
        You both love <span className='highlight-word'>tracks</span> like{' '}
        {tracks.map((track, i) => (
          <>
            {/* {truncatedMatchingArtists.length === 1 && (<span>{track}.</span>)} */}
            {i === tracks.length - 1 ? (
              <>
                and{' '}
                <span className='bold'>
                  {track.trackName} - {track.trackArtists}.
                </span>
              </>
            ) : (
              <span className='bold'>
                {track.trackName} ({track.trackArtists}),{' '}
              </span>
            )}
          </>
        ))}
      </p>
    </div>
  )
}

export default CommonTracksDescription
