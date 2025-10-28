const MatchDescription = ({
  matchingArtists,
  isLoading,
  hasSubmitted,
  staticUsernameOne,
  staticUsernameTwo,
  error,
}) => {
  // console.log(matchingArtists)

  let truncatedMatchingArtists = matchingArtists.slice(0, 5)

  return (
    <div className='match-description'>
      {isLoading ? (
        <p>data is being loaded</p>
      ) : (
        <>
          {error ? (
            <p>{error}</p>
          ) : (
            <>
              {hasSubmitted && (
                <div>
                  {/* <h3>Your Common Artists</h3> */}
                  <div className='match-description-head'>
                    <div className='user-versus'>
                      <h2>{staticUsernameOne}</h2> <p>&</p>{' '}
                      <h2>{staticUsernameTwo}</h2>
                    </div>
                    <div className='compatability-percentage'>
                      <div>
                        <p>You are 90% compatible!</p>
                      </div>
                    </div>
                  </div>

                  {matchingArtists.length === 0 && hasSubmitted ? (
                    <p>
                      Unfortunately you have no artists in common. Try expanding
                      the date range and see if that changes the results.{' '}
                    </p>
                  ) : (
                    <>
                      <p>
                        You both love{' '}
                        <span className='highlight-word'>artists</span> like{' '}
                        {truncatedMatchingArtists.map((artist, i) => (
                          <>
                            {i === truncatedMatchingArtists.length - 1 ? (
                              <>
                                and <span className='bold'>{artist}.</span>
                              </>
                            ) : (
                              <span className='bold'>{artist}, </span>
                            )}
                          </>
                        ))}
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default MatchDescription
