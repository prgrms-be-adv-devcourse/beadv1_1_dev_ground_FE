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

            <div
              v-for="(image, index) in newImages"
              :key="`new-${index}`"
              class="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                :src="image.previewUrl"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getProductDetail, updateProduct, uploadImagesToS3, saveProductImages } from '@/api/product'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const isSubmitting = ref(false)

const originalProduct = ref(null)

// 기존 이미지(S3 진짜 URL만)
const existingImages = ref([])
const deletedImageUrls = ref([])

// 새 이미지(프리뷰는 ObjectURL)
const newImages = ref([]) // { file, extension, previewUrl }

const formData = ref({
  title: '',
  description: '',
  price: 0,
})

const productCode = computed(() => String(route.params.productCode || ''))
const totalImageCount = computed(() => existingImages.value.length + newImages.value.length)

// ✅ 변경: 확장자 화이트리스트 + normalize
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
const normalizeExt = (ext) => {
  if (!ext) return null
  return String(ext).toLowerCase().replace('.', '')
}

// ✅ 변경: deleteUrls에 들어갈 수 있는 URL만 통과 (placeholder/로컬 URL 차단)
const isValidS3ProductImageUrl = (url) => {
  try {
    if (!url) return false
    const u = new URL(url)
    if (!u.protocol.startsWith('http')) return false
    if (!productCode.value) return false
    // 필요하면 /products/ 케이스까지 허용
    return (
      u.pathname.includes(`/product/${productCode.value}/`) ||
      u.pathname.includes(`/products/${productCode.value}/`)
    )
  } catch {
    return false
  }
}

const revokeObjectUrl = (previewUrl) => {
  if (previewUrl) URL.revokeObjectURL(previewUrl)
}

const removeExistingImage = (index) => {
  const deletedUrl = existingImages.value[index]
  if (isValidS3ProductImageUrl(deletedUrl)) {
    deletedImageUrls.value.push(deletedUrl)
  }
  existingImages.value.splice(index, 1)
}

const removeNewImage = (index) => {
  const target = newImages.value[index]
  revokeObjectUrl(target?.previewUrl)
  newImages.value.splice(index, 1)
}

const handleImageSelect = (event) => {
  const files = Array.from(event.target.files || [])
  const remainingSlots = 10 - totalImageCount.value

  if (remainingSlots <= 0) {
    event.target.value = ''
    return
  }

  if (files.length > remainingSlots) {
    alert(`최대 10장까지만 등록 가능합니다. ${remainingSlots}장만 추가됩니다.`)
  }

  const filesToAdd = files.slice(0, remainingSlots)

  for (const file of filesToAdd) {
    const rawExt = file.name.includes('.') ? file.name.split('.').pop() : ''
    const ext = normalizeExt(rawExt)

    if (!ext || !ALLOWED_EXT.has(ext)) {
      alert(
        `지원하지 않는 이미지 확장자입니다: ${rawExt || '(없음)'}\n(jpg, jpeg, png, webp, gif만 가능)`,
      )
      continue
    }

    const previewUrl = URL.createObjectURL(file)
    newImages.value.push({ file, extension: ext, previewUrl })
  }

  event.target.value = ''
}

const fetchProductDetail = async () => {
  loading.value = true
  try {
    if (!productCode.value) throw new Error('productCode가 없습니다.')

    const response = await getProductDetail(productCode.value)

    if (response.data.success && response.data.data) {
      originalProduct.value = response.data.data

      formData.value.title = originalProduct.value.title
      formData.value.description = originalProduct.value.description
      formData.value.price = originalProduct.value.price

      const urls = Array.isArray(originalProduct.value.imageUrls)
        ? originalProduct.value.imageUrls
        : []

      // ✅ 변경: 기존 이미지도 필터링해서 placeholder/이상한 URL 섞이는 순간 백 validate 터지는 것 방지
      existingImages.value = urls.filter((u) => isValidS3ProductImageUrl(u))
    } else {
      throw new Error(response.data.msg || '상품 정보를 불러올 수 없습니다.')
    }
  } catch (error) {
    console.error('❌ 상품 정보 조회 실패:', error)
    alert(error?.response?.data?.msg || error.message || '상품 정보를 불러오는데 실패했습니다.')
    router.back()
  } finally {
    loading.value = false
  }
}

// ✅ 변경: 상세 페이지 자동 갱신 이벤트(등록 페이지와 동일한 방식)
const emitImagesUpdated = (code, urls) => {
  window.dispatchEvent(
    new CustomEvent('product-images-updated', {
      detail: { productCode: String(code), urls },
    }),
  )
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  if (!productCode.value) {
    alert('productCode가 없습니다.')
    return
  }

  isSubmitting.value = true

  try {
    // ✅ 변경: 백에서 presigned 생성에 쓰는 확장자 (newImageExtensions) 준비
    const newImageExtensions =
      newImages.value.length > 0
        ? newImages.value.map((img) => img.extension).filter(Boolean)
        : null

    const requestData = {
      title: formData.value.title,
      description: formData.value.description,
      price: formData.value.price,
      deleteUrls: deletedImageUrls.value.length > 0 ? deletedImageUrls.value : null,
      newImageExtensions: newImageExtensions?.length ? newImageExtensions : null,
    }

    console.log('[ProductUpdate] PATCH payload:', requestData)

    // 1) 상품 수정 + (삭제/신규확장자 있으면) presigned 발급까지 백에서 처리
    const updateResponse = await updateProduct(productCode.value, requestData)

    console.log('?')

    if (!updateResponse.data?.success) {
      throw new Error(updateResponse.data?.msg || '상품 수정에 실패했습니다.')
    }

    console.log('!')

    // ✅ 변경: presigned 응답 필드 흔들려도 안전하게 처리 + 문자열로 강제 변환
    const data = updateResponse.data?.data || {}
    const presignedRaw = data.newPresignedUrls ?? data.presignedUrls ?? data.presignedUrl ?? []
    const presignedUrls = Array.isArray(presignedRaw) ? presignedRaw.map((u) => String(u)) : []

    // 2) 새 이미지가 있다면: presigned 개수 검증 → S3 업로드 → 업로드 URL 로컬(DB) 저장
    if (newImages.value.length > 0) {
      if (presignedUrls.length < newImages.value.length) {
        throw new Error(
          `Presigned URL이 부족합니다. (필요 ${newImages.value.length} / 응답 ${presignedUrls.length})`,
        )
      }

      const files = newImages.value.map((img) => img.file)

      const uploadedUrls = await uploadImagesToS3(presignedUrls, files)

      const saveRes = await saveProductImages(productCode.value, uploadedUrls)

      console.log(saveRes)

      if (!saveRes.data?.status > 300) {
        throw new Error(saveRes.data?.msg || '상품 이미지 URL 저장에 실패했습니다.')
      }

      // ✅ 변경: 상세가 이벤트를 듣고 있으면 즉시 갱신
      emitImagesUpdated(productCode.value, uploadedUrls)
    }

    // ✅ 변경: “삭제 + 신규 업로드/저장”까지 모두 끝난 뒤 이동 → 상세에서 이미지 흔들림 제거
    router.push(`/productdetail/${productCode.value}`)
  } catch (error) {
    console.error('❌ 상품 수정 실패:', error)
    alert(error?.response?.data?.msg || error.message || '상품 수정 중 오류가 발생했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchProductDetail)

onBeforeUnmount(() => {
  newImages.value.forEach((img) => revokeObjectUrl(img.previewUrl))
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
