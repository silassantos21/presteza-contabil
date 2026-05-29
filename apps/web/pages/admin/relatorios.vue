<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Relatórios</h1>
      <p class="text-muted-foreground text-sm mt-1">Gere relatórios em PDF para processos e clientes</p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Relatório de Processos -->
      <div class="rounded-xl border border-border bg-card p-6 space-y-5">
        <div class="flex items-start gap-4">
          <div class="p-2.5 rounded-lg bg-blue-500/10 shrink-0">
            <ClipboardList class="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 class="font-semibold">Relatório de Processos</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Todos os processos agrupados por status — Pendente, Em andamento, Concluído e Cancelado.
            </p>
          </div>
        </div>
        <button
          @click="downloadProcesses"
          :disabled="loadingProcesses"
          class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]"
        >
          <Loader2 v-if="loadingProcesses" class="w-4 h-4 animate-spin" />
          <FileDown v-else class="w-4 h-4" />
          {{ loadingProcesses ? 'Gerando PDF...' : 'Gerar PDF' }}
        </button>
      </div>

      <!-- Extrato por Cliente -->
      <div class="rounded-xl border border-border bg-card p-6 space-y-5">
        <div class="flex items-start gap-4">
          <div class="p-2.5 rounded-lg bg-emerald-500/10 shrink-0">
            <Users class="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 class="font-semibold">Extrato por Cliente</h2>
            <p class="text-sm text-muted-foreground mt-1">
              Documentos e processos de um cliente específico em PDF.
            </p>
          </div>
        </div>

        <!-- Busca -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            v-model="clientSearch"
            placeholder="Buscar cliente..."
            class="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
          />
        </div>

        <!-- Lista de clientes -->
        <div v-if="loadingClients" class="py-4 text-center text-sm text-muted-foreground">
          Carregando clientes...
        </div>
        <div v-else-if="!filteredClients.length" class="py-4 text-center text-sm text-muted-foreground">
          Nenhum cliente encontrado.
        </div>
        <div v-else class="space-y-1 max-h-52 overflow-y-auto -mx-1 px-1">
          <div
            v-for="client in filteredClients"
            :key="client.id"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ client.companyName }}</p>
              <p class="text-xs text-muted-foreground">{{ client.responsibleName }}</p>
            </div>
            <button
              @click="downloadClient(client)"
              :disabled="downloadingId === client.id"
              title="Gerar extrato em PDF"
              class="shrink-0 ml-3 p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary disabled:opacity-40 transition-colors"
            >
              <Loader2 v-if="downloadingId === client.id" class="w-4 h-4 animate-spin" />
              <FileDown v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardList, Users, FileDown, Search, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const api = useApi()

const loadingClients = ref(true)
const clients = ref<any[]>([])
const clientSearch = ref('')
const loadingProcesses = ref(false)
const downloadingId = ref<string | null>(null)

const filteredClients = computed(() => {
  const q = clientSearch.value.toLowerCase()
  if (!q) return clients.value
  return clients.value.filter(
    (c) =>
      c.companyName.toLowerCase().includes(q) ||
      (c.responsibleName || '').toLowerCase().includes(q),
  )
})

onMounted(async () => {
  clients.value = await api.get<any[]>('/clients')
  loadingClients.value = false
})

async function downloadProcesses() {
  loadingProcesses.value = true
  try {
    await api.downloadPdf('/reports/processes/pdf', 'relatorio-processos.pdf')
  } finally {
    loadingProcesses.value = false
  }
}

async function downloadClient(client: any) {
  downloadingId.value = client.id
  try {
    const filename = `extrato-${client.companyName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    await api.downloadPdf(`/reports/client/${client.id}/pdf`, filename)
  } finally {
    downloadingId.value = null
  }
}
</script>
