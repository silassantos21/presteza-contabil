<template>
  <NuxtLink
    :to="to"
    :class="[
      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
      isActive
        ? 'bg-primary text-primary-foreground font-medium'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent',
    ]"
  >
    <component :is="iconComponent" class="w-4 h-4 shrink-0" />
    {{ label }}
  </NuxtLink>
</template>

<script setup lang="ts">
import * as icons from 'lucide-vue-next'

const props = defineProps<{
  to: string
  icon: string
  label: string
  exact?: boolean
}>()

const route = useRoute()

const isActive = computed(() =>
  props.exact ? route.path === props.to : route.path.startsWith(props.to),
)

const iconComponent = computed(
  () => (icons as Record<string, any>)[props.icon] ?? icons.Circle,
)
</script>
