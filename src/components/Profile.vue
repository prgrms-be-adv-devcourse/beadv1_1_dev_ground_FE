<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 사이드바 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 프로필 카드 -->
          <div class="bg-white rounded-xl shadow-sm px-6 pt-10 pb-6">
            <div class="flex flex-col items-center gap-3">
              <h2 class="text-xl font-bold text-gray-900">{{ userInfo.nickname }}</h2>
              <p class="text-sm text-gray-600">{{ userInfo.email }}</p>
              <button
                @click="editProfile"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                프로필 변경
              </button>
            </div>
          </div>

          <!-- 메뉴 -->
          <nav class="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              v-for="menu in menus"
              :key="menu.id"
              @click="selectedMenu = menu.id"
              :class="[
                'w-full text-left px-6 py-4 flex items-center gap-3 transition-colors border-l-4',
                selectedMenu === menu.id
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="text-xl">{{ menu.icon }}</span>
              <span>{{ menu.label }}</span>
              <span v-if="menu.badge" class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {{ menu.badge }}
              </span>
            </button>
          </nav>
        </div>

        <!-- 메인 콘텐츠 -->
        <div class="lg:col-span-3 space-y-6">
          <!-- 거래 관리 -->
          <div v-if="selectedMenu === 'orders'" class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">거래 관리</h2>
            </div>

            <!-- 탭 -->
            <div class="border-b border-gray-200">
              <div class="flex px-6">
                <button
                  v-for="tab in orderTabs"
                  :key="tab.value"
                  @click="selectedOrderTab = tab.value"
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
              <div v-if="filteredOrders.length === 0" class="text-center py-12">
                <div class="text-5xl mb-4">📦</div>
                <p class="text-gray-600">거래 내역이 없습니다</p>
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="order in filteredOrders"
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
                          <h3 class="font-semibold text-gray-900 mb-1">{{ order.productName }}</h3>
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
                          v-if="order.status === 'shipped'"
                          @click="confirmOrder(order.id)"
                          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          구매 확정
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
            </div>
          </div>

          <!-- 판매 관리 -->
          <div v-if="selectedMenu === 'sales'" class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">판매 관리</h2>
                <button
                  @click="goToRegister"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  + 상품 등록
                </button>
              </div>
            </div>

            <div class="p-6">
              <div v-if="saleProducts.length === 0" class="text-center py-12">
                <div class="text-5xl mb-4">📦</div>
                <p class="text-gray-600 mb-4">판매 중인 상품이 없습니다</p>
                <button
                  @click="goToRegister"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  상품 등록하기
                </button>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="product in saleProducts"
                  :key="product.id"
                  class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-full h-48 object-cover"
                  />
                  <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="font-semibold text-gray-900">{{ product.name }}</h3>
                      <span
                        :class="[
                          'px-2 py-1 rounded text-xs font-medium',
                          product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        ]"
                      >
                        {{ product.status === 'active' ? '판매중' : '판매완료' }}
                      </span>
                    </div>
                    <p class="text-lg font-bold text-indigo-600 mb-2">{{ formatPrice(product.price) }}원</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>👁️ {{ product.views }}</span>
                      <span>❤️ {{ product.likes }}</span>
                      <span>💬 {{ product.chats }}</span>
                    </div>
                    <div class="flex gap-2">
                      <button
                        @click="editProduct(product.id)"
                        class="flex-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                      >
                        수정
                      </button>
                      <button
                        @click="deleteProduct(product.id)"
                        class="px-3 py-2 border border-red-300 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 찜한 상품 -->
<!--          <div v-if="selectedMenu === 'likes'" class="bg-white rounded-xl shadow-sm">-->
<!--            <div class="p-6 border-b border-gray-200">-->
<!--              <h2 class="text-2xl font-bold text-gray-900">찜한 상품</h2>-->
<!--            </div>-->

<!--            <div class="p-6">-->
<!--              <div v-if="likedProducts.length === 0" class="text-center py-12">-->
<!--                <div class="text-5xl mb-4">❤️</div>-->
<!--                <p class="text-gray-600">찜한 상품이 없습니다</p>-->
<!--              </div>-->

