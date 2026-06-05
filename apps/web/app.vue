<template>
  <AppSplash />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (t) => t ? `${t} — Presteza Contábil` : 'Presteza Contábil',
})
</script>
