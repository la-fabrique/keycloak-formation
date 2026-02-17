# Exercice 3 — Peupler Valdoria et attribuer les profils métier

> **Module 1 — Fondations et environnement**
> Durée estimée : 30 minutes | Difficulté : ★★☆☆☆ (débutant-intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer des utilisateurs dans le realm
- Attribuer des rôles de royaume aux utilisateurs
- Vérifier l'héritage des rôles via les rôles composites
- Utiliser l'outil Evaluate pour prévisualiser le contenu d'un jeton JWT
- Comprendre la différence entre rôles de royaume et rôles de client
- Observer comment les rôles sont inclus (ou non) dans les jetons selon le contexte

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
> Les architectes créent les trois premiers habitants de Valdoria : un gouverneur pour administrer la province, une marchande pour gérer le commerce, et un simple sujet pour représenter les citoyens ordinaires.
>
> Chaque sujet reçoit un **laissez-passer numérique** (jeton JWT) qui matérialise son identité. Les architectes découvrent l'**atelier de prévisualisation des laissez-passer** (outil Evaluate) qui leur permet d'observer le contenu des jetons avant même qu'un sujet ne se connecte.
>
> Ils apprennent également qu'il existe deux types de droits : les **profils métier** (rôles de royaume) qui définissent la fonction dans la société, et les **permissions sur les services** (rôles de client) qui contrôlent l'accès à chaque application.

### Lexique de l'Empire

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Utilisateur | Sujet de l'empire |
| Rôle de royaume | Profil métier (gouverneur, marchand, sujet) |
| Rôle de client | Permission sur un service spécifique |
| Jeton JWT (Access Token) | Laissez-passer numérique |
| Claim JWT | Information inscrite sur le laissez-passer |
| Account Console | Bureau des affaires civiles |
| Outil Evaluate | Atelier de prévisualisation des laissez-passer |

---

## Étapes

### Étape 1 — Créer les premiers sujets de Valdoria

La province accueille ses trois premiers habitants. Chacun recevra un profil métier différent pour illustrer les différents types de rôles.

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

**Brunhild la marchande**

| Champ | Valeur |
| --- | --- |
| **Username** | `brunhild` |
| **Email** | `brunhild@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Brunhild` |
| **Last name** | `la marchande` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

**Cedric le sujet**

| Champ | Valeur |
| --- | --- |
| **Username** | `cedric` |
| **Email** | `cedric@valdoria.empire` |
| **Email verified** | ✅ |
| **First name** | `Cedric` |
| **Last name** | `le sujet` |
| **Password** | `valdoria123` |
| **Temporary** | OFF |

> **Checkpoint :** Vous avez créé 3 utilisateurs dans le realm `valdoria`. Vérifiez en cliquant sur **« Users »** puis **« View all users »** : les 3 utilisateurs doivent apparaître dans la liste.

**Pourquoi seulement 3 utilisateurs ?**

Ces trois utilisateurs suffisent pour illustrer tous les concepts pédagogiques :
- **Alaric** (gouverneur) → rôle composite (hérite de `sujet` + `marchand`)
- **Brunhild** (marchand) → rôle simple
- **Cedric** (sujet) → rôle simple (rôle de base)

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
7. **Point d'observation :** Comme `gouverneur` est un rôle composite (créé dans l'exercice 2), Alaric hérite automatiquement des rôles `sujet` et `marchand`. Vous pouvez le vérifier en activant le filtre **« Show inherited roles »** (ou **« Afficher les rôles hérités »**) en haut de la liste.

#### Attribuer les rôles aux autres utilisateurs

Répétez les étapes 1 à 5 pour attribuer les rôles suivants :

| Utilisateur | Rôle à attribuer |
| --- | --- |
| `brunhild` | `marchand` |
| `cedric` | `sujet` |

> **Checkpoint :** Chaque utilisateur possède maintenant son rôle. Vérifiez en consultant l'onglet « Role mapping » de chaque utilisateur.

---

### Étape 3 — Ajouter les attributs personnalisés aux utilisateurs

Les attributs permettent d'enrichir le profil utilisateur avec des informations contextuelles qui ne sont pas liées au contrôle d'accès.

#### 3.1 Comprendre la distinction : rôle vs. attribut

