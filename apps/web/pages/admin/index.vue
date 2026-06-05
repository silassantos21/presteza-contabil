<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Bom dia, {{ firstName }} 👋</h1>
      <p class="text-muted-foreground text-sm mt-1">Aqui está o resumo do escritório</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Clientes ativos" :value="stats.activeClients" icon="Users" color="blue" />
      <KpiCard label="Em andamento" :value="stats.inProgress" icon="FolderKanban" color="yellow" />
      <KpiCard label="Pendentes" :value="stats.pending" icon="Clock" color="red" />
      <KpiCard label="Concluídos" :value="stats.doneThisMonth" icon="CheckCircle" color="green" />
    </div>

    <!-- Processos recentes + Atividade -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Processos recentes -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="font-semibold mb-4">Processos recentes</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-12 rounded-md bg-muted animate-pulse" />
        </div>
        <div v-else class="space-y-3">
          <ProcessRow v-for="p in recentProcesses" :key="p.id" :process="p" />
          <p v-if="!recentProcesses.length" class="text-sm text-muted-foreground">
            Nenhum processo encontrado.
          </p>
        </div>
      </div>

      <!-- Atividade recente -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="font-semibold mb-4">Atividade recente</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 5" :key="i" class="h-10 rounded-md bg-muted animate-pulse" />
        </div>
        <div v-else class="space-y-1">
          <div
            v-for="item in activity"
            :key="item.id + item.kind"
            class="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div
              class="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              :class="item.kind === 'process' ? 'bg-blue-500/10' : 'bg-emerald-500/10'"
            >
              <FolderKanban v-if="item.kind === 'process'" class="w-3.5 h-3.5 text-blue-500" />
              <FileText v-else class="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium leading-tight truncate">{{ item.title }}</p>
              <p class="text-xs text-muted-foreground truncate mt-0.5">{{ item.subtitle }}</p>
            </div>
            <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
              {{ formatTime(item.date) }}
            </span>
          </div>
          <p v-if="!activity.length" class="text-sm text-muted-foreground px-2">
            Nenhuma atividade recente.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderKanban, FileText } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const firstName = computed(() => authStore.user?.name?.split(' ')[0] ?? '')

const loading = ref(true)
const recentProcesses = ref<any[]>([])
const activity = ref<{ id: string; kind: 'process' | 'document'; title: string; subtitle: string; date: string }[]>([])

const stats = reactive({
  activeClients: 0,
  inProgress: 0,
  pending: 0,
  doneThisMonth: 0,
})

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'agora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min atrás`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atrás`
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  try {
    const [processes, clients, recentActivity] = await Promise.all([
      api.get<any[]>('/processes'),
      api.get<any[]>('/clients'),
      api.get<any[]>('/users/activity/recent?limit=10').catch(() => []),
    ])

    recentProcesses.value = processes.slice(0, 5)
    stats.inProgress = processes.filter((p) => p.status === 'IN_PROGRESS').length
    stats.pending = processes.filter((p) => p.status === 'PENDING').length
    stats.doneThisMonth = processes.filter((p) => p.status === 'DONE').length
    stats.activeClients = clients.filter((c) => c.status === 'ACTIVE').length
    activity.value = recentActivity
  } finally {
    loading.value = false
  }
})
</script>
