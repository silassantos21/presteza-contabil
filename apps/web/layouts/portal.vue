<template>
  <div class="fixed inset-0 flex bg-background overflow-hidden">
    <!-- Overlay mobile -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar cliente -->
    <aside
      class="flex flex-col border-r border-border bg-card shrink-0 overflow-hidden
             transition-all duration-200 ease-in-out
             fixed inset-y-0 left-0 z-50
             lg:relative lg:z-auto lg:inset-auto"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-16 w-[220px]' : 'w-[220px]',
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center border-b border-border shrink-0 transition-all duration-200"
        :class="sidebarCollapsed ? 'justify-center px-2 py-5' : 'px-5 py-5'"
      >
        <img
          v-if="sidebarCollapsed"
          src="~/assets/images/logo-symbol.svg"
          alt="Presteza"
          class="w-8 h-8 object-contain shrink-0"
        />
        <Transition
          enter-active-class="transition-opacity duration-150 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <img
            v-if="!sidebarCollapsed"
            src="~/assets/images/logo-full.svg"
            alt="Presteza Contábil"
            class="h-9 w-auto max-w-[180px] object-contain dark:brightness-0 dark:invert"
          />
        </Transition>
      </div>

      <!-- Toggle sidebar — só desktop, acima dos itens de menu -->
      <div
        class="hidden lg:flex border-b border-border shrink-0"
        :class="sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'"
      >
        <button
          @click="collapsed = !collapsed"
          :title="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
          :class="[
            'flex w-full items-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors min-h-[36px]',
            sidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
          ]"
        >
          <component :is="sidebarCollapsed ? PanelLeftOpen : PanelLeftClose" class="w-4 h-4 shrink-0" />
          <span v-if="!sidebarCollapsed" class="text-xs">Recolher menu</span>
        </button>
      </div>

      <!-- Navegação -->
      <nav
        class="flex-1 py-4 space-y-1 overflow-y-auto"
        :class="sidebarCollapsed ? 'px-2' : 'px-3'"
      >
        <NavItem to="/portal" icon="Home" label="Início" :exact="true" :collapsed="sidebarCollapsed" />
        <NavItem to="/portal/chat" icon="MessageSquare" label="Mensagens" :collapsed="sidebarCollapsed" />
        <NavItem to="/portal/documentos" icon="FileText" label="Documentos" :collapsed="sidebarCollapsed" />
        <NavItem to="/portal/processos" icon="FolderKanban" label="Processos" :collapsed="sidebarCollapsed" />
      </nav>

      <!-- Footer — só logout -->
      <div
        class="py-3 border-t border-border"
        :class="sidebarCollapsed ? 'px-2' : 'px-3'"
      >
        <button
          @click="authStore.logout()"
          :title="sidebarCollapsed ? 'Sair' : undefined"
          :class="[
            'relative flex w-full items-center rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group min-h-[44px]',
            sidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
          ]"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          <span v-if="!sidebarCollapsed">Sair</span>
          <span
            v-if="sidebarCollapsed"
            class="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-md text-xs font-medium
                   bg-popover text-popover-foreground border border-border shadow-md
                   opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50"
          >
            Sair
          </span>
        </button>
      </div>
    </aside>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 min-w-0">
      <header class="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <!-- Hambúrguer (mobile only) -->
        <button
          @click="mobileOpen = true"
          class="lg:hidden p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          aria-label="Abrir menu"
        >
          <Menu class="w-5 h-5" />
        </button>
        <div class="hidden lg:block" />

        <div class="flex items-center gap-2">
          <!-- Toggle dark mode -->
          <button
            @click="toggleColorMode"
            :title="isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'"
            class="p-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <Moon v-if="!isDark" class="w-4 h-4" />
            <Sun v-else class="w-4 h-4" />
          </button>

          <!-- Notificações -->
          <div class="relative" ref="notifRef">
            <button
              @click="toggleNotif"
              class="relative p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Notificações"
            >
              <Bell class="w-5 h-5 text-muted-foreground" />
              <span
                v-if="unreadCount > 0"
                class="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Dropdown de notificações -->
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <div
                v-if="notifOpen"
                class="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div class="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 class="text-sm font-semibold">Notificações</h3>
                  <button
                    v-if="unreadCount > 0"
                    @click="markAllRead"
                    class="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Marcar como lidas
                  </button>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  <p v-if="!notifications.length" class="px-4 py-6 text-sm text-muted-foreground text-center">
                    Nenhuma notificação
                  </p>
                  <div
                    v-for="n in notifications"
                    :key="n.id"
                    @click="handleNotifClick(n)"
                    class="px-4 py-3 hover:bg-accent cursor-pointer border-b border-border last:border-0 transition-colors"
                    :class="{ 'bg-primary/5': !n.read }"
                  >
                    <div class="flex items-start gap-2">
                      <span v-if="!n.read" class="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span v-else class="mt-1.5 w-1.5 h-1.5 shrink-0" />
                      <div class="min-w-0">
                        <p class="text-sm font-medium truncate">{{ n.title }}</p>
                        <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">{{ n.body }}</p>
                        <p class="text-xs text-muted-foreground mt-1">{{ formatTime(n.createdAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Avatar -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span class="text-primary font-semibold text-sm">
                {{ authStore.user?.name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-sm font-medium hidden md:block">{{ authStore.user?.name }}</span>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
  <PwaInstallPrompt />
</template>

<script setup lang="ts">
import { Bell, LogOut, Menu, Moon, Sun, PanelLeftOpen, PanelLeftClose } from 'lucide-vue-next'
import { onClickOutside } from '@vueuse/core'
import { WS_EVENTS } from '@presteza/types'
import type { Notification } from '@presteza/types'

const authStore = useAuthStore()
const api = useApi()
const colorMode = useColorMode()
const route = useRoute()
const collapsed = ref(true)
const mobileOpen = ref(false)

const sidebarCollapsed = computed(() => collapsed.value && !mobileOpen.value)
const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

watch(() => route.path, () => {
  mobileOpen.value = false
  notifOpen.value = false
})

// ─── Notificações ──────────────────────────────────────────────────────────────

const notifOpen = ref(false)
const notifRef = ref<HTMLElement | null>(null)
const unreadCount = ref(0)
const notifications = ref<Notification[]>([])

onClickOutside(notifRef, () => { notifOpen.value = false })

function toggleNotif() {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value && unreadCount.value > 0) {
    markAllRead()
  }
}

async function fetchNotifications() {
  try {
    const data = await api.get<Notification[]>('/notifications')
    notifications.value = data
    unreadCount.value = data.filter((n) => !n.read).length
  } catch {}
}

async function markAllRead() {
  try {
    await api.patch('/notifications/read-all', {})
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
    unreadCount.value = 0
  } catch {}
}

function handleNotifClick(n: Notification) {
  notifOpen.value = false
  const routes: Record<string, string> = {
    NEW_MESSAGE: '/portal/chat',
    NEW_DOCUMENT: '/portal/documentos',
    PROCESS_UPDATE: '/portal/processos',
  }
  const target = routes[n.type]
  if (target) navigateTo(target)
}

function formatTime(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return 'agora'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}min atrás`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atrás`
  return d.toLocaleDateString('pt-BR')
}

// ─── WebSocket ─────────────────────────────────────────────────────────────────

onMounted(() => {
  fetchNotifications()

  const { $socket } = useNuxtApp() as any
  const chatStore = useChatStore()

  function onNewNotification(notif: Notification) {
    notifications.value.unshift(notif)
    unreadCount.value++
  }

  $socket.on(WS_EVENTS.NEW_NOTIFICATION, onNewNotification)
  chatStore.connect()

  onUnmounted(() => {
    $socket.off(WS_EVENTS.NEW_NOTIFICATION, onNewNotification)
  })
})
</script>
