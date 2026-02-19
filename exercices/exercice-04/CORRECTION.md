# Correction — Exercice 4 : Ouvrir le Comptoir des voyageurs et sa Réserve

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Client `comptoir-des-voyageurs` créé (public, Standard flow, PKCE S256)
- [ ] Client `reserve-valdoria` créé (confidentiel, Service accounts roles activé)
- [ ] Mapper `realm roles` du scope `roles` vérifié (pas de création nécessaire)
- [ ] Scope `attributs-valdorien` créé avec le mapper `ville-origine-mapper`
- [ ] Scope `attributs-valdorien` assigné au client Comptoir (type Default)
- [ ] Client role `access` créé sur `reserve-valdoria` et inclus dans le rôle composite `sujet`
- [ ] Outil Evaluate : les 3 utilisateurs ont bien les rôles, `villeOrigine` et `reserve-valdoria` dans `aud`

---

## Correction détaillée

### Étape 1 — Créer le client « Comptoir des voyageurs »

**Points de vigilance :**

- **Client authentication OFF** = client **public** (pas de secret). Si activé par erreur, le client devient confidentiel et l'onglet « Credentials » apparaît — ce n'est pas ce que l'on veut pour un SPA.
- **Standard flow uniquement** : tous les autres flux doivent être décochés. Direct access grants expose un flux moins sécurisé (Resource Owner Password Credentials), inutile ici.
- **PKCE S256** : configurable dans l'étape « Capability config » du wizard. Si absent, le participant peut aller dans l'onglet **« Advanced »** du client après création (section « Proof Key for Code Exchange Code Challenge Method »).
- **Valid redirect URIs** : le `/*` est indispensable. Sans lui, seule la racine exacte est autorisée et Keycloak rejettera les redirections après login.
- **Web origins** : indispensable pour les appels AJAX (CORS). Si absent, le navigateur bloquera les requêtes vers Keycloak depuis le front-end.

---

### Étape 2 — Créer le client « Réserve de Valdoria »

**Points de vigilance :**

- **Client authentication ON + Service accounts roles** = configuration Resource Server. Ce client valide les jetons, il n'initie pas de flux d'authentification utilisateur.
- Tous les flux d'authentification (Standard flow, Direct access grants…) doivent être décochés — une API n'a pas d'URLs de redirection.
- Après création, un secret est visible dans l'onglet « Credentials » (utilisable pour l'introspection de jetons).

---

### Étape 3 — Vérifier les mappers pour les rôles de royaume

**Point clé :** Les participants **ne créent rien** ici — il s'agit d'observer que le mapper `realm roles` existe déjà dans le scope `roles`.

**Points de vigilance :**

- Erreur fréquente : chercher à créer un mapper directement sur le client. Les mappers sont portés par les **Client Scopes**, pas par les clients eux-mêmes.
- Le mapper `realm roles` résout automatiquement les rôles composites : si un utilisateur a `gouverneur`, Keycloak inclut `sujet` et `marchand` dans `realm_access.roles` sans configuration supplémentaire.

---

### Étape 4 — Créer un Client Scope personnalisé pour les attributs

**Points de vigilance :**

