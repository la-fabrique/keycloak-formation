import { ref, type Ref } from 'vue'
import Keycloak from 'keycloak-js'
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from '../config'

// [FORMATION KEYCLOAK] Structure du payload d'un token JWT décodé.
// Un JWT est composé de 3 parties séparées par des points : header.payload.signature
// Le payload (partie centrale) contient ces claims, visibles dans la page Debug de l'app.
// Les champs marqués "?" sont optionnels selon le type de token (access token vs ID token).
interface ParsedToken {
  sub?: string           // Identifiant unique de l'utilisateur dans Keycloak
  aud?: string | string[] // Audience : à qui ce token est destiné
  exp?: number           // Expiration (timestamp Unix)
  iat?: number           // Date d'émission (issued at)
  realm_access?: {
    roles: string[]      // Rôles de royaume (ex : ["sujet", "marchand", "gouverneur"])
  }
  email?: string
  preferred_username?: string
  given_name?: string
  family_name?: string
  [key: string]: unknown // Permet les claims personnalisés comme "villeOrigine"
}

// Profil utilisateur extrait du token pour l'affichage dans l'interface.
interface UserProfile {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  roles: string[]
  attributes: Record<string, unknown> // Claims personnalisés (ex : villeOrigine)
}

// [FORMATION KEYCLOAK] keycloak-js est la librairie officielle Keycloak pour les SPA.
// Elle gère le flux Authorization Code + PKCE : redirection vers Keycloak,
// récupération du code, échange contre les tokens, et rafraîchissement automatique.
// On utilise un singleton pour ne créer qu'une seule instance par session navigateur.
let keycloakInstance: Keycloak | null = null

// [FORMATION KEYCLOAK] Le front reçoit 3 tokens distincts après authentification :
// - token (access token) : présenté à l'API pour prouver les droits de l'utilisateur
// - idToken (ID token) : contient l'identité de l'utilisateur (nom, email) pour l'app
// - refreshToken : permet d'obtenir de nouveaux access tokens sans se reconnecter
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

