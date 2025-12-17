import axios from 'axios'

const openApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const accessToken =
    sessionStorage.getItem('accessToken') ||
    // localStorage.getItem('accessToken') ||
    sessionStorage.getItem('access')
    // localStorage.getItem('access')

  if (accessToken) {
    config.headers['access'] = accessToken
  }

  return config
})

export { api, openApi }
