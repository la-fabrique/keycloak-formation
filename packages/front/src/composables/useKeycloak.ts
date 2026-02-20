import { ref, type Ref } from 'vue'
import Keycloak from 'keycloak-js'
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '../config'

interface ParsedToken {
  sub?: string
  aud?: string | string[]
  exp?: number
  iat?: number
  realm_access?: {
    roles: string[]
  }
  email?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  [key: string]: unknown
}

interface UserProfile {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  roles: string[]
  attributes: Record<string, unknown>
}

// État global (singleton)
let keycloakInstance: Keycloak | null = null

const authenticated = ref(false)
const token = ref<string | undefined>()
const idToken = ref<string | undefined>()
const refreshToken = ref<string | undefined>()
const parsedToken = ref<ParsedToken | undefined>()
const parsedIdToken = ref<ParsedToken | undefined>()
const userProfile = ref<UserProfile>({
  roles: [],
  attributes: {}
})

/**
 * Décodage JWT basique (base64url)
 */
function parseJwt(token: string): ParsedToken | undefined {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return undefined
  }
}

/**
 * Met à jour les refs avec les tokens actuels
 */
function updateTokens() {
  if (!keycloakInstance) return

  authenticated.value = keycloakInstance.authenticated ?? false
  token.value = keycloakInstance.token
  idToken.value = keycloakInstance.idToken
  refreshToken.value = keycloakInstance.refreshToken

  if (token.value) {
    parsedToken.value = parseJwt(token.value)
  }

  if (idToken.value) {
    parsedIdToken.value = parseJwt(idToken.value)
  }

  // Extraction du profil utilisateur
  if (keycloakInstance.tokenParsed) {
    const parsed = keycloakInstance.tokenParsed as ParsedToken
    userProfile.value = {
      username: parsed.preferred_username,
      email: parsed.email,
      firstName: parsed.given_name,
      lastName: parsed.family_name,
      roles: parsed.realm_access?.roles ?? [],
      attributes: Object.keys(parsed)
        .filter(key => !['sub', 'aud', 'exp', 'iat', 'realm_access', 'email', 'preferred_username', 'given_name', 'family_name', 'azp', 'scope', 'sid', 'email_verified', 'name', 'typ', 'acr', 'allowed-origins', 'session_state', 'jti', 'iss'].includes(key))
        .reduce((acc, key) => {
          acc[key] = parsed[key]
          return acc
        }, {} as Record<string, unknown>)
    }
  }
}

/**
 * Initialise Keycloak
 */
async function init(): Promise<void> {
  if (keycloakInstance) {
    return // Déjà initialisé
  }

  keycloakInstance = new Keycloak({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID
  })

  try {
    keycloakInstance.onAuthLogout = () => {
      authenticated.value = false
      token.value = undefined
      idToken.value = undefined
      refreshToken.value = undefined
      parsedToken.value = undefined
      parsedIdToken.value = undefined
      userProfile.value = { roles: [], attributes: {} }
    }

    const initSuccess = await keycloakInstance.init({
      onLoad: 'check-sso',
      checkLoginIframe: true
    })

    if (initSuccess) {
      updateTokens()

      // Rafraîchissement automatique du token toutes les 30s
      setInterval(() => {
        keycloakInstance?.updateToken(30).then(() => {
          updateTokens()
        }).catch(() => {
          console.error('Échec du rafraîchissement du token')
        })
      }, 30000)
    }
  } catch (error) {
    console.error('Erreur d\'initialisation Keycloak', error)
  }
}

/**
 * Login
 */
function login(): void {
  keycloakInstance?.login({
    redirectUri: `${window.location.origin}/callback`
  })
}

/**
 * Logout
 */
function logout(): void {
  keycloakInstance?.logout()
}

/**
 * Composable useKeycloak
 */
export function useKeycloak() {
  return {
    authenticated: authenticated as Readonly<Ref<boolean>>,
    token: token as Readonly<Ref<string | undefined>>,
    idToken: idToken as Readonly<Ref<string | undefined>>,
    refreshToken: refreshToken as Readonly<Ref<string | undefined>>,
    parsedToken: parsedToken as Readonly<Ref<ParsedToken | undefined>>,
    parsedIdToken: parsedIdToken as Readonly<Ref<ParsedToken | undefined>>,
    userProfile: userProfile as Readonly<Ref<UserProfile>>,
    init,
    login,
    logout
  }
}
