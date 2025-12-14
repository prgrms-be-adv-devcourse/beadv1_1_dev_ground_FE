<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 상단 검색바 (sticky) -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="relative">
          <input
            v-model="searchKeyword"
            @input="handleSearchInput"
            @keyup.enter="handleSearchSubmit"
            @focus="showSuggestions = true"
            type="text"
            placeholder="검색어를 입력해주세요"
            class="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-indigo-600 transition-colors"
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
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
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

        <!-- 연관 검색어 태그 -->
        <div v-if="relatedKeywords.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span class="text-xs text-gray-500">연관 검색어:</span>
          <button
            v-for="(keyword, index) in relatedKeywords"
            :key="index"
            @click="searchByRelatedKeyword(keyword)"
            class="px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 text-xs rounded-full transition-colors border border-gray-200 hover:border-indigo-300"
          >
            {{ keyword }}
          </button>
        </div>
      </div>
    </div>

    <!-- 추천 상품 슬라이딩 섹션 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">
          {{ userCode ? '회원님을 위한 추천' : '인기 상품 추천' }}
        </h2>

        <div v-if="loadingRecommend" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"
          ></div>
        </div>

        <div v-else-if="recommendedProducts.length > 0" class="relative overflow-hidden">
          <div
            class="flex gap-4 transition-transform duration-500 ease-linear"
            :style="{ transform: `translateX(-${slideOffset}px)` }"
          >
            <div
              v-for="(item, index) in slidingRecommendedProducts"
              :key="`recommend-${index}`"
              @click="goToProduct(item.productCode)"
              class="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
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
          <p class="text-gray-600 text-base">상품을 조회하시면 맞춤 상품을 추천해드립니다!</p>
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
                    :class="{
                      'bg-indigo-50 text-indigo-700 font-semibold': isSelectedCategory(
                        category.id,
                        0,
                      ),
                    }"
                  >
                    <span class="text-sm">{{ category.name }}</span>
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
                        :class="{
                          'bg-indigo-50 text-indigo-700 font-semibold': isSelectedCategory(
                            child.id,
                            1,
                          ),
                        }"
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
                            'bg-indigo-50 text-indigo-700 font-semibold': isSelectedCategory(
                              child3.id,
                              2,
                            ),
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

              <div class="space-y-2">
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

                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="range in priceRanges"
                    :key="range.label"
                    @click="selectPriceRange(range)"
                    class="px-2 py-1.5 text-xs border rounded transition-all text-center"
                    :class="
                      isPriceRangeActive(range)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    "
                  >
                    {{ range.label }}
                  </button>
                </div>

                <button
                  @click="applyManualPriceFilter"
                  class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  적용
                </button>
              </div>
            </div>

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
              <option value="updatedAt-desc">업데이트순</option>
            </select>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="product in products"
              :key="product.productCode"
              @click="goToProduct(product.productCode)"
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
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
                    class="px-2 py-1 text-white text-xs font-bold rounded shadow-lg"
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
            <svg
              class="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-gray-500 text-lg">검색 결과가 없습니다.</p>
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
import { useRouter, useRoute } from 'vue-router'
import {
  searchProducts,
  recommendByUserView,
  suggestCompletion,
  suggestRelated,
} from '@/api/product'
import { getRootCategories, getChildCategories } from '@/api/category'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const loadingRecommend = ref(false)
const totalCount = ref(0)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const userCode = ref(sessionStorage.getItem('X-CODE') || null)

const sortOption = ref('createdAt-desc')
const sortBy = computed(() => {
  const parts = sortOption.value.split('-')
  return parts[0]
})
const sortDirection = computed(() => {
  const parts = sortOption.value.split('-')
  return parts[1]
})

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

const searchKeyword = ref('')
const committedKeyword = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
const relatedKeywords = ref([])
let suggestionTimeout = null

const minPrice = ref(null)
const maxPrice = ref(null)
const priceRanges = [
  { label: '~1만원', min: null, max: 10000 },
  { label: '1~10만원', min: 10001, max: 100000 },
  { label: '10~50만원', min: 100001, max: 500000 },
  { label: '50만원~', min: 500001, max: null },
]

const hasActiveFilters = computed(() => {
  return committedKeyword.value || minPrice.value || maxPrice.value || currentCategoryId.value
})

