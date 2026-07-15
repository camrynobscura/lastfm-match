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
      <p>finding your compatibility score...</p>
    </div>
  )
}

export default LoadingIndicator
