import { io, type Socket } from 'socket.io-client'

// Chave para injeção no app Nuxt
export const SOCKET_KEY = Symbol('socket') as InjectionKey<Socket>

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const wsUrl = config.public.wsUrl as string

  const socket: Socket = io(wsUrl, {
    autoConnect: false,
    withCredentials: true,
    transports: ['polling', 'websocket'],
  })

  console.log('🔌 [Plugin] Socket.IO instância criada — wsUrl:', wsUrl)

  socket.on('connect', () => console.log('🔌 [Plugin] connect | id:', socket.id))
  socket.on('disconnect', (r) => console.log('🔌 [Plugin] disconnect | motivo:', r))
  socket.on('connect_error', (e) => console.log('🔌 [Plugin] connect_error:', e.message))

  // Disponibiliza via provide/inject e via $socket
  nuxtApp.provide('socket', socket)
})
