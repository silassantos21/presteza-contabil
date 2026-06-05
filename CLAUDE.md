# Presteza Contábil — CLAUDE.md

Documentação do projeto para o Claude Code. Atualizar sempre que houver mudanças estruturais relevantes.

---

## Stack

| Camada | Tecnologia |
|---|---|
| API | NestJS 10 + TypeScript + Prisma 5 |
| Banco | PostgreSQL via **Neon** (serverless, pooler) |
| Web | Nuxt 3.11.2 + Vue 3 + Pinia + Tailwind CSS |
| Monorepo | pnpm workspaces (sem Turborepo) |
| Autenticação | JWT (passport-jwt + passport-local) |
| WebSocket | Socket.IO (gateway NestJS + client no Nuxt) |
| UI | shadcn-nuxt + lucide-vue-next + @nuxtjs/color-mode |

---

## Estrutura do monorepo

```
presteza-contabil/
├── apps/
│   ├── api/          ← NestJS (porta 3001)
│   └── web/          ← Nuxt (porta 3000)
├── packages/
│   └── types/        ← Tipos compartilhados (@presteza/types)
├── node_modules/     ← pnpm workspace root
└── CLAUDE.md
```

---

## apps/api — NestJS

### Rodando
```bash
cd apps/api
npm run dev        # nest start --watch  (desenvolvimento — NÃO precisa de dist/)
npm run build      # nest build          (gera dist/)
npm run start      # nest build + node dist/main (produção — prestart rebuilda automaticamente)
```

> **⚠️ Regra de ouro:** Em desenvolvimento use SEMPRE `npm run dev`.  
> `npm run start` é para produção e agora inclui um `prestart` que roda `nest build` automaticamente — nunca mais executa dist stale.  
>
> **Se o build falhar ou o dist ficar corrompido:**
> ```bash
> Remove-Item -Recurse -Force dist, tsconfig.tsbuildinfo
> npm run build
> ```

### Módulos implementados

| Módulo | Rota base | Status |
|---|---|---|
| Auth | `/api/auth` | ✅ login (POST), /me (GET) |
| Users | `/api/users` | ✅ listagem |
| Clients | `/api/clients` | ✅ listagem + detalhe |
| Processes | `/api/processes` | ✅ listagem |
| Documents | `/api/documents` | ✅ por cliente |
| Chat | `/api/chat` | ✅ conversas + mensagens; Gateway WS; `GET conversations/by-client/:clientId` (get-or-create) |
| Notifications | `/api/notifications` | ✅ listagem + mark-all-read |
| Reports | `/api/reports` | ✅ estrutura base |

### Swagger
Disponível em `http://localhost:3001/api/docs` quando a API está rodando.

### Banco de dados (Neon PostgreSQL)
- `DATABASE_URL` configurada em `apps/api/.env`
- Schema em `apps/api/prisma/schema.prisma`
- Seed em `apps/api/prisma/seed.ts`

```bash
# Setup inicial do banco
cd apps/api
npx prisma db push          # aplica schema
npx ts-node prisma/seed.ts  # insere dados de demonstração
```

### Dados do seed
- **Admin:** `admin@presteza.com.br` / `admin123` → Amanda Nunes
- **Cliente:** `cliente@exemplo.com.br` / `cliente123` → Marcos Bonfá (Bonfá Serviços Ltda)
- 1 processo: "IRPJ 2025" (status: IN_PROGRESS, vencimento: 2026-06-30)
- 1 conversa com mensagem de boas-vindas

---

## apps/web — Nuxt 3

### Rodando
```bash
cd apps/web
npm run dev    # nuxt dev --port 3000
```

### Configuração relevante (nuxt.config.ts)
- `compatibilityDate: '2026-05-26'`
- `telemetry: false` ← desabilitado (incompatibilidade @nuxt/telemetry@2.8.0 com @nuxt/kit@3.11.2)
- API URL: `http://localhost:3001/api` (via `runtimeConfig.public.apiUrl`)
- WS URL: `http://localhost:3001` (via `runtimeConfig.public.wsUrl`)
- `components: [{ path: '~/components', pathPrefix: false }]` ← **obrigatório** (ver seção abaixo)

### Páginas implementadas

