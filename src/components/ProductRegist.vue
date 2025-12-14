<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 헤더 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">상품 등록</h1>
        <p class="text-sm text-gray-600">정확한 정보를 입력해주세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 이미지 등록 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">상품 이미지</h2>
          <p class="text-sm text-gray-600 mb-4">최소 1장, 최대 10장까지 등록 가능합니다</p>
          
          <div class="grid grid-cols-5 gap-4">
            <!-- 메인 이미지 표시 -->
            <div
              v-for="(image, index) in imagePreviews"
              :key="index"
              class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <img :src="image" alt="상품 이미지" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <div
                v-if="index === 0"
                class="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white text-xs py-1 text-center font-semibold"
              >
                대표
              </div>
            </div>

            <!-- 이미지 추가 버튼 -->
            <label
              v-if="imagePreviews.length < 10"
              class="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <span class="text-3xl text-gray-400">+</span>
              <span class="text-xs text-gray-500 mt-1">{{ imagePreviews.length }}/10</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageUpload"
                class="hidden"
              />
            </label>
          </div>
        </div>

        <!-- 기본 정보 -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 class="text-lg font-bold text-gray-900 mb-4">기본 정보</h2>

          <!-- 카테고리 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              카테고리 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.category"
              required
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            >
              <option value="">선택해주세요</option>
              <option value="smartphone">📱 스마트폰</option>
              <option value="laptop">💻 노트북</option>
              <option value="tablet">📱 태블릿</option>
              <option value="watch">⌚ 스마트워치</option>
              <option value="earphone">🎧 이어폰/헤드폰</option>
              <option value="camera">📷 카메라</option>
              <option value="game">🎮 게임기</option>
              <option value="keyboard">⌨️ 키보드/마우스</option>
              <option value="monitor">🖥️ 모니터</option>
              <option value="etc">📦 기타</option>
            </select>
          </div>

          <!-- 상품명 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              상품명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              placeholder="예) 아이폰 15 Pro 256GB 티타늄 블루"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
              maxlength="100"
            />
            <p class="mt-2 text-xs text-gray-500">{{ form.title.length }}/100</p>
          </div>

          <!-- 상품 상태 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              상품 상태 <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label
                v-for="condition in conditions"
                :key="condition.value"
                :class="[
                  'flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all',
                  form.condition === condition.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                ]"
              >
                <input
                  v-model="form.condition"
                  type="radio"
                  :value="condition.value"
                  class="hidden"
                  required
                />
                <span class="text-2xl mb-2">{{ condition.icon }}</span>
                <span class="text-sm font-semibold text-gray-900">{{ condition.label }}</span>
                <span class="text-xs text-gray-600 text-center mt-1">{{ condition.desc }}</span>
              </label>
            </div>
          </div>

          <!-- 가격 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              가격 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="form.price"
                type="number"
                required
                placeholder="0"
                class="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                min="0"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">원</span>
            </div>
            <p v-if="form.price" class="mt-2 text-sm text-indigo-600 font-semibold">
              {{ formatPrice(form.price) }}원
            </p>
          </div>

          <!-- 수량 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              수량 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.stock"
              type="number"
              required
              placeholder="1"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
              min="1"
            />
          </div>
        </div>

        <!-- 상세 설명 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">상세 설명</h2>
          <textarea
            v-model="form.description"
            required
            rows="10"
            placeholder="상품 설명을 자세히 작성해주세요.&#10;&#10;- 상품 상태&#10;- 구매 시기&#10;- 사용 기간&#10;- 하자 유무&#10;- 포함 구성품"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
            maxlength="2000"
          ></textarea>
          <p class="mt-2 text-xs text-gray-500">{{ form.description.length }}/2000</p>
        </div>

        <!-- 거래 정보 -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <h2 class="text-lg font-bold text-gray-900 mb-4">거래 정보</h2>

          <!-- 거래 방법 -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              거래 방법 <span class="text-red-500">*</span> <span class="text-xs text-gray-500 font-normal">(중복 선택 가능)</span>
            </label>
            <div class="space-y-2">
              <label
                v-for="method in tradeMethods"
                :key="method.value"
                class="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  v-model="form.tradeMethods"
                  type="checkbox"
                  :value="method.value"
                  class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <div class="flex-1">
                  <span class="text-sm font-semibold text-gray-900">{{ method.label }}</span>
                  <p class="text-xs text-gray-600">{{ method.desc }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- 거래 지역 -->
          <div v-if="form.tradeMethods.includes('direct')">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              거래 지역 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.location"
              type="text"
              placeholder="예) 서울 강남구"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          <!-- 배송비 -->
          <div v-if="form.tradeMethods.includes('delivery')">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              배송비
            </label>
            <div class="flex gap-3">
              <label class="flex items-center gap-2">
                <input
                  v-model="form.shippingFee"
                  type="radio"
                  value="free"
                  class="w-4 h-4 text-indigo-600"
                />
                <span class="text-sm text-gray-700">무료</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="form.shippingFee"
                  type="radio"
                  value="paid"
                  class="w-4 h-4 text-indigo-600"
                />
                <span class="text-sm text-gray-700">착불</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  v-model="form.shippingFee"
                  type="radio"
                  value="prepaid"
                  class="w-4 h-4 text-indigo-600"
                />
                <span class="text-sm text-gray-700">선불</span>
              </label>
            </div>
          </div>

          <!-- 안전거래 -->
          <div>
            <label class="flex items-center gap-3 p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl cursor-pointer">
              <input
                v-model="form.tradeSafe"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <div class="flex-1">
                <span class="text-sm font-semibold text-indigo-900">🔒 안전거래 사용</span>
                <p class="text-xs text-indigo-700 mt-1">
                  구매자 보호를 위한 에스크로 결제 시스템을 사용합니다
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="goBack"
            class="flex-1 py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md"
          >
            {{ isSubmitting ? '등록 중...' : '상품 등록' }}
          </button>
        </div>
      </form>

      <!-- 안내 -->
      <div class="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 class="text-sm font-semibold text-yellow-900 mb-2">⚠️ 주의사항</h3>
        <ul class="text-xs text-yellow-800 space-y-1">
          <li>• 허위 매물 등록 시 이용이 제한될 수 있습니다</li>
          <li>• 상품과 관련 없는 이미지는 삭제될 수 있습니다</li>
          <li>• 가품, 불법 복제품 판매는 금지됩니다</li>
          <li>• 타인의 명예를 훼손하거나 불쾌감을 주는 내용은 제한됩니다</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()

// 상태 관리
const isSubmitting = ref(false)
const imagePreviews = ref([])
const imageFiles = ref([])

// 폼 데이터
const form = reactive({
  category: '',
  title: '',
  condition: '',
  price: null,
  stock: 1,
  description: '',
  tradeMethods: [],
  location: '',
  shippingFee: 'free',
  tradeSafe: true
})

// 상품 상태
const conditions = [
  { value: 'new', label: '새상품', icon: '✨', desc: '미개봉' },
  { value: 'used-like-new', label: '거의 새것', icon: '🌟', desc: '사용감 없음' },
  { value: 'used-good', label: '사용감 적음', icon: '👍', desc: '깨끗함' },
  { value: 'used-normal', label: '사용감 있음', icon: '📦', desc: '정상 작동' }
]

// 거래 방법
const tradeMethods = [
  { value: 'safe', label: '안전거래', desc: 'dbay 에스크로 결제' },
  { value: 'direct', label: '직거래', desc: '직접 만나서 거래' },
  { value: 'delivery', label: '택배거래', desc: '택배로 안전하게' }
]

// 이미지 업로드
const handleImageUpload = (e) => {
  const files = Array.from(e.target.files)
  const remainingSlots = 10 - imagePreviews.value.length

  if (files.length > remainingSlots) {
    alert(`최대 ${remainingSlots}장까지 추가할 수 있습니다.`)
    return
  }

  files.forEach(file => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하만 가능합니다.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviews.value.push(e.target.result)
      imageFiles.value.push(file)
    }
    reader.readAsDataURL(file)
  })

  e.target.value = ''
}

