const LoadingIndicator = () => {
  return (
    <div className='loading-indicator' role='status'>
      <div className='equalizer' aria-hidden='true'>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>finding your compatibility score...</p>
    </div>
  )
}

export default LoadingIndicator
