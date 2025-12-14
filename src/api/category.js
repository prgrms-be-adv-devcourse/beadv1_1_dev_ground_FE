import axios from './index'

/**
 * 최상위 카테고리 조회 API
 */
export const getRootCategories = () => {
  return axios.get('/categories')
}

/**
 * 하위 카테고리 조회 API
 */
export const getChildCategories = (parentId) => {
  return axios.get(`/categories/${parentId}/children`)
}