// 이미지 제거
const removeImage = (index) => {
  imagePreviews.value.splice(index, 1)
  imageFiles.value.splice(index, 1)
}

// 가격 포맷
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

// 폼 제출
const handleSubmit = async () => {
  // 유효성 검사
  if (imagePreviews.value.length === 0) {
    alert('상품 이미지를 최소 1장 이상 등록해주세요.')
    return
  }

  if (form.tradeMethods.length === 0) {
    alert('거래 방법을 선택해주세요.')
    return
  }

  if (form.tradeMethods.includes('direct') && !form.location) {
    alert('직거래 시 거래 지역을 입력해주세요.')
    return
  }

  isSubmitting.value = true

  try {
    // FormData 생성
    const formData = new FormData()
    
    // 이미지 추가
    imageFiles.value.forEach((file, index) => {
      formData.append('images', file)
    })

    // 나머지 데이터 추가
    Object.keys(form).forEach(key => {
      if (key === 'tradeMethods') {
        formData.append(key, JSON.stringify(form[key]))
      } else {
        formData.append(key, form[key])
      }
    })

    // API 호출
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formData
    })

    if (response.ok) {
      const data = await response.json()
      console.log('상품 등록 성공:', data)
      alert('상품이 등록되었습니다!')
      
      // 상품 상세 페이지로 이동
      // router.push(`/product/${data.id}`)
    } else {
      const error = await response.json()
      alert(error.message || '상품 등록에 실패했습니다.')
    }
  } catch (error) {
    console.error('상품 등록 오류:', error)
    alert('상품 등록 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

// 취소
const goBack = () => {
  if (confirm('작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?')) {
    // router.back()
    console.log('취소')
  }
}
</script>

<style scoped>
/* 추가 스타일 */
</style>