# Exercice 4 — Ouvrir le Comptoir des voyageurs et sa Réserve

> **Module 2 — Gestion des clients**
> Durée estimée : 45 minutes | Difficulté : ★★★☆☆ (intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer et configurer un client **public** (SPA) pour une application front-end
- Créer et configurer un client **bearer-only** pour une API protégée
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
- Notions de base sur les jetons JWT (claims, signature)

---

## Contexte narratif

> La province de Valdoria a besoin d'un point de service pour accueillir ses sujets et protéger ses ressources.
>
> Les architectes ouvrent le **Comptoir des voyageurs** — l'application front-end où les sujets se présentent pour obtenir leur laissez-passer numérique (jeton JWT). Ce comptoir est un lieu public : n'importe qui peut s'y rendre, mais seuls les sujets authentifiés reçoivent un laissez-passer.
>
> Ils sécurisent ensuite la **Réserve** — l'API qui détient les ressources précieuses du royaume. La Réserve ne laisse entrer que les sujets porteurs d'un laissez-passer valide. Certaines salles de la Réserve (comme l'inventaire) ne sont accessibles qu'aux marchands.
>
> Les architectes apprennent une règle fondamentale : **le Comptoir demande des laissez-passer au nom de la Réserve**. C'est le concept d'**audience** : un jeton émis pour le Comptoir est destiné à être utilisé auprès de la Réserve.

### Lexique de l'Empire

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Client public (SPA) | Comptoir des voyageurs (lieu public) |
| Client bearer-only (API) | Réserve (ressources protégées) |
| Authorization Code Flow + PKCE | Procédure d'obtention d'un laissez-passer sécurisé |
| Jeton JWT (Access Token) | Laissez-passer numérique |
| Audience (`aud`) | Destination du laissez-passer |
| Mapper | Cachet officiel (informations ajoutées au laissez-passer) |
| Attribut utilisateur | Caractéristique du sujet (ex : ville d'origine) |

---

## Étapes

### Étape 1 — Ajouter l'attribut `ville_origine` aux utilisateurs

Avant de créer les clients, nous devons enrichir les profils des sujets de Valdoria avec un attribut personnalisé : leur **ville d'origine**. Cet attribut sera utilisé plus tard pour filtrer les ressources accessibles dans la Réserve.

1. Connectez-vous à la console d'administration de Keycloak : **http://localhost:8080/admin**
2. Identifiants : `admin` / `admin`
3. Vérifiez que vous êtes bien dans le realm **`valdoria`**
4. Dans le menu latéral gauche, cliquez sur **« Users »**
5. Cliquez sur **« View all users »**

#### Ajouter l'attribut à Alaric

6. Cliquez sur l'utilisateur **`alaric`**
7. Cliquez sur l'onglet **« Attributes »**
8. Cliquez sur **« Add attribute »** (ou sur le bouton « + » si l'interface diffère)
9. Remplissez les champs :
   - **Key :** `ville_origine`
   - **Value :** `Valdoria-Centre`
10. Cliquez sur **« Save »**

#### Ajouter l'attribut aux autres utilisateurs

Répétez les étapes 6 à 10 pour les utilisateurs suivants :

| Utilisateur | Ville d'origine |
| --- | --- |
| `brunhild` | `Nordheim` |
| `cedric` | `Sudbourg` |

> **Checkpoint :** Chaque utilisateur possède maintenant un attribut personnalisé `ville_origine`. Vérifiez en consultant l'onglet « Attributes » de chaque utilisateur.

**Point d'observation :** Les attributs personnalisés permettent de stocker des informations métier sur les utilisateurs (ville, département, niveau d'habilitation, etc.). Ces attributs peuvent ensuite être injectés dans les jetons JWT via des mappers pour permettre à l'API de filtrer les données ou d'appliquer des règles métier.

---

### Étape 2 — Créer le client « Comptoir des voyageurs » (front-end)

Le Comptoir des voyageurs est l'application front-end qui permet aux sujets de s'authentifier. C'est un client **public** (type SPA — Single Page Application).

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur **« Create client »**

#### Configuration de base (Step 1: General settings)

3. Remplissez les champs :
   - **Client type :** `OpenID Connect`
   - **Client ID :** `comptoir-des-voyageurs`
   - **Name :** `Comptoir des voyageurs`
   - **Description :** `Application front-end pour l'authentification des sujets de Valdoria`
4. Laissez les autres options par défaut
5. Cliquez sur **« Next »**

#### Configuration des capacités (Step 2: Capability config)

6. **Observation :** Vous êtes sur l'étape « Capability config »
7. Configurez les options suivantes :
   - **Client authentication :** OFF (désactivé — client public sans secret)
   - **Authorization :** OFF (désactivé — pas de gestion des permissions UMA)
   - **Authentication flow :** Cochez **« Standard flow »** (Authorization Code Flow)
   - **Authentication flow :** Décochez **« Direct access grants »**, **« Implicit flow »**, **« Service accounts roles »**, **« OAuth 2.0 Device Authorization Grant »**
8. Cliquez sur **« Next »**

**Point d'observation :**
- **Client authentication OFF** signifie que ce client est **public** : il ne possède pas de secret (car le code JavaScript du navigateur est visible par tous). C'est adapté aux applications front-end (SPA).
- **Standard flow** correspond au flux **Authorization Code**, le flux recommandé pour les applications web.

#### Configuration des URLs (Step 3: Login settings)

9. Remplissez les champs suivants :

| Champ | Valeur |
| --- | --- |
| **Root URL** | `http://localhost:3000` |
| **Home URL** | *(laisser vide)* |
| **Valid redirect URIs** | `http://localhost:3000/*` |
| **Valid post logout redirect URIs** | `http://localhost:3000/*` |
| **Web origins** | `http://localhost:3000` |

10. Cliquez sur **« Save »**

**Point d'observation :**
- **Valid redirect URIs** : liste blanche des URLs vers lesquelles Keycloak peut rediriger après authentification. Le caractère `*` autorise tous les chemins sous `http://localhost:3000/`.
- **Web origins** : autorise le front-end à appeler les endpoints Keycloak en AJAX (gestion CORS).

> **Checkpoint :** Le client `comptoir-des-voyageurs` est créé. Vous êtes redirigé vers la page de détails du client.

<!-- TODO: Vérifier les ports exacts utilisés par l'app front-end (src/front) — ajuster si nécessaire -->

---

### Étape 3 — Activer PKCE pour le Comptoir

Le flux Authorization Code doit être sécurisé avec **PKCE** (Proof Key for Code Exchange) pour éviter les attaques par interception du code d'autorisation. C'est une protection essentielle pour les clients publics.

1. Vous êtes dans la page de détails du client `comptoir-des-voyageurs`
2. Cliquez sur l'onglet **« Advanced »** (ou **« Paramètres avancés »**)
3. Faites défiler jusqu'à la section **« Proof Key for Code Exchange Code Challenge Method »**
4. Dans le menu déroulant, sélectionnez : **`S256`**
5. Faites défiler vers le haut et cliquez sur **« Save »**

**Point d'observation :** PKCE ajoute une couche de sécurité en générant un code challenge côté client avant la redirection vers Keycloak. Keycloak vérifie ensuite ce code lors de l'échange du code d'autorisation contre un jeton. Cela empêche un attaquant d'intercepter le code d'autorisation et de l'échanger contre un jeton. La méthode `S256` utilise un hash SHA-256 (plus sécurisé que `plain`).

> **Checkpoint :** PKCE est activé avec la méthode `S256` pour le client `comptoir-des-voyageurs`.

---

### Étape 4 — Créer le client « Réserve de Valdoria » (API)

La Réserve est l'API qui expose les ressources protégées du royaume. C'est un client **bearer-only** : il ne gère pas l'authentification des utilisateurs, il se contente de **valider** les jetons JWT présentés.

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur **« Create client »**

#### Configuration de base (Step 1: General settings)

3. Remplissez les champs :
   - **Client type :** `OpenID Connect`
   - **Client ID :** `reserve-valdoria`
   - **Name :** `Réserve de Valdoria`
   - **Description :** `API protégée exposant les ressources du royaume`
4. Cliquez sur **« Next »**

#### Configuration des capacités (Step 2: Capability config)

5. **Observation :** Vous êtes sur l'étape « Capability config »
6. Configurez les options suivantes :
   - **Client authentication :** ON (activé — client confidentiel)
   - **Authorization :** OFF (désactivé)
   - **Authentication flow :** Décochez **TOUS** les flux (Standard flow, Direct access grants, Implicit flow, Service accounts roles, OAuth 2.0 Device Authorization Grant)
7. Cliquez sur **« Next »**

**Point d'observation :**
- **Client authentication ON** avec **tous les flux désactivés** = configuration **bearer-only**. Ce client n'initie jamais de flux d'authentification, il se contente de valider les jetons.
- Cette configuration est **standard pour les APIs REST** : elles reçoivent des jetons émis par d'autres clients (comme `comptoir-des-voyageurs`) et les valident.

#### Configuration des URLs (Step 3: Login settings)

8. **Observation :** Tous les champs sont optionnels (une API n'a pas d'URLs de redirection)
9. Laissez tous les champs vides
10. Cliquez sur **« Save »**

> **Checkpoint :** Le client `reserve-valdoria` est créé en mode bearer-only. Il apparaît dans la liste des clients.

---

### Étape 5 — Configurer les mappers pour les rôles de royaume

Actuellement, les rôles de royaume (`gouverneur`, `marchand`, `artisan`, `sujet`, etc.) ne sont **pas inclus** dans les jetons émis pour le client `comptoir-des-voyageurs`. Nous devons créer un **mapper** pour les injecter.

#### Comprendre les Client Scopes par défaut

1. Cliquez sur le client **`comptoir-des-voyageurs`**
2. Cliquez sur l'onglet **« Client scopes »**
3. **Observation :** Vous voyez 4 listes :
   - **Assigned default client scopes** : scopes inclus par défaut dans tous les jetons
   - **Assigned optional client scopes** : scopes inclus uniquement si demandés explicitement
   - **Available client scopes** : scopes disponibles mais non assignés

**Point d'observation :** Les client scopes sont des ensembles de mappers réutilisables. Par défaut, Keycloak assigne des scopes standards (`profile`, `email`, `roles`, `web-origins`, etc.) qui incluent les informations de base de l'utilisateur.

#### Vérifier le scope `roles` par défaut

4. Dans la liste **« Assigned default client scopes »**, cliquez sur le scope **`roles`**
5. **Observation :** Vous êtes redirigé vers la configuration du scope `roles` (scope global partagé par tous les clients du realm)
6. Cliquez sur l'onglet **« Mappers »**
7. **Observation :** Vous voyez 3 mappers :
   - `client roles` — mappe les rôles de client
   - `audience resolve` — ajoute automatiquement l'audience
   - `realm roles` — mappe les rôles de royaume

8. Cliquez sur le mapper **`realm roles`**
9. **Observation des paramètres importants :**
   - **Mapper type :** `User Realm Role`
   - **Token Claim Name :** `realm_access.roles`
   - **Claim JSON Type :** `String`
   - **Add to ID token :** OFF
   - **Add to access token :** ON
   - **Add to userinfo :** OFF
   - **Multivalued :** ON

**Point d'observation :** Ce mapper est **déjà configuré par défaut** dans le scope `roles` ! Il injecte automatiquement les rôles de royaume dans le claim `realm_access.roles` de l'access token. Nous n'avons donc **rien à créer** pour les rôles de royaume — ils sont déjà mappés.

10. Retournez au client `comptoir-des-voyageurs` (utilisez le bouton « Back to client » ou naviguez via le menu **« Clients »**)

> **Checkpoint :** Vous avez constaté que le mapper pour les rôles de royaume existe déjà dans le scope `roles`, qui est assigné par défaut au client `comptoir-des-voyageurs`.

---

### Étape 6 — Créer un Client Scope personnalisé pour les attributs métier

Les attributs personnalisés (comme `ville_origine`) ne sont **pas inclus par défaut** dans les jetons. Nous devons créer un **Client Scope personnalisé** avec un mapper pour l'attribut `ville_origine`.

#### Créer le Client Scope

1. Dans le menu latéral gauche, cliquez sur **« Client scopes »**
2. Cliquez sur **« Create client scope »**
3. Remplissez les champs :
   - **Name :** `profil-valdorien`
   - **Description :** `Informations métier spécifiques aux sujets de Valdoria`
   - **Type :** `Optional` (ou `Default` si vous voulez que le scope soit toujours inclus)
   - **Protocol :** `OpenID Connect`
   - **Display on consent screen :** OFF (désactivé)
   - **Include in token scope :** ON (activé)
4. Cliquez sur **« Save »**

> **Checkpoint :** Le client scope `profil-valdorien` est créé. Vous êtes redirigé vers sa page de détails.

#### Créer le mapper pour `ville_origine`

5. Vous êtes dans la page de détails du client scope `profil-valdorien`
6. Cliquez sur l'onglet **« Mappers »**
7. Cliquez sur **« Add mapper »** puis **« By configuration »**
8. Sélectionnez le type de mapper : **« User Attribute »**
9. Remplissez les champs :
   - **Name :** `ville-origine-mapper`
   - **User Attribute :** `ville_origine` (le nom de l'attribut que nous avons créé dans l'étape 1)
   - **Token Claim Name :** `ville_origine` (le nom du claim dans le jeton JWT)
   - **Claim JSON Type :** `String`
   - **Add to ID token :** OFF
   - **Add to access token :** ON (coché)
   - **Add to userinfo :** OFF
   - **Multivalued :** OFF (décoché)
10. Cliquez sur **« Save »**

**Point d'observation :** Ce mapper lit la valeur de l'attribut utilisateur `ville_origine` et l'injecte dans le claim `ville_origine` de l'access token. L'API pourra ensuite lire cette information pour filtrer les ressources (par exemple, ne montrer que les artefacts de la ville d'origine de l'utilisateur).

> **Checkpoint :** Le mapper `ville-origine-mapper` est créé dans le scope `profil-valdorien`.

---

### Étape 7 — Assigner le Client Scope au client Comptoir

Maintenant que le scope `profil-valdorien` est créé, nous devons l'assigner au client `comptoir-des-voyageurs`.

1. Dans le menu latéral gauche, cliquez sur **« Clients »**
2. Cliquez sur le client **`comptoir-des-voyageurs`**
3. Cliquez sur l'onglet **« Client scopes »**
4. Cliquez sur **« Add client scope »**
5. Dans la liste qui apparaît, **cochez** le scope **`profil-valdorien`**
6. Sélectionnez le type : **« Default »** (pour que le scope soit inclus automatiquement dans tous les jetons)
7. Cliquez sur **« Add »**

**Observation :** Le scope `profil-valdorien` apparaît maintenant dans la liste **« Assigned default client scopes »** du client `comptoir-des-voyageurs`.

> **Checkpoint :** Le client `comptoir-des-voyageurs` inclut désormais le scope `profil-valdorien` par défaut, ce qui injectera l'attribut `ville_origine` dans les jetons.

---

### Étape 8 — Configurer l'audience pour la Réserve

Le jeton émis par le Comptoir doit indiquer qu'il est destiné à la Réserve. C'est le concept d'**audience** (`aud`). Nous devons configurer un mapper pour ajouter `reserve-valdoria` comme audience.

#### Vérifier la présence du mapper `audience resolve`

1. Retournez au client **`comptoir-des-voyageurs`**
2. Cliquez sur l'onglet **« Client scopes »**
3. Dans la liste **« Assigned default client scopes »**, cliquez sur le scope **`roles`**
4. Cliquez sur l'onglet **« Mappers »**
5. **Observation :** Le mapper **`audience resolve`** est présent

6. Cliquez sur le mapper **`audience resolve`**
7. **Observation des paramètres :**
   - **Mapper type :** `Audience Resolve`
   - Ce mapper ajoute **automatiquement** dans le claim `aud` tous les clients pour lesquels l'utilisateur possède des rôles de client (client roles).

**Point d'observation :** Le mapper `audience resolve` est une fonctionnalité récente de Keycloak qui détecte automatiquement les audiences appropriées. Cependant, dans notre cas, la Réserve n'a pas de rôles de client assignés aux utilisateurs. Nous devons donc créer un mapper manuel pour forcer l'audience.

#### Créer un mapper d'audience manuel

8. Retournez au client **`comptoir-des-voyageurs`** (via le menu « Clients »)
9. Cliquez sur l'onglet **« Client scopes »**
10. Cliquez sur l'onglet **« Dedicated scope »** (ou **« Dedicated client scope »** si disponible — c'est un scope spécifique au client)
    - **Note :** Si vous ne voyez pas cet onglet, cherchez un bouton ou un lien mentionnant le scope dédié du client. Chaque client possède un scope qui lui est propre, généralement nommé `comptoir-des-voyageurs-dedicated`.

11. **Observation :** Vous êtes dans le client scope dédié du client `comptoir-des-voyageurs` (souvent nommé `comptoir-des-voyageurs-dedicated`)
12. Cliquez sur **« Add mapper »** puis **« By configuration »**
13. Sélectionnez le type de mapper : **« Audience »**
14. Remplissez les champs :
    - **Name :** `audience-reserve-valdoria`
    - **Included Client Audience :** `reserve-valdoria` (sélectionnez dans la liste déroulante)
    - **Add to ID token :** OFF
    - **Add to access token :** ON (coché)
15. Cliquez sur **« Save »**

**Point d'observation :** Ce mapper force l'ajout de `reserve-valdoria` dans le claim `aud` (audience) de l'access token. Cela signifie que le jeton est explicitement destiné à être utilisé avec l'API `reserve-valdoria`. Lorsque l'API valide le jeton, elle peut vérifier que le claim `aud` contient bien son client ID.

> **Checkpoint :** Le mapper `audience-reserve-valdoria` est créé dans le scope dédié du client `comptoir-des-voyageurs`. Les jetons émis pour ce client contiendront désormais `reserve-valdoria` dans le claim `aud`.

<!-- TODO: Vérifier le nom exact du scope dédié dans Keycloak 26.1 — peut varier selon la version -->

---

### Étape 9 — Tester avec l'outil Evaluate : visualiser le jeton complet

Maintenant que tous les mappers sont configurés, utilisons l'outil **Evaluate** pour prévisualiser le jeton qui sera émis lorsqu'un utilisateur s'authentifie via le Comptoir.

#### Accéder à l'outil Evaluate

1. Naviguez vers **« Clients »**
2. Cliquez sur le client **`comptoir-des-voyageurs`**
3. Cliquez sur l'onglet **« Client scopes »**
4. Cliquez sur le sous-onglet **« Evaluate »**

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
      "maitre-forgeron",
      "artisan",
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
  "ville_origine": "Nordheim"
}
```

**Points d'observation importants :**

- **`aud`** : audience — le jeton est destiné à `reserve-valdoria` ET `account` (le mapper a bien ajouté la Réserve)
- **`azp`** : authorized party — le client qui a demandé le jeton (`comptoir-des-voyageurs`)
- **`realm_access.roles`** : les rôles de royaume sont présents ! Brunhild a `maitre-forgeron`, et hérite de `artisan` et `sujet`
- **`ville_origine`** : l'attribut personnalisé est bien présent avec la valeur `Nordheim`

> **Checkpoint :** Le jeton de Brunhild contient tous les éléments configurés : audience, rôles de royaume (avec héritage), et attribut `ville_origine`.

#### Comparer avec Cedric (artisan)

9. Changez l'utilisateur sélectionné pour **`cedric`**
10. Cliquez à nouveau sur **« Generated access token »**

**Observation dans le jeton de Cedric :**

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

**Point d'observation :** Cedric n'a **que** le rôle `artisan` (et `sujet` qui est un rôle par défaut), mais **pas** `maitre-forgeron` ni `marchand`. Son attribut `ville_origine` est `Sudbourg`. C'est cohérent avec ce que nous avons configuré dans l'exercice 3.

#### Comparer avec Alaric (gouverneur)

11. Changez l'utilisateur sélectionné pour **`alaric`**
12. Cliquez à nouveau sur **« Generated access token »**

**Observation dans le jeton d'Alaric :**

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

**Point d'observation :** Alaric possède **tous** les rôles ! Le rôle composite `gouverneur` lui confère automatiquement `sujet`, `artisan`, `marchand`, `scribe`. Il possède également `maitre-forgeron` qui lui-même inclut `artisan` et `sujet` (mais sans doublons dans le jeton). Son attribut `ville_origine` est `Valdoria-Centre`.

> **Checkpoint :** Vous avez vérifié que les jetons contiennent les rôles corrects pour chaque utilisateur, avec l'héritage via les rôles composites qui fonctionne correctement.

---

### Étape 10 — Simuler le contrôle d'accès de la Réserve

La Réserve de Valdoria expose plusieurs endpoints avec des niveaux de sécurité différents :

| Endpoint | Description | Autorisation requise |
| --- | --- | --- |
| `GET /infos` | Informations publiques du royaume | Utilisateur authentifié |
| `GET /inventaire` | Inventaire des ressources | Rôle `marchand` requis |
| `GET /villes/{id}/artefacts` | Artefacts d'une ville | Rôle `marchand` + filtrage par `ville_origine` |

Utilisons l'outil Evaluate pour **simuler** ce que verrait l'API lorsqu'elle valide les jetons.

#### Scénario 1 : Brunhild accède à l'inventaire

**Question :** Brunhild (rôle `maitre-forgeron`) peut-elle accéder à `GET /inventaire` qui requiert le rôle `marchand` ?

1. Dans l'outil Evaluate, sélectionnez l'utilisateur **`brunhild`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents sont `maitre-forgeron`, `artisan`, `sujet`
5. **Conclusion :** Brunhild ne possède **pas** le rôle `marchand` → **Accès REFUSÉ** à `/inventaire`

#### Scénario 2 : Alaric accède à l'inventaire

**Question :** Alaric (rôle `gouverneur`) peut-il accéder à `GET /inventaire` ?

1. Sélectionnez l'utilisateur **`alaric`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents incluent `gouverneur`, `marchand`, `artisan`, `scribe`, `sujet`
5. **Conclusion :** Alaric possède le rôle `marchand` (hérité via `gouverneur`) → **Accès AUTORISÉ** à `/inventaire`

#### Scénario 3 : Cedric (simple sujet) tente d'accéder à l'inventaire

**Question :** Cedric (rôle `artisan`) peut-il accéder à `GET /inventaire` ?

1. Sélectionnez l'utilisateur **`cedric`**
2. Cliquez sur **« Generated access token »**
3. Cherchez la section `realm_access.roles`
4. **Observation :** Les rôles présents sont `artisan`, `sujet`
5. **Conclusion :** Cedric ne possède **pas** le rôle `marchand` → **Accès REFUSÉ** à `/inventaire`

#### Scénario 4 : Filtrage par `ville_origine`

**Question :** Si Alaric (ville : `Valdoria-Centre`) appelle `GET /villes/nordheim/artefacts`, que devrait renvoyer l'API ?

1. Sélectionnez l'utilisateur **`alaric`**
2. Cliquez sur **« Generated access token »**
3. Cherchez le claim `ville_origine`
4. **Observation :** `ville_origine: "Valdoria-Centre"`
5. **Conclusion logique métier :** L'API devrait :
   - Vérifier que l'utilisateur a le rôle `marchand` → ✅ OK (Alaric l'a)
   - Lire le claim `ville_origine` → `Valdoria-Centre`
   - **Selon la logique métier choisie :**
     - **Option A (strict)** : Refuser car Alaric n'est pas de Nordheim
     - **Option B (gouverneur omniscient)** : Autoriser car Alaric est gouverneur (tous droits)
     - **Option C (filtrage)** : Autoriser mais ne montrer QUE les artefacts de Valdoria-Centre

**Note pour l'implémentation réelle :** Cette logique métier serait implémentée côté API, qui lirait le claim `ville_origine` du jeton pour filtrer les résultats. Keycloak se contente de **fournir l'information** dans le jeton ; c'est l'API qui **applique la règle métier**.

> **Checkpoint :** Vous avez simulé les contrôles d'accès de la Réserve en analysant les jetons. Vous comprenez comment l'API utiliserait les rôles (`realm_access.roles`) et les attributs (`ville_origine`) pour autoriser ou refuser l'accès.

<!-- TODO: Confirmer la logique métier exacte souhaitée pour le filtrage par ville_origine avec l'équipe pédagogique -->

---

### Étape 11 — Observer l'audience dans différents contextes

Le claim `aud` (audience) est un mécanisme de sécurité important. Vérifions son comportement.

#### Test avec audience explicite

1. Dans l'outil Evaluate, sélectionnez l'utilisateur **`alaric`**
2. Dans le champ **« Audience target »**, saisissez : `reserve-valdoria`
3. Cliquez sur **« Generated access token »**
4. Cherchez le claim `aud`
5. **Observation :** `"aud": ["reserve-valdoria", "account"]` (ou uniquement `reserve-valdoria` selon la configuration)

**Point d'observation :** Lorsque nous spécifions explicitement l'audience, Keycloak génère un jeton destiné uniquement à cette API. L'API peut valider que le jeton lui est bien destiné en vérifiant que le claim `aud` contient son client ID.

#### Test avec audience par défaut

6. Laissez le champ **« Audience target »** vide
7. Cliquez sur **« Generated access token »**
8. Cherchez le claim `aud`
9. **Observation :** `"aud": ["reserve-valdoria", "account"]`

**Point d'observation :** Grâce au mapper `audience-reserve-valdoria` que nous avons créé, le claim `aud` contient toujours `reserve-valdoria`, même sans spécifier explicitement l'audience. C'est le comportement souhaité : le Comptoir demande toujours des jetons pour la Réserve.

> **Checkpoint :** Vous comprenez le concept d'audience et avez vérifié que les jetons émis par le Comptoir sont bien destinés à la Réserve.

---

### Étape 12 — Récapitulatif de la configuration

Félicitations ! Vous avez configuré l'ensemble du système d'authentification et d'autorisation de Valdoria. Récapitulons ce qui a été mis en place :

**Clients créés :**

| Client | Type | Rôle |
| --- | --- | --- |
| `comptoir-des-voyageurs` | Public (SPA) | Application front-end pour l'authentification |
| `reserve-valdoria` | Bearer-only | API protégée validant les jetons |

**Mappers configurés :**

| Mapper | Emplacement | Fonction |
| --- | --- | --- |
| `realm roles` | Scope `roles` (par défaut) | Injecte les rôles de royaume dans `realm_access.roles` |
| `ville-origine-mapper` | Scope `profil-valdorien` | Injecte l'attribut `ville_origine` dans le jeton |
| `audience-reserve-valdoria` | Scope dédié du Comptoir | Force l'audience `reserve-valdoria` dans le claim `aud` |

**Flux configuré :**

- **Authorization Code Flow + PKCE** (méthode `S256`) pour le client `comptoir-des-voyageurs`

**Jetons émis :**

Les jetons contiennent maintenant :
- **Informations d'identité** : nom, email, username
- **Rôles de royaume** : `gouverneur`, `marchand`, `artisan`, `sujet`, etc. (avec héritage via rôles composites)
- **Attribut personnalisé** : `ville_origine`
- **Audience** : `reserve-valdoria` (indique que le jeton est destiné à l'API)

**Contrôle d'accès simulé :**

Grâce à l'outil Evaluate, vous avez vérifié que :
- Alaric (gouverneur) peut accéder à tous les endpoints
- Brunhild (maitre-forgeron) ne peut pas accéder à `/inventaire` (pas de rôle `marchand`)
- Cedric (artisan) ne peut pas accéder à `/inventaire` (pas de rôle `marchand`)
- L'attribut `ville_origine` est disponible pour le filtrage contextuel

> **Checkpoint final :** Le Comptoir des voyageurs et la Réserve sont opérationnels. Les jetons émis contiennent toutes les informations nécessaires pour l'authentification et l'autorisation.

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
| Les rôles de royaume n'apparaissent pas dans le jeton | Le scope `roles` n'est pas assigné au client | Vérifiez dans Client scopes > Assigned default client scopes que `roles` est présent |
| L'attribut `ville_origine` n'apparaît pas | Le scope `profil-valdorien` n'est pas assigné ou le mapper est mal configuré | Vérifiez que le scope est assigné et que le mapper cible bien l'attribut `ville_origine` |
| Le claim `aud` ne contient pas `reserve-valdoria` | Le mapper d'audience n'est pas créé ou mal configuré | Créez le mapper dans le scope dédié du client `comptoir-des-voyageurs` |
| Le client `comptoir-des-voyageurs` demande un secret | Client authentication est activé | Désactivez « Client authentication » dans la configuration du client |
| L'outil Evaluate ne génère rien | Aucun utilisateur sélectionné | Sélectionnez un utilisateur dans le champ « Users » |
| Les rôles hérités ne s'affichent pas | C'est normal — ils sont tous listés au même niveau | Keycloak inclut tous les rôles (directs + hérités) dans le claim `realm_access.roles` sans distinction |
| Le champ « Dedicated scope » n'apparaît pas | Version de Keycloak différente ou traduction | Cherchez le scope nommé `comptoir-des-voyageurs-dedicated` dans la liste des scopes |
| PKCE n'est pas disponible dans les options | Mauvaise section consultée | Allez dans l'onglet « Advanced » du client, section « Proof Key for Code Exchange Code Challenge Method » |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Analyser le jeton avec jwt.io

1. Copiez le jeton généré par l'outil Evaluate (format brut, avant le décodage — cliquez sur « Copy to clipboard » si disponible)
2. Accédez à **https://jwt.io**
3. Collez le jeton dans la section « Encoded »
4. **Observation :** Le jeton est décodé en 3 sections :
   - **Header :** algorithme de signature (`RS256`), type (`JWT`)
   - **Payload :** tous les claims (rôles, attributs, audience, etc.)
   - **Signature :** signature cryptographique pour garantir l'intégrité

**Note :** jwt.io affichera « Invalid Signature » car il ne connaît pas la clé publique de votre Keycloak. C'est normal — l'outil reste utile pour visualiser le contenu.

### Tester le refresh token

1. Dans l'outil Evaluate, cliquez sur **« Generated refresh token »**
2. **Observation :** Un jeton différent s'affiche, généralement plus long
3. Cherchez le claim `typ`
4. **Observation :** `"typ": "Refresh"`

**Point d'observation :** Le refresh token permet de renouveler l'access token sans redemander à l'utilisateur de se reconnecter. Il a une durée de vie beaucoup plus longue (configurée dans Realm settings > Tokens > Refresh Token Max).

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
   - **HS256** : signature HMAC (rarement utilisé)
   - **AES** : chiffrement des tokens

4. Cliquez sur le bouton **« Public key »** de la clé RS256 active
5. **Observation :** La clé publique s'affiche au format PEM
6. **Note :** Les APIs peuvent télécharger cette clé publique via l'endpoint `http://localhost:8080/realms/valdoria/protocol/openid-connect/certs` (JWKS) pour valider localement les jetons sans appeler Keycloak

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

---

## Récapitulatif des concepts OIDC/OAuth2 abordés

| Concept | Explication | Emplacement dans Keycloak |
| --- | --- | --- |
| **Client public** | Client sans secret (app front-end) | Client authentication = OFF |
| **Client bearer-only** | Client qui valide les jetons (API) | Client authentication = ON + tous flux désactivés |
| **Authorization Code Flow** | Flux avec redirection (navigateur) | Authentication flow > Standard flow |
| **PKCE** | Protection contre l'interception du code | Advanced > Proof Key for Code Exchange (S256) |
| **Access Token** | Jeton d'autorisation (courte durée) | Contient rôles et attributs |
| **Refresh Token** | Jeton de renouvellement (longue durée) | Permet de rafraîchir l'access token |
| **ID Token** | Jeton d'identité (OIDC) | Contient informations utilisateur |
| **Audience (`aud`)** | Destinataire du jeton | Claim indiquant l'API cible |
| **Mapper** | Injecteur de claims dans le jeton | Ajoute rôles, attributs, audience |
| **Client Scope** | Ensemble de mappers réutilisable | Regroupe les mappers par thème |
| **Evaluate** | Prévisualisation des jetons | Client scopes > Evaluate |

---

## Lexique complet de l'Empire d'Authéria

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm `master` | Le Château de l'empereur (super-admin) |
| Client public (SPA) | Comptoir des voyageurs (lieu public) |
| Client bearer-only (API) | Réserve (ressources protégées) |
| Realm role | Profil métier (gouverneur, marchand, artisan) |
| Composite role | Profil hiérarchique (inclut d'autres profils) |
| Groupe | Guilde (ex : guilde des forgerons) |
| Utilisateur | Sujet de l'empire |
| Attribut utilisateur | Caractéristique du sujet (ville d'origine) |
| Jeton JWT (Access Token) | Laissez-passer numérique |
| Claim JWT | Information inscrite sur le laissez-passer |
| Audience (`aud`) | Destination du laissez-passer |
| Mapper | Cachet officiel (ajoute des infos au laissez-passer) |
| Client Scope | Parchemin officiel (ensemble de cachets) |
| SMTP / Email | Réseau de messagers impériaux |
| Authorization Code | Procédure d'obtention d'un laissez-passer |
| PKCE | Sceau de sécurité (anti-contrefaçon) |
| Outil Evaluate | Atelier de prévisualisation des laissez-passer |
