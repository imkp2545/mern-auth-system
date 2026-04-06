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
    throw new Error(data.message || 'Workspace request failed')
  }

  return data
}

export const workspaceService = {
  getWorkspaceProfile(token) {
    return request('/api/users/me/workspace-profile', { token })
  },
  saveWorkspaceProfile(token, profile) {
    return request('/api/users/me/workspace-profile', {
      method: 'PUT',
      token,
      body: profile,
    })
  },
}
