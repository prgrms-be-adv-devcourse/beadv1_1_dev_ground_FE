<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white shadow-md rounded-2xl px-8 py-10 text-center space-y-3">
      <h1 class="text-3xl font-bold text-indigo-600">성공</h1>
      <p class="text-gray-700">{{ statusMessage }}</p>

      <div v-if="error" class="text-sm text-red-600">
        {{ error }}
      </div>

      <button
        class="mt-4 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
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
import { api } from '@/api/index.js'

const route = useRoute()
const router = useRouter()

const statusMessage = ref('결제 결과를 확인하는 중입니다...')
const error = ref('')

const goHome = () => router.push('/')

const confirmPayment = async () => {
  const userCode = route.query.userCode?.toString() || ''
  const orderCode = route.query.orderId?.toString() || ''
  const paymentKey = route.query.paymentKey?.toString() || ''
  const amount = Number(route.query.amount) || 0

  try {
    await api.post(
      '/payments/toss',
      { userCode, orderCode, paymentKey, amount },
      { withCredentials: true },
    )
    statusMessage.value = '결제가 정상적으로 완료되었습니다. 잠시 후 메인으로 이동합니다.'
    setTimeout(goHome, 1500)
  } catch (e) {
    console.error('결제 확인 실패', e)
    error.value = e?.response?.data?.message || e?.message || '결제 확인에 실패했습니다.'
    statusMessage.value = '결제 확인 중 오류가 발생했습니다.'
  }
}

onMounted(confirmPayment)
</script>
