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
        <div v-if="loading" class="text-center py-12">
        <div class="text-5xl mb-4">📦</div>
        <p class="text-gray-600">거래 내역이 없습니다</p>
        </div>

        <div v-else class="space-y-4">
        <div
            v-for="order in orders"
            :key="order.id"
            class="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
        >
            <div class="flex gap-4">
            <img
                :src="order.image"
                :alt="order.productName"
                class="w-24 h-24 object-cover rounded-lg"
            />
            <div class="flex-1">
                <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-semibold text-gray-900 mb-1">{{ getOrderTitle(order) }}</h3>
                    <p class="text-sm text-gray-600">{{ order.seller }}</p>
                </div>
                <span
                    :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    getOrderStatusStyle(order.status)
                    ]"
                >
                    {{ getOrderStatusText(order.status) }}
                </span>
                </div>
                <p class="text-lg font-bold text-gray-900 mb-2">{{ formatPrice(order.price) }}원</p>
                <p class="text-xs text-gray-500 mb-3">{{ formatDate(order.date) }}</p>
                <div class="flex gap-2">
                <button
                    v-if="order.status === 'Delivered'"
                    @click="confirmOrder(order.id)"
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    구매 확정
                </button>
                <button
                    v-if="order.status === 'Paid' || order.status === 'Delivery'"
                    @click="cancelOrder(order.id)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    구매 취소
                </button>
                <button
                    @click="viewOrderDetail(order.id)"
                    class="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                    상세 보기
                </button>
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
            v-for="page in displayPages"
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
import { useOrderStore } from '@/stores/order';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const orderStore = useOrderStore()
const { count: orderCount, orderList, paidOrderList, deliveryOrderList, deliveredOrderList, confirmedOrderList, cancelledOrderList } = storeToRefs(orderStore)

const selectedOrderTab = ref('All')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const totalItems = ref(0)
const loading = ref(false)


const orders = ref([
  {
    id: 1,
    productName: '아이폰 15 Pro 256GB',
    seller: '신뢰판매자',
    price: 1350000,
    status: 'Delivered',
    date: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    productName: '맥북 에어 M2',
    seller: '애플샵',
    price: 1450000,
    status: 'Paid',
    date: '2024-12-11',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
  },
  {
    id: 3,
    productName: '에어팟 프로 2세대',
    seller: '테크마켓',
    price: 280000,
    status: 'Cancelled',
    date: '2024-12-05',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop'
  }
])

const orderTabs = computed(() => [
    { label: '전체', value: 'All', count: orderCount.value?.All || 0, list: orderList.value },
    { label: '결제완료', value: 'Paid', count: orderCount.value?.Paid || 0, list: paidOrderList.value },
    { label: '배송중', value: 'StartDelivery', count: orderCount.value?.StartDelivery || 0, list: deliveryOrderList.value },
    { label: '배송완료', value: 'Delivered', count: orderCount.value?.Delivered || 0, list: deliveredOrderList.value },
    { label: '구매확정', value: 'Confirmed', count: orderCount.value?.Confirmed || 0, list: confirmedOrderList.value },
    { label: '구매취소', value: 'Cancelled', count: orderCount.value?.Cancelled || 0, list: cancelledOrderList.value }
])

const getOrderByTab = (tab) => {
  console.log(tab)
  if (tab == selectedOrderTab.value) {
    return
  }
  selectedOrderTab.value = tab

  console.log(orderTabs.value.find(t => t.value == tab))
  orders.value = orderTabs.value.find(t => t.value == tab).list.items

  console.log(selectedOrderTab.value, tab)
}

// 계산된 값
const filteredOrders = computed(() => {
  if (selectedOrderTab.value === 'All') {
    return orders.value
  }
  return orders.value.filter(o => o.status === selectedOrderTab.value)
})

const displayPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

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


const getOrderStatusStyle = (status) => {
  const styles = {
    'Paid': 'bg-yellow-100 text-yellow-700',
    'StartDelivery': 'bg-blue-100 text-blue-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Confirmed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

const getOrderStatusText = (status) => {
  const texts = {
    'ALL': '전체',
    'Paid': '결제완료',
    'StartDelivery': '배송중',
    'Delivered': '배송완료',
    'Confirmed': '구매확정',
    'Cancelled': '취소'
  }
  return texts[status] || '알 수 없음'
}

const confirmOrder = (orderId) => {
  if (confirm('구매를 확정하시겠습니까?')) {
    console.log('구매 확정:', orderId)
    alert('구매가 확정되었습니다.')
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadOrders()
  }
}

const loadOrders = async () => {
  loading.value = true
  
  try {
    const orderStatus = selectedOrderTab.value === 'all' ? '' : selectedOrderTab.value
    
    await orderStore.init({
      page: currentPage.value,
      size: pageSize.value,
      sort: 'createdAt',
      dir: 'DESC',
      orderStatus: orderStatus
    })
    
    // API 응답에서 데이터 추출
    if (orderList.value && orderList.value.data) {
      const data = orderList.value.data
      orders.value = data.items || []
      currentPage.value = data.currentPageNumber || 1
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

const viewOrderDetail = (orderId) => {
  console.log('주문 상세:', orderId)
}

onMounted(() => {
  loadOrders()
})
</script>