// [FORMATION KEYCLOAK] Un JWT est en réalité du JSON encodé en base64url, pas chiffré.
// N'importe qui peut lire le contenu d'un token en le décodant — c'est pourquoi
// on ne met jamais d'information secrète dans un token.
// La sécurité repose sur la SIGNATURE : seul Keycloak peut produire une signature valide.
// Cette fonction décode manuellement la partie payload (index [1]) du token.
function parseJwt(token: string): ParsedToken | undefined {
  try {
    // Un JWT a la forme "header.payload.signature" — on prend le payload (index 1).
    const base64Url = token.split('.')[1]
    // Base64url utilise "-" et "_" à la place de "+" et "/" du base64 classique.
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

// Synchronise l'état Vue avec les tokens stockés par keycloak-js.
// Appelée après chaque connexion ou rafraîchissement de token.
function updateTokens() {
  if (!keycloakInstance) return

  authenticated.value = keycloakInstance.authenticated ?? false
  // [FORMATION KEYCLOAK] keycloak-js stocke les 3 tokens reçus de Keycloak après le flux OAuth.
  // token = access token (pour appeler l'API)
  // idToken = ID token (pour connaître l'identité de l'utilisateur dans l'app)
  // refreshToken = refresh token (pour renouveler l'access token sans reconnexion)
  token.value = keycloakInstance.token
  idToken.value = keycloakInstance.idToken
  refreshToken.value = keycloakInstance.refreshToken

  if (token.value) {
    parsedToken.value = parseJwt(token.value)
  }

  if (idToken.value) {
    parsedIdToken.value = parseJwt(idToken.value)
  }

  // [FORMATION KEYCLOAK] On extrait les informations utiles de l'access token pour l'interface.
  // Les "attributes" sont les claims NON standards — c'est-à-dire tout ce qu'on a ajouté
  // via des mappers dans Keycloak (comme "villeOrigine" via le scope "attributs-valdorien").
  // On filtre les claims standards pour n'afficher que les attributs personnalisés.
  if (keycloakInstance.tokenParsed) {
    const parsed = keycloakInstance.tokenParsed as ParsedToken
    userProfile.value = {
      username: parsed.preferred_username,
      email: parsed.email,
      firstName: parsed.given_name,
      lastName: parsed.family_name,
      // Les rôles viennent du claim realm_access.roles de l'access token.
      roles: parsed.realm_access?.roles ?? [],
      // Tout ce qui n'est pas un claim standard OIDC = attribut personnalisé Keycloak.
      attributes: Object.keys(parsed)
        .filter(key => !['sub', 'aud', 'exp', 'iat', 'realm_access', 'email', 'preferred_username', 'given_name', 'family_name', 'azp', 'scope', 'sid', 'email_verified', 'name', 'typ', 'acr', 'allowed-origins', 'session_state', 'jti', 'iss'].includes(key))
        .reduce((acc, key) => {
          acc[key] = parsed[key]
          return acc
        }, {} as Record<string, unknown>)
    }
  }
}

// [FORMATION KEYCLOAK] Initialisation de keycloak-js au démarrage de l'application.
// keycloak-js a besoin des coordonnées du serveur Keycloak et du client ID
// pour savoir où rediriger l'utilisateur lors du login.
async function init(): Promise<void> {
  if (keycloakInstance) {
    return // Déjà initialisé
  }

  keycloakInstance = new Keycloak({
    url: KEYCLOAK_URL,           // Ex : http://localhost:8080
    realm: KEYCLOAK_REALM,       // Ex : valdoria
    clientId: KEYCLOAK_CLIENT_ID // Ex : comptoir-des-voyageurs
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

    // [FORMATION KEYCLOAK] "check-sso" : au chargement de l'app, on vérifie silencieusement
    // si l'utilisateur a déjà une session SSO active dans Keycloak.
    // Si oui → il est automatiquement reconnecté sans voir la page de login.
    // Si non → l'app s'affiche en mode non connecté (pas de redirection forcée).
    // redirectUri : sans cela, keycloak-js utilise par défaut l'URL courante (ex. http://localhost:5173/)
    // comme redirect_uri pour le check-sso, ce qui oblige à autoriser toutes les routes dans Keycloak.
    // En fixant /callback, check-sso et login() utilisent la même URI → une seule à déclarer côté realm.
    const initSuccess = await keycloakInstance.init({
      onLoad: 'check-sso',
      checkLoginIframe: false, // Désactivé pour simplifier la config en environnement de formation. Nécessite que Keycloak et App soient dans le même domaine
      redirectUri: `${window.location.origin}/callback`
    })

    if (initSuccess) {
      updateTokens()

      // [FORMATION KEYCLOAK] L'access token a une durée de vie courte (5 minutes par défaut).
      // Toutes les 30 secondes, on tente de le rafraîchir s'il expire dans moins de 30 secondes.
      // keycloak-js utilise le refresh token pour obtenir un nouvel access token de Keycloak
      // sans que l'utilisateur ait à se reconnecter.
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

// [FORMATION KEYCLOAK] Le login déclenche le flux Authorization Code + PKCE :
// 1. L'app redirige vers la page de login Keycloak
// 2. L'utilisateur s'authentifie sur Keycloak
// 3. Keycloak redirige vers redirectUri avec un code d'autorisation
// 4. keycloak-js échange ce code contre les tokens (access, ID, refresh)
function login(): void {
  keycloakInstance?.login({
    redirectUri: `${window.location.origin}/callback`
  })
}

// [FORMATION KEYCLOAK] Le logout invalide la session SSO côté Keycloak.
// Cela déconnecte l'utilisateur de TOUTES les applications partageant ce realm —
// c'est le principe du Single Sign-Out (SSO).
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
