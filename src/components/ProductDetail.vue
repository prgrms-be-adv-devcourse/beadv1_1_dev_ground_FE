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
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

          <!-- 썸네일 슬라이더 -->
          <div
            v-if="product.imageUrls && product.imageUrls.length > 1"
            class="bg-white rounded-xl p-4 shadow"
          >
            <div class="flex gap-2 overflow-x-auto pb-2">
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
                  <!-- 상품 상태 -->
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

                  <!-- 카테고리 -->
                  <div class="bg-gray-50 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-600">카테고리</span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ product.categoryPath || '미분류' }}
                      </span>
                    </div>
                  </div>

                  <!-- 등록일 -->
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

        <!-- 오른쪽: 상품 정보 -->
        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <!-- 판매자 정보 -->
            <div class="flex items-center gap-3 pb-6 border-b">
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
            <div class="py-6 border-t border-b border-gray-200">
              <p class="text-3xl font-bold text-indigo-600">{{ formatPrice(product.price) }}원</p>
            </div>

            <!-- 버튼 영역 -->
            <div class="space-y-3 pt-4">
              <!-- 채팅하기 + 장바구니 -->
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

              <!-- 주문하기 -->
              <button
                @click="handleBuyNow"
                class="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                주문하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 비슷한 상품 추천 -->
      <div v-if="recommendations.length > 0" class="mt-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">비슷한 상품</h2>
        </div>

        <div class="relative">
          <!-- 슬라이더 컨테이너 -->
          <div class="overflow-hidden">
            <div
              class="flex transition-transform duration-300 ease-in-out gap-4"
              :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }"
            >
              <div
                v-for="item in recommendations"
                :key="item.productCode"
                @click="goToProduct(item.productCode)"
                class="flex-shrink-0 bg-white rounded-xl shadow hover:shadow-lg transition-shadow cursor-pointer"
                :style="{ width: `${cardWidth}px` }"
              >
                <!-- 상품 이미지 -->
                <div class="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                  <img
                    v-if="item.thumbnailUrl"
                    :src="item.thumbnailUrl"
                    :alt="item.title"
                    class="w-full h-full object-cover"
                    @error="handleRecommendImageError"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <svg class="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                <!-- 상품 정보 -->
                <div class="p-4">
                  <h3 class="font-medium text-gray-900 mb-2 line-clamp-2 h-12">
                    {{ item.title }}
                  </h3>
                  <p class="text-lg font-bold text-indigo-600">{{ formatPrice(item.price) }}원</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 이전 버튼 -->
          <button
            @click="prevSlide"
            class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
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

          <!-- 다음 버튼 -->
          <button
            @click="nextSlide"
            class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductDetail, recommendByProductDetail } from '@/api/product'
import { getUserInfo } from '@/api/user'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const error = ref(null)
const product = ref({})
const currentUser = ref(null)
const selectedImageIndex = ref(0)
const activeTab = ref('detail')
const recommendations = ref([])
const currentSlide = ref(0)

const tabs = [
  { id: 'detail', name: '상세설명' },
  { id: 'info', name: '거래정보' },
]

// 슬라이더 설정
const cardWidth = 280 // 카드 너비
const gap = 16 // gap-4 = 16px
const slideWidth = computed(() => cardWidth + gap)

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

const handleRecommendImageError = (e) => {
  e.target.style.display = 'none'
}

const goBack = () => {
  router.back()
}

const handleChat = () => {
  alert('채팅 기능은 준비 중입니다.')
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
  // 페이지 새로고침하여 새 상품 로드
  window.scrollTo({ top: 0, behavior: 'smooth' })
  fetchProductDetail()
  fetchRecommendations()
}

// 무한 슬라이딩
const nextSlide = () => {
  if (recommendations.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % recommendations.value.length
}

const prevSlide = () => {
  if (recommendations.value.length === 0) return
  currentSlide.value =
    currentSlide.value === 0 ? recommendations.value.length - 1 : currentSlide.value - 1
}

const fetchProductDetail = async () => {
  try {
    loading.value = true
    error.value = null

    const productCode = route.params.productCode
    console.log('[상품 상세] productCode:', productCode)

    if (!productCode) {
      throw new Error('상품 코드가 없습니다.')
    }

    const accessToken = sessionStorage.getItem('accessToken')
    console.log('[상품 상세] accessToken:', accessToken ? '있음' : '없음')

    if (!accessToken) {
      throw new Error('로그인이 필요합니다.')
    }

    const response = await getProductDetail(productCode)
    console.log('[상품 상세] API 응답:', response.data)

    if (response.data.success) {
      product.value = response.data.data
      console.log('[상품 상세] product:', product.value)
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

    if (!accessToken) {
      console.warn('[사용자 정보] accessToken 없음')
      return
    }

    const response = await getUserInfo()
    console.log('[사용자 정보] API 응답:', response.data)

    if (response.data.success) {
      currentUser.value = response.data.data
      console.log('[사용자 정보] currentUser:', currentUser.value)
    }
  } catch (err) {
    console.error('[사용자 정보] 에러:', err)
  }
}

const fetchRecommendations = async () => {
  try {
    const productCode = route.params.productCode
    console.log('[추천 상품] productCode:', productCode)

    const response = await recommendByProductDetail(productCode, 10)
    console.log('[추천 상품] API 응답:', response.data)

    if (response.data.success && response.data.data) {
      recommendations.value = response.data.data
      console.log('[추천 상품] recommendations:', recommendations.value)
    } else {
      recommendations.value = []
    }
  } catch (err) {
    console.error('[추천 상품] 에러:', err)
    recommendations.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchProductDetail(), fetchUserInfo(), fetchRecommendations()])
})
</script>

<style scoped>
/* 스크롤바 스타일 */
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

/* 라인 클램프 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
