<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Meus documentos</h1>
      <p class="text-muted-foreground text-sm mt-1">Acesse os documentos enviados pelo escritório</p>
    </div>

    <!-- Busca -->
    <div class="relative w-full sm:max-w-xs">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        v-model="searchQuery"
        placeholder="Buscar por nome..."
        class="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
      />
    </div>

    <!-- Estado de carregamento -->
    <div v-if="loading" class="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
      Carregando documentos...
    </div>

    <!-- Vazio -->
    <div v-else-if="!filteredDocuments.length" class="rounded-lg border border-border bg-card p-8 text-center">
      <FileText class="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p class="text-sm font-medium">Nenhum documento encontrado</p>
      <p class="text-xs text-muted-foreground mt-1">Os documentos enviados pelo escritório aparecerão aqui.</p>
    </div>

    <!-- Lista de documentos -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="doc in filteredDocuments"
        :key="doc.id"
        class="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <div class="p-2 bg-muted rounded-md shrink-0">
              <FileText class="w-4 h-4 text-muted-foreground" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium truncate" :title="doc.name">{{ doc.name }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ formatSize(doc.fileSize) }}</p>
            </div>
          </div>
          <span :class="typeClass(doc.type)" class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0">
            {{ doc.type }}
          </span>
        </div>

        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>{{ formatDate(doc.createdAt) }}</span>
          <span>Enviado por {{ doc.uploadedBy?.name ?? 'escritório' }}</span>
        </div>

        <button
          @click="downloadDoc(doc)"
          :disabled="downloading === doc.id"
          class="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm hover:bg-muted transition-colors disabled:opacity-50 min-h-[44px]"
        >
          <Download class="w-4 h-4" />
          {{ downloading === doc.id ? 'Preparando...' : 'Download' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, FileText, Download } from 'lucide-vue-next'

definePageMeta({ layout: 'portal', middleware: 'auth' })

const api = useApi()
const loading = ref(true)
const documents = ref<any[]>([])
const searchQuery = ref('')
const downloading = ref<string | null>(null)

const filteredDocuments = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return documents.value.filter((d) => !q || d.name.toLowerCase().includes(q))
})

onMounted(async () => {
  try {
    documents.value = await api.get<any[]>('/documents/my-documents')
  } finally {
    loading.value = false
  }
})

async function downloadDoc(doc: any) {
  downloading.value = doc.id
  try {
    const { url } = await api.get<{ url: string }>(`/documents/${doc.id}/signed-url`)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    a.click()
  } finally {
    downloading.value = null
  }
}

function formatSize(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function typeClass(type: string) {
  const map: Record<string, string> = {
    NFSE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    NFE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    BOLETO: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONTRATO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    GUIA: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    OUTROS: 'bg-muted text-muted-foreground',
  }
  return map[type] ?? map.OUTROS
}
</script>
