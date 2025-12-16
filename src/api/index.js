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
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('access') ||
    localStorage.getItem('access')

  if (accessToken) {
    config.headers['access'] = accessToken
  }

  return config
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

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { response, config } = err
    if (!response) throw err

    if (response.status === 401 && !config._retry) {
      config._retry = true

      sessionStorage.removeItem('accessToken');
      // ✅ 재발급 API 호출 (refresh 토큰은 HttpOnly 쿠키로 자동 포함)
      const refreshRes = await api.post('/users/reissue');
      // 서버가 새 access를 body로 주든 header로 주든, 그 방식에 맞게 꺼내서 저장
      const newAccess = refreshRes.headers?.access;
      console.log(refreshRes);
      sessionStorage.setItem('accessToken', newAccess);

      // 원래 요청에 새 토큰 붙여서 재시도
      config.headers['access'] = newAccess;
      return api(config);
    }
    throw err
  },
)

export { api, openApi }
