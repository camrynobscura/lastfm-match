// the region stays mounted for the life of the page; only the box inside it
// comes and goes. a role="alert" inserted *with* its text already in it is
// announced unreliably -- there's no prior content to diff against.
//
// announceKey is what makes a *repeat* of the same message announce:
// handleSubmit clears and re-sets the error in one batch, so resubmitting an
// identical bad form mutates nothing and would be silent. a changing key
// remounts the box, which the region reports as new content.
const ErrorMessage = ({ message, scrollRef, id, announceKey }) => (
  <div role='alert'>
    {message && (
      <div key={announceKey} className='match-error' ref={scrollRef} id={id}>
        <p>{message}</p>
      </div>
    )}
  </div>
)

export default ErrorMessage
