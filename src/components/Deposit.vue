<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 헤더 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">예치금</h1>
        <p class="text-sm text-gray-600">안전하고 편리한 거래를 위한 예치금 관리</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 예치금 카드 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 잔액 카드 -->
          <div class="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <div class="flex justify-between items-start mb-8">
              <div>
                <p class="text-indigo-100 text-sm mb-2">사용 가능한 예치금</p>
                <h2 class="text-4xl font-bold">{{ formatPrice(balance) }}원</h2>
              </div>
              <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span class="text-2xl">💰</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <button
                @click="showChargeModal = true"
                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-semibold transition-colors"
              >
                💳 충전하기
              </button>
              <button
                @click="showWithdrawModal = true"
                class="bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl font-semibold transition-colors"
              >
                💸 출금하기
              </button>
            </div>
          </div>

          <!-- 통계 카드 -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📥</span>
                </div>
                <div>
                  <p class="text-xs text-gray-600">이번 달 충전</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatPrice(monthlyCharge) }}원</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">💳</span>
                </div>
                <div>
                  <p class="text-xs text-gray-600">이번 달 사용</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatPrice(monthlyUsage) }}원</p>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm p-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-xl">📤</span>
                </div>
                <div>
                  <p class="text-xs text-gray-600">이번 달 출금</p>
                  <p class="text-lg font-bold text-gray-900">{{ formatPrice(monthlyWithdraw) }}원</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 거래 내역 -->
          <div class="bg-white rounded-xl shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold text-gray-900">거래 내역</h3>
                <div class="flex gap-2">
                  <button
                    v-for="filter in filters"
                    :key="filter.value"
                    @click="selectedFilter = filter.value"
                    :class="[
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      selectedFilter === filter.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 거래 내역이 없을 때 -->
            <div v-if="filteredTransactions.length === 0" class="p-12 text-center">
              <div class="text-5xl mb-4">📋</div>
              <p class="text-gray-600">거래 내역이 없습니다</p>
            </div>

            <!-- 거래 내역 리스트 -->
            <div v-else class="divide-y divide-gray-100">
              <div
                v-for="transaction in filteredTransactions"
                :key="transaction.id"
                class="p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-4">
                    <div
                      :class="[
                        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                        getTransactionStyle(transaction.type).bg
                      ]"
                    >
                      <span class="text-2xl">{{ getTransactionStyle(transaction.type).icon }}</span>
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900 mb-1">{{ transaction.title }}</h4>
                      <p class="text-sm text-gray-600 mb-2">{{ transaction.description }}</p>
                      <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span>{{ formatDateTime(transaction.date) }}</span>
                        <span
                          :class="[
                            'px-2 py-0.5 rounded font-medium',
                            getStatusStyle(transaction.status)
                          ]"
                        >
                          {{ getStatusText(transaction.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <p
                      :class="[
                        'text-xl font-bold',
                        transaction.type === 'charge' || transaction.type === 'refund'
                          ? 'text-green-600'
                          : 'text-red-600'
                      ]"
                    >
                      {{ transaction.type === 'charge' || transaction.type === 'refund' ? '+' : '-' }}{{ formatPrice(transaction.amount) }}원
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                      잔액 {{ formatPrice(transaction.balance) }}원
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 더보기 버튼 -->
            <div v-if="filteredTransactions.length > 0" class="p-4 border-t border-gray-200">
              <button
                @click="loadMore"
                class="w-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                더 보기
              </button>
            </div>
          </div>
        </div>

        <!-- 사이드바 -->
        <div class="space-y-6">
          <!-- 이용 안내 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">예치금 이용 안내</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start gap-2">
                <span class="text-indigo-600 mt-0.5">✓</span>
                <p>예치금은 안전한 거래를 위한 결제 수단입니다</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-indigo-600 mt-0.5">✓</span>
                <p>거래 완료 후 판매자에게 자동 정산됩니다</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-indigo-600 mt-0.5">✓</span>
                <p>최소 충전 금액은 10,000원입니다</p>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-indigo-600 mt-0.5">✓</span>
                <p>출금은 영업일 기준 1-3일 소요됩니다</p>
              </div>
            </div>
          </div>

          <!-- 계좌 정보 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">출금 계좌</h3>
              <button
                @click="showAccountModal = true"
                class="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                변경
              </button>
            </div>
            <div v-if="accountInfo" class="space-y-2 text-sm">
              <p class="text-gray-600">{{ accountInfo.bank }}</p>
              <p class="font-medium text-gray-900">{{ accountInfo.number }}</p>
              <p class="text-gray-600">{{ accountInfo.holder }}</p>
            </div>
            <div v-else class="text-sm text-gray-500">
              등록된 계좌가 없습니다
            </div>
          </div>

          <!-- 자주 묻는 질문 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">자주 묻는 질문</h3>
            <div class="space-y-3">
              <button
                v-for="faq in faqs"
                :key="faq.id"
                @click="openFaq(faq)"
                class="w-full text-left text-sm text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Q. {{ faq.question }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 충전 모달 -->
    <div
      v-if="showChargeModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showChargeModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">예치금 충전</h3>
          <button @click="showChargeModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">×</span>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">충전 금액</label>
            <input
              v-model="chargeAmount"
              type="number"
              placeholder="10,000원 이상"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="amount in [10000, 30000, 50000, 100000, 300000, 500000]"
              :key="amount"
              @click="chargeAmount = amount"
              class="py-2 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-sm font-medium transition-colors"
            >
              {{ formatPrice(amount) }}
            </button>
          </div>

          <button
            @click="handleCharge"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            충전하기
          </button>
        </div>
      </div>
    </div>

    <!-- 출금 모달 -->
    <div
      v-if="showWithdrawModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="showWithdrawModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">예치금 출금</h3>
          <button @click="showWithdrawModal = false" class="text-gray-400 hover:text-gray-600">
            <span class="text-2xl">×</span>
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <p class="text-sm text-gray-600 mb-1">출금 가능 금액</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatPrice(balance) }}원</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">출금 금액</label>
            <input
              v-model="withdrawAmount"
              type="number"
              :max="balance"
              placeholder="출금할 금액 입력"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
            />
          </div>

          <button
            @click="withdrawAmount = balance"
            class="w-full py-2 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-sm font-medium transition-colors"
          >
            전액 출금
          </button>

          <button
            @click="handleWithdraw"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            출금 신청
          </button>

          <p class="text-xs text-gray-500 text-center">
            출금은 영업일 기준 1-3일 소요됩니다
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 상태 관리
const balance = ref(850000)
const monthlyCharge = ref(1500000)
const monthlyUsage = ref(650000)
const monthlyWithdraw = ref(200000)
const selectedFilter = ref('all')
const showChargeModal = ref(false)
const showWithdrawModal = ref(false)
const showAccountModal = ref(false)
const chargeAmount = ref(null)
const withdrawAmount = ref(null)

