import { useEffect, useState } from 'react'
import {
  AUTH_MODES,
  AUTH_STORAGE_KEY,
  INITIAL_FORMS,
} from '../constants/auth.constants'
import { authService } from '../services/authService'

const LAST_AUTH_MODE_KEY = 'auth-app-last-auth-mode'

function getStoredUser() {
  const savedUser = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser)
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function useAuth() {
  const [mode, setMode] = useState(AUTH_MODES.LOGIN)
  const [forms, setForms] = useState(INITIAL_FORMS)
  const [authUser, setAuthUser] = useState(getStoredUser)
  const [lastAuthMode, setLastAuthMode] = useState(
    () => localStorage.getItem(LAST_AUTH_MODE_KEY) || AUTH_MODES.LOGIN,
  )
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState({
    type: 'idle',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  useEffect(() => {
    if (authUser?.token) {
      fetchProfile(authUser)
    }
  }, [])

  const updateField = (formName, field, value) => {
    setForms((current) => ({
      ...current,
      [formName]: {
        ...current[formName],
        [field]: value,
      },
    }))
  }

  const persistUser = (user) => {
    setAuthUser(user)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }

  const syncAuthUser = (updates) => {
    setAuthUser((current) => {
      const nextUser = {
        ...current,
        ...updates,
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
      return nextUser
    })
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(LAST_AUTH_MODE_KEY)
    setAuthUser(null)
    setLastAuthMode(AUTH_MODES.LOGIN)
    setProfile(null)
    setStatus({
      type: 'idle',
      message: 'You are logged out. Sign in again to call the protected API.',
    })
  }

  const fetchProfile = async (user = authUser, options = {}) => {
    const { shouldUpdateStatus = true } = options

    if (!user?.token) {
      return
    }

    setIsLoadingProfile(true)

    try {
      const data = await authService.getProfile(user.token)
      setProfile(data)
      if (data?.user) {
        syncAuthUser(data.user)
      }
      if (shouldUpdateStatus) {
        setStatus({
          type: 'success',
          message: data.message,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch profile'

      setProfile(null)
      setStatus({
        type: 'error',
        message,
      })

      if (message === 'Token failed' || message === 'No token, not authorized') {
        logout()
      }
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const submitAuth = async () => {
    const isRegisterMode = mode === AUTH_MODES.REGISTER
    const action = isRegisterMode ? authService.register : authService.login

    setIsSubmitting(true)
    setStatus({
      type: 'pending',
      message: isRegisterMode ? 'Creating your account...' : 'Signing you in...',
    })

    try {
      const user = await action(forms[mode])
      persistUser(user)
      localStorage.setItem(LAST_AUTH_MODE_KEY, mode)
      setLastAuthMode(mode)
      setForms(INITIAL_FORMS)
      setMode(AUTH_MODES.LOGIN)
      setStatus({
        type: 'success',
        message: isRegisterMode
          ? 'Registration successful. Your token has been stored.'
          : 'Login successful. Your token has been stored.',
      })
      await fetchProfile(user, { shouldUpdateStatus: false })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Authentication failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitGoogleAuth = async (credential) => {
    if (!credential) {
      setStatus({
        type: 'error',
        message: 'Google sign-in did not return a credential.',
      })
      return
    }

    const isRegisterMode = mode === AUTH_MODES.REGISTER

    setIsSubmitting(true)
    setStatus({
      type: 'pending',
      message: isRegisterMode
        ? 'Creating your account with Google...'
        : 'Signing you in with Google...',
    })

    try {
      const user = await authService.googleAuth({
        credential,
        mode,
      })
      persistUser(user)
      const resolvedAuthMode = user.isNewGoogleUser ? AUTH_MODES.REGISTER : mode
      localStorage.setItem(LAST_AUTH_MODE_KEY, resolvedAuthMode)
      setLastAuthMode(resolvedAuthMode)
      setForms(INITIAL_FORMS)
      setMode(AUTH_MODES.LOGIN)
      setStatus({
        type: 'success',
        message:
          user.message ||
          (isRegisterMode
            ? 'Google sign-up successful.'
            : 'Google login successful.'),
      })
      await fetchProfile(user, { shouldUpdateStatus: false })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Google authentication failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reportGoogleAuthError = (message) => {
    setStatus({
      type: 'error',
      message: message || 'Google authentication failed',
    })
  }

  return {
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
    submitGoogleAuth,
    reportGoogleAuthError,
    fetchProfile,
    syncAuthUser,
    logout,
  }
}
