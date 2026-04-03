import { useState } from 'react'
import AuthForm from '../features/auth/components/AuthForm'
import ProfilePanel from '../features/auth/components/ProfilePanel'
import { AUTH_MODES } from '../features/auth/constants/auth.constants'
import { useAuth } from '../features/auth/hooks/useAuth'
import './AuthPage.css'

function AuthPage() {
  const {
    mode,
    setMode,
    forms,
    authUser,
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

  return (
    <main className="auth-shell">
      <header className="navbar">
        <div className="brand-block">
          <div>
            <p className="brand-name">AuthSpace</p>
            <p className="brand-tag">Simple and secure account experience</p>
          </div>
        </div>

        <nav className="nav-actions">
          {!isAuthenticated ? (
            <>
              <button
                type="button"
                className={mode === 'login' ? 'nav-button active' : 'nav-button'}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'nav-button active' : 'nav-button'}
                onClick={() => setMode('register')}
              >
                Signup
              </button>
            </>
          ) : (
            <button type="button" className="nav-button active" onClick={logout}>
              Logout
            </button>
          )}
        </nav>
      </header>

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
        <section className="workspace profile-layout">
          <div className="profile-side-copy">
            <p className="eyebrow">Account Area</p>
            <h1>Manage your account with clarity and confidence.</h1>
            <p className="lede">
              This screen gives the user a more professional account summary with
              cleaner hierarchy, better spacing, and clearer actions.
            </p>

            <div className="profile-side-points">
              <div className="side-point">
                <span className="summary-label">Overview</span>
                <strong>Quick access to core account details</strong>
              </div>
              <div className="side-point">
                <span className="summary-label">Security</span>
                <strong>Protected route status and session awareness</strong>
              </div>
            </div>
          </div>

          <ProfilePanel
            authUser={authUser}
            profile={profile}
            isLoadingProfile={isLoadingProfile}
            onFetchProfile={fetchProfile}
            onLogout={logout}
          />
        </section>
      )}
    </main>
  )
}

export default AuthPage
