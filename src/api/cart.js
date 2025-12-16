import { api } from "."


// 장바구니 조회
export const getCart = async () => {
    try {
        const { data } = await api.get('/commerce')
        console.log(data)
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
        console.log(data)
        return data
    } catch (error) {
        alert(error.response.data.msg.split(" : ")[1])
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
        await api.delete(`/commerce/cart/delete/${productCode}`)
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 삭제(선택)
export const deleteSelectCartItems = async (productCodes) => {
    try {
        await api.delete('/commerce/cart/deleteSel', {
            data: {
                "cartProductCodes": productCodes
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// 장바구니 상품 삭제(전체)
export const deleteAllCartItems = async () => {
    try {
        await api.delete('/commerce/cart/deleteAll')
    } catch (error) {
        console.log(error)
    }
}