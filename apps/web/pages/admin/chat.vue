<template>
  <div class="flex h-full">
    <!-- ── Coluna esquerda: lista de conversas ──────────────────────────── -->
    <aside
      class="shrink-0 border-r border-border flex flex-col bg-card"
      :class="[
        'w-full sm:w-[300px]',
        mobileView === 'list' ? 'flex' : 'hidden sm:flex',
      ]"
    >
      <!-- Cabeçalho -->
      <div class="px-4 py-4 border-b border-border">
        <h2 class="font-semibold text-base">Conversas</h2>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ chatStore.conversations.length }} cliente(s)
        </p>
      </div>

      <!-- Lista -->
      <div class="flex-1 overflow-y-auto">
        <!-- Skeleton de carregamento -->
        <template v-if="chatStore.loading && chatStore.conversations.length === 0">
          <div
            v-for="i in 4"
            :key="i"
            class="flex gap-3 px-4 py-3 border-b border-border animate-pulse"
          >
            <div class="w-10 h-10 rounded-full bg-muted shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3 bg-muted rounded w-3/4" />
              <div class="h-2 bg-muted rounded w-1/2" />
            </div>
          </div>
        </template>

        <!-- Itens -->
        <button
          v-for="conv in chatStore.conversations"
          :key="conv.id"
          class="w-full flex items-start gap-3 px-4 py-3 border-b border-border text-left transition-colors hover:bg-accent"
          :class="{
            'bg-accent border-l-2 border-l-primary': chatStore.activeConversationId === conv.id,
          }"
          @click="selectConversation(conv.id)"
        >
          <!-- Avatar empresa -->
          <div
            class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0"
          >
            <span class="text-primary font-semibold text-sm">
              {{ conv.clientCompanyName?.charAt(0).toUpperCase() ?? '?' }}
            </span>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-baseline gap-1">
              <p class="text-sm font-medium truncate">{{ conv.clientCompanyName }}</p>
              <span
                v-if="conv.lastMessage"
                class="text-[10px] text-muted-foreground shrink-0"
              >
                {{ formatRelative(conv.lastMessage.createdAt) }}
              </span>
            </div>
            <p class="text-xs text-muted-foreground truncate mt-0.5">
              {{
                conv.lastMessage
                  ? conv.lastMessage.content
                  : 'Sem mensagens ainda'
              }}
            </p>
          </div>
        </button>

        <!-- Estado vazio -->
        <div
          v-if="!chatStore.loading && chatStore.conversations.length === 0"
          class="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground"
        >
          <Users class="w-8 h-8 opacity-30" />
          <p class="text-sm">Nenhuma conversa</p>
        </div>
      </div>
    </aside>

    <!-- ── Coluna direita: janela de chat ───────────────────────────────── -->
    <div
      class="flex-col flex-1 min-w-0"
      :class="mobileView === 'chat' ? 'flex' : 'hidden sm:flex'"
    >
      <!-- Sem conversa selecionada -->
      <div
        v-if="!chatStore.activeConversationId"
        class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
      >
        <MessageSquare class="w-12 h-12 opacity-20" />
        <p class="text-sm">Selecione uma conversa</p>
      </div>

      <!-- Chat ativo -->
      <template v-else>
        <!-- Topbar da conversa -->
        <div
          class="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border bg-card shrink-0"
        >
          <!-- Botão voltar (mobile only) -->
          <button
            @click="mobileView = 'list'"
            class="sm:hidden p-2 -ml-1 rounded-md hover:bg-accent transition-colors text-muted-foreground"
            aria-label="Voltar para conversas"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div
            class="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center"
          >
            <span class="text-primary font-semibold text-sm">
              {{ chatStore.activeConversation?.clientCompanyName?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="font-medium text-sm leading-tight">
              {{ chatStore.activeConversation?.clientCompanyName }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ chatStore.activeConversation?.clientResponsibleName }}
            </p>
          </div>

          <!-- Indicador de conexão + download -->
          <div class="ml-auto flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span
                class="w-2 h-2 rounded-full"
                :class="chatStore.socketConnected ? 'bg-green-500' : 'bg-muted-foreground'"
              />
              <span class="text-xs text-muted-foreground">
                {{ chatStore.socketConnected ? 'Online' : 'Reconectando…' }}
              </span>
            </div>
            <button
              @click="downloadHistory"
              :disabled="!chatStore.messages.length"
              title="Baixar histórico (.txt)"
              class="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <Download class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Mensagens -->
        <div class="flex-1 overflow-hidden">
          <ChatWindow
            :messages="chatStore.messages"
            :current-user-id="authStore.user?.id ?? ''"
            :loading="chatStore.loading"
          />
        </div>

        <!-- Input -->
        <MessageInput
          :disabled="!chatStore.socketConnected"
          @send="onSend"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageSquare, Users, Download, ArrowLeft } from 'lucide-vue-next'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const authStore = useAuthStore()
const chatStore = useChatStore()
const route = useRoute()
const mobileView = ref<'list' | 'chat'>('list')

// ── Inicialização ──────────────────────────────────────────────────────────
onMounted(async () => {
  chatStore.connect()
  await chatStore.fetchConversations()
  const cid = route.query.conversationId
  if (cid && typeof cid === 'string') {
    await selectConversation(cid)
  }
})

onUnmounted(() => {
  // Não desconecta ao sair da página (socket global); apenas limpa a conversa ativa
  chatStore.activeConversationId = null
})

// ── Ações ──────────────────────────────────────────────────────────────────
async function selectConversation(id: string) {
  mobileView.value = 'chat'
  if (chatStore.activeConversationId === id) return
  await chatStore.openConversation(id)
}

function onSend(content: string) {
  if (!chatStore.activeConversationId || !authStore.user?.id) return
  chatStore.sendMessage(
    chatStore.activeConversationId,
    content,
    authStore.user.id,
  )
}

// ── Utilitários ────────────────────────────────────────────────────────────
function formatRelative(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'ontem'
  return format(d, 'dd/MM', { locale: ptBR })
}

function downloadHistory() {
  const conv = chatStore.activeConversation
  if (!conv || !chatStore.messages.length) return

  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  let txt = `Presteza Contábil — Histórico de Conversa\n`
  txt += `Cliente: ${conv.clientCompanyName ?? ''}`
  if (conv.clientResponsibleName) txt += ` (${conv.clientResponsibleName})`
  txt += `\nExportado em: ${dateStr} às ${timeStr}\n`
  txt += `${'='.repeat(50)}\n\n`

  for (const msg of chatStore.messages) {
    const d = new Date(msg.createdAt)
    const msgDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const msgTime = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    const sender = (msg as any).sender?.name ?? 'Desconhecido'
    txt += `[${msgTime} ${msgDate}] ${sender}: ${msg.content}\n`
  }

  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const slug = (conv.clientCompanyName ?? 'conversa').replace(/\s+/g, '-').toLowerCase()
  a.download = `chat-${slug}-${now.toISOString().split('T')[0]}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
