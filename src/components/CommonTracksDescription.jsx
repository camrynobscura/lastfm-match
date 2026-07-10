import React from 'react'

const CommonTracksDescription = ({tracks}) => {
  console.log(" ++++++++++ COMMON TRACKS ++++++++++");

  console.log(tracks)
  let filteredTracks = tracks.map((track) => {
    return track.split(' :: ')
  })
  console.log(filteredTracks)

  return (
    <div>
      <p>
        {' '}
        You both love <span className='highlight-word'>tracks</span> like{' '}
        {filteredTracks.map((track, i) => (
          <>
            {/* {truncatedMatchingArtists.length === 1 && (<span>{track}.</span>)} */}
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
          </>
        ))}
      </p>
    </div>
  )
}

export default CommonTracksDescription
