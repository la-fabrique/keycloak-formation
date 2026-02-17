<script setup lang="ts">
import TokenDebug from '../components/TokenDebug.vue'
</script>

<template>
  <div class="page">
    <h1 class="page-title">🔍 Debug des jetons JWT</h1>
    <p class="page-description">
      Inspectez le contenu détaillé de vos jetons d'accès, d'identité et de rafraîchissement émis par Keycloak.
    </p>
    <TokenDebug />
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-title {
  font-family: 'Georgia', serif;
  color: #f4e8d8;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.page-description {
  color: #d4c4b4;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}
</style>
