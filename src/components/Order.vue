<template>
    <div class="p-6 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900">거래 관리</h2>
    </div>
    <div class="border-b border-gray-200">
        <div class="flex px-6">
        <button
            v-for="tab in orderTabs"
            :key="tab.value"
            @click="getOrderByTab(tab.value)"
            :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            selectedOrderTab === tab.value
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
        >
            {{ tab.label }}
            <span v-if="tab.count" class="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            {{ tab.count }}
            </span>
        </button>
        </div>
    </div>

    <!-- 주문 목록 -->
    <div class="p-6">
        <div v-if="orders?.length === 0" class="text-center py-12">
        <div class="text-5xl mb-4">📦</div>
        <p class="text-gray-600">거래 내역이 없습니다</p>
        </div>

        <div v-else class="space-y-4">
        <div
            v-for="order in orders"
            :key="order.id"
            class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
        >
            <div class="p-4">
            <div class="flex gap-4">
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{{ getOrderTitle(order) }}</h3>
                    <p class="text-sm text-gray-600">주문일자 {{ formatDate(order.createdAt) }}</p>
                </div>
                <span
                    :class="[
                    'px-3 py-1 rounded-full text-center text-xs font-medium',
                    getOrderStatusStyle(order.orderStatus)
                    ]"
                >
                    {{ getOrderStatusText(order.orderStatus) }}
                    <p>{{ formatDate(order.updatedAt) }}</p>
                </span>
                </div>
                <p class="text-lg font-bold text-gray-900 mb-2">{{ formatPrice(order.totalAmount) }}원</p>
                <div v-if="order.orderItemInfos && order.orderItemInfos.length > 0" class="mb-3">
                <div v-for="(item, idx) in order.orderItemInfos" :key="idx" class="text-sm text-gray-600">
                    • {{ item.productName }} - {{ formatPrice(item.productPrice) }}원
                </div>
                </div>
                <div class="flex gap-2">
                <button
                    v-if="order.orderStatus === 'DELIVERED'"
                    @click="confirmOrder(order.code)"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    구매 확정
                </button>
                <button
                    v-if="order.status === 'PAID' || order.orderStatus === 'START_DELIVERY'"
                    @click="cancelOrder(order.code)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    구매 취소
                </button>
                <button
                    @click="toggleOrderDetail(order.code)"
                    class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                    상세 보기
                    <span class="text-xs">{{ expandedOrders.has(order.code) ? '▲' : '▼' }}</span>
                </button> 
                </div>
            </div>
            </div>
            </div>

            <!-- 상세 정보 토글 영역 -->
            <div 
            v-if="expandedOrders.has(order.code)"
            class="bg-gray-50 p-4 border-t border-gray-200"
            >
            <div class="space-y-4">
                <!-- 주문 정보 -->
                <div>
                <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    📋 주문 정보
                </h4>
                <div class="bg-white rounded-lg p-3 space-y-2 text-sm">
                    <div class="flex justify-between">
                    <span class="text-gray-600">주문번호</span>
                    <span class="font-medium text-gray-900">{{ expandedOrders.get(order.code).orderCode }}</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">주문자</span>
                    <span class="font-medium text-gray-900">{{ expandedOrders.get(order.code).nickname }}</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">주문상태</span>
                    <span class="font-medium text-gray-900">{{ getOrderStatusText(expandedOrders.get(order.code).orderStatus) }}</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">주문일시</span>
                    <span class="font-medium text-gray-900">{{ formatDateTime(expandedOrders.get(order.code).createdAt) }}</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">상태 변경일시</span>
                    <span class="font-medium text-gray-900">{{ formatDateTime(expandedOrders.get(order.code).updatedAt) }}</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">배송지</span>
                    <span class="font-medium text-gray-900">{{ expandedOrders.get(order.code).address + ' ' + expandedOrders.get(order.code).addressDetail }}</span>
                    </div>
                </div>
                </div>

                <div>
                <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🛍️ 주문 상품
                </h4>
                <div class="bg-white rounded-lg p-3 space-y-3">
                    <div 
                    v-for="(item, idx) in order.orderItemInfos" 
                    :key="idx"
                    :class="['flex justify-between items-center', idx > 0 ? 'pt-3 border-t border-gray-200' : '']"
                    >
                    <div class="flex-1">
                        <p class="font-medium text-gray-900 mb-1">{{ item.productName }}</p>
                    </div>
                    <p class="font-semibold text-gray-900 ml-4">{{ formatPrice(item.productPrice) }}원</p>
                    </div>
                </div>
                </div>

                <div>
                <h4 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    💳 결제 정보
                </h4>
                <div class="bg-white rounded-lg p-3 space-y-2 text-sm">
                    <div class="flex justify-between">
                    <span class="text-gray-600">상품 금액</span>
                    <span class="font-medium text-gray-900">{{ formatPrice(expandedOrders.get(order.code).productTotalAmount) }}원</span>
                    </div>
                    <div class="flex justify-between">
                    <span class="text-gray-600">배송비</span>
                    <span class="font-medium text-gray-900">+ {{ formatPrice(expandedOrders.get(order.code).shippingFee) }}원</span>
                    </div>
                    <div class="flex justify-between pt-2 border-t border-gray-200">
                    <span class="font-semibold text-gray-900">총 결제 금액</span>
                    <span class="font-bold text-indigo-600 text-lg">{{ formatPrice(expandedOrders.get(order.code).totalAmount) }}원</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 0" class="flex justify-center items-center gap-2 mt-8">
        <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
        >
            이전
        </button>

        <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            currentPage === page
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
        >
            {{ page }}
        </button>

        <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            :class="[
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
        >
            다음
        </button>
        </div>

        <!-- 페이지 정보 -->
        <div v-if="totalItems > 0" class="text-center text-sm text-gray-600 mt-4">
        전체 {{ totalItems }}건 중 {{ ((currentPage - 1) * pageSize) + 1 }} - {{ Math.min(currentPage * pageSize, totalItems) }}건
        </div>
      </div>

