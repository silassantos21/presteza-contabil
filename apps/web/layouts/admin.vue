<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <aside class="flex flex-col w-[240px] border-r border-border bg-card shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span class="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <div>
          <p class="font-semibold text-sm leading-tight">Presteza</p>
          <p class="text-xs text-muted-foreground">Contábil</p>
        </div>
      </div>

      <!-- Navegação -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem to="/admin" icon="LayoutDashboard" label="Dashboard" :exact="true" />
        <NavItem to="/admin/chat" icon="MessageSquare" label="Chat" />
        <NavItem to="/admin/clientes" icon="Users" label="Clientes" />
        <NavItem to="/admin/processos" icon="FolderKanban" label="Processos" />
        <NavItem to="/admin/documentos" icon="FileText" label="Documentos" />
        <NavItem to="/admin/relatorios" icon="BarChart2" label="Relatórios" />
      </nav>

      <!-- Footer -->
      <div class="px-3 py-3 border-t border-border space-y-1">
        <NavItem to="/admin/configuracoes" icon="Settings" label="Configurações" />
        <button
          @click="authStore.logout()"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>

    <!-- Conteúdo principal -->
    <div class="flex flex-col flex-1 min-w-0">
      <!-- Topbar -->
      <header class="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div />
        <div class="flex items-center gap-3">
          <!-- Notificações -->
          <button class="relative p-2 rounded-md hover:bg-accent transition-colors">
            <Bell class="w-5 h-5 text-muted-foreground" />
            <span v-if="unreadCount > 0"
              class="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
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
import { Bell, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const unreadCount = ref(0)
</script>
