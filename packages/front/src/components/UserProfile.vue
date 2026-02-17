<script setup lang="ts">
import { useKeycloak } from '../composables/useKeycloak'

const { userProfile } = useKeycloak()
</script>

<template>
  <div class="user-profile">
    <h2>Profil du sujet</h2>

    <div class="profile-section">
      <h3>Identité</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Nom d'utilisateur :</span>
          <span class="value">{{ userProfile.username || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Email :</span>
          <span class="value">{{ userProfile.email || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Prénom :</span>
          <span class="value">{{ userProfile.firstName || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Nom :</span>
          <span class="value">{{ userProfile.lastName || '—' }}</span>
        </div>
      </div>
    </div>

    <div class="profile-section">
      <h3>Titres impériaux (Rôles)</h3>
      <div v-if="userProfile.roles.length > 0" class="roles-list">
        <span v-for="role in userProfile.roles" :key="role" class="role-badge">
          {{ role }}
        </span>
      </div>
      <p v-else class="empty-state">Aucun rôle attribué</p>
    </div>

    <div class="profile-section" v-if="Object.keys(userProfile.attributes).length > 0">
      <h3>Attributs personnalisés</h3>
      <div class="info-grid">
        <div v-for="(value, key) in userProfile.attributes" :key="key" class="info-item">
          <span class="label">{{ key }} :</span>
          <span class="value">{{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  background: #f4e8d8;
  border: 2px solid #8b6f47;
  border-radius: 6px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-family: 'Georgia', serif;
  color: #3a2a1a;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  border-bottom: 2px solid #c9a96e;
  padding-bottom: 0.5rem;
}

.profile-section {
  margin-bottom: 1.5rem;
}

.profile-section:last-child {
  margin-bottom: 0;
}

h3 {
  font-family: 'Georgia', serif;
  color: #5a4a3a;
  font-size: 1.1rem;
  margin: 0 0 0.75rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #5a4a3a;
}

.value {
  color: #3a2a1a;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.role-badge {
  background: #8b6f47;
  color: #f4e8d8;
  padding: 0.375rem 0.875rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
}

.empty-state {
  color: #8b6f47;
  font-style: italic;
  margin: 0;
}
</style>
