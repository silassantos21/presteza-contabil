<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Olá, {{ firstName }} 👋</h1>
      <p class="text-muted-foreground text-sm mt-1">Bem-vindo ao seu portal</p>
    </div>

    <!-- Cards de acesso rápido -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <QuickAccessCard
        to="/portal/chat"
        icon="MessageSquare"
        label="Mensagens"
        description="Fale com seu contador"
        color="blue"
      />
      <QuickAccessCard
        to="/portal/documentos"
        icon="FileText"
        label="Documentos"
        description="Acesse seus arquivos"
        color="green"
      />
      <QuickAccessCard
        to="/portal/processos"
        icon="FolderKanban"
        label="Processos"
        description="Acompanhe o andamento"
        color="yellow"
      />
    </div>

    <!-- Processos -->
    <div class="rounded-lg border border-border bg-card p-5">
      <h2 class="font-semibold mb-4">Seus processos</h2>
      <div v-if="loading" class="text-sm text-muted-foreground">Carregando...</div>
      <div v-else class="space-y-3">
        <ProcessRow v-for="p in processes" :key="p.id" :process="p" />
        <p v-if="!processes.length" class="text-sm text-muted-foreground">Nenhum processo encontrado.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

const firstName = computed(() => authStore.user?.name?.split(' ')[0] ?? '')
const loading = ref(true)
const processes = ref<any[]>([])

onMounted(async () => {
  try {
    const all = await api.get<any[]>('/processes/my-processes')
    processes.value = all.slice(0, 5)
  } finally {
    loading.value = false
  }
})
</script>
