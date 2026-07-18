import { useEffect, useState } from 'react'

const DURATION = 2000
const RADIUS = 82
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const ScoreDisplay = ({ score }) => {
  // 0 -> 1 over the reveal; number and arc both derive from this
  let [progress, setProgress] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(1)
      return
    }

    setProgress(0)
    let frameId
    const start = performance.now()

    const tick = (now) => {
      const t = Math.min((now - start) / DURATION, 1)
      setProgress(1 - Math.pow(1 - t, 3)) // ease-out cubic: fast start, slow finish
      if (t < 1) frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [score])

  return (
    <div className='score-display'>
      <div className='score-ring'>
        <svg viewBox='0 0 190 190' aria-hidden='true'>
          <circle className='score-ring-track' cx='95' cy='95' r='92' />
          <circle
            className='score-ring-progress'
            cx='95'
            cy='95'
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - (score / 100) * progress)}
          />
        </svg>
        <div className='score-ring-center'>
          <span
            className={
              score === 100 ? 'score-number three-digits' : 'score-number'
            }
          >
            {Math.round(score * progress)}
            <span className='score-pct-sign'>%</span>
          </span>
          <span className='score-caption'>compatible</span>
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
