import CommonArtistsDescription from './CommonArtistsDescription'
import CommonTracksDescription from './CommonTracksDescription'

const MatchDescription = ({
  matchingArtists,
  matchingTracks,
  isLoading,
  hasSubmitted,
  staticUsernameOne,
  staticUsernameTwo,
  error,
}) => {
  // console.log(matchingArtists)

  let truncatedMatchingArtists = matchingArtists.slice(0, 5)
  let truncatedMatchingTracks = matchingTracks.slice(0, 3)

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

                  <div>
                    {/* if you have no tracks or artists in common */}
                    {matchingArtists.length === 0 &&
                      matchingTracks.length === 0 && (
                          <p>
                            Unfortunately you have no artists or tracks in
                            common. Try expanding the date range and see if that
                            changes the results.
                          </p>
                      )}

                    {/* if you have no artists in common but do have tracks in common */}
                    {matchingArtists.length === 0 &&
                      matchingTracks.length !== 0 && (
                        <>
                          <div className='artists-description'>
                            <p>Unfortunately you have no artists in
                              common. Try expanding the date range and see if that
                              changes the results.</p>
                          </div>
                          <CommonTracksDescription
                            tracks={truncatedMatchingTracks}
                          />
                        </>
                      )}

                    {/* if you have artists in common but no tracks in common */}
                    {matchingArtists.length !== 0 &&
                      matchingTracks.length === 0 && (
                        <>
                        <CommonArtistsDescription
                            artists={truncatedMatchingArtists}
                          />
                          <div  className='tracks-description'>
                            <p>Unfortunately you have no tracks in
                            common. Try expanding the date range and see if that
                            changes the results.</p>
                          </div>
                        </>
                      )}

                    {/* if you have tracks and artists in common */}
                    {matchingArtists.length !== 0 &&
                      matchingTracks.length !== 0 && (
                        <>
                          <CommonArtistsDescription
                            artists={truncatedMatchingArtists}
                          />
                          <CommonTracksDescription
                            tracks={truncatedMatchingTracks}
                          />
                        </>
                      )}
                  </div>

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