| Rota | Arquivo | Status |
|---|---|---|
| `/` | `pages/index.vue` | ✅ redireciona por role (via middleware/auth.ts) |
| `/login` | `pages/login.vue` | ✅ completo |
| `/admin` | `pages/admin/index.vue` | ✅ dashboard com KPIs + processos |
| `/admin/chat` | `pages/admin/chat.vue` | ✅ lista de conversas + chat em tempo real |
| `/admin/documentos` | `pages/admin/documentos.vue` | ✅ tabela, upload drag & drop, download, delete |
| `/admin/clientes` | `pages/admin/clientes.vue` | ✅ CRUD completo (criar, editar, excluir, busca) |
| `/admin/processos` | `pages/admin/processos.vue` | ✅ kanban por status, criar, editar, mover |
| `/portal` | `pages/portal/index.vue` | ✅ dashboard com processos |
| `/portal/chat` | `pages/portal/chat.vue` | ✅ chat direto com o escritório |
| `/portal/documentos` | `pages/portal/documentos.vue` | ✅ grid de cards, busca, download |
| `/portal/processos` | `pages/portal/processos.vue` | ✅ lista agrupada por status |
| `/admin/configuracoes` | `pages/admin/configuracoes.vue` | ✅ perfil + alterar senha |

### Páginas pendentes (links existem na sidebar, mas sem arquivo)

**Admin:**
- `/admin/relatorios`

### Layouts
- `layouts/default.vue` — layout mínimo (usado no login)
- `layouts/admin.vue` — sidebar colapsável com 7 itens (Dashboard, Chat, Clientes, Processos, Documentos, Relatórios, Configurações) + topbar com sino de notificações + avatar
- `layouts/portal.vue` — sidebar colapsável com 4 itens (Início, Mensagens, Documentos, Processos) + topbar com avatar

**Estado da sidebar:** usa `ref(true)` — sempre começa **colapsada** ao recarregar a página. Não usar `useLocalStorage` aqui: causa hydration mismatch SSR↔client, gerando labels visíveis dentro de um container já colapsado (ver seção "Sidebar — armadilhas").

### Middleware
- `middleware/auth.ts` — protege rotas, redireciona por role (ADMIN↔CLIENT) e trata a raiz `/`

### Stores (Pinia)
- `stores/auth.ts` — token + user no localStorage (`presteza_token`, `presteza_user`)
- `stores/chat.ts` — conversas, mensagens, conexão Socket.IO (`connect`, `sendMessage`, `openConversation`, etc.)

### Composables
- `composables/useApi.ts` — wrapper de $fetch com token JWT no header

### Plugins
- `plugins/auth.client.ts` — carrega o store de auth do localStorage na inicialização do browser (antes do middleware)
- `plugins/socket.io.client.ts` — instancia o Socket.IO (`autoConnect: false`) e injeta como `$socket`

### Componentes de chat
- `components/chat/ChatWindow.vue` → `<ChatWindow>`
- `components/chat/MessageInput.vue` → `<MessageInput>`

### Componentes compartilhados
- `components/shared/NavItem.vue` → `<NavItem>`
- `components/shared/KpiCard.vue` → `<KpiCard>`
- `components/shared/ProcessRow.vue` → `<ProcessRow>`
- `components/shared/QuickAccessCard.vue` → `<QuickAccessCard>`
- `components/AppDatePicker.vue` → `<AppDatePicker>` — calendário customizado Vue (dropdown com grade 7×6, prop `:min`, fecha ao clicar fora via `onClickOutside`)

### ⚠️ Auto-import de componentes — `pathPrefix: false` (OBRIGATÓRIO)

O `nuxt.config.ts` tem:
```ts
components: [{ path: '~/components', pathPrefix: false }]
```

**Por que isso existe:** sem essa opção, o Nuxt prefixa o nome da pasta ao registrar o componente. `components/shared/NavItem.vue` seria `<SharedNavItem>`, não `<NavItem>`. O resultado é `[Vue warn]: Failed to resolve component: NavItem` em runtime — os itens do menu lateral simplesmente não aparecem.

**Regra:** o nome do componente no template é sempre igual ao **nome do arquivo**, independente de qual subpasta estiver.  
`components/shared/NavItem.vue` → `<NavItem>` ✓  
`components/chat/MessageInput.vue` → `<MessageInput>` ✓ (não `<ChatMessageInput>`)  
`components/ui/Button.vue` → `<Button>` ✓ (shadcn, não afetado)

**Nunca remover essa linha do nuxt.config.ts.**

### Convenção de cores de status de processo

Usar **sempre** este mapeamento em todo componente que exiba status de processo:

