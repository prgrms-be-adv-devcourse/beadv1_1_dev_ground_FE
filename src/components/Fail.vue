<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white shadow-md rounded-2xl px-8 py-10 text-center space-y-3">
      <h1 class="text-3xl font-bold text-red-600">결제 실패</h1>
      <p class="text-gray-700">{{ statusMessage }}</p>

      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>

      <button
        class="mt-4 px-5 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition-colors"
        @click="goHome"
      >
        메인으로 이동
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const statusMessage = ref('결제가 취소되었거나 실패했습니다.')
const error = ref('')

const goHome = () => router.push('/')

onMounted(() => {
  const message = route.query.message || route.query.error
  if (message) {
    error.value = message.toString()
  }
  setTimeout(goHome, 1500)
})
</script>
