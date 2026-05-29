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

## ✅ Sprint 2 — Chat em tempo real (CONCLUÍDA)
**Data:** 26/05/2026
**Objetivo:** Chat funcional entre admin e cliente

### O que foi feito
- [x] Página `/admin/chat` — lista de conversas + painel de chat
- [x] Página `/portal/chat` — conversa única do cliente
- [x] Componente `ChatWindow.vue` (bolhas por remetente, timestamp relativo, auto-scroll, skeleton)
- [x] Componente `MessageInput.vue` (textarea auto-resize, Enter envia, Shift+Enter nova linha)
- [x] Plugin `plugins/socket.io.client.ts` — conexão Socket.IO global (autoConnect: false)
- [x] Store `stores/chat.ts` (Pinia) — gerencia conversas, mensagens, socket, auto-join de sala
- [x] API: `GET /chat/my-conversation` — retorna (ou cria) conversa do cliente autenticado
- [x] API: `ChatService.getConversationByUserId` — busca/cria conversa via userId do JWT

---

## ✅ Sprint 3 — Upload e gestão de documentos
**Data:** 27/05/2026
**Objetivo:** Upload/download de arquivos integrado ao chat e ao painel

### O que foi feito
- [x] Configurar Cloudflare R2 (bucket `presteza-contabil`)
- [x] `StorageService` NestJS com upload, getSignedUrl, delete
- [x] `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` + `multer` instalados
- [x] `POST /documents/upload` — multipart, salva no R2 e no banco
- [x] `GET /documents/:id/signed-url` — URL assinada com expiração de 1h
- [x] `GET /documents/my-documents` — documentos do cliente autenticado
- [x] `DELETE /documents/:id` — remove do banco e do R2
- [x] Página `/admin/documentos` — tabela completa, filtro por cliente, upload drag & drop, download, delete
- [x] Página `/portal/documentos` — grid de cards, busca, download com URL assinada
- [x] Método `upload()` adicionado ao composable `useApi`

---

## ✅ Sprint 4 — Processos, Timeline e Notificações
**Status:** Concluída
**Data início:** 28/05/2026
**Data conclusão:** 28/05/2026
**Objetivo:** Gestão completa de processos contábeis

### O que foi feito
- [x] CRUD completo de processos na API (`POST`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `GET ?clientId=`, `GET my-processes`)
- [x] CRUD completo de clientes na API (`POST`, `PATCH /:id`, `DELETE /:id`, `GET /:id/timeline`, `POST /:id/timeline`)
- [x] Endpoint `GET /notifications/unread-count` para badge
- [x] Badge de notificações no topbar admin (polling a cada 30s)
- [x] Página `/admin/clientes` — tabela com criar, editar, desativar/excluir, busca
- [x] Página `/admin/processos` — kanban por status (Pendente / Em andamento / Concluído / Cancelado), criar, editar, mover entre colunas, filtro por cliente
- [x] Página `/portal/processos` — lista agrupada por status com vencimento e responsável

---

## ✅ Sprint 5 — Relatórios PDF
**Status:** Concluída
**Data início:** 28/05/2026
**Data conclusão:** 28/05/2026
**Objetivo:** Geração de relatórios em PDF

### O que foi feito
- [x] `ReportsService` com pdfmake (server-side, fontes Roboto via vfs_fonts)
- [x] Relatório: Extrato do cliente — documentos + processos em PDF formatado
- [x] Relatório: Lista de todos os processos agrupados por status em PDF
- [x] Endpoint `GET /reports/client/:id/pdf` — PDF do cliente (documentos + processos)
- [x] Endpoint `GET /reports/processes/pdf` — PDF de todos os processos por status
- [x] `downloadPdf()` adicionado ao composable `useApi` (fetch binário → download nativo)
- [x] Página `/admin/relatorios` — dois cards: Relatório de Processos e Extrato por Cliente
- [x] Botão FileText na página `/admin/clientes` — gera extrato PDF diretamente por linha

### Quirks descobertos
- pdfmake 0.2.x exporta as fontes diretamente na raiz do módulo (`require('pdfmake/build/vfs_fonts')['Roboto-Regular.ttf']`), não sob `pdfMake.vfs` como nas versões anteriores

---

## ✅ Sprint 6 — Deploy (Vercel + Railway)
**Status:** Concluída
**Data conclusão:** 29/05/2026

### O que foi feito
- [x] Configurar Railway para a API NestJS (`https://prestezaapi-production.up.railway.app`)
- [x] Configurar Vercel para o Nuxt.js (`https://presteza-contabil-api.vercel.app`)
- [x] Variáveis de ambiente de produção (Railway + Vercel)
- [x] Fix crítico: `nitro.rollupConfig.treeshake.annotations: false` — impedia SSR no Vercel
- [x] Testar fluxo completo em produção — todos os módulos funcionando

---

