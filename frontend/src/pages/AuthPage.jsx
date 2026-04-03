import { useState } from 'react'
import AuthForm from '../features/auth/components/AuthForm'
import ProfilePanel from '../features/auth/components/ProfilePanel'
import { AUTH_MODES } from '../features/auth/constants/auth.constants'
import { useAuth } from '../features/auth/hooks/useAuth'
import OnboardingFlowPage from './OnboardingFlowPage'
import './AuthPage.css'

const ONBOARDING_STORAGE_KEY = 'auth-app-onboarding-complete'

function AuthPage() {
  const {
    mode,
    setMode,
    forms,
    authUser,
    lastAuthMode,
    profile,
    status,
    isSubmitting,
    isLoadingProfile,
    updateField,
    submitAuth,
    fetchProfile,
    logout,
  } = useAuth()

  const isAuthenticated = Boolean(authUser?.token)
  const isRegisterMode = mode === AUTH_MODES.REGISTER
  const [onboardingStage, setOnboardingStage] = useState(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
    return hasCompleted ? 'profile' : 'greeting'
  })
  const [heroPointerStyle, setHeroPointerStyle] = useState({
    '--mx': '50%',
    '--my': '50%',
    '--tilt-x': '0deg',
    '--tilt-y': '0deg',
  })

  const handleHeroMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const y = event.clientY - bounds.top
    const percentX = (x / bounds.width) * 100
    const percentY = (y / bounds.height) * 100
    const tiltY = ((percentX - 50) / 50) * 5
    const tiltX = ((50 - percentY) / 50) * 5

    setHeroPointerStyle({
      '--mx': `${percentX}%`,
      '--my': `${percentY}%`,
      '--tilt-x': `${tiltX.toFixed(2)}deg`,
      '--tilt-y': `${tiltY.toFixed(2)}deg`,
    })
  }

  const resetHeroMove = () => {
    setHeroPointerStyle({
      '--mx': '50%',
      '--my': '50%',
      '--tilt-x': '0deg',
      '--tilt-y': '0deg',
    })
  }

  const hasOnboardingCompleted = onboardingStage === 'profile'
  const shouldShowOnboarding =
    isAuthenticated &&
    lastAuthMode === AUTH_MODES.REGISTER &&
    !hasOnboardingCompleted

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setOnboardingStage('profile')
  }

  const restartOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setOnboardingStage('greeting')
  }

  const handleLogout = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setOnboardingStage('greeting')
    logout()
  }

  return (
    <main className="auth-shell">
      {isAuthenticated && !shouldShowOnboarding ? (
        <header className="navbar">
          <div className="brand-block">
            <div>
              <p className="brand-name">AuthSpace</p>
              <p className="brand-tag">Simple and secure account experience</p>
            </div>
          </div>

          <nav className="nav-actions">
            <button type="button" className="nav-button active" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </header>
      ) : null}

      {!isAuthenticated ? (
        <section className="workspace auth-layout">
          <div
            className={
              isRegisterMode
                ? 'hero-copy hero-copy-signup'
                : 'hero-copy hero-copy-login'
            }
            style={heroPointerStyle}
            onMouseMove={handleHeroMove}
            onMouseLeave={resetHeroMove}
          >
            <div className="visual-orb orb-one"></div>
            <div className="visual-orb orb-two"></div>
            <div className="hero-glow hero-glow-one"></div>
            <div className="hero-glow hero-glow-two"></div>
            <div className="hero-grid"></div>
            <div className="visual-card greeting-card">
              <p className="mini-label">
                {isRegisterMode ? 'Create your account' : 'Welcome back'}
              </p>
              <h3>
                {isRegisterMode
                  ? 'Start your journey with a secure and modern signup experience.'
                  : 'Sign in to continue to your account and access your profile.'}
              </h3>
              <p>
                {isRegisterMode
                  ? 'Set up your details, create your account, and move into the app with confidence.'
                  : 'Access your workspace quickly with a clean login flow designed for returning users.'}
              </p>
            </div>

            <div className="hero-message-stack">
              <div className="visual-card message-chip">
                <span className="chip-dot"></span>
                <p>{isRegisterMode ? 'New account ready to begin' : 'Secure login session available'}</p>
              </div>
              <div className="visual-card message-chip secondary">
                <span className="chip-dot"></span>
                <p>{isRegisterMode ? 'Simple onboarding, clear next steps' : 'Protected access with account continuity'}</p>
              </div>
            </div>
          </div>

          <div className="stack">
            <AuthForm
              mode={mode}
              forms={forms}
              status={status}
              isSubmitting={isSubmitting}
              onModeChange={setMode}
              onFieldChange={updateField}
              onSubmit={submitAuth}
            />
          </div>
        </section>
      ) : (
        <>
          {shouldShowOnboarding ? (
            <OnboardingFlowPage
              userName={authUser?.name}
              onComplete={finishOnboarding}
            />
          ) : null}

          {!shouldShowOnboarding ? (
            <section className="workspace profile-layout">
              <div className="profile-side-copy">
                <p className="eyebrow">Account Area</p>
                <h1>Manage your account with clarity and confidence.</h1>
                <p className="lede">
                  You have completed onboarding and landed on the personalized
                  profile area with the same polished visual direction.
                </p>

                <div className="profile-side-points">
                  <div className="side-point">
                    <span className="summary-label">Onboarding</span>
                    <strong>Completed with five guided responses</strong>
                  </div>
                  <div className="side-point">
                    <span className="summary-label">Experience</span>
                    <strong>Greeting, questions, ready screen, then profile</strong>
                  </div>
                </div>

                {lastAuthMode === AUTH_MODES.REGISTER ? (
                  <button
                    type="button"
                    className="profile-button profile-button-secondary profile-restart-button"
                    onClick={restartOnboarding}
                  >
                    Replay onboarding
                  </button>
                ) : null}
              </div>

              <ProfilePanel
                authUser={authUser}
                profile={profile}
                isLoadingProfile={isLoadingProfile}
                onFetchProfile={fetchProfile}
                onLogout={handleLogout}
              />
            </section>
          ) : null}
        </>
      )}
    </main>
  )
}

export default AuthPage
