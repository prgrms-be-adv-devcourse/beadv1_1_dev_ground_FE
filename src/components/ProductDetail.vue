<template>
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"
      ></div>
      <p class="text-gray-600">상품 정보를 불러오는 중...</p>
    </div>
  </div>

  <div v-else-if="error" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <svg
        class="mx-auto h-16 w-16 text-red-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">상품을 불러올 수 없습니다</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button
        @click="goBack"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        돌아가기
      </button>
    </div>
  </div>

  <div v-else class="min-h-screen bg-gray-50">
    <!-- 상단 뒤로가기 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          @click="goBack"
          class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span class="font-medium">뒤로가기</span>
        </button>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
        <!-- 왼쪽: 이미지 영역 -->
        <div class="space-y-4">
          <!-- 메인 이미지 -->
          <div class="bg-white rounded-xl overflow-hidden shadow-lg aspect-square">
            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
              <img
                v-if="product.imageUrls && product.imageUrls.length > 0"
                :src="product.imageUrls[selectedImageIndex]"
                :alt="product.title"
                class="w-full h-full object-contain"
                @error="handleMainImageError"
              />
              <div v-else class="text-center">
                <svg
                  class="w-32 h-32 text-gray-300 mx-auto mb-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-gray-500 text-sm">이미지가 없습니다</p>
              </div>
            </div>
          </div>

          <!-- 썸네일 슬라이더 (항상 표시) -->
          <div class="bg-white rounded-xl p-4 shadow">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <template v-if="product.imageUrls && product.imageUrls.length > 0">
                <button
                  v-for="(imageUrl, index) in product.imageUrls"
                  :key="index"
                  @click="selectedImageIndex = index"
                  class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all"
                  :class="
                    selectedImageIndex === index
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  "
                >
                  <img
                    :src="imageUrl"
                    :alt="`${product.title} ${index + 1}`"
                    class="w-full h-full object-cover"
                    @error="handleThumbnailError"
                  />
                </button>
              </template>
              <template v-else>
                <div
                  class="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-indigo-600 ring-2 ring-indigo-200 bg-gray-100 flex items-center justify-center"
                >
                  <svg class="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </template>
            </div>
          </div>

          <!-- 탭 네비게이션 -->
          <div class="bg-white rounded-xl shadow">
            <div class="flex border-b border-gray-200">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="flex-1 py-4 text-center font-medium transition-colors"
                :class="
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                "
              >
                {{ tab.name }}
              </button>
            </div>

            <div class="p-6">
              <!-- 상세설명 탭 -->
              <div v-if="activeTab === 'detail'">
                <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {{ product.description || '상품 설명이 없습니다.' }}
                </p>
              </div>

              <!-- 거래정보 탭 -->
              <div v-if="activeTab === 'info'">
                <div class="space-y-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600">상품 상태</span>
                      <span
                        class="px-3 py-1 rounded-full text-sm font-semibold"
                        :class="{
                          'bg-green-100 text-green-800': product.productStatus === 'ON_SALE',
                          'bg-yellow-100 text-yellow-800': product.productStatus === 'RESERVED',
                          'bg-red-100 text-red-800': product.productStatus === 'SOLD_OUT',
                        }"
                      >
                        {{ getProductStatusText(product.productStatus) }}
                      </span>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600">카테고리</span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ product.categoryPath || '미분류' }}
                      </span>
                    </div>
                  </div>

                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600">등록일</span>
                      <span class="text-sm text-gray-900">
                        {{ new Date().toLocaleDateString('ko-KR') }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 상품 정보 (고정 높이) -->
        <div class="lg:sticky lg:top-24 lg:self-start">
          <div class="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <!-- 판매자 정보 -->
            <div class="flex items-center gap-3 pb-6 border-b border-gray-200">
              <div
                class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
              >
                <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ currentUser?.nickname || '판매자' }}</p>
                <p class="text-sm text-gray-500">
                  {{ currentUser?.email || 'seller@example.com' }}
                </p>
              </div>
            </div>

            <!-- 상품명 -->
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ product.title }}</h1>
            </div>

            <!-- 가격 -->
            <div>
              <p class="text-3xl font-bold text-indigo-600">{{ formatPrice(product.price) }}원</p>
            </div>

            <!-- 버튼 영역 -->
            <div class="space-y-3 pt-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="handleChat"
                  class="py-3 bg-white border-2 border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  채팅하기
                </button>

                <button
                  @click="handleAddToCart"
                  class="py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  장바구니
                </button>
              </div>

              <button
                @click="handleBuyNow"
                class="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                주문하기
              </button>
            </div>

            <!-- 안전거래 안내 (버튼 아래) -->
            <div class="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div class="flex items-start gap-3">
                <svg
                  class="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <div>
                  <h3 class="text-sm font-semibold text-indigo-900 mb-2">안전거래 안내</h3>
                  <ul class="space-y-1.5 text-xs text-indigo-700">
                    <li class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      구매자 보호 프로그램
                    </li>
                    <li class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      예치금 결제 시스템
                    </li>
                    <li class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      거래 완료 후 정산
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 비슷한 상품 추천 -->
      <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">🔥 이 상품과 비슷한 상품</h2>

        <div v-if="loadingRecommend" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"
          ></div>
        </div>

        <div v-else-if="recommendedProducts.length > 0" class="relative">
          <!-- 왼쪽 버튼 -->
          <button
            v-if="recommendedProducts.length > itemsPerPage"
            @click="previousPage"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- 상품 그리드 (2열) -->
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(item, index) in displayedRecommendations"
              :key="`rec-${index}`"
              @click="goToProduct(item.productCode)"
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg cursor-pointer transform hover:scale-105 transition-all"
            >
              <div class="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.thumbnailUrl"
                  :src="item.thumbnailUrl"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <svg v-else class="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {{ item.title }}
                </h3>
                <p class="text-base font-bold text-indigo-600">{{ formatPrice(item.price) }}원</p>
              </div>
            </div>
          </div>

          <!-- 오른쪽 버튼 -->
          <button
            v-if="recommendedProducts.length > itemsPerPage"
            @click="nextPage"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div v-else class="bg-gray-50 rounded-lg p-12 text-center">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <p class="text-gray-600">추천할 상품이 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductDetail, recommendByProductDetail } from '@/api/product'
