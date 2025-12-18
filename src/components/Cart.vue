<template>
    <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- 헤더 -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
        <p class="text-sm text-gray-600">총 {{ cartCount }}개의 상품</p>
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
                :disabled="cartCount === 0"
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
          <div v-if="cartCount === 0" class="bg-white rounded-xl shadow-sm p-12 text-center">
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
            :key="item.productCode"
            class="bg-white rounded-xl shadow-sm p-4 sm:p-6"
          >
            <div class="flex gap-4">
              <!-- 체크박스 -->
              <div class="flex-shrink-0 pt-1">
                <input
                  v-model="selectedItems"
                  :value="item.productCode"
                  type="checkbox"
                  class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <!-- 상품 이미지 -->
              <div class="flex-shrink-0">
                <img
                  :src="item.thumbnail"
                  :alt="item.productName"
                  class="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                />
              </div>

              <!-- 상품 정보 -->
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {{ item.productName }}
                    </h3>
                  </div>
                  <div class="flex items-center gap-3">
                  </div>
                  <div class="text-right">
                    <button
                    @click="orderItem(item.productName, item.productCode)"
                    class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    주문
                  </button>
                  </div>
                </div>


                <!-- 가격 및 액션 -->
                <div class="flex items-end justify-between mt-4">
                  <div class="flex items-center gap-3">
                  </div>
                  <div class="text-right">
                    <p class="text-xl sm:text-2xl font-bold text-gray-900">
                      {{ formatPrice(item.productPrice) }}원
                    </p>
                  </div>
                </div>

                <!-- 삭제 버튼 (데스크탑) -->
                <div class="hidden sm:flex justify-end mt-3">
                  <button
                    @click="removeItem(item.productCode)"
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
                <span class="text-gray-600">총 결제 금액</span>
                <span class="font-medium text-gray-900">{{ formatPrice(totalPrice) }}원</span>
              </div>
            </div>

            <button
              @click="orderItems"
              :disabled="selectedItems.length === 0"
              class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors shadow-sm hover:shadow-md"
            >
              {{ selectedItems.length > 0 ? `${selectedItems.length}개 상품 주문하기` : '상품을 선택해주세요' }}
            </button>

            <div class="mt-4 space-y-2">
            </div>
          </div>
        </div>
      </div>

      <!-- 추천 상품 (선택사항) -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">이런 상품은 어때요?</h2>
        <div v-if="recommendCartItems.length > 0" class="relative overflow-hidden">
          <div
            class="flex gap-4 transition-transform duration-500 ease-linear"
            :style="{ transform: `translateX(-${slideOffset}px)` }"
          >
            <div
              v-for="(item, index) in slidingRecommendCartItems"
              :key="`recommend-${index}`"
              @click="goToProduct(item.productCode)"
              class="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
            >
              <img
                :src="item.thumbnail || 'https://via.placeholder.com/160'"
                :alt="item.productName"
                class="w-full h-40 object-cover"
                @error="handleImageError"
              />
              <div class="p-3">
                <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {{ item.productName }}
                </h3>
                <p class="text-base font-bold text-indigo-600">{{ formatPrice(item.productPrice) }}원</p>
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
          <p class="text-gray-600 text-base">장바구니에 상품을 추가하시면 맞춤 상품을 추천해드립니다!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createOrder, createOrders } from '@/api/order'
import router from '@/router'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import { ref, computed, watch, onMounted } from 'vue'

const cartStore = useCartStore()
const { count: cartCount, cartItems, recommendCartItems } = storeToRefs(cartStore)

// 상태 관리
const selectAll = ref(false)
const selectedItems = ref([])

const slidingRecommendCartItems = computed(() => {
  if (recommendCartItems.value.length === 0) return []
  return [...recommendCartItems.value, ...recommendCartItems.value, ...recommendCartItems.value]
})

const goToProduct = (productCode) => {
  router.push(`/productdetail/${productCode}`)
}

// 계산된 값
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, productCode) => {
    const item = cartItems.value[productCode]
    return sum + (item ? item.productPrice : 0)
  }, 0)
})

// 전체 선택 감시
watch(selectedItems, (newVal) => {
  const totalCount = Object.keys(cartItems.value).length
  selectAll.value = newVal.length === totalCount && totalCount > 0
})

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = Object.keys(cartItems.value)
  } else {
    selectedItems.value = []
  }
}

const removeItem = (productCode) => {
  if (confirm('상품을 삭제하시겠습니까?')) {
    cartStore.deleteCartItemOne(productCode)
  }
}

const deleteSelected = () => {
  if (selectedItems.value.length === cartCount.value) {
    if (confirm('전체 상품을 삭제하시겠습니까?')) {
      cartStore.deleteCartItemsAll()
    }
  } else {
    if (confirm(`선택한 ${selectedItems.value.length}개 상품을 삭제하시겠습니까?`)) {
      cartStore.deleteCartItemsSel(selectedItems.value)
    }
  }
  selectedItems.value = []
}

const orderItem = async (productName, productCode) => {
  if (confirm(`${productName} 상품을 주문하시겠습니까?`)) {
    await createOrder(productCode)
    cartStore.deleteCartItemOne(productCode)
    alert('주문이 완료되었습니다.')
    return;
  }
}

const orderItems = async () => {
  if (confirm('선택한 상품들을 주문하시겠습니까?')) {
    await createOrders(selectedItems.value)
    cartStore.deleteCartItemsSel(selectedItems.value)
    alert('주문이 완료되었습니다.')
    return;
  }
}

onMounted(async () => {
  const data = await cartStore.getRecommendProductsByCartItems()
  console.log(data)
})

</script>