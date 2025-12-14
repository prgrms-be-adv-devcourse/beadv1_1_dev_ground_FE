import api from '.'

export const getUserIds = async () => {
  try {
    const { data } = await api.get('/User/GetUserIds')
    return data.data
  } catch (error) {
    console.log(error)
  }
}

// 장바구니 조회
export const getCart = async () => {
    try {
        const { data } = await api.get('/commerce/cart')
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 추가
export const addCartItem = async (productCode) => {
    try {
        const { data } = await api.post('/commerce/cart', {
            "productCode": productCode
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}