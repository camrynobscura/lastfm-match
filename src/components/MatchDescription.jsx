import CommonArtistsDescription from './CommonArtistsDescription'
import CommonTracksDescription from './CommonTracksDescription'
import LoadingIndicator from './LoadingIndicator'
import ScoreDisplay from './ScoreDisplay'

const MatchDescription = ({
  score,
  matchingArtists,
  matchingTracks,
  isLoading,
  hasSubmitted,
  staticUsernameOne,
  staticUsernameTwo,
  error,
  scrollRef,
}) => {
  let truncatedMatchingArtists = matchingArtists.slice(0, 5)
  let truncatedMatchingTracks = matchingTracks.slice(0, 3)

  // the error itself renders in its own separate box (see ErrorMessage) --
  // this section just needs to know not to show results underneath it
  const showResults = hasSubmitted && !error

  // nothing rendered yet (idle/error/pre-submit) -- collapse the section's
  // own padding instead of reserving empty space for it
  const isEmpty = !isLoading && !showResults

  let sectionClass = 'match-description'
  if (isEmpty) sectionClass += ' is-empty'
  if (isLoading) sectionClass += ' is-loading'

  return (
    <div className={sectionClass} ref={scrollRef}>
      {isLoading ? (
        <div className='match-results'>
          <LoadingIndicator />
        </div>
      ) : showResults ? (
        <div className='match-results'>
          <div className='compatibility-percentage'>
            <ScoreDisplay score={score} />
          </div>
          <div className='match-copy'>
            <p className='names-caption'>
              {staticUsernameOne} <span className='pairing-x'>×</span>{' '}
              {staticUsernameTwo}
            </p>
            <div className='match-lists'>
              {/* if you have no tracks or artists in common */}
              {matchingArtists.length === 0 &&
                matchingTracks.length === 0 && (
                  <p>
                    Unfortunately you have no artists or tracks in common.
                    Try expanding the date range and see if that changes the
                    results.
                  </p>
                )}

              {/* if you have no artists in common but do have tracks in common */}
              {matchingArtists.length === 0 &&
                matchingTracks.length !== 0 && (
                  <>
                    <div className='artists-description'>
                      <p>
                        Unfortunately you have no artists in common. Try
                        expanding the date range and see if that changes the
                        results.
                      </p>
                    </div>
                    <CommonTracksDescription tracks={truncatedMatchingTracks} />
                  </>
                )}

              {/* if you have artists in common but no tracks in common */}
              {matchingArtists.length !== 0 &&
                matchingTracks.length === 0 && (
                  <>
                    <CommonArtistsDescription
                      artists={truncatedMatchingArtists}
                    />
                    <div className='tracks-description'>
                      <p>
                        Unfortunately you have no tracks in common. Try
                        expanding the date range and see if that changes the
                        results.
                      </p>
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
                    <CommonTracksDescription tracks={truncatedMatchingTracks} />
                  </>
                )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MatchDescription