<!--              <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">-->
<!--                <div-->
<!--                  v-for="product in likedProducts"-->
<!--                  :key="product.id"-->
<!--                  class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative"-->
<!--                >-->
<!--                  <button-->
<!--                    @click="unlikeProduct(product.id)"-->
<!--                    class="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"-->
<!--                  >-->
<!--                    <span class="text-red-500">❤️</span>-->
<!--                  </button>-->
<!--                  <img :src="product.image" :alt="product.name" class="w-full h-40 object-cover" />-->
<!--                  <div class="p-3">-->
<!--                    <h3 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">-->
<!--                      {{ product.name }}-->
<!--                    </h3>-->
<!--                    <p class="text-base font-bold text-indigo-600">-->
<!--                      {{ formatPrice(product.price) }}원-->
<!--                    </p>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <!-- 리뷰 관리 -->
<!--          <div v-if="selectedMenu === 'reviews'" class="bg-white rounded-xl shadow-sm">-->
<!--            <div class="p-6 border-b border-gray-200">-->
<!--              <h2 class="text-2xl font-bold text-gray-900">리뷰 관리</h2>-->
<!--            </div>-->

<!--            <div class="p-6">-->
<!--              <div v-if="reviews.length === 0" class="text-center py-12">-->
<!--                <div class="text-5xl mb-4">⭐</div>-->
<!--                <p class="text-gray-600">작성한 리뷰가 없습니다</p>-->
<!--              </div>-->

<!--              <div v-else class="space-y-4">-->
<!--                <div-->
<!--                  v-for="review in reviews"-->
<!--                  :key="review.id"-->
<!--                  class="border border-gray-200 rounded-xl p-4"-->
<!--                >-->
<!--                  <div class="flex justify-between items-start mb-3">-->
<!--                    <div class="flex items-center gap-3">-->
<!--                      <img-->
<!--                        :src="review.productImage"-->
<!--                        :alt="review.productName"-->
<!--                        class="w-16 h-16 object-cover rounded-lg"-->
<!--                      />-->
<!--                      <div>-->
<!--                        <h3 class="font-semibold text-gray-900 mb-1">{{ review.productName }}</h3>-->
<!--                        <div class="flex items-center gap-1">-->
<!--                          <span v-for="i in 5" :key="i" class="text-yellow-400">-->
<!--                            {{ i <= review.rating ? '⭐' : '☆' }}-->
<!--                          </span>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </div>-->
<!--                    <span class="text-xs text-gray-500">{{ formatDate(review.date) }}</span>-->
<!--                  </div>-->
<!--                  <p class="text-sm text-gray-700 mb-3">{{ review.content }}</p>-->
<!--                  <div class="flex gap-2">-->
<!--                    <button-->
<!--                      @click="editReview(review.id)"-->
<!--                      class="text-sm text-gray-600 hover:text-indigo-600 transition-colors"-->
<!--                    >-->
<!--                      수정-->
<!--                    </button>-->
<!--                    <button-->
<!--                      @click="deleteReview(review.id)"-->
<!--                      class="text-sm text-gray-600 hover:text-red-600 transition-colors"-->
<!--                    >-->
<!--                      삭제-->
<!--                    </button>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <!-- 설정 -->
          <div v-if="selectedMenu === 'settings'" class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">설정</h2>
            </div>

            <div class="p-6 space-y-6">
              <!-- 알림 설정 -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">알림 설정</h3>
                <div class="space-y-3">
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-sm text-gray-700">거래 알림</span>
                    <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-sm text-gray-700">채팅 알림</span>
                    <input type="checkbox" checked class="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                  <label class="flex items-center justify-between cursor-pointer">
                    <span class="text-sm text-gray-700">마케팅 알림</span>
                    <input type="checkbox" class="w-5 h-5 text-indigo-600 rounded" />
                  </label>
                </div>
              </div>

              <!-- 계정 관리 -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">계정 관리</h3>
                <div class="space-y-3">
                  <button
                    @click="changePassword"
                    class="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span class="text-sm text-gray-700">비밀번호 변경</span>
                  </button>
                  <button
                    @click="manageAccount"
                    class="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span class="text-sm text-gray-700">계좌 정보 관리</span>
                  </button>
                  <button
                    @click="deleteAccount"
                    class="w-full text-left px-4 py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <span class="text-sm text-red-600">회원 탈퇴</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref, computed, onMounted } from 'vue'
import { getUserInfo as fetchUserInfo } from '@/api/user'
// import { useRouter } from 'vue-router'

// const router = useRouter()

// 상태 관리
const selectedMenu = ref('orders')
const selectedOrderTab = ref('all')

// 사용자 정보
const userInfo = ref({
  nickname: '',
  email: '',
  phone: '',
})

const getUserInfo = async () => {
  try {
    const payload = await fetchUserInfo()
    if (!payload) return

    const { nickname, email, phone } = payload
    userInfo.value = {
      ...userInfo.value,
      nickname: nickname ?? userInfo.value.nickname,
      email: email ?? userInfo.value.email,
      phone: phone ?? userInfo.value.phone,
    }
  } catch (error) {
    console.error('사용자 정보 요청 실패', error)
  }
}

onMounted(() => {
  getUserInfo()
})

