# Exercice 3 — Peupler Valdoria et attribuer les profils métier

> **Module 1 — Fondations et environnement**
> Durée estimée : 30 minutes | Difficulté : ★★☆☆☆ (débutant-intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer des utilisateurs dans le realm
- Attribuer des rôles de royaume aux utilisateurs
- Enrichir les profils utilisateurs avec des attributs personnalisés
- Observer les rôles et attributs dans un jeton JWT (Access Token)
- Comprendre comment les applications exploiteront ces informations

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit être créé avec les rôles (exercice 2 complété)
- Accès à la console d'administration de Keycloak

### Prérequis de connaissances

- Avoir complété l'exercice 1 (compréhension du realm `master`)
- Avoir complété l'exercice 2 (création du realm `valdoria` et des rôles)
- Comprendre la notion de rôles simples et composites

---

## Contexte narratif

> La province de Valdoria possède désormais ses institutions. Il est temps d'accueillir les premiers sujets et de leur attribuer leurs profils métier.
>
> Les architectes créent les premiers habitants de Valdoria : un gouverneur pour administrer la province, un maître forgeron pour diriger les ateliers, des artisans, marchands et scribes pour faire vivre l'économie.
>
> Chaque sujet reçoit un **laissez-passer numérique** (jeton JWT) qui matérialise son identité et ses droits. Les architectes apprennent à observer ces laissez-passer pour comprendre comment les applications contrôleront les accès.

### Lexique de l'Empire

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Utilisateur | Sujet de l'empire |
| Attribut utilisateur | Caractéristique personnelle (rang, ville d'origine) |
| Jeton JWT (Access Token) | Laissez-passer numérique |
| Claim JWT | Information inscrite sur le laissez-passer |
| Account Console | Bureau des affaires civiles |
| Outil Evaluate | Atelier de prévisualisation des laissez-passer |

---

## Étapes

### Étape 1 — Créer les premiers sujets de Valdoria

La province accueille ses cinq premiers habitants. Chacun recevra un profil métier différent.

1. Connectez-vous à la console d'administration de Keycloak : **http://localhost:8080/admin**
2. Identifiants : `admin` / `admin`
3. Vérifiez que vous êtes bien dans le realm **`valdoria`** (menu déroulant en haut à gauche)
4. Dans le menu latéral gauche, cliquez sur **« Users »**
5. Cliquez sur **« Create new user »**

#### Créer Alaric le gouverneur

6. Remplissez les champs suivants :

| Champ | Valeur |
| --- | --- |
| **Username** | `alaric` |
| **Email** | `alaric@valdoria.empire` |
| **Email verified** | ✅ (coché) |
| **First name** | `Alaric` |
| **Last name** | `le gouverneur` |

7. Cliquez sur **« Create »**
8. Vous êtes redirigé vers la page de détails de l'utilisateur
9. Cliquez sur l'onglet **« Credentials »**
10. Cliquez sur **« Set password »**
11. Remplissez les champs :
    - **Password :** `valdoria123`
    - **Password confirmation :** `valdoria123`
    - **Temporary :** OFF (désactivé — l'utilisateur n'aura pas à changer son mot de passe à la première connexion)
12. Cliquez sur **« Save »**
13. Confirmez dans la boîte de dialogue

> **Checkpoint :** L'utilisateur `alaric` est créé avec le nom complet "Alaric le gouverneur" et un mot de passe défini.

#### Créer les autres sujets

Répétez les étapes 5 à 13 pour créer les utilisateurs suivants :

**Brunhild le Maître forgeron**

| Champ | Valeur |
| --- | --- |
| **Username** | `brunhild` |
| **Email** | `brunhild@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Brunhild` |
| **Last name** | `le Maître forgeron` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

**Cedric l'artisan**

| Champ | Valeur |
| --- | --- |
| **Username** | `cedric` |
| **Email** | `cedric@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Cedric` |
| **Last name** | `l'artisan` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

**Diane la marchande**

| Champ | Valeur |
| --- | --- |
| **Username** | `diane` |
| **Email** | `diane@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Diane` |
| **Last name** | `la marchande` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

**Edmond le scribe**

| Champ | Valeur |
| --- | --- |
| **Username** | `edmond` |
| **Email** | `edmond@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Edmond` |
| **Last name** | `le scribe` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

> **Checkpoint :** Vous avez créé 5 utilisateurs dans le realm `valdoria`. Vérifiez en cliquant sur **« Users »** puis **« View all users »** : les 5 utilisateurs doivent apparaître dans la liste.

---

### Étape 2 — Attribuer les profils métier (rôles)

Chaque sujet reçoit maintenant son profil métier officiel.

#### Attribuer le rôle `gouverneur` à Alaric

1. Dans la liste des utilisateurs, cliquez sur **`alaric`**
2. Cliquez sur l'onglet **« Role mapping »**
3. Cliquez sur **« Assign role »**
4. Dans la liste qui apparaît, **cochez le rôle** `gouverneur`
5. Cliquez sur **« Assign »**
6. **Observation :** Le rôle `gouverneur` apparaît maintenant dans la liste des rôles attribués
7. **Point d'observation :** Comme `gouverneur` est un rôle composite (créé dans l'exercice 2), Alaric hérite automatiquement des rôles `sujet`, `artisan`, `marchand` et `scribe`. Vous pouvez le vérifier en activant le filtre **« Show inherited roles »** (ou **« Afficher les rôles hérités »**) en haut de la liste.

#### Attribuer les rôles aux autres utilisateurs

Répétez les étapes 1 à 5 pour attribuer les rôles suivants :

| Utilisateur | Rôle à attribuer |
| --- | --- |
| `brunhild` | `maitre-forgeron` |
| `cedric` | `artisan` |
| `diane` | `marchand` |
| `edmond` | `scribe` |

> **Checkpoint :** Chaque utilisateur possède maintenant son rôle. Vérifiez en consultant l'onglet « Role mapping » de chaque utilisateur.

---

### Étape 3 — Enrichir les profils avec des attributs personnalisés

Les sujets de Valdoria ont des caractéristiques personnelles qui ne sont pas couvertes par les champs standards. Ajoutons des attributs personnalisés.

#### Ajouter des attributs à Alaric

1. Dans la liste des utilisateurs, cliquez sur **`alaric`**
2. Cliquez sur l'onglet **« Attributes »**
3. Cliquez sur **« Add an attribute »** (ou le bouton **« + »**)
4. Remplissez les champs :
   - **Key :** `rang`
   - **Value :** `Gouverneur suprême`
5. Cliquez sur **« Save »**
6. Ajoutez un second attribut :
   - **Key :** `ville_origine`
   - **Value :** `Capitale de Valdoria`
7. Cliquez sur **« Save »**

**Point d'observation :** Les attributs personnalisés permettent de stocker des informations métier spécifiques à votre organisation. Ces attributs peuvent ensuite être injectés dans les jetons JWT via des mappers (ce sera abordé dans un exercice ultérieur).

#### Ajouter des attributs aux autres utilisateurs

Répétez les étapes 1 à 7 pour enrichir les profils des autres utilisateurs :

**Brunhild**

| Key | Value |
| --- | --- |
| `rang` | `Maître de la forge` |
| `ville_origine` | `Quartier des artisans` |

**Cedric**

| Key | Value |
| --- | --- |
| `rang` | `Compagnon artisan` |
| `ville_origine` | `Quartier des artisans` |

**Diane**

| Key | Value |
| --- | --- |
| `rang` | `Marchande en chef` |
| `ville_origine` | `Place du marché` |

**Edmond**

| Key | Value |
| --- | --- |
| `rang` | `Archiviste` |
| `ville_origine` | `Bibliothèque royale` |

> **Checkpoint :** Chaque utilisateur possède maintenant deux attributs personnalisés : `rang` et `ville_origine`.

---

### Étape 4 — Prévisualiser le laissez-passer avec l'outil Evaluate de Keycloak

Avant même de se connecter en tant qu'utilisateur, Keycloak offre un outil puissant pour **prévisualiser** le contenu du jeton JWT qui sera généré. C'est l'outil **Evaluate** disponible dans la configuration des clients.

#### Accéder à l'outil Evaluate

1. Dans la console d'administration, assurez-vous d'être dans le realm **`valdoria`**
2. Dans le menu latéral gauche, cliquez sur **« Clients »**
3. Cliquez sur le client **`account-console`** (c'est le client utilisé par la console de gestion du compte)
4. Cliquez sur l'onglet **« Client scopes »**
5. Cliquez sur le sous-onglet **« Evaluate »**

Vous accédez à l'interface d'évaluation des jetons. Cette interface permet de simuler la génération d'un jeton pour un utilisateur donné, sans avoir à se connecter réellement.

#### Générer un jeton de prévisualisation pour Alaric

6. Dans le champ **« Users »**, commencez à taper `alaric` puis sélectionnez **`alaric`** dans la liste déroulante
7. Laissez les autres champs par défaut (les scopes par défaut du client seront utilisés)
8. Cliquez sur **« Generated access token »** (ou **« Jeton d'accès généré »**)

**Observation :** Un jeton JWT complet s'affiche dans la zone de texte. Ce jeton est **déjà décodé** et lisible directement !

#### Analyser le contenu du jeton

9. Faites défiler le contenu du jeton généré et identifiez les sections clés :

**Informations d'identité :**

```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "http://localhost:8080/realms/valdoria",
  "sub": "...",
  "preferred_username": "alaric",
  "email": "alaric@valdoria.empire",
  "given_name": "Alaric",
  "family_name": "le gouverneur",
  "name": "Alaric le gouverneur"
}
```

**Les rôles de royaume (realm_access) :**

```json
{
  "realm_access": {
    "roles": [
      "gouverneur",
      "sujet",
      "artisan",
      "marchand",
      "scribe",
      "default-roles-valdoria",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

**Points d'observation importants :**

- **`preferred_username`** : le nom d'utilisateur (`alaric`)
- **`email`** : l'adresse email de l'utilisateur
- **`given_name`** et **`family_name`** : le prénom ("Alaric") et le nom de famille ("le gouverneur")
- **`name`** : le nom complet ("Alaric le gouverneur")
- **`realm_access.roles`** : **C'EST ICI QUE SE TROUVENT LES RÔLES !**
  - Le rôle `gouverneur` est présent
  - Les rôles hérités (`sujet`, `artisan`, `marchand`, `scribe`) sont également présents grâce au rôle composite
  - Les rôles par défaut du realm sont aussi inclus

**Point clé :** Les applications utilisent le claim `realm_access.roles` pour contrôler l'accès aux ressources. Par exemple, une application peut vérifier si le jeton contient le rôle `gouverneur` avant d'afficher la page d'administration.

#### Comparer avec d'autres utilisateurs

10. Changez l'utilisateur sélectionné pour **`cedric`**
11. Cliquez à nouveau sur **« Generated access token »**
12. **Observation :** Le claim `realm_access.roles` ne contient que le rôle `artisan` (plus les rôles par défaut)

```json
{
  "realm_access": {
    "roles": [
      "artisan",
      "default-roles-valdoria",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

13. Testez également avec **`brunhild`** pour observer les rôles du composite `maitre-forgeron` :

```json
{
  "realm_access": {
    "roles": [
      "maitre-forgeron",
      "artisan",
      "sujet",
      "default-roles-valdoria",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

**Point d'observation :** L'outil Evaluate est extrêmement pratique pour le debug et la vérification des configurations. Il permet de voir exactement ce que contiendra le jeton **avant** de déployer une application, sans avoir à se connecter manuellement avec chaque utilisateur.

#### Observer les autres types de jetons

14. Cliquez sur **« Generated ID token »** pour voir le jeton d'identité (ID Token)
15. Cliquez sur **« Generated user info »** pour voir les informations utilisateur telles qu'elles seraient retournées par l'endpoint `/userinfo`

**Note importante :** Les attributs personnalisés (`rang`, `ville_origine`) **n'apparaissent pas encore** dans le jeton. Pour les inclure, il faudra configurer des **mappers** (ce sera abordé dans un exercice ultérieur).

> **Checkpoint :** Vous avez utilisé l'outil Evaluate pour prévisualiser le jeton JWT d'Alaric. Vous avez identifié les rôles dans le claim `realm_access.roles` et constaté que les rôles hérités via le rôle composite `gouverneur` sont tous présents.

---

### Étape 5 — Se connecter à la console de gestion du compte

Maintenant que nous avons compris le contenu du jeton via l'outil Evaluate, vérifions que tout fonctionne en conditions réelles. Chaque sujet de Valdoria peut accéder à son propre bureau des affaires civiles pour consulter son profil.

1. Ouvrez un **nouvel onglet de navigation privée** (mode incognito) dans votre navigateur
2. Accédez à : **http://localhost:8080/realms/valdoria/account**
3. Vous arrivez sur la page de connexion de Valdoria
4. Connectez-vous avec les identifiants d'Alaric :
   - **Username or email :** `alaric`
   - **Password :** `valdoria123`
5. Cliquez sur **« Sign In »**
6. Vous arrivez sur la **Account Console** (console de gestion du compte utilisateur)
7. **Observation :** L'interface affiche les informations de base d'Alaric : nom complet, email, etc.
8. Explorez les sections disponibles :
   - **Personal info** — informations personnelles
   - **Account security** — sécurité du compte (mot de passe, 2FA)
   - **Applications** — applications auxquelles l'utilisateur a accès
   - **Resources** — ressources partagées (UMA)

**Point d'observation :** La Account Console est une interface en libre-service qui permet aux utilisateurs de gérer leur propre compte sans intervention d'un administrateur. En production, c'est ici que les utilisateurs peuvent mettre à jour leur profil, activer la double authentification, ou révoquer des sessions.

> **Checkpoint :** Vous êtes connecté à la Account Console en tant qu'Alaric. L'interface affiche "Alaric le gouverneur".

---

### Étape 6 — Observer le jeton réel via les outils développeur du navigateur

L'outil Evaluate nous a montré une **prévisualisation** du jeton. Maintenant, observons le **vrai jeton** échangé entre le navigateur et Keycloak.

#### Récupérer le jeton via les outils développeur

1. Toujours dans l'onglet incognito où vous êtes connecté en tant qu'Alaric, ouvrez les **outils développeur** du navigateur :
   - **Chrome / Edge :** `F12` ou `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Firefox :** `F12` ou `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Cliquez sur l'onglet **« Network »** (Réseau)
3. Cochez **« Preserve log »** (Conserver le journal)
4. Actualisez la page (`F5`)
5. Dans la liste des requêtes, cherchez une requête vers `/token`
6. Cliquez sur cette requête, puis sur l'onglet **« Response »** (ou **« Preview »**)
7. **Observation :** La réponse contient un objet JSON avec plusieurs champs, dont `access_token`
8. Copiez la valeur complète du champ `access_token` (c'est une longue chaîne de caractères encodée en base64)

**Méthode alternative — Session Storage :**

9. Cliquez sur l'onglet **« Application »** (Chrome/Edge) ou **« Storage »** (Firefox)
10. Dans le panneau de gauche, développez **« Session Storage »**
11. Cliquez sur **`http://localhost:8080`**
12. Cherchez une clé qui contient `token` — la valeur contient le jeton d'accès

#### Décoder le jeton sur jwt.io

13. Ouvrez un nouvel onglet et accédez à : **https://jwt.io**
14. Dans la section **« Encoded »** (à gauche), collez le jeton JWT que vous avez copié
15. La section **« Decoded »** (à droite) affiche automatiquement le contenu décodé du jeton
16. **Observation :** Le contenu correspond exactement à ce que l'outil Evaluate avait prévisualisé !

**Note :** jwt.io peut afficher "Invalid Signature" en rouge — c'est normal car le site ne connaît pas la clé publique de votre Keycloak. Le décodage fonctionne quand même correctement.

> **Checkpoint :** Vous avez récupéré le vrai jeton JWT depuis le navigateur et vérifié qu'il correspond à la prévisualisation de l'outil Evaluate.

---

### Étape 7 — Analyser la structure complète du jeton

Prenons le temps d'analyser en détail les trois sections du jeton JWT visible sur jwt.io.

**Header (en-tête)**

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "..."
}
```

- `alg` : algorithme de signature (RS256 = RSA avec SHA-256)
- `typ` : type de jeton (JWT)
- `kid` : identifiant de la clé utilisée pour signer le jeton

**Payload (charge utile)**

C'est ici que se trouvent les informations importantes :

```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "...",
  "iss": "http://localhost:8080/realms/valdoria",
  "sub": "...",
  "typ": "Bearer",
  "azp": "account-console",
  "preferred_username": "alaric",
  "email": "alaric@valdoria.empire",
  "given_name": "Alaric",
  "family_name": "le gouverneur",
  "realm_access": {
    "roles": [
      "gouverneur",
      "sujet",
      "artisan",
      "marchand",
      "scribe",
      "default-roles-valdoria",
      "offline_access",
      "uma_authorization"
    ]
  }
}
```

**Explication des claims principaux :**

| Claim | Description |
| --- | --- |
| `exp` | Date d'expiration du jeton (timestamp Unix) |
| `iat` | Date de création du jeton (timestamp Unix) |
| `iss` | Issuer — l'émetteur du jeton (URL du realm) |
| `sub` | Subject — identifiant unique de l'utilisateur |
| `azp` | Authorized party — le client qui a demandé le jeton |
| `preferred_username` | Nom d'utilisateur |
| `email` | Adresse email |
| `given_name` | Prénom |
| `family_name` | Nom de famille |
| `realm_access.roles` | Liste des rôles de royaume |

**Signature**

La troisième partie du JWT est la signature cryptographique. Elle garantit que le jeton n'a pas été modifié. Seul Keycloak (qui possède la clé privée) peut créer une signature valide.

> **Checkpoint :** Vous comprenez la structure d'un jeton JWT : Header, Payload et Signature. Vous savez où trouver les rôles (`realm_access.roles`) et les informations d'identité.

---

### Étape 8 — Récapitulatif : comparer les jetons de tous les utilisateurs

Grâce à l'outil Evaluate, nous avons déjà comparé les jetons de plusieurs utilisateurs à l'étape 4. Voici un récapitulatif de ce que nous avons observé :

| Utilisateur | Rôle attribué | Rôles dans le jeton |
| --- | --- | --- |
| Alaric | `gouverneur` (composite) | `gouverneur`, `sujet`, `artisan`, `marchand`, `scribe` + rôles par défaut |
| Brunhild | `maitre-forgeron` (composite) | `maitre-forgeron`, `artisan`, `sujet` + rôles par défaut |
| Cedric | `artisan` (simple) | `artisan` + rôles par défaut |
| Diane | `marchand` (simple) | `marchand` + rôles par défaut |
| Edmond | `scribe` (simple) | `scribe` + rôles par défaut |

**Observations clés :**

1. **Rôles simples** : Cedric, Diane et Edmond ne possèdent que leur rôle direct (plus les rôles par défaut du realm)

2. **Rôles composites** : 
   - Alaric (`gouverneur`) hérite de **tous** les rôles de base car `gouverneur` les inclut tous
   - Brunhild (`maitre-forgeron`) hérite de `artisan` et `sujet` car ce sont les rôles inclus dans `maitre-forgeron`

3. **Rôles par défaut** : Tous les utilisateurs possèdent automatiquement `default-roles-valdoria`, `offline_access` et `uma_authorization`

**Schéma de la hiérarchie des rôles :**

```
gouverneur (Alaric)
├── sujet
├── artisan
├── marchand
└── scribe

maitre-forgeron (Brunhild)
├── artisan
└── sujet

artisan (Cedric) — rôle simple, pas d'héritage

marchand (Diane) — rôle simple, pas d'héritage

scribe (Edmond) — rôle simple, pas d'héritage
```

> **Checkpoint :** Vous comprenez comment les rôles composites injectent automatiquement tous leurs rôles associés dans le jeton JWT.

---

## Point clé

> **Les rôles de royaume sont le mécanisme central d'autorisation dans Keycloak.**
>
> Ils sont transportés dans le jeton JWT (claim `realm_access.roles`) et exploitables par les applications pour contrôler l'accès aux ressources.
>
> Les rôles composites permettent de gérer efficacement les hiérarchies de droits : un utilisateur avec le rôle `gouverneur` hérite automatiquement de tous les rôles de base sans qu'il soit nécessaire de les attribuer manuellement.
>
> Les attributs personnalisés enrichissent les profils utilisateurs avec des informations métier spécifiques. Pour les inclure dans les jetons, il faudra configurer des mappers (exercice ultérieur).

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| L'onglet « Evaluate » n'apparaît pas | Vous n'êtes pas dans l'onglet « Client scopes » du client | Allez dans Clients > account-console > Client scopes > Evaluate |
| Le champ « Users » ne propose aucun utilisateur | Les utilisateurs n'ont pas été créés ou vous êtes dans le mauvais realm | Vérifiez que vous êtes dans le realm `valdoria` et que les utilisateurs existent |
| Le jeton généré par Evaluate est vide | Aucun utilisateur sélectionné | Sélectionnez un utilisateur dans le champ « Users » avant de cliquer sur « Generated access token » |
| Impossible de se connecter à la Account Console | Mauvais identifiants ou realm incorrect | Vérifiez que l'URL contient `/realms/valdoria/account` et que les identifiants sont corrects |
| Le jeton ne s'affiche pas dans les outils développeur | Session Storage vide ou mauvais onglet | Utilisez l'outil Evaluate de Keycloak pour prévisualiser le jeton |
| Les rôles n'apparaissent pas dans le jeton | Rôles non attribués ou jeton expiré | Vérifiez l'onglet « Role mapping » de l'utilisateur et générez un nouveau jeton |
| jwt.io affiche "Invalid Signature" | Normal — jwt.io ne connaît pas la clé publique de votre Keycloak | Ignorez cet avertissement, le décodage fonctionne quand même |
| Les attributs personnalisés n'apparaissent pas dans le jeton | C'est normal — les mappers ne sont pas encore configurés | Les attributs seront injectés dans un exercice ultérieur via des mappers |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Activer la journalisation des événements

1. Dans **« Realm settings »** > **« Events »**, cliquez sur l'onglet **« User events settings »**
2. Activez **« Save events »** (toggle ON)
3. Dans **« Saved types »**, cochez les événements suivants :
   - `LOGIN`
   - `LOGIN_ERROR`
   - `LOGOUT`
   - `UPDATE_EMAIL`
   - `UPDATE_PROFILE`
4. Cliquez sur **« Save »**
5. Connectez-vous à nouveau avec un utilisateur via la Account Console
6. Retournez dans **« Realm settings »** > **« Events »**, onglet **« User events »**
7. **Observation :** Les événements de connexion sont enregistrés avec l'horodatage, l'adresse IP et le type d'événement

**Point d'observation :** Les événements sont essentiels pour l'audit de sécurité. En production, ils sont souvent exportés vers un SIEM pour détecter les comportements suspects (tentatives de connexion répétées, accès depuis des pays inhabituels, etc.).

### Observer les sessions actives

1. Dans le menu latéral gauche, cliquez sur **« Sessions »**
2. **Observation :** Les sessions actives des utilisateurs connectés sont listées
3. Cliquez sur une session pour voir les détails : utilisateur, adresse IP, heure de début, dernier accès
4. Vous pouvez révoquer une session en cliquant sur **« Sign out »**

**Point d'observation :** En production, la gestion des sessions permet de détecter et bloquer des sessions suspectes (ex : un utilisateur connecté depuis deux pays différents simultanément).

### Tester la révocation d'une session

1. Connectez-vous à la Account Console avec Alaric (onglet incognito)
2. Dans la console d'administration (onglet normal), allez dans **« Sessions »**
3. Identifiez la session d'Alaric et cliquez sur **« Sign out »**
4. Retournez dans l'onglet incognito et actualisez la page
5. **Observation :** Alaric est déconnecté et redirigé vers la page de connexion

**Point d'observation :** La révocation de session est un outil de sécurité important. Elle permet de forcer la déconnexion d'un utilisateur en cas de compromission de compte ou de départ d'un employé.

### Comparer les jetons de tous les utilisateurs

Créez un tableau comparatif des rôles présents dans le jeton de chaque utilisateur :

| Utilisateur | Rôle attribué | Rôles dans le jeton |
| --- | --- | --- |
| Alaric | `gouverneur` | `gouverneur`, `sujet`, `artisan`, `marchand`, `scribe` |
| Brunhild | `maitre-forgeron` | `maitre-forgeron`, `artisan`, `sujet` |
| Cedric | `artisan` | `artisan` |
| Diane | `marchand` | `marchand` |
| Edmond | `scribe` | `scribe` |

**Point d'observation :** Cette comparaison illustre clairement la hiérarchie des rôles et l'héritage via les rôles composites.

---

## Récapitulatif des utilisateurs créés

| Username | Nom complet | Email | Rôle | Attributs |
| --- | --- | --- | --- | --- |
| `alaric` | Alaric le gouverneur | alaric@valdoria.empire | `gouverneur` | rang: Gouverneur suprême<br>ville_origine: Capitale de Valdoria |
| `brunhild` | Brunhild le Maître forgeron | brunhild@valdoria.empire | `maitre-forgeron` | rang: Maître de la forge<br>ville_origine: Quartier des artisans |
| `cedric` | Cedric l'artisan | cedric@valdoria.empire | `artisan` | rang: Compagnon artisan<br>ville_origine: Quartier des artisans |
| `diane` | Diane la marchande | diane@valdoria.empire | `marchand` | rang: Marchande en chef<br>ville_origine: Place du marché |
| `edmond` | Edmond le scribe | edmond@valdoria.empire | `scribe` | rang: Archiviste<br>ville_origine: Bibliothèque royale |

**Mot de passe commun :** `valdoria123`

---

## Lexique complet de l'Empire d'Authéria

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm `master` | Le Château de l'empereur (super-admin) |
| Realm role | Profil métier (fonction dans la société) |
| Composite role | Profil hiérarchique (inclut d'autres profils) |
| Utilisateur | Sujet de l'empire |
| Attribut utilisateur | Caractéristique personnelle |
| Jeton JWT (Access Token) | Laissez-passer numérique |
| Claim JWT | Information inscrite sur le laissez-passer |
| Account Console | Bureau des affaires civiles |
| Outil Evaluate | Atelier de prévisualisation des laissez-passer |
| Client applicatif | Échoppe (point de service métier) |
| Groupe | Guilde (ex : guilde des forgerons) |
| Client Scope / Mapper | Parchemin officiel |
| Service Account (M2M) | Automate impérial |
| Annuaire LDAP | Province alliée |
| IDP externe (SSO) | Ambassade étrangère |
| Politique de sécurité | Fortification |
| SMTP / Email | Réseau de messagers impériaux |
