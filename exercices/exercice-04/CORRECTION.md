# Correction — Exercice 4 : Ouvrir le Comptoir des voyageurs et sa Réserve

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Les attributs `ville_origine` sont ajoutés aux 3 utilisateurs
- [ ] Le client `comptoir-des-voyageurs` est créé (type public, Standard flow activé)
- [ ] PKCE est activé avec méthode `S256` pour le Comptoir
- [ ] Le client `reserve-valdoria` est créé (client confidentiel Resource Server)
- [ ] Le scope `profil-valdorien` est créé avec le mapper `ville-origine-mapper`
- [ ] Le scope `profil-valdorien` est assigné au client Comptoir
- [ ] Le mapper d'audience `audience-reserve-valdoria` est créé
- [ ] L'outil Evaluate affiche correctement les rôles, attributs et audience pour les 3 utilisateurs

---

## Correction détaillée

### Étape 1 — Ajouter l'attribut `ville_origine` aux utilisateurs

**Navigation exacte :**
1. Users → View all users → Cliquez sur l'utilisateur
2. Onglet « Attributes »
3. Bouton « Add attribute » (ou icône « + »)

**Valeurs attendues :**

| Utilisateur | Key | Value |
| --- | --- | --- |
| `alaric` | `ville_origine` | `Valdoria-Centre` |
| `brunhild` | `ville_origine` | `Nordheim` |
| `cedric` | `ville_origine` | `Sudbourg` |

**Points de vigilance formateur :**
- Les participants doivent respecter **exactement** la casse : `ville_origine` (avec underscore, tout en minuscules)
- Si un participant utilise `ville-origine` (tiret) ou `villeOrigine` (camelCase), le mapper ne fonctionnera pas
- Les valeurs peuvent être en majuscules (`NORDHEIM`) ou avec capitale (`Nordheim`) — aucune importance, c'est du texte libre
- **Note :** Les attributs ne sont pas typés dans Keycloak — tout est stocké comme String

**Vérification :**
- Après sauvegarde, l'attribut apparaît dans la liste avec un bouton « Delete » à côté
- Si on retourne à la liste des utilisateurs puis qu'on ré-ouvre l'utilisateur, l'attribut doit toujours être présent (test de persistance)

---

### Étape 2 — Créer le client « Comptoir des voyageurs »

**Wizard de création (Step 1: General settings) :**

| Champ | Valeur attendue |
| --- | --- |
| Client type | `OpenID Connect` |
| Client ID | `comptoir-des-voyageurs` |
| Name | `Comptoir des voyageurs` |
| Description | `Application front-end pour l'authentification des sujets de Valdoria` |

**Wizard (Step 2: Capability config) :**

| Option | Valeur attendue |
| --- | --- |
| Client authentication | OFF (désactivé) |
| Authorization | OFF (désactivé) |
| Standard flow | ✅ Coché |
| Direct access grants | ❌ Décoché |
| Implicit flow | ❌ Décoché |
| Service accounts roles | ❌ Décoché |
| OAuth 2.0 Device Authorization Grant | ❌ Décoché |

**Wizard (Step 3: Login settings) :**

| Champ | Valeur attendue |
| --- | --- |
| Root URL | `http://localhost:3000` |
| Home URL | *(vide)* |
| Valid redirect URIs | `http://localhost:3000/*` |
| Valid post logout redirect URIs | `http://localhost:3000/*` |
| Web origins | `http://localhost:3000` |

**Points de vigilance formateur :**
- **Client authentication OFF** = client **public** (pas de secret)
- Si un participant active « Client authentication », le client devient confidentiel et aura un secret — ce n'est pas ce que nous voulons pour un SPA
- **Standard flow** = Authorization Code Flow (le flux recommandé)
- **Valid redirect URIs** : le `/*` est important ! Sans lui, seule la racine `http://localhost:3000` serait autorisée
- **Web origins** : indispensable pour les appels AJAX (CORS). Si absent, le navigateur bloquera les requêtes vers Keycloak depuis le front-end

**Erreurs fréquentes :**
- Oubli du `/*` dans Valid redirect URIs → Keycloak rejettera la redirection après login
- Oubli de Web origins → Erreur CORS dans la console navigateur lors des appels aux endpoints Keycloak
- Activation de « Direct access grants » → Pas une erreur, mais expose le flux Resource Owner Password Credentials (moins sécurisé, inutile ici)

**Note sur le port 3000 :**
<!-- TODO: Vérifier le port exact utilisé par l'app front-end dans src/front — ajuster la correction si différent -->
Si l'application front-end utilise un port différent (ex : 5173 pour Vite), les participants devront adapter les URLs. Le principe reste le même.

