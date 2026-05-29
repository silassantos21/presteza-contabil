<template>
  <div class="rounded-lg border border-border bg-card p-5 flex flex-col items-center text-center gap-3">
    <div :class="['w-11 h-11 rounded-xl flex items-center justify-center shrink-0', bgClass]">
      <component :is="iconComponent" :class="['w-5 h-5', iconClass]" />
    </div>
    <div>
      <p class="text-3xl font-bold leading-tight">{{ value }}</p>
      <p class="text-xs text-muted-foreground mt-0.5">{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  label: string
  value: number | string
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red'
}>()

const iconComponent = computed(
  () => (icons as Record<string, any>)[props.icon] ?? icons.Circle,
)

const bgClass = computed(() => ({
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
}[props.color]))

const iconClass = computed(() => ({
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
  red: 'text-red-600 dark:text-red-400',
}[props.color]))
</script>
