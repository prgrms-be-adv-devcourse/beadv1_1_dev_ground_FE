import { api } from '@/api/stompIndex'

const resolveUserCode = () => {
  const stored =
    sessionStorage.getItem('X-CODE') ||
    sessionStorage.getItem('userCode')
  if (stored) return stored

  const accessToken =
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('access') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('access')
  if (!accessToken) return ''

  try {
    const payload = accessToken.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded))
    return decoded?.userCode || ''
  } catch (e) {
    console.warn('userCode 파싱 실패', e)
    return ''
  }
}

export const createOrGetChatRoom = (payload = {}) => {
  const accessToken = sessionStorage.getItem('accessToken')
  const headers = {}

  if (accessToken) headers['access'] = accessToken
  const userCode = resolveUserCode()
  if (userCode) headers['X-CODE'] = userCode

  return api.post('/chat/rooms', payload, { headers })
}
