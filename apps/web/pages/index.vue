<template>
  <div />
</template>

<script setup lang="ts">
// O redirect para /admin ou /portal é feito pelo middleware/auth.ts
// que trata a rota raiz "/" explicitamente.
definePageMeta({ middleware: 'auth' })
</script>
