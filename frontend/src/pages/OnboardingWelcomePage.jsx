function OnboardingWelcomePage({ userName, phase = 'enter' }) {
  return (
    <section className="sprout-stage sprout-stage-welcome">
      <div className="sprout-bg-blur sprout-bg-blur-left"></div>
      <div className="sprout-bg-blur sprout-bg-blur-right"></div>

      <div className={`sprout-welcome-lockup sprout-content-phase-${phase}`}>
        <div className="sprout-title-row">
          <h1 className="sprout-welcome-title">
            <span className="sprout-title-word">Welcome</span>
            <span className="sprout-title-word">to</span>
          </h1>
          <div className="authos-logo-lockup" aria-hidden="true">
            <span className="authos-logo-badge">A</span>
          </div>
          <h1 className="sprout-brand-title">
            <span className="sprout-title-word">Auth</span>
            <span className="sprout-title-word">OS</span>
          </h1>
        </div>

        <p className="sprout-welcome-copy">
          {userName ? `${userName}, ` : ''}
          let&apos;s set up your workspace in a few guided steps.
        </p>

        <div className="sprout-welcome-status">
          <span className="sprout-status-dot"></span>
          <span>Preparing your onboarding</span>
        </div>
      </div>
    </section>
  )
}

export default OnboardingWelcomePage
