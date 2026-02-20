<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useKeycloak } from '../composables/useKeycloak'

const router = useRouter()
const { init } = useKeycloak()

onMounted(async () => {
  await init()
  router.replace('/reserve')
})
</script>

<template>
  <div class="callback">
    <p>Connexion en cours…</p>
  </div>
</template>

<style scoped>
.callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #f4e8d8;
  font-family: 'Georgia', serif;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #3a2a1a 0%, #5a4a3a 100%);
}
</style>
