import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chatUi', () => {
  const isOpen = ref(false)
  const targetRoomId = ref('')
  const unreadCount = ref(0)

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    targetRoomId.value = ''
  }

  const openRoom = (roomId) => {
    targetRoomId.value = roomId || ''
    isOpen.value = true
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
    if (!isOpen.value) targetRoomId.value = ''
  }

  const setUnreadCount = (count) => {
    unreadCount.value = Number(count) || 0
  }

  return {
    isOpen,
    targetRoomId,
    unreadCount,
    open,
    openRoom,
    close,
    toggle,
    setUnreadCount,
  }
})
