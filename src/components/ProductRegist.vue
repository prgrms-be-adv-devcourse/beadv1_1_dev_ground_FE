<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 헤더 -->
      <div class="mb-8">
        <button
          @click="router.back()"
          class="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
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
        <h1 class="text-3xl font-bold text-gray-900">상품 등록</h1>
        <p class="mt-2 text-gray-600">정확한 정보를 입력해주세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- 상품 이미지 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">상품 이미지</h2>
          <p class="text-sm text-gray-500 mb-4">최소 1장, 최대 10장까지 등록 가능합니다</p>

          <div class="grid grid-cols-5 gap-4">
            <!-- 이미지 업로드 버튼 -->
            <label
              v-if="selectedImages.length < 10"
              class="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <svg
                class="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span class="text-xs text-gray-500">{{ selectedImages.length }}/10</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageSelect"
                class="hidden"
              />
            </label>

            <!-- 선택된 이미지 미리보기 -->
            <div
              v-for="(image, index) in selectedImages"
              :key="index"
              class="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                :src="image.preview"
                :alt="`상품 이미지 ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <button
                type="button"
                @click="removeImage(index)"
                class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 기본 정보 -->
        <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 class="text-lg font-semibold text-gray-900">기본 정보</h2>

          <!-- 카테고리 (계층적 선택) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span class="text-red-500">*</span>
            </label>

            <!-- 1단계: 최상위 카테고리 -->
            <select
              v-model="selectedCategory1"
              @change="handleCategory1Change"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            >
              <option value="">1단계 카테고리 선택</option>
              <option v-for="category in rootCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>

            <!-- 2단계: 하위 카테고리 -->
            <select
              v-if="level2Categories.length > 0"
              v-model="selectedCategory2"
              @change="handleCategory2Change"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-3"
            >
              <option value="">2단계 카테고리 선택</option>
              <option v-for="category in level2Categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>

            <!-- 3단계: 하위 카테고리 -->
            <select
              v-if="level3Categories.length > 0"
              v-model="selectedCategory3"
              @change="handleCategory3Change"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">3단계 카테고리 선택</option>
              <option v-for="category in level3Categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>

            <!-- 선택된 카테고리 경로 표시 -->
            <p v-if="categoryPath" class="mt-2 text-sm text-indigo-600">
              선택된 카테고리: {{ categoryPath }}
            </p>
          </div>

          <!-- 상품명 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              상품명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.title"
              type="text"
              required
              maxlength="100"
              placeholder="상품명을 입력하세요 (최대 100자)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p class="mt-1 text-xs text-gray-500">{{ formData.title.length }}/100</p>
          </div>

          <!-- 가격 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              가격 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                placeholder="0"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
            </div>
          </div>
        </div>

        <!-- 상세 설명 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">상세 설명</h2>
          <textarea
            v-model="formData.description"
            required
            maxlength="2000"
            rows="10"
            placeholder="상품에 대한 상세한 설명을 입력해주세요 (최대 2000자)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">{{ formData.description.length }}/2000</p>
        </div>

        <!-- 주의사항 -->
        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
          <h3 class="flex items-center text-sm font-semibold text-yellow-900 mb-2">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            주의사항
          </h3>
          <ul class="space-y-1 text-xs text-yellow-800">
            <li>• 허위 매물 등록 시 이용이 제한될 수 있습니다</li>
            <li>• 상품과 관련 없는 이미지는 삭제될 수 있습니다</li>
            <li>• 가품, 불법 복제품 판매는 금지됩니다</li>
            <li>• 타인의 명예를 훼손하거나 불쾌감을 주는 내용은 자제해주세요</li>
          </ul>
        </div>

        <!-- 버튼 영역 -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !formData.categoryId"
            class="flex-1 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="!isSubmitting">상품 등록</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              등록 중...
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { registProduct, uploadImageToS3, saveProductImages } from '@/api/product'
import { getRootCategories, getChildCategories } from '@/api/category'

const router = useRouter()

// 폼 데이터
const formData = ref({
  categoryId: null,
  title: '',
  description: '',
  price: null,
})

// 카테고리 관련
const rootCategories = ref([])
const level2Categories = ref([])
const level3Categories = ref([])

const selectedCategory1 = ref('')
const selectedCategory2 = ref('')
const selectedCategory3 = ref('')

const categoryNames = ref([])

// 카테고리 경로 표시
const categoryPath = computed(() => {
  return categoryNames.value.join(' > ')
})

// 이미지 관련
const selectedImages = ref([])
const isSubmitting = ref(false)

// 1단계 카테고리 변경
const handleCategory1Change = async () => {
  selectedCategory2.value = ''
  selectedCategory3.value = ''
  level2Categories.value = []
  level3Categories.value = []
  categoryNames.value = []

  if (!selectedCategory1.value) {
    formData.value.categoryId = null
    return
  }

  const selected = rootCategories.value.find((cat) => cat.id === selectedCategory1.value)
  if (!selected) return

  categoryNames.value = [selected.name]

  if (selected.isLeaf) {
    // 리프 노드면 최종 선택 완료
    formData.value.categoryId = selected.id
  } else {
    // 하위 카테고리 로드
    await fetchLevel2Categories(selected.id)
    formData.value.categoryId = null
  }
}

