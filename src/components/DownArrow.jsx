// variant picks the margin that centers the arrow within its specific
// surrounding gap (the box above/below it use different padding/margin
// models, so one fixed margin can't center both placements)
const DownArrow = ({ variant, animate = false }) => (
  <div className={`down-arrow-wrap down-arrow-wrap--${variant}`} aria-hidden='true'>
    <span className={animate ? 'down-arrow down-arrow--animated' : 'down-arrow'} />
  </div>
)

export default DownArrow
