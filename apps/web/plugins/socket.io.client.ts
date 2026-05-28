import { io, type Socket } from 'socket.io-client'

// Chave para injeção no app Nuxt
export const SOCKET_KEY = Symbol('socket') as InjectionKey<Socket>

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const wsUrl = config.public.wsUrl as string

  const socket: Socket = io(wsUrl, {
    autoConnect: false, // conexão manual após login
    withCredentials: true,
    transports: ['websocket', 'polling'],
  })

  // Disponibiliza via provide/inject e via $socket
  nuxtApp.provide('socket', socket)
})
