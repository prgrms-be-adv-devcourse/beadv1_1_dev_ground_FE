<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 검색바 -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="relative">
          <div class="flex items-center gap-3">
            <div class="flex-1 relative">
              <input
                v-model="searchKeyword"
                @input="handleSearchInput"
                @keyup.enter="handleSearchSubmit"
                @focus="showSuggestions = true"
                type="text"
                placeholder="검색어를 입력해주세요"
                class="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-600"
              />
              <button
                v-if="searchKeyword"
                @click="clearSearch"
                class="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
              <button
                @click="handleSearchSubmit"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              <!-- 자동완성 드롭다운 -->
              <div
                v-if="showSuggestions && suggestions.length > 0"
                class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
              >
                <button
                  v-for="(suggestion, index) in suggestions"
                  :key="index"
                  @click="selectSuggestion(suggestion)"
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                >
                  <span class="text-sm text-gray-700">{{ suggestion }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 추천 상품 섹션 -->
    <div
      v-if="!loading && recommendedProducts.length > 0"
      class="bg-white border-b border-gray-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">
          {{ userCode ? '회원님을 위한 추천' : '인기 상품 추천' }}
        </h2>
        <div class="relative overflow-hidden">
          <div
            class="flex gap-4 transition-transform duration-500 ease-linear"
            :style="{ transform: `translateX(-${slideOffset}px)` }"
          >
            <div
              v-for="(item, index) in slidingRecommendedProducts"
              :key="`recommend-${index}`"
              @click="goToProduct(item.productCode)"
              class="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <img
                :src="item.thumbnailUrl || 'https://via.placeholder.com/160'"
                :alt="item.title"
                class="w-full h-40 object-cover"
                @error="handleImageError"
              />
              <div class="p-3">
                <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {{ item.title }}
                </h3>
                <p class="text-base font-bold text-indigo-600">{{ formatPrice(item.price) }}원</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6">
        <!-- 왼쪽 필터 사이드바 -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
            <!-- 카테고리 필터 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
              <div class="space-y-1 max-h-96 overflow-y-auto">
                <div v-for="category in rootCategories" :key="category.id">
                  <button
                    @click="toggleCategory(category.id, 0)"
                    class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    :class="{ 'bg-indigo-50 text-indigo-700': isSelectedCategory(category.id, 0) }"
                  >
                    <span class="text-sm font-medium">{{ category.name }}</span>
                    <span v-if="!category.isLeaf" class="text-xs text-gray-400">›</span>
                  </button>

                  <div
                    v-if="
                      isSelectedCategory(category.id, 0) &&
                      selectedCategories.length > 0 &&
                      selectedCategories[0].children.length > 0
                    "
                    class="ml-3 mt-1 space-y-1"
                  >
                    <div class="text-xs text-gray-500 mb-1 px-2">
                      {{ selectedCategories[0].parent.name }}의 하위
                    </div>
                    <div v-for="child in selectedCategories[0].children" :key="child.id">
                      <button
                        @click="toggleCategory(child.id, 1)"
                        class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        :class="{ 'bg-indigo-50 text-indigo-700': isSelectedCategory(child.id, 1) }"
                      >
                        <span class="text-sm">{{ child.name }}</span>
                        <span v-if="!child.isLeaf" class="text-xs text-gray-400">›</span>
                      </button>

                      <div
                        v-if="
                          isSelectedCategory(child.id, 1) &&
                          selectedCategories.length > 1 &&
                          selectedCategories[1].children.length > 0
                        "
                        class="ml-3 mt-1 space-y-1"
                      >
                        <div class="text-xs text-gray-500 mb-1 px-2">
                          {{ selectedCategories[1].parent.name }}의 하위
                        </div>
                        <button
                          v-for="child3 in selectedCategories[1].children"
                          :key="child3.id"
                          @click="toggleCategory(child3.id, 2)"
                          class="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors text-left text-xs"
                          :class="{
                            'bg-indigo-50 text-indigo-700': isSelectedCategory(child3.id, 2),
                          }"
                        >
                          <span>{{ child3.name }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="currentCategoryId"
              @click="resetCategories"
              class="w-full text-sm text-red-600 hover:text-red-700 font-medium py-2"
            >
              카테고리 초기화
            </button>

            <!-- 가격 범위 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">가격 범위</h3>

              <!-- 가격 태그 -->
              <div class="space-y-2 mb-3">
                <button
                  v-for="range in priceRanges"
                  :key="range.label"
                  @click="selectPriceRange(range)"
                  class="w-full px-3 py-2 text-sm border rounded-lg transition-colors text-left"
                  :class="
                    isPriceRangeActive(range)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-indigo-400'
                  "
                >
                  {{ range.label }}
                </button>
              </div>

              <!-- 직접 입력 -->
              <div class="space-y-2 pt-3 border-t border-gray-200">
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="minPrice"
                    type="number"
                    placeholder="최소"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  />
                  <span class="text-gray-500">~</span>
                  <input
                    v-model.number="maxPrice"
                    type="number"
                    placeholder="최대"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <button
                  @click="applyManualPriceFilter"
                  class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  적용
                </button>
              </div>
            </div>

            <!-- 상품 상태 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">상품 상태</h3>
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="statusFilter"
                    type="checkbox"
                    value="ON_SALE"
                    @change="applyFilters"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span class="text-sm">판매중</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="statusFilter"
                    type="checkbox"
                    value="RESERVED"
                    @change="applyFilters"
                    class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span class="text-sm">예약중</span>
                </label>
              </div>
            </div>

            <!-- 전체 필터 초기화 -->
            <button
              v-if="hasActiveFilters"
              @click="resetAllFilters"
              class="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2 border-t border-gray-200 mt-2 pt-4"
            >
              전체 필터 초기화
            </button>
          </div>
        </aside>

        <!-- 오른쪽 상품 목록 -->
        <main class="flex-1">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-1">
                {{ currentCategoryName || '전체 상품' }}
              </h1>
              <p class="text-sm text-gray-600">총 {{ totalCount }}개의 상품</p>
            </div>
            <select
              v-model="sortOption"
              @change="onSortChange"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-600"
            >
              <option value="createdAt-desc">최신순</option>
              <option value="price-asc">낮은 가격순</option>
              <option value="price-desc">높은 가격순</option>
              <option value="relevance-desc">관련도순</option>
            </select>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="product in products"
              :key="product.productCode"
              @click="goToProduct(product.productCode)"
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="relative">
                <img
                  :src="product.thumbnailUrl || 'https://via.placeholder.com/300'"
                  :alt="product.title"
                  class="w-full h-48 object-cover"
                  @error="handleImageError"
                />
                <div v-if="product.productStatus" class="absolute bottom-2 left-2">
                  <span
                    class="px-2 py-1 text-white text-xs font-bold rounded"
                    :class="{
                      'bg-green-500': product.productStatus === 'ON_SALE',
                      'bg-gray-500': product.productStatus === 'RESERVED',
                      'bg-red-500': product.productStatus === 'SOLD_OUT',
                    }"
                  >
                    {{ getProductStatusText(product.productStatus) }}
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {{ product.title }}
                </h3>
                <p class="text-lg font-bold text-indigo-600 mb-2">
                  {{ formatPrice(product.price) }}원
                </p>
                <div class="text-xs text-gray-500">
                  <span>{{ product.categoryName }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"
            ></div>
          </div>

          <div v-else-if="!loading && products.length === 0" class="text-center py-12">
            <p class="text-gray-500">검색 결과가 없습니다.</p>
          </div>

          <div v-if="!loading && hasMore" class="mt-8 text-center">
            <button
              @click="loadMore"
              class="px-8 py-3 bg-white border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600 rounded-xl font-semibold transition-colors"
            >
              더 보기
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchProducts, recommendByUserView, suggestCompletion } from '@/api/product'
import { getRootCategories, getChildCategories } from '@/api/category'