// 계좌 정보
const accountInfo = ref({
  bank: '국민은행',
  number: '123-456-789012',
  holder: '홍길동'
})

// 필터
const filters = [
  { label: '전체', value: 'all' },
  { label: '충전', value: 'charge' },
  { label: '사용', value: 'usage' },
  { label: '출금', value: 'withdraw' }
]

// 더미 거래 내역
const transactions = ref([
  {
    id: 1,
    type: 'usage',
    title: '아이폰 15 Pro 구매',
    description: '안전거래 결제',
    amount: 1350000,
    balance: 850000,
    date: '2024-12-12T10:30:00',
    status: 'completed'
  },
  {
    id: 2,
    type: 'charge',
    title: '예치금 충전',
    description: '카드 결제',
    amount: 500000,
    balance: 2200000,
    date: '2024-12-11T14:20:00',
    status: 'completed'
  },
  {
    id: 3,
    type: 'refund',
    title: '거래 취소 환불',
    description: '맥북 에어 거래 취소',
    amount: 1450000,
    balance: 1700000,
    date: '2024-12-10T09:15:00',
    status: 'completed'
  },
  {
    id: 4,
    type: 'withdraw',
    title: '예치금 출금',
    description: '국민은행 123-456-***',
    amount: 200000,
    balance: 250000,
    date: '2024-12-09T16:45:00',
    status: 'completed'
  },
  {
    id: 5,
    type: 'usage',
    title: '갤럭시 버즈2 프로 구매',
    description: '안전거래 결제',
    amount: 180000,
    balance: 450000,
    date: '2024-12-08T11:30:00',
    status: 'completed'
  }
])

// FAQ
const faqs = ref([
  { id: 1, question: '예치금은 어떻게 충전하나요?' },
  { id: 2, question: '출금은 얼마나 걸리나요?' },
  { id: 3, question: '거래 취소시 환불은 어떻게 되나요?' },
  { id: 4, question: '예치금 사용 내역을 확인하려면?' }
])

// 계산된 값
const filteredTransactions = computed(() => {
  if (selectedFilter.value === 'all') {
    return transactions.value
  }
  return transactions.value.filter(t => t.type === selectedFilter.value)
})

// 메서드
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR')
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}.${day} ${hours}:${minutes}`
}

const getTransactionStyle = (type) => {
  const styles = {
    charge: { icon: '💳', bg: 'bg-green-100' },
    usage: { icon: '🛒', bg: 'bg-blue-100' },
    withdraw: { icon: '💸', bg: 'bg-purple-100' },
    refund: { icon: '↩️', bg: 'bg-orange-100' }
  }
  return styles[type] || styles.usage
}

const getStatusStyle = (status) => {
  const styles = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700'
  }
  return styles[status] || styles.pending
}

const getStatusText = (status) => {
  const texts = {
    completed: '완료',
    pending: '처리중',
    failed: '실패'
  }
  return texts[status] || '알 수 없음'
}

const handleCharge = async () => {
  if (!chargeAmount.value || chargeAmount.value < 10000) {
    alert('최소 충전 금액은 10,000원입니다.')
    return
  }

  // 실제 API 호출
  console.log('충전 금액:', chargeAmount.value)
  alert(`${formatPrice(chargeAmount.value)}원 충전이 완료되었습니다.`)
  showChargeModal.value = false
  chargeAmount.value = null
}

const handleWithdraw = async () => {
  if (!withdrawAmount.value || withdrawAmount.value <= 0) {
    alert('출금 금액을 입력해주세요.')
    return
  }

  if (withdrawAmount.value > balance.value) {
    alert('출금 가능 금액을 초과했습니다.')
    return
  }

  // 실제 API 호출
  console.log('출금 금액:', withdrawAmount.value)
  alert(`${formatPrice(withdrawAmount.value)}원 출금 신청이 완료되었습니다.`)
  showWithdrawModal.value = false
  withdrawAmount.value = null
}

const loadMore = () => {
  // 더 많은 거래 내역 로드
  console.log('더 보기 클릭')
}

const openFaq = (faq) => {
  console.log('FAQ 열기:', faq)
  alert(faq.question)
}
</script>

<style scoped>
/* 추가 스타일 */
</style>