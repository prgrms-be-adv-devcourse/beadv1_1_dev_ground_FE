<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
  >
    <div class="w-full max-w-2xl">
      <!-- 회원가입 폼 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <!-- 타이틀 -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">회원가입</h2>
          <p class="text-sm text-gray-600">dbay와 함께 안전한 중고거래를 시작하세요</p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-6">
          <!-- 2열 레이아웃 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- 이름 -->
            <div>
              <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
                이름 <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="signupForm.name"
                type="text"
                required
                placeholder="홍길동"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                :class="{ 'border-red-500': errors.name }"
              />
              <p v-if="errors.name" class="mt-2 text-xs text-red-600">{{ errors.name }}</p>
            </div>

            <!-- 닉네임 -->
            <div>
              <label for="nickname" class="block text-sm font-semibold text-gray-700 mb-2">
                닉네임 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="nickname"
                  v-model="signupForm.nickname"
                  type="text"
                  required
                  placeholder="닉네임"
                  class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                  :class="{ 'border-red-500': errors.nickname }"
                />
              </div>
              <p v-if="errors.nickname" class="mt-2 text-xs text-red-600">{{ errors.nickname }}</p>
            </div>
          </div>

          <!-- 이메일 -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              이메일 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="email"
                v-model="signupForm.email"
                type="email"
                required
                placeholder="example@email.com"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                :class="{ 'border-red-500': errors.email }"
              />
              <button
                type="button"
                @click="checkEmail"
                class="px-5 py-3.5 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors whitespace-nowrap text-sm"
              >
                인증번호 전송
              </button>
            </div>
            <p v-if="errors.email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <!-- 인증번호 입력/확인 -->
          <div v-if="isCodeSent" class="mt-3 flex gap-2">
            <input
              v-model="verificationCode"
              type="text"
              placeholder="인증번호 입력"
              class="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm"
            />
            <p v-if="errors.email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
            <button
              type="button"
              @click="verifyEmail"
              :disabled="isVerifying || !verificationCode"
              class="px-4 py-3.5 bg-indigo-600 text-white rounded-xl disabled:bg-gray-400"
            >
              {{ isVerifying ? '확인 중...' : '인증 확인' }}
            </button>
          </div>
          <p
            v-if="codeMessage"
            class="mt-2 text-xs"
            :class="codeMessageType === 'error' ? 'text-red-600' : 'text-green-600'"
          >
            {{ codeMessage }}
          </p>

          <!-- 비밀번호 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="signupForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="최소 8자 이상"
                  class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm pr-12"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span v-if="showPassword" class="text-lg">🙈</span>
                  <span v-else class="text-lg">👁️</span>
                </button>
              </div>
              <p v-if="errors.password" class="mt-2 text-xs text-red-600">{{ errors.password }}</p>
            </div>

            <div>
              <label for="passwordConfirm" class="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호 확인 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <input
                  id="passwordConfirm"
                  v-model="signupForm.passwordConfirm"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  required
                  placeholder="비밀번호 재입력"
                  class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm pr-12"
                  :class="{ 'border-red-500': errors.passwordConfirm }"
                />
                <button
                  type="button"
                  @click="showPasswordConfirm = !showPasswordConfirm"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span v-if="showPasswordConfirm" class="text-lg">🙈</span>
                  <span v-else class="text-lg">👁️</span>
                </button>
              </div>
              <p v-if="errors.passwordConfirm" class="mt-2 text-xs text-red-600">
                {{ errors.passwordConfirm }}
              </p>
            </div>
          </div>

          <!-- 연락처 -->
          <div>
            <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
              연락처 <span class="text-red-500">*</span>
            </label>
            <input
              id="phone"
              v-model="signupForm.phone"
              type="tel"
              required
              placeholder="010-1234-5678"
              class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="mt-2 text-xs text-red-600">{{ errors.phone }}</p>
          </div>

          <!-- 주소 -->
          <div>
            <label for="address" class="block text-sm font-semibold text-gray-700 mb-2">
              주소 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <input
                id="address"
                v-model="signupForm.address"
                type="text"
                required
                placeholder="기본 주소"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                :class="{ 'border-red-500': errors.address }"
              />
            </div>
            <p v-if="errors.address" class="mt-2 text-xs text-red-600">{{ errors.address }}</p>
          </div>

          <!-- 상세주소 -->
          <div>
            <label for="addressDetail" class="block text-sm font-semibold text-gray-700 mb-2">
              상세주소 <span class="text-red-500">*</span>
            </label>
            <input
              id="addressDetail"
              v-model="signupForm.addressDetail"
              type="text"
              required
              placeholder="상세 주소 입력"
              class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
            />
            <p v-if="errors.address" class="mt-2 text-xs text-red-600">{{ errors.address }}</p>
          </div>

          <!-- 약관 동의 -->
          <div class="space-y-3 pt-2">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="signupForm.agreeAll"
                @change="toggleAgreeAll"
                type="checkbox"
                class="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
              />
              <span class="text-sm font-semibold text-gray-900">전체 동의</span>
            </label>

            <div class="pl-8 space-y-2">
              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  v-model="signupForm.agreeTerms"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                />
                <span class="text-sm text-gray-700">
                  <span class="text-red-500">*</span> 이용약관 동의
                  <a href="#" class="text-indigo-600 hover:underline ml-1">(보기)</a>
                </span>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  v-model="signupForm.agreePrivacy"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                />
                <span class="text-sm text-gray-700">
                  <span class="text-red-500">*</span> 개인정보처리방침 동의
                  <a href="#" class="text-indigo-600 hover:underline ml-1">(보기)</a>
                </span>
              </label>

              <label class="flex items-start gap-3 cursor-pointer">
                <input
                  v-model="signupForm.agreeMarketing"
                  type="checkbox"
                  class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                />
                <span class="text-sm text-gray-700"> 마케팅 정보 수신 동의 (선택) </span>
              </label>
            </div>
            <p v-if="errors.terms" class="text-xs text-red-600 pl-8">{{ errors.terms }}</p>
          </div>

          <!-- 회원가입 버튼 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-8"
          >
            <span v-if="isLoading">
              <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                  fill="none"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            <span>{{ isLoading ? '가입 중...' : '회원가입' }}</span>
          </button>
        </form>

        <!-- 로그인 링크 -->
        <p class="mt-8 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?
          <router-link
            to="/login"
            class="text-indigo-600 hover:text-indigo-700 font-semibold ml-1 transition-colors"
          >
            로그인
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import router from '@/router/index.js'
// import { useRouter } from 'vue-router'

