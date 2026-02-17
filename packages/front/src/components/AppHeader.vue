<script setup lang="ts">
import { useKeycloak } from '../composables/useKeycloak'
import { useRouter, useRoute } from 'vue-router'

const { userProfile, logout } = useKeycloak()
const router = useRouter()
const route = useRoute()

function navigateTo(name: string) {
  router.push({ name })
}

function isActive(name: string): boolean {
  return route.name === name
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <div class="header-title">
          <h1>Comptoir des voyageurs</h1>
          <span class="province">Valdoria</span>
        </div>
        <nav class="header-nav">
          <button 
            @click="navigateTo('Reserve')" 
            :class="['nav-btn', { active: isActive('Reserve') }]"
          >
            🏰 Réserve
          </button>
          <button 
            @click="navigateTo('Profil')" 
            :class="['nav-btn', { active: isActive('Profil') }]"
          >
            👤 Profil
          </button>
          <button 
            @click="navigateTo('Debug')" 
            :class="['nav-btn', { active: isActive('Debug') }]"
          >
            🔍 Debug
          </button>
        </nav>
      </div>
      <div class="header-user">
        <span class="username">{{ userProfile.username }}</span>
        <button @click="logout" class="btn-logout">Quitter</button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background: linear-gradient(90deg, #3a2a1a 0%, #5a4a3a 100%);
  border-bottom: 3px solid #8b6f47;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.header-title h1 {
  font-family: 'Georgia', serif;
  color: #f4e8d8;
  font-size: 1.5rem;
  margin: 0;
  font-weight: 600;
}

.province {
  font-family: 'Georgia', serif;
  color: #c9a96e;
  font-size: 0.9rem;
  font-style: italic;
  margin-left: 0.75rem;
}

.header-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  background: transparent;
  color: #f4e8d8;
  border: 2px solid transparent;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-btn:hover {
  background: rgba(139, 111, 71, 0.3);
  border-color: #8b6f47;
}

.nav-btn.active {
  background: #8b6f47;
  border-color: #c9a96e;
  color: #f4e8d8;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: #f4e8d8;
  font-weight: 500;
}

.btn-logout {
  background: transparent;
  color: #f4e8d8;
  border: 2px solid #8b6f47;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #8b6f47;
  border-color: #c9a96e;
}
</style>
