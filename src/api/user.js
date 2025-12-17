import { api } from '.'

import axios from 'axios'

/**
 * ✅ 특정 사용자의 정보 조회 API (userCode 기반)
 * - 판매자 정보 조회에 사용
 */
export const getUserInfoByCode = (userCode) => {
  return axios.get('/api/users/', {
    headers: {
      'X-CODE': userCode,
    },
  })
}

/**
 * 기존 getUserIds 함수 (유지)
 */
export const getUserIds = async () => {
  try {
    const { data } = await api.get('/User/GetUserIds')
    return data.data
  } catch (error) {
    console.log(error)
  }
}

export const getUserInfo = () => {
  try {
    return api.get('/users/')
  } catch (error) {
    console.log(error)
  }
}
