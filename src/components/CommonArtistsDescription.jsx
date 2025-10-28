import React from 'react'

const CommonArtistsDescription = ({artists}) => {
  return (
    <div className='artists-description'>
      <p>
        You both love <span className='highlight-word'>artists</span> like{' '}
        {artists.map((artist, i) => (
          <>
            {i === artists.length - 1 ? (
              <>
                and <span className='bold'>{artist}.</span>
              </>
            ) : (
              <span className='bold'>{artist}, </span>
            )}
          </>
        ))}
      </p>
    </div>
  )
}

export default CommonArtistsDescription
