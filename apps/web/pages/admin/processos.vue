<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Processos</h1>
        <p class="text-muted-foreground text-sm mt-1">Acompanhe e gerencie os processos contábeis</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <Plus class="w-4 h-4" />
        Novo processo
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          placeholder="Buscar por título..."
          class="pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring w-52"
        />
      </div>
      <select
        v-model="filterClientId"
        class="text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos os clientes</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
      </select>
      <!-- Task 5: filtro por tipo -->
      <select
        v-model="filterType"
        class="text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Todos os tipos</option>
        <option v-for="t in processTypes" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Kanban -->
    <div v-if="loading" class="text-sm text-muted-foreground">Carregando processos...</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div
        v-for="col in columns"
        :key="col.status"
        class="flex flex-col gap-3"
      >
        <!-- Header da coluna -->
        <div class="flex items-center gap-2 px-1">
          <span :class="col.dot" class="w-2.5 h-2.5 rounded-full shrink-0" />
          <span class="text-sm font-semibold">{{ col.label }}</span>
          <span class="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {{ columnItems(col.status).length }}
          </span>
        </div>

        <!-- Zona de drop (Task 4) -->
        <div
          class="flex flex-col gap-2 min-h-[80px] rounded-lg p-1 transition-colors"
          :class="dragTarget === col.status ? 'bg-primary/8 ring-2 ring-primary/30' : ''"
          @dragover.prevent="dragTarget = col.status"
          @dragleave="onDragLeave(col.status, $event)"
          @drop.prevent="onDrop(col.status)"
        >
          <!-- Cards -->
          <div
            v-for="proc in columnItems(col.status)"
            :key="proc.id"
            draggable="true"
            @dragstart="onDragStart(proc)"
            @dragend="dragTarget = null"
            class="bg-card border border-border rounded-lg p-3 space-y-2 hover:border-primary/40 transition-colors cursor-grab active:cursor-grabbing active:opacity-70 active:scale-[0.98]"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-medium leading-tight">{{ proc.title }}</p>
              <div class="flex gap-1 shrink-0">
                <button @click.stop="openEdit(proc)" class="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button @click.stop="confirmDelete(proc)" class="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <!-- Task 3: badge de tipo com cor sólida -->
              <span :class="typeClass(proc.type)" class="text-[11px] px-1.5 py-0.5 rounded font-medium">{{ proc.type }}</span>
              <span v-if="proc.client" class="text-[11px] text-muted-foreground truncate max-w-[120px]">{{ proc.client.companyName }}</span>
            </div>
            <div v-if="proc.dueDate" class="flex items-center gap-1 text-[11px]" :class="isOverdue(proc.dueDate) ? 'text-destructive font-medium' : 'text-muted-foreground'">
              <CalendarIcon class="w-3 h-3" />
              {{ formatDate(proc.dueDate) }}
              <span v-if="isOverdue(proc.dueDate)">· Vencido</span>
            </div>
          </div>
          <div v-if="!columnItems(col.status).length" class="text-xs text-muted-foreground text-center py-6 select-none">
            Arraste um processo aqui
          </div>
        </div>
      </div>
    </div>

    <!-- Modal criar / editar -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editingProcess ? 'Editar processo' : 'Novo processo' }}</h2>
            <button @click="closeModal" class="text-muted-foreground hover:text-foreground">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Título <span class="text-destructive">*</span></label>
              <input v-model="form.title" class="input-field w-full" placeholder="Ex: IRPJ 2025" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Tipo <span class="text-destructive">*</span></label>
                <select v-model="form.type" class="input-field w-full">
                  <option v-for="t in processTypes" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Cliente <span class="text-destructive">*</span></label>
                <select v-model="form.clientId" class="input-field w-full">
                  <option value="" disabled>Selecione</option>
                  <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
                </select>
              </div>
              <div v-if="editingProcess" class="space-y-1.5">
                <label class="text-sm font-medium">Status</label>
                <select v-model="form.status" class="input-field w-full">
                  <option value="PENDING">Pendente</option>
                  <option value="IN_PROGRESS">Em andamento</option>
                  <option value="DONE">Concluído</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
              <!-- Task 2: date picker moderno com restrição de data futura -->
              <div class="space-y-1.5">
                <label class="text-sm font-medium">Vencimento</label>
                <AppDatePicker v-model="form.dueDate" :min="today" />
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Descrição</label>
              <textarea v-model="form.description" rows="2" class="input-field w-full resize-none" placeholder="Detalhes do processo..." />
            </div>
          </div>

          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>

          <div class="flex gap-3 justify-end">
            <button @click="closeModal" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button
              @click="submitForm"
              :disabled="saving"
              class="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {{ saving ? 'Salvando...' : (editingProcess ? 'Salvar alterações' : 'Criar processo') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal confirmar exclusão -->
    <Teleport to="body">
      <div v-if="processToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
          <h2 class="text-lg font-semibold">Excluir processo</h2>
          <p class="text-sm text-muted-foreground">
            Tem certeza que deseja excluir
            <span class="font-medium text-foreground">{{ processToDelete.title }}</span>?
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="processToDelete = null" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button
              @click="deleteProcess"
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
import { Plus, Search, Pencil, Trash2, X, Calendar as CalendarIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const api = useApi()

const loading = ref(true)
const processes = ref<any[]>([])
const clients = ref<any[]>([])
const searchQuery = ref('')
const filterClientId = ref('')
const filterType = ref('')
const showModal = ref(false)
const editingProcess = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const processToDelete = ref<any>(null)
const deleting = ref(false)

// Task 4: drag & drop state
const draggingProcess = ref<any>(null)
const dragTarget = ref<string | null>(null)

const processTypes = ['IRPF', 'IRPJ', 'MEI', 'NFE', 'NFSE', 'SPED', 'ECAC', 'OTHER']

// Task 2: data mínima = hoje
const today = computed(() => new Date().toISOString().split('T')[0])

const form = reactive({
  title: '',
  type: 'OTHER',
  clientId: '',
  status: 'PENDING',
  dueDate: '',
  description: '',
})

const columns = [
  { status: 'PENDING', label: 'Pendente', dot: 'bg-amber-500' },
  { status: 'IN_PROGRESS', label: 'Em andamento', dot: 'bg-blue-500' },
  { status: 'DONE', label: 'Concluído', dot: 'bg-green-500' },
  { status: 'CANCELLED', label: 'Cancelado', dot: 'bg-slate-400' },
]

const filteredProcesses = computed(() => {
  let list = processes.value
  if (filterClientId.value) list = list.filter((p) => p.clientId === filterClientId.value)
  if (filterType.value) list = list.filter((p) => p.type === filterType.value)
  const q = searchQuery.value.toLowerCase()
  if (q) list = list.filter((p) => p.title.toLowerCase().includes(q))
  return list
})

function columnItems(status: string) {
  return filteredProcesses.value.filter((p) => p.status === status)
}

onMounted(async () => {
  const [procs, cls] = await Promise.all([
    api.get<any[]>('/processes'),
    api.get<any[]>('/clients'),
  ])
  processes.value = procs
  clients.value = cls
  loading.value = false
})

// ── Task 4: Drag & Drop ────────────────────────────────────────────────────

function onDragStart(proc: any) {
  draggingProcess.value = proc
}

function onDragLeave(status: string, e: DragEvent) {
  const target = e.relatedTarget as HTMLElement | null
  if (!target || !e.currentTarget) return
  if (!(e.currentTarget as HTMLElement).contains(target)) {
    if (dragTarget.value === status) dragTarget.value = null
  }
}

async function onDrop(targetStatus: string) {
  dragTarget.value = null
  const proc = draggingProcess.value
  draggingProcess.value = null
  if (!proc || proc.status === targetStatus) return
  await moveProcess(proc, targetStatus)
}

// ── CRUD ──────────────────────────────────────────────────────────────────

function openCreate() {
  editingProcess.value = null
  Object.assign(form, { title: '', type: 'OTHER', clientId: filterClientId.value || '', status: 'PENDING', dueDate: '', description: '' })
  formError.value = ''
  showModal.value = true
}

function openEdit(proc: any) {
  editingProcess.value = proc
  Object.assign(form, {
    title: proc.title,
    type: proc.type,
    clientId: proc.clientId,
    status: proc.status,
    dueDate: proc.dueDate ? proc.dueDate.substring(0, 10) : '',
    description: proc.description || '',
  })
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  if (!form.title || !form.clientId) {
    formError.value = 'Preencha os campos obrigatórios.'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      title: form.title,
      type: form.type,
      clientId: form.clientId,
      status: editingProcess.value ? form.status : undefined,
      dueDate: form.dueDate || undefined,
      description: form.description || undefined,
    }
    if (editingProcess.value) {
      const updated = await api.patch<any>(`/processes/${editingProcess.value.id}`, payload)
      const idx = processes.value.findIndex((p) => p.id === editingProcess.value.id)
      if (idx !== -1) processes.value[idx] = updated
    } else {
      const created = await api.post<any>('/processes', payload)
      processes.value.unshift(created)
    }
    closeModal()
  } catch (err: any) {
    formError.value = err.message
  } finally {
    saving.value = false
  }
}

