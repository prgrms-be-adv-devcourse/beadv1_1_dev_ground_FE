<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div
        class="relative bg-white w-full max-w-5xl h-[600px] rounded-2xl shadow-2xl overflow-hidden flex"
      >
        <button
          class="absolute top-3 right-3 w-9 h-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center shadow-sm"
          @click="$emit('close')"
        >
          ✕
        </button>
        <!-- Rooms -->
        <div class="w-1/3 border-r border-gray-200 flex flex-col">
          <div class="p-4 border-b border-gray-200 flex items-center gap-2">
            <input
              v-model="userCode"
              class="flex-1 h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="X-CODE / 사용자 코드"
            />
            <button
              class="h-10 px-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
              @click="loadRooms"
            >
              불러오기
            </button>
          </div>
          <div class="p-4 border-b border-gray-200 flex items-center gap-2">
            <input
              v-model="roomFilter"
              class="w-full h-9 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
              placeholder="상품명으로 검색"
            />
          </div>
          <div class="flex-1 overflow-auto">
            <div
              v-if="roomsLoading"
              class="px-4 py-6 text-sm text-gray-500 flex items-center justify-center"
            >
              방 목록 불러오는 중...
            </div>
            <div
              v-else-if="filteredRooms.length === 0"
              class="px-4 py-6 text-sm text-gray-500 text-center"
            >
              방이 없습니다.
            </div>
            <ul v-else class="divide-y divide-gray-100">
              <li
                v-for="room in filteredRooms"
                :key="room.id"
                @click="selectRoom(room)"
                class="p-4 cursor-pointer hover:bg-indigo-50 transition flex items-center gap-3"
                :class="selectedRoom?.id === room.id ? 'bg-indigo-50' : ''"
              >
                <div
                  class="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-inner"
                >
                  <img
                    v-if="getProfile(getCounterpartCode(room)).profileImage"
                    :src="getProfile(getCounterpartCode(room)).profileImage"
                    alt="프로필 이미지"
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ getProfileInitial(getCounterpartCode(room)) }}</span>
                </div>
                <div class="flex-1 min-w-0 flex flex-col gap-1">
                  <div class="flex items-center justify-between gap-2">
                    <div class="text-sm font-semibold text-gray-900 truncate">
                      {{ getRoomTitle(room) }}
                    </div>
                    <div class="text-[11px] text-gray-400" v-if="room.lastMessageAt">
                      {{ formatTime(room.lastMessageAt) }}
                    </div>
                    <span
                      v-if="room.unreadCount > 0"
                      class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full"
                    >
                      {{ room.unreadCount }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ getProfile(getCounterpartCode(room)).nickname || getCounterpartCode(room) }}
                  </div>
                  <div class="text-sm text-gray-700 truncate" v-if="room.lastMessage">
                    {{ room.lastMessage }}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 flex flex-col">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-gray-900">
                {{ selectedRoom ? getRoomTitle(selectedRoom) : '방을 선택하세요' }}
              </div>
            </div>
            <div class="text-xs text-gray-500">
              <span class="inline-flex items-center gap-1">
                <span
                  class="w-2 h-2 rounded-full"
                  :class="stompConnected ? 'bg-green-500' : 'bg-gray-300'"
                ></span>
                {{ stompConnected ? '실시간 연결됨' : '연결 안 됨' }}
              </span>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-4 space-y-3" ref="messageListRef">
            <template v-if="!selectedRoom">
              <div class="text-sm text-gray-500">채팅방을 선택하세요.</div>
            </template>
            <template v-else-if="messagesLoading">
              <div class="text-sm text-gray-500">메시지 불러오는 중...</div>
            </template>
            <template v-else-if="messages.length === 0">
              <div class="text-sm text-gray-500">메시지가 없습니다.</div>
            </template>
            <template v-else>
              <div
                v-for="(msg, idx) in messages"
                :key="idx"
                class="flex"
                :class="msg.senderCode === userCode ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="flex items-end gap-2 w-full"
                  :class="msg.senderCode === userCode ? 'flex-row-reverse' : 'flex-row'"
                >
                  <div class="flex flex-col items-center">
                    <div
                      class="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-indigo-100 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-inner"
                    >
                      <img
                        v-if="getProfile(msg.senderCode).profileImage"
                        :src="getProfile(msg.senderCode).profileImage"
                        alt="프로필 이미지"
                        class="w-full h-full object-cover"
                      />
                      <span v-else>{{ getProfileInitial(msg.senderCode) }}</span>
                    </div>
                  </div>
                  <div
                    class="flex flex-col max-w-[75%]"
                    :class="msg.senderCode === userCode ? 'items-end' : 'items-start'"
                  >
                    <div
                      class="text-xs font-semibold text-gray-600 mb-1"
                      :class="msg.senderCode === userCode ? 'text-right' : ''"
                    >
                      {{ getProfile(msg.senderCode).nickname || msg.senderCode }}
                    </div>
                    <div
                      class="w-full rounded-2xl px-3 py-2 shadow-sm"
                      :class="
                        msg.senderCode === userCode
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      "
                    >
                      <div class="text-sm whitespace-pre-wrap break-words">{{ msg.message }}</div>
                      <div class="flex items-center justify-end gap-2 mt-1 text-[11px] opacity-70">
                        <span
                          v-if="msg.senderCode === userCode && !(msg.read ?? msg.isRead)"
                          class="inline-block w-4 text-center"
                        >
                          1
                        </span>
                        <span>{{ msg.createdAt ? formatTime(msg.createdAt) : '' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div ref="bottomAnchor" />
          </div>
          <div class="p-4 border-t border-gray-200 flex items-center gap-2">
            <input
              v-model="messageInput"
              class="flex-1 h-11 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="메시지를 입력하세요"
              @keyup.enter="sendMessage"
              :disabled="!selectedRoom"
            />
            <button
              class="h-11 px-4 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              :disabled="!selectedRoom || !messageInput.trim()"
              @click="sendMessage"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { api } from '@/api'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
api

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'unread-update'])

