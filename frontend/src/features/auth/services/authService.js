const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const { method = 'GET', body, token } = options

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const authService = {
  register(payload) {
    return request('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
  },
  login(payload) {
    return request('/api/auth/login', {
      method: 'POST',
      body: payload,
    })
  },
  getProfile(token) {
    return request('/api/auth/profile', {
      token,
    })
  },
}