// const router = useRouter()

// 상태 관리
const isLoading = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isSendingEmail = ref(false)
const isCodeSent = ref(false)
const verificationCode = ref('')
const isVerifying = ref(false)
const emailVerified = ref(false)
const codeMessage = ref('')
const codeMessageType = ref('') // 'error' | 'success'

const signupForm = reactive({
  name: '',
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  address: '',
  addressDetail: '',
  agreeAll: false,
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
})

const errors = reactive({
  name: '',
  nickname: '',
  email: '',
  password: '',
  passwordConfirm: '',
  phone: '',
  address: '',
  terms: '',
})

// 전체 동의 토글
const toggleAgreeAll = () => {
  const checked = signupForm.agreeAll
  signupForm.agreeTerms = checked
  signupForm.agreePrivacy = checked
  signupForm.agreeMarketing = checked
}

// 개별 동의 상태 감시
watch(
  () => [signupForm.agreeTerms, signupForm.agreePrivacy, signupForm.agreeMarketing],
  ([terms, privacy, marketing]) => {
    signupForm.agreeAll = terms && privacy && marketing
  },
)

const checkEmail = async () => {
  codeMessage.value = ''
  isSendingEmail.value = true
  try {
    const res = await fetch('/api/users/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupForm.email }),
    })
    if (!res.ok) throw new Error('전송 실패')
    isCodeSent.value = true
    codeMessage.value = '인증번호가 전송되었습니다.'
    codeMessageType.value = 'success'
  } catch (e) {
    codeMessage.value = e.message || '전송에 실패했습니다.'
    codeMessageType.value = 'error'
  } finally {
    isSendingEmail.value = false
  }
}