## ⏳ Sprint 7 — Responsividade e versão mobile
**Status:** Pendente

### Objetivo
Adaptar todas as páginas e layouts para funcionar corretamente em dispositivos móveis e telas pequenas, priorizando o portal do cliente (mais provável de ser acessado via celular).

### Escopo

#### Portal do cliente (prioridade alta)
- [ ] Layout `portal.vue` — sidebar vira menu hambúrguer / drawer em mobile
- [ ] `/portal` (dashboard) — KPIs empilhados em coluna única
- [ ] `/portal/chat` — área de mensagens ocupa tela cheia em mobile
- [ ] `/portal/documentos` — grid de 1 coluna em mobile, botões de ação legíveis
- [ ] `/portal/processos` — lista empilhada, badges de status visíveis

#### Painel admin (prioridade média)
- [ ] Layout `admin.vue` — sidebar vira drawer com overlay em mobile
- [ ] `/admin` (dashboard) — KPIs em grid 2×2, tabela de processos scroll horizontal
- [ ] `/admin/clientes` — tabela com scroll horizontal ou cards em mobile
- [ ] `/admin/processos` — kanban com scroll horizontal por coluna em mobile
- [ ] `/admin/documentos` — tabela com scroll horizontal, upload acessível
- [ ] `/admin/chat` — lista de conversas ocupa tela cheia, painel de chat no mesmo nível
- [ ] `/admin/relatorios` — cards em coluna única, lista de clientes com scroll

#### Autenticação
- [ ] `/login` — form centrado e full-width em mobile, campos e botão com altura de toque adequada

#### Topbar (ambos os layouts)
- [ ] Topbar `admin.vue` — botão hambúrguer visível em mobile para abrir o drawer da sidebar
- [ ] Topbar `portal.vue` — botão hambúrguer visível em mobile para abrir o drawer da sidebar

#### Componentes compartilhados
- [ ] `NavItem.vue` — labels e ícones legíveis em telas estreitas
- [ ] `KpiCard.vue` — adaptar padding e tamanho de fonte
- [ ] `AppDatePicker.vue` — corrigir posicionamento em mobile (pode sair da tela) e aumentar área de toque das células do calendário
- [ ] Modais e drawers — largura total em mobile (`w-full` em vez de `max-w-lg`)
- [ ] Inputs e botões — altura mínima de toque (`min-h-[44px]`)

### Diretrizes técnicas
- Mobile-first: revisar breakpoints `sm:`, `md:`, `lg:` em cada página
- Sidebar em mobile: `fixed` com `z-50`, overlay escuro atrás, fecha ao clicar fora
- Tabelas longas: `overflow-x-auto` no container pai (nunca no `<table>`)
- Fontes: mínimo `text-sm` (14px) em mobile — nunca `text-xs` em texto funcional
- Toque: elementos clicáveis com área mínima de 44×44 px (padrão WCAG)

---

## ⏳ Sprint 8 — Correções de UX, Bugs e Funcionalidades
**Status:** Pendente
**Objetivo:** Corrigir bugs identificados em produção, melhorar a experiência de uso e adicionar funcionalidades que completam o produto.

### O que será feito

#### Bugs e segurança (prioridade alta)
- [ ] `pages/portal/index.vue` — substituir chamada `GET /processes` por `GET /processes/my-processes` (cliente vê só os próprios processos)
- [ ] `pages/login.vue` — corrigir centralização do formulário no carregamento inicial (problema de `min-h-screen` antes do hydration)
- [ ] `AuthController /me` — lançar `UnauthorizedException` se usuário não existir mais no banco, forçando logout automático ao recarregar a página

#### Melhorias de UX (prioridade média)
- [ ] Layouts `admin.vue` e `portal.vue` — mover botão de expandir/recolher sidebar para o topo do menu, separado visualmente do botão de logout
- [ ] Backend: emitir evento WebSocket `notification:new` + salvar no banco ao criar mensagem (para o destinatário), documento (para o cliente vinculado) e processo (para o cliente vinculado)
- [ ] Frontend admin: substituir polling do badge de notificações por evento WebSocket em tempo real
- [ ] Frontend portal: adicionar sino de notificações no topbar com badge e lista de notificações não lidas
- [ ] Notificações: clicar navega para o recurso correspondente (chat, documento ou processo)

#### Novas funcionalidades (prioridade baixa)
- [ ] Dashboard admin — substituir placeholder "Atividade recente" por dados reais: últimos documentos, processos alterados e mensagens (endpoint `GET /activity/recent` ou via tabela `TimelineEvent`)
- [ ] Página `/admin/configuracoes` — formulário de perfil (nome, e-mail) + troca de senha, com endpoint `PATCH /users/me` na API

---

## Legenda de Status
| Ícone | Significado |
|---|---|
| ✅ | Sprint concluída |
| ⏳ | Sprint pendente |
| 🔄 | Sprint em andamento |
