<script setup lang="ts">
import UserProfile from '../components/UserProfile.vue'
</script>

<template>
  <div class="page">
    <h1 class="page-title">👤 Profil du sujet</h1>
    <p class="page-description">
      Consultez votre identité, vos titres impériaux (rôles) et vos attributs personnalisés.
    </p>
    <UserProfile />
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