- **Rôle** (`gouverneur`, `marchand`, `sujet`) → **Contrôle d'accès** (qui peut faire quoi)
- **Attribut** (`ville_origine`) → **Enrichissement contextuel** (informations sur l'utilisateur)

Les rôles définissent les permissions, les attributs définissent les caractéristiques.

#### 3.2 Ajouter l'attribut `ville_origine`

Pour chaque utilisateur créé, ajoutons une ville d'origine :

1. Dans la liste des **« Users »**, cliquez sur **`alaric`**
2. Cliquez sur l'onglet **« Attributes »**
3. Cliquez sur **« Add »** (ou le bouton d'ajout d'attribut)
4. Remplissez les champs :
   - **Key :** `ville_origine`
   - **Value :** `Valdoria-Centre`
5. Cliquez sur **« Save »**

Répétez l'opération pour les autres utilisateurs :

| Utilisateur | Attribut `ville_origine` |
| --- | --- |
| `alaric` | `Valdoria-Centre` |
| `brunhild` | `Nordheim` |
| `cedric` | `Sudbourg` |

#### 3.3 Vérifier les attributs

1. Retournez sur l'onglet **« Attributes »** de chaque utilisateur
2. Vérifiez que `ville_origine` apparaît bien avec la valeur correcte

**Point d'observation :** Ces attributs personnalisés enrichissent le profil utilisateur. Dans l'exercice 8, nous configurerons des **mappers** pour injecter ces attributs dans les jetons JWT. Les applications pourront alors utiliser `ville_origine` pour filtrer des données ou personnaliser l'expérience utilisateur.

> **Checkpoint :** Les 3 utilisateurs ont l'attribut `ville_origine` configuré.

---

### Étape 4 — Vérifier les profils utilisateurs

Les utilisateurs de Valdoria sont maintenant créés avec leurs rôles et leurs attributs. Vérifions que leurs profils sont complets.

#### Vérifier le profil d'Alaric

1. Dans la liste des utilisateurs, cliquez sur **`alaric`**
2. Observez l'onglet **« Details »** :
   - Username : `alaric`
   - Email : `alaric@valdoria.empire`
   - First name : `Alaric`
   - Last name : `le gouverneur`
3. Cliquez sur l'onglet **« Role mapping »**
4. Activez le toggle **« Show inherited roles »**
5. **Observation :** Alaric possède le rôle `gouverneur` directement attribué, et hérite automatiquement de `sujet` et `marchand`

> **Checkpoint :** Les trois utilisateurs sont créés avec leurs rôles. Alaric hérite des deux rôles de base via le composite `gouverneur`.

---

### Étape 5 — Prévisualiser le laissez-passer avec l'outil Evaluate de Keycloak

Avant même de se connecter en tant qu'utilisateur, Keycloak offre un outil puissant pour **prévisualiser** le contenu du jeton JWT qui sera généré. C'est l'outil **Evaluate** disponible dans la configuration des clients.

**Contexte technique :** Nous allons vérifier l'access token qui sera généré lorsque l'application cliente **`account-console`** (l'interface web de gestion du compte) appellera l'API cliente **`account`** pour un utilisateur donné. Le client `account-console` est une application publique (SPA - Single Page Application), et le client `account` est l'API backend qui expose les endpoints de gestion du compte utilisateur.

#### Accéder à l'outil Evaluate

1. Dans la console d'administration, assurez-vous d'être dans le realm **`valdoria`**
2. Dans le menu latéral gauche, cliquez sur **« Clients »**
3. Cliquez sur le client **`account-console`** (c'est le client utilisé par la console de gestion du compte)
4. Cliquez sur l'onglet **« Client scopes »**
5. Cliquez sur le sous-onglet **« Evaluate »**

Vous accédez à l'interface d'évaluation des jetons. Cette interface permet de simuler la génération d'un jeton pour un utilisateur donné, sans avoir à se connecter réellement.

#### Générer un jeton de prévisualisation pour Alaric

6. Dans le champ **« Users »**, commencez à taper `alaric` puis sélectionnez **`alaric`** dans la liste déroulante
7. Dans le champ **« Audience target »**, saisissez : `account`
   - **Pourquoi ?** L'audience (`aud`) dans le jeton indique pour quelle API le jeton est destiné. Ici, nous simulons un jeton destiné à l'API `account`.
8. Laissez les autres champs par défaut (les scopes par défaut du client seront utilisés)
9. Cliquez sur **« Generated access token »** (ou **« Jeton d'accès généré »**)

**Observation :** Un jeton JWT complet s'affiche dans la zone de texte. Ce jeton est **déjà décodé** et lisible directement !

#### Analyser le contenu du jeton

10. Faites défiler le contenu du jeton généré et identifiez les sections clés :

**Informations d'identité :**

```json
{
  "exp": 1771336689,
  "iat": 1771336389,
  "iss": "http://localhost:8080/realms/valdoria",
  "aud": "account",
  "sub": "2937527b-b2ad-4844-b70b-6d43acd7428e",
  "typ": "Bearer",
  "azp": "account-console",
  "preferred_username": "alaric",
  "email": "alaric@valdoria.empire",
  "email_verified": true,
  "given_name": "Alaric",
  "family_name": "le gouverneur",
  "name": "Alaric le gouverneur"
}
```

**Les rôles de ressource (resource_access) :**

```json
{
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links"
      ]
    }
  }
}
```

**Points d'observation importants :**

- **`aud`** : audience — l'API pour laquelle ce jeton est destiné (`account`)
- **`azp`** : authorized party — le client qui a demandé le jeton (`account-console`)
- **`preferred_username`** : le nom d'utilisateur (`alaric`)
- **`email`** : l'adresse email de l'utilisateur
- **`given_name`** et **`family_name`** : le prénom ("Alaric") et le nom de famille ("le gouverneur")
- **`name`** : le nom complet ("Alaric le gouverneur")
- **`resource_access.account.roles`** : **C'EST ICI QUE SE TROUVENT LES RÔLES POUR L'API `account` !**
  - `manage-account` : permet de gérer son propre compte
  - `manage-account-links` : permet de gérer les liens avec des IDP externes

**Point clé :** Dans ce contexte, le jeton contient les rôles spécifiques au client `account` (l'API de gestion du compte). Les rôles de royaume (`gouverneur`, `marchand`, `sujet`) ne sont **pas automatiquement inclus** dans ce jeton car ils ne sont pas mappés par défaut pour le client `account-console`.

**Note importante :** Pour que les rôles de royaume (`gouverneur`, `marchand`, `sujet`) apparaissent dans les jetons, il faudra configurer des **mappers** dans les client scopes. Ce sera abordé dans un exercice ultérieur sur les clients applicatifs métier.

#### Comparer avec d'autres utilisateurs

11. Changez l'utilisateur sélectionné pour **`cedric`**
12. Assurez-vous que l'audience target est toujours `account`
13. Cliquez à nouveau sur **« Generated access token »**
14. **Observation :** Le claim `resource_access.account.roles` contient les mêmes rôles que pour Alaric

```json
{
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links"
      ]
    }
  }
}
```

**Point d'observation :** Tous les utilisateurs du realm ont par défaut les mêmes rôles sur le client `account` (gestion de leur propre compte). Les rôles de royaume (`gouverneur`, `marchand`, `sujet`) ne sont pas visibles dans ce jeton car ils ne sont pas configurés pour être inclus dans les jetons destinés à l'API `account`.

#### Observer les autres types de jetons

15. Cliquez sur **« Generated ID token »** pour voir le jeton d'identité (ID Token)
16. **Observation :** L'ID Token contient principalement les informations d'identité (nom, email, etc.) mais pas les rôles
17. Cliquez sur **« Generated user info »** pour voir les informations utilisateur telles qu'elles seraient retournées par l'endpoint `/userinfo`

**Point d'observation :** L'outil Evaluate est extrêmement pratique pour le debug et la vérification des configurations. Il permet de voir exactement ce que contiendra le jeton **avant** de déployer une application, sans avoir à se connecter manuellement avec chaque utilisateur.

**Note importante sur les rôles de royaume :** Les rôles de royaume (`gouverneur`, `marchand`, `sujet`) que nous avons créés dans l'exercice 2 **ne sont pas automatiquement inclus** dans tous les jetons. Leur inclusion dépend de la configuration des **client scopes** et des **mappers**. Dans l'exercice 4, nous créerons une application métier et configurerons les mappers pour inclure les rôles de royaume dans les jetons.

> **Checkpoint :** Vous avez utilisé l'outil Evaluate pour prévisualiser le jeton JWT d'Alaric. Vous avez identifié les rôles dans le claim `realm_access.roles` et constaté que les rôles hérités via le rôle composite `gouverneur` sont tous présents.

---

### Étape 6 — Se connecter à la console de gestion du compte

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

### Étape 7 — Récapitulatif : comprendre les rôles de royaume vs rôles de client

Grâce à l'outil Evaluate, nous avons observé le contenu du jeton pour le client `account-console` appelant l'API `account`. Récapitulons ce que nous avons appris :

**Ce que nous avons vu dans le jeton :**

| Utilisateur | Rôle de royaume attribué | Rôles dans le jeton (resource_access.account.roles) |
| --- | --- | --- |
| Alaric | `gouverneur` (composite) | `manage-account`, `manage-account-links` |
| Brunhild | `marchand` (simple) | `manage-account`, `manage-account-links` |
| Cedric | `sujet` (simple) | `manage-account`, `manage-account-links` |

**Observations clés :**

1. **Rôles de client vs rôles de royaume** : 
   - Les **rôles de royaume** (`gouverneur`, `marchand`, `sujet`) définissent les profils métier dans Valdoria
   - Les **rôles de client** (`manage-account`, `manage-account-links`) définissent les permissions sur une API spécifique
   - Dans ce jeton, seuls les rôles du client `account` sont présents

2. **Tous les utilisateurs ont les mêmes rôles sur `account`** :
   - Par défaut, tous les utilisateurs peuvent gérer leur propre compte (`manage-account`)
   - C'est normal : tout sujet de Valdoria peut accéder à son bureau des affaires civiles

3. **Les rôles de royaume ne sont pas automatiquement inclus** :
   - Les rôles `gouverneur`, `marchand`, `sujet` ne sont **pas présents** dans ce jeton
   - Pour les inclure, il faudra configurer des **mappers** dans les client scopes
   - Ce sera l'objet de l'exercice 4 (création d'une application métier)

**Schéma conceptuel :**

```
Utilisateur Alaric
├── Rôles de royaume (profils métier)
│   ├── gouverneur (composite)
│   ├── sujet (hérité)
│   └── marchand (hérité)
│
├── Attributs personnalisés
│   └── ville_origine: "Valdoria-Centre"
│
└── Rôles de client (permissions sur APIs)
    └── account
        ├── manage-account
        └── manage-account-links
```

**Point clé :** Les rôles de royaume et les rôles de client sont deux mécanismes distincts. Les rôles de royaume seront utiles pour les applications métier (exercice 4), tandis que les rôles de client sont spécifiques à chaque API.

> **Checkpoint :** Vous comprenez la différence entre rôles de royaume et rôles de client. Vous savez que les rôles de royaume nécessitent une configuration de mappers pour être inclus dans les jetons.

---

## Point clé

> **Les rôles de royaume définissent les profils métier dans votre organisation.**
>
> Ils sont attribués aux utilisateurs et permettent de gérer les hiérarchies de droits via les rôles composites : un utilisateur avec le rôle `gouverneur` hérite automatiquement de tous les rôles de base sans qu'il soit nécessaire de les attribuer manuellement.
>
> **Important :** Les rôles de royaume ne sont **pas automatiquement inclus** dans tous les jetons JWT. Leur inclusion dépend de la configuration des **client scopes** et des **mappers** pour chaque application cliente.
>
> Dans cet exercice, nous avons observé un jeton pour le client `account-console` qui ne contient que les rôles du client `account`. Dans l'exercice 4, nous créerons une application métier et configurerons les mappers pour inclure les rôles de royaume dans les jetons.

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

### Vérifier les rôles hérités dans la console d'administration

1. Dans la console d'administration, allez dans **« Users »**
2. Cliquez sur **`alaric`**
3. Allez dans l'onglet **« Role mapping »**
4. Activez le toggle **« Show inherited roles »**
5. **Observation :** Vous voyez le rôle `gouverneur` directement attribué, et les rôles `sujet` et `marchand` marqués comme hérités
6. Répétez l'opération pour `brunhild` : vous verrez `marchand` directement attribué, sans héritage
7. Pour `cedric` : seul le rôle `sujet` est présent, sans héritage

**Point d'observation :** Cette vue permet de vérifier rapidement la hiérarchie des rôles et l'héritage via les rôles composites.

---

## Récapitulatif des utilisateurs créés

| Username | Nom complet | Email | Rôle | Rôles hérités | Ville d'origine |
| --- | --- | --- | --- | --- | --- |
| `alaric` | Alaric le gouverneur | alaric@valdoria.empire | `gouverneur` | `sujet`, `marchand` | Valdoria-Centre |
| `brunhild` | Brunhild la marchande | brunhild@valdoria.empire | `marchand` | aucun | Nordheim |
| `cedric` | Cedric le sujet | cedric@valdoria.empire | `sujet` | aucun | Sudbourg |

**Mot de passe commun :** `valdoria123`
