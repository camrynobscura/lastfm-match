const MatchDescription = ({ matchingArtists, isLoading, hasSubmitted, usernameOne, usernameTwo }) => {
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
          <p>Musical Compatability</p>
          <p>between {usernameOne} and {usernameTwo}</p>
          <p>You both love artists like, and tracks like </p>
        </div>
      )}
    </div>
  )
}

export default MatchDescription