const router = useRouter()

const loading = ref(false)
const loadingRecommend = ref(false)
const totalCount = ref(0)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const userCode = ref(localStorage.getItem('userCode') || null)

const sortOption = ref('createdAt-desc')
const sortBy = computed(() => sortOption.value.split('-')[0])
const sortDirection = computed(() => sortOption.value.split('-')[1])

const rootCategories = ref([])
const selectedCategories = ref([])
const currentCategoryId = ref(null)
const currentCategoryName = ref('')

const products = ref([])

const recommendedProducts = ref([])
const slideOffset = ref(0)
const slideInterval = ref(null)
const SLIDE_SPEED = 1
const CARD_WIDTH = 176

// 검색 관련
const searchKeyword = ref('')
const committedKeyword = ref('') // 실제 검색에 사용되는 키워드
const suggestions = ref([])
const showSuggestions = ref(false)
let suggestionTimeout = null

// 가격 필터
const minPrice = ref(null)
const maxPrice = ref(null)
const priceRanges = [
  { label: '~10,000원', min: null, max: 10000 },
  { label: '10,001~100,000원', min: 10001, max: 100000 },
  { label: '100,001~500,000원', min: 100001, max: 500000 },
  { label: '500,001원~', min: 500001, max: null },
]

// 상품 상태
const statusFilter = ref([])

