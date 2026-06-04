import { defineStore } from 'pinia'
import type { Message, Conversation } from '@presteza/types'
import { WS_EVENTS } from '@presteza/types'

interface ConversationWithMeta extends Conversation {
  clientCompanyName?: string
  clientResponsibleName?: string
  lastMessage?: Message | null
  unreadCount?: number
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    conversations: [] as ConversationWithMeta[],
    activeConversationId: null as string | null,
    messages: [] as Message[],
    myConversation: null as Conversation | null,
    loading: false,
    socketConnected: false,
    /** Impede registro duplicado de listeners quando connect() é chamado
     *  antes do socket ter conectado (layout + página chamam juntos). */
    _listenersReady: false,
  }),

  getters: {
    activeConversation: (s) =>
      s.conversations.find((c) => c.id === s.activeConversationId) ?? null,
  },

  actions: {
    // ─── Conexão WebSocket ─────────────────────────────────────────────────────

    connect() {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      if (!$socket) return

      const authStore = useAuthStore()

      const joinUserRoom = () => {
        if (authStore.user?.id) {
          $socket.emit(WS_EVENTS.JOIN_USER_ROOM, { userId: authStore.user.id })
        }
      }

      // Já conectado: sincroniza estado e entra na sala de notificações
      if ($socket.connected) {
        console.log('🔍 [chatStore.connect] socket já conectado, sincronizando')
        this.socketConnected = true
        joinUserRoom()
        return
      }

      if (this._listenersReady) {
        console.log('🔍 [chatStore.connect] listeners já registrados, aguardando reconexão automática')
        return
      }

      console.log('🔍 [chatStore.connect] registrando listeners e conectando...')
      this._listenersReady = true

      $socket.on('connect', () => {
        this.socketConnected = true
        joinUserRoom()
        console.log('✅ Socket conectado:', $socket.id)
      })

      $socket.on('disconnect', (reason: string) => {
        this.socketConnected = false
        console.log('🔌 Socket desconectado — motivo:', reason)
      })

      $socket.on(WS_EVENTS.NEW_MESSAGE, (message: Message) => {
        if (message.conversationId === this.activeConversationId) {
          const alreadyExists = this.messages.some((m) => m.id === message.id)
          if (!alreadyExists) this.messages.push(message)
        }
        const conv = this.conversations.find((c) => c.id === message.conversationId)
        if (conv) conv.lastMessage = message
      })

      $socket.connect()
    },

    disconnect() {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      if ($socket?.connected) $socket.disconnect()
      this.socketConnected = false
      this._listenersReady = false  // permite re-registrar listeners no próximo login
    },

    joinConversation(conversationId: string) {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      $socket?.emit(WS_EVENTS.JOIN_CONVERSATION, { conversationId })
    },

    // ─── HTTP ──────────────────────────────────────────────────────────────────

    async fetchConversations() {
      this.loading = true
      try {
        const api = useApi()
        const data = await api.get<any[]>('/chat/conversations')
        this.conversations = data.map((c) => ({
          ...c,
          clientCompanyName: c.client?.companyName,
          clientResponsibleName: c.client?.responsibleName,
          lastMessage: c.messages?.[0] ?? null,
          unreadCount: 0,
        }))
      } finally {
        this.loading = false
      }
    },

    async fetchMyConversation() {
      this.loading = true
      try {
        const api = useApi()
        this.myConversation = await api.get<Conversation>('/chat/my-conversation')
        return this.myConversation
      } finally {
        this.loading = false
      }
    },

    async fetchMessages(conversationId: string) {
      this.loading = true
      try {
        const api = useApi()
        const data = await api.get<Message[]>(
          `/chat/conversations/${conversationId}/messages`,
        )
        this.messages = data
        this.activeConversationId = conversationId
      } finally {
        this.loading = false
      }
    },

    async openConversation(conversationId: string) {
      await this.fetchMessages(conversationId)
      this.joinConversation(conversationId)
    },

    sendMessage(conversationId: string, content: string, senderId: string) {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      if (!$socket?.connected) {
        console.warn('Socket não conectado — mensagem não enviada')
        return
      }
      $socket.emit(WS_EVENTS.SEND_MESSAGE, { conversationId, senderId, content, type: 'TEXT' })
    },

    reset() {
      this.conversations = []
      this.activeConversationId = null
      this.messages = []
      this.myConversation = null
    },
  },
})
