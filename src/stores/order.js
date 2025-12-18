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
            payload.orderStatus = "All"
            const data = await getOrders(payload)
            orderList.value = data
            count.value.All = data.length
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getPaidOrderList = async (payload) => {
        try {
            payload.orderStatus = "Paid"
            const data = await getOrders(payload)
            paidOrderList.value = data
            count.value.Paid = data.length
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getDeliveryOrderList = async (payload) => {
        try {
            payload.orderStatus = "StartDelivery"
            const data = await getOrders(payload)
            deliveryOrderList.value = data
            count.value.StartDelivery = data.length
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getDeliveredOrderList = async (payload) => {
        try {
            payload.orderStatus = "Delivered"
            const data = await getOrders(payload)
            deliveredOrderList.value = data
            count.value.Delivered = data.length
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getConfirmedOrderList = async (payload) => {
        try {
            payload.orderStatus = "Confirmed"
            const data = await getOrders(payload)
            confirmedOrderList.value = data
            count.value.Confirmed = data.length
        } catch (error) {
            console.error('주문 목록 조회 실패:', error)
        }
    }

    const getCancelledOrderList = async (payload) => {
        try {
            payload.orderStatus = "Cancelled"
            const data = await getOrders(payload)
            cancelledOrderList.value = data
            count.value.Cancelled = data.length
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