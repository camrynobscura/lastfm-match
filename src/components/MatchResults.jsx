const MatchResults = ({ matchingArtists, isLoading, hasSubmitted }) => {
  // console.log(matchingArtists)
  return (
    <div>
      {isLoading && <p>data is being loaded</p>}
      {!isLoading && hasSubmitted && (
        <div>
          <h3>Your Common Artists</h3>
          {matchingArtists !== 'undefined' && isLoading ? (
            <p>loading</p>
          ) : (
            matchingArtists.map((artist, i) => <p key={i}>{artist}</p>)
          )}
        </div>
      )}
    </div>
  )
}

export default MatchResults
