<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Clientes</h1>
        <p class="text-muted-foreground text-sm mt-1">Gerencie os clientes do escritório</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        <Plus class="w-4 h-4" />
        Novo cliente
      </button>
    </div>

    <!-- Busca -->
    <div class="relative max-w-xs">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        v-model="searchQuery"
        placeholder="Buscar por nome ou e-mail..."
        class="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <!-- Tabela -->
    <div class="rounded-lg border border-border bg-card overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-muted-foreground">Carregando clientes...</div>
      <div v-else-if="!filteredClients.length" class="p-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</div>
      <table v-else class="w-full text-sm">
        <thead class="border-b border-border bg-muted/40">
          <tr>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Empresa</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Responsável</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Contato</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th class="text-left px-4 py-3 font-medium text-muted-foreground">Portal</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="client in filteredClients" :key="client.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <div>
                <p class="font-medium">{{ client.companyName }}</p>
                <p v-if="client.tradeName" class="text-xs text-muted-foreground">{{ client.tradeName }}</p>
              </div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">{{ client.responsibleName }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ client.email }}</td>
            <td class="px-4 py-3 text-muted-foreground">{{ client.phone || '—' }}</td>
            <td class="px-4 py-3">
              <span :class="statusClass(client.status)" class="text-xs px-2.5 py-1 rounded-full font-medium">
                {{ statusLabel(client.status) }}
              </span>
            </td>
            <!-- Coluna Portal -->
            <td class="px-4 py-3">
              <button
                v-if="client.user"
                title="Acesso ao portal ativo"
                class="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 cursor-default"
              >
                <ShieldCheck class="w-4 h-4" />
                <span class="hidden lg:inline truncate max-w-[120px]">{{ client.user.email }}</span>
              </button>
              <button
                v-else
                @click="openPortalAccess(client)"
                title="Criar acesso ao portal"
                class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ShieldOff class="w-4 h-4" />
                <span class="hidden lg:inline">Criar acesso</span>
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <button
                  @click="downloadClientPdf(client)"
                  :disabled="downloadingPdfId === client.id"
                  title="Gerar extrato PDF"
                  class="p-1.5 rounded hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary disabled:opacity-40"
                >
                  <Loader2 v-if="downloadingPdfId === client.id" class="w-4 h-4 animate-spin" />
                  <FileText v-else class="w-4 h-4" />
                </button>
                <button
                  @click="openClientChat(client)"
                  :disabled="chatOpeningId === client.id"
                  title="Abrir chat"
                  class="p-1.5 rounded hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary disabled:opacity-40"
                >
                  <MessageSquare class="w-4 h-4" />
                </button>
                <button @click="openEdit(client)" title="Editar" class="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  <Pencil class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(client)" title="Excluir" class="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Modal criar / editar cliente ───────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-5 mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editingClient ? 'Editar cliente' : 'Novo cliente' }}</h2>
            <button @click="closeModal" class="text-muted-foreground hover:text-foreground"><X class="w-5 h-5" /></button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2 space-y-1.5">
              <label class="text-sm font-medium">Razão social <span class="text-destructive">*</span></label>
              <input v-model="form.companyName" @blur="touch('companyName')" :class="fieldClass('companyName')" class="input-field w-full" placeholder="Ex: Empresa LTDA" />
              <p v-if="errors.companyName" class="text-xs text-destructive">{{ errors.companyName }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Nome fantasia</label>
              <input v-model="form.tradeName" class="input-field w-full" placeholder="Nome fantasia" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Responsável <span class="text-destructive">*</span></label>
              <input v-model="form.responsibleName" @blur="touch('responsibleName')" :class="fieldClass('responsibleName')" class="input-field w-full" placeholder="Nome do responsável" />
              <p v-if="errors.responsibleName" class="text-xs text-destructive">{{ errors.responsibleName }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">CNPJ <span v-if="!form.cpf" class="text-destructive">*</span></label>
              <input :value="form.cnpj" @input="onCNPJInput" @blur="touch('cnpj')" :class="fieldClass('cnpj')" class="input-field w-full" placeholder="00.000.000/0000-00" inputmode="numeric" />
              <p v-if="errors.cnpj" class="text-xs text-destructive">{{ errors.cnpj }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">CPF <span v-if="!form.cnpj" class="text-destructive">*</span></label>
              <input :value="form.cpf" @input="onCPFInput" @blur="touch('cpf')" :class="fieldClass('cpf')" class="input-field w-full" placeholder="000.000.000-00" inputmode="numeric" />
              <p v-if="errors.cpf" class="text-xs text-destructive">{{ errors.cpf }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">E-mail <span class="text-destructive">*</span></label>
              <input v-model="form.email" type="email" @blur="touch('email')" :class="fieldClass('email')" class="input-field w-full" placeholder="email@empresa.com" />
              <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Contato</label>
              <input :value="form.phone" @input="onPhoneInput" @blur="touch('phone')" :class="fieldClass('phone')" class="input-field w-full" placeholder="(11) 99999-9999" inputmode="numeric" />
              <p v-if="errors.phone" class="text-xs text-destructive">{{ errors.phone }}</p>
            </div>
            <div v-if="editingClient" class="col-span-2 space-y-1.5">
              <label class="text-sm font-medium">Status</label>
              <select v-model="form.status" class="input-field w-full">
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="PENDING">Pendente</option>
              </select>
            </div>
            <div class="col-span-2 space-y-1.5">
              <label class="text-sm font-medium">Observações</label>
              <textarea v-model="form.notes" rows="2" class="input-field w-full resize-none" placeholder="Notas internas..." />
            </div>
          </div>

          <p class="text-xs text-muted-foreground"><span class="text-destructive">*</span> Obrigatório. É necessário informar ao menos CPF ou CNPJ.</p>
          <p v-if="formError" class="text-sm text-destructive font-medium">{{ formError }}</p>

          <div class="flex gap-3 justify-end">
            <button @click="closeModal" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancelar</button>
            <button @click="submitForm" :disabled="saving" class="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {{ saving ? 'Salvando...' : (editingClient ? 'Salvar alterações' : 'Criar cliente') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Modal acesso ao portal ──────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showPortalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-5 mx-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Criar acesso ao portal</h2>
              <p class="text-xs text-muted-foreground mt-0.5">{{ portalTarget?.companyName }}</p>
            </div>
            <button @click="showPortalModal = false" class="text-muted-foreground hover:text-foreground"><X class="w-5 h-5" /></button>
          </div>

          <!-- Info -->
          <div class="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
            <ShieldCheck class="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>O cliente usará estas credenciais para acessar o portal e se comunicar com o escritório.</span>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">E-mail de acesso <span class="text-destructive">*</span></label>
              <input v-model="portalForm.email" type="email" class="input-field w-full" placeholder="email@cliente.com" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Senha inicial <span class="text-destructive">*</span></label>
              <div class="relative">
                <input
                  v-model="portalForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="input-field w-full pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye v-if="!showPassword" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </div>
              <p class="text-xs text-muted-foreground">Anote a senha — ela não ficará visível depois de salvar.</p>
            </div>
          </div>

          <p v-if="portalError" class="text-sm text-destructive">{{ portalError }}</p>

          <div class="flex gap-3 justify-end">
            <button @click="showPortalModal = false" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancelar</button>
            <button @click="submitPortalAccess" :disabled="savingPortal" class="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
              {{ savingPortal ? 'Criando...' : 'Criar acesso' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Modal confirmar exclusão ───────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="clientToDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
          <h2 class="text-lg font-semibold">Excluir cliente</h2>
          <p class="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span class="font-medium text-foreground">{{ clientToDelete.companyName }}</span>? Esta ação não pode ser desfeita.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="clientToDelete = null" class="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors">Cancelar</button>
            <button @click="deleteClient" :disabled="deleting" class="px-4 py-2 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50">
              {{ deleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Plus, Search, Pencil, Trash2, X, ShieldCheck, ShieldOff, Eye, EyeOff, MessageSquare, FileText, Loader2 } from 'lucide-vue-next'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const api = useApi()
const { maskCPF, maskCNPJ, maskPhone, isValidEmail, isCompleteCPF, isCompleteCNPJ, isCompletePhone } = useMask()

// ── Estado principal ──────────────────────────────────────────────────────
const loading = ref(true)
const clients = ref<any[]>([])
const searchQuery = ref('')

// ── Modal cliente ─────────────────────────────────────────────────────────
const showModal = ref(false)
const editingClient = ref<any>(null)
const saving = ref(false)
const formError = ref('')
const clientToDelete = ref<any>(null)
const deleting = ref(false)

const form = reactive({
  companyName: '', tradeName: '', cnpj: '', cpf: '',
  email: '', phone: '', responsibleName: '', status: 'ACTIVE' as string, notes: '',
})
const touched = reactive<Record<string, boolean>>({})
const errors = reactive<Record<string, string>>({})

// ── PDF ───────────────────────────────────────────────────────────────────
const downloadingPdfId = ref<string | null>(null)

async function downloadClientPdf(client: any) {
  downloadingPdfId.value = client.id
  try {
    const filename = `extrato-${client.companyName.toLowerCase().replace(/\s+/g, '-')}.pdf`
    await api.downloadPdf(`/reports/client/${client.id}/pdf`, filename)
  } finally {
    downloadingPdfId.value = null
  }
}

// ── Chat ──────────────────────────────────────────────────────────────────
const chatOpeningId = ref<string | null>(null)

async function openClientChat(client: any) {
  chatOpeningId.value = client.id
  try {
    const conv = await api.get<any>(`/chat/conversations/by-client/${client.id}`)
    await navigateTo(`/admin/chat?conversationId=${conv.id}`)
  } finally {
    chatOpeningId.value = null
  }
}

// ── Modal portal ──────────────────────────────────────────────────────────
const showPortalModal = ref(false)
const portalTarget = ref<any>(null)
const savingPortal = ref(false)
const portalError = ref('')
const showPassword = ref(false)
const portalForm = reactive({ email: '', password: '' })

// ── Computed ──────────────────────────────────────────────────────────────
const filteredClients = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return clients.value
  return clients.value.filter(
    (c) => c.companyName.toLowerCase().includes(q) ||
           c.email.toLowerCase().includes(q) ||
           (c.responsibleName || '').toLowerCase().includes(q),
  )
})

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  clients.value = await api.get<any[]>('/clients')
  loading.value = false
})

// ── Validação ─────────────────────────────────────────────────────────────
function touch(field: string) { touched[field] = true; validateField(field) }

function validateField(field: string) {
  if (field === 'companyName') errors.companyName = form.companyName.trim() ? '' : 'Razão social é obrigatória.'
  if (field === 'responsibleName') errors.responsibleName = form.responsibleName.trim() ? '' : 'Nome do responsável é obrigatório.'
  if (field === 'email') {
    if (!form.email.trim()) errors.email = 'E-mail é obrigatório.'
    else if (!isValidEmail(form.email)) errors.email = 'E-mail inválido.'
    else errors.email = ''
  }
  if (field === 'cnpj') errors.cnpj = form.cnpj && !isCompleteCNPJ(form.cnpj) ? 'CNPJ incompleto (14 dígitos).' : ''
  if (field === 'cpf') errors.cpf = form.cpf && !isCompleteCPF(form.cpf) ? 'CPF incompleto (11 dígitos).' : ''
  if (field === 'phone') errors.phone = form.phone && !isCompletePhone(form.phone) ? 'Telefone incompleto.' : ''
}

function validateAll(): boolean {
  ['companyName', 'responsibleName', 'email', 'cnpj', 'cpf', 'phone'].forEach((f) => { touched[f] = true; validateField(f) })
  if (!form.cnpj && !form.cpf) { formError.value = 'Informe ao menos CPF ou CNPJ para identificação fiscal.'; return false }
  formError.value = ''
  return !Object.values(errors).some(Boolean)
}

function fieldClass(field: string) { return touched[field] && errors[field] ? 'border-destructive' : '' }

// ── Máscaras ──────────────────────────────────────────────────────────────
function onCNPJInput(e: Event) { form.cnpj = maskCNPJ((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = form.cnpj; if (touched.cnpj) validateField('cnpj') }
function onCPFInput(e: Event) { form.cpf = maskCPF((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = form.cpf; if (touched.cpf) validateField('cpf') }
function onPhoneInput(e: Event) { form.phone = maskPhone((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = form.phone; if (touched.phone) validateField('phone') }

// ── CRUD clientes ─────────────────────────────────────────────────────────
function openCreate() {
  editingClient.value = null
  Object.assign(form, { companyName: '', tradeName: '', cnpj: '', cpf: '', email: '', phone: '', responsibleName: '', status: 'ACTIVE', notes: '' })
  Object.keys(touched).forEach((k) => delete touched[k]); Object.keys(errors).forEach((k) => delete errors[k])
  formError.value = ''; showModal.value = true
}

function openEdit(client: any) {
  editingClient.value = client
  Object.assign(form, { companyName: client.companyName, tradeName: client.tradeName || '', cnpj: client.cnpj || '', cpf: client.cpf || '', email: client.email, phone: client.phone || '', responsibleName: client.responsibleName, status: client.status, notes: client.notes || '' })
  Object.keys(touched).forEach((k) => delete touched[k]); Object.keys(errors).forEach((k) => delete errors[k])
  formError.value = ''; showModal.value = true
}

function closeModal() { showModal.value = false }

async function submitForm() {
  if (!validateAll()) return
  saving.value = true; formError.value = ''
  try {
    const payload = { companyName: form.companyName.trim(), tradeName: form.tradeName.trim() || undefined, cnpj: form.cnpj || undefined, cpf: form.cpf || undefined, email: form.email.trim(), phone: form.phone || undefined, responsibleName: form.responsibleName.trim(), status: editingClient.value ? form.status : undefined, notes: form.notes.trim() || undefined }
    if (editingClient.value) {
      const updated = await api.patch<any>(`/clients/${editingClient.value.id}`, payload)
      const idx = clients.value.findIndex((c) => c.id === editingClient.value.id)
      if (idx !== -1) clients.value[idx] = updated
    } else {
      const created = await api.post<any>('/clients', payload)
      clients.value.push(created); clients.value.sort((a, b) => a.companyName.localeCompare(b.companyName))
    }
    closeModal()
  } catch (err: any) { formError.value = err.message }
  finally { saving.value = false }
}

function confirmDelete(client: any) { clientToDelete.value = client }

async function deleteClient() {
  if (!clientToDelete.value) return
  deleting.value = true
  try {
    await api.del(`/clients/${clientToDelete.value.id}`)
    clients.value = clients.value.filter((c) => c.id !== clientToDelete.value.id)
    clientToDelete.value = null
  } finally { deleting.value = false }
}

// ── Acesso ao portal ──────────────────────────────────────────────────────
function openPortalAccess(client: any) {
  portalTarget.value = client
  Object.assign(portalForm, { email: client.email, password: '' })
  portalError.value = ''; showPassword.value = false; showPortalModal.value = true
}

async function submitPortalAccess() {
  if (!portalForm.email || !portalForm.password) { portalError.value = 'Preencha e-mail e senha.'; return }
  if (!isValidEmail(portalForm.email)) { portalError.value = 'E-mail inválido.'; return }
  if (portalForm.password.length < 6) { portalError.value = 'A senha deve ter ao menos 6 caracteres.'; return }
  savingPortal.value = true; portalError.value = ''
  try {
    const updated = await api.post<any>(`/clients/${portalTarget.value.id}/portal-access`, { email: portalForm.email, password: portalForm.password })
    const idx = clients.value.findIndex((c) => c.id === portalTarget.value.id)
    if (idx !== -1) clients.value[idx] = updated
    showPortalModal.value = false
  } catch (err: any) { portalError.value = err.message }
  finally { savingPortal.value = false }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function statusLabel(status: string) { return { ACTIVE: 'Ativo', INACTIVE: 'Inativo', PENDING: 'Pendente' }[status] ?? status }

function statusClass(status: string) {
  return { ACTIVE: 'bg-green-500 text-white', INACTIVE: 'bg-slate-400 text-white', PENDING: 'bg-amber-500 text-white' }[status] ?? 'bg-slate-400 text-white'
}
</script>

<style scoped>
.input-field {
  @apply text-sm border border-border rounded-md bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring transition-colors;
}
.input-field.border-destructive { @apply ring-0; }
</style>
