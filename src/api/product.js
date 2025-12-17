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
 * - 쿼리스트링 직접 조립 ❌
 * - axios params ✅ (자동 인코딩)
 * - 앞에 '/' 반드시 ✅
 */
export const suggestCompletion = (params = {}) => {
  const { signal } = params

  return axios.get('/api/products/suggest/completion', {
    params: {
      keyword: params.keyword || '', // ✅ [중요] 백엔드 파라미터명 keyword
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
 * 상품 상세 조회
 */
export const getProductDetail = (productCode) => {
  if (!productCode) throw new Error('productCode is required')

  const accessToken = sessionStorage.getItem("accessToken")

  const headers = {}
  if (accessToken) {
    headers['access'] = accessToken
  }

  return axios.get(`/api/products/${productCode}`, {headers})
}

export const getUserProducts = ({ page = 1, size = 10 } = {}) => {
  const accessToken = sessionStorage.getItem('accessToken') // ✅ accessToken

  const headers = {}
  if (accessToken) {
    headers['access'] = accessToken // ✅ access 헤더로 전달
  }

  return axios.get('/api/products/user', {
    params: { page, size },
    headers,
  })
}

/**
 * 상품 등록 API
 */
export const registProduct = (data) => {
  const accessToken = sessionStorage.getItem('accessToken')

  return axios.post('/api/products', data, {
    headers: {
      access: accessToken,
    },
  })
}

const s3Axios = axios.create({
  timeout: 60_000,
  withCredentials: false,
})

export const uploadImageToS3 = async (presignedUrl, file) => {
  const res = await s3Axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  })

  return res
}

export const uploadImagesToS3 = async (presignedUrls, files) => {
  if (!Array.isArray(presignedUrls) || !Array.isArray(files)) return []

  await Promise.all(files.map((file, idx) => uploadImageToS3(presignedUrls[idx], file)))

  return presignedUrls.map((u) => u.split('?')[0])
}

/**
 * 상품 이미지 URL 저장 API
 * @param {string} productCode - 상품 코드
 * @param {string[]} urls - S3 이미지 URL 목록
 */
export const saveProductImages = (productCode, urls) => {
  const accessToken = sessionStorage.getItem('accessToken')

  return axios.post(
    `/api/products/${productCode}/images/upload`,
    { urls },
    {
      headers: {
        access: accessToken,
      },
    },
  )
}

/**
 * 상품 수정 API
 * @param {string} productCode - 상품 코드
 * @param {object} payload - UpdateProductRequest
 */
export const updateProduct = (productCode, payload) => {
  const accessToken = sessionStorage.getItem('accessToken')

  return axios.patch(`/api/products/${productCode}`, payload, {
    headers: {
      access: accessToken,
    },
  })
}

/**
 * 상품 삭제 API
 * @param {string} productCode - 상품 코드
 */
export const deleteProduct = (productCode) => {
  const accessToken = sessionStorage.getItem('accessToken')

  if (!accessToken) {
    throw new Error('로그인이 필요합니다.')
  }

  return axios.delete(`/api/products/${productCode}`, {
    headers: {
      access: accessToken,
    },
  })
}
