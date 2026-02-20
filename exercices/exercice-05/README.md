# Exercice 5 — Lire les parchemins de la Réserve

> **Module 2 — Gestion des clients**
> Difficulté : ★★☆☆☆ (lecture guidée)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Identifier la différence entre **access token**, **ID token** et **refresh token** dans une application réelle
- Retrouver dans un token les claims configurés dans Keycloak (rôles, attributs, audience)
- Comprendre comment une API utilise un token pour appliquer du **RBAC** et de l'**ABAC**
- Faire le lien entre la configuration Keycloak (exercices 1 à 4) et le comportement de l'application

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Les clients `comptoir-des-voyageurs` et `reserve-valdoria` doivent être créés (exercice 4 complété)
- L'application front-end doit être accessible sur **http://localhost:5173**
- L'API doit être accessible sur **http://localhost:3001**

### Prérequis de connaissances

- Avoir complété les exercices 1, 2, 3 et 4
- Connaître la notion de rôles, d'attributs et de scopes dans Keycloak

---

## Contexte narratif

> Les architectes de l'Empire ont construit le Comptoir des voyageurs et sa Réserve. Les parchemins magiques (tokens JWT) circulent entre les deux.
>
> Il est temps de **lire ces parchemins** : comprendre ce qu'ils contiennent, pourquoi ils contiennent ces informations, et comment la Réserve les interprète pour décider qui peut entrer — et jusqu'où.

---

## Étapes

### Étape 1 — Se connecter et observer les trois parchemins

#### Se connecter avec Alaric

1. Ouvrez l'application sur **http://localhost:5173**
2. Cliquez sur **« Se connecter »**
3. Sur la page de login Keycloak, connectez-vous avec :
   - **Identifiant :** `alaric`
   - **Mot de passe :** `valdoria123`
4. Vous êtes redirigé vers l'application

**Point d'observation :** Keycloak vient de déclencher le flux **Authorization Code + PKCE** :
- L'app a redirigé votre navigateur vers Keycloak
- Keycloak a vérifié vos identifiants
- Keycloak a redirigé vers `/callback` avec un code d'autorisation
- L'app a échangé ce code contre trois tokens

#### Explorer la page Debug

5. Dans le menu, cliquez sur **« Parchemins officiels (Debug) »**
6. **Observation :** Trois sections s'affichent : **Access Token**, **ID Token**, **Refresh Token**

#### Analyser l'Access Token

7. Dépliez la section **« Access Token »**
8. Regardez le **Token brut** — c'est ce que l'app envoie à l'API dans chaque requête
9. Regardez le **Token décodé** et identifiez les champs suivants :

| Champ | Valeur pour Alaric | Ce que ça signifie |
|-------|-------------------|--------------------|
| `iss` | `http://localhost:8080/realms/valdoria` | L'émetteur : notre realm Keycloak |
| `aud` | `["reserve-valdoria", "account"]` | Destinataire : cet token est fait pour l'API |
| `azp` | `comptoir-des-voyageurs` | Le client qui a demandé le token |
| `sub` | (UUID) | L'identifiant unique d'Alaric dans Keycloak |
| `realm_access.roles` | `["sujet", "marchand", "gouverneur", ...]` | Ses rôles de royaume |
| `villeOrigine` | `Valdoria-Centre` | L'attribut personnalisé (mapper exercice 4) |
| `exp` | (timestamp) | Date d'expiration |

**Point d'observation :** Ce token contient tout ce dont l'API a besoin pour décider des droits d'Alaric. Elle n'a pas besoin d'appeler Keycloak à chaque requête — le token se suffit à lui-même.

#### Comparer Access Token et ID Token

10. Dépliez la section **« ID Token »** et regardez son contenu décodé
11. Comparez avec l'Access Token :

| Ce qu'on trouve | Access Token | ID Token |
|-----------------|:---:|:---:|
| `realm_access.roles` (rôles) | ✅ | ❌ |
| `villeOrigine` (attribut) | ✅ | ❌ |
| `aud` = `reserve-valdoria` | ✅ | ❌ |
| `aud` = `comptoir-des-voyageurs` | ❌ | ✅ |
| `name`, `email`, `given_name` | ✅ | ✅ |