const verifyEmail = async () => {
  codeMessage.value = ''
  isVerifying.value = true
  try {
    const res = await fetch('/api/users/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupForm.email, code: verificationCode.value }),
    })
    if (!res.ok) throw new Error('인증 실패')
    emailVerified.value = true
    codeMessage.value = '이메일 인증이 완료되었습니다.'
    codeMessageType.value = 'success'
  } catch (e) {
    emailVerified.value = false
    codeMessage.value = e.message || '인증에 실패했습니다.'
    codeMessageType.value = 'error'
  } finally {
    isVerifying.value = false
  }
}

// 폼 검증
const validateForm = () => {
  // 에러 초기화
  Object.keys(errors).forEach((key) => (errors[key] = ''))

  let isValid = true

  // 이름 검증
  if (!signupForm.name.trim()) {
    errors.name = '이름을 입력해주세요.'
    isValid = false
  }

  // 닉네임 검증
  if (!signupForm.nickname.trim()) {
    errors.nickname = '닉네임을 입력해주세요.'
    isValid = false
  } else if (signupForm.nickname.length < 2) {
    errors.nickname = '닉네임은 최소 2자 이상이어야 합니다.'
    isValid = false
  }

  // 이메일 검증
  if (!signupForm.email) {
    errors.email = '이메일을 입력해주세요.'
    isValid = false
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupForm.email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.'
      isValid = false
    }
  }

  // 비밀번호 검증
  if (!signupForm.password) {
    errors.password = '비밀번호를 입력해주세요.'
    isValid = false
  } else if (signupForm.password.length < 8) {
    errors.password = '비밀번호는 최소 8자 이상이어야 합니다.'
    isValid = false
  }

  // 비밀번호 확인 검증
  if (!signupForm.passwordConfirm) {
    errors.passwordConfirm = '비밀번호를 다시 입력해주세요.'
    isValid = false
  } else if (signupForm.password !== signupForm.passwordConfirm) {
    errors.passwordConfirm = '비밀번호가 일치하지 않습니다.'
    isValid = false
  }

  // 연락처 검증
  if (!signupForm.phone) {
    errors.phone = '연락처를 입력해주세요.'
    isValid = false
  } else {
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/
    if (!phoneRegex.test(signupForm.phone.replace(/-/g, ''))) {
      errors.phone = '올바른 연락처 형식이 아닙니다.'
      isValid = false
    }
  }

  // 주소 검증
  if (!signupForm.address) {
    errors.address = '주소를 입력해주세요.'
    isValid = false
  }

  // 필수 약관 동의 검증
  if (!signupForm.agreeTerms || !signupForm.agreePrivacy) {
    errors.terms = '필수 약관에 동의해주세요.'
    isValid = false
  }

  return isValid
}

// 회원가입
const handleSignup = async () => {
  if (!validateForm()) return

  isLoading.value = true

  // JSON 페이로드 생성
  const payload = {
    name: signupForm.name,
    nickname: signupForm.nickname,
    email: signupForm.email,
    password: signupForm.password,
    phone: signupForm.phone,
    address: signupForm.address,
    addressDetail: signupForm.addressDetail,
  }

  try {
    // 실제 API 호출
    const { data, status } = await axios.post('/api/users/register', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (status) {
      console.log('회원가입 성공', data)
      alert('회원가입이 완료되었습니다!')

      // 로그인 페이지로 이동
      await router.push('/login')
    }
  } catch (err) {
    const msg = err.response?.data?.message || '회원가입에 실패했습니다.'
    alert(msg)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 */
</style>
