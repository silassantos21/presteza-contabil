export default defineNuxtConfig({
  devtools: { enabled: true },
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
    externals: {
      inline: [
        'unctx',
        'vue',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/reactivity',
        '@vue/shared',
        '@vue/server-renderer',
        'vue-bundle-renderer',
      ],
    },
  },

  vite: {
    // Garante que pacotes de workspace com CJS sejam pré-compilados para ESM
    // pelo esbuild do Vite, evitando "does not provide an export named X".
    optimizeDeps: {
      include: ['@presteza/types'],
    },
    server: {
      hmr: {
        // Força o @vite/client a conectar pelo Nitro (porta 3000) em vez
        // de tentar a porta interna do Vite (~24678) que o browser não alcança.
        clientPort: 3000,
      },
    },
  },

  app: {
    head: {
      title: 'Presteza Contábil',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Sistema contábil moderno' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },
})
