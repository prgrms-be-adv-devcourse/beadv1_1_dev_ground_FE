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
                  : 'border-transparent text-gray-700 hover:bg-gray-50',
              ]"
            >
              <span class="text-xl">{{ menu.icon }}</span>
              <span>{{ menu.label }}</span>
              <span
                v-if="menu.badge"
                class="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {{ menu.badge }}
              </span>
            </button>
          </nav>
        </div>

        <!-- 메인 콘텐츠 -->
        <div class="lg:col-span-3 space-y-6">
          <!-- 거래 관리 -->
          <div v-if="selectedMenu === 'orders'" class="bg-white rounded-xl shadow-sm">
            <Order />
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

              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    v-for="product in saleProducts"
                    :key="product.code"
                    class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover" />
                    <div class="p-4">
                      <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-900">{{ product.name }}</h3>
                        <span
                          :class="[
                            'px-2 py-1 rounded text-xs font-medium',
                            product.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700',
                          ]"
                        >
                          {{ product.status === 'active' ? '판매중' : '판매완료' }}
                        </span>
                      </div>
                      <p class="text-lg font-bold text-indigo-600 mb-2">
                        {{ formatPrice(product.price) }}원
                      </p>
                      <div class="flex gap-2">
                        <button
                          @click="editProduct(product.code)"
                          class="flex-1 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors"
                        >
                          수정
                        </button>
                        <button
                          @click="deleteProduct(product.code)"
                          class="px-3 py-2 border border-red-300 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 페이지네이션 -->
                <div
                  v-if="!salesLoading && salesTotalPages > 1"
                  class="mt-8 flex justify-center items-center gap-2"
                >
                  <button
                    @click="goToSalesPage(salesPage - 1)"
                    :disabled="salesPage === 1"
                    class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <template v-for="page in displayedSalesPages" :key="page">
                    <button
                      v-if="page !== '...'"
                      @click="goToSalesPage(page)"
                      class="px-4 py-2 rounded-lg border transition-colors"
                      :class="
                        salesPage === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      "
                    >
                      {{ page }}
                    </button>
                    <span v-else class="px-2 text-gray-500">...</span>
                  </template>

                  <button
                    @click="goToSalesPage(salesPage + 1)"
                    :disabled="salesPage === salesTotalPages"
                    class="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

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
import { getUserProducts as fetchUserProducts } from '@/api/product'
import { api } from '@/api'
import Order from './Order.vue'

const selectedMenu = ref('orders')

const userInfo = ref({
  nickname: '',
  email: '',
  phone: '',
})

const getUserInfo = async () => {
  try {
    const response = await fetchUserInfo()
    const payload = response?.data?.data ?? response?.data ?? response
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

// 판매 상품
const saleProducts = ref([])
const salesPage = ref(1)
const salesSize = ref(10)
const salesTotalPages = ref(1)
const salesLoading = ref(false)
const displayedSalesPages = computed(() => {
  const total = salesTotalPages.value
  const current = salesPage.value
  const delta = 1
  const range = []

  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    range.push(i)
  }

  if (range[0] > 1) range.unshift(1, '...')
  if (range[range.length - 1] < total) range.push('...', total)

  return [...new Set(range)]
})

const normalizeSaleProduct = (item) => {
  const rawStatus = (item?.productStatus ?? item?.status ?? '').toString()
  const isSold = rawStatus.includes('완료') || rawStatus.toLowerCase().includes('sold')

  return {
    code:
      item?.productCode ??
      item?.code ??
      item?.id ??
      `product-${Math.random().toString(36).slice(2)}`,
    name: item?.title ?? item?.productName ?? item?.name ?? '상품명 미확인',
    price: Number(item?.price ?? item?.productPrice ?? item?.amount ?? 0),
    status: isSold ? 'sold' : 'active',
    image:
      item?.thumbnailUrl ??
      item?.imageUrl ??
      item?.image ??
      item?.thumbnail ??
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
  }
}

const loadSaleProducts = async ({ page = 1 } = {}) => {
  if (salesLoading.value) return
  salesLoading.value = true

  try {
    const response = await fetchUserProducts({ page, size: salesSize.value })
    const payload = response?.data?.data ?? response?.data ?? response
    const list = Array.isArray(payload)
      ? payload
      : payload?.items ?? payload?.content ?? payload?.products ?? []

    saleProducts.value = list.map(normalizeSaleProduct)
    salesTotalPages.value = payload?.totalPages ?? payload?.page?.totalPages ?? 1
    salesPage.value = payload?.currentPageNumber ?? page
  } catch (error) {
    console.error('판매 상품 조회 실패', error)
    saleProducts.value = []
  } finally {
    salesLoading.value = false
  }
}

const goToSalesPage = (page) => {
  if (page < 1 || page > salesTotalPages.value || page === salesPage.value) return
  loadSaleProducts({ page })
}

onMounted(() => {
  getUserInfo()
  loadSaleProducts({ page: 1 })
})

// 메뉴
const menus = [
  { id: 'orders', label: '거래 관리', icon: '📦', badge: null },
  { id: 'sales', label: '판매 관리', icon: '🏪', badge: null },
  // { id: 'likes', label: '찜한 상품', icon: '❤️', badge: null },
  // { id: 'reviews', label: '리뷰 관리', icon: '⭐', badge: null },
  { id: 'settings', label: '설정', icon: '⚙️', badge: null },
]

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const editProfile = () => {
  console.log('프로필 수정')
}

const goToRegister = () => {
  console.log('상품 등록 페이지로 이동')
  router.push('/register')
}

const editProduct = (productCode) => {
  console.log('상품 수정:', productCode)
  // router.push('/')
}

const deleteProduct = async (productCode) => {
  const access = sessionStorage.getItem('accessToken')
  if (!access) throw new Error('access 토큰이 없습니다.')

  if (!confirm('상품을 삭제하시겠습니까?')) return

  await api.delete(`/products/${productCode}`, {
    headers: { access },
    withCredentials: true,
  })

  // 삭제 후 목록 갱신
  saleProducts.value = saleProducts.value.filter((p) => p.code !== productCode)
}

const changePassword = () => {
  console.log('비밀번호 변경')
  router.addRoute('/changePwd')
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
