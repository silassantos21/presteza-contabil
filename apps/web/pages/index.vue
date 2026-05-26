<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
authStore.loadFromStorage()

if (authStore.isAdmin) navigateTo('/admin')
else if (authStore.isClient) navigateTo('/portal')
else navigateTo('/login')
</script>