- **User Attribute** doit correspondre **exactement** au nom de l'attribut créé dans l'exercice 3 : `villeOrigine` (camelCase, case-sensitive). `ville-origine` ou `VilleOrigine` ne fonctionneront pas.
- **Add to access token ON** : l'attribut doit être dans l'access token (pas l'ID token), car c'est l'access token qui est envoyé à l'API.

---

### Étape 5 — Assigner le Client Scope au client Comptoir

**Points de vigilance :**

- **Default vs Optional** :
  - **Default** : scope inclus automatiquement dans tous les jetons (recommandé pour cet exercice)
  - **Optional** : inclus uniquement si l'application le demande via `scope=attributs-valdorien`
- Vérifier que le scope apparaît dans la liste avec le type **Default** après assignation.

---

### Étape 6 — Configurer l'audience pour la Réserve

**Point clé :** L'audience est configurée via le mécanisme **`audience resolve`** (déjà présent dans le scope `roles`) combiné à un client role sur `reserve-valdoria` inclus dans le rôle composite `sujet`.

**Points de vigilance :**

- Le mapper `audience resolve` ajoute automatiquement dans `aud` les clients pour lesquels l'utilisateur possède des **rôles de client**. Il faut donc que les utilisateurs aient un rôle de client sur `reserve-valdoria`.
- En incluant le client role `access` dans le rôle composite `sujet`, tous les utilisateurs avec `sujet` (directement ou par héritage) obtiendront automatiquement ce rôle → `reserve-valdoria` apparaîtra dans leur `aud`.
- Navigation pour ajouter le rôle : **« Realm roles »** → `sujet` → **« Associated roles »** → **« Assign role »** → filtrer par « Client roles » → sélectionner `reserve-valdoria > access`.

---

### Étape 7 — Tester avec l'outil Evaluate

**Résultats attendus :**

| Utilisateur | Rôles dans `realm_access.roles` | `villeOrigine` | `aud` contient `reserve-valdoria` |
| --- | --- | --- | --- |
| `brunhild` | `marchand`, `sujet` | `Nordheim` | ✅ |
| `cedric` | `sujet` | `Sudbourg` | ✅ |
| `alaric` | `gouverneur`, `marchand`, `sujet` | `Valdoria-Centre` | ✅ |

**Points de vigilance :**

- Si `villeOrigine` est `null` ou absent : l'attribut n'est pas défini sur l'utilisateur (vérifier exercice 3) ou le mapper cible un nom incorrect.
- Si `reserve-valdoria` est absent de `aud` : vérifier que le client role `access` est bien inclus dans le rôle `sujet`.
- `account` apparaît également dans `aud` — c'est normal (les utilisateurs ont des rôles sur le client `account` attribués automatiquement par Keycloak).

---

### Étape 8 — Simuler le contrôle d'accès de la Réserve

**Résultats attendus :**

| Utilisateur | Rôles | Accès `/inventaire` (requiert `marchand`) |
| --- | --- | --- |
| `alaric` | `gouverneur` (composite → inclut `marchand`) | ✅ Autorisé |
| `brunhild` | `sujet` | ❌ Refusé |

**Points de discussion :**

- **Comment l'API vérifie les rôles ?** Elle extrait `realm_access.roles` du jeton JWT et vérifie la présence du rôle requis. C'est la logique métier du backend (middleware d'autorisation).
- **Filtrage par `villeOrigine`** : l'attribut permet à l'API de filtrer les données contextuellement (ex : `GET /villes/{id}/artefacts` ne retourne que les artefacts de la ville d'origine du sujet). Ce n'est pas un contrôle d'accès mais un filtrage de données.

---

### Étape 9 — Observer l'audience dans différents contextes

**Point de vigilance :** Les deux tests (audience explicite et audience par défaut) produisent le même résultat grâce au mapper `audience resolve` et au client role inclus dans `sujet`. C'est le comportement souhaité.

---

## Erreurs courantes

| Erreur | Cause | Solution |
| --- | --- | --- |
| `villeOrigine` absent du jeton | Attribut absent sur l'utilisateur ou orthographe incorrecte dans le mapper | Vérifier Users > Attributes et le champ `User Attribute` du mapper |
| `reserve-valdoria` absent de `aud` | Client role `access` non créé ou non inclus dans le rôle `sujet` | Vérifier Realm roles > `sujet` > Associated roles |
| Les rôles realm absents du jeton | Scope `roles` non assigné au client | Vérifier Clients > comptoir > Client scopes > Setup > `roles` en Default |
| Client avec onglet « Credentials » visible | Client authentication activé par erreur | Settings > Client authentication = OFF |
| PKCE non visible dans le wizard | Option dans une autre section | Onglet Advanced du client, section « Proof Key for Code Exchange Code Challenge Method » |

---

## Points de discussion

### 1. Client public vs client confidentiel Resource Server

**Client public (Comptoir) :**
- Pas de secret (code JavaScript visible dans le navigateur)
- Initie des flux d'authentification (Standard flow + PKCE)
- Exemple : SPA React/Vue/Angular, application mobile

**Client confidentiel Resource Server (Réserve) :**
- Possède un secret (utilisé pour l'introspection)
- Ne gère pas l'authentification utilisateur : valide les jetons reçus
- Exemple : API REST, microservices backend

### 2. PKCE et sa nécessité pour les clients publics

Sans PKCE, un attaquant interceptant le code d'autorisation (dans l'URL de redirection) peut l'échanger contre un jeton. PKCE ajoute un `code_verifier` aléatoire dont seul le client légitime connaît la valeur. `S256` envoie le hash SHA-256 du verifier (non réversible), contrairement à `plain` qui l'envoie en clair.

### 3. Audience et sécurité

Sans vérification d'audience, une API pourrait accepter un jeton destiné à une autre API (attaque par rejeu). En vérifiant que `aud` contient son propre client ID, l'API s'assure que le jeton lui est bien destiné.

### 4. Rôles vs attributs : rappel

- **Rôle** : contrôle l'accès (peut/ne peut pas accéder à une ressource)
- **Attribut** : enrichit le contexte (quelles données montrer à cet utilisateur)

---

## Transition vers l'exercice 5

L'exercice 4 a permis de :
- ✅ Créer et distinguer un client public (SPA) et un client confidentiel (Resource Server)
- ✅ Configurer les mappers pour les rôles de royaume, attributs et audience
- ✅ Utiliser l'outil Evaluate pour prévisualiser et valider les jetons
- ✅ Comprendre comment l'API utilise les rôles et attributs du jeton

**L'exercice 5** abordera les flux OIDC en pratique : obtenir un jeton via Authorization Code, tester le refresh token et l'introspection via Postman.