**Point d'observation clé :** Les deux tokens ont des rôles différents :
- L'**access token** est fait pour **l'API** (`aud = reserve-valdoria`) : il contient les droits (rôles, attributs)
- L'**ID token** est fait pour **l'application front** (`aud = comptoir-des-voyageurs`) : il contient l'identité (nom, email)

#### Observer le Refresh Token

12. Dépliez la section **« Refresh Token »**
13. **Observation :** Le token brut est présent mais le token n'est pas décodable

**Point d'observation :** Le refresh token est **opaque côté application** : l'app ne peut pas le lire. Elle l'envoie à Keycloak, qui vérifie qu'il est valide et renvoie un nouvel access token. C'est Keycloak qui gère ce secret, pas l'app.

> **Checkpoint :** Vous avez identifié les trois tokens et compris leur rôle respectif. Vous voyez les rôles et attributs configurés dans les exercices précédents apparaître dans l'access token.

---

### Étape 2 — Tester les endpoints et observer les règles d'accès

#### Tester avec Alaric (gouverneur)

1. Depuis l'application, accédez à la section de test des endpoints (page principale)
2. Testez successivement les trois endpoints :

**`GET /info`**

3. Cliquez sur **« Tester /info »**
4. **Résultat attendu :** ✅ 200 OK — informations de la Réserve

**`GET /inventaire`**

5. Cliquez sur **« Tester /inventaire »**
6. **Résultat attendu :** ✅ 200 OK — liste des ressources

**`GET /villes/valdoria-centre/artefacts`**

7. Cliquez sur **« Tester /villes/valdoria-centre/artefacts »**
8. **Résultat attendu :** ✅ 200 OK — artefacts de Valdoria-Centre

**`GET /villes/nordheim/artefacts`**

9. Testez avec la ville `nordheim`
10. **Résultat attendu :** ✅ 200 OK — Alaric est gouverneur, il a accès à toutes les villes

**Point d'observation :** Alaric accède à tout car son token contient `"gouverneur"` dans `realm_access.roles`, et le rôle composite `gouverneur` inclut `marchand` et `sujet`.

#### Tester avec Brunhild (marchande)

11. Déconnectez-vous et reconnectez-vous avec :
    - **Identifiant :** `brunhild`
    - **Mot de passe :** `valdoria123`

12. Retournez sur la page Debug et vérifiez dans l'Access Token :
    - `realm_access.roles` : contient `["sujet", "marchand", ...]`
    - `villeOrigine` : `Nordheim`

13. Testez les endpoints :

| Endpoint | Résultat | Pourquoi |
|----------|----------|----------|
| `GET /info` | ✅ 200 | Brunhild a le rôle `sujet` |
| `GET /inventaire` | ✅ 200 | Brunhild a le rôle `marchand` |
| `GET /villes/nordheim/artefacts` | ✅ 200 | Rôle `marchand` ✅ + `villeOrigine` = `Nordheim` ✅ |
| `GET /villes/sudbourg/artefacts` | ❌ 403 | Rôle `marchand` ✅ mais `villeOrigine` ≠ `sudbourg` — ABAC bloque |

**Point d'observation :** C'est ici que l'**ABAC entre en jeu**. Brunhild a le bon rôle pour les deux villes, mais le claim `villeOrigine` de son token vaut `Nordheim` : l'API refuse l'accès à `sudbourg`. Contrairement au 403 de quelqu'un sans rôle, ici le problème vient de l'attribut, pas du rôle.

Comparez avec Alaric (gouverneur) qui obtient 200 sur toutes les villes : l'exception gouverneur dans `abac.ts` court-circuite la vérification de `villeOrigine`.