async function moveProcess(proc: any, newStatus: string) {
  const updated = await api.patch<any>(`/processes/${proc.id}`, { status: newStatus })
  const idx = processes.value.findIndex((p) => p.id === proc.id)
  if (idx !== -1) processes.value[idx] = updated
}

function confirmDelete(proc: any) {
  processToDelete.value = proc
}

async function deleteProcess() {
  if (!processToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/processes/${processToDelete.value.id}`)
    processes.value = processes.value.filter((p) => p.id !== processToDelete.value.id)
    processToDelete.value = null
  } finally {
    deleting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function isOverdue(iso: string) {
  return new Date(iso) < new Date()
}

// Task 3: badge de tipo com cor
function typeClass(type: string) {
  const map: Record<string, string> = {
    IRPF: 'bg-violet-500 text-white',
    IRPJ: 'bg-indigo-500 text-white',
    MEI: 'bg-cyan-500 text-white',
    NFE: 'bg-blue-500 text-white',
    NFSE: 'bg-sky-500 text-white',
    SPED: 'bg-orange-500 text-white',
    ECAC: 'bg-pink-500 text-white',
    OTHER: 'bg-slate-400 text-white',
  }
  return map[type] ?? map.OTHER
}
</script>

<style scoped>
.input-field {
  @apply text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring;
}
</style>
