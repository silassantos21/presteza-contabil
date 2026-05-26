export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'shadcn-nuxt',
  ],

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