---

### Étape 3 — Activer PKCE pour le Comptoir

**Navigation exacte :**
1. Client `comptoir-des-voyageurs` → Onglet « Advanced »
2. Défiler jusqu'à la section « Proof Key for Code Exchange Code Challenge Method »

**Valeur attendue :**
- Sélectionner : **`S256`** (dans la liste déroulante)
- Cliquer sur « Save » en haut de la page

**Points de vigilance formateur :**
- PKCE (Proof Key for Code Exchange) est **obligatoire** pour les clients publics modernes selon les bonnes pratiques OAuth 2.1
- La méthode `S256` utilise SHA-256 (plus sécurisé que `plain`)
- Si un participant laisse vide (ou sélectionne ""), PKCE sera optionnel → moins sécurisé
- **Note :** Keycloak 26.1 n'impose pas PKCE par défaut pour les clients publics — c'est une configuration manuelle

**Différence S256 vs plain :**
- `S256` : Le client génère un code_verifier aléatoire, calcule son hash SHA-256, et envoie ce hash comme code_challenge. Keycloak vérifie ensuite lors de l'échange du code.
- `plain` : Le code_verifier est envoyé directement sans hash (moins sécurisé, déconseillé)

---

### Étape 4 — Créer le client « Réserve de Valdoria »

**Wizard de création (Step 1: General settings) :**

| Champ | Valeur attendue |
| --- | --- |
| Client type | `OpenID Connect` |
| Client ID | `reserve-valdoria` |
| Name | `Réserve de Valdoria` |
| Description | `API protégée exposant les ressources du royaume` |

**Wizard (Step 2: Capability config) :**

| Option | Valeur attendue |
| --- | --- |
| Client authentication | ON (activé) |
| Authorization | OFF (désactivé) |
| Standard flow | ❌ Décoché |
| Direct access grants | ❌ Décoché |
| Implicit flow | ❌ Décoché |
| Service accounts roles | ✅ Coché |
| OAuth 2.0 Device Authorization Grant | ❌ Décoché |

**Service accounts roles activé** — c'est la configuration **Resource Server** (permet l'introspection de jetons).

**Wizard (Step 3: Login settings) :**
- Tous les champs vides (une API n'a pas d'URLs de redirection)

**Points de vigilance formateur :**
- **Client authentication ON + Service accounts roles** = Resource Server
- Cette configuration signifie : "Ce client ne démarre pas de flux d'authentification utilisateur, il valide les jetons présentés et peut faire de l'introspection"
- Si un participant coche Standard flow ou Direct access grants, le client pourrait initier des flux d'authentification utilisateur (inutile pour une API)
- **Service accounts roles** permet au client d'obtenir un token pour appeler l'endpoint d'introspection de Keycloak si nécessaire

**Note sur le secret :**
Keycloak génère automatiquement un secret pour ce client (car Client authentication = ON). Ce secret est utilisé si l'API doit faire de l'introspection de jetons via l'endpoint `/token/introspect` (grâce à Service accounts roles activé).

**Vérification :**
Après création, aller dans l'onglet « Credentials » du client `reserve-valdoria` → un secret est affiché. Notez que ce secret est regénérable.

---

### Étape 5 — Configurer les mappers pour les rôles de royaume

**Résultat attendu :**
- Le scope `roles` est déjà assigné par défaut au client `comptoir-des-voyageurs`
- Ce scope contient le mapper `realm roles` qui injecte les rôles dans `realm_access.roles`
- **Aucune création de mapper n'est nécessaire**

**Points de vigilance formateur :**
- Les participants **ne doivent rien créer** dans cette étape — il s'agit uniquement d'une **vérification**
- Si un participant tente de créer un nouveau mapper pour les rôles, expliquez que c'est redondant (le mapper existe déjà)
- **Erreur fréquente :** Chercher à créer un mapper dans le client directement, alors qu'il faut passer par les Client Scopes

**Détails du mapper `realm roles` :**

| Paramètre | Valeur |
| --- | --- |
| Mapper type | `User Realm Role` |
| Token Claim Name | `realm_access.roles` |
| Claim JSON Type | `String` |
| Add to access token | ON |
| Multivalued | ON |

**Point pédagogique :**
Ce mapper fonctionne avec les rôles composites automatiquement. Si un utilisateur a le rôle `gouverneur` (composite), Keycloak résout automatiquement tous les rôles inclus (`sujet`, `artisan`, `marchand`, `scribe`) et les ajoute **tous** dans le claim `realm_access.roles`. Aucune configuration supplémentaire n'est nécessaire pour l'héritage.

