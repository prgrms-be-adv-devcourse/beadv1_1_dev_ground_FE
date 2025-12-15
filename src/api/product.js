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
 * 사용자 조회 기반 상품 추천 API
 */
export const recommendByUserView = (userCode = null, size = 10) => {
  const headers = {}
  if (userCode) {
    headers['X-CODE'] = userCode
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
 * 검색어 자동완성 API
 */
export const suggestCompletion = (params) => {
  return axios.get(`api/products/suggest/completion?keyword=${params.keyword}`, {
    // params: {
    //   prefix: params.prefix || '',
    //   size: params.size || 3,
    // },
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
