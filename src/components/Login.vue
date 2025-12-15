<template>
  <div
    class="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12"
  >
    <div class="w-full max-w-md">
      <!-- 로그인 폼 -->
      <div class="bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <!-- 타이틀 -->
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
          <p class="text-sm text-gray-600">dbay에 오신 것을 환영합니다</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- 이메일 -->
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              required
              placeholder="example@email.com"
              class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
              :class="{ 'border-red-500': errors.email }"
            />
            <p v-if="errors.email" class="mt-2 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <!-- 비밀번호 -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
              비밀번호
            </label>
            <div>
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="비밀번호를 입력하세요"
                class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all text-sm pr-12"
                :class="{ 'border-red-500': errors.password }"
              />
            </div>
            <p v-if="errors.password" class="mt-2 text-xs text-red-600">{{ errors.password }}</p>
          </div>

          <!-- 로그인 유지 & 비밀번호 찾기 -->
          <!--          <div class="flex items-center justify-between pt-1">-->
          <!--            <label class="flex items-center gap-2 cursor-pointer">-->
          <!--              <input-->
          <!--                v-model="loginForm.rememberMe"-->
          <!--                type="checkbox"-->
          <!--                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"-->
          <!--              />-->
          <!--              <span class="text-sm text-gray-700">로그인 유지</span>-->
          <!--            </label>-->
          <!--            <a-->
          <!--              href="#"-->
          <!--              class="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"-->
          <!--            >-->
          <!--              비밀번호 찾기-->
          <!--            </a>-->
          <!--          </div>-->

          <!-- 로그인 버튼 -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-6"
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
            <span>{{ isLoading ? '로그인 중...' : '로그인' }}</span>
          </button>

          <p
            v-if="loginMessage"
            class="mt-2 text-xs"
            :class="loginMessageType === 'error' ? 'text-red-600' : 'text-green-600'"
          >
            {{ loginMessage }}
          </p>
        </form>

        <!-- 구분선 -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500 font-medium">또는</span>
          </div>
        </div>

        <!-- 소셜 로그인 -->
        <div>
          <!-- 카카오 로그인 -->
          <button
            @click="handleKakaoLogin"
            type="button"
            class="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <span class="text-xl">💬</span>
            <span>카카오로 시작하기</span>
          </button>
        </div>

        <!-- 회원가입 링크 -->
        <p class="mt-8 text-center text-sm text-gray-600">
          아직 회원이 아니신가요?
          <router-link
            to="/signup"
            class="text-indigo-600 hover:text-indigo-700 font-semibold ml-1 transition-colors"
          >
            회원가입
          </router-link>
        </p>
      </div>

      <!-- 추가 안내 -->
      <p class="mt-6 text-center text-xs text-gray-500 leading-relaxed px-4">
        로그인 시 dbay의
        <a href="#" class="underline hover:text-gray-700 transition-colors">이용약관</a> 및
        <a href="#" class="underline hover:text-gray-700 transition-colors">개인정보처리방침</a>에
        동의하게 됩니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router/index.js'
import axios from 'axios'

const route = useRoute()

// 상태 관리
const isLoading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  email: '',
  password: '',
})

const loginMessage = ref('')
const loginMessageType = ref('')

// 폼 검증
const validateForm = () => {
  errors.email = ''
  errors.password = ''

  if (!loginForm.email) {
    errors.email = '이메일을 입력해주세요.'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(loginForm.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.'
    return false
  }

  if (!loginForm.password) {
    errors.password = '비밀번호를 입력해주세요.'
    return false
  }

  if (loginForm.password.length < 6) {
    errors.password = '비밀번호는 최소 6자 이상이어야 합니다.'
    return false
  }

  return true
}

// 일반 로그인
const handleLogin = async () => {
  if (!validateForm()) return

  isLoading.value = true

  const login = {
    email: loginForm.email,
    password: loginForm.password,
  }

  try {
    const { data, headers } = await axios.post('/api/users/login', login, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Axios는 응답 헤더 키를 소문자로 내려주므로 객체 접근으로 읽는다.
    const accessToken = headers?.access || headers?.['access']
    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken)
    } else {
      console.warn('응답 헤더/바디에 access 토큰이 없습니다.')
    }

    console.log('로그인 성공:', data)

    // 메인 페이지로 이동
    await router.push('/')
    alert('로그인 성공!')
  } catch (error) {
    console.error('로그인 오류:', error)
    loginMessage.value = '아이디 또는 비밀번호가 틀렸습니다.'
    loginMessageType.value = 'error'
  } finally {
    isLoading.value = false
  }
}

// 카카오 로그인
const handleKakaoLogin = async () => {
  try {
    // 카카오 OAuth URL로 리다이렉트
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_KAKAO_REDIRECT_URI}&response_type=code`

    window.location.href = kakaoAuthUrl
  } catch (error) {
    console.error('카카오 로그인 오류:', error)
    alert('카카오 로그인 중 오류가 발생했습니다.')
  }
}

const kakaoLogin = async (code) => {
  try {
    // ✅ (A) code를 "쿼리스트링(RequestParam)"으로 보내는 방식
    const { headers } = await axios.get(
      `/api/users/kakaoLogin?code=${encodeURIComponent(code)}`,
      null,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true, // 쿠키(리프레시 등) 쓰면 필요
      },
    )

    // access 토큰 헤더로 받는다면 (네 일반 로그인 로직과 동일)
    const accessToken = headers?.access || headers?.['access']
    if (accessToken) sessionStorage.setItem('accessToken', accessToken)

    // ✅ code 남아있으면 새로고침 때 또 호출되니까 제거
    await router.replace({ path: route.path, query: {} })

    alert('카카오 로그인 성공!')
    await router.push('/')
  } catch (e) {
    console.error(e)
    alert('카카오 로그인 처리 중 오류가 발생했습니다.')
    await router.replace({ path: route.path, query: {} })
  }
}

onMounted(() => {
  const code = route.query.code
  const error = route.query.error

  if (error) {
    alert('카카오 로그인이 취소/실패했습니다.')
    router.replace({ path: route.path, query: {} })
    return
  }

  if (typeof code === 'string' && code) {
    kakaoLogin(code)
  }
})
</script>

<style scoped>
/* 추가 스타일이 필요한 경우 */
</style>
