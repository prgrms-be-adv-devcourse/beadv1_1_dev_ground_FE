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

// ✅ [변경] 매 요청마다 최신 X-CODE 주입
api.interceptors.request.use((config) => {
  const code = sessionStorage.getItem('accessToken')
  if (code) {
    config.headers['access'] = code
  } else {
    delete config.headers['access']
  }
  return config
})

export { api, openApi }