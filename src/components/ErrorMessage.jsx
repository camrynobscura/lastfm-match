// the live region itself stays mounted for the life of the page, and only
// the box inside it comes and goes. a role="alert" element inserted into
// the DOM with its text already inside is announced unreliably across
// screen reader/browser pairs -- there's no prior content for assistive
// tech to diff against. keeping the region put makes every error a plain
// content change, which is what live regions are built to report.
//
// announceKey is what makes a *repeat* of the identical message announce.
// handleSubmit clears the error and re-sets it in the same batch, so
// resubmitting the same invalid form leaves the text byte-identical and
// mutates nothing at all -- silence, on every screen reader. a changing key
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