const userCode = ref('')
const roomFilter = ref('')
const rooms = ref([])
const roomsLoading = ref(false)
const selectedRoom = ref(null)
const messages = ref([])
const messagesLoading = ref(false)
const messageInput = ref('')

const stompClient = ref(null)
const stompConnected = ref(false)
const messageListRef = ref(null)
const userProfiles = ref({})
const loadingProfileCodes = new Set()
const bottomAnchor = ref(null)

const filteredRooms = computed(() => {
  const term = roomFilter.value.trim().toLowerCase()
  if (!term) return rooms.value
  return rooms.value.filter((r) => {
    const title = r.productTitle || r.productCode || ''
    return title.toLowerCase().includes(term)
  })
})

const formatTime = (iso) => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return typeof iso === 'string' ? iso : ''
  }
}

const getProfile = (code) =>
  userProfiles.value[code] || { nickname: code || '알 수 없음', profileImage: '' }

const getProfileInitial = (code) => {
  const profile = getProfile(code)
  const base = profile.nickname || code || '?'
  return base.charAt(0).toUpperCase()
}

const getRoomTitle = (room) => room?.productTitle || room?.productCode || '상품'

const getCounterpartCode = (room) => {
  if (!room) return ''
  if (userCode.value && room.sellerCode === userCode.value) return room.buyerCode
  if (userCode.value && room.buyerCode === userCode.value) return room.sellerCode
  return room.sellerCode || room.buyerCode || ''
}

const loadUserProfile = async (code) => {
  if (!code || userProfiles.value[code] || loadingProfileCodes.has(code)) return
  loadingProfileCodes.add(code)
  try {
    const { data } = await api.get('/users/', { headers: { 'X-CODE': code } })
    const payload = data?.data || data
    userProfiles.value = {
      ...userProfiles.value,
      [code]: {
        nickname: payload?.nickname || code,
        profileImage: payload?.profileImage || payload?.profileImageUrl || '',
      },
    }
  } catch (e) {
    console.error('유저 정보 불러오기 실패', e)
    userProfiles.value = {
      ...userProfiles.value,
      [code]: { nickname: code || '알 수 없음', profileImage: '' },
    }
  } finally {
    loadingProfileCodes.delete(code)
  }
}

const prefetchProfiles = async (codes = []) => {
  const uniqueCodes = [...new Set(codes.filter(Boolean))]
  await Promise.all(uniqueCodes.map((c) => loadUserProfile(c)))
}