| Status | Classe Tailwind | Texto |
|---|---|---|
| `PENDING` | `bg-amber-500` | `text-white` |
| `IN_PROGRESS` | `bg-blue-500` | `text-white` |
| `DONE` | `bg-green-500` | `text-white` |
| `CANCELLED` | `bg-slate-400` | `text-white` |

Esse padrão está implementado em: `processos.vue` (kanban), `portal/processos.vue`, `ProcessRow.vue` (dashboard).  
**Não criar esquemas alternativos** (ex: `bg-red-100 text-red-700`, `bg-yellow-100`) — já causou inconsistência visual entre o dashboard e a tela de processos.

---

## apps/web — Armadilhas conhecidas

### Sidebar — estado e overflow

**1. Nunca usar `useLocalStorage` para o estado `collapsed` da sidebar.**  
`useLocalStorage` retorna o valor padrão no servidor (SSR) e o valor do localStorage no cliente. Se os dois divergem, o Vue exibe as labels do menu expandido dentro de um container já na largura colapsada (hydration mismatch). Use `ref(true)` — o estado sempre começa colapsado no page load e persiste normalmente durante a navegação SPA (o layout não é remontado).

**2. Nunca colocar `overflow-x: visible` e `overflow-y: auto` no mesmo elemento.**  
CSS spec: quando um eixo é `auto`/`scroll`/`hidden` e o outro é `visible`, o `visible` é promovido silenciosamente para `auto`. O resultado é que qualquer conteúdo absoluto que ultrapasse o elemento (ex: tooltip `absolute left-full`) gera uma barra de scroll horizontal.  
Regra atual: `<aside>` usa `overflow-hidden`; `<nav>` usa `overflow-y-auto` sem `overflow-x-visible`.

**3. Após login, usar `window.location.href` — nunca `navigateTo()` — para navegar ao admin/portal.**  
`navigateTo()` faz SPA navigation: `NuxtLayout` tem estado intermediário ao trocar de `layout: false` (login) para `layout: 'admin'` no cliente, causando layout visualmente quebrado no primeiro frame (topbar deslocada, conteúdo preto). `window.location.href` faz carregamento HTTP completo (SSR), idêntico ao reload manual.  
```javascript
// ✅ Correto — handleLogin() em login.vue:
window.location.href = authStore.isAdmin ? '/admin' : '/portal'
// ❌ Nunca:
navigateTo('/admin')
```

