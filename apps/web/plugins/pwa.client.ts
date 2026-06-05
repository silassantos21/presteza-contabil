import { ref } from 'vue'

export default defineNuxtPlugin(() => {
  const installEvent = ref<Event | null>(null)
  const isInstalled = ref(false)

  // Captura o evento antes de qualquer componente montar.
  // Se registrado depois do evento disparar, ele é perdido.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvent.value = e
  })

  // Detecta se o PWA já está instalado (Chrome Android 84+)
  if ('getInstalledRelatedApps' in navigator) {
    ;(navigator as any)
      .getInstalledRelatedApps()
      .then((apps: unknown[]) => { isInstalled.value = apps.length > 0 })
      .catch(() => {})
  }

  return {
    provide: {
      pwa: { installEvent, isInstalled },
    },
  }
})
