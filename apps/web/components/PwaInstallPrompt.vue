<script setup lang="ts">
import { Download, Share, PlusSquare, CheckCircle } from 'lucide-vue-next'

// v3 — modal persistente
const INSTALL_KEY = 'presteza_pwa_dismissed_v3'

const { $pwaInstall: $pwa } = useNuxtApp() as any

const showModal = ref(false)
const showIosInstructions = ref(false)
const showAlreadyInstalled = ref(false)
const installing = ref(false)

const isIos = computed(() => {
  if (!import.meta.client) return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
})

const isStandalone = computed(() => {
  if (!import.meta.client) return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  )
})

onMounted(() => {
  if (isStandalone.value) return
  if (localStorage.getItem(INSTALL_KEY)) return
  showModal.value = true
})

async function handleInstall() {
  if (isIos.value) {
    showIosInstructions.value = true
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prompt = $pwa.installEvent.value as any

  if (!prompt) {
    installing.value = true
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => $pwa.installEvent.value,
        (evt) => { if (evt) { prompt = evt; stop(); resolve() } },
      )
      setTimeout(() => { stop(); resolve() }, 5000)
    })
    installing.value = false
  }

  if (prompt) {
    installing.value = true
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    installing.value = false
    $pwa.installEvent.value = null
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALL_KEY, '1')
      showModal.value = false
    }
    return
  }

  // beforeinstallprompt não disparou: app provavelmente já instalado
  showAlreadyInstalled.value = true
}

function dismiss() {
  showModal.value = false
  showIosInstructions.value = false
  showAlreadyInstalled.value = false
  localStorage.setItem(INSTALL_KEY, '1')
}
</script>

<template>
  <!-- Modal principal de instalação -->
  <Transition name="fade">
    <div
      v-if="showModal && !showIosInstructions && !showAlreadyInstalled"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
    >
      <div class="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div class="flex justify-center pt-8 pb-2">
          <img src="/pwa_icon_192.png" alt="Presteza" class="w-20 h-20 rounded-2xl shadow-lg" />
        </div>

        <div class="flex justify-center mt-5">
          <Download class="w-9 h-9 text-primary" stroke-width="1.75" />
        </div>

        <div class="text-center px-6 mt-3">
          <h2 class="text-xl font-bold text-foreground">Instalar o app</h2>
          <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
            Adicione à tela inicial para acesso rápido, mesmo sem internet.
          </p>
        </div>

        <div class="px-6 pb-6 mt-6 space-y-3">
          <button
            class="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3.5 text-sm
                   hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-60"
            :disabled="installing"
            @click="handleInstall"
          >
            {{ installing ? 'Aguardando instalador...' : 'Instalar' }}
          </button>
          <button
            class="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
            @click="dismiss"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- App já instalado (beforeinstallprompt não disparou) -->
  <Transition name="fade">
    <div
      v-if="showAlreadyInstalled"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
    >
      <div class="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div class="flex justify-center pt-8">
          <img src="/pwa_icon_192.png" alt="Presteza" class="w-20 h-20 rounded-2xl shadow-lg" />
        </div>

        <div class="flex justify-center mt-5">
          <CheckCircle class="w-9 h-9 text-green-500" stroke-width="1.75" />
        </div>

        <div class="text-center px-6 mt-3">
          <h2 class="text-xl font-bold text-foreground">App já instalado</h2>
          <p class="text-sm text-muted-foreground mt-2 leading-relaxed">
            O Presteza Contábil já está instalado no seu dispositivo.
            Procure pelo ícone na sua tela inicial ou gaveta de apps.
          </p>
        </div>

        <div class="px-6 pb-6 mt-6">
          <button
            class="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3.5 text-sm
                   hover:opacity-90 transition-opacity"
            @click="dismiss"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Instruções iOS -->
  <Transition name="fade">
    <div
      v-if="showIosInstructions"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4"
    >
      <div class="bg-card border border-border rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl">
        <div class="flex items-center gap-3 mb-5">
          <img src="/pwa_icon_192.png" alt="Presteza" class="w-12 h-12 rounded-xl" />
          <div>
            <h3 class="font-semibold text-foreground">Adicionar à tela inicial</h3>
            <p class="text-xs text-muted-foreground">Siga os passos no Safari</p>
          </div>
        </div>
        <ol class="space-y-4 text-sm text-foreground">
          <li class="flex items-start gap-3">
            <span class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            <span>Toque no ícone <Share class="inline w-4 h-4 mx-0.5 -mt-0.5 text-blue-500" /> <strong>Compartilhar</strong> na barra inferior do Safari</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            <span>Role para baixo e toque em <PlusSquare class="inline w-4 h-4 mx-0.5 -mt-0.5" /> <strong>"Adicionar à Tela de Início"</strong></span>
          </li>
          <li class="flex items-start gap-3">
            <span class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
          </li>
        </ol>
        <button
          class="w-full mt-6 bg-primary text-primary-foreground text-sm font-medium rounded-xl py-3 hover:opacity-90 transition-opacity"
          @click="dismiss"
        >
          Entendido
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
