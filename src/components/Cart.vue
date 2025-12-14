<template>
    <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 헤더 -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
        <p class="text-sm text-gray-600">총 {{ cartItems.length }}개의 상품</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 장바구니 상품 목록 -->
        <div class="lg:col-span-2 space-y-4">
          <!-- 전체 선택 -->
          <div class="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="selectAll"
                @change="toggleSelectAll"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-sm font-semibold text-gray-900">전체 선택</span>
            </label>
            <button
              @click="deleteSelected"
              :disabled="selectedItems.length === 0"
              class="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              선택 삭제
            </button>
          </div>

          <!-- 상품이 없을 때 -->
          <div v-if="cartItems.length === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">장바구니가 비어있습니다</h3>
            <p class="text-sm text-gray-600 mb-6">마음에 드는 상품을 담아보세요!</p>
            <router-link
              to="/"
              class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              쇼핑 계속하기
            </router-link>
          </div>

          <!-- 장바구니 아이템 -->
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          >
            <div class="flex gap-4">
              <!-- 체크박스 -->
              <div class="flex-shrink-0 pt-1">
                <input
                  v-model="selectedItems"
                  :value="item.id"
                  type="checkbox"
                  class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- 상품 이미지 -->
              <div class="flex-shrink-0">
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                />
              </div>

              <!-- 상품 정보 -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {{ item.name }}
                    </h3>
                    <p class="text-sm text-gray-600 mb-2">{{ item.seller }}</p>
                    <div class="flex items-center gap-2">
                      <span
                        v-if="item.condition === 'new'"
                        class="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                      >
                        새상품
                      </span>
                      <span
                        v-else
                        class="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                      >
                        중고
                      </span>
                    </div>
                  </div>
                  
                  <!-- 삭제 버튼 (모바일) -->
                  <button
                    @click="removeItem(item.id)"
                    class="sm:hidden text-gray-400 hover:text-red-600 transition-colors ml-2"
                  >
                    <span class="text-xl">🗑️</span>
                  </button>
                </div>

                <!-- 가격 및 액션 -->
                <div class="flex items-end justify-between mt-4">
                  <div class="flex items-center gap-3">
                    <!-- 수량 조절 -->
                    <div class="flex items-center border border-gray-300 rounded-lg">
                      <button
                        @click="decreaseQuantity(item.id)"
                        :disabled="item.quantity <= 1"
                        class="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        −
                      </button>
                      <span class="px-4 py-1 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                        {{ item.quantity }}
                      </span>
                      <button
                        @click="increaseQuantity(item.id)"
                        class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div class="text-right">
                    <p class="text-xl sm:text-2xl font-bold text-gray-900">
                      {{ formatPrice(item.price * item.quantity) }}원
                    </p>
                    <p v-if="item.quantity > 1" class="text-xs text-gray-500 mt-1">
                      개당 {{ formatPrice(item.price) }}원
                    </p>
                  </div>
                </div>

                <!-- 삭제 버튼 (데스크탑) -->
                <div class="hidden sm:flex justify-end mt-3">
                  <button
                    @click="removeItem(item.id)"
                    class="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 주문 요약 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6">주문 요약</h2>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">상품 금액</span>
                <span class="font-medium text-gray-900">{{ formatPrice(totalPrice) }}원</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">배송비</span>
                <span class="font-medium text-gray-900">{{ formatPrice(shippingFee) }}원</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">할인 금액</span>
                <span class="font-medium text-red-600">-{{ formatPrice(discount) }}원</span>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">총 결제 금액</span>
                <span class="text-2xl font-bold text-indigo-600">
                  {{ formatPrice(finalPrice) }}원
                </span>
              </div>
            </div>

            <button
              @click="checkout"
              :disabled="selectedItems.length === 0"
              class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors shadow-sm hover:shadow-md"
            >
              {{ selectedItems.length > 0 ? `${selectedItems.length}개 상품 주문하기` : '상품을 선택해주세요' }}
            </button>

            <div class="mt-4 space-y-2">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>✓</span>
                <span>안전한 결제 시스템</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>✓</span>
                <span>구매자 보호 프로그램</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span>✓</span>
                <span>7일 이내 반품 가능</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 추천 상품 (선택사항) -->
      <div v-if="cartItems.length > 0" class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">이런 상품은 어때요?</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="item in recommendedItems"
            :key="item.id"
            class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-40 object-cover"
            />
            <div class="p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                {{ item.name }}
              </h3>
              <p class="text-lg font-bold text-indigo-600">
                {{ formatPrice(item.price) }}원
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()

