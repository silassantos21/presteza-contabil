<template>
  <div class="p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Meus processos</h1>
      <p class="text-muted-foreground text-sm mt-1">Acompanhe o andamento dos seus processos contábeis</p>
    </div>

    <!-- Estado de carregamento -->
    <div v-if="loading" class="text-sm text-muted-foreground">Carregando processos...</div>

    <!-- Vazio -->
    <div v-else-if="!processes.length" class="rounded-lg border border-border bg-card p-10 text-center">
      <FolderOpen class="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p class="text-sm font-medium">Nenhum processo encontrado</p>
      <p class="text-xs text-muted-foreground mt-1">Os processos abertos pelo escritório aparecerão aqui.</p>
    </div>

    <!-- Agrupado por status -->
    <div v-else class="space-y-6">
      <div v-for="group in statusGroups" :key="group.status">
        <div v-if="group.items.length">
          <div class="flex items-center gap-2 mb-3">
            <span :class="group.dot" class="w-2.5 h-2.5 rounded-full" />
            <h2 class="text-sm font-semibold">{{ group.label }}</h2>
            <span class="text-xs text-muted-foreground">{{ group.items.length }}</span>
          </div>
          <div class="space-y-3">
            <div
              v-for="proc in group.items"
              :key="proc.id"
              class="rounded-lg border border-border bg-card p-4 flex items-start gap-4"
            >
              <!-- Ícone de tipo -->
              <div class="p-2 bg-muted rounded-md shrink-0 mt-0.5">
                <Briefcase class="w-4 h-4 text-muted-foreground" />
              </div>

              <!-- Informações -->
              <div class="flex-1 min-w-0 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <p class="text-sm font-medium">{{ proc.title }}</p>
                  <span class="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{{ proc.type }}</span>
                </div>
                <p v-if="proc.description" class="text-xs text-muted-foreground line-clamp-2">{{ proc.description }}</p>
                <div class="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span>Criado em {{ formatDate(proc.createdAt) }}</span>
                  <span v-if="proc.dueDate" :class="isOverdue(proc.dueDate) && proc.status !== 'DONE' ? 'text-destructive font-medium' : ''">
                    Vencimento: {{ formatDate(proc.dueDate) }}
                  </span>
                  <span v-if="proc.assignedTo">
                    Responsável: {{ proc.assignedTo.name }}
                  </span>
                </div>
              </div>

              <!-- Badge status -->
              <span :class="statusClass(proc.status)" class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
                {{ statusLabel(proc.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderOpen, Briefcase } from 'lucide-vue-next'

definePageMeta({ layout: 'portal', middleware: 'auth' })

const api = useApi()
const loading = ref(true)
const processes = ref<any[]>([])

const statusGroups = computed(() => [
  { status: 'IN_PROGRESS', label: 'Em andamento', dot: 'bg-blue-500', items: processes.value.filter((p) => p.status === 'IN_PROGRESS') },
  { status: 'PENDING', label: 'Pendente', dot: 'bg-yellow-400', items: processes.value.filter((p) => p.status === 'PENDING') },
  { status: 'DONE', label: 'Concluído', dot: 'bg-green-500', items: processes.value.filter((p) => p.status === 'DONE') },
  { status: 'CANCELLED', label: 'Cancelado', dot: 'bg-muted-foreground', items: processes.value.filter((p) => p.status === 'CANCELLED') },
])

onMounted(async () => {
  try {
    processes.value = await api.get<any[]>('/processes/my-processes')
  } finally {
    loading.value = false
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date()
}

function statusLabel(status: string) {
  return { PENDING: 'Pendente', IN_PROGRESS: 'Em andamento', DONE: 'Concluído', CANCELLED: 'Cancelado' }[status] ?? status
}

function statusClass(status: string) {
  return {
    PENDING: 'bg-amber-500 text-white',
    IN_PROGRESS: 'bg-blue-500 text-white',
    DONE: 'bg-green-500 text-white',
    CANCELLED: 'bg-slate-400 text-white',
  }[status] ?? 'bg-slate-400 text-white'
}
</script>
