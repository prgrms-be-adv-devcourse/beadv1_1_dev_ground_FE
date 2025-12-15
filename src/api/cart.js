import { api } from "."


// 장바구니 조회
export const getCart = async () => {
    try {
        const { data } = await api.get('/commerce')
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 추가
export const addCartItem = async (productCode) => {
    try {
        const { data } = await api.post('/commerce', {
            "productCode": productCode
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 추천 상품
export const getRecommendCartItems = async () => {
    try {
        const { data } = await api.get('/commerce/cart/recommendProduct')
        return data.data; 
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 삭제(개별)
export const deleteCartItem = async (productCode) => {
    try {
        const { data } = await api.delete(`/commerce/cart/delete/${productCode}`)
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 삭제(선택)
export const deleteSelectCartItems = async (productCodes) => {
    try {
        const { data } = await api.delete('/commerce/cart/deleteSel', {
            "cartProductCodes": productCodes
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 삭제(전체)
export const deleteAllCartItems = async () => {
    try {
        const { data } = await api.delete('/commerce/cart/deleteAll')
        return data.data
    } catch (error) {
        console.log(error)
    }
}