<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Bom dia, {{ firstName }} 👋</h1>
      <p class="text-muted-foreground text-sm mt-1">Aqui está o resumo do escritório</p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KpiCard label="Clientes ativos" :value="stats.activeClients" icon="Users" color="blue" />
      <KpiCard label="Processos em andamento" :value="stats.inProgress" icon="FolderKanban" color="yellow" />
      <KpiCard label="Pendentes" :value="stats.pending" icon="Clock" color="red" />
      <KpiCard label="Concluídos este mês" :value="stats.doneThisMonth" icon="CheckCircle" color="green" />
    </div>

    <!-- Processos recentes + Atividade -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Processos recentes -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="font-semibold mb-4">Processos recentes</h2>
        <div v-if="loading" class="text-sm text-muted-foreground">Carregando...</div>
        <div v-else class="space-y-3">
          <ProcessRow
            v-for="p in recentProcesses"
            :key="p.id"
            :process="p"
          />
          <p v-if="!recentProcesses.length" class="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
        </div>
      </div>

      <!-- Atividade recente -->
      <div class="rounded-lg border border-border bg-card p-5">
        <h2 class="font-semibold mb-4">Atividade recente</h2>
        <div class="space-y-3 text-sm text-muted-foreground">
          <p class="text-foreground text-sm">Dados de atividade em breve...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const firstName = computed(() => authStore.user?.name?.split(' ')[0] ?? '')

const loading = ref(true)
const recentProcesses = ref<any[]>([])
const stats = reactive({
  activeClients: 0,
  inProgress: 0,
  pending: 0,
  doneThisMonth: 0,
})

onMounted(async () => {
  try {
    const processes = await api.get<any[]>('/processes')
    recentProcesses.value = processes.slice(0, 5)
    stats.inProgress = processes.filter((p) => p.status === 'IN_PROGRESS').length
    stats.pending = processes.filter((p) => p.status === 'PENDING').length
    stats.doneThisMonth = processes.filter((p) => p.status === 'DONE').length

    const clients = await api.get<any[]>('/clients')
    stats.activeClients = clients.filter((c) => c.status === 'ACTIVE').length
  } finally {
    loading.value = false
  }
})
</script>