> **Checkpoint :** Vous avez observé la différence entre RBAC (bloque sur le rôle) et ABAC (bloque sur l'attribut), et compris pourquoi Brunhild voit ses artefacts mais pas ceux des autres villes.

---

### Étape 3 — Lire le code qui applique ces règles

Maintenant que vous avez observé le comportement, voici le code qui le produit.

#### La vérification du token : `auth.ts`

Ouvrez le fichier : `packages/api/src/middleware/auth.ts`

Ce fichier contient le middleware `authenticateJWT`, appelé **en premier** sur toutes les routes protégées. Il fait 4 choses :

1. Extrait le token du header `Authorization: Bearer <token>`
2. Télécharge la clé publique de Keycloak via l'endpoint JWKS
3. Vérifie que la signature du token est valide (non falsifié)
4. Vérifie l'audience (`aud`) et l'issuer (`iss`)

**Repérez ce bloc :**

```typescript
jwt.verify(token, getKey, {
  audience: config.keycloak.clientId, // doit contenir "reserve-valdoria"
  issuer: getIssuer(),                // doit être "http://localhost:8080/realms/valdoria"
  algorithms: ["RS256"],
}, ...)
```

**Point d'observation :** L'API ne stocke aucun mot de passe ni secret utilisateur. Elle fait confiance à la signature de Keycloak. Si quelqu'un fabriquait un faux token, la vérification de signature échouerait.

#### Le contrôle par rôle : `rbac.ts`

Ouvrez le fichier : `packages/api/src/middleware/rbac.ts`

Ce fichier contient `requireRole(...)`, appelé après `authenticateJWT`. Il lit le claim `realm_access.roles` du token et vérifie si le rôle requis est présent.

**Repérez ces deux lignes :**

```typescript
const userRoles = req.user.realm_access?.roles || [];
const hasRole = roles.some((role) => userRoles.includes(role));
```

**Point d'observation :** `userRoles` contient exactement ce qu'on voit dans la page Debug sous `realm_access > roles`. C'est le même tableau. Si Alaric a `["sujet", "marchand", "gouverneur"]` dans son token, l'API voit exactement cela.

#### Le contrôle par attribut : `abac.ts`

Ouvrez le fichier : `packages/api/src/middleware/abac.ts`

Ce fichier contient `requireVilleAccess`, appelé après `requireRole`. Il compare le claim `villeOrigine` du token avec la ville demandée dans l'URL.

**Repérez cette logique :**

```typescript
const isGouverneur = userRoles.includes("gouverneur");
if (isGouverneur) { next(); return; } // Exception : accès à toutes les villes

const villeOrigine = req.user.villeOrigine; // Claim du token
const villeRequested = req.params.ville;    // Paramètre de l'URL

if (villeOrigine.toLowerCase() !== villeRequested.toLowerCase()) {
  res.status(403) // Ville incorrecte → accès refusé
}
```

**Point d'observation :** `req.user.villeOrigine` vient directement du token. Sa valeur (`Valdoria-Centre`, `Nordheim` ou `Sudbourg`) a été injectée par le mapper `attributs-valdorien` configuré dans l'exercice 4. L'API n'a jamais consulté de base de données : toute l'information vient du token.

#### Les routes : qui appelle quoi

Ouvrez le fichier : `packages/api/src/routes/inventaire.ts`

```typescript
router.get(
  "/inventaire",
  authenticateJWT,    // Étape 1 : token valide ?
  requireRole("marchand"), // Étape 2 : rôle marchand présent ?
  (req, res) => { ... }   // Étape 3 : renvoyer les données
);
```

Ouvrez le fichier : `packages/api/src/routes/villes.ts`

```typescript
router.get(
  "/villes/:ville/artefacts",
  authenticateJWT,         // Étape 1 : token valide ?
  requireRole("marchand"), // Étape 2 : rôle marchand présent ? (RBAC)
  requireVilleAccess,      // Étape 3 : bonne ville ? (ABAC)
  (req, res) => { ... }    // Étape 4 : renvoyer les données
);
```

**Point d'observation :** Les middlewares s'enchaînent comme des filtres. Si l'un échoue, la requête s'arrête là et renvoie une erreur. La route finale ne s'exécute que si tous les contrôles sont passés.

#### Le front-end : comment les tokens arrivent

Ouvrez le fichier : `packages/front/src/composables/useKeycloak.ts`

Repérez la fonction `init()` :

```typescript
const authenticated = await keycloakInstance.init({
  onLoad: 'check-sso', // Vérifie silencieusement si une session SSO existe
  ...
})
```

Et le rafraîchissement automatique :

```typescript
setInterval(() => {
  keycloakInstance?.updateToken(30) // Renouvelle le token s'il expire dans < 30s
}, 30000)
```

**Point d'observation :** L'access token a une durée de vie courte. keycloak-js le renouvelle automatiquement en arrière-plan grâce au refresh token. L'utilisateur ne voit rien — la session reste active.

> **Checkpoint :** Vous avez fait le lien entre la configuration Keycloak (exercices 1-4) et le code de l'application. Chaque claim du token a une origine dans Keycloak et un usage dans le code.

---

## Point clé

> **Le token JWT est le passeport de l'utilisateur.**
>
> Il est émis par Keycloak, signé cryptographiquement, et lu par l'API sans jamais rappeler Keycloak. Tout ce que l'API sait de l'utilisateur vient du token : son identité (`sub`, `preferred_username`), ses rôles (`realm_access.roles`), ses attributs (`villeOrigine`), et la destination du token (`aud`).
>
> **RBAC et ABAC sont complémentaires.**
>
> Le RBAC répond à « a-t-il le droit d'accéder à cette fonctionnalité ? » (rôle `marchand` pour l'inventaire). L'ABAC répond à « a-t-il le droit d'accéder à cette donnée spécifique ? » (sa ville pour les artefacts). Les deux contrôles s'enchaînent dans les middlewares.
>
> **La configuration Keycloak détermine le contenu du token.**
>
> Les rôles viennent du scope `roles` (mapper `realm roles`). Les attributs viennent du scope `attributs-valdorien` (mapper `User Attribute`). L'audience vient du mapper `audience resolve`. Changer la configuration dans Keycloak change immédiatement le comportement de l'API.

