// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

async function callApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // envoie les cookies Clerk
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw err
  }
  return res.json()
}

export async function getPrograms() {
  return callApi<any[]>('/api/programs')
}

export async function getProgram(id: string | number) {
  return callApi<any>(`/api/programs/${id}`)
}

export async function getArticles(search = '', date = '') {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (date) params.append('date', date)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return callApi<any[]>(`/api/articles${qs}`)
}

export async function getEvents(search = '', date = '', upcoming = true) {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (date) params.append('date', date)
  params.append('upcoming', `${upcoming}`)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return callApi<any[]>(`/api/events${qs}`)
}

export async function getVideos() {
  return callApi<any[]>('/api/videos')
}

// Rétrocompatibilité pour les imports en `import api from ...`
const api = {
  getPrograms,
  getProgram,
  getArticles,
  getEvents,
  getVideos,
}

export default api