const markAsRead = async (chatId) => {
  try {
    await api.post(
      `/chat/rooms/${chatId}/read`,
      {},
      {
        headers: { 'X-CODE': userCode.value },
      },
    )
  } catch (e) {
    console.error('읽음 처리 실패', e)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const anchor = bottomAnchor.value
    if (anchor && typeof anchor.scrollIntoView === 'function') {
      anchor.scrollIntoView({ block: 'end', behavior: 'auto' })
    } else if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

const ensureStomp = () =>
  new Promise((resolve, reject) => {
    if (window.Stomp) return resolve(window.Stomp)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js'
    script.onload = () => resolve(window.Stomp)
    script.onerror = reject
    document.body.appendChild(script)
  })

const disconnectStomp = () => {
  if (stompClient.value) {
    stompClient.value.disconnect(() => {
      stompConnected.value = false
    })
    stompClient.value = null
  }
}

const connectStomp = async (chatId) => {
  try {
    const Stomp = await ensureStomp()
    disconnectStomp()
    const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws'
    // 게이트웨이 경유: /api/chat/ws-chat -> gateway에서 /ws-chat 으로 rewrite
    const socket = new WebSocket(`${wsProtocol}://localhost:8000/api/chat/ws-chat`)
    const client = Stomp.over(socket)
    client.debug = () => {}
    client.connect({}, () => {
      stompConnected.value = true
      client.subscribe(`/topic/chat/${chatId}`, (message) => {
        try {
          const payload = JSON.parse(message.body)
          loadUserProfile(payload.senderCode)
          messages.value.push({ ...payload, read: false, isRead: false })
          if (
            selectedRoom.value?.id === chatId &&
            open &&
            userCode.value &&
            payload.senderCode !== userCode.value
          ) {
            markAsRead(chatId)
          }
          scrollToBottom()
        } catch (e) {
          console.warn('메시지 파싱 실패', e)
        }
      })
      client.subscribe(`/topic/chat/${chatId}/read`, (message) => {
        try {
          const payload = JSON.parse(message.body)
          const readerCode = payload?.readerCode
          messages.value = messages.value.map((m) =>
            m.senderCode && readerCode && m.senderCode !== readerCode
              ? { ...m, read: true, isRead: true }
              : m,
          )
        } catch (e) {
          console.warn('읽음 이벤트 파싱 실패', e)
        }
      })
    })
    stompClient.value = client
  } catch (e) {
    console.error('STOMP 연결 실패', e)
  }
}

const loadRooms = async () => {
  if (!userCode.value.trim()) return
  roomsLoading.value = true
  try {
    const { data } = await api.get('/chat/rooms', {
      headers: { 'X-CODE': userCode.value },
      params: { status: 'OPEN' },
    })
    rooms.value = Array.isArray(data) ? data : data?.data || []
    console.log(data)
    emit(
      'unread-update',
      rooms.value.reduce((sum, r) => sum + (Number(r.unreadCount) || 0), 0),
    )
    prefetchProfiles(rooms.value.map((room) => getCounterpartCode(room)))
  } catch (e) {
    console.error('방 목록 불러오기 실패', e)
  } finally {
    roomsLoading.value = false
  }
}

const loadMessages = async (chatId) => {
  messagesLoading.value = true
  try {
    const { data } = await api.get(`/chat/rooms/${chatId}/messages`, {
      headers: { 'X-CODE': userCode.value },
    })
    messages.value = Array.isArray(data) ? data : data?.data || []
    await prefetchProfiles(messages.value.map((m) => m.senderCode))
    // 읽음 처리 후 목록의 해당 방 카운트 즉시 0으로 갱신
    const idx = rooms.value.findIndex((r) => r.id === chatId)
    if (idx !== -1) {
      rooms.value[idx] = { ...rooms.value[idx], unreadCount: 0 }
    }
    if (selectedRoom.value?.id === chatId) {
      selectedRoom.value = { ...selectedRoom.value, unreadCount: 0 }
    }
    emit(
      'unread-update',
      rooms.value.reduce((sum, r) => sum + (Number(r.unreadCount) || 0), 0),
    )
    await nextTick()
    // scrollToBottom()
  } catch (e) {
    console.error('메시지 불러오기 실패', e)
  } finally {
    messagesLoading.value = false
  }
}

const selectRoom = async (room) => {
  selectedRoom.value = room
  messages.value = []
  prefetchProfiles([room.sellerCode, room.buyerCode, userCode.value])
  await loadMessages(room.id)
  connectStomp(room.id)
  scrollToBottom()

}

const sendMessage = () => {
  if (
    !selectedRoom.value ||
    !messageInput.value.trim() ||
    !userCode.value.trim() ||
    !stompClient.value
  )
    return
  try {
    stompClient.value.send(
      '/app/chat/messages',
      { 'X-CODE': userCode.value },
      JSON.stringify({
        chatId: selectedRoom.value.id,
        senderCode: userCode.value,
        message: messageInput.value.trim(),
      }),
    )
    messageInput.value = ''
  } catch (e) {
    console.error('메시지 전송 실패', e)
  }
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      loadRooms()
    } else {
      selectedRoom.value = null
      messages.value = []
      disconnectStomp()
    }
  },
)

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true, flush: 'post' },
)

// onMounted(async () => {
//   // 기본 X-CODE를 미리 채워놓고 싶다면 여기 설정
//   const { data } = await api.get('/chat/test')
//   console.log(data)
//   console.warn(data)
//   console.error(data)
// })

onBeforeUnmount(() => {
  disconnectStomp()
})
</script>
