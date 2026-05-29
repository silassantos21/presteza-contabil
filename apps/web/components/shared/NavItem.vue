<template>
  <NuxtLink
    :to="to"
    :title="collapsed ? label : undefined"
    :class="[
      'flex items-center rounded-lg text-sm transition-all duration-200 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
      isActive
        ? 'bg-primary text-primary-foreground font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
    ]"
  >
    <component :is="iconComponent" class="w-4 h-4 shrink-0" />
    <span v-if="!collapsed" class="truncate">{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  to: string
  icon: string
  label: string
  exact?: boolean
  collapsed?: boolean
}>()

const route = useRoute()

const isActive = computed(() =>
  props.exact ? route.path === props.to : route.path.startsWith(props.to),
)

const iconComponent = computed(
  () => (icons as Record<string, any>)[props.icon] ?? icons.Circle,
)
</script>
