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
  PENDING:     { label: 'Pendente',     class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  IN_PROGRESS: { label: 'Em andamento', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  DONE:        { label: 'Concluído',    class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  CANCELLED:   { label: 'Cancelado',   class: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

const statusLabel = computed(() => statusMap[props.process.status]?.label ?? props.process.status)
const statusClass  = computed(() => statusMap[props.process.status]?.class ?? '')

function formatDate(d: string) {
  return format(new Date(d), "dd/MM/yyyy", { locale: ptBR })
}
</script>
