<template>
  <div class="min-h-screen bg-gray-50 py-10">
    <div class="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">예치금 결제</h1>
          <p class="text-sm text-gray-600">토스페이먼츠로 안전하게 충전합니다.</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-500 mb-1">결제 금액</p>
          <p class="text-2xl font-semibold text-indigo-600">{{ formattedAmount }}</p>
        </div>
      </div>

      <div
        v-if="error"
        class="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm border border-red-100"
      >
        {{ error }}
      </div>

      <div v-if="isLoading" class="text-sm text-gray-500 mb-2">
        결제 위젯을 불러오는 중입니다...
      </div>

      <div class="space-y-6" :class="{ 'opacity-50 pointer-events-none': isLoading }">
        <div
          id="payment-method"
          ref="paymentMethodRef"
          class="border border-gray-200 rounded-xl p-4 bg-gray-50"
        />

        <div
          id="agreement"
          ref="agreementRef"
          class="border border-gray-200 rounded-xl p-4 bg-gray-50"
        />

        <button
          type="button"
          class="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
          :disabled="!isReady || isRequesting"
          @click="handlePayment"
        >
          {{ isRequesting ? '결제 요청 중...' : '결제하기' }}
        </button>

        <p class="text-xs text-gray-500 text-center">
          결제 진행 시 토스페이먼츠 약관에 동의하게 됩니다.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { api } from '@/api/index.js'

const route = useRoute()

const paymentMethodRef = ref(null)
const agreementRef = ref(null)

const isLoading = ref(true)
const isRequesting = ref(false)
const isReady = ref(false)
const error = ref('')

const widget = ref(null)
const tossPayments = ref(null)

const paymentInfo = ref({
  amount: '',
  orderName: '예치금 충전',
  orderCode: '',
  userCode: '',
  clientKey: '',
  successUrl: '',
  failUrl: '',
})

const formattedAmount = computed(() => {
  return `${paymentInfo.value.amount.toLocaleString('ko-KR')}원`
})

const ensureTossScript = () =>
  new Promise((resolve, reject) => {
    if (window.TossPayments) return resolve(window.TossPayments)

    const script = document.createElement('script')
    script.src = 'https://js.tosspayments.com/v2/standard'
    script.onload = () => resolve(window.TossPayments)
    script.onerror = () => reject(new Error('토스 결제 스크립트 로드에 실패했습니다.'))
    document.head.appendChild(script)
  })

const withOrigin = (url) => {
  if (!url) return ''
  try {
    return new URL(url, window.location.origin).toString()
  } catch (e) {
    console.warn('URL 변환 실패, 원본 사용:', url, e)
    return url
  }
}

const addUserCodeToUrl = (url, userCode) => {
  if (!url) return ''
  try {
    const next = new URL(url, window.location.origin)
    if (userCode) next.searchParams.set('userCode', userCode)
    return next.toString()
  } catch (e) {
    console.warn('userCode 쿼리 추가 실패', e)
    return url
  }
}

const loadPaymentInfo = async () => {
  const fallbackClientKey =
    import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'

  const access = sessionStorage.getItem('accessToken')
  if (!access) throw new Error('access 토큰이 없습니다.')

  try {
    const { data } = await api.get('/payments/checkout', {
    })

    const payload = data?.data || data
    paymentInfo.value = {
      amount: Number(payload.amount ?? paymentInfo.value.amount) || paymentInfo.value.amount,
      clientKey: payload.clientKey || fallbackClientKey,
      orderCode: payload.orderId ?? payload.orderCode ?? paymentInfo.value.orderCode,
      userCode: payload.customerKey ?? payload.userCode ?? paymentInfo.value.userCode,
      successUrl: payload.successUrl
        ? withOrigin(payload.successUrl)
        : withOrigin('/success'),
      failUrl: withOrigin(payload.failUrl ?? '/fail'),
    }
  } catch (e) {
    console.warn('결제 정보 조회 실패', e)
    paymentInfo.value.clientKey = fallbackClientKey
  }
}

const renderWidgets = async () => {
  isReady.value = false
  try {
    await nextTick()
    const hasPayment = document.querySelector('#payment-method')
    const hasAgreement = document.querySelector('#agreement')
    if (!hasPayment || !hasAgreement) {
      throw new Error('결제 위젯을 렌더링할 DOM 요소를 찾을 수 없습니다.')
    }

    const TossPayments = await ensureTossScript()
    tossPayments.value = TossPayments(paymentInfo.value.clientKey)
    widget.value = tossPayments.value.widgets({
      customerKey: paymentInfo.value.userCode || 'ANONYMOUS',
    })

    await widget.value.setAmount({
      currency: 'KRW',
      value: Number(paymentInfo.value.amount) || 0,
    })

    await Promise.all([
      widget.value.renderPaymentMethods({
        selector: '#payment-method',
        variantKey: 'DEFAULT',
      }),
      widget.value.renderAgreement({
        selector: '#agreement',
        variantKey: 'AGREEMENT',
      }),
    ])
    isReady.value = true
  } catch (e) {
    console.error(e)
    error.value = e?.message || '결제 위젯 초기화에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

const handlePayment = async () => {
  if (!widget.value) {
    error.value = '결제 위젯이 준비되지 않았습니다.'
    return
  }
  isRequesting.value = true
  error.value = ''
  try {
    const successUrl = addUserCodeToUrl(
      withOrigin(paymentInfo.value.successUrl || '/success'),
      paymentInfo.value.userCode,
    )
    const failUrl = withOrigin(paymentInfo.value.failUrl || '/fail')

    await widget.value.requestPayment({
      orderId: paymentInfo.value.orderCode,
      orderName: paymentInfo.value.orderName || '예치금 충전',
      successUrl,
      failUrl,
    })
  } catch (e) {
    if (e?.code !== 'USER_CANCEL') {
      error.value = e?.response?.data?.message || e?.message || '결제 요청에 실패했습니다.'
    }
  } finally {
    isRequesting.value = false
  }
}

onMounted(async () => {
  await loadPaymentInfo()
  await renderWidgets()
})
</script>
