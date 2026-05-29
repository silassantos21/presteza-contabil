<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Overlay mobile -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="mobileOpen = false"
    />

    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-border bg-card shrink-0 overflow-hidden
             transition-all duration-200 ease-in-out
             fixed inset-y-0 left-0 z-50
             lg:relative lg:z-auto lg:inset-auto"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        sidebarCollapsed ? 'lg:w-16 w-[240px]' : 'w-[240px]',
      ]"
    >
      <!-- Logo -->
      <div
        class="flex items-center border-b border-border shrink-0 transition-all duration-200"
        :class="sidebarCollapsed ? 'justify-center px-2 py-5' : 'gap-3 px-5 py-5'"
      >
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span class="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <Transition
          enter-active-class="transition-all duration-150 ease-out"
          enter-from-class="opacity-0 w-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0 w-0"
        >
          <div v-if="!sidebarCollapsed" class="overflow-hidden">
            <p class="font-semibold text-sm leading-tight whitespace-nowrap">Presteza</p>
            <p class="text-xs text-muted-foreground whitespace-nowrap">Contábil</p>
          </div>
        </Transition>
      </div>

      <!-- Navegação -->
      <nav
        class="flex-1 py-4 space-y-1 overflow-y-auto"
        :class="sidebarCollapsed ? 'px-2' : 'px-3'"
      >
        <NavItem to="/admin" icon="LayoutDashboard" label="Dashboard" :exact="true" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/chat" icon="MessageSquare" label="Chat" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/clientes" icon="Users" label="Clientes" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/processos" icon="FolderKanban" label="Processos" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/documentos" icon="FileText" label="Documentos" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/relatorios" icon="BarChart2" label="Relatórios" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/configuracoes" icon="Settings" label="Configurações" :collapsed="sidebarCollapsed" />
        <NavItem to="/admin/faq" icon="HelpCircle" label="Ajuda" :collapsed="sidebarCollapsed" />
      </nav>

      <!-- Footer -->
      <div
        class="py-3 border-t border-border space-y-1"
        :class="sidebarCollapsed ? 'px-2' : 'px-3'"
      >
        <!-- Botão sair -->
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

        <!-- Toggle sidebar — só desktop -->
        <button
          @click="collapsed = !collapsed"
          :title="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
          :class="[
            'hidden lg:flex w-full items-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors min-h-[44px]',
            sidebarCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2',
          ]"
        >
          <component :is="sidebarCollapsed ? PanelLeftOpen : PanelLeftClose" class="w-4 h-4 shrink-0" />
          <span v-if="!sidebarCollapsed" class="text-xs">Recolher menu</span>
        </button>
      </div>
    </aside>

    <!-- Conteúdo principal -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Topbar -->
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
          <button class="relative p-2 rounded-md hover:bg-accent transition-colors">
            <Bell class="w-5 h-5 text-muted-foreground" />
            <span
              v-if="unreadCount > 0"
              class="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

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

      <!-- Página -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bell, LogOut, Menu, Moon, Sun, PanelLeftOpen, PanelLeftClose } from 'lucide-vue-next'

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
})

const unreadCount = ref(0)

async function fetchUnreadCount() {
  try {
    const { count } = await api.get<{ count: number }>('/notifications/unread-count')
    unreadCount.value = count
  } catch {}
}

onMounted(() => {
  fetchUnreadCount()
  const interval = setInterval(fetchUnreadCount, 30_000)
  onUnmounted(() => clearInterval(interval))
})
</script>