// 메뉴
const menus = [
  { id: 'orders', label: '거래 관리', icon: '📦', badge: 3 },
  { id: 'sales', label: '판매 관리', icon: '🏪', badge: null },
  // { id: 'likes', label: '찜한 상품', icon: '❤️', badge: null },
  { id: 'reviews', label: '리뷰 관리', icon: '⭐', badge: null },
  { id: 'settings', label: '설정', icon: '⚙️', badge: null },
]

// 주문 탭
const orderTabs = [
  { label: '전체', value: 'all', count: null },
  { label: '입금대기', value: 'pending', count: 1 },
  { label: '배송중', value: 'shipped', count: 2 },
  { label: '구매확정', value: 'completed', count: null },
]

// 더미 주문 데이터
const orders = ref([
  {
    id: 1,
    productName: '아이폰 15 Pro 256GB',
    seller: '신뢰판매자',
    price: 1350000,
    status: 'shipped',
    date: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    productName: '맥북 에어 M2',
    seller: '애플샵',
    price: 1450000,
    status: 'pending',
    date: '2024-12-11',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    productName: '에어팟 프로 2세대',
    seller: '테크마켓',
    price: 280000,
    status: 'completed',
    date: '2024-12-05',
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop',
  },
])

// 판매 상품
const saleProducts = ref([
  {
    id: 1,
    name: '갤럭시 S23 Ultra 512GB',
    price: 950000,
    status: 'active',
    views: 234,
    likes: 45,
    chats: 12,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: '아이패드 프로 11인치',
    price: 800000,
    status: 'active',
    views: 156,
    likes: 28,
    chats: 8,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
  },
])

// 찜한 상품
// const likedProducts = ref([
//   {
//     id: 1,
//     name: '애플워치 시리즈 9',
//     price: 550000,
//     image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
//   },
//   {
//     id: 2,
//     name: '소니 WH-1000XM5',
//     price: 350000,
//     image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
//   },
//   {
//     id: 3,
//     name: '닌텐도 스위치 OLED',
//     price: 380000,
//     image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop',
//   },
// ])

// 리뷰
// const reviews = ref([
//   {
//     id: 1,
//     productName: '아이폰 14 Pro',
//     productImage:
//       'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
//     rating: 5,
//     content: '상태 정말 좋고 판매자님도 친절하세요. 안전거래로 믿고 샀습니다!',
//     date: '2024-12-08',
//   },
//   {
//     id: 2,
//     productName: '갤럭시 버즈2 프로',
//     productImage:
//       'https://images.unsplash.com/photo-1590658165737-15a047b7a28e?w=400&h=400&fit=crop',
//     rating: 4,
//     content: '가성비 좋은 거래였습니다. 추천해요!',
//     date: '2024-12-01',
//   },
// ])

// 계산된 값
const filteredOrders = computed(() => {
  if (selectedOrderTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter((o) => o.status === selectedOrderTab.value)
})

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const getOrderStatusStyle = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return styles[status] || 'bg-gray-100 text-gray-700'
}

const getOrderStatusText = (status) => {
  const texts = {
    pending: '입금대기',
    shipped: '배송중',
    completed: '구매확정',
  }
  return texts[status] || '알 수 없음'
}

const editProfile = () => {
  console.log('프로필 수정')
}

const confirmOrder = (orderId) => {
  if (confirm('구매를 확정하시겠습니까?')) {
    console.log('구매 확정:', orderId)
    alert('구매가 확정되었습니다.')
  }
}

const viewOrderDetail = (orderId) => {
  console.log('주문 상세:', orderId)
}

const goToRegister = () => {
  console.log('상품 등록 페이지로 이동')
  router.push('/register')
}

const editProduct = (productId) => {
  console.log('상품 수정:', productId)
}

const deleteProduct = (productId) => {
  if (confirm('상품을 삭제하시겠습니까?')) {
    console.log('상품 삭제:', productId)
  }
}

// const unlikeProduct = (productId) => {
//   console.log('찜 취소:', productId)
//   likedProducts.value = likedProducts.value.filter((p) => p.id !== productId)
// }

// const editReview = (reviewId) => {
//   console.log('리뷰 수정:', reviewId)
// }

// const deleteReview = (reviewId) => {
//   if (confirm('리뷰를 삭제하시겠습니까?')) {
//     console.log('리뷰 삭제:', reviewId)
//   }
// }

const changePassword = () => {
  console.log('비밀번호 변경')
}

const manageAccount = () => {
  console.log('계좌 정보 관리')
}

const deleteAccount = () => {
  if (confirm('정말 회원 탈퇴하시겠습니까?')) {
    console.log('회원 탈퇴')
  }
}
</script>

<style scoped>
/* 추가 스타일 */
</style>
