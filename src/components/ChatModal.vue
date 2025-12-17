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
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div class="text-sm font-semibold text-gray-900">채팅방</div>
            <div class="text-[12px] text-gray-500">
              {{ hasUserCode ? '로그인 계정 기준' : '로그인 후 이용 가능' }}
            </div>
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
              v-else-if="!hasUserCode"
              class="px-4 py-6 text-sm text-gray-500 text-center"
            >
              로그인 후 채팅방을 볼 수 있습니다.
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
                :class="isMine(msg) ? 'justify-end' : 'justify-start'"
              >
                <div
                  v-if="isMine(msg)"
                  class="flex items-end gap-2 w-full max-w-full justify-end"
                >
                  <div class="flex items-center pb-1">
                    <span
                      v-if="!(msg.read ?? msg.isRead)"
                      class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-semibold text-indigo-600"
                    >
                      1
                    </span>
                  </div>
                  <div class="flex flex-col max-w-[75%] items-end">
                    <div class="text-xs font-semibold text-gray-600 mb-1 text-right">
                      {{ getProfile(msg.senderCode).nickname || msg.senderCode }}
                    </div>
                    <div class="w-full rounded-2xl px-3 py-2 shadow-sm bg-indigo-600 text-white">
                      <div class="text-sm whitespace-pre-wrap break-words">{{ msg.message }}</div>
                      <div class="flex items-center justify-end gap-2 mt-1 text-[11px] opacity-70">
                        <span>{{ msg.createdAt ? formatTime(msg.createdAt) : '' }}</span>
                      </div>
                    </div>
                  </div>
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
                </div>

                <div
                  v-else
                  class="flex items-end gap-2 w-full max-w-full justify-start"
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
                  <div class="flex flex-col max-w-[75%] items-start">
                    <div class="text-xs font-semibold text-gray-600 mb-1">
                      {{ getProfile(msg.senderCode).nickname || msg.senderCode }}
                    </div>
                    <div class="w-full rounded-2xl px-3 py-2 shadow-sm bg-gray-100 text-gray-900">
                      <div class="text-sm whitespace-pre-wrap break-words">{{ msg.message }}</div>
                      <div class="flex items-center justify-end gap-2 mt-1 text-[11px] opacity-70">
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
import { api } from '@/api/stompIndex'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  initialRoomId: { type: String, default: '' },
})
const userCode = ref('')

const getAccessToken = () =>
  sessionStorage.getItem('accessToken') ||
  sessionStorage.getItem('access') ||
  localStorage.getItem('accessToken') ||
  localStorage.getItem('access')

const decodeUserCodeFromToken = (token) => {
  if (!token) return ''
  try {
    const payloadPart = token.split('.')[1]
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded))
    return decoded?.userCode || ''
  } catch (e) {
    console.warn('액세스 토큰 디코드 실패', e)
    return ''
  }
}

const ensureUserCode = () => {
  const decoded = decodeUserCodeFromToken(getAccessToken())
  const stored =
    sessionStorage.getItem('X-CODE') ||
    sessionStorage.getItem('userCode')

  if (decoded && decoded !== stored) {
    userCode.value = decoded
    sessionStorage.setItem('X-CODE', decoded)
    return decoded
  }

  if (stored) {
    userCode.value = stored
    return stored
  }

  if (decoded) {
    userCode.value = decoded
    sessionStorage.setItem('X-CODE', decoded)
    return decoded
  }

  return ''
}

const fetchUserCodeFromApi = async () => {
  try {
    const { data } = await api.get('/users/')
    const payload = data?.data || data
    return payload?.userCode || payload?.code || ''
  } catch (e) {
    console.warn('userCode 조회 실패', e)
    return ''
  }
}

const ensureUserCodeAsync = async () => {
  const decoded = decodeUserCodeFromToken(getAccessToken())
  if (decoded) {
    userCode.value = decoded
    sessionStorage.setItem('X-CODE', decoded)
    return decoded
  }

  const existing = ensureUserCode()
  if (existing) return existing

  const fetched = await fetchUserCodeFromApi()
  if (fetched) {
    userCode.value = fetched
    sessionStorage.setItem('X-CODE', fetched)
    return fetched
  }
  return ''
}

const emit = defineEmits(['close', 'unread-update'])

const roomFilter = ref('')
const rooms = ref([])
const roomsLoading = ref(false)
const selectedRoom = ref(null)
const messages = ref([])
const messagesLoading = ref(false)
const messageInput = ref('')
const pendingRoomId = ref(props.initialRoomId || '')

const stompClient = ref(null)
const stompConnected = ref(false)
const messageListRef = ref(null)
const userProfiles = ref({})
const loadingProfileCodes = new Set()
const bottomAnchor = ref(null)

const hasUserCode = computed(() => !!userCode.value)

const filteredRooms = computed(() => {
  const term = roomFilter.value.trim().toLowerCase()
  console.log(roomFilter.value)
  if (!term) return rooms.value
  return rooms.value.filter((r) => {
    const title = r.productTitle || r.productCode || ''
    return title.toLowerCase().includes(term)
  })
})

