// no role="status" here: this whole component mounts when loading starts,
// which would insert a live region with its text already inside -- a
// pattern assistive tech announces unreliably (it was silent in VoiceOver).
// the announcing is done by the always-mounted region in Home.jsx instead,
// leaving this as the visual half.
const LoadingIndicator = () => {
  return (
    <div className='loading-indicator'>
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
