<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <!-- 상단 헤더 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center gap-4">
        <!-- 로고 -->
        <a href="/" class="flex items-center gap-2 flex-shrink-0">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white text-lg">⚡</span>
          </div>
          <span class="text-2xl font-bold text-indigo-600 hidden sm:block">dbay</span>
        </a>

        <!-- 네비게이션 (로그인 상태) -->
        <nav v-if="isLoggedIn" class="flex items-center gap-2 ml-auto">
          <div class="hidden sm:flex items-center gap-2">
            <!-- User -->
            <button
              @click="goToMyPage"
              class="group relative inline-flex items-center gap-2 h-10 px-3 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="마이페이지"
            >
              <span class="text-lg leading-none">👤</span>
              <span class="leading-tight">
                <div class="text-sm font-semibold text-gray-800">
                  {{ userInfo.nickname }}<span class="text-gray-400 font-medium">님</span>
                </div>
              </span>

              <!-- tooltip -->
              <span
                class="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
              >
                <span
                  class="relative whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow"
                >
                  마이페이지
                </span>
              </span>
            </button>

            <!-- divider -->
            <div class="mx-1 h-6 w-px bg-gray-200"></div>

            <div
              class="inline-flex items-center gap-2 h-10 px-3 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="예치금"
            >
              <span class="text-lg leading-none">💸</span>
              <span class="text-sm font-semibold">{{ formattedBalance }}</span>
            </div>

            <!-- divider -->
            <div class="mx-1 h-6 w-px bg-gray-200"></div>

            <!-- Cart -->
            <button
              @click="goToCart"
              class="group relative inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="장바구니"
            >
              <span class="text-lg leading-none">🛒</span>
              <span
                v-if="cartCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold leading-none ring-2 ring-white"
              >
                {{ cartCount }}
              </span>
              <span
                class="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
              >
                <span
                  class="relative whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow"
                >
                  장바구니
                </span>
              </span>
            </button>

            <!-- divider -->
            <div class="mx-1 h-6 w-px bg-gray-200"></div>

            <!-- Chat -->
            <button
              @click="openChat"
              class="group relative inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="채팅"
            >
              <span class="text-lg leading-none">💬</span>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold leading-none ring-2 ring-white"
              >
                {{ unreadCount }}
              </span>
              <span
                class="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
              >
                <span
                  class="relative whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow"
                >
                  채팅
                </span>
              </span>
            </button>

            <!-- divider -->
            <div class="mx-1 h-6 w-px bg-gray-200"></div>

            <!-- Logout -->
            <button
              @click="handleLogout"
              class="group relative inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
              aria-label="로그아웃"
            >
              <span class="text-lg leading-none">🚪</span>

              <!-- tooltip -->
              <span
                class="pointer-events-none absolute left-1/2 top-full z-50 mt-1 -translate-x-1/2 opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
              >
                <span
                  class="relative whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white shadow"
                >
                  로그아웃
                </span>
              </span>
            </button>
          </div>
        </nav>

        <!-- 네비게이션 (비로그인 상태) -->
        <nav v-else class="flex items-center gap-2 ml-auto">
          <button
            @click="goToLogin"
            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <span class="text-sm font-medium">로그인</span>
          </button>
        </nav>
      </div>
    </div>
  </header>

  <ChatModal
    :open="isChatOpen"
    :initial-room-id="targetRoomId"
    @close="chatStore.close"
    @unread-update="chatStore.setUnreadCount"
  />
</template>

<script setup>
import router from '@/router'
import { ref, onMounted, computed, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import ChatModal from '@/components/ChatModal.vue'
import { useChatStore } from '@/stores/chat'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { api } from '@/api'

const cartStore = useCartStore()
const chatStore = useChatStore()
const { count: cartCount } = storeToRefs(cartStore)
const { isOpen: isChatOpen, unreadCount, targetRoomId } = storeToRefs(chatStore)
const route = useRoute()

// 상태 관리
const showMobileMenu = ref(false)

// 인증/유저 상태
const accessToken = ref(null)
const refreshToken = ref(null)
const userInfo = ref({ nickname: '' })
const isLoggedIn = ref(false)
const balance = ref(0)
const formattedBalance = computed(() => `${balance.value.toLocaleString('ko-KR')} 원`)

// 메서드
const goToCart = () => {
  console.log('장바구니로 이동')
  showMobileMenu.value = false
  router.push('/cart')
}

const goToMyPage = () => {
  console.log('마이페이지로 이동')
  showMobileMenu.value = false
  router.push('/profile')
}

const goToLogin = () => {
  console.log('로그인 페이지로 이동')
  router.push('/login')
}

const openChat = () => {
  chatStore.open()
}


// 토큰 로드
const loadTokens = () => {
  const access = sessionStorage.getItem('accessToken')
  if (access) {
    accessToken.value = access
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
  }
}

// 토큰 삭제
const clearTokens = () => {
  accessToken.value = null
  refreshToken.value = null
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('X-CODE')
  isLoggedIn.value = false
}

// 유저 정보 가져오기
const fetchUserInfo = async () => {
  try {
    const response = await api.get('/users/');
    const payload = response?.data?.data ?? response?.data ?? response;
    if (!payload) return;

    //닉네임
    const { nickname } = payload || {}
    if (nickname) userInfo.value.nickname = nickname

    //예치금
    const depositResponse = await api.get('/deposits')
    const depositPayload = depositResponse?.data?.data ?? depositResponse?.data ?? depositResponse
    const nextBalance = Number(depositPayload?.balance)
    if (!Number.isNaN(nextBalance)) balance.value = nextBalance
  } catch (error) {
    console.error('유저 정보 조회 실패:', error)
  }
}

const checkLoginStatus = async () => {
  try {
    const { data } = await api.get('/users/isLogin', { withCredentials: true })
    const loggedIn = data?.data === true || data === true
    isLoggedIn.value = loggedIn

    if (loggedIn) {
      loadTokens()
      fetchUserInfo()
      cartStore.getCartInfo()
    } else {
      clearTokens()
    }
  } catch (error) {
    console.error('로그인 상태 확인 실패:', error)
    isLoggedIn.value = false
    clearTokens()
  }
}

// 로그아웃
const handleLogout = async () => {
  if (!confirm('로그아웃 하시겠습니까?')) return

  try {
    const access = sessionStorage.getItem('accessToken') || accessToken.value
    await api.post(
      '/users/logout',
      {},
      {
        headers: access ? { access } : {},
        withCredentials: true,
      },
    )
  } catch (error) {
    console.error('로그아웃 API 호출 실패', error)
  } finally {
    clearTokens()
    userInfo.value.nickname = ''
    cartCount.value = 0
    chatStore.setUnreadCount(0)
    chatStore.close()
    showMobileMenu.value = false
    isLoggedIn.value = false
    router.push('/')
  }
}

// 마운트 + 라우트 변경 시 로그인 상태 반영
onMounted(() => {
  loadTokens()
  checkLoginStatus()
})

// 라우트 변경 시마다 로그인 상태를 재확인해 헤더에 반영
watch(
  () => route.fullPath,
  () => {
    loadTokens()
    checkLoginStatus()
  },
)

// 외부에서 사용할 수 있도록 로그인 함수 expose
// defineExpose({
//   saveTokens,
//   loadTokens,
//   clearTokens,
// })
</script>

<style scoped>
/* 스크롤바 숨김 */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
