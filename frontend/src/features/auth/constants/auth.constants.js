export const AUTH_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
}

export const AUTH_STORAGE_KEY = 'auth-app-user'
export const GOOGLE_SCRIPT_ID = 'google-identity-services'

export const INITIAL_FORMS = {
  [AUTH_MODES.LOGIN]: {
    email: '',
    password: '',
  },
  [AUTH_MODES.REGISTER]: {
    name: '',
    email: '',
    password: '',
  },
}
