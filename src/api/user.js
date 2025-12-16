// ============================================================
// ✅ src/api/user.js 전체 교체
// ============================================================

import axios from 'axios'

/**
 * ✅ 사용자 정보 조회 API (수정됨!)
 * - accessToken 키로 변경
 */
export const getUserInfo = () => {
  const accessToken = sessionStorage.getItem('accessToken') // ✅ accessToken

  const headers = {}
  if (accessToken) {
    headers['access'] = accessToken // ✅ access 헤더로 전달
  }

  return axios.get('/api/users/', {
    headers,
  })
}

/**
 * 기존 getUserIds 함수 (유지)
 */
export const getUserIds = async () => {
  try {
    const { data } = await axios.get('/User/GetUserIds')
    return data.data
  } catch (error) {
    console.log(error)
  }
}