// 상태 관리
const selectAll = ref(false)
const selectedItems = ref([])

// 더미 데이터 (실제로는 API에서 가져옴)
const cartItems = ref([
  {
    id: 1,
    name: '아이폰 15 Pro 256GB 티타늄 블루',
    seller: '신뢰판매자',
    price: 1350000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
    condition: 'new'
  },
  {
    id: 2,
    name: '갤럭시 버즈2 프로 그라파이트',
    seller: '테크샵',
    price: 180000,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1590658165737-15a047b7a28e?w=400&h=400&fit=crop',
    condition: 'used'
  },
  {
    id: 3,
    name: '맥북 에어 M2 13인치 미드나잇',
    seller: '애플마스터',
    price: 1450000,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    condition: 'new'
  }
])

// 추천 상품
const recommendedItems = ref([
  {
    id: 101,
    name: '에어팟 프로 2세대',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop'
  },
  {
    id: 102,
    name: '아이패드 프로 11인치',
    price: 1200000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'
  },
  {
    id: 103,
    name: '애플워치 시리즈 9',
    price: 550000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
  },
  {
    id: 104,
    name: '맥 미니 M2',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop'
  }
])

// 계산된 값
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, itemId) => {
    const item = cartItems.value.find(i => i.id === itemId)
    return sum + (item ? item.price * item.quantity : 0)
  }, 0)
})

const shippingFee = computed(() => {
  return totalPrice.value >= 50000 ? 0 : 3000
})

const discount = computed(() => {
  // 예시: 100만원 이상 구매시 5% 할인
  return totalPrice.value >= 1000000 ? Math.floor(totalPrice.value * 0.05) : 0
})

const finalPrice = computed(() => {
  return totalPrice.value + shippingFee.value - discount.value
})

// 전체 선택 감시
watch(selectedItems, (newVal) => {
  selectAll.value = newVal.length === cartItems.value.length && cartItems.value.length > 0
})

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = cartItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

const increaseQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item) {
    item.quantity++
  }
}

const decreaseQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    item.quantity--
  }
}

const removeItem = (itemId) => {
  if (confirm('상품을 삭제하시겠습니까?')) {
    const index = cartItems.value.findIndex(i => i.id === itemId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      selectedItems.value = selectedItems.value.filter(id => id !== itemId)
    }
  }
}

const deleteSelected = () => {
  if (confirm(`선택한 ${selectedItems.value.length}개 상품을 삭제하시겠습니까?`)) {
    cartItems.value = cartItems.value.filter(item => !selectedItems.value.includes(item.id))
    selectedItems.value = []
  }
}

const checkout = () => {
  if (selectedItems.value.length === 0) {
    alert('상품을 선택해주세요.')
    return
  }
  
  const selectedProducts = cartItems.value.filter(item => selectedItems.value.includes(item.id))
  console.log('주문 상품:', selectedProducts)
  
  // 주문 페이지로 이동
  // router.push({
  //   name: 'checkout',
  //   params: { items: selectedProducts }
  // })
  
  alert(`${selectedItems.value.length}개 상품을 주문합니다.`)
}

// 초기 로딩시 전체 선택
// onMounted(() => {
//   selectedItems.value = cartItems.value.map(item => item.id)
// })
</script>

<style scoped>
/* 추가 스타일 */
</style>