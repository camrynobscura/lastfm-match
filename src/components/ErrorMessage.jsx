const ErrorMessage = ({ message, scrollRef, id }) => {
  if (!message) return null

  return (
    <div className='match-error' role='alert' ref={scrollRef} id={id}>
      <p>{message}</p>
    </div>
  )
}

export default ErrorMessage
