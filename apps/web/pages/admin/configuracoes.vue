<template>
  <div class="p-4 sm:p-6 max-w-2xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold">Configurações</h1>
      <p class="text-muted-foreground text-sm mt-1">Gerencie seu perfil e segurança</p>
    </div>

    <!-- Dados do perfil -->
    <div class="rounded-lg border border-border bg-card p-5 space-y-4">
      <h2 class="font-semibold">Dados do perfil</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Nome</label>
          <input
            v-model="profileForm.name"
            type="text"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Seu nome"
          />
        </div>
        <div class="space-y-1.5">
          <label class="text-sm font-medium">E-mail</label>
          <input
            v-model="profileForm.email"
            type="email"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div v-if="profileError" class="text-sm text-destructive">{{ profileError }}</div>
      <div v-if="profileSuccess" class="text-sm text-green-600 dark:text-green-400">{{ profileSuccess }}</div>

      <button
        @click="saveProfile"
        :disabled="profileLoading"
        class="bg-primary text-primary-foreground text-sm font-medium rounded-lg px-4 py-2
               hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {{ profileLoading ? 'Salvando...' : 'Salvar perfil' }}
      </button>
    </div>

    <!-- Alterar senha -->
    <div class="rounded-lg border border-border bg-card p-5 space-y-4">
      <h2 class="font-semibold">Alterar senha</h2>

      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-sm font-medium">Senha atual</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••••"
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Nova senha</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Confirmar nova senha</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Repita a nova senha"
            />
          </div>
        </div>
      </div>

      <div v-if="passwordError" class="text-sm text-destructive">{{ passwordError }}</div>
      <div v-if="passwordSuccess" class="text-sm text-green-600 dark:text-green-400">{{ passwordSuccess }}</div>

      <button
        @click="savePassword"
        :disabled="passwordLoading"
        class="bg-primary text-primary-foreground text-sm font-medium rounded-lg px-4 py-2
               hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {{ passwordLoading ? 'Alterando...' : 'Alterar senha' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'auth' })

const authStore = useAuthStore()
const api = useApi()

// ─── Perfil ────────────────────────────────────────────────────────────────────

const profileForm = reactive({
  name: authStore.user?.name ?? '',
  email: authStore.user?.email ?? '',
})
const profileLoading = ref(false)
const profileError = ref('')
const profileSuccess = ref('')

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  if (!profileForm.name.trim()) {
    profileError.value = 'O nome não pode estar vazio'
    return
  }
  profileLoading.value = true
  try {
    const updated = await api.patch<{ name: string; email: string }>('/users/me', {
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
    })
    authStore.user = { ...authStore.user!, ...updated }
    localStorage.setItem('presteza_user', JSON.stringify(authStore.user))
    profileSuccess.value = 'Perfil atualizado com sucesso!'
    setTimeout(() => { profileSuccess.value = '' }, 3000)
  } catch (e: any) {
    profileError.value = e?.message ?? 'Erro ao salvar perfil'
  } finally {
    profileLoading.value = false
  }
}

// ─── Senha ─────────────────────────────────────────────────────────────────────

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

async function savePassword() {
  passwordError.value = ''
  passwordSuccess.value = ''
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    passwordError.value = 'Preencha todos os campos de senha'
    return
  }
  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'A nova senha deve ter pelo menos 6 caracteres'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'As senhas não coincidem'
    return
  }
  passwordLoading.value = true
  try {
    await api.patch('/users/me', {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordSuccess.value = 'Senha alterada com sucesso!'
    setTimeout(() => { passwordSuccess.value = '' }, 3000)
  } catch (e: any) {
    const msg = e?.data?.message ?? e?.message ?? 'Erro ao alterar senha'
    passwordError.value = Array.isArray(msg) ? msg.join(', ') : msg
  } finally {
    passwordLoading.value = false
  }
}
</script>
