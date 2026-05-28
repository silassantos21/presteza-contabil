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
    /** Lista de conversas (visão admin) */
    conversations: [] as ConversationWithMeta[],
    /** Conversa atualmente aberta */
    activeConversationId: null as string | null,
    /** Mensagens da conversa ativa */
    messages: [] as Message[],
    /** Conversa do portal do cliente */
    myConversation: null as Conversation | null,
    /** Indicador de carregamento */
    loading: false,
    /** Socket conectado? */
    socketConnected: false,
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
      if (!$socket || $socket.connected) return

      $socket.connect()

      $socket.on('connect', () => {
        this.socketConnected = true
        console.log('✅ Socket conectado:', $socket.id)
      })

      $socket.on('disconnect', () => {
        this.socketConnected = false
        console.log('🔌 Socket desconectado')
      })

      $socket.on(WS_EVENTS.NEW_MESSAGE, (message: Message) => {
        // Só adiciona se for da conversa ativa (evita duplicatas)
        if (message.conversationId === this.activeConversationId) {
          const alreadyExists = this.messages.some((m) => m.id === message.id)
          if (!alreadyExists) {
            this.messages.push(message)
          }
        }
        // Atualiza o lastMessage na lista de conversas (admin)
        const conv = this.conversations.find(
          (c) => c.id === message.conversationId,
        )
        if (conv) {
          conv.lastMessage = message
        }
      })
    },

    disconnect() {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      if ($socket?.connected) {
        $socket.disconnect()
      }
      this.socketConnected = false
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

    // ─── Envio de mensagem via WebSocket ───────────────────────────────────────

    sendMessage(conversationId: string, content: string, senderId: string) {
      if (import.meta.server) return
      const { $socket } = useNuxtApp() as any
      if (!$socket?.connected) {
        console.warn('Socket não conectado — mensagem não enviada')
        return
      }
      $socket.emit(WS_EVENTS.SEND_MESSAGE, {
        conversationId,
        senderId,
        content,
        type: 'TEXT',
      })
    },

    reset() {
      this.conversations = []
      this.activeConversationId = null
      this.messages = []
      this.myConversation = null
    },
  },
})
