import CommonArtistsDescription from './CommonArtistsDescription'
import CommonTracksDescription from './CommonTracksDescription'
import LoadingIndicator from './LoadingIndicator'
import ScoreDisplay from './ScoreDisplay'
import { userUrl } from '../lib/lastfmLinks'
import { ARTIST_LIMIT, TRACK_LIMIT } from '../lib/resultSummary'

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
  // the same limits the spoken summary uses, so a screen reader never hears
  // a name that isn't on screen
  let truncatedMatchingArtists = matchingArtists.slice(0, ARTIST_LIMIT)
  let truncatedMatchingTracks = matchingTracks.slice(0, TRACK_LIMIT)

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
          {/* the score ring reads as this section's heading visually, but
          there's no text equivalent -- without one the heading outline
          jumps from the page title straight to "shared artists", so the
          score and the copy below it can't be reached by heading
          navigation. .sr-only is position:absolute, so it stays out of
          the layout here */}
          <h2 className='sr-only'>Match results</h2>
          <div className='compatibility-percentage'>
            <ScoreDisplay score={score} />
          </div>
          <div className='match-copy'>
            {/* the two listeners link to their own Last.fm profiles. the ×
                is decorative: read aloud it lands as "times", so it's hidden
                and a word stands in, making the line a sentence */}
            <p className='names-caption'>
              <a
                href={userUrl(staticUsernameOne)}
                target='_blank'
                rel='noreferrer'
              >
                {staticUsernameOne}
              </a>{' '}
              <span className='pairing-x' aria-hidden='true'>
                ×
              </span>
              <span className='sr-only'>and</span>{' '}
              <a
                href={userUrl(staticUsernameTwo)}
                target='_blank'
                rel='noreferrer'
              >
                {staticUsernameTwo}
              </a>
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
