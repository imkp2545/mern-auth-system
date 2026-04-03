function OnboardingQuestionPage({
  step,
  stepIndex,
  totalSteps,
  answer,
  onSelect,
  phase = 'enter',
}) {
  return (
    <section className="sprout-stage sprout-stage-question">
      <div className="sprout-bg-blur sprout-bg-blur-left"></div>
      <div className="sprout-bg-blur sprout-bg-blur-right"></div>

      <div className="sprout-question-layout">
        <div className={`sprout-question-copy sprout-content-phase-${phase}`}>
          <span className="sprout-stage-label">
            {stepIndex + 1}/{totalSteps}
          </span>
          <h2 className="sprout-question-title">{step.title}</h2>
          <p className="sprout-question-subtitle">{step.description}</p>
        </div>

        <div className={`sprout-question-actions sprout-content-phase-${phase}`}>
          <div className="sprout-pill-grid">
            {step.options.map((option) => (
              <button
                key={option}
                type="button"
                className={
                  answer === option
                    ? 'sprout-option-pill sprout-option-pill-selected'
                    : 'sprout-option-pill'
                }
                onClick={() => onSelect(step.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OnboardingQuestionPage
