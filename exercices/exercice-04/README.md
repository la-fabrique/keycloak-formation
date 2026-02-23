# Exercice 4 — Ouvrir le Comptoir des voyageurs et sa Réserve

> **Module 2 — Gestion des clients**
> Durée estimée : 45 minutes | Difficulté : ★★★☆☆ (intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer et configurer un client **public** (SPA) pour une application front-end
- Créer et configurer un client **confidentiel (Resource Server)** pour une API protégée
- Comprendre le flux **Authorization Code avec PKCE**
- Configurer des **mappers** pour inclure les rôles de royaume dans les jetons
- Configurer un **mapper** pour injecter des attributs personnalisés dans les jetons
- Utiliser l'outil **Evaluate** pour vérifier le contenu des jetons avant déploiement
- Comprendre le concept d'**audience** (`aud`) dans les jetons JWT

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit être créé avec les rôles (exercice 2 complété)
- Les utilisateurs doivent être créés avec leurs rôles (exercice 3 complété)
- Accès à la console d'administration de Keycloak

### Prérequis de connaissances

- Avoir complété les exercices 1, 2 et 3
- Comprendre la notion de rôles de royaume et rôles composites
- Connaître la différence entre un client public et un client confidentiel
---

## Contexte narratif

> La province de Valdoria a besoin d'un comptoir pour accueillir ses sujets et protéger ses ressources.
>
> Les administrateurs de l'Empire ouvrent le **Comptoir des voyageurs**  — l'application front-end où les sujets se présentent pour obtenir leur laissez-passer numérique (jeton JWT). Ce comptoir est un lieu public : n'importe qui peut s'y rendre, mais seuls les sujets authentifiés reçoivent un laissez-passer.
>
> Ils sécurisent ensuite la **Réserve** — l'API qui détient les ressources précieuses du royaume. La Réserve ne laisse entrer que les sujets porteurs d'un laissez-passer valide. Certaines salles de la Réserve (comme l'inventaire) ne sont accessibles qu'aux marchands.
>
> Les administrateurs apprennent une règle fondamentale : **le Comptoir demande des laissez-passer au nom de la Réserve**. C'est le concept d'**audience** : un jeton émis pour le Comptoir est destiné à être utilisé auprès de la Réserve.

---

## Étapes

### Étape 1 — Créer le client « Comptoir des voyageurs » (front-end)

Le Comptoir des voyageurs est l'application front-end qui permet aux sujets de s'authentifier. C'est un client **public** (type SPA — Single Page Application).

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur **« Create client »**

#### Configuration de base (Step 1: General settings)

3. Remplissez les champs :
   - **Client type :** `OpenID Connect`
   - **Client ID :** `comptoir-des-voyageurs`
   - **Name :** `Comptoir des voyageurs`
   - **Description :** `Application front-end pour l'authentification des sujets de Valdoria afin d'accéder aux ressources de la réserve`
4. Laissez les autres options par défaut
5. Cliquez sur **« Next »**

#### Configuration des capacités (Step 2: Capability config)

6. **Observation :** Vous êtes sur l'étape « Capability config »
7. Configurez les options suivantes :
   - **Client authentication :** OFF (désactivé — client public sans secret)
   - **Authorization :** OFF (désactivé — pas de gestion des permissions UMA)
   - **Authentication flow :** Cochez **« Standard flow »** (Authorization Code Flow)
   - **Authentication flow :** Décochez **« Direct access grants »**, **« Implicit flow »**, **« Service accounts roles »**, **« OAuth 2.0 Device Authorization Grant »**
   - **PKCE Method :** `S256` (Proof Key for Code Exchange — recommandé pour les clients publics)
8. Cliquez sur **« Next »**

**Point d'observation :**
- **Client authentication OFF** signifie que ce client est **public** : il ne possède pas de secret (car le code JavaScript du navigateur est visible par tous). C'est adapté aux applications front-end (SPA).
- **Standard flow** correspond au flux **Authorization Code**, le flux recommandé pour les applications web.
- **PKCE** ajoute une couche de sécurité en générant un code challenge côté client avant la redirection vers Keycloak. Keycloak vérifie ensuite ce code lors de l'échange du code d'autorisation contre un jeton. Cela empêche un attaquant d'intercepter le code d'autorisation et de l'échanger contre un jeton. La méthode `S256` utilise un hash SHA-256 (plus sécurisé que `plain`).


#### Configuration des URLs (Step 3: Login settings)

9. Remplissez les champs suivants :

| Champ | Valeur |
| --- | --- |
| **Root URL** | `http://localhost:5173` |
| **Home URL** | *(laisser vide)* |
| **Valid redirect URIs** | `http://localhost:5173/callback` |
| **Valid post logout redirect URIs** | `http://localhost:5173/*` |
| **Web origins** | `http://localhost:5173` |

10. Cliquez sur **« Save »**

**Point d'observation :**
- **Valid redirect URIs** : liste blanche des URLs vers lesquelles Keycloak peut rediriger après authentification. On cible précisément `/callback` plutôt qu'un wildcard `/*` pour limiter la surface d'attaque (bonne pratique OIDC).
- **Web origins** : autorise le front-end à appeler les endpoints Keycloak en AJAX (gestion CORS).

> **Checkpoint :** Le client `comptoir-des-voyageurs` est créé. Vous êtes redirigé vers la page de détails du client.

<!-- TODO: Vérifier les ports exacts utilisés par l'app front-end (src/front) — ajuster si nécessaire -->

---

### Étape 2 — Créer le client « Réserve de Valdoria » (API)

La Réserve est l'API qui expose les ressources protégées du royaume. C'est un **client confidentiel (Resource Server)** : il ne gère pas l'authentification des utilisateurs, il se contente de **valider** les jetons JWT présentés.

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur **« Create client »**

#### Configuration de base (Step 1: General settings)

3. Remplissez les champs :
   - **Client type :** `OpenID Connect`
   - **Client ID :** `reserve-valdoria`
   - **Name :** `Réserve impériale de Valdoria`
   - **Description :** `API protégée exposant les ressources de la provaince de Valdoria`
4. Cliquez sur **« Next »**

#### Configuration des capacités (Step 2: Capability config)

5. **Observation :** Vous êtes sur l'étape « Capability config »
6. Configurez les options suivantes :
   - **Client authentication :** ON (activé — client confidentiel)
   - **Authorization :** OFF (désactivé)
   - **Authentication flow :** Décochez **Standard flow**, **Direct access grants**, **Implicit flow**, **OAuth 2.0 Device Authorization Grant**
   - **Authentication flow :** Cochez **« Service accounts roles »** (pour permettre l'introspection de jetons)
7. Cliquez sur **« Next »**

**Point d'observation :**
- **Client authentication ON** avec **Service accounts roles** activé = configuration **Resource Server**. Ce client n'initie pas de flux d'authentification utilisateur, il se contente de valider les jetons.
- Cette configuration est **standard pour les APIs REST** : elles reçoivent des jetons émis par d'autres clients (comme `comptoir-des-voyageurs`) et les valident.

#### Configuration des URLs (Step 3: Login settings)

8. **Observation :** Tous les champs sont optionnels (une API n'a pas d'URLs de redirection)
9. Laissez tous les champs vides
10. Cliquez sur **« Save »**

> **Checkpoint :** Le client `reserve-valdoria` est créé en mode Resource Server. Il apparaît dans la liste des clients.

---

### Étape 3 — Vérifier les mappers pour les rôles de royaume

Par défaut, Keycloak configure automatiquement un **mapper** pour inclure les rôles de royaume dans les jetons. Vérifions que ce mapper est bien présent et correctement configuré pour le client `comptoir-des-voyageurs`.

#### Comprendre les Client Scopes par défaut

1. Cliquez sur le client **`comptoir-des-voyageurs`**
2. Cliquez sur l'onglet **« Client scopes »**
3. **Observation :** Vous voyez 2 onglets : **Setup** et **Evaluate**
4. Restez sur l'onglet **« Setup »**
5. **Observation :** Un tableau liste tous les scopes assignés au client avec 3 colonnes :
   - **Assigned client scope** : nom du scope
   - **Assigned type** : `Default` (inclus automatiquement dans tous les jetons), `Optional` (inclus uniquement si demandé explicitement), ou `None` (scope dédié au client)
   - **Description** : description du scope

**Point d'observation :** Les client scopes sont des ensembles de mappers réutilisables. Par défaut, Keycloak assigne des scopes standards (`profile`, `email`, `roles`, `web-origins`, etc.) qui incluent les informations de base de l'utilisateur. Le scope `comptoir-des-voyageurs-dedicated` (type `None`) est un scope propre à ce client.

#### Vérifier le scope `roles` par défaut

6. Dans le menu latéral gauche, cliquez sur **« Client scopes »**
7. Cliquez sur le scope **`roles`**
8. **Observation :** Vous êtes dans la configuration du scope `roles` (scope global partagé par tous les clients du realm)
9. Cliquez sur l'onglet **« Mappers »**
10. **Observation :** Vous voyez 3 mappers :
   - `client roles` — mappe les rôles de client
   - `audience resolve` — ajoute automatiquement l'audience
   - `realm roles` — mappe les rôles de royaume

11. Cliquez sur le mapper **`realm roles`**
12. **Observation des paramètres importants :**
   - **Mapper type :** `User Realm Role`
   - **Token Claim Name :** `realm_access.roles`
   - **Claim JSON Type :** `String`
   - **Add to ID token :** OFF
   - **Add to access token :** ON
   - **Add to userinfo :** OFF
   - **Multivalued :** ON

**Point d'observation :** Ce mapper est **déjà configuré par défaut** dans le scope `roles` ! Il injecte automatiquement les rôles de royaume dans le claim `realm_access.roles` de l'access token. Nous n'avons donc **rien à créer** pour les rôles de royaume — ils sont déjà mappés.

13. Retournez au client `comptoir-des-voyageurs` (naviguez via le menu **« Clients »**)

> **Checkpoint :** Vous avez constaté que le mapper pour les rôles de royaume existe déjà dans le scope `roles`, qui est assigné par défaut au client `comptoir-des-voyageurs`.

#### Vérifier les rôles dans le jeton avec Evaluate

14. Dans le client `comptoir-des-voyageurs`, cliquez sur l'onglet **« Client scopes »**
15. Cliquez sur l'onglet **« Evaluate »**
16. Dans le champ **« Users »**, sélectionnez **`alaric`**
17. Laissez le champ **« Audience target »** vide
18. Cliquez sur **« Refresh »**
19. À droite, cliquez sur **« Generated access token »**

**Observation :** Dans le jeton généré, vous devez voir la section suivante :

```json
{
  "realm_access": {
    "roles": [
      "offline_access",
      "default-roles-valdoria",
      "uma_authorization",
      "sujet",
      "marchand",
      "gouverneur"
    ]
  }
}
```

**Point d'observation :** Les rôles de royaume d'Alaric sont bien présents dans le jeton grâce au mapper `realm roles` du scope `roles`. Le rôle composite `gouverneur` inclut automatiquement les rôles `sujet` et `marchand`.

> **Checkpoint :** Le jeton contient bien les rôles de royaume. Le mapper par défaut fonctionne correctement.

---

### Étape 4 — Créer un Client Scope personnalisé pour les attributs métier

Les attributs personnalisés (comme `villeOrigine`) ne sont **pas inclus par défaut** dans les jetons. Nous devons créer un **Client Scope personnalisé** avec un mapper pour l'attribut `villeOrigine`.

#### Créer le Client Scope

1. Dans le menu latéral gauche, cliquez sur **« Client scopes »**
2. Cliquez sur **« Create client scope »**
3. Remplissez les champs :
   - **Name :** `attributs-valdorien`
   - **Description :** `Informations spécifiques aux sujets de Valdoria, comme la ville d'origine`
   - **Type :** `Default` (ou `Optional` si vous ne voulez pas que le scope soit toujours inclus)
   - **Protocol :** `OpenID Connect`
   - **Display on consent screen :** OFF (désactivé)
   - **Include in token scope :** ON (activé)
4. Cliquez sur **« Save »**

> **Checkpoint :** Le client scope `attributs-valdorien` est créé. Vous êtes redirigé vers sa page de détails.

#### Créer le mapper pour `villeOrigine`

5. Vous êtes dans la page de détails du client scope `attributs-valdorien`
6. Cliquez sur l'onglet **« Mappers »**
7. Cliquez sur **« Configure a new mapper »**
8. Sélectionnez le type de mapper : **« User Attribute »**
9. Remplissez les champs :
   - **Name :** `ville-origine-mapper`
   - **User Attribute :** `villeOrigine` (le nom de l'attribut que nous avons créé dans l'étape 1)
   - **Token Claim Name :** `villeOrigine` (le nom du claim dans le jeton JWT)
   - **Claim JSON Type :** `String`
   - **Add to ID token :** OFF
   - **Add to access token :** ON (coché)
   - **Add to userinfo :** OFF
   - **Multivalued :** OFF (décoché)
10. Cliquez sur **« Save »**

**Point d'observation :** Ce mapper lit la valeur de l'attribut utilisateur `villeOrigine` et l'injecte dans le claim `villeOrigine` de l'access token. L'API pourra ensuite lire cette information pour filtrer les ressources (par exemple, ne montrer que les artefacts de la ville d'origine de l'utilisateur).

> **Checkpoint :** Le mapper `ville-origine-mapper` est créé dans le scope `attributs-valdorien`.

---

### Étape 5 — Assigner le Client Scope au client Comptoir

Maintenant que le scope `attributs-valdorien` est créé, nous devons l'assigner au client `comptoir-des-voyageurs`.

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur le client **`comptoir-des-voyageurs`**
3. Cliquez sur l'onglet **« Client scopes »**
4. Cliquez sur **« Add client scope »**
5. Dans la liste qui apparaît, **cochez** le scope **`attributs-valdorien`**
6. Sélectionnez le type : **« Default »** (pour que le scope soit inclus automatiquement dans tous les jetons)
7. Cliquez sur **« Add »**

**Observation :** Le scope `attributs-valdorien` apparaît maintenant dans le tableau avec le type **`Default`**.

> **Checkpoint :** Le client `comptoir-des-voyageurs` inclut désormais le scope `attributs-valdorien` par défaut, ce qui injectera l'attribut `villeOrigine` dans les jetons.

#### Vérifier l'attribut dans le jeton avec Evaluate

8. Cliquez sur l'onglet **« Evaluate »**
9. Dans le champ **« Users »**, sélectionnez **`alaric`**
10. Laissez le champ **« Audience target »** vide
11. Cliquez sur **« Refresh »**
12. À droite, cliquez sur **« Generated access token »**

**Observation :** Dans le jeton généré, vous devez voir les éléments suivants :

```json
{
  "scope": "openid email profile attributs-valdorien",
  "villeOrigine": "Valdoria-Centre"
}
```

**Point d'observation :** Le scope `attributs-valdorien` apparaît dans le claim `scope` du jeton, confirmant qu'il est bien inclus. Le claim `villeOrigine` contient la valeur `Valdoria-Centre` configurée pour Alaric dans l'exercice 3. Le mapper fonctionne correctement.

> **Checkpoint :** L'attribut personnalisé `villeOrigine` est bien injecté dans le jeton grâce au scope `attributs-valdorien`.

---

### Étape 6 — Configurer l'audience pour la Réserve

Le jeton émis par le Comptoir doit indiquer qu'il est destiné à la Réserve. C'est le concept d'**audience** (`aud`). Pour cela, nous allons utiliser le mapper **`audience resolve`** déjà présent par défaut dans Keycloak.

#### Comprendre le mapper `audience resolve`

1. Dans le menu latéral gauche, cliquez sur **« Client scopes »**
2. Cliquez sur le scope **`roles`**
3. Cliquez sur l'onglet **« Mappers »**
4. **Observation :** Le mapper **`audience resolve`** est présent

5. Cliquez sur le mapper **`audience resolve`**
6. **Observation des paramètres :**
   - **Mapper type :** `Audience Resolve`
   - Ce mapper ajoute **automatiquement** dans le claim `aud` tous les clients pour lesquels l'utilisateur possède des **rôles de client** (client roles).

**Point d'observation :** Pour que `reserve-valdoria` apparaisse dans le claim `aud`, il suffit que les utilisateurs possèdent un **client role** sur le client `reserve-valdoria`. Le mapper `audience resolve` le détectera automatiquement.

#### Créer un client role sur la Réserve

7. Dans le menu latéral gauche, cliquez sur **« Clients »**
8. Cliquez sur le client **`reserve-valdoria`**
9. Cliquez sur l'onglet **« Roles »**
10. Cliquez sur **« Create role »**
11. Remplissez les champs :
    - **Role name :** `access`
    - **Description :** `Autorise l'accès à la Réserve de Valdoria`
12. Cliquez sur **« Save »**

> **Checkpoint :** Le client role `access` est créé sur le client `reserve-valdoria`.

#### Ajouter le client role au rôle composite `sujet`

Tous les sujets de Valdoria doivent pouvoir présenter leur laissez-passer à la Réserve. Nous allons inclure le client role `access` dans le rôle composite `sujet`.

13. Dans le menu latéral gauche, cliquez sur **« Realm roles »**
14. Cliquez sur le rôle **`sujet`**
15. Cliquez sur l'onglet **« Associated roles »** puis **« Assign role »** / **« Client roles »** 
16. Cherchez et cochez le rôle **`reserve-valdoria` > `access`**
17. Cliquez sur **« Add »**

**Point d'observation :** En incluant le client role `access` de `reserve-valdoria` dans le rôle composite `sujet`, tous les utilisateurs ayant le rôle `sujet` (directement ou par héritage) obtiendront automatiquement ce client role. Le mapper `audience resolve` détectera alors que l'utilisateur possède un rôle sur `reserve-valdoria` et ajoutera automatiquement `reserve-valdoria` dans le claim `aud` du jeton.

> **Checkpoint :** Le client role `reserve-valdoria.access` est inclus dans le rôle composite `sujet`. Le mapper `audience resolve` ajoutera désormais `reserve-valdoria` dans le claim `aud` de tous les sujets de Valdoria.

---

### Étape 7 — Tester avec l'outil Evaluate : visualiser le jeton complet

Maintenant que tous les mappers sont configurés, utilisons l'outil **Evaluate** pour prévisualiser le jeton qui sera émis lorsqu'un utilisateur s'authentifie via le Comptoir.

#### Accéder à l'outil Evaluate

1. Naviguez vers **« Clients »**
2. Cliquez sur le client **`comptoir-des-voyageurs`**
3. Cliquez sur l'onglet **« Client scopes »**
4. Cliquez sur l'onglet **« Evaluate »**

#### Générer un jeton pour Brunhild (marchande)

5. Dans le champ **« Users »**, commencez à taper `brunhild` puis sélectionnez **`brunhild`**
6. **Important :** Laissez le champ **« Audience target »** vide pour l'instant (nous allons observer le comportement par défaut)
7. Cliquez sur **« Generated access token »**

**Observation :** Un jeton JWT s'affiche, déjà décodé et lisible.

#### Analyser le contenu du jeton

8. Faites défiler le contenu du jeton et identifiez les sections suivantes :

**Section 1 : Informations d'identité**

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
  "name": "Brunhild le Maître forgeron"
}
```

**Section 2 : Rôles de royaume**

```json
{
  "realm_access": {
    "roles": [
      "marchand",
      "sujet",
      "offline_access",
      "default-roles-valdoria",
      "uma_authorization"
    ]
  }
}
```

**Section 3 : Attribut personnalisé**

```json
{
  "villeOrigine": "Nordheim"
}
```

**Points d'observation importants :**

- **`aud`** : audience — le jeton est destiné à `reserve-valdoria` ET `account` (le mapper a bien ajouté la Réserve)
- **`azp`** : authorized party — le client qui a demandé le jeton (`comptoir-des-voyageurs`)
- **`realm_access.roles`** : les rôles de royaume sont présents ! Brunhild a `marchand`, et hérite de `sujet`
- **`villeOrigine`** : l'attribut personnalisé est bien présent avec la valeur `Nordheim`

> **Checkpoint :** Le jeton de Brunhild contient tous les éléments configurés : audience, rôles de royaume (avec héritage), et attribut `villeOrigine`.

#### Comparer avec Cedric (sujet) et Alaric

9. Changez l'utilisateur sélectionné pour **`cedric`**
10. Cliquez à nouveau sur **« Generated access token »**
11. Répétez l'opération pour  **`alaric`**

> **Checkpoint :** Vous avez vérifié que les jetons contiennent les rôles corrects pour chaque utilisateur, avec l'héritage via les rôles composites qui fonctionne correctement.

---

### Étape 8 — Simuler le contrôle d'accès de la Réserve

La Réserve de Valdoria expose plusieurs endpoints avec des niveaux de sécurité différents :

| Endpoint | Description | Autorisation requise |
| --- | --- | --- |
| `GET /infos` | Informations publiques du royaume | Utilisateur authentifié |
| `GET /inventaire` | Inventaire des ressources | Rôle `marchand` requis |
| `GET /villes/{id}/artefacts` | Artefacts d'une ville | Rôle `marchand` + filtrage par `villeOrigine` |

Utilisons l'outil Evaluate pour **simuler** ce que verrait l'API lorsqu'elle valide les jetons.

#### Scénario 1 : Brunhild accède à l'inventaire

**Question :** Brunhild (rôle `marchand`) peut-elle accéder à `GET /inventaire` qui requiert le rôle `marchand` ?

1. Dans l'outil Evaluate, sélectionnez l'utilisateur **`brunhild`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents sont `marchand`, `sujet`
5. **Conclusion :** Brunhild possède le rôle `marchand` → **Accès AUTORISÉ** à `/inventaire`

#### Scénario 2 : Alaric accède à l'inventaire

**Question :** Alaric (rôle `gouverneur`) peut-il accéder à `GET /inventaire` ?

1. Sélectionnez l'utilisateur **`alaric`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents incluent `gouverneur`, `marchand`, et `sujet`
5. **Conclusion :** Alaric possède le rôle `marchand` (hérité via `gouverneur`) → **Accès AUTORISÉ** à `/inventaire`

#### Scénario 3 : Cedric (simple sujet) tente d'accéder à l'inventaire

**Question :** Cedric (rôle `sujet`) peut-il accéder à `GET /inventaire` ?

1. Sélectionnez l'utilisateur **`cedric`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents est `sujet`
5. **Conclusion :** Cedric ne possède **pas** le rôle `marchand` → **Accès REFUSÉ** à `/inventaire`

> **Checkpoint :** Vous avez simulé les contrôles d'accès de la Réserve en analysant les jetons. Vous comprenez comment l'API utiliserait les rôles (`realm_access.roles`) pour autoriser ou refuser l'accès.

---

### Étape 9 — Observer l'audience dans différents contextes

Le claim `aud` (audience) est un mécanisme de sécurité important. Vérifions son comportement.

#### Test avec audience explicite

1. Dans l'outil Evaluate, sélectionnez l'utilisateur **`alaric`**
2. Dans le champ **« Audience target »**, saisissez : `reserve-valdoria`
3. Cliquez sur **« Generated access token »**
4. Cherchez le claim `aud`
5. **Observation :** `"aud": ["reserve-valdoria"]` 

**Point d'observation :** Lorsque nous spécifions explicitement l'audience, Keycloak génère un jeton destiné uniquement à cette API. L'API peut valider que le jeton lui est bien destiné en vérifiant que le claim `aud` contient son client ID.

#### Test avec audience par défaut

6. Laissez le champ **« Audience target »** vide
7. Cliquez sur **« Generated access token »**
8. Cherchez le claim `aud`
9. **Observation :** `"aud": ["reserve-valdoria", "account"]`

**Point d'observation :** Grâce au mapper `audience resolve` et au client role `access` inclus dans le rôle `sujet`, le claim `aud` contient automatiquement `reserve-valdoria`, même sans spécifier explicitement l'audience. C'est le comportement souhaité : le Comptoir demande toujours des jetons pour la Réserve.

> **Checkpoint :** Vous comprenez le concept d'audience et avez vérifié que les jetons émis par le Comptoir sont bien destinés à la Réserve.

---


## Point clé

> **Le flux Authorization Code avec PKCE est le standard pour les applications web modernes.**
>
> Le Comptoir (client public) redirige l'utilisateur vers Keycloak, qui génère un code d'autorisation. Le Comptoir échange ensuite ce code contre un jeton JWT, avec une protection PKCE contre les interceptions.
>
> **Les mappers contrôlent le contenu des jetons.**
>
> Les rôles de royaume sont injectés via le scope `roles` (par défaut). Les attributs personnalisés nécessitent des mappers dédiés. L'audience (`aud`) indique à quelle API le jeton est destiné.
>
> **L'outil Evaluate est indispensable pour le debug.**
>
> Il permet de visualiser exactement ce que contiendra le jeton **avant** de connecter une vraie application. C'est l'outil de validation principal pour vérifier que les mappers sont correctement configurés.

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| Les rôles de royaume n'apparaissent pas dans le jeton | Le scope `roles` n'est pas assigné au client | Vérifiez dans Client scopes > Setup que `roles` est présent avec le type `Default` |
| L'attribut `villeOrigine` n'apparaît pas | Le scope `attributs-valdorien` n'est pas assigné ou le mapper est mal configuré | Vérifiez que le scope est assigné et que le mapper cible bien l'attribut `villeOrigine` |
| Le claim `aud` ne contient pas `reserve-valdoria` | Le client role `access` n'est pas assigné ou le rôle `sujet` ne l'inclut pas | Vérifiez que le client role `access` existe sur `reserve-valdoria` et qu'il est inclus dans le rôle composite `sujet` |
| Le client `comptoir-des-voyageurs` demande un secret | Client authentication est activé | Désactivez « Client authentication » dans la configuration du client |
| L'outil Evaluate ne génère rien | Aucun utilisateur sélectionné | Sélectionnez un utilisateur dans le champ « Users » |
| Les rôles hérités ne s'affichent pas | C'est normal — ils sont tous listés au même niveau | Keycloak inclut tous les rôles (directs + hérités) dans le claim `realm_access.roles` sans distinction |
| Le scope dédié n'est pas visible | Le tableau n'est pas filtré correctement | Cherchez `comptoir-des-voyageurs-dedicated` (type `None`) dans le tableau de l'onglet Setup |
| PKCE n'est pas disponible dans les options | Mauvaise section consultée | Allez dans l'onglet « Advanced » du client, section « Proof Key for Code Exchange Code Challenge Method » |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Explorer les autres types de jetons

1. Dans l'outil Evaluate, cliquez sur **« Generated ID token »**
2. **Observation :** L'ID token contient principalement les informations d'identité (nom, email), mais **pas les rôles ni les attributs personnalisés** par défaut
3. Cliquez sur **« Generated user info »**
4. **Observation :** Les informations retournées par l'endpoint `/userinfo` (appelé par les applications pour récupérer le profil utilisateur)

**Point d'observation :** L'ID token est utilisé pour l'authentification (« qui est l'utilisateur ? »), tandis que l'access token est utilisé pour l'autorisation (« que peut faire l'utilisateur ? »).

### Vérifier les clés cryptographiques du realm

1. Naviguez vers **« Realm settings »**
2. Cliquez sur l'onglet **« Keys »**
3. **Observation :** Keycloak gère automatiquement plusieurs clés :
   - **RS256** : signature des jetons JWT (clé publique/privée)
   - **HS512** : signature HMAC (rarement utilisé)
   - **AES** : chiffrement des tokens

4. Cliquez sur le bouton **« Public key »** de la clé RS256 active
5. **Observation :** La clé publique s'affiche au format PEM
6. **Note :** Les APIs peuvent télécharger cette clé publique via l'endpoint `http://localhost:8080/realms/valdoria/protocol/openid-connect/certs` (JWKS) pour valider localement les jetons sans appeler Keycloak

> C'est généralement le comportement des outils modernes. Pour des questions de performances. 

### Tester l'endpoint de métadonnées OIDC

1. Ouvrez un nouvel onglet de navigateur
2. Accédez à : **http://localhost:8080/realms/valdoria/.well-known/openid-configuration**
3. **Observation :** Un document JSON décrit tous les endpoints et capacités du realm :
   - `authorization_endpoint` : URL pour initier le flux Authorization Code
   - `token_endpoint` : URL pour échanger le code contre un jeton
   - `userinfo_endpoint` : URL pour récupérer les infos utilisateur
   - `jwks_uri` : URL des clés publiques (JWKS)
   - `introspection_endpoint` : URL pour valider un jeton
   - `end_session_endpoint` : URL pour se déconnecter

**Point d'observation :** Ce document est le **point d'entrée standard** de tout serveur OIDC. Les librairies clientes (oidc-client-ts, Keycloak JS adapter, etc.) utilisent cette URL pour découvrir automatiquement tous les endpoints nécessaires.