</template>

<script setup>
import { confirmOrder as apiConfirmOrder, cancelOrder as apiCancelOrder, getOrderDetail } from '@/api/order';
import { useOrderStore } from '@/stores/order';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const orderStore = useOrderStore()
const { count: orderCount, orderList, paidOrderList, deliveryOrderList, deliveredOrderList, confirmedOrderList, cancelledOrderList } = storeToRefs(orderStore)

const selectedOrderTab = ref('All')
const currentPage = ref(1)
const pageSize = ref(5)
const totalPages = ref(0)
const totalItems = ref(0)
const loading = ref(false)
const orders = ref([])
const expandedOrders = ref(new Map())

const orderTabs = computed(() => [
    { label: '전체', value: 'All', count: orderCount.value?.All || 0, list: orderList.value },
    { label: '결제완료', value: 'Paid', count: orderCount.value?.Paid || 0, list: paidOrderList.value },
    { label: '배송중', value: 'StartDelivery', count: orderCount.value?.StartDelivery || 0, list: deliveryOrderList.value },
    { label: '배송완료', value: 'Delivered', count: orderCount.value?.Delivered || 0, list: deliveredOrderList.value },
    { label: '구매확정', value: 'Confirmed', count: orderCount.value?.Confirmed || 0, list: confirmedOrderList.value },
    { label: '구매취소', value: 'Cancelled', count: orderCount.value?.Cancelled || 0, list: cancelledOrderList.value }
])

const getOrderByTab = async (tab) => {
  if (tab === selectedOrderTab.value) return

  selectedOrderTab.value = tab
  currentPage.value = 1
  expandedOrders.value.clear()
  await loadOrders()
}

const toggleOrderDetail = async (orderCode) => {
  if (expandedOrders.value.has(orderCode)) {
    expandedOrders.value.delete(orderCode)
  } else {
    const data = await getOrderDetail(orderCode)
    expandedOrders.value.set(orderCode, data)
  }
}

