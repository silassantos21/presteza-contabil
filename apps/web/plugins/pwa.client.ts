import { ref } from 'vue'

export default defineNuxtPlugin(() => {
  const installEvent = ref<Event | null>(null)

  // Captura o evento antes de qualquer componente montar.
  // Se registrado depois do evento disparar, ele é perdido.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    installEvent.value = e
  })

  return {
    provide: {
      pwaInstall: { installEvent },
    },
  }
})