const slidingRecommendedProducts = computed(() => {
  if (recommendedProducts.value.length === 0) return []
  return [...recommendedProducts.value, ...recommendedProducts.value, ...recommendedProducts.value]
})

const formatPrice = (price) => (price ? price.toLocaleString('ko-KR') : '0')

const getProductStatusText = (status) => {
  const statusMap = { ON_SALE: '판매중', RESERVED: '예약중', SOLD_OUT: '판매완료' }
  return statusMap[status] || status
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300'
}

const updateURL = () => {
  const query = {}
  if (committedKeyword.value) query.keyword = committedKeyword.value
  if (currentCategoryId.value) query.categoryId = currentCategoryId.value
  if (minPrice.value) query.minPrice = minPrice.value
  if (maxPrice.value) query.maxPrice = maxPrice.value
  if (sortOption.value !== 'createdAt-desc') query.sort = sortOption.value

  const hasFilters = Object.keys(query).length > 0

  if (hasFilters) {
    router.replace({ name: 'product', query })
  } else {
    router.replace({ name: 'home' })
  }
}

const loadFromURL = () => {
  const query = route.query

  if (query.keyword) {
    searchKeyword.value = query.keyword
    committedKeyword.value = query.keyword
  }
  if (query.categoryId) currentCategoryId.value = parseInt(query.categoryId)
  if (query.minPrice) minPrice.value = parseInt(query.minPrice)
  if (query.maxPrice) maxPrice.value = parseInt(query.maxPrice)
  if (query.sort) sortOption.value = query.sort
}

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

const handleSearchSubmit = async () => {
  committedKeyword.value = searchKeyword.value
  showSuggestions.value = false
  await applyFilters()

  if (committedKeyword.value) {
    fetchRelatedKeywords()
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  committedKeyword.value = ''
  suggestions.value = []
  showSuggestions.value = false
  relatedKeywords.value = []
  applyFilters()
}

const fetchRelatedKeywords = async () => {
  try {
    const response = await suggestRelated({ keyword: committedKeyword.value, size: 5 })
    if (response.data.success) {
      relatedKeywords.value = response.data.data || []
    }
  } catch (error) {
    console.error('연관 검색어 조회 실패:', error)
  }
}

const searchByRelatedKeyword = (keyword) => {
  searchKeyword.value = keyword
  committedKeyword.value = keyword
  relatedKeywords.value = []
  applyFilters()
  fetchRelatedKeywords()
}

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

const applyFilters = async () => {
  currentPage.value = 1
  updateURL()
  await fetchProducts(true)
}

const resetAllFilters = () => {
  searchKeyword.value = ''
  committedKeyword.value = ''
  relatedKeywords.value = []
  minPrice.value = null
  maxPrice.value = null
  selectedCategories.value = []
  currentCategoryId.value = null
  currentCategoryName.value = ''
  sortOption.value = 'createdAt-desc'
  applyFilters()
}

const fetchProducts = async (reset = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const params = {
      sortBy: sortBy.value,
      sortDirection: sortDirection.value.toUpperCase(),
      page: reset ? 1 : currentPage.value,
      size: pageSize.value,
      productStatus: 'ON_SALE',
    }

    if (currentCategoryId.value) params.categoryIds = [currentCategoryId.value]
    if (committedKeyword.value) params.keyword = committedKeyword.value
    if (minPrice.value) params.minPrice = minPrice.value
    if (maxPrice.value) params.maxPrice = maxPrice.value

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
  updateURL()
  fetchProducts(true)
}

const loadMore = () => {
  currentPage.value += 1
  fetchProducts(false)
}

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

const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {
    showSuggestions.value = false
  }
}

onMounted(async () => {
  loadFromURL()
  await Promise.all([fetchRootCategories(), fetchProducts(true), fetchRecommendedProducts()])
  if (committedKeyword.value) {
    fetchRelatedKeywords()
  }
  startSliding()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  stopSliding()
  if (suggestionTimeout) clearTimeout(suggestionTimeout)
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => route.query,
  () => {
    loadFromURL()
    fetchProducts(true)
    if (committedKeyword.value) {
      fetchRelatedKeywords()
    }
  },
  { deep: true },
)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
