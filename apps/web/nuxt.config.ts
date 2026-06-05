import { resolve } from 'path'

export default defineNuxtConfig({
  devtools: { enabled: false },
  // @ts-ignore — compatibilityDate foi adicionado nos tipos do Nuxt 3.12+;
  // com Nuxt 3.11.2 o campo existe em runtime mas ainda não está nos tipos.
  compatibilityDate: '2026-05-26',
  telemetry: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
    // PWA carregado apenas em produção: em dev, @vite-pwa/nuxt não é necessário
    // e a instalação pode introduzir conflitos de versão no lockfile.
    ...(process.env.NODE_ENV === 'production' ? ['@vite-pwa/nuxt'] : []),
  ],

  // Desabilita prefixo de pasta no auto-import de componentes.
  // Sem isso, components/shared/NavItem.vue seria <SharedNavItem> (não <NavItem>).
  components: [{ path: '~/components', pathPrefix: false }],

  // Aponta o módulo para o nosso CSS que contém @tailwind + variáveis CSS do Shadcn.
  // viewer: false desabilita o painel visual do Tailwind que sobe um servidor extra
  // na porta 3001 — a mesma porta da API NestJS — causando conflito de porta e
  // erro de CORS falso no browser.
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    viewer: false,
  },

  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },

  colorMode: {
    classSuffix: '',
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'http://localhost:3001',
    },
  },

  typescript: {
    strict: true,
  },

  experimental: {
    asyncContext: true,
  },

  nitro: {
    rollupConfig: {
      // Sem isso, o Rollup elimina tryUseNuxtApp() via @__NO_SIDE_EFFECTS__ e
      // useNuxtApp() compila para apenas throw new Error().
      treeshake: { annotations: false },
    },
  },

  vite: {
    resolve: {
      alias: {
        // Aponta direto para o source TypeScript — elimina dependência do dist/ compilado
        // e evita que o cache pre-bundle do Vite sirva uma versão desatualizada.
        '@presteza/types': resolve(__dirname, '../../packages/types/src/index.ts'),
      },
    },
    server: {
      hmr: {
        // Força o @vite/client a conectar pelo Nitro (porta 3000) em vez
        // de tentar a porta interna do Vite (~24678) que o browser não alcança.
        clientPort: 3000,
      },
    },
    plugins: [
      {
        // Fix: nuxt:components:imports (Nuxt 3.11.2) não guarda IDs de módulos
        // virtuais (\0prefix) antes de chamar path.resolve, gerando path inválido.
        // Este plugin faz monkey-patch após todos os plugins serem registrados.
        name: 'fix-virtual-module-transform',
        enforce: 'pre' as const,
        configResolved(config) {
          const target = (config.plugins as Array<{ name?: string; transform?: Function }>)
            .find(p => p.name === 'nuxt:components:imports')
          if (target?.transform) {
            const orig = target.transform
            target.transform = function (code: string, id: string, opts?: unknown) {
              if (id.startsWith('\0')) return null
              return orig.call(this, code, id, opts)
            }
          }
        },
      },
    ],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Presteza Contábil',
      short_name: 'Presteza',
      description: 'Sistema de gestão contábil',
      theme_color: '#2563eb',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'pt-BR',
      start_url: '/login',
      icons: [
        {
          src: '/pwa-icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any',
        },
      ],
    },
    workbox: {
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,png,svg,webp,woff,woff2}'],
    },
    devOptions: {
      enabled: false,
    },
  },

  app: {
    head: {
      title: 'Presteza Contábil',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema contábil moderno' },
        { name: 'theme-color', content: '#2563eb' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Presteza' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/pwa-icon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
