import { useRef, useState } from 'react'

function OnboardingReadyPage({ answers, phase = 'enter', onComplete }) {
  const trackRef = useRef(null)
  const [dragX, setDragX] = useState(0)
  const [isSliding, setIsSliding] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const clampValue = (value, min, max) => Math.min(Math.max(value, min), max)

  const getMetrics = () => {
    const track = trackRef.current

    if (!track) {
      return null
    }

    const rect = track.getBoundingClientRect()
    const knobSize = rect.height - 18
    const maxX = rect.width - knobSize - 18

    return { rect, maxX }
  }

  const finishSlide = () => {
    if (isComplete) {
      return
    }

    const metrics = getMetrics()

    if (!metrics) {
      return
    }

    setIsComplete(true)
    setDragX(metrics.maxX)

    window.setTimeout(() => {
      onComplete()
    }, 180)
  }

  const updatePosition = (clientX) => {
    const metrics = getMetrics()

    if (!metrics) {
      return
    }

    const offset = clientX - metrics.rect.left - 9
    const nextX = clampValue(offset, 0, metrics.maxX)
    setDragX(nextX)

    if (nextX >= metrics.maxX * 0.92) {
      finishSlide()
    }
  }

  const handlePointerDown = (event) => {
    if (isComplete) {
      return
    }

    setIsSliding(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!isSliding || isComplete) {
      return
    }

    updatePosition(event.clientX)
  }

  const handlePointerUp = () => {
    if (isComplete) {
      setIsSliding(false)
      return
    }

    setIsSliding(false)
    setDragX(0)
  }

  return (
    <section className="sprout-stage sprout-stage-ready">
      <div className="sprout-bg-blur sprout-bg-blur-left"></div>
      <div className="sprout-bg-blur sprout-bg-blur-right"></div>
      <div className="sprout-confetti" aria-hidden="true">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            key={index}
            className={`sprout-confetti-piece sprout-confetti-piece-${index % 6}`}
            style={{
              left: `${(index * 3.7) % 100}%`,
              top: `${(index * 7.3) % 70}%`,
              animationDelay: `${index * 90}ms`,
            }}
          ></span>
        ))}
      </div>

      <div className={`sprout-ready-content sprout-content-phase-${phase}`}>
        <h2 className="sprout-ready-title">Everything&apos;s ready</h2>
        <p className="sprout-ready-subtitle">
          Your onboarding is complete. Continue to open your personalized profile.
        </p>

        <div
          ref={trackRef}
          className={
            isComplete
              ? 'sprout-slider-shell sprout-slider-shell-complete'
              : 'sprout-slider-shell'
          }
        >
          <div
            className={
              isSliding
                ? 'sprout-slider-knob sprout-slider-knob-sliding'
                : 'sprout-slider-knob'
            }
            style={{ transform: `translate(${dragX}px, -50%)` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <span className="sprout-slider-arrow"></span>
          </div>
          <span className="sprout-slider-text">Slide to continue</span>
        </div>

        <p className="sprout-ready-note">
          Answers saved. Profile prepared. Experience ready.
        </p>

        <div className="sprout-ready-answer-row">
          {Object.values(answers).map((answer) => (
            <span key={answer} className="sprout-ready-chip">
              {answer}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OnboardingReadyPage
