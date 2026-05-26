# 📋 Presteza Contábil — Registro de Sprints

---

## ✅ Sprint 1 — Fundação (CONCLUÍDA)
**Data:** 26/05/2026
**Objetivo:** Estrutura base, autenticação, dois usuários de teste, layouts

### O que foi feito
- [x] Monorepo com pnpm workspaces + Turborepo
- [x] `packages/types` — todos os tipos TypeScript compartilhados entre API e web
- [x] **API NestJS** completa com módulos:
  - Auth (JWT + Passport, login, me, guards)
  - Users (listagem, busca por e-mail/id)
  - Clients (listagem, detalhe)
  - Chat (listagem de conversas + mensagens)
  - ChatGateway (WebSocket em tempo real com socket.io)
  - Documents (listagem por cliente)
  - Processes (listagem)
  - Notifications (listagem, marcar como lida)
  - Reports (stub — implementar na Sprint 5)
  - Prisma (módulo global, service)
- [x] **Schema Prisma** completo com todas as entidades:
  - User, Client, Conversation, Message, Document,
    Process, Notification, TimelineEvent
- [x] **Seed** com 2 usuários de teste:
  - Admin: `admin@presteza.com.br` / `admin123`
  - Cliente: `cliente@exemplo.com.br` / `cliente123`
  - Empresa, conversa, processo e timeline de exemplo
- [x] **Frontend Nuxt.js 3 + Vue 3:**
  - Tailwind CSS configurado (design system completo)
  - Layout `admin` (sidebar + topbar + notificações)
  - Layout `portal` (sidebar cliente)
  - Middleware de autenticação (proteção de rotas)
  - Store Pinia `auth` (login, logout, persistência local)
  - Composable `useApi` (fetch autenticado)
  - Página de Login (com credenciais de demo visíveis)
  - Dashboard Admin (KPIs + processos recentes)
  - Dashboard Portal Cliente
  - Componentes: NavItem, KpiCard, ProcessRow, QuickAccessCard
- [x] `.env.example` para API e Web
- [x] Documentação Swagger: `http://localhost:3001/api/docs`

### Credenciais necessárias para rodar
- [ ] **Neon PostgreSQL** — ver instruções abaixo

---

## ⏳ Sprint 2 — Chat em tempo real
**Status:** Aguardando banco de dados configurado
**Objetivo:** Chat funcional entre admin e cliente

### O que será feito
- [ ] Página `/admin/chat` — lista de conversas + chat
- [ ] Página `/portal/chat` — conversa do cliente
- [ ] Componente `ChatWindow.vue` (bolhas, timestamp, status)
- [ ] Componente `MessageInput.vue` (texto + envio)
- [ ] Integração socket.io no frontend
- [ ] Store `useChat.ts` (Pinia)

---

## ⏳ Sprint 3 — Upload e gestão de documentos
**Status:** Pendente
**Objetivo:** Upload/download de arquivos integrado ao chat e ao painel

### O que será feito
- [ ] Configurar Cloudflare R2 (storage)
- [ ] Endpoint de upload na API (`POST /documents/upload`)
- [ ] Página `/admin/documentos`
- [ ] Página `/portal/documentos`
- [ ] Upload via drag & drop
- [ ] Download com URL assinada

---

## ⏳ Sprint 4 — Processos, Timeline e Notificações
**Status:** Pendente
**Objetivo:** Gestão completa de processos contábeis

### O que será feito
- [ ] Página `/admin/processos` — kanban de status
- [ ] Página `/portal/processos`
- [ ] CRUD completo de processos na API
- [ ] Timeline por cliente
- [ ] Notificações in-app com badge no topbar
- [ ] CRUD completo de clientes (`/admin/clientes`)

---

## ⏳ Sprint 5 — Relatórios PDF
**Status:** Pendente
**Objetivo:** Geração de relatórios em PDF

### O que será feito
- [ ] `ReportsService` com pdfmake
- [ ] Relatório: Extrato de documentos por cliente
- [ ] Relatório: Lista de processos por status
- [ ] Endpoint `GET /reports/client/:id/pdf`
- [ ] Botão "Gerar PDF" nas páginas de cliente

---

## ⏳ Sprint 6 — Deploy (Vercel + Railway)
**Status:** Pendente

### O que será feito
- [ ] Configurar Railway para a API NestJS
- [ ] Configurar Vercel para o Nuxt.js
- [ ] Variáveis de ambiente de produção
- [ ] Testar fluxo completo em produção

---

## Legenda de Status
| Ícone | Significado |
|---|---|
| ✅ | Sprint concluída |
| ⏳ | Sprint pendente |
| 🔄 | Sprint em andamento |