const setPendingRoom = (roomId) => {
  if (!roomId) return
  const existing = rooms.value.find((r) => r.id === roomId)
  if (existing) {
    selectRoom(existing)
    pendingRoomId.value = ''
  } else {
    pendingRoomId.value = roomId
  }
}

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

const isMine = (msg) => msg?.senderCode === userCode.value

const loadUserProfile = async (code) => {
  if (!code || userProfiles.value[code] || loadingProfileCodes.has(code)) return
  loadingProfileCodes.add(code)
  try {
    const { data } = await api.get('/users/')
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

const markLocalRead = (readerCode, chatId) => {
  if (!readerCode) return
  messages.value = messages.value.map((m) =>
    m.senderCode && m.senderCode !== readerCode
      ? { ...m, read: true, isRead: true }
      : m,
  )
  if (selectedRoom.value?.id === chatId) {
    const idx = rooms.value.findIndex((r) => r.id === chatId)
    if (idx !== -1) {
      rooms.value[idx] = { ...rooms.value[idx], unreadCount: 0 }
    }
    selectedRoom.value = { ...selectedRoom.value, unreadCount: 0 }
  }
}

const markAsRead = async (chatId) => {
  try {
    const resolved = await ensureUserCodeAsync()
    if (!resolved) {
      console.error('읽음 처리 실패: userCode 없음')
      return
    }
    await api.post(
      `/chat/rooms/${chatId}/read`,
      {},
      {
        headers: { 'X-CODE': userCode.value },
      },
    )
    markLocalRead(userCode.value, chatId)
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

const connectStomp = (chatId) =>
  new Promise(async (resolve, reject) => {
    try {
      await ensureUserCodeAsync()
      const Stomp = await ensureStomp()
      disconnectStomp()
      const wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws'
      // 게이트웨이 경유: /api/chat/ws-chat -> gateway에서 /ws-chat 으로 rewrite
      const socket = new WebSocket(`wss://dbay.site/api/chat/ws-chat`)
      const client = Stomp.over(socket)
      client.debug = () => {}
      client.connect(
        {},
        () => {
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
          resolve()
        },
        (err) => {
          stompConnected.value = false
          reject(err)
        },
      )
      stompClient.value = client
    } catch (e) {
      console.error('STOMP 연결 실패', e)
      reject(e)
    }
  })

const loadRooms = async () => {
  if (!(await ensureUserCodeAsync())) return
  roomsLoading.value = true
  try {
    const { data } = await api.get('/chat/rooms', {
      params: { status: 'OPEN' },
      headers: { 'X-CODE': userCode.value },
    })
    rooms.value = Array.isArray(data) ? data : data?.data || []
    console.log("응답:",data)
    emit(
      'unread-update',
      rooms.value.reduce((sum, r) => sum + (Number(r.unreadCount) || 0), 0),
    )
    prefetchProfiles(rooms.value.map((room) => getCounterpartCode(room)))
    if (pendingRoomId.value) {
      const found = rooms.value.find((r) => r.id === pendingRoomId.value)
      if (found) {
        await selectRoom(found)
        pendingRoomId.value = ''
      }
    }
  } catch (e) {
    console.error('방 목록 불러오기 실패', e)
  } finally {
    roomsLoading.value = false
  }
}

const loadMessages = async (chatId) => {
  messagesLoading.value = true
  try {
    console.log(chatId)
    if (!(await ensureUserCodeAsync())) {
      console.error('메시지 불러오기 실패: userCode 없음')
      return
    }
    const { data } = await api.get(`/chat/rooms/${chatId}/messages`, {
      headers: { 'X-CODE': userCode.value },
    })
    console.log('메세지: ', data)
    messages.value = Array.isArray(data) ? data : data?.data || []
    markLocalRead(userCode.value, chatId)
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
  console.log(selectedRoom.value)
  messages.value = []
  prefetchProfiles([room.sellerCode, room.buyerCode, userCode.value])
  await connectStomp(room.id) // 구독 먼저
  await loadMessages(room.id) // 이 호출에서 읽음 이벤트 발생 → 구독 후라 놓치지 않음
  scrollToBottom()
}

const sendMessage = async () => {
  const resolved = await ensureUserCodeAsync()
  if (!resolved) {
    console.error('메시지 전송 실패: userCode 없음')
    return
  }
  if (
    !selectedRoom.value ||
    !messageInput.value.trim() ||
    !userCode.value.trim() ||
    !stompClient.value
  )
    return

  try {
    console.log('[chat] send with X-CODE:', userCode.value)
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
  () => props.initialRoomId,
  (val) => {
    if (val) setPendingRoom(val)
  },
)

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true, flush: 'post' },
)

onMounted(async () => {
  await ensureUserCodeAsync()
})

onBeforeUnmount(() => {
  disconnectStomp()
})
</script>
