// ============================================================
// ✅ src/api/product.js 전체 교체
// ============================================================

import axios from 'axios'

/**
 * 상품 검색 API
 */
export const searchProducts = (params = {}) => {
  return axios.get('/api/products/search', {
    params: {
      keyword: params.keyword || null,
      categoryIds: params.categoryIds || null,
      minPrice: params.minPrice || null,
      maxPrice: params.maxPrice || null,
      sellerCode: params.sellerCode || null,
      productStatus: params.productStatus || null,
      sortBy: params.sortBy || 'createdAt',
      sortDirection: params.sortDirection || 'desc',
      page: params.page || 1,
      size: params.size || 10,
    },
  })
}

/**
 * ✅ 사용자 조회 기반 상품 추천 API (수정됨!)
 * - Gateway가 access 헤더를 받아서 X-CODE로 변환
 */
export const recommendByUserView = (size = 10) => {
  const accessToken = sessionStorage.getItem('accessToken')

  const headers = {}
  if (accessToken) {
    headers['access'] = accessToken // ✅ access 헤더 (Gateway가 X-CODE로 변환)
  }

  return axios.get('/api/products/recommend/user-view', {
    params: { size },
    headers,
  })
}

/**
 * 상품 상세 기반 상품 추천 API
 */
export const recommendByProductDetail = (productCode, size = 10) => {
  return axios.get(`/api/products/recommend/${productCode}`, {
    params: { size },
  })
}

/**
 * ✅ 검색어 자동완성 API
 */
export const suggestCompletion = (params = {}) => {
  const { signal } = params

  return axios.get('/api/products/suggest/completion', {
    params: {
      keyword: params.keyword || '',
      size: params.size || 5,
      categoryId: params.categoryId ?? null,
      includeSold: params.includeSold ?? false,
    },
    signal,
  })
}

/**
 * 연관 검색어 추천 API
 */
export const suggestRelated = (params = {}) => {
  return axios.get('/api/products/suggest/related', {
    params: {
      keyword: params.keyword || '',
      size: params.size || 5,
    },
  })
}

/**
 * ✅ 상품 상세 조회 API (수정됨!)
 * - accessToken 키로 변경
 */
export const getProductDetail = (productCode) => {
  const accessToken = sessionStorage.getItem('accessToken') // ✅ accessToken

  const headers = {}
  if (accessToken) {
    headers['access'] = accessToken // ✅ access 헤더로 전달
  }

  return axios.get(`/api/products/${productCode}`, {
    headers,
  })
}