---

## Dépannage

| Problème | Cause probable | Solution |
|----------|---------------|----------|
| L'app affiche « non connecté » après login | Redirection `/callback` mal configurée | Vérifiez que `http://localhost:5173/callback` est dans les Valid Redirect URIs du client |
| `GET /info` renvoie 401 | Token non envoyé ou expiré | Vérifiez que l'app envoie bien le header `Authorization: Bearer ...` |
| `GET /inventaire` renvoie 403 pour Alaric | Le rôle composite `gouverneur` n'inclut pas `marchand` | Vérifiez la configuration du rôle composite dans Keycloak (exercice 2) |
| `villeOrigine` absent du token décodé | Le scope `attributs-valdorien` n'est pas assigné au client | Réalisez l'étape 5 de l'exercice 4 |
| Les rôles ne s'affichent pas dans Debug | L'access token n'est pas rafraîchi | Déconnectez-vous et reconnectez-vous |

---

## Pour aller plus loin

### Vérifier ce que l'API reçoit réellement

L'API affiche dans ses logs le contenu de `req.user` après validation du token. Dans le terminal où tourne l'API, vous pouvez ajouter temporairement un `console.log(req.user)` dans `auth.ts` pour voir le payload complet reçu à chaque requête.

### Observer la différence entre 401 et 403

Testez d'appeler l'API directement sans token (par exemple avec `curl http://localhost:3001/inventaire`) et observez le code retourné. Comparez avec un appel avec un token valide mais sans le bon rôle.

### Comprendre le JWKS

Accédez à **http://localhost:8080/realms/valdoria/protocol/openid-connect/certs** dans votre navigateur. Ce document JSON contient la clé publique que l'API télécharge au démarrage pour vérifier les signatures. C'est l'endpoint `jwks_uri` référencé dans `packages/api/src/config.ts`.
