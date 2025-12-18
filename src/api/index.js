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

const resolveAccessToken = () =>
  sessionStorage.getItem('accessToken') || sessionStorage.getItem('access')

const resolveUserCode = (accessToken) => {
  const storedCode = sessionStorage.getItem('X-CODE') || sessionStorage.getItem('userCode')

  if (storedCode) return storedCode
  if (!accessToken) return ''

  try {
    const payload = accessToken.split('.')[1]
    const decoded = payload ? JSON.parse(atob(payload)) : {}
    return decoded?.userCode || decoded?.code || ''
  } catch (e) {
    console.warn('액세스 토큰에서 userCode 추출 실패', e)
    return ''
  }
}

api.interceptors.request.use((config) => {
  const accessToken = resolveAccessToken()
  const userCode = resolveUserCode(accessToken)

  config.headers = config.headers || {}

  if (accessToken) {
    config.headers['access'] = accessToken
  } else {
    delete config.headers['access']
  }

  // chat(STOMP) 쪽은 X-CODE를 기대하므로, 이미 설정되어 있지 않으면 같이 채워준다.
  if (userCode && !config.headers['X-CODE']) {
    config.headers['X-CODE'] = userCode
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

      sessionStorage.removeItem('accessToken')

      // ✅ 재발급 API 호출 (refresh 토큰은 HttpOnly 쿠키로 자동 포함)
      const refreshRes = await openApi.post('/users/reissue')

      // 서버가 새 access를 body로 주든 header로 주든, 그 방식에 맞게 꺼내서 저장
      const newAccess =
        refreshRes.headers?.access || refreshRes.data?.access || refreshRes.data?.accessToken

      if (!newAccess) throw err

      sessionStorage.setItem('accessToken', newAccess)

      // 원래 요청에 새 토큰 붙여서 재시도
      config.headers = config.headers || {}
      config.headers['access'] = newAccess

      const userCode = resolveUserCode(newAccess)
      if (userCode) config.headers['X-CODE'] = userCode

      return api(config)
    }
    throw err
  },
)

export { api, openApi }
