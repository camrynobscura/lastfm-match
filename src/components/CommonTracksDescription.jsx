import React from 'react'

const CommonTracksDescription = ({tracks}) => {
  let filteredTracks = tracks.map((track) => {
    return track.split(' :: ')
  })

  return (
    <div>
      <p>
        {' '}
        You both love <span className='highlight-word'>tracks</span> like{' '}
        {filteredTracks.map((track, i) => (
          <React.Fragment key={track.join(' :: ')}>
            {i === tracks.length - 1 ? (
              <>
                and{' '}
                <span className='bold'>
                  {track[1]} <span style={{fontWeight:'normal'}}>by</span> {track[0]}.
                </span>
              </>
            ) : (
              <span className='bold'>
                {track[1]} <span style={{fontWeight:'normal'}}>by</span> {track[0]},{' '}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default CommonTracksDescription
