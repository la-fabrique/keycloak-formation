<script setup lang="ts">
import { ref } from 'vue'
import { useKeycloak } from '../composables/useKeycloak'

const { token, idToken, refreshToken, parsedToken, parsedIdToken } = useKeycloak()

const expandedSections = ref({
  accessToken: false,
  idToken: false,
  refreshToken: false
})

function toggleSection(section: keyof typeof expandedSections.value) {
  expandedSections.value[section] = !expandedSections.value[section]
}

function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2)
}

function highlightClaim(key: string): boolean {
  return ['aud', 'realm_access', 'sub', 'exp', 'iat', 'iss', 'preferred_username', 'email'].includes(key)
}
</script>

<template>
  <div class="token-debug">
    <h2>Parchemins officiels (Debug)</h2>

    <!-- Access Token -->
    <div class="token-section">
      <button @click="toggleSection('accessToken')" class="section-header">
        <span class="icon">{{ expandedSections.accessToken ? '▼' : '▶' }}</span>
        <span class="title">Access Token</span>
      </button>
      <div v-if="expandedSections.accessToken" class="section-content">
        <div class="token-display">
          <h4>Token brut</h4>
          <pre class="token-raw">{{ token || 'Aucun token disponible' }}</pre>
        </div>
        <div v-if="parsedToken" class="token-display">
          <h4>Token décodé</h4>
          <pre class="token-parsed">{{ formatJson(parsedToken) }}</pre>
          <div class="key-claims">
            <h4>Claims clés</h4>
            <div class="claim-grid">
              <div class="claim-item">
                <span class="claim-label">Audience (aud):</span>
                <span class="claim-value">{{ parsedToken.aud }}</span>
              </div>
              <div class="claim-item">
                <span class="claim-label">Sujet (sub):</span>
                <span class="claim-value">{{ parsedToken.sub }}</span>
              </div>
              <div class="claim-item">
                <span class="claim-label">Rôles:</span>
                <span class="claim-value">{{ parsedToken.realm_access?.roles?.join(', ') || 'Aucun' }}</span>
              </div>
              <div class="claim-item">
                <span class="claim-label">Expiration (exp):</span>
                <span class="claim-value">
                  {{ parsedToken.exp ? new Date(parsedToken.exp * 1000).toLocaleString('fr-FR') : '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ID Token -->
    <div class="token-section">
      <button @click="toggleSection('idToken')" class="section-header">
        <span class="icon">{{ expandedSections.idToken ? '▼' : '▶' }}</span>
        <span class="title">ID Token</span>
      </button>
      <div v-if="expandedSections.idToken" class="section-content">
        <div class="token-display">
          <h4>Token brut</h4>
          <pre class="token-raw">{{ idToken || 'Aucun token disponible' }}</pre>
        </div>
        <div v-if="parsedIdToken" class="token-display">
          <h4>Token décodé</h4>
          <pre class="token-parsed">{{ formatJson(parsedIdToken) }}</pre>
        </div>
      </div>
    </div>

    <!-- Refresh Token -->
    <div class="token-section">
      <button @click="toggleSection('refreshToken')" class="section-header">
        <span class="icon">{{ expandedSections.refreshToken ? '▼' : '▶' }}</span>
        <span class="title">Refresh Token</span>
      </button>
      <div v-if="expandedSections.refreshToken" class="section-content">
        <div class="token-display">
          <h4>Token brut</h4>
          <pre class="token-raw">{{ refreshToken || 'Aucun token disponible' }}</pre>
          <p class="hint">Le refresh token n'est pas décodable (format opaque ou chiffré)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.token-debug {
  background: #f4e8d8;
  border: 2px solid #8b6f47;
  border-radius: 6px;
  padding: 2rem;
}

h2 {
  font-family: 'Georgia', serif;
  color: #3a2a1a;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  border-bottom: 2px solid #c9a96e;
  padding-bottom: 0.5rem;
}

.token-section {
  margin-bottom: 1rem;
  border: 1px solid #c9a96e;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  width: 100%;
  background: #e8dcc8;
  border: none;
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
  font-family: 'Georgia', serif;
  font-size: 1.1rem;
  color: #3a2a1a;
  font-weight: 600;
}

.section-header:hover {
  background: #dcc8a8;
}

.icon {
  font-size: 0.8rem;
  color: #8b6f47;
}

.section-content {
  padding: 1.25rem;
  background: #fdfbf7;
}

.token-display {
  margin-bottom: 1.5rem;
}

.token-display:last-child {
  margin-bottom: 0;
}

h4 {
  font-family: 'Georgia', serif;
  color: #5a4a3a;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
}

.token-raw,
.token-parsed {
  background: #2a2a2a;
  color: #e8e8e8;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0;
  word-break: break-all;
  white-space: pre-wrap;
}

.key-claims {
  margin-top: 1rem;
}

.claim-grid {
  display: grid;
  gap: 0.75rem;
}

.claim-item {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.claim-label {
  font-weight: 600;
  color: #5a4a3a;
  min-width: 140px;
}

.claim-value {
  color: #3a2a1a;
  word-break: break-word;
}

.hint {
  color: #8b6f47;
  font-style: italic;
  font-size: 0.9rem;
  margin: 0.5rem 0 0 0;
}
</style>