import { getUserInfo } from '@/api/user'
import { createOrGetChatRoom } from '@/api/chat'
import { useChatStore } from '@/stores/chat'

const router = useRouter()
const route = useRoute()
const chatStore = useChatStore()

const loading = ref(true)
const error = ref(null)
const product = ref({})
const currentUser = ref(null)
const selectedImageIndex = ref(0)
const activeTab = ref('detail')
const recommendedProducts = ref([])
const loadingRecommend = ref(false)
const currentRecommendPage = ref(0)
const itemsPerPage = ref(2)

const tabs = [
  { id: 'detail', name: '상세설명' },
  { id: 'info', name: '거래정보' },
]

const displayedRecommendations = computed(() => {
  if (recommendedProducts.value.length === 0) return []

  const start = currentRecommendPage.value * itemsPerPage.value
  const end = start + itemsPerPage.value

  return recommendedProducts.value.slice(start, end)
})

const nextPage = () => {
  const totalPages = Math.ceil(recommendedProducts.value.length / itemsPerPage.value)
  currentRecommendPage.value = (currentRecommendPage.value + 1) % totalPages
}

const previousPage = () => {
  const totalPages = Math.ceil(recommendedProducts.value.length / itemsPerPage.value)
  currentRecommendPage.value = (currentRecommendPage.value - 1 + totalPages) % totalPages
}

const formatPrice = (price) => (price ? price.toLocaleString('ko-KR') : '0')

