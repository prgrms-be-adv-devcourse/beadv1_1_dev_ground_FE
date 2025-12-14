import axios from './index'

/**
 * 상품 검색 API
 */
export const searchProducts = (params = {}) => {
  return axios.get('/products/search', {
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

  return axios.get('/products/recommend/user-view', {
    params: { size },
    headers,
  })
}

/**
 * 상품 상세 기반 상품 추천 API
 */
export const recommendByProductDetail = (productCode, size = 10) => {
  return axios.get(`/products/recommend/${productCode}`, {
    params: { size },
  })
}

/**
 * 검색어 자동완성 API
 */
export const suggestCompletion = (params = {}) => {
  return axios.get('/products/suggest/completion', {
    params: {
      prefix: params.prefix || '',
      size: params.size || 3,
    },
  })
}
