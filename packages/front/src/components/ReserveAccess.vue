<script setup lang="ts">
import { ref } from 'vue'
import { useKeycloak } from '../composables/useKeycloak'
import { API_URL } from '../config'

const { token, userProfile } = useKeycloak()

interface ApiResponse {
  status: 'idle' | 'loading' | 'success' | 'error'
  data?: any
  error?: string
  statusCode?: number
}

const infoResponse = ref<ApiResponse>({ status: 'idle' })
const inventaireResponse = ref<ApiResponse>({ status: 'idle' })
const artefactsResponse = ref<ApiResponse>({ status: 'idle' })

// Ville d'origine de l'utilisateur (extraite des attributs)
const villeOrigine = ref<string>(
  (userProfile.value.attributes.ville_origine as string) || ''
)

/**
 * Appelle un endpoint de l'API
 */
async function callApi(
  endpoint: string,
  responseRef: typeof infoResponse,
  useAuth: boolean = true
) {
  responseRef.value = { status: 'loading' }

  try {
    const headers: Record<string, string> = {}
    
    if (useAuth && token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      responseRef.value = {
        status: 'error',
        error: data.message || data.error || 'Erreur inconnue',
        statusCode: response.status,
        data
      }
    } else {
      responseRef.value = {
        status: 'success',
        data,
        statusCode: response.status
      }
    }
  } catch (error) {
    responseRef.value = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Erreur réseau',
      statusCode: 0
    }
  }
}

/**
 * Teste l'endpoint /info (public)
 */
function testInfo() {
  callApi('/info', infoResponse, false)
}

/**
 * Teste l'endpoint /inventaire (RBAC: marchand)
 */
function testInventaire() {
  callApi('/inventaire', inventaireResponse)
}

/**
 * Teste l'endpoint /villes/:ville/artefacts (RBAC + ABAC)
 */
function testArtefacts() {
  const ville = villeOrigine.value.toLowerCase().replace(/ /g, '-')
  callApi(`/villes/${ville}/artefacts`, artefactsResponse)
}

/**
 * Retourne la classe CSS selon le statut de la réponse
 */
function getStatusClass(response: ApiResponse): string {
  switch (response.status) {
    case 'success':
      return 'status-success'
    case 'error':
      return 'status-error'
    case 'loading':
      return 'status-loading'
    default:
      return ''
  }
}

/**
 * Retourne le badge de statut
 */
function getStatusBadge(response: ApiResponse): string {
  switch (response.status) {
    case 'success':
      return `✅ ${response.statusCode}`
    case 'error':
      return response.statusCode ? `❌ ${response.statusCode}` : '❌ Erreur'
    case 'loading':
      return '⏳ Chargement...'
    default:
      return ''
  }
}
</script>

