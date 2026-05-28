<template>
  <div class="flex items-center justify-between py-2 border-b border-border last:border-0">
    <div class="flex items-center gap-3">
      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusClass]">
        {{ statusLabel }}
      </span>
      <span class="text-sm font-medium">{{ process.title }}</span>
      <span class="text-xs text-muted-foreground hidden md:block">
        {{ process.client?.companyName }}
      </span>
    </div>
    <span v-if="process.dueDate" class="text-xs text-muted-foreground shrink-0">
      {{ formatDate(process.dueDate) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const props = defineProps<{ process: any }>()

const statusMap: Record<string, { label: string; class: string }> = {
  PENDING:     { label: 'Pendente',     class: 'bg-amber-500 text-white' },
  IN_PROGRESS: { label: 'Em andamento', class: 'bg-blue-500 text-white' },
  DONE:        { label: 'Concluído',    class: 'bg-green-500 text-white' },
  CANCELLED:   { label: 'Cancelado',    class: 'bg-slate-400 text-white' },
}

const statusLabel = computed(() => statusMap[props.process.status]?.label ?? props.process.status)
const statusClass  = computed(() => statusMap[props.process.status]?.class ?? '')

function formatDate(d: string) {
  return format(new Date(d), "dd/MM/yyyy", { locale: ptBR })
}
</script>
