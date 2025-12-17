/**
 * JWT 토큰을 디코딩하여 payload를 반환합니다.
 * @param {string} token - JWT 토큰
 * @returns {object|null} - 디코딩된 payload 또는 null
 */
export function decodeJWT(token) {
  try {
    if (!token) return null

    // Bearer 접두사 제거
    const actualToken = token.startsWith('Bearer ') ? token.substring(7) : token

    // JWT는 . 으로 구분된 3부분으로 구성: header.payload.signature
    const parts = actualToken.split('.')
    if (parts.length !== 3) {
      console.error('Invalid JWT format')
      return null
    }

    // payload는 두 번째 부분
    const payload = parts[1]

    // Base64 URL 디코딩
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

/**
 * JWT 토큰에서 userCode를 추출합니다.
 * @param {string} token - JWT 토큰
 * @returns {string|null} - userCode 또는 null
 */
export function getUserCodeFromToken(token) {
  const payload = decodeJWT(token)
  return payload?.userCode || null
}

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @param {string} token - JWT 토큰
 * @returns {boolean} - 만료 여부
 */
export function isTokenExpired(token) {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true

  const currentTime = Math.floor(Date.now() / 1000)
  return payload.exp < currentTime
}
