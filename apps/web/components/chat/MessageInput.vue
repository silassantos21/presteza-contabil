<template>
  <div class="flex items-end gap-2 px-4 py-3 border-t border-border bg-card">
    <textarea
      ref="textareaRef"
      v-model="text"
      :placeholder="placeholder"
      :disabled="disabled"
      rows="1"
      class="flex-1 resize-none bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-sm outline-none
             focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all
             placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed
             max-h-32 overflow-y-auto"
      @keydown.enter.exact.prevent="submit"
      @keydown.shift.enter.exact="allowNewline"
      @input="autoResize"
    />
    <button
      :disabled="!text.trim() || disabled"
      class="shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center
             hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      @click="submit"
    >
      <SendHorizonal class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { SendHorizonal } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: 'Digite aqui...',
    disabled: false,
  },
)

const emit = defineEmits<{
  send: [content: string]
}>()

const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function submit() {
  const content = text.value.trim()
  if (!content || props.disabled) return
  emit('send', content)
  text.value = ''
  nextTick(() => autoResize())
}

// Shift+Enter já cria nova linha naturalmente — só impedimos o default do Enter simples
function allowNewline(e: KeyboardEvent) {
  // Não faz nada; o textarea insere a nova linha normalmente
}

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}
</script>