**4 (antigo #3). Nunca usar `useHead({ bodyAttrs: { style: 'display:flex...' } })` para centralizar páginas.**  
O Nuxt aplica `bodyAttrs` no elemento `<body>` globalmente. Durante navegação SPA (ex: login → /admin), o estilo do body persiste por um frame, fazendo o layout do admin virar um flex-item deslocado — conteúdo sumia e topbar aparecia no rodapé.  

**Nunca usar `layouts/default.vue` para centralizar o login.** O Nuxt pode inserir elementos intermediários entre o slot do layout e o template da página (Suspense, RouterView, wrappers internos), quebrando o `justify-content: center` do flex pai — o conteúdo fica descentralizado ou esticado até a largura do viewport.

O padrão correto e definitivo é `definePageMeta({ layout: false })` na página de login, com todo o centering dentro do próprio template:
```vue
<!-- ✅ Correto — pages/login.vue (autossuficiente, sem layout) -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-background px-4 py-8">
    <div class="w-full max-w-sm">
      <!-- conteúdo do formulário -->
    </div>
  </div>
</template>
<script setup>
definePageMeta({ layout: false })
<!-- Sem useHead para bodyAttrs: o body já tem bg-background via CSS global (main.css) -->
</script>
```

> **Atenção:** `min-h-dvh` **não existe** no Tailwind v3 (foi adicionado no v3.3). Usar `min-h-screen`.  
> `layouts/default.vue` deve permanecer como `<slot />` simples — não colocar centering nele.

**5. Layouts admin/portal: usar `fixed inset-0` no div raiz — nunca `h-screen w-screen`.**  
`position: fixed` com `inset: 0` ancora o div diretamente nos cantos do VIEWPORT, completamente imune a qualquer estado do container pai (body flex, margin, wrappers intermediários do NuxtLayout, etc). Com `h-screen w-screen`, o elemento ainda depende do contexto do pai — se durante a navegação SPA o pai tiver `display:flex; align-items:center`, o layout fica deslocado.
```vue
<!-- ✅ Correto — layouts/admin.vue e layouts/portal.vue -->
<div class="fixed inset-0 flex bg-background overflow-hidden">
<!-- ❌ Nunca usar: -->
<div class="flex h-screen w-screen bg-background overflow-hidden">
```
`fixed inset-0` = `position:fixed; top:0; right:0; bottom:0; left:0` → dimensões do viewport sem depender do pai.

**4. Tooltips do NavItem: usar atributo `title` nativo, não span absoluto.**  
A implementação anterior colocava um `<span v-if="collapsed" class="absolute left-full ...">` para mostrar o label no hover. Esse span contribui para o `scrollWidth` do nav (mesmo com `opacity-0`), causando o scroll lateral descrito acima. O `NavItem` atual usa apenas `:title="collapsed ? label : undefined"` — o browser exibe o tooltip nativo, sem overflow.

---

## packages/types

Tipos TypeScript compartilhados entre API e Web:
- `User`, `AuthResponse`, enums de role/status, `WS_EVENTS`

### Build duplo obrigatório (CJS + ESM)

O pacote gera **dois formatos** para atender NestJS (runtime CJS) e Vite/Nuxt (browser ESM):

| Arquivo | Formato | Usado por |
|---|---|---|
| `dist/cjs/index.js` | CommonJS | NestJS runtime (`require`) |
| `dist/esm/index.js` | ESM | Vite/Nuxt (`import`) |
| `dist/index.d.ts` | Tipos | TypeScript em geral |

```bash
# Sempre que mudar src/index.ts, rebuildar:
cd packages/types && npm run build
# ou da raiz:
pnpm build:types
```

**Por que dois formatos?** O `dist/index.js` antigo era CJS. O Vite serve arquivos de workspace via `@fs/` sem converter CJS → ESM, causando `does not provide an export named 'WS_EVENTS'` no browser. Com o `exports` field no `package.json` do pacote (`"import"` → ESM, `"require"` → CJS), cada consumidor recebe o formato correto automaticamente.

O `nuxt.config.ts` aponta `@presteza/types` direto para o TypeScript source via alias Vite:
```typescript
vite: {
  resolve: {
    alias: { '@presteza/types': resolve(__dirname, '../../packages/types/src/index.ts') }
  }
}
```
**Nunca usar `vite.optimizeDeps.include` para pacotes de workspace próprios.** O `optimizeDeps.include` cria um snapshot em memória no arranque do dev server — se o dist for rebuiltado sem reiniciar o servidor, o Vite continua servindo a versão antiga. Isso causou um bug grave: `WS_EVENTS.JOIN_USER_ROOM` ficava `undefined` no browser, gerando loop de `forced close` no WebSocket. O alias Vite sempre lê o source em tempo real.

**Regra para erros "Named export not found" em runtime:**
- Pacote de **workspace próprio** (`packages/*`) → alias Vite para o `.ts` source (ver acima)
- Pacote **externo direto** → `optimizeDeps.include`
- Pacote **transitivo** (puxado por outro pacote) → `pnpm.overrides` no `package.json` raiz

Exemplo já aplicado para `consola` (pacote CJS@2.x puxado por alguma dependência transitiva; Nuxt espera ESM@3.x):
```json
// package.json raiz
"pnpm": {
  "overrides": {
    "consola": ">=3.0.0"
  }
}
```

Após adicionar um override:
```bash
pnpm install          # aplica o override no lockfile
# deletar .nuxt para limpar cache do Vite
Remove-Item -Recurse -Force apps/web/.nuxt
pnpm store prune      # remove versões órfãs do store
# reiniciar o dev server
```

---

## Observações importantes

### TypeScript incremental (API)
O `tsconfig.json` da API tem `"incremental": true`. O `Get-ChildItem` do PowerShell às vezes não lista `dist/` corretamente por causa dos espaços no caminho do projeto, mas os arquivos existem. Use `Test-Path ".\dist\main.js"` para confirmar.

### tsconfig.build.json (API) — obrigatório
O NestJS CLI (`nest build` / `nest start`) procura por `tsconfig.build.json` por padrão. **Dois problemas críticos resolvidos nesse arquivo:**

1. **Sem o arquivo** → `nest build` retorna exit 0 mas não gera nada.
2. **`"incremental": true`** (herdado de `tsconfig.json`) → o NestJS usa `createIncrementalProgram` do TypeScript, que nessa versão afirma `emitSkipped: false` mas **não escreve arquivos no disco**. Por isso o `tsconfig.build.json` sobrescreve com `"incremental": false`.

Conteúdo correto do `apps/api/tsconfig.build.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "incremental": false },
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts", "prisma"]
}
```

**Nunca remova esse arquivo e nunca remova o `"incremental": false`.**

Se o dist sumir misteriosamente:
```bash
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build   # ou nest start / npm run dev
```

### Auth no Nuxt (SSR + localStorage)
O middleware `middleware/auth.ts` usa `if (import.meta.server) return` para não rodar no servidor (onde não há localStorage). O plugin `plugins/auth.client.ts` carrega o token do localStorage quando o browser inicializa o app — **antes** do middleware rodar — garantindo que rotas protegidas acessadas diretamente pela URL (ex: `/admin/chat`) funcionem corretamente.

**⚠️ Nunca adicionar `ssr: false` no `nuxt.config.ts`** — no Nuxt 3.11.2, isso faz o Vite subir num servidor interno separado (porta ~24678) que o browser não consegue acessar, quebrando toda a estilização. A solução correta para auth com localStorage é o plugin client-side acima.

### `[nuxt] instance unavailable` no deploy Vercel — Rollup tree-shaking (CRÍTICO)

**Sintoma:** a página retorna `500: [nuxt] instance unavailable` apenas em produção (Vercel). Em dev funciona normalmente.

**Causa:** Nuxt 3.11.2 anota `tryUseNuxtApp()` com `@__NO_SIDE_EFFECTS__` e `/* @__PURE__ */`. O Rollup usado pelo Nitro interpreta essas anotações como permissão para eliminar a chamada, compilando `useNuxtApp()` para apenas `throw new Error("[nuxt] instance unavailable")` — sem nenhuma tentativa de recuperar o contexto via `getCurrentInstance()` ou AsyncLocalStorage.

**Fix permanente** (já aplicado em `nuxt.config.ts`):
```typescript
nitro: {
  rollupConfig: {
    treeshake: { annotations: false },
  },
},
```

**NÃO REMOVER** essa opção em atualizações de Nuxt/Nitro. Para verificar se ainda é necessária após um update: após build, checar se `chunks/build/server.mjs` contém a função `tryUseNuxtApp` completa. Se o arquivo tiver apenas `throw new Error(...)` dentro de `useNuxtApp`, adicionar a opção de volta.

---

### HMR port 24678 (Vite interno)
No Nuxt 3.11.2 + Vite, o `@vite/client` injetado nas páginas pode ter `hmrPort` apontando para a porta interna do Vite (~24678). Isso causa `ERR_CONNECTION_REFUSED` no console e quebra hot-reload.

**Fix permanente** (já aplicado em `nuxt.config.ts`):
```typescript
vite: {
  server: {
    hmr: {
      clientPort: 3000,  // força reconexão pelo Nitro (porta pública)
    },
  },
},
```
Verificar com: `node -e "require('http').get('http://localhost:3000/_nuxt/@vite/client', r => { let b=''; r.on('data', c => b+=c); r.on('end', () => console.log('hmrPort:', (b.match(/hmrPort\s*=\s*(\d+)/) || [])[1])); })"` — deve retornar `3000`.

### Tailwind + Shadcn CSS variables
O `nuxt.config.ts` deve ter `tailwindcss.cssPath` apontando para o arquivo com `@tailwind` + variáveis CSS, e `viewer: false` para não conflitar com a porta da API:
```typescript
tailwindcss: {
  cssPath: '~/assets/css/main.css',
  viewer: false,   // ← obrigatório! viewer ocupa a porta 3001 (mesma da API)
},
```
Sem `cssPath`, as variáveis CSS do Shadcn não são injetadas. Sem `viewer: false`, o painel visual do Tailwind sobe um servidor extra na porta 3001, impedindo a API NestJS de subir e causando erro de CORS falso no browser.

### Caminho com espaços
O projeto está em `C:\Users\jende\Projetos\Projetos Claude\Sistema Contábil\presteza-contabil`. Espaços no caminho podem causar comportamentos estranhos em algumas ferramentas CLI. Prefira sempre rodar comandos com `Set-Location` explícito dentro do PowerShell.

### pnpm
O monorepo usa pnpm. Cada app tem seus próprios `node_modules` além do root. Instalar dependências novas:
```bash
# Na raiz (para o workspace)
pnpm add -w <pacote>

# Em um app específico
pnpm add <pacote> --filter @presteza/api
pnpm add <pacote> --filter @presteza/web
```
