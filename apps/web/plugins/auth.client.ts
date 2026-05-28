/**
 * Plugin client-side de autenticação.
 *
 * Roda UMA VEZ quando o app inicializa no browser, ANTES de qualquer
 * route middleware. Popula o authStore a partir do localStorage para que
 * o middleware de auth encontre o token ao verificar rotas protegidas.
 *
 * Sem isso, quando o usuário digita uma URL diretamente (ex: /admin/chat),
 * o SSR renderiza sem token (localStorage não existe no servidor) e o
 * middleware client-side ainda não rodou, causando redirect para /login.
 */
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()
})