const getOrderTitle = (order) => {
  if (!order.orderItemInfos || order.orderItemInfos.length === 0) {
    return '주문 상품'
  }
  
  const firstItem = order.orderItemInfos[0]
  const remainCount = order.orderItemInfos.length - 1
  
  if (remainCount > 0) {
    return `${firstItem.productName} 외 ${remainCount}건`
  }
  
  return firstItem.productName
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const getOrderStatusStyle = (status) => {
  const styles = {
    'PAID': 'bg-yellow-100 text-yellow-700',
    'START_DELIVERY': 'bg-blue-100 text-blue-700',
    'DELIVERED': 'bg-green-100 text-green-700',
    'CONFIRMED': 'bg-green-100 text-green-700',
    'CANCELLED': 'bg-red-100 text-red-700'
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

const getOrderStatusText = (status) => {
  const texts = {
    'PAID': '결제완료',
    'START_DELIVERY': '배송중',
    'DELIVERED': '배송완료',
    'CONFIRMED': '구매확정',
    'CANCELLED': '취소'
  }
  return texts[status] || '알 수 없음'
}

const confirmOrder = async (orderId) => {
  if (confirm('구매를 확정하시겠습니까?')) {
    try {
      await apiConfirmOrder(orderId)
      alert('구매가 확정되었습니다.')
      await loadOrders(currentPage.value)
      
      const params = {
        page: 0,
        size: pageSize.value,
        sort: 'createdAt',
        dir: 'DESC',
      }
      await orderStore.init(params)
    } catch (error) {
      console.error('구매 확정 실패:', error)
      alert('구매 확정에 실패했습니다.')
    }
  }
}

const cancelOrder = async (orderId) => {
  if (confirm('주문을 취소하시겠습니까?')) {
    try {
      await apiCancelOrder(orderId)
      alert('주문이 취소되었습니다.')
      await loadOrders(currentPage.value)

      const params = {
        page: 0,
        size: pageSize.value,
        sort: 'createdAt',
        dir: 'DESC',
      }
      await orderStore.init(params)
    } catch (error) {
      console.error('주문 취소 실패:', error)
      alert('주문 취소에 실패했습니다.')
    }
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    expandedOrders.value.clear()
    loadOrders(page)
  }
}

const loadOrders = async (page = 1) => {
  loading.value = true
  
  try {
    const params = {
      page: page ? page : currentPage.value,
      size: pageSize.value,
      sort: 'createdAt',
      dir: 'DESC',
    }

    if (selectedOrderTab.value === 'All') {
      await orderStore.getAllOrderList(params)
    } else if (selectedOrderTab.value === 'Paid') {
      await orderStore.getPaidOrderList(params)
    } else if (selectedOrderTab.value === 'StartDelivery') {
      await orderStore.getDeliveryOrderList(params)
    } else if (selectedOrderTab.value === 'Delivered') {
      await orderStore.getDeliveredOrderList(params)
    } else if (selectedOrderTab.value === 'Confirmed') {
      await orderStore.getConfirmedOrderList(params)
    } else if (selectedOrderTab.value === 'Cancelled') {
      await orderStore.getCancelledOrderList(params)
    }
    
    const currentTab = orderTabs.value.find(t => t.value === selectedOrderTab.value)
    const data = currentTab ? currentTab.list : orderList.value

    if (data) {
      orders.value = data.items || data.data?.items || []
    
      currentPage.value = page
      pageSize.value = data.pageSize || 10
      totalPages.value = data.totalPages || 0
      totalItems.value = data.totalItems || 0
    }
  } catch (error) {
    console.error('주문 목록 로딩 실패:', error)
    orders.value = []
    totalPages.value = 0
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const params = {
    page: 1,
    size: pageSize.value,
    sort: 'createdAt',
    dir: 'DESC',
  }
  await orderStore.init(params)
  
  const data = orderList.value
  if (data) {
      orders.value = data.items || data.data?.items || []
      currentPage.value = 1
      pageSize.value = data.pageSize || 10
      totalPages.value = data.totalPages || 0
      totalItems.value = data.totalItems || 0
  }
})
</script>