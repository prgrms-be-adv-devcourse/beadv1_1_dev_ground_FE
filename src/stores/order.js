import { getOrders } from "@/api/order";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrderStore = defineStore('order', () => {
    const count = ref({
        All: 0,
        Paid: 0,
        StartDelivery: 0,
        Delivered: 0,
        Confirmed: 0,
        Cancelled: 0
    })

    const orderList = ref([])
    const paidOrderList = ref([])
    const deliveryOrderList = ref([])
    const deliveredOrderList = ref([])
    const confirmedOrderList = ref([])
    const cancelledOrderList = ref([])

    const getAllOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "" }
            const data = await getOrders(params)
            orderList.value = data
            count.value.All = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getPaidOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "PAID" }
            const data = await getOrders(params)
            paidOrderList.value = data
            count.value.Paid = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getDeliveryOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "START_DELIVERY" }
            const data = await getOrders(params)
            deliveryOrderList.value = data
            count.value.StartDelivery = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getDeliveredOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "DELIVERED" }
            const data = await getOrders(params)
            deliveredOrderList.value = data
            count.value.Delivered = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getConfirmedOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "CONFIRMED" }
            const data = await getOrders(params)
            confirmedOrderList.value = data
            count.value.Confirmed = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getCancelledOrderList = async (payload) => {
        try {
            const params = { ...payload, orderStatus: "CANCELLED" }
            const data = await getOrders(params)
            cancelledOrderList.value = data
            count.value.Cancelled = data.totalItems || 0
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const init = async (payload) => {
        await getAllOrderList(payload)
        await getPaidOrderList(payload)
        await getDeliveryOrderList(payload)
        await getDeliveredOrderList(payload)
        await getConfirmedOrderList(payload)
        await getCancelledOrderList(payload)
    }

    return {
        count,
        orderList,
        paidOrderList,
        deliveryOrderList,
        deliveredOrderList,
        confirmedOrderList,
        cancelledOrderList,
        getAllOrderList,
        getPaidOrderList,
        getDeliveryOrderList,
        getDeliveredOrderList,
        getConfirmedOrderList,
        getCancelledOrderList,
        init
    }
})