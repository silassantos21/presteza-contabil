<template>
  <div class="flex flex-col h-full">
    <!-- Cabeçalho da página -->
    <div class="px-4 py-3 sm:px-6 sm:py-4 border-b border-border bg-card shrink-0 flex items-center justify-between">
      <div>
        <h1 class="font-semibold text-base">Mensagens</h1>
        <p class="text-xs text-muted-foreground mt-0.5">
          Fale diretamente com nossa equipe
        </p>
      </div>

      <!-- Indicador de conexão -->
      <div class="flex items-center gap-1.5">
        <span
          class="w-2 h-2 rounded-full"
          :class="chatStore.socketConnected ? 'bg-green-500' : 'bg-muted-foreground'"
        />
        <span class="text-xs text-muted-foreground">
          {{ chatStore.socketConnected ? 'Online' : 'Reconectando…' }}
        </span>
      </div>
    </div>

    <!-- Estado: carregando conversa -->
    <div
      v-if="chatStore.loading && !chatStore.myConversation"
      class="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground"
    >
      <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-sm">Carregando conversa…</p>
    </div>

    <!-- Estado: erro / sem conversa -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center flex-1 gap-3 text-muted-foreground"
    >
      <AlertCircle class="w-10 h-10 opacity-30" />
      <p class="text-sm">Não foi possível carregar a conversa.</p>
      <button
        class="text-xs text-primary underline"
        @click="init"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Chat -->
    <template v-else-if="chatStore.myConversation">
      <div class="flex-1 overflow-hidden">
        <ChatWindow
          :messages="chatStore.messages"
          :current-user-id="authStore.user?.id ?? ''"
          :loading="chatStore.loading"
        />
      </div>

      <MessageInput
        :disabled="!chatStore.socketConnected"
        placeholder="Digite sua mensagem… (Enter para enviar)"
        @send="onSend"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'portal', middleware: 'auth' })

const authStore = useAuthStore()
const chatStore = useChatStore()
const error = ref(false)

async function init() {
  error.value = false
  try {
    const conv = await chatStore.fetchMyConversation()
    if (conv?.id) {
      await chatStore.openConversation(conv.id)
    }
  } catch (e) {
    console.error('Erro ao inicializar chat:', e)
    error.value = true
  }
}

onMounted(init)

onUnmounted(() => {
  chatStore.activeConversationId = null
})

function onSend(content: string) {
  const convId = chatStore.myConversation?.id
  if (!convId || !authStore.user?.id) return
  chatStore.sendMessage(convId, content, authStore.user.id)
}
</script>
