export default defineNuxtRouteMiddleware((to) => {
  // No servidor (SSR), localStorage não existe — pula a verificação.
  // O plugin plugins/auth.client.ts carrega o token do localStorage
  // antes desta função rodar no cliente, garantindo que o store já
  // está populado na primeira navegação client-side.
  if (import.meta.server) return

  const authStore = useAuthStore()
  authStore.loadFromStorage() // seguro chamar novamente (idempotente)

  const publicRoutes = ['/login']
  if (publicRoutes.includes(to.path)) return

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Rota raiz "/" — redireciona para a área correta conforme o role
  if (to.path === '/') {
    if (authStore.isAdmin) return navigateTo('/admin')
    if (authStore.isClient) return navigateTo('/portal')
    return navigateTo('/login')
  }

  // Admin tenta acessar portal do cliente
  if (to.path.startsWith('/portal') && authStore.isAdmin) {
    return navigateTo('/admin')
  }

  // Cliente tenta acessar dashboard admin
  if (to.path.startsWith('/admin') && authStore.isClient) {
    return navigateTo('/portal')
  }
})
