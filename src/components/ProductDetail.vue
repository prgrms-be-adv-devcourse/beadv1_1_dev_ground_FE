<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 뒤로가기 -->
      <button
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <span class="text-xl">←</span>
        <span class="text-sm font-medium">목록으로</span>
      </button>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 왼쪽: 이미지 갤러리 -->
        <div class="lg:col-span-2 space-y-4">
          <!-- 메인 이미지 -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
            <img
              :src="selectedImage"
              :alt="product.name"
              class="w-full h-96 sm:h-[500px] object-cover"
            />
          </div>

          <!-- 썸네일 -->
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              @click="selectedImage = image"
              :class="[
                'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                selectedImage === image ? 'border-indigo-600' : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <img
                :src="image"
                :alt="`상품 이미지 ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>

          <!-- 상품 정보 탭 -->
          <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div class="border-b border-gray-200">
              <div class="flex">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="selectedTab = tab.id"
                  :class="[
                    'flex-1 px-6 py-4 text-sm font-semibold transition-colors border-b-2',
                    selectedTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  ]"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- 상세 설명 -->
            <div v-if="selectedTab === 'description'" class="p-6">
              <div class="prose max-w-none">
                <p class="text-gray-700 whitespace-pre-line leading-relaxed">{{ product.description }}</p>
              </div>
            </div>

            <!-- 거래 정보 -->
            <div v-if="selectedTab === 'trade'" class="p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-sm font-medium text-gray-600">거래 방법</span>
                  <span class="text-sm font-semibold text-gray-900">{{ product.tradeMethod }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-sm font-medium text-gray-600">배송비</span>
                  <span class="text-sm font-semibold text-gray-900">{{ product.shippingFee }}</span>
                </div>
                <div class="flex items-center justify-between py-3 border-b border-gray-100">
                  <span class="text-sm font-medium text-gray-600">거래 지역</span>
                  <span class="text-sm font-semibold text-gray-900">{{ product.location }}</span>
                </div>
                <div class="flex items-center justify-between py-3">
                  <span class="text-sm font-medium text-gray-600">등록일</span>
                  <span class="text-sm font-semibold text-gray-900">{{ formatDate(product.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- 리뷰 -->
            <div v-if="selectedTab === 'reviews'" class="p-6">
              <div v-if="reviews.length === 0" class="text-center py-12">
                <div class="text-5xl mb-4">⭐</div>
                <p class="text-gray-600">아직 리뷰가 없습니다</p>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="pb-4 border-b border-gray-100 last:border-0"
                >
                  <div class="flex items-center gap-3 mb-2">
                    <img
                      :src="review.userImage"
                      :alt="review.userName"
                      class="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p class="font-semibold text-gray-900 text-sm">{{ review.userName }}</p>
                      <div class="flex items-center gap-1">
                        <span v-for="i in 5" :key="i" class="text-yellow-400 text-sm">
                          {{ i <= review.rating ? '⭐' : '☆' }}
                        </span>
                      </div>
                    </div>
                    <span class="ml-auto text-xs text-gray-500">{{ formatDate(review.date) }}</span>
                  </div>
                  <p class="text-sm text-gray-700">{{ review.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 오른쪽: 구매 정보 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm p-6 sticky top-8 space-y-6">
            <!-- 판매자 정보 -->
            <div class="pb-6 border-b border-gray-200">
              <div class="flex items-center gap-3 mb-4">
                <img
                  :src="seller.profileImage"
                  :alt="seller.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ seller.name }}</h3>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <span>⭐ {{ seller.rating }}</span>
                    <span>·</span>
                    <span>거래 {{ seller.tradeCount }}회</span>
                  </div>
                </div>
              </div>
              <button
                @click="goToSellerProfile"
                class="w-full py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
              >
                판매자 프로필
              </button>
            </div>

            <!-- 상품명 -->
            <div>
              <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
              <div class="flex items-center gap-2 mb-4">
                <span
                  v-if="product.condition === 'new'"
                  class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                >
                  새상품
                </span>
                <span
                  v-else
                  class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                >
                  중고
                </span>
                <span
                  v-if="product.tradeSafe"
                  class="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full"
                >
                  안전거래
                </span>
              </div>
            </div>

            <!-- 가격 -->
            <div>
              <p class="text-3xl font-bold text-indigo-600 mb-2">
                {{ formatPrice(product.price) }}원
              </p>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>👁️ {{ product.views }}</span>
                <span>❤️ {{ product.likes }}</span>
                <span>💬 {{ product.chats }}</span>
              </div>
            </div>

            <!-- 수량 -->
            <div v-if="product.stock > 1">
              <label class="block text-sm font-semibold text-gray-700 mb-2">수량</label>
              <div class="flex items-center border-2 border-gray-200 rounded-lg w-32">
                <button
                  @click="decreaseQuantity"
                  :disabled="quantity <= 1"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span class="flex-1 text-center font-semibold text-gray-900">{{ quantity }}</span>
                <button
                  @click="increaseQuantity"
                  :disabled="quantity >= product.stock"
                  class="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-2">재고 {{ product.stock }}개</p>
            </div>

            <!-- 총 금액 -->
            <div v-if="product.stock > 1" class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">총 금액</span>
                <span class="text-2xl font-bold text-indigo-600">
                  {{ formatPrice(product.price * quantity) }}원
                </span>
              </div>
            </div>

            <!-- 액션 버튼 -->
            <div class="space-y-3">
              <button
                @click="startChat"
                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <span class="text-xl">💬</span>
                <span>채팅하기</span>
              </button>

              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="toggleLike"
                  :class="[
                    'py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 border-2',
                    isLiked
                      ? 'bg-red-50 border-red-500 text-red-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  ]"
                >
                  <span class="text-xl">{{ isLiked ? '❤️' : '🤍' }}</span>
                  <span>{{ isLiked ? '찜 취소' : '찜하기' }}</span>
                </button>

                <button
                  @click="addToCart"
                  class="py-3 bg-white border-2 border-gray-300 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span class="text-xl">🛒</span>
                  <span>장바구니</span>
                </button>
              </div>

              <button
                @click="buyNow"
                class="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 rounded-xl transition-colors"
              >
                바로 구매
              </button>
            </div>

            <!-- 안전거래 안내 -->
            <div class="bg-indigo-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-indigo-900 mb-2">🔒 안전거래 안내</h4>
              <ul class="space-y-1 text-xs text-indigo-700">
                <li>✓ 구매자 보호 프로그램</li>
                <li>✓ 에스크로 결제 시스템</li>
                <li>✓ 7일 이내 반품 가능</li>
              </ul>
            </div>

            <!-- 신고하기 -->
            <button
              @click="reportProduct"
              class="w-full text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              🚨 신고하기
            </button>
          </div>
        </div>
      </div>

      <!-- 연관 상품 -->
      <div class="mt-16">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">비슷한 상품</h2>
          <button class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            더보기 →
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div
            v-for="item in relatedProducts"
            :key="item.id"
            @click="goToProduct(item.id)"
            class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-40 object-cover"
            />
            <div class="p-3">
              <h3 class="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{{ item.name }}</h3>
              <p class="text-base font-bold text-indigo-600">{{ formatPrice(item.price) }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from '@/router'
import { ref } from 'vue'
import { addCartItem } from '@/api/cart'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// 상태 관리
const selectedImage = ref('https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop')
const selectedTab = ref('description')
const quantity = ref(1)
const isLiked = ref(false)

// 탭
const tabs = [
  { id: 'description', label: '상세설명' },
  { id: 'trade', label: '거래정보' },
  { id: 'reviews', label: '리뷰' }
]

// 상품 정보
const product = ref({
  id: 1,
  name: '아이폰 15 Pro 256GB 티타늄 블루',
  price: 1350000,
  condition: 'new',
  tradeSafe: true,
  views: 234,
  likes: 45,
  chats: 12,
  stock: 1,
  location: '서울 강남구',
  tradeMethod: '직거래, 택배거래',
  shippingFee: '무료',
  createdAt: '2024-12-10',
  description: `✨ 아이폰 15 Pro 256GB 티타늄 블루 판매합니다.

📦 구성품
- 아이폰 15 Pro 본체
- 정품 충전 케이블
- 정품 박스
- 미개봉 정품 스티커

💎 상태
- 2024년 11월 구매
- 사용 기간 1개월
- 케이스 끼고 사용해서 스크래치 전혀 없음
- 액정보호필름 부착되어 있음

🔒 안전거래
- dbay 안전결제 가능
- 직거래 환영 (강남역 근처)
- 택배거래 가능 (무료배송)

📞 연락처
- 채팅으로 문의 주세요
- 빠른 답변 드리겠습니다

⚠️ 주의사항
- 에눌 불가
- 교환 및 환불 불가 (단, 제품 하자 시 가능)`,
  images: [
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1695048133082-367c8a42f4c8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1695048132969-24ff0ad42d5b?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1695048133526-86fffb0ddfc8?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1695048133420-9265e1b15c30?w=800&h=800&fit=crop'
  ]
})

// 판매자 정보
const seller = ref({
  name: '신뢰판매자',
  profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
  rating: 4.8,
  tradeCount: 127
})

// 리뷰
const reviews = ref([
  {
    id: 1,
    userName: '구매왕',
    userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    rating: 5,
    content: '상태 정말 좋고 판매자님도 친절하세요. 강추합니다!',
    date: '2024-12-08'
  },
  {
    id: 2,
    userName: '테크러버',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    rating: 5,
    content: '빠른 배송, 완벽한 포장! 감사합니다.',
    date: '2024-12-05'
  }
])

// 연관 상품
const relatedProducts = ref([
  {
    id: 2,
    name: '아이폰 15 Pro Max 512GB',
    price: 1750000,
    image: 'https://images.unsplash.com/photo-1695048133082-367c8a42f4c8?w=400&h=400&fit=crop'
  },
  {
    id: 3,
    name: '아이폰 14 Pro 256GB',
    price: 950000,
    image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop'
  },
  {
    id: 4,
    name: '에어팟 프로 2세대',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop'
  },
  {
    id: 5,
    name: '애플워치 시리즈 9',
    price: 550000,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop'
  },
  {
    id: 6,
    name: '맥북 에어 M2',
    price: 1450000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'
  }
])

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const goBack = () => {
  router.back()
  console.log('뒤로가기')
}

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const toggleLike = () => {
  isLiked.value = !isLiked.value
  console.log('찜하기:', isLiked.value)
}

const addToCart = async () => {
  try {
    // 상품 ID와 수량을 API에 전달
    await addCartItem(product.value.id) 
    await cartStore.getCart() // 헤더 카운트 업데이트
    alert('장바구니에 추가되었습니다.')
  } catch (error) {
    console.error('장바구니 추가 실패:', error)
    alert('장바구니 추가에 실패했습니다.')
  }
}

const buyNow = () => {
  console.log('바로 구매:', { productId: product.value.id, quantity: quantity.value })
  // router.push('/checkout')
}

const startChat = () => {
  console.log('채팅 시작:', { sellerId: seller.value.name, productId: product.value.id })
  // router.push(`/chat/${seller.value.id}`)
  alert('판매자와 채팅을 시작합니다.')
}

const goToSellerProfile = () => {
  console.log('판매자 프로필')
  // router.push(`/seller/${seller.value.id}`)
}

const reportProduct = () => {
  if (confirm('이 상품을 신고하시겠습니까?')) {
    console.log('상품 신고')
    alert('신고가 접수되었습니다.')
  }
}

const goToProduct = (productId) => {
  console.log('상품 이동:', productId)
  // router.push(`/product/${productId}`)
}
</script>

<style scoped>
/* 추가 스타일 */
</style>