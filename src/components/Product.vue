<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 최근 본 상품 기반 추천 -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold text-gray-900">🔥 회원님을 위한 추천</h2>
          <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            전체보기 →
          </button>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div
            v-for="item in recommendedProducts"
            :key="item.id"
            @click="goToProduct(item.id)"
            class="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div class="relative">
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-40 object-cover"
              />
              <button
                @click.stop="toggleLike(item.id)"
                class="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
              >
                <span :class="item.liked ? 'text-red-500' : 'text-gray-400'">❤️</span>
              </button>
            </div>
            <div class="p-3">
              <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{{ item.name }}</h3>
              <p class="text-base font-bold text-indigo-600">{{ formatPrice(item.price) }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-6">
        <!-- 왼쪽 필터 -->
        <aside class="hidden lg:block w-64 flex-shrink-0">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-8 space-y-6">
            <!-- 선택된 필터 뱃지 -->
            <div v-if="selectedFilters.length > 0" class="pb-6 border-b border-gray-200">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-900">적용된 필터</h3>
                <button
                  @click="clearAllFilters"
                  class="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  전체 해제
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="filter in selectedFilters"
                  :key="filter.id"
                  @click="removeFilter(filter.id)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full hover:bg-indigo-200 transition-colors"
                >
                  <span>{{ filter.label }}</span>
                  <span class="text-indigo-500">×</span>
                </button>
              </div>
            </div>

            <!-- 카테고리 -->
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">카테고리</h3>
              <div class="space-y-2">
                <label
                  v-for="category in categories"
                  :key="category.id"
                  class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    v-model="filters.categories"
                    :value="category.id"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700">{{ category.name }}</span>
                  <span class="ml-auto text-xs text-gray-500">({{ category.count }})</span>
                </label>
              </div>
            </div>

            <!-- 가격대 -->
            <div class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">가격대</h3>
              <div class="space-y-3">
                <div class="flex gap-2">
                  <input
                    v-model="filters.priceMin"
                    type="number"
                    placeholder="최소"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  />
                  <span class="text-gray-500 py-2">~</span>
                  <input
                    v-model="filters.priceMax"
                    type="number"
                    placeholder="최대"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="range in priceRanges"
                    :key="range.label"
                    @click="setPriceRange(range.min, range.max)"
                    class="px-3 py-1.5 border border-gray-300 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-xs font-medium transition-colors"
                  >
                    {{ range.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 상품 상태 -->
            <div class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">상품 상태</h3>
              <div class="space-y-2">
                <label
                  v-for="condition in conditions"
                  :key="condition.value"
                  class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    v-model="filters.conditions"
                    :value="condition.value"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700">{{ condition.label }}</span>
                </label>
              </div>
            </div>

            <!-- 거래 방법 -->
            <div class="pt-6 border-t border-gray-200">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">거래 방법</h3>
              <div class="space-y-2">
                <label
                  v-for="method in tradeMethods"
                  :key="method.value"
                  class="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  <input
                    v-model="filters.tradeMethods"
                    :value="method.value"
                    type="checkbox"
                    class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-gray-700">{{ method.label }}</span>
                </label>
              </div>
            </div>

            <!-- 필터 적용 버튼 -->
            <button
              @click="applyFilters"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              필터 적용
            </button>
          </div>
        </aside>

        <!-- 오른쪽 상품 목록 -->
        <main class="flex-1">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-1">전체 상품</h1>
              <p class="text-sm text-gray-600">총 {{ totalCount }}개의 상품</p>
            </div>
            <div class="flex items-center gap-3">
              <!-- 모바일 필터 버튼 -->
              <button
                @click="showMobileFilter = true"
                class="lg:hidden px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                🔍 필터
              </button>
              
              <!-- 정렬 -->
              <select
                v-model="sortBy"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-600"
              >
                <option value="latest">최신순</option>
                <option value="price-low">낮은 가격순</option>
                <option value="price-high">높은 가격순</option>
                <option value="popular">인기순</option>
              </select>

              <!-- 뷰 모드 -->
              <div class="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'px-3 py-2 text-sm',
                    viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  ▦
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'px-3 py-2 text-sm border-l border-gray-300',
                    viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <!-- 상품 목록 - 그리드 뷰 -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <div
              v-for="product in products"
              :key="product.id"
              @click="goToProduct(product.id)"
              class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="relative">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-48 object-cover"
                />
                <button
                  @click.stop="toggleLike(product.id)"
                  class="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                >
                  <span :class="product.liked ? 'text-red-500' : 'text-gray-400'">❤️</span>
                </button>
                <div class="absolute bottom-2 left-2 flex gap-1">
                  <span
                    v-if="product.condition === 'new'"
                    class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded"
                  >
                    새상품
                  </span>
                  <span
                    v-if="product.tradeSafe"
                    class="px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded"
                  >
                    안전거래
                  </span>
                </div>
              </div>
              <div class="p-4">
                <h3 class="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {{ product.name }}
                </h3>
                <p class="text-lg font-bold text-indigo-600 mb-2">
                  {{ formatPrice(product.price) }}원
                </p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ product.location }}</span>
                  <div class="flex items-center gap-2">
                    <span>❤️ {{ product.likes }}</span>
                    <span>💬 {{ product.chats }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 상품 목록 - 리스트 뷰 -->
          <div v-else class="space-y-4">
            <div
              v-for="product in products"
              :key="product.id"
              @click="goToProduct(product.id)"
              class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex gap-4">
                <img
                  :src="product.image"
                  :alt="product.name"
                  class="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-900 mb-1">
                        {{ product.name }}
                      </h3>
                      <div class="flex items-center gap-2 mb-2">
                        <span
                          v-if="product.condition === 'new'"
                          class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded"
                        >
                          새상품
                        </span>
                        <span
                          v-if="product.tradeSafe"
                          class="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded"
                        >
                          안전거래
                        </span>
                      </div>
                      <p class="text-sm text-gray-600 line-clamp-2 mb-2">
                        {{ product.description }}
                      </p>
                    </div>
                    <button
                      @click.stop="toggleLike(product.id)"
                      class="ml-4"
                    >
                      <span class="text-2xl" :class="product.liked ? 'text-red-500' : 'text-gray-400'">❤️</span>
                    </button>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-2xl font-bold text-indigo-600">
                      {{ formatPrice(product.price) }}원
                    </p>
                    <div class="flex items-center gap-4 text-sm text-gray-500">
                      <span>{{ product.location }}</span>
                      <span>❤️ {{ product.likes }}</span>
                      <span>💬 {{ product.chats }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 로딩 -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>

          <!-- 더보기 버튼 -->
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

    <!-- 모바일 필터 모달 -->
    <div
      v-if="showMobileFilter"
      class="fixed inset-0 bg-black/50 z-50 lg:hidden"
      @click.self="showMobileFilter = false"
    >
      <div class="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
        <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900">필터</h3>
          <button @click="showMobileFilter = false" class="text-2xl text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        <div class="p-4">
          <!-- 모바일에서도 동일한 필터 컨텐츠 -->
          <div class="space-y-6">
            <!-- 여기에 필터 내용 복사 (위의 aside 내용) -->
            <button
              @click="applyFilters(); showMobileFilter = false"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              필터 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref, computed } from 'vue'

// 상태 관리
const viewMode = ref('grid')
const sortBy = ref('latest')
const showMobileFilter = ref(false)
const loading = ref(false)
const hasMore = ref(true)
const totalCount = ref(248)

// 필터
const filters = ref({
  categories: [],
  priceMin: null,
  priceMax: null,
  conditions: [],
  tradeMethods: []
})

// 카테고리
const categories = [
  { id: 'smartphone', name: '스마트폰', count: 87 },
  { id: 'laptop', name: '노트북', count: 56 },
  { id: 'tablet', name: '태블릿', count: 34 },
  { id: 'watch', name: '스마트워치', count: 28 },
  { id: 'earphone', name: '이어폰', count: 43 }
]

// 가격대
const priceRanges = [
  { label: '10만원 이하', min: 0, max: 100000 },
  { label: '10-50만원', min: 100000, max: 500000 },
  { label: '50-100만원', min: 500000, max: 1000000 },
  { label: '100만원 이상', min: 1000000, max: null }
]

// 상품 상태
const conditions = [
  { value: 'new', label: '새상품' },
  { value: 'used-like-new', label: '거의 새것' },
  { value: 'used-good', label: '사용감 적음' },
  { value: 'used-normal', label: '사용감 많음' }
]

// 거래 방법
const tradeMethods = [
  { value: 'safe', label: '안전거래' },
  { value: 'direct', label: '직거래' },
  { value: 'delivery', label: '택배거래' }
]

// 추천 상품
const recommendedProducts = ref([
  {
    id: 101,
    name: '아이폰 15 Pro Max 256GB',
    price: 1550000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 102,
    name: '갤럭시 S24 Ultra 512GB',
    price: 1350000,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    liked: true
  },
  {
    id: 103,
    name: '맥북 프로 14인치 M3',
    price: 2400000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 104,
    name: '에어팟 프로 2세대',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 105,
    name: '아이패드 프로 12.9인치',
    price: 1450000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    liked: true
  }
])

// 상품 목록
const products = ref([
  {
    id: 1,
    name: '아이폰 14 Pro 128GB 딥퍼플',
    description: '상태 아주 좋아요. 케이스 끼고 사용했습니다.',
    price: 950000,
    location: '서울 강남구',
    likes: 24,
    chats: 8,
    condition: 'used-like-new',
    tradeSafe: true,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 2,
    name: '맥북 에어 M2 13인치 미드나잇',
    description: '2023년 구매, 거의 사용 안함',
    price: 1200000,
    location: '경기 성남시',
    likes: 45,
    chats: 15,
    condition: 'new',
    tradeSafe: true,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    liked: true
  },
  {
    id: 3,
    name: '갤럭시 버즈2 프로 그라파이트',
    description: '정품, 완전 새것',
    price: 180000,
    location: '서울 송파구',
    likes: 12,
    chats: 3,
    condition: 'new',
    tradeSafe: false,
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b7a28e?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 4,
    name: '아이패드 9세대 64GB 실버',
    description: '학교 과제용으로 사용',
    price: 350000,
    location: '인천 남동구',
    likes: 18,
    chats: 6,
    condition: 'used-good',
    tradeSafe: true,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 5,
    name: '애플워치 시리즈 8 GPS 45mm',
    description: '스타라이트, 정품 밴드 포함',
    price: 420000,
    location: '서울 마포구',
    likes: 31,
    chats: 11,
    condition: 'used-like-new',
    tradeSafe: true,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    liked: true
  },
  {
    id: 6,
    name: '소니 WH-1000XM5 블랙',
    description: '노이즈캔슬링 최고',
    price: 320000,
    location: '경기 고양시',
    likes: 27,
    chats: 9,
    condition: 'used-good',
    tradeSafe: false,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 7,
    name: '닌텐도 스위치 OLED 화이트',
    description: '박스, 구성품 모두 있음',
    price: 330000,
    location: '서울 강서구',
    likes: 19,
    chats: 7,
    condition: 'used-like-new',
    tradeSafe: true,
    image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop',
    liked: false
  },
  {
    id: 8,
    name: '로지텍 MX Master 3S',
    description: '거의 새것, 정품 영수증 있음',
    price: 95000,
    location: '부산 해운대구',
    likes: 14,
    chats: 4,
    condition: 'new',
    tradeSafe: false,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    liked: false
  }
])

// 선택된 필터 뱃지
const selectedFilters = computed(() => {
  const badges = []
  
  // 카테고리
  filters.value.categories.forEach(catId => {
    const cat = categories.find(c => c.id === catId)
    if (cat) {
      badges.push({ id: `cat-${catId}`, label: cat.name, type: 'category' })
    }
  })
  
  // 가격
  if (filters.value.priceMin || filters.value.priceMax) {
    const min = filters.value.priceMin ? `${formatPrice(filters.value.priceMin)}원` : '0원'
    const max = filters.value.priceMax ? `${formatPrice(filters.value.priceMax)}원` : '∞'
    badges.push({ id: 'price', label: `${min} ~ ${max}`, type: 'price' })
  }
  
  // 상태
  filters.value.conditions.forEach(condValue => {
    const cond = conditions.find(c => c.value === condValue)
    if (cond) {
      badges.push({ id: `cond-${condValue}`, label: cond.label, type: 'condition' })
    }
  })
  
  // 거래방법
  filters.value.tradeMethods.forEach(methodValue => {
    const method = tradeMethods.find(m => m.value === methodValue)
    if (method) {
      badges.push({ id: `method-${methodValue}`, label: method.label, type: 'method' })
    }
  })
  
  return badges
})

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const setPriceRange = (min, max) => {
  filters.value.priceMin = min
  filters.value.priceMax = max
}

const removeFilter = (filterId) => {
  const filter = selectedFilters.value.find(f => f.id === filterId)
  if (!filter) return
  
  if (filter.type === 'category') {
    const catId = filterId.replace('cat-', '')
    filters.value.categories = filters.value.categories.filter(c => c !== catId)
  } else if (filter.type === 'price') {
    filters.value.priceMin = null
    filters.value.priceMax = null
  } else if (filter.type === 'condition') {
    const condValue = filterId.replace('cond-', '')
    filters.value.conditions = filters.value.conditions.filter(c => c !== condValue)
  } else if (filter.type === 'method') {
    const methodValue = filterId.replace('method-', '')
    filters.value.tradeMethods = filters.value.tradeMethods.filter(m => m !== methodValue)
  }
}

const goToProduct = (productId) => {
  router.push(`/productDetail/${productId}`)
}

</script>