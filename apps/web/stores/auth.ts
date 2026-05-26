import { defineStore } from 'pinia'
import type { User, AuthResponse } from '@presteza/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token && !!s.user,
    isAdmin: (s) => s.user?.role === 'ADMIN',
    isClient: (s) => s.user?.role === 'CLIENT',
  },

  actions: {
    setAuth(data: AuthResponse) {
      this.token = data.accessToken
      this.user = data.user
      if (import.meta.client) {
        localStorage.setItem('presteza_token', data.accessToken)
        localStorage.setItem('presteza_user', JSON.stringify(data.user))
      }
    },

    loadFromStorage() {
      if (import.meta.client) {
        const token = localStorage.getItem('presteza_token')
        const user = localStorage.getItem('presteza_user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
        }
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('presteza_token')
        localStorage.removeItem('presteza_user')
      }
      navigateTo('/login')
    },
  },
})
