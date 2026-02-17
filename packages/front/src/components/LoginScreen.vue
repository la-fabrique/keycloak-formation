<script setup lang="ts">
import { useKeycloak } from '../composables/useKeycloak'

const { login } = useKeycloak()
</script>

<template>
  <div class="login-screen">
    <div class="login-card">
      <h1>Comptoir des voyageurs</h1>
      <p class="subtitle">Province de Valdoria</p>
      <p class="description">
        Bienvenue au Comptoir des voyageurs.
        Pour accéder aux ressources de la province, veuillez présenter votre laissez-passer impérial.
      </p>
      <button @click="login" class="btn-primary">
        Entrer dans le Comptoir
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3a2a1a 0%, #5a4a3a 100%);
}

.login-card {
  background: #f4e8d8;
  border: 3px solid #8b6f47;
  border-radius: 8px;
  padding: 3rem 2.5rem;
  max-width: 480px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  text-align: center;
}

h1 {
  font-family: 'Georgia', serif;
  font-size: 2rem;
  color: #3a2a1a;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.subtitle {
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  color: #8b6f47;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.description {
  color: #4a3a2a;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #8b6f47;
  color: #f4e8d8;
  border: 2px solid #6a5437;
  padding: 0.875rem 2rem;
  font-size: 1.05rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #6a5437;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