---

### Étape 6 — Créer un Client Scope personnalisé pour les attributs métier

**Création du scope :**

| Champ | Valeur attendue |
| --- | --- |
| Name | `profil-valdorien` |
| Description | `Informations métier spécifiques aux sujets de Valdoria` |
| Type | `Optional` ou `Default` (les deux fonctionnent) |
| Protocol | `OpenID Connect` |
| Display on consent screen | OFF |
| Include in token scope | ON |

**Points de vigilance formateur :**
- **Type = Optional** : le scope sera inclus seulement si demandé explicitement (param `scope=` dans la requête OAuth)
- **Type = Default** : le scope sera **toujours** inclus dans les jetons
- Pour cet exercice, les deux fonctionnent car nous assignerons le scope comme « default » au client à l'étape 7
- **Include in token scope ON** : indispensable pour que le scope apparaisse dans le claim `scope` du jeton

**Création du mapper `ville-origine-mapper` :**

| Champ | Valeur attendue |
| --- | --- |
| Name | `ville-origine-mapper` (le nom est libre) |
| Mapper type | `User Attribute` |
| User Attribute | `ville_origine` (doit correspondre exactement à l'attribut créé à l'étape 1) |
| Token Claim Name | `ville_origine` (le nom du claim dans le JWT) |
| Claim JSON Type | `String` |
| Add to ID token | OFF |
| Add to access token | ON (coché) |
| Add to userinfo | OFF |
| Multivalued | OFF |

**Points de vigilance formateur :**
- **User Attribute** et **Token Claim Name** n'ont **pas besoin** d'être identiques, mais c'est une bonne pratique pour la lisibilité
- Si un participant met `Token Claim Name = ville` au lieu de `ville_origine`, le claim s'appellera `ville` dans le jeton (ce qui fonctionne, mais est incohérent)
- **Claim JSON Type = String** : les attributs sont toujours des strings dans Keycloak, même si la valeur ressemble à un nombre
- **Add to access token ON** : l'attribut doit être dans l'access token (pas l'ID token) car c'est l'access token qui est envoyé à l'API

**Erreurs fréquentes :**
- Orthographe incorrecte de `ville_origine` (ex : `ville-origine`, `villeOrigine`) → le mapper ne trouvera pas l'attribut
- Oubli de cocher « Add to access token » → l'attribut n'apparaîtra pas dans le jeton
- Choix de « Add to ID token » au lieu de « Add to access token » → l'attribut sera dans l'ID token mais pas dans l'access token (l'API ne le verra pas)

---

### Étape 7 — Assigner le Client Scope au client Comptoir

