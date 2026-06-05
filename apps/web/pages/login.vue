<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4 py-8">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <img
          src="~/assets/images/logo-full.svg"
          alt="Presteza Contábil"
          class="h-12 w-auto max-w-[280px] mx-auto mb-4 dark:brightness-0 dark:invert"
        />
        <p class="text-muted-foreground text-sm mt-1">Entre na sua conta</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">E-mail</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="seu@email.com.br"
            required
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring transition min-h-[44px]"
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Senha</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            class="w-full px-3 py-2 rounded-md border border-input bg-background text-sm
                   focus:outline-none focus:ring-2 focus:ring-ring transition min-h-[44px]"
          />
        </div>

        <p v-if="error" class="text-destructive text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium
                 hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <!-- Credenciais de teste -->
      <div class="mt-6 p-3 rounded-md bg-muted text-xs space-y-1">
        <p class="font-semibold text-muted-foreground">Credenciais de demonstração:</p>
        <p>👤 Admin: <span class="font-mono">admin@presteza.com.br</span> / <span class="font-mono">admin123</span></p>
        <p>👤 Cliente: <span class="font-mono">cliente@exemplo.com.br</span> / <span class="font-mono">cliente123</span></p>
      </div>

      <!-- Aviso LGPD -->
      <p class="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
        Ao acessar o sistema, você concorda com o tratamento dos seus dados
        para prestação dos serviços contábeis, conforme a
        <span class="font-medium">Lei nº 13.709/2018 (LGPD)</span>.
        Dúvidas: <a href="mailto:silasribeiro11@gmail.com" class="underline underline-offset-2 hover:text-foreground transition-colors">silasribeiro11@gmail.com</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const config = useRuntimeConfig()

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    const data = await $fetch<any>(`${config.public.apiUrl}/auth/login`, {
      method: 'POST',
      body: form,
    })
    authStore.setAuth(data)
    // window.location.href força carregamento completo (SSR), eliminando
    // qualquer glitch de layout do NuxtLayout durante transição SPA.
    window.location.href = authStore.isAdmin ? '/admin' : '/portal'
  } catch (e: any) {
    error.value = e?.data?.message || 'E-mail ou senha incorretos'
  } finally {
    loading.value = false
  }
}
</script>
