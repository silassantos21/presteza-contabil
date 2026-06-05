<script setup lang="ts">
import { X, Share, PlusSquare, Smartphone } from 'lucide-vue-next'

// v2 — reseta dismissals de sessões anteriores
const INSTALL_KEY = 'presteza_pwa_dismissed_v2'
const OPEN_KEY = 'presteza_pwa_open_dismissed'

const { $pwaInstall: $pwa } = useNuxtApp() as any

const showInstallBanner = ref(false)
const showOpenBanner = ref(false)
const showIosModal = ref(false)

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

  // Se o app está instalado mas o usuário está no browser, mostra banner de abertura
  if (!localStorage.getItem(OPEN_KEY)) {
    const stopOpen = watch(
      () => $pwa.isInstalled.value,
      (installed) => {
        if (installed) {
          setTimeout(() => { showOpenBanner.value = true }, 1500)
          stopOpen()
        }
      },
      { immediate: true },
    )
  }

  if (localStorage.getItem(INSTALL_KEY)) return

  // iOS: sempre mostra instruções de adição à tela inicial
  if (isIos.value) {
    setTimeout(() => { showInstallBanner.value = true }, 3000)
    return
  }

  // Android/Desktop: aguarda o evento capturado pelo plugin
  const stopInstall = watch(
    () => $pwa.installEvent.value,
    (evt) => {
      if (evt) {
        setTimeout(() => { showInstallBanner.value = true }, 3000)
        stopInstall()
      }
    },
    { immediate: true },
  )
})

async function handleInstall() {
  if (isIos.value) {
    showIosModal.value = true
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompt = $pwa.installEvent.value as any
  if (!prompt) return
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  $pwa.installEvent.value = null
  showInstallBanner.value = false
  if (outcome === 'accepted') localStorage.setItem(INSTALL_KEY, '1')
}

function dismissInstall() {
  showInstallBanner.value = false
  showIosModal.value = false
  localStorage.setItem(INSTALL_KEY, '1')
}

function handleOpenApp() {
  dismissOpenBanner()
  // Chrome no Android pode interceptar a navegação e abrir o PWA instalado
  window.location.href = window.location.origin + '/login'
}

function dismissOpenBanner() {
  showOpenBanner.value = false
  localStorage.setItem(OPEN_KEY, '1')
}
</script>

<template>
  <!-- Banner: app já instalado, usuário está no browser -->
  <Transition name="slide-up">
    <div
      v-if="showOpenBanner"
      class="fixed bottom-4 left-4 right-4 z-[100] sm:left-auto sm:right-4 sm:w-80
             bg-primary text-primary-foreground rounded-xl shadow-lg p-4 flex items-start gap-3"
    >
      <Smartphone class="w-5 h-5 shrink-0 mt-0.5 opacity-90" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold">App instalado</p>
        <p class="text-xs opacity-80 mt-0.5 leading-relaxed">
          Abra o Presteza Contábil pelo ícone na tela inicial para a melhor experiência.
        </p>
        <div class="flex gap-2 mt-3">
          <button
            class="flex-1 bg-white/20 hover:bg-white/30 text-xs font-medium rounded-lg px-3 py-2 transition-colors"
            @click="handleOpenApp"
          >
            Abrir no app
          </button>
          <button
            class="text-xs opacity-70 hover:opacity-100 px-3 py-2 transition-opacity"
            @click="dismissOpenBanner"
          >
            Fechar
          </button>
        </div>
      </div>
      <button class="opacity-70 hover:opacity-100 shrink-0 -mt-0.5" @click="dismissOpenBanner">
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>

  <!-- Banner: instalar o app -->
  <Transition name="slide-up">
    <div
      v-if="showInstallBanner"
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
            @click="dismissInstall"
          >
            Agora não
          </button>
        </div>
      </div>
      <button
        class="text-muted-foreground hover:text-foreground shrink-0 -mt-0.5"
        @click="dismissInstall"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>

  <!-- Modal: instruções iOS -->
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
          @click="dismissInstall"
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