// 2단계 카테고리 변경
const handleCategory2Change = async () => {
  selectedCategory3.value = ''
  level3Categories.value = []

  if (!selectedCategory2.value) {
    categoryNames.value = categoryNames.value.slice(0, 1)
    formData.value.categoryId = null
    return
  }

  const selected = level2Categories.value.find((cat) => cat.id === selectedCategory2.value)
  if (!selected) return

  categoryNames.value = [...categoryNames.value.slice(0, 1), selected.name]

  if (selected.isLeaf) {
    // 리프 노드면 최종 선택 완료
    formData.value.categoryId = selected.id
  } else {
    // 하위 카테고리 로드
    await fetchLevel3Categories(selected.id)
    formData.value.categoryId = null
  }
}

// 3단계 카테고리 변경
const handleCategory3Change = () => {
  if (!selectedCategory3.value) {
    categoryNames.value = categoryNames.value.slice(0, 2)
    formData.value.categoryId = null
    return
  }

  const selected = level3Categories.value.find((cat) => cat.id === selectedCategory3.value)
  if (!selected) return

  categoryNames.value = [...categoryNames.value.slice(0, 2), selected.name]
  formData.value.categoryId = selected.id
}

// 최상위 카테고리 조회
const fetchRootCategories = async () => {
  try {
    const response = await getRootCategories()
    if (response.data.success) {
      rootCategories.value = response.data.data || []
    }
  } catch (error) {
    console.error('카테고리 조회 실패:', error)
    alert('카테고리 목록을 불러오는데 실패했습니다.')
  }
}

// 2단계 카테고리 조회
const fetchLevel2Categories = async (parentId) => {
  try {
    const response = await getChildCategories(parentId)
    if (response.data.success) {
      level2Categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('하위 카테고리 조회 실패:', error)
  }
}

// 3단계 카테고리 조회
const fetchLevel3Categories = async (parentId) => {
  try {
    const response = await getChildCategories(parentId)
    if (response.data.success) {
      level3Categories.value = response.data.data || []
    }
  } catch (error) {
    console.error('하위 카테고리 조회 실패:', error)
  }
}

// 이미지 선택 핸들러
const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  const remainingSlots = 10 - selectedImages.value.length

  if (files.length > remainingSlots) {
    alert(`최대 10장까지만 등록 가능합니다. ${remainingSlots}장만 추가됩니다.`)
  }

  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    // 파일 확장자 추출
    const extension = file.name.split('.').pop().toLowerCase()

    // 미리보기 URL 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImages.value.push({
        file: file,
        extension: extension,
        preview: e.target.result,
      })
    }
    reader.readAsDataURL(file)
  })

  // 입력 초기화
  event.target.value = ''
}

// 이미지 제거
const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
}

// S3에 이미지 업로드
const uploadImagesToS3 = async (presignedUrls) => {
  const uploadedUrls = []

  for (let i = 0; i < presignedUrls.length; i++) {
    const presignedUrl = presignedUrls[i]
    const imageFile = selectedImages.value[i].file

    try {
      // Presigned URL에서 쿼리 파라미터 제거한 실제 S3 URL 추출
      const s3Url = presignedUrl.split('?')[0]

      // S3에 이미지 업로드 (PUT 요청)
      await uploadImageToS3(presignedUrl, imageFile)

      uploadedUrls.push(s3Url)
    } catch (error) {
      console.error(`이미지 ${i + 1} 업로드 실패:`, error)
      throw new Error(`이미지 업로드에 실패했습니다: ${imageFile.name}`)
    }
  }

  return uploadedUrls
}

// 폼 제출
const handleSubmit = async () => {
  if (isSubmitting.value) return

  if (!formData.value.categoryId) {
    alert('카테고리를 선택해주세요.')
    return
  }

  isSubmitting.value = true

  try {
    // 1. 상품 등록 API 호출
    const imageExtensions = selectedImages.value.map((img) => img.extension)

    const requestData = {
      categoryId: formData.value.categoryId,
      title: formData.value.title,
      description: formData.value.description,
      price: formData.value.price,
      imageExtensions: imageExtensions.length > 0 ? imageExtensions : null,
    }

    const registResponse = await registProduct(requestData)

    if (!registResponse.data.success) {
      throw new Error(registResponse.data.msg || '상품 등록에 실패했습니다.')
    }

    const { productCode, presignedUrls } = registResponse.data.data

    // 2. 상품 상세 페이지로 즉시 이동
    router.push(`/productdetail/${productCode}`)

    // 3. 이미지가 있으면 백그라운드에서 S3 업로드 및 이미지 URL 저장
    if (presignedUrls && presignedUrls.length > 0) {
      // 비동기로 처리 (페이지 이동 후에도 계속 실행)
      uploadAndSaveImages(productCode, presignedUrls)
    }
  } catch (error) {
    console.error('상품 등록 실패:', error)
    alert(error.message || '상품 등록 중 오류가 발생했습니다.')
    isSubmitting.value = false
  }
}

// 이미지 업로드 및 저장 (백그라운드 처리)
const uploadAndSaveImages = async (productCode, presignedUrls) => {
  try {
    // S3에 이미지 업로드
    const uploadedUrls = await uploadImagesToS3(presignedUrls)

    // 로컬 이미지 저장 API 호출
    await saveProductImages(productCode, uploadedUrls)

    console.log('이미지 업로드 및 저장 완료')
  } catch (error) {
    console.error('이미지 처리 실패:', error)
    // 이미지 처리 실패는 사용자에게 알리지 않음 (이미 페이지 이동했으므로)
  }
}

onMounted(() => {
  fetchRootCategories()
})
</script>

<style scoped>
/* 숫자 입력 필드 화살표 제거 */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type='number'] {
  -moz-appearance: textfield;
}
</style>
