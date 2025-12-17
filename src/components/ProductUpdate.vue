<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"
        ></div>
        <p class="text-gray-600">상품 정보를 불러오는 중...</p>
      </div>
    </div>

    <div v-else class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <h1 class="text-3xl font-bold text-gray-900">상품 수정</h1>
        <p class="mt-2 text-gray-600">수정할 정보를 변경해주세요</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- 기존 이미지 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">기존 이미지</h2>
          <p class="text-sm text-gray-500 mb-4">삭제할 이미지를 선택하세요</p>

          <div v-if="existingImages.length > 0" class="grid grid-cols-5 gap-4 mb-4">
            <div
              v-for="(imageUrl, index) in existingImages"
              :key="`existing-${index}`"
              class="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                :src="imageUrl"
                :alt="`기존 이미지 ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <button
                type="button"
                @click="removeExistingImage(index)"
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

          <p v-else class="text-sm text-gray-500">기존 이미지가 없습니다</p>
        </div>

        <!-- 새 이미지 추가 -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">새 이미지 추가</h2>
          <p class="text-sm text-gray-500 mb-4">
            기존 이미지 + 새 이미지 합계 최대 10장 (선택사항)
          </p>

          <div class="grid grid-cols-5 gap-4">
            <!-- 이미지 업로드 버튼 -->
            <label
              v-if="totalImageCount < 10"
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
              <span class="text-xs text-gray-500">{{ totalImageCount }}/10</span>
              <input
                type="file"
                accept="image/*"
                multiple
                @change="handleImageSelect"
                class="hidden"
              />
            </label>

            <!-- 선택된 새 이미지 미리보기 -->
            <div
              v-for="(image, index) in newImages"
              :key="`new-${index}`"
              class="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                :src="image.preview"
                :alt="`새 이미지 ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <button
                type="button"
                @click="removeNewImage(index)"
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
                placeholder="가격을 입력하세요"
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span class="absolute right-4 top-3 text-gray-500">원</span>
            </div>
          </div>

          <!-- 상품 설명 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              상품 설명 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.description"
              required
              maxlength="3000"
              rows="8"
              placeholder="상품에 대한 자세한 설명을 입력하세요 (최대 3000자)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            ></textarea>
            <p class="mt-2 text-sm text-gray-500 text-right">
              {{ formData.description.length }}/3000
            </p>
          </div>
        </div>

        <!-- 제출 버튼 -->
        <div class="flex gap-4">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? '수정 중...' : '수정하기' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductDetail, updateProduct, uploadImagesToS3, saveProductImages } from '@/api/product'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const isSubmitting = ref(false)

const originalProduct = ref(null)
const existingImages = ref([])
const newImages = ref([])
const deletedImageUrls = ref([])

const formData = ref({
  title: '',
  description: '',
  price: 0,
})

const totalImageCount = computed(() => {
  return existingImages.value.length + newImages.value.length
})

const removeExistingImage = (index) => {
  const deletedUrl = existingImages.value[index]
  deletedImageUrls.value.push(deletedUrl)
  existingImages.value.splice(index, 1)
}

const removeNewImage = (index) => {
  newImages.value.splice(index, 1)
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files)
  const remainingSlots = 10 - totalImageCount.value

  if (files.length > remainingSlots) {
    alert(`최대 10장까지만 등록 가능합니다. ${remainingSlots}장만 추가됩니다.`)
  }

  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    const extension = file.name.split('.').pop().toLowerCase()

    const reader = new FileReader()
    reader.onload = (e) => {
      newImages.value.push({
        file,
        extension,
        preview: e.target.result,
      })
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

const uploadAndSaveNewImages = async (productCode, presignedUrls) => {
  try {
    const files = newImages.value.map((img) => img.file)

    const uploadedUrls = await uploadImagesToS3(presignedUrls, files)
    await saveProductImages(productCode, uploadedUrls)

    console.log('✅ 새 이미지 업로드 및 저장 완료')
  } catch (error) {
    console.error('❌ 이미지 처리 실패:', error)
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    const productCode = route.params.productCode

    let newImageExtensions = null

    if (newImages.value.length > 0) {
      const validExtensions = newImages.value
        .map((img) => img.extension)
        .filter((ext) => ext && ext.trim() !== '')

      if (validExtensions.length > 0) {
        newImageExtensions = validExtensions
      }
    }

    const requestData = {
      title: formData.value.title,
      description: formData.value.description,
      price: formData.value.price,
      deleteUrls: deletedImageUrls.value.length > 0 ? deletedImageUrls.value : null,
      newImageExtensions: newImageExtensions,
    }

    const updateResponse = await updateProduct(productCode, requestData)

    if (!updateResponse.data.success) {
      throw new Error(updateResponse.data.msg || '상품 수정에 실패했습니다.')
    }

    const { presignedUrl } = updateResponse.data.data

    // ✅ 상세 페이지로 즉시 이동
    router.push(`/productdetail/${productCode}`)

    // ✅ 백그라운드 새 이미지 업로드/저장
    if (presignedUrl && presignedUrl.length > 0) {
      uploadAndSaveNewImages(productCode, presignedUrl)
    }
  } catch (error) {
    console.error('❌ 상품 수정 실패:', error)
    alert(error.message || '상품 수정 중 오류가 발생했습니다.')
    isSubmitting.value = false
  }
}

const fetchProductDetail = async () => {
  loading.value = true
  try {
    const productCode = route.params.productCode
    const response = await getProductDetail(productCode)

    if (response.data.success && response.data.data) {
      originalProduct.value = response.data.data

      formData.value.title = originalProduct.value.title
      formData.value.description = originalProduct.value.description
      formData.value.price = originalProduct.value.price

      if (originalProduct.value.imageUrls && originalProduct.value.imageUrls.length > 0) {
        existingImages.value = [...originalProduct.value.imageUrls]
      }
    } else {
      throw new Error(response.data.msg || '상품 정보를 불러올 수 없습니다.')
    }
  } catch (error) {
    console.error('❌ 상품 정보 조회 실패:', error)
    alert(error.message || '상품 정보를 불러오는데 실패했습니다.')
    router.back()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