const hasActiveFilters = computed(() => {
  return (
    committedKeyword.value ||
    minPrice.value ||
    maxPrice.value ||
    statusFilter.value.length > 0 ||
    currentCategoryId.value
  )
})

const slidingRecommendedProducts = computed(() => {
  if (recommendedProducts.value.length === 0) return []
  return [...recommendedProducts.value, ...recommendedProducts.value, ...recommendedProducts.value]
})

// 유틸 함수들
const formatPrice = (price) => (price ? price.toLocaleString('ko-KR') : '0')

const getProductStatusText = (status) => {
  const statusMap = { ON_SALE: '판매중', RESERVED: '예약중', SOLD_OUT: '판매완료' }
  return statusMap[status] || status
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300'
}

// 검색어 자동완성
const handleSearchInput = () => {
  if (suggestionTimeout) clearTimeout(suggestionTimeout)

  if (searchKeyword.value.trim().length === 0) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  suggestionTimeout = setTimeout(async () => {
    try {
      const response = await suggestCompletion({ prefix: searchKeyword.value, size: 3 })
      if (response.data.success) {
        suggestions.value = response.data.data || []
        showSuggestions.value = suggestions.value.length > 0
      }
    } catch (error) {
      console.error('자동완성 조회 실패:', error)
    }
  }, 500)
}

const selectSuggestion = (suggestion) => {
  searchKeyword.value = suggestion
  committedKeyword.value = suggestion
  showSuggestions.value = false
  applyFilters()
}

const handleSearchSubmit = () => {
  committedKeyword.value = searchKeyword.value
  showSuggestions.value = false
  applyFilters()
}

const clearSearch = () => {
  searchKeyword.value = ''
  committedKeyword.value = ''
  suggestions.value = []
  showSuggestions.value = false
  applyFilters()
}

// 가격 범위 선택
const isPriceRangeActive = (range) => {
  return minPrice.value === range.min && maxPrice.value === range.max
}

const selectPriceRange = (range) => {
  minPrice.value = range.min
  maxPrice.value = range.max
  applyFilters()
}

const applyManualPriceFilter = () => {
  applyFilters()
}

// 카테고리
const fetchRootCategories = async () => {
  try {
    const response = await getRootCategories()
    if (response.data.success) {
      const categories = response.data.data
      rootCategories.value = Array.isArray(categories[0]) ? categories[0] : categories
    }
  } catch (error) {
    console.error('카테고리 조회 실패:', error)
  }
}

const fetchChildCategories = async (parentId) => {
  try {
    const response = await getChildCategories(parentId)
    return response.data.success ? response.data.data : []
  } catch (error) {
    console.error('하위 카테고리 조회 실패:', error)
    return []
  }
}

