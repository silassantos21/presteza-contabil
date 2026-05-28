<template>
  <div ref="containerRef" class="flex flex-col gap-2 p-4 overflow-y-auto h-full">
    <!-- Estado vazio -->
    <div
      v-if="messages.length === 0 && !loading"
      class="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground"
    >
      <MessageSquare class="w-10 h-10 opacity-30" />
      <p class="text-sm">Nenhuma mensagem ainda. Diga olá! 👋</p>
    </div>

    <!-- Skeleton de carregamento -->
    <template v-if="loading">
      <div v-for="i in 4" :key="i" class="flex gap-2" :class="i % 2 === 0 ? 'justify-end' : ''">
        <div
          class="rounded-2xl px-4 py-2 animate-pulse bg-muted"
          :style="{ width: `${120 + Math.random() * 120}px`, height: '36px' }"
        />
      </div>
    </template>

    <!-- Mensagens -->
    <template v-else>
      <div
        v-for="(msg, index) in messages"
        :key="msg.id"
        class="flex flex-col w-full"
        :class="isMine(msg) ? 'items-end' : 'items-start'"
      >
        <!-- Nome do remetente (primeira mensagem de um bloco) -->
        <span
          v-if="showSenderName(index)"
          class="text-[11px] text-muted-foreground mb-1 px-1"
        >
          {{ msg.senderName }}
        </span>

        <div class="flex items-end gap-1.5 w-full" :class="isMine(msg) ? 'flex-row-reverse' : 'flex-row'">
          <!-- Bolha de mensagem -->
          <div
            class="max-w-[70%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm"
            :class="
              isMine(msg)
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            "
          >
            <!-- Conteúdo de texto -->
            <p v-if="msg.type === 'TEXT'" class="whitespace-pre-wrap break-words">
              {{ msg.content }}
            </p>

            <!-- Mensagem de sistema -->
            <p
              v-else-if="msg.type === 'SYSTEM'"
              class="text-xs italic opacity-70 text-center"
            >
              {{ msg.content }}
            </p>
          </div>
        </div>

        <!-- Timestamp -->
        <span class="text-[10px] text-muted-foreground mt-1 px-1">
          {{ formatTime(msg.createdAt) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MessageSquare } from 'lucide-vue-next'
import type { Message } from '@presteza/types'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps<{
  messages: Message[]
  currentUserId: string
  loading?: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)

// Rola para o final sempre que as mensagens mudam
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  },
  { immediate: true },
)

function isMine(msg: Message) {
  return msg.senderId === props.currentUserId
}

/** Exibe o nome apenas quando o remetente muda em relação à mensagem anterior */
function showSenderName(index: number): boolean {
  if (index === 0) return true
  return props.messages[index].senderId !== props.messages[index - 1].senderId
}

function formatTime(date: Date | string): string {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return `ontem ${format(d, 'HH:mm')}`
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}
</script>