<template>
  <div class="reserve-access">
    <h2>Accès à la Réserve de Valdoria</h2>
    <p class="subtitle">Testez les endpoints protégés de l'API</p>

    <!-- Endpoint 1: /info (public) -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <div>
          <h3>Informations publiques</h3>
          <code class="endpoint-path">GET /info</code>
        </div>
        <span v-if="infoResponse.status !== 'idle'" :class="['status-badge', getStatusClass(infoResponse)]">
          {{ getStatusBadge(infoResponse) }}
        </span>
      </div>
      
      <p class="endpoint-description">
        🌍 Endpoint public — Aucune authentification requise
      </p>

      <button 
        @click="testInfo" 
        :disabled="infoResponse.status === 'loading'"
        class="test-button"
      >
        {{ infoResponse.status === 'loading' ? 'Chargement...' : 'Tester l\'endpoint' }}
      </button>

      <div v-if="infoResponse.status === 'success'" class="response-success">
        <h4>✅ Réponse</h4>
        <pre>{{ JSON.stringify(infoResponse.data, null, 2) }}</pre>
      </div>

      <div v-if="infoResponse.status === 'error'" class="response-error">
        <h4>❌ Erreur {{ infoResponse.statusCode }}</h4>
        <p>{{ infoResponse.error }}</p>
      </div>
    </div>

    <!-- Endpoint 2: /inventaire (RBAC) -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <div>
          <h3>Inventaire de la Réserve</h3>
          <code class="endpoint-path">GET /inventaire</code>
        </div>
        <span v-if="inventaireResponse.status !== 'idle'" :class="['status-badge', getStatusClass(inventaireResponse)]">
          {{ getStatusBadge(inventaireResponse) }}
        </span>
      </div>
      
      <p class="endpoint-description">
        🔐 RBAC — Rôle <code class="role-badge">marchand</code> requis
      </p>

      <button 
        @click="testInventaire" 
        :disabled="inventaireResponse.status === 'loading'"
        class="test-button"
      >
        {{ inventaireResponse.status === 'loading' ? 'Chargement...' : 'Tester l\'endpoint' }}
      </button>

      <div v-if="inventaireResponse.status === 'success'" class="response-success">
        <h4>✅ Réponse</h4>
        <pre>{{ JSON.stringify(inventaireResponse.data, null, 2) }}</pre>
      </div>

      <div v-if="inventaireResponse.status === 'error'" class="response-error">
        <h4>❌ Erreur {{ inventaireResponse.statusCode }}</h4>
        <p>{{ inventaireResponse.error }}</p>
        <p v-if="inventaireResponse.statusCode === 403" class="hint">
          💡 Votre rôle actuel ne permet pas d'accéder à cet endpoint. Le rôle <code>marchand</code> est requis.
        </p>
      </div>
    </div>

    <!-- Endpoint 3: /villes/:ville/artefacts (RBAC + ABAC) -->
    <div class="endpoint-card">
      <div class="endpoint-header">
        <div>
          <h3>Artefacts de votre ville</h3>
          <code class="endpoint-path">GET /villes/{{ villeOrigine.toLowerCase().replace(/ /g, '-') }}/artefacts</code>
        </div>
        <span v-if="artefactsResponse.status !== 'idle'" :class="['status-badge', getStatusClass(artefactsResponse)]">
          {{ getStatusBadge(artefactsResponse) }}
        </span>
      </div>
      
      <p class="endpoint-description">
        🔐 RBAC + ABAC — Rôle <code class="role-badge">marchand</code> requis<br>
        📍 Filtrage par <code class="attribute-badge">ville_origine</code> : {{ villeOrigine }}
      </p>

      <button 
        @click="testArtefacts" 
        :disabled="artefactsResponse.status === 'loading' || !villeOrigine"
        class="test-button"
      >
        {{ artefactsResponse.status === 'loading' ? 'Chargement...' : 'Tester l\'endpoint' }}
      </button>

      <div v-if="artefactsResponse.status === 'success'" class="response-success">
        <h4>✅ Réponse</h4>
        <pre>{{ JSON.stringify(artefactsResponse.data, null, 2) }}</pre>
      </div>

      <div v-if="artefactsResponse.status === 'error'" class="response-error">
        <h4>❌ Erreur {{ artefactsResponse.statusCode }}</h4>
        <p>{{ artefactsResponse.error }}</p>
        <p v-if="artefactsResponse.statusCode === 403" class="hint">
          💡 Accès refusé. Vous devez avoir le rôle <code>marchand</code> et l'attribut <code>ville_origine</code> correspondant (ou le rôle <code>gouverneur</code> pour un accès total).
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reserve-access {
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
  margin: 0 0 0.5rem 0;
  border-bottom: 2px solid #c9a96e;
  padding-bottom: 0.5rem;
}

.subtitle {
  color: #5a4a3a;
  margin: 0 0 1.5rem 0;
  font-style: italic;
}

.endpoint-card {
  background: white;
  border: 1px solid #c9a96e;
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.endpoint-card:last-child {
  margin-bottom: 0;
}

.endpoint-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

h3 {
  font-family: 'Georgia', serif;
  color: #3a2a1a;
  font-size: 1.1rem;
  margin: 0 0 0.25rem 0;
}

.endpoint-path {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  display: inline-block;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-loading {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.endpoint-description {
  color: #5a4a3a;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.role-badge,
.attribute-badge {
  background: #8b6f47;
  color: #f4e8d8;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.test-button {
  background: #8b6f47;
  color: #f4e8d8;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.test-button:hover:not(:disabled) {
  background: #6d5635;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.test-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.response-success,
.response-error {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
}

.response-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.response-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.response-success h4,
.response-error h4 {
  font-family: 'Georgia', serif;
  font-size: 1rem;
  margin: 0 0 0.75rem 0;
}

.response-success h4 {
  color: #155724;
}

.response-error h4 {
  color: #721c24;
}

.response-success pre {
  background: #2d2d2d;
  color: #f8f8f2;
  padding: 1rem;
  border-radius: 3px;
  overflow-x: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.4;
}

.response-error p {
  color: #721c24;
  margin: 0;
  line-height: 1.6;
}

.hint {
  margin-top: 0.75rem !important;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  font-style: italic;
}

.hint code {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 2px;
  font-family: 'Courier New', monospace;
}
</style>
