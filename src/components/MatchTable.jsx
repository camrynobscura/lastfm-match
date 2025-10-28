const MatchTable = ({
  matchingArtists,
  isLoading,
  hasSubmitted,
  usernameOne,
  usernameTwo,
  error
}) => {
  return (
    <div>
      {!error && !isLoading && hasSubmitted && (
        <div>
          <h3>hello</h3>
        </div>
      )}
    </div>
  )
}

export default MatchTable
