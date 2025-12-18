import { api } from "."

// 주문 조회
export const getOrders = async (payload) => {
    try {
        const { data } = await api.get(`/commerce/order?page=${payload.page}&size=${payload.size}&sort=${payload.sort}&direction=${payload.direction}&orderStatus=${payload.orderStatus}`)
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 주문 생성(단건)
export const createOrder = async (productCode) => {
    try {
        await api.post(`commerce/order/${productCode}`)
    } catch (error) {
        console.log(error)
    }
}

// 주문 생성(다건)
export const createOrders = async (productCodes) => {
    try {
        const { data } = await api.post('commerce/order', {
            "productCodes": productCodes
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 주문 상세
export const getOrderDetail = async (orderCode) => {
    try {
        const { data } = await api.get(`commerce/order/${orderCode}`)
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 주문 취소
export const cancelOrder = async (orderCode) => {
    try {
        const { data } = await api.patch(`commerce/order/${orderCode}`)
        return data.data
    } catch (error) {
        console.log(error)
    }
}

// 주문 구매 확정
export const confirmOrder = async (orderCode) => {
    try {
        const { data } = await api.patch(`commerce/order/${orderCode}`)
        return data.data
    } catch (error) {
        console.log(error)
    }
}

