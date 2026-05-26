<template>
  <NuxtLink
    :to="to"
    :class="['rounded-lg border border-border bg-card p-5 flex items-center gap-4 hover:border-primary/50 transition-colors group']"
  >
    <div :class="['w-10 h-10 rounded-lg flex items-center justify-center shrink-0', bgClass]">
      <component :is="iconComponent" :class="['w-5 h-5', iconClass]" />
    </div>
    <div>
      <p class="font-semibold text-sm group-hover:text-primary transition-colors">{{ label }}</p>
      <p class="text-xs text-muted-foreground">{{ description }}</p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  to: string
  icon: string
  label: string
  description: string
  color: 'blue' | 'green' | 'yellow'
}>()

const iconComponent = computed(
  () => (icons as Record<string, any>)[props.icon] ?? icons.Circle,
)

const bgClass = computed(() => ({
  blue:   'bg-blue-100 dark:bg-blue-900/30',
  green:  'bg-green-100 dark:bg-green-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
}[props.color]))

const iconClass = computed(() => ({
  blue:   'text-blue-600 dark:text-blue-400',
  green:  'text-green-600 dark:text-green-400',
  yellow: 'text-yellow-600 dark:text-yellow-400',
}[props.color]))
</script>
