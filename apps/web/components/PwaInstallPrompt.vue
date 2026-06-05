<script setup lang="ts">
import { X, Share, PlusSquare } from 'lucide-vue-next'

const DISMISSED_KEY = 'presteza_pwa_dismissed'

const showBanner = ref(false)
const showIosModal = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deferredPrompt = ref<any>(null)

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
  if (localStorage.getItem(DISMISSED_KEY)) return

  if (isIos.value) {
    setTimeout(() => { showBanner.value = true }, 3000)
    return
  }

  const handler = (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e
    setTimeout(() => { showBanner.value = true }, 3000)
  }
  window.addEventListener('beforeinstallprompt', handler)
  onUnmounted(() => window.removeEventListener('beforeinstallprompt', handler))
})

async function handleInstall() {
  if (isIos.value) {
    showIosModal.value = true
    return
  }
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  deferredPrompt.value = null
  showBanner.value = false
  if (outcome === 'accepted') {
    localStorage.setItem(DISMISSED_KEY, '1')
  }
}

function dismiss() {
  showBanner.value = false
  showIosModal.value = false
  localStorage.setItem(DISMISSED_KEY, '1')
}
</script>

<template>
  <!-- Banner flutuante -->
  <Transition name="slide-up">
    <div
      v-if="showBanner"
      class="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:w-80
             bg-card border border-border rounded-xl shadow-lg p-4 flex items-start gap-3"
    >
      <img src="/pwa_icon.svg" alt="Presteza" class="w-10 h-10 rounded-lg shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-foreground">Instalar Presteza Contábil</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          Adicione à tela inicial para acesso rápido
        </p>
        <div class="flex gap-2 mt-3">
          <button
            class="flex-1 bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-2
                   hover:opacity-90 transition-opacity"
            @click="handleInstall"
          >
            Instalar
          </button>
          <button
            class="text-xs text-muted-foreground px-3 py-2 hover:text-foreground transition-colors"
            @click="dismiss"
          >
            Agora não
          </button>
        </div>
      </div>
      <button
        class="text-muted-foreground hover:text-foreground shrink-0 -mt-0.5"
        @click="dismiss"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>

  <!-- Modal de instruções iOS -->
  <Transition name="fade">
    <div
      v-if="showIosModal"
      class="fixed inset-0 bg-black/60 z-[110] flex items-end sm:items-center justify-center p-4"
      @click.self="showIosModal = false"
    >
      <div class="bg-card border border-border rounded-2xl p-6 w-full sm:max-w-sm">
        <div class="flex items-center gap-3 mb-5">
          <img src="/pwa_icon.svg" alt="Presteza" class="w-12 h-12 rounded-xl" />
          <div>
            <h3 class="font-semibold text-foreground">Instalar no iPhone</h3>
            <p class="text-xs text-muted-foreground">Siga os passos abaixo no Safari</p>
          </div>
        </div>
        <ol class="space-y-4 text-sm text-foreground">
          <li class="flex items-start gap-3">
            <span
              class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center
                     justify-center text-xs font-bold shrink-0 mt-0.5"
            >1</span>
            <span>
              Toque no ícone
              <Share class="inline w-4 h-4 mx-0.5 -mt-0.5 text-blue-500" />
              <strong>Compartilhar</strong> na barra inferior do Safari
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center
                     justify-center text-xs font-bold shrink-0 mt-0.5"
            >2</span>
            <span>
              Role para baixo e toque em
              <PlusSquare class="inline w-4 h-4 mx-0.5 -mt-0.5" />
              <strong>"Adicionar à Tela de Início"</strong>
            </span>
          </li>
          <li class="flex items-start gap-3">
            <span
              class="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center
                     justify-center text-xs font-bold shrink-0 mt-0.5"
            >3</span>
            <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
          </li>
        </ol>
        <button
          class="w-full mt-6 bg-primary text-primary-foreground text-sm font-medium rounded-lg
                 py-2.5 hover:opacity-90 transition-opacity"
          @click="dismiss"
        >
          Entendido
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(120%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
