import { useEffect, useRef, useState } from 'react'
import { AUTH_MODES, GOOGLE_SCRIPT_ID } from '../constants/auth.constants'

function getGoogleInitKey(mode) {
  return `sproutos-google-init-${mode}`
}

function GoogleAuthButton({ mode, disabled, onCredential, onError }) {
  const buttonRef = useRef(null)
  const callbacksRef = useRef({ onCredential, onError })
  const [isReady, setIsReady] = useState(false)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isRegisterMode = mode === AUTH_MODES.REGISTER

  useEffect(() => {
    callbacksRef.current = { onCredential, onError }
  }, [onCredential, onError])

  useEffect(() => {
    if (!clientId) {
      return undefined
    }

    let cancelled = false

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) {
        return
      }

      const initKey = getGoogleInitKey(mode)

      if (!window[initKey]) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (!credential) {
              callbacksRef.current.onError?.('Google sign-in did not complete.')
              return
            }

            callbacksRef.current.onCredential(credential)
          },
        })
        window[initKey] = true
      }

      buttonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: isRegisterMode ? 'signup_with' : 'signin_with',
      })
      setIsReady(true)
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID)

    if (existingScript) {
      if (window.google?.accounts?.id) {
        initializeGoogle()
      } else {
        existingScript.addEventListener('load', initializeGoogle, { once: true })
      }

      return () => {
        cancelled = true
      }
    }

    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogle
    script.onerror = () => {
      if (!cancelled) {
        onError?.('Unable to load Google sign-in right now.')
      }
    }
    document.head.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [clientId, isRegisterMode, mode])

  if (!clientId) {
    return (
      <p className="auth-helper-copy">
        Add `VITE_GOOGLE_CLIENT_ID` to enable Google auth.
      </p>
    )
  }

  return (
    <div className="google-auth-wrap" aria-live="polite">
      <div
        ref={buttonRef}
        className={`google-auth-button-shell${disabled ? ' is-disabled' : ''}`}
      />
      {!isReady ? (
        <p className="auth-helper-copy">
          Preparing Google {isRegisterMode ? 'sign-up' : 'sign-in'}...
        </p>
      ) : null}
    </div>
  )
}

export default GoogleAuthButton
