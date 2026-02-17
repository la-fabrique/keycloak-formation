<script setup lang="ts">
import { onMounted } from 'vue'
import { useKeycloak } from './composables/useKeycloak'
import LoginScreen from './components/LoginScreen.vue'
import AppHeader from './components/AppHeader.vue'

const { authenticated, init } = useKeycloak()

onMounted(async () => {
  await init()
})
</script>

<template>
  <div class="app">
    <LoginScreen v-if="!authenticated" />
    <div v-else class="app-authenticated">
      <AppHeader />
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app-authenticated {
  min-height: 100vh;
  background: linear-gradient(135deg, #3a2a1a 0%, #5a4a3a 100%);
}
</style>
