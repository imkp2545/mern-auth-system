import { useState } from 'react'
import AuthForm from '../features/auth/components/AuthForm'
import { AUTH_MODES } from '../features/auth/constants/auth.constants'
import { useAuth } from '../features/auth/hooks/useAuth'
import OnboardingFlowPage from './OnboardingFlowPage'
import WorkspacePage from './WorkspacePage'
import './AuthPage.css'

const ONBOARDING_STORAGE_KEY = 'auth-app-onboarding-complete'

function AuthPage() {
  const {
    mode,
    setMode,
    forms,
    authUser,
    lastAuthMode,
    status,
    isSubmitting,
    updateField,
    submitAuth,
    submitGoogleAuth,
    reportGoogleAuthError,
    syncAuthUser,
    logout,
  } = useAuth()

  const isAuthenticated = Boolean(authUser?.token)
  const isRegisterMode = mode === AUTH_MODES.REGISTER
  const [onboardingStage, setOnboardingStage] = useState(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
    return hasCompleted ? 'workspace' : 'greeting'
  })
  const hasOnboardingCompleted = onboardingStage === 'workspace'
  const shouldShowOnboarding =
    isAuthenticated &&
    lastAuthMode === AUTH_MODES.REGISTER &&
    !hasOnboardingCompleted

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
    setOnboardingStage('workspace')
  }

  const handleLogout = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setOnboardingStage('greeting')
    logout()
  }

  return (
    <>
      {!isAuthenticated ? (
        <main className="auth-shell">
          <section className="workspace auth-layout">
            <div
              className={
                isRegisterMode
                  ? 'hero-copy hero-copy-signup'
                  : 'hero-copy hero-copy-login'
              }
            >
              <div className="sprout-bg-blur sprout-bg-blur-left auth-hero-blur-left"></div>
              <div className="sprout-bg-blur sprout-bg-blur-right auth-hero-blur-right"></div>

              <div className="auth-hero-copy-block">
                <span className="auth-hero-step">
                  {isRegisterMode ? 'Join SproutOS' : 'Welcome back'}
                </span>
                <h1 className="auth-hero-title">
                  {isRegisterMode
                    ? 'Create your account and step into a calmer workflow.'
                    : 'Sign in and pick up your workspace right where you left it.'}
                </h1>
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
                onGoogleAuth={submitGoogleAuth}
                onGoogleError={reportGoogleAuthError}
              />
            </div>
          </section>
        </main>
      ) : (
        <>
          {shouldShowOnboarding ? (
            <OnboardingFlowPage
              userName={authUser?.name}
              onComplete={finishOnboarding}
            />
          ) : null}

          {!shouldShowOnboarding ? (
            <WorkspacePage
              authUser={authUser}
              onUserSync={syncAuthUser}
              onLogout={handleLogout}
            />
          ) : null}
        </>
      )}
    </>
  )
}

export default AuthPage
