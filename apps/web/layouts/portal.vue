<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar cliente (mais simples) -->
    <aside class="flex flex-col w-[220px] border-r border-border bg-card shrink-0">
      <!-- Logo escritório -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span class="text-primary-foreground font-bold text-sm">P</span>
        </div>
        <div>
          <p class="font-semibold text-sm leading-tight">Presteza</p>
          <p class="text-xs text-muted-foreground">Portal do Cliente</p>
        </div>
      </div>

      <nav class="flex-1 px-3 py-4 space-y-1">
        <NavItem to="/portal" icon="Home" label="Início" :exact="true" />
        <NavItem to="/portal/chat" icon="MessageSquare" label="Mensagens" />
        <NavItem to="/portal/documentos" icon="FileText" label="Documentos" />
        <NavItem to="/portal/processos" icon="FolderKanban" label="Processos" />
      </nav>

      <div class="px-3 py-3 border-t border-border">
        <button
          @click="authStore.logout()"
          class="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut class="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>

    <!-- Conteúdo -->
    <div class="flex flex-col flex-1 min-w-0">
      <header class="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
        <div />
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span class="text-primary font-semibold text-sm">
              {{ authStore.user?.name?.charAt(0).toUpperCase() }}
            </span>
          </div>
          <span class="text-sm font-medium hidden md:block">{{ authStore.user?.name }}</span>
        </div>
      </header>

      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
const authStore = useAuthStore()
</script>
