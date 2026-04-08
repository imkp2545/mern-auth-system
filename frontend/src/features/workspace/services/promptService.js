const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, { method = 'GET', token, body } = {}) {
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
    throw new Error(data.message || 'Prompt request failed')
  }

  return data
}

export const promptService = {
  getPromptHistory(token) {
    return request('/api/users/me/prompt-history', { token })
  },
  generatePrompt(token, payload) {
    return request('/api/users/me/prompt-history', {
      method: 'POST',
      token,
      body: payload,
    })
  },
}
