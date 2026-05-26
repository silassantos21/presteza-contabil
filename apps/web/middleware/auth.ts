export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  const publicRoutes = ['/login']
  if (publicRoutes.includes(to.path)) return

  if (!authStore.isAuthenticated) {
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