const toggleCategory = async (categoryId, level) => {
  if (level < selectedCategories.value.length) {
    selectedCategories.value = selectedCategories.value.slice(0, level)
  }

  let selectedCategory
  if (level === 0) {
    selectedCategory = rootCategories.value.find((cat) => cat.id === categoryId)
  } else {
    selectedCategory = selectedCategories.value[level - 1].children.find(
      (cat) => cat.id === categoryId,
    )
  }

  if (!selectedCategory) return

  currentCategoryId.value = categoryId
  currentCategoryName.value = selectedCategory.name

  if (!selectedCategory.isLeaf) {
    const children = await fetchChildCategories(categoryId)
    if (level === selectedCategories.value.length) {
      selectedCategories.value.push({ parent: selectedCategory, children })
    } else {
      selectedCategories.value[level] = { parent: selectedCategory, children }
    }
  } else {
    if (level < selectedCategories.value.length) {
      selectedCategories.value = selectedCategories.value.slice(0, level)
    }
  }

  applyFilters()
}

const isSelectedCategory = (categoryId, level) => {
  if (level === 0) {
    return (
      selectedCategories.value.length > 0 && selectedCategories.value[0].parent.id === categoryId
    )
  }
  return (
    selectedCategories.value.length > level &&
    selectedCategories.value[level].parent.id === categoryId
  )
}

const resetCategories = () => {
  selectedCategories.value = []
  currentCategoryId.value = null
  currentCategoryName.value = ''
  applyFilters()
}

// 필터 적용
const applyFilters = async () => {
  currentPage.value = 1
  await fetchProducts(true)
}

const resetAllFilters = () => {
  searchKeyword.value = ''
  committedKeyword.value = ''
  minPrice.value = null
  maxPrice.value = null
  statusFilter.value = []
  selectedCategories.value = []
  currentCategoryId.value = null
  currentCategoryName.value = ''
  applyFilters()
}

// 상품 검색
const fetchProducts = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const params = {
      sortBy: sortBy.value,
      sortDirection: sortDirection.value.toUpperCase(),
      page: reset ? 1 : currentPage.value,
      size: pageSize.value,
    }

    if (currentCategoryId.value) params.categoryIds = [currentCategoryId.value]
    if (committedKeyword.value) params.keyword = committedKeyword.value
    if (minPrice.value) params.minPrice = minPrice.value
    if (maxPrice.value) params.maxPrice = maxPrice.value
    if (statusFilter.value.length > 0) params.productStatus = statusFilter.value.join(',')

    const response = await searchProducts(params)

    if (response.data.success) {
      const pageData = response.data.data
      products.value = reset
        ? pageData.content || []
        : [...products.value, ...(pageData.content || [])]
      totalCount.value = pageData.totalElements || 0
      hasMore.value = !pageData.last
      if (reset) currentPage.value = 1
    }
  } catch (error) {
    console.error('상품 검색 실패:', error)
  } finally {
    loading.value = false
  }
}

const onSortChange = () => {
  currentPage.value = 1
  fetchProducts(true)
}

const loadMore = () => {
  currentPage.value += 1
  fetchProducts(false)
}

// 추천 상품
const fetchRecommendedProducts = async () => {
  loadingRecommend.value = true
  try {
    const response = await recommendByUserView(userCode.value, 20)
    if (response.data.success) {
      recommendedProducts.value = response.data.data.recommendSpecs || []
    }
  } catch (error) {
    console.error('추천 상품 조회 실패:', error)
  } finally {
    loadingRecommend.value = false
  }
}

const startSliding = () => {
  if (recommendedProducts.value.length === 0) return
  slideInterval.value = setInterval(() => {
    slideOffset.value += SLIDE_SPEED
    const oneSetWidth = recommendedProducts.value.length * CARD_WIDTH
    if (slideOffset.value >= oneSetWidth) slideOffset.value = 0
  }, 16)
}

const stopSliding = () => {
  if (slideInterval.value) {
    clearInterval(slideInterval.value)
    slideInterval.value = null
  }
}

const goToProduct = (productCode) => {
  router.push(`/productdetail/${productCode}`)
}

// 외부 클릭 감지
const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {
    showSuggestions.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchRootCategories(), fetchProducts(true), fetchRecommendedProducts()])
  startSliding()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopSliding()
  if (suggestionTimeout) clearTimeout(suggestionTimeout)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
