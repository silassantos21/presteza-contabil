<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Documentos</h1>
      <button
        @click="openUploadModal"
        class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]"
      >
        <Upload class="w-4 h-4" />
        <span class="hidden sm:inline">Enviar documento</span>
      </button>
    </div>

    <!-- Filtro por cliente -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="relative flex-1 sm:max-w-xs">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          placeholder="Buscar por nome..."
          class="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
        />
      </div>
      <select
        v-model="selectedClientId"
        @change="fetchDocuments"
        class="w-full sm:w-auto text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
      >
        <option value="">Todos os clientes</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
      </select>
    </div>

    <!-- Estado vazio / loading -->
    <div v-if="loading" class="p-8 text-center text-sm text-muted-foreground">Carregando documentos...</div>
    <div v-else-if="!filteredDocuments.length" class="p-8 text-center text-sm text-muted-foreground">Nenhum documento encontrado.</div>

    <template v-else>
      <!-- Cards mobile -->
      <div class="block sm:hidden space-y-2">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="rounded-lg border border-border bg-card overflow-hidden"
        >
          <button
            class="w-full flex items-center gap-3 px-4 py-3 text-left"
            @click="expandedDocId = expandedDocId === doc.id ? null : doc.id"
          >
            <FileText class="w-5 h-5 text-muted-foreground shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ doc.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatSize(doc.fileSize) }}</p>
            </div>
            <span :class="typeClass(doc.type)" class="text-xs px-2 py-0.5 rounded-full font-medium shrink-0">{{ doc.type }}</span>
            <ChevronDown
              class="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200"
              :class="expandedDocId === doc.id ? 'rotate-180' : ''"
            />
          </button>
          <div v-if="expandedDocId === doc.id" class="px-4 pb-4 border-t border-border pt-3 space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-xs text-muted-foreground">Enviado por</p>
                <p class="font-medium">{{ doc.uploadedBy?.name ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Data</p>
                <p class="font-medium">{{ formatDate(doc.createdAt) }}</p>
              </div>
            </div>
            <div class="flex gap-2 justify-end border-t border-border pt-3">
              <button
                @click="downloadDoc(doc)"
                :disabled="downloading === doc.id"
                title="Download"
                class="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <Download class="w-4 h-4" />
                Download
              </button>
              <button
                @click="confirmDelete(doc)"
                title="Excluir"
                class="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-destructive/10 transition-colors text-sm text-muted-foreground hover:text-destructive"
              >
                <Trash2 class="w-4 h-4" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabela desktop -->
      <div class="hidden sm:block rounded-lg border border-border bg-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b border-border bg-muted/40">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th class="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th class="text-left px-4 py-3 font-medium text-muted-foreground">Tamanho</th>
                <th class="text-left px-4 py-3 font-medium text-muted-foreground">Enviado por</th>
                <th class="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="doc in filteredDocuments" :key="doc.id" class="hover:bg-muted/30 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <FileText class="w-4 h-4 text-muted-foreground shrink-0" />
                    <span class="truncate max-w-[220px]" :title="doc.name">{{ doc.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span :class="typeClass(doc.type)" class="text-xs px-2 py-0.5 rounded-full font-medium">{{ doc.type }}</span>
                </td>
                <td class="px-4 py-3 text-muted-foreground">{{ formatSize(doc.fileSize) }}</td>
                <td class="px-4 py-3 text-muted-foreground">{{ doc.uploadedBy?.name ?? '—' }}</td>
                <td class="px-4 py-3 text-muted-foreground">{{ formatDate(doc.createdAt) }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2 justify-end">
                    <button @click="downloadDoc(doc)" :disabled="downloading === doc.id" title="Download" class="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50">
                      <Download class="w-4 h-4" />
                    </button>
                    <button @click="confirmDelete(doc)" title="Excluir" class="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Modal Upload -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-5 mx-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">Enviar documento</h2>
            <button @click="closeUploadModal" class="text-muted-foreground hover:text-foreground">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Seleção de cliente -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Cliente</label>
            <select
              v-model="uploadForm.clientId"
              class="w-full text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>Selecione o cliente</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
            </select>
          </div>

          <!-- Tipo -->
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Tipo</label>
            <select
              v-model="uploadForm.type"
              class="w-full text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option v-for="t in docTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <!-- Drop zone -->
          <div
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
            :class="[
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30',
            ]"
          >
            <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
            <div v-if="uploadForm.file">
              <FileText class="w-8 h-8 text-primary mx-auto mb-2" />
              <p class="text-sm font-medium truncate">{{ uploadForm.file.name }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ formatSize(uploadForm.file.size) }}</p>
            </div>
            <div v-else>
              <Upload class="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">Arraste um arquivo ou <span class="text-primary font-medium">clique para selecionar</span></p>
              <p class="text-xs text-muted-foreground mt-1">Máximo 20 MB</p>
            </div>
          </div>

          <p v-if="uploadError" class="text-sm text-destructive">{{ uploadError }}</p>

          <div class="flex gap-3 justify-end">
            <button
              @click="closeUploadModal"
              class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="submitUpload"
              :disabled="!uploadForm.file || !uploadForm.clientId || uploading"
              class="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ uploading ? 'Enviando...' : 'Enviar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmar Delete -->
    <Teleport to="body">
      <div v-if="docToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
          <h2 class="text-lg font-semibold">Excluir documento</h2>
          <p class="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span class="font-medium text-foreground">{{ docToDelete.name }}</span>? Esta ação não pode ser desfeita.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              @click="docToDelete = null"
              class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="deleteDoc"
              :disabled="deleting"
              class="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Upload, Search, FileText, Download, Trash2, X, ChevronDown } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const api = useApi()

const docTypes = ['NFSE', 'NFE', 'BOLETO', 'CONTRATO', 'GUIA', 'OUTROS']

const loading = ref(true)
const documents = ref<any[]>([])
const clients = ref<any[]>([])
const selectedClientId = ref('')
const searchQuery = ref('')
const downloading = ref<string | null>(null)
const deleting = ref(false)
const docToDelete = ref<any>(null)
const expandedDocId = ref<string | null>(null)

const showUploadModal = ref(false)
const dragOver = ref(false)
const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const uploadForm = reactive({
  clientId: '',
  type: 'OUTROS',
  file: null as File | null,
})

const filteredDocuments = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return documents.value.filter((d) => !q || d.name.toLowerCase().includes(q))
})

async function fetchDocuments() {
  loading.value = true
  try {
    if (selectedClientId.value) {
      documents.value = await api.get<any[]>(`/documents/client/${selectedClientId.value}`)
    } else {
      const allDocs: any[] = []
      for (const client of clients.value) {
        const docs = await api.get<any[]>(`/documents/client/${client.id}`)
        allDocs.push(...docs.map((d) => ({ ...d, clientName: client.companyName })))
      }
      documents.value = allDocs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  clients.value = await api.get<any[]>('/clients')
  await fetchDocuments()
})

function openUploadModal() {
  uploadForm.clientId = selectedClientId.value
  uploadForm.type = 'OUTROS'
  uploadForm.file = null
  uploadError.value = ''
  showUploadModal.value = true
}

function closeUploadModal() {
  showUploadModal.value = false
  dragOver.value = false
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) uploadForm.file = file
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadForm.file = file
}

async function submitUpload() {
  if (!uploadForm.file || !uploadForm.clientId) return
  uploading.value = true
  uploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', uploadForm.file)
    fd.append('clientId', uploadForm.clientId)
    fd.append('type', uploadForm.type)
    const doc = await api.upload<any>('/documents/upload', fd)
    const client = clients.value.find((c) => c.id === doc.clientId)
    documents.value.unshift({ ...doc, clientName: client?.companyName })
    closeUploadModal()
  } catch (err: any) {
    uploadError.value = err.message
  } finally {
    uploading.value = false
  }
}

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

function confirmDelete(doc: any) {
  docToDelete.value = doc
}

async function deleteDoc() {
  if (!docToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/documents/${docToDelete.value.id}`)
    documents.value = documents.value.filter((d) => d.id !== docToDelete.value.id)
    docToDelete.value = null
  } finally {
    deleting.value = false
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
