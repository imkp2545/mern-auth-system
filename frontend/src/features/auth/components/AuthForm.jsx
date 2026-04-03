import { useState } from 'react'
import { AUTH_MODES } from '../constants/auth.constants'
import StatusBanner from './StatusBanner'

function AuthForm({
  mode,
  forms,
  status,
  isSubmitting,
  onModeChange,
  onFieldChange,
  onSubmit,
}) {
  const activeForm = forms[mode]
  const isRegisterMode = mode === AUTH_MODES.REGISTER
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <article className="panel auth-panel">
      <div className="auth-topbar">
        <button type="button" className="back-chip" aria-label="Back">
          &larr;
        </button>
        <p className="auth-switch-copy">
          {isRegisterMode ? 'Already a member?' : 'New here?'}{' '}
          <button
            type="button"
            className="inline-switch"
            onClick={() =>
              onModeChange(isRegisterMode ? AUTH_MODES.LOGIN : AUTH_MODES.REGISTER)
            }
          >
            {isRegisterMode ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <div className="auth-card-copy">
        <p className="section-kicker">{isRegisterMode ? 'Create account' : 'Sign in'}</p>
        <h2>{isRegisterMode ? 'Sign Up' : 'Login'}</h2>
        <p className="auth-card-text">
          {isRegisterMode
            ? 'Secure your account with a clean, modern signup experience.'
            : 'Welcome back. Continue to your profile with your email and password.'}
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegisterMode ? (
          <label>
            <span>Name</span>
            <input
              type="text"
              placeholder="Enter your name"
              value={activeForm.name}
              onChange={(event) =>
                onFieldChange(AUTH_MODES.REGISTER, 'name', event.target.value)
              }
              required
            />
          </label>
        ) : null}

        <label>
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={activeForm.email}
            onChange={(event) => onFieldChange(mode, 'email', event.target.value)}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={activeForm.password}
              onChange={(event) => onFieldChange(mode, 'password', event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Please wait...'
            : isRegisterMode
              ? 'Create account'
              : 'Login'}
        </button>
      </form>

      <div className="auth-status-wrap">
        <StatusBanner status={status} />
      </div>
    </article>
  )
}

export default AuthForm