const getProductStatusText = (status) => {
  const statusMap = {
    ON_SALE: '판매중',
    RESERVED: '예약중',
    SOLD_OUT: '판매완료',
  }
  return statusMap[status] || status
}

const handleMainImageError = (e) => {
  e.target.style.display = 'none'
}

const handleThumbnailError = (e) => {
  e.target.parentElement.style.display = 'none'
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const goBack = () => {
  router.back()
}

const handleChat = async () => {
  const resolveUserCode = () => {
    const stored =
      sessionStorage.getItem('X-CODE') ||
      sessionStorage.getItem('userCode')
    if (stored) return stored
    const accessToken = sessionStorage.getItem('accessToken')
    if (!accessToken) return ''
    try {
      const payloadPart = accessToken.split('.')[1]
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      )
      const decoded = JSON.parse(atob(padded))
      return decoded?.userCode || ''
    } catch (e) {
      console.warn('userCode 파싱 실패', e)
      return ''
    }
  }

  const userCode = resolveUserCode()
  if (!userCode) {
    alert('로그인 후 채팅을 이용해 주세요.')
    router.push('/login')
    return
  }
  sessionStorage.setItem('X-CODE', userCode)

  const productCode = route.params.id || route.params.productCode || product.value.productCode
  const sellerCode = product.value.sellerCode
  console.log(productCode, sellerCode)
  if (!productCode || !sellerCode) {
    alert('상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    return
  }
  if (sellerCode === userCode) {
    alert('본인 상품에는 채팅을 시작할 수 없습니다.')
    return
  }

  try {
    const { data } = await createOrGetChatRoom({
      productCode,
      sellerCode,
      buyerCode: userCode,
    })
    const room = data?.data || data
    if (room?.id) {
      chatStore.openRoom(room.id)
    } else {
      chatStore.open()
    }
  } catch (err) {
    console.error('채팅 시작 실패:', err)
    alert('채팅을 시작하지 못했습니다. 다시 시도해주세요.')
  }
}

const handleAddToCart = async () => {
  const confirmed = confirm('장바구니에 추가하시겠습니까?')
  if (confirmed) {
    alert('장바구니에 추가되었습니다.')
  }
}

const handleBuyNow = () => {
  alert('주문 기능은 준비 중입니다.')
}

const goToProduct = (productCode) => {
  router.push(`/productDetail/${productCode}`)
  window.location.reload()
}

const fetchProductDetail = async () => {
  try {
    loading.value = true
    error.value = null

    const productCode = route.params.id || route.params.productCode
    if (!productCode) {
      throw new Error('상품 코드가 없습니다.')
    }

    const accessToken = sessionStorage.getItem('accessToken')
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.')
    }

    const response = await getProductDetail(productCode)
    if (response.data.success) {
      product.value = response.data.data
    } else {
      throw new Error(response.data.message || '상품 정보를 불러올 수 없습니다.')
    }
  } catch (err) {
    console.error('[상품 상세] 에러:', err)
    error.value = err.message || '상품 정보를 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

const fetchUserInfo = async () => {
  try {
    const accessToken = sessionStorage.getItem('accessToken')
    if (!accessToken) return

    const response = await getUserInfo()
    if (response.data.success) {
      currentUser.value = response.data.data
    }
  } catch (err) {
    console.error('[사용자 정보] 에러:', err)
  }
}

const fetchRecommendations = async () => {
  loadingRecommend.value = true
  try {
    const productCode = route.params.id || route.params.productCode
    const response = await recommendByProductDetail(productCode, 20)

    if (response.data.success && response.data.data) {
      const data = response.data.data
      recommendedProducts.value = data.recommendSpecs || data || []
    } else {
      recommendedProducts.value = []
    }
  } catch (err) {
    console.error('[추천 상품] 에러:', err)
    recommendedProducts.value = []
  } finally {
    loadingRecommend.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchProductDetail(), fetchUserInfo(), fetchRecommendations()])
})
</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
