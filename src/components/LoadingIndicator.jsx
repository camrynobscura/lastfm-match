const LoadingIndicator = () => {
  return (
    <div className='loading-indicator'>
      <div className='equalizer' aria-label='Loading'>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>finding your matches...</p>
    </div>
  )
}

export default LoadingIndicator