**Navigation exacte :**
1. Clients → `comptoir-des-voyageurs` → Onglet « Client scopes »
2. Bouton « Add client scope »
3. Cocher `profil-valdorien`
4. Sélectionner « Default » (ou « Optional » selon le choix fait à l'étape 6)
5. Cliquer sur « Add »

**Résultat attendu :**
- Le scope `profil-valdorien` apparaît dans la liste **« Assigned default client scopes »** (ou « Assigned optional client scopes » si Optional choisi)

**Points de vigilance formateur :**
- **Default vs Optional** :
  - **Default** : le scope est inclus automatiquement dans tous les jetons, sans besoin de le demander explicitement
  - **Optional** : le scope n'est inclus que si l'application le demande via le paramètre `scope=profil-valdorien` dans la requête OAuth
- Pour cet exercice, **Default** est recommandé pour simplifier (pas besoin de modifier les requêtes OAuth de l'app)
- Si un participant choisit « Optional », il devra ajouter `scope=openid profil-valdorien` dans les requêtes OAuth de l'app front-end

**Vérification :**
Retourner dans la liste des Client scopes du client → `profil-valdorien` doit être listé avec le badge « Default » ou « Optional ».

---

### Étape 8 — Configurer l'audience pour la Réserve

**Navigation vers le scope dédié :**
1. Clients → `comptoir-des-voyageurs` → Onglet « Client scopes »
2. Chercher le scope nommé **`comptoir-des-voyageurs-dedicated`** (ou similaire selon la version de Keycloak)
3. Cliquer dessus

**Note formateur :** Le scope dédié est automatiquement créé pour chaque client. Il porte généralement le nom `{client-id}-dedicated`. C'est un scope spécifique au client (non partagé avec d'autres clients).

**Création du mapper d'audience :**

| Champ | Valeur attendue |
| --- | --- |
| Name | `audience-reserve-valdoria` (nom libre) |
| Mapper type | `Audience` |
| Included Client Audience | `reserve-valdoria` (sélectionner dans la liste déroulante) |
| Add to ID token | OFF |
| Add to access token | ON (coché) |

**Points de vigilance formateur :**
- **Included Client Audience** : c'est une liste déroulante qui affiche tous les clients du realm. Le participant doit sélectionner `reserve-valdoria`.
- Si un participant ne voit pas `reserve-valdoria` dans la liste, vérifier que le client a bien été créé à l'étape 4
- **Différence avec Included Custom Audience** : Custom Audience permet d'ajouter une audience arbitraire (texte libre), tandis que Included Client Audience ajoute le client ID d'un client existant
- **Add to access token ON** : l'audience doit être dans l'access token (pas l'ID token) car c'est l'access token qui est envoyé à l'API

**Résultat attendu dans le jeton :**
```json
{
  "aud": ["reserve-valdoria", "account"]
}
```

**Note :** Le claim `aud` peut être soit une string (si une seule audience), soit un array (si plusieurs audiences). Keycloak ajoute souvent `account` automatiquement (via le mapper `audience resolve` du scope `roles`).

**Pourquoi `account` est également présent ?**
Le mapper `audience resolve` du scope `roles` détecte automatiquement que l'utilisateur a des rôles sur le client `account` (`manage-account`, `manage-account-links`) et ajoute donc `account` comme audience. Ce comportement est normal et attendu.

---

### Étape 9 — Tester avec l'outil Evaluate

**Navigation exacte :**
1. Clients → `comptoir-des-voyageurs` → Onglet « Client scopes » → Sous-onglet « Evaluate »
2. Champ « Users » : sélectionner `brunhild`
3. Champ « Audience target » : laisser vide (ou saisir `reserve-valdoria`)
4. Bouton « Generated access token »

**Jeton attendu pour Brunhild :**

```json
{
  "exp": 1771340000,
  "iat": 1771339700,
  "iss": "http://localhost:8080/realms/valdoria",
  "aud": ["reserve-valdoria", "account"],
  "sub": "a3b2c1d4-e5f6-7890-abcd-ef1234567890",
  "typ": "Bearer",
  "azp": "comptoir-des-voyageurs",
  "preferred_username": "brunhild",
  "email": "brunhild@valdoria.empire",
  "email_verified": true,
  "given_name": "Brunhild",
  "family_name": "le Maître forgeron",
  "name": "Brunhild le Maître forgeron",
  "realm_access": {
    "roles": [
      "maitre-forgeron",
      "artisan",
      "sujet",
      "offline_access",
      "default-roles-valdoria",
      "uma_authorization"
    ]
  },
  "ville_origine": "Nordheim",
  "resource_access": {
    "account": {
      "roles": ["manage-account", "manage-account-links"]
    }
  },
  "scope": "openid profile email profil-valdorien"
}
```

**Points de validation formateur :**

**1. Audience (`aud`) :**
- ✅ Doit contenir `reserve-valdoria`
- ✅ Peut contenir `account` (normal)
- ❌ Si absent : le mapper `audience-reserve-valdoria` n'a pas été créé ou mal configuré

**2. Rôles de royaume (`realm_access.roles`) :**
- ✅ Brunhild doit avoir : `maitre-forgeron`, `artisan`, `sujet`
- ✅ Les rôles par défaut sont également présents : `offline_access`, `default-roles-valdoria`, `uma_authorization`
- ❌ Si les rôles sont absents : le scope `roles` n'est pas assigné au client

**3. Attribut `ville_origine` :**
- ✅ Doit être présent à la racine du jeton avec la valeur `Nordheim`
- ❌ Si absent : le mapper `ville-origine-mapper` n'est pas créé ou le scope `profil-valdorien` n'est pas assigné
- ❌ Si `null` : l'attribut n'existe pas sur l'utilisateur Brunhild (retourner à l'étape 1)

**4. Scope (`scope`) :**
- ✅ Doit contenir `profil-valdorien` si le scope est assigné
- Si absent : le scope est assigné comme « Optional » mais non demandé explicitement

**Jeton attendu pour Cedric :**

```json
{
  "realm_access": {
    "roles": [
      "artisan",
      "sujet",
      "offline_access",
      "default-roles-valdoria",
      "uma_authorization"
    ]
  },
  "ville_origine": "Sudbourg"
}
```

**Point clé :** Cedric a **uniquement** `artisan` et `sujet` — il n'a **pas** `maitre-forgeron` ni `marchand`.

**Jeton attendu pour Alaric :**

```json
{
  "realm_access": {
    "roles": [
      "gouverneur",
      "sujet",
      "artisan",
      "marchand",
      "scribe",
      "maitre-forgeron",
      "offline_access",
      "default-roles-valdoria",
      "uma_authorization"
    ]
  },
  "ville_origine": "Valdoria-Centre"
}
```

**Point clé :** Alaric possède **TOUS** les rôles métier grâce au rôle composite `gouverneur`. Notez que `maitre-forgeron` apparaît également car il est lui-même un composite (inclut `artisan` + `sujet`).

**Note formateur sur l'ordre des rôles :**
L'ordre d'affichage des rôles dans le claim `realm_access.roles` n'est **pas significatif** et peut varier selon la version de Keycloak. Ce qui importe, c'est que tous les rôles attendus soient présents.

---

### Étape 10 — Simuler le contrôle d'accès de la Réserve

**Tableau récapitulatif des accès attendus :**

| Utilisateur | Rôles | Accès `/infos` | Accès `/inventaire` |
| --- | --- | --- | --- |
| Alaric | `gouverneur` (composite) → inclut `marchand` | ✅ Autorisé | ✅ Autorisé |
| Brunhild | `maitre-forgeron` (composite) → **n'inclut PAS** `marchand` | ✅ Autorisé | ❌ REFUSÉ |
| Cedric | `artisan` | ✅ Autorisé | ❌ REFUSÉ |

**Points de discussion formateur :**

**Question 1 :** Pourquoi Brunhild (maître-forgeron) ne peut-elle pas accéder à `/inventaire` ?
- **Réponse attendue :** Le rôle `maitre-forgeron` hérite de `artisan` et `sujet`, mais **pas** de `marchand`. L'endpoint `/inventaire` requiert explicitement le rôle `marchand`. L'API vérifie la présence de `marchand` dans `realm_access.roles` et rejette la requête si absent.

**Question 2 :** Comment l'API sait-elle quel rôle vérifier ?
- **Réponse attendue :** C'est la logique métier de l'API (codée dans le backend). Par exemple, en Node.js avec Express :
  ```javascript
  app.get('/inventaire', verifyToken, requireRole('marchand'), (req, res) => {
    // ... logique métier
  });
  ```
  La fonction `requireRole` extrait `realm_access.roles` du jeton JWT et vérifie la présence du rôle requis.

**Question 3 :** Pourquoi Alaric peut-il accéder alors qu'il est gouverneur, pas marchand ?
- **Réponse attendue :** Le rôle composite `gouverneur` **inclut** le rôle `marchand` (configuré dans l'exercice 2). Keycloak résout automatiquement cette hiérarchie et ajoute `marchand` dans le claim `realm_access.roles` du jeton d'Alaric. L'API voit donc le rôle `marchand` présent, même si Alaric ne l'a pas directement assigné.

**Scénario de filtrage par `ville_origine` :**

**Question :** Si Alaric (ville : `Valdoria-Centre`) appelle `GET /villes/nordheim/artefacts`, que devrait faire l'API ?

**Réponse (logique métier — plusieurs approches possibles) :**

**Approche A — Strict (recommandé pour cet exercice) :**
- L'API lit le claim `ville_origine` du jeton → `Valdoria-Centre`
- L'API compare avec le paramètre de route `{id}` → `nordheim`
- Les valeurs ne correspondent pas → **HTTP 403 Forbidden**

**Approche B — Filtrage automatique :**
- L'API ignore le paramètre `{id}` de la route
- L'API lit `ville_origine` du jeton → `Valdoria-Centre`
- L'API retourne **uniquement** les artefacts de `Valdoria-Centre`, quel que soit le `{id}` demandé

**Approche C — Gouverneur omniscient :**
- L'API détecte le rôle `gouverneur` dans le jeton
- Si `gouverneur` présent → autoriser l'accès à **toutes** les villes (pas de filtrage)
- Sinon → appliquer le filtrage par `ville_origine`

**Note formateur :** L'approche exacte dépend des règles métier de l'application. Dans cet exercice, nous nous concentrons sur la **présence** de l'attribut `ville_origine` dans le jeton, pas sur l'implémentation backend complète.

---

### Étape 11 — Observer l'audience dans différents contextes

**Test 1 : Audience explicite**

| Champ | Valeur |
| --- | --- |
| Users | `alaric` |
| Audience target | `reserve-valdoria` |

**Résultat attendu :**
```json
{
  "aud": ["reserve-valdoria", "account"]
}
```

**Test 2 : Audience par défaut (champ vide)**

| Champ | Valeur |
| --- | --- |
| Users | `alaric` |
| Audience target | *(vide)* |

**Résultat attendu :**
```json
{
  "aud": ["reserve-valdoria", "account"]
}
```

**Point de discussion formateur :**
Grâce au mapper `audience-reserve-valdoria` créé à l'étape 8, le claim `aud` contient **toujours** `reserve-valdoria`, même sans spécifier explicitement l'audience dans l'outil Evaluate. C'est le comportement souhaité : le Comptoir demande toujours des jetons pour la Réserve.

**Cas d'usage réel :**
Dans une application OAuth réelle, le client (Comptoir) peut demander un jeton pour une audience spécifique via le paramètre `audience` dans la requête au `/token` endpoint. Keycloak vérifie alors que le client a bien le droit de demander cette audience (via les mappers configurés).

---

### Étape 12 — Récapitulatif de la configuration

**Synthèse à afficher au tableau (ou slide) :**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE VALDORIA                        │
└─────────────────────────────────────────────────────────────────┘

   Comptoir des voyageurs                  Réserve de Valdoria
   (comptoir-des-voyageurs)                (reserve-valdoria)

   Type: Public (SPA)                      Type: Client confidentiel (Resource Server)
   Flux: Authorization Code + PKCE        Flux: Service accounts (validation + introspection)

   ┌─────────────────┐                    ┌─────────────────┐
   │ Utilisateur     │                    │ GET /infos      │
   │ se connecte     │───── jeton JWT ────>│ GET /inventaire │
   └─────────────────┘                    │ GET /artefacts  │
                                          └─────────────────┘

   Contenu du jeton JWT :
   ┌────────────────────────────────────────────────┐
   │ aud: ["reserve-valdoria", "account"]           │
   │ azp: "comptoir-des-voyageurs"                  │
   │ realm_access.roles: ["marchand", "artisan"...] │
   │ ville_origine: "Nordheim"                      │
   └────────────────────────────────────────────────┘
```

---

## Points pédagogiques clés

### 1. Client public vs client confidentiel (Resource Server)

**Client public (Comptoir) :**
- Pas de secret (Client authentication = OFF)
- Initie des flux d'authentification (Standard flow)
- Obtient des jetons au nom des utilisateurs
- Exemple : applications web (React, Vue, Angular), applications mobiles

**Client confidentiel Resource Server (Réserve) :**
- Possède un secret (Client authentication = ON)
- N'initie pas de flux d'authentification utilisateur
- Valide les jetons reçus et peut faire de l'introspection (Service accounts roles)
- Exemple : APIs REST, microservices backend

### 2. PKCE (Proof Key for Code Exchange)

**Pourquoi PKCE est indispensable :**
- Les clients publics (SPA) ne peuvent pas stocker de secret de manière sécurisée (le code JavaScript est visible)
- Sans PKCE, un attaquant pourrait intercepter le code d'autorisation (dans l'URL de redirection) et l'échanger contre un jeton
- PKCE ajoute une preuve cryptographique (code_verifier + code_challenge) que seul le client légitime peut fournir

**Flux simplifié avec PKCE :**
1. Client génère un `code_verifier` aléatoire
2. Client calcule `code_challenge = SHA256(code_verifier)`
3. Client demande le code d'autorisation avec `code_challenge`
4. Keycloak retourne le code d'autorisation
5. Client échange le code + `code_verifier` contre un jeton
6. Keycloak vérifie que `SHA256(code_verifier) == code_challenge` stocké
7. Si OK → jeton émis, sinon → erreur

### 3. Mappers et Client Scopes

**Client Scopes = ensembles réutilisables de mappers**
- Les scopes par défaut (`profile`, `email`, `roles`) sont partagés entre tous les clients du realm
- Les scopes personnalisés (`profil-valdorien`) permettent d'ajouter des informations métier spécifiques
- Les scopes dédiés (`comptoir-des-voyageurs-dedicated`) sont propres à un seul client

**Types de mappers fréquents :**

| Type de mapper | Fonction | Exemple |
| --- | --- | --- |
| `User Attribute` | Injecte un attribut utilisateur | `ville_origine` |
| `User Realm Role` | Injecte les rôles de royaume | `realm_access.roles` |
| `User Client Role` | Injecte les rôles d'un client spécifique | `resource_access.account.roles` |
| `Audience` | Ajoute une audience au jeton | `aud: "reserve-valdoria"` |
| `Hardcoded claim` | Ajoute une valeur fixe | `app_version: "1.0"` |
| `Group Membership` | Injecte les groupes de l'utilisateur | `groups: ["/guilde-marchands"]` |

### 4. Concept d'audience (`aud`)

**À quoi sert l'audience ?**
- Indique **pour quelle API** le jeton est destiné
- Permet à l'API de vérifier que le jeton lui est bien adressé (protection contre les attaques par rejeu)
- Une API ne doit **jamais** accepter un jeton dont elle n'est pas l'audience

**Exemple d'attaque sans vérification d'audience :**
1. Attaquant obtient un jeton pour l'API `payments.example.com`
2. Attaquant présente ce jeton à l'API `admin.example.com`
3. Sans vérification d'audience, `admin.example.com` pourrait accepter le jeton (car signature valide)
4. Avec vérification d'audience, `admin.example.com` rejette le jeton (car `aud != admin.example.com`)

---

## Questions fréquentes des participants

### Q1 : Pourquoi le jeton contient-il `account` dans l'audience alors que nous n'utilisons pas ce client ?

**Réponse :**
Le mapper `audience resolve` du scope `roles` ajoute automatiquement dans le claim `aud` tous les clients pour lesquels l'utilisateur possède des rôles de client. Tous les utilisateurs de Valdoria ont les rôles `manage-account` et `manage-account-links` sur le client `account` (attribués automatiquement par Keycloak), donc `account` est ajouté comme audience.

### Q2 : Est-ce qu'on doit vraiment créer un mapper pour l'audience, ou est-ce que `audience resolve` suffit ?

**Réponse :**
`audience resolve` fonctionne **uniquement** si l'utilisateur a des rôles de client sur l'API cible. Dans notre cas, les utilisateurs n'ont **pas** de rôles sur le client `reserve-valdoria` (c'est un Resource Server, il n'a pas de rôles de client définis pour les utilisateurs finaux). Sans le mapper manuel `audience-reserve-valdoria`, le jeton ne contiendrait **pas** `reserve-valdoria` dans `aud`. Le mapper manuel **force** l'ajout de cette audience, quel que soit l'utilisateur.

### Q3 : Pourquoi mettre l'attribut `ville_origine` dans l'access token et pas l'ID token ?

**Réponse :**
- **ID token** : Jeton d'**identité** utilisé par le client (Comptoir) pour identifier l'utilisateur après authentification. Contient les infos de base (nom, email). Le client lit l'ID token, l'API **ne le voit jamais**.
- **Access token** : Jeton d'**autorisation** envoyé à l'API pour accéder aux ressources. L'API lit l'access token pour vérifier les droits et extraire les informations contextuelles (rôles, attributs). Le client ne lit généralement **pas** l'access token (opaque pour lui).

Donc : attributs utiles à l'API → access token. Attributs utiles au client → ID token.

### Q4 : Est-ce que l'API vérifie vraiment la signature du jeton ou elle fait confiance aveuglément ?

**Réponse :**
En production, l'API **doit** vérifier :
1. **Signature** : le jeton a bien été émis par Keycloak (vérification avec la clé publique)
2. **Expiration** (`exp`) : le jeton n'est pas expiré
3. **Audience** (`aud`) : le jeton est bien destiné à cette API
4. **Issuer** (`iss`) : le jeton provient bien du realm attendu

Les librairies modernes (Spring Security, Passport.js, etc.) font ces vérifications automatiquement. L'API télécharge la clé publique depuis l'endpoint JWKS de Keycloak (`http://localhost:8080/realms/valdoria/protocol/openid-connect/certs`) et valide localement la signature, sans appeler Keycloak à chaque requête.

**Alternative : Introspection**
Certaines APIs appellent l'endpoint `/token/introspect` de Keycloak pour valider le jeton côté serveur. C'est plus sécurisé (révocation immédiate) mais plus lent (requête HTTP à chaque fois).

### Q5 : Pourquoi PKCE avec `S256` et pas `plain` ?

**Réponse :**
`plain` envoie le `code_verifier` en clair comme `code_challenge`. Si un attaquant intercepte la première requête (vers `/authorize`), il voit le `code_verifier` et peut l'utiliser pour échanger le code d'autorisation intercepté.

`S256` envoie `SHA256(code_verifier)` comme `code_challenge`. Même si l'attaquant intercepte cette requête, il ne peut pas retrouver le `code_verifier` original à partir du hash SHA-256 (fonction à sens unique). Donc il ne peut pas échanger le code d'autorisation.

**Analogie :** C'est comme donner l'empreinte digitale (hash) au lieu de la main entière. Même si on voit l'empreinte, on ne peut pas recréer la main.

---

## Dépannage — Erreurs fréquentes

### Erreur 1 : L'attribut `ville_origine` n'apparaît pas dans le jeton

**Causes possibles :**
1. L'attribut n'existe pas sur l'utilisateur (vérifier Users → Attributes)
2. Le mapper n'est pas créé (vérifier Client scopes → `profil-valdorien` → Mappers)
3. Le scope `profil-valdorien` n'est pas assigné au client (vérifier Clients → `comptoir-des-voyageurs` → Client scopes → Assigned)
4. Le champ `User Attribute` du mapper ne correspond pas au nom de l'attribut (casse, orthographe)

**Solution :**
Vérifier chaque étape dans l'ordre. L'outil Evaluate permet de debugger facilement.

### Erreur 2 : Le claim `aud` ne contient pas `reserve-valdoria`

**Causes possibles :**
1. Le mapper `audience-reserve-valdoria` n'a pas été créé
2. Le mapper a été créé au mauvais endroit (scope global au lieu du scope dédié)
3. Le mapper a été créé mais « Add to access token » est désactivé

**Solution :**
Vérifier Clients → `comptoir-des-voyageurs` → Client scopes → Dedicated scope → Mappers → `audience-reserve-valdoria` → Add to access token = ON

### Erreur 3 : Les rôles de royaume n'apparaissent pas dans le jeton

**Causes possibles :**
1. Le scope `roles` a été retiré des scopes assignés au client
2. L'utilisateur n'a pas de rôle assigné (vérifier Users → Role mapping)

**Solution :**
Vérifier Clients → `comptoir-des-voyageurs` → Client scopes → Assigned default client scopes → `roles` doit être présent

### Erreur 4 : Le client `comptoir-des-voyageurs` a un onglet « Credentials » avec un secret

**Cause :**
« Client authentication » a été activé par erreur → le client est devenu confidentiel au lieu de public

**Solution :**
Clients → `comptoir-des-voyageurs` → Settings → Client authentication = OFF → Save

### Erreur 5 : L'outil Evaluate ne génère rien

**Causes possibles :**
1. Aucun utilisateur sélectionné dans le champ « Users »
2. Problème de session (déconnexion admin)

**Solution :**
Sélectionner un utilisateur dans la liste déroulante « Users » avant de cliquer sur « Generated access token »

---

## Points d'attention pour le formateur

### Timing de l'exercice

**Durée estimée : 45 minutes**

Répartition :
- Étape 1 (attributs) : 5 min
- Étapes 2-3 (client Comptoir + PKCE) : 10 min
- Étape 4 (client Réserve) : 5 min
- Étapes 5-6-7 (scopes et mappers) : 15 min
- Étape 8 (audience) : 5 min
- Étapes 9-10-11 (Evaluate et tests) : 10 min
- Étape 12 (récapitulatif) : 5 min

**Points de ralentissement fréquents :**
- Configuration des mappers (beaucoup de champs, risque d'erreur)
- Compréhension du scope dédié vs scopes globaux
- Analyse des jetons dans l'outil Evaluate (première fois)

### Opportunités de discussion

**Pause après l'étape 4 :**
Expliquer la différence fondamentale entre client public (front) et client confidentiel Resource Server (API). Dessiner le flux au tableau :
```
Utilisateur → Comptoir → Keycloak → Code → Comptoir → Jeton → Réserve
```

**Pause après l'étape 8 :**
Discuter du concept d'audience et des risques de sécurité sans vérification d'audience (attaques par rejeu de jetons).

**Pause après l'étape 9 :**
Montrer un vrai jeton JWT décodé sur jwt.io. Expliquer les 3 parties (header, payload, signature).

### Variantes pédagogiques

**Variante A — Simplifiée (pour débutants) :**
- Supprimer l'étape 8 (audience) et utiliser uniquement `audience resolve` automatique
- Supprimer l'étape 6 (attribut `ville_origine`) et se concentrer uniquement sur les rôles
- Durée : 30 min

**Variante B — Approfondie (pour avancés) :**
- Ajouter une étape de test avec Postman (obtenir un jeton via Authorization Code Flow)
- Ajouter une étape de validation de signature JWT en Python/Node.js
- Ajouter une discussion sur les refresh tokens et leur rotation
- Durée : 60-75 min

### TODO pour les prochaines versions de l'exercice

- Vérifier le port exact utilisé par l'app front-end dans `src/front` (actuellement supposé 3000)
- Confirmer la logique métier exacte du filtrage par `ville_origine` (strict, filtrage auto, ou gouverneur omniscient)
- Vérifier le nom exact du scope dédié dans Keycloak 26.1 (`comptoir-des-voyageurs-dedicated` à confirmer)
- Ajouter des screenshots pour l'étape 8 (création du mapper d'audience dans le scope dédié)
