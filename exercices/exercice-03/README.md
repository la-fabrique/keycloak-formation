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

### Étape 4 — Se connecter à la console de gestion du compte

Chaque sujet de Valdoria peut accéder à son propre bureau des affaires civiles pour consulter son profil.

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

### Étape 5 — Récupérer et observer le laissez-passer numérique (JWT)

Le jeton JWT est le laissez-passer que Keycloak délivre à chaque sujet authentifié. Observons son contenu.

#### Récupérer le jeton via les outils développeur

1. Toujours dans l'onglet incognito où vous êtes connecté en tant qu'Alaric, ouvrez les **outils développeur** du navigateur :
   - **Chrome / Edge :** `F12` ou `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
   - **Firefox :** `F12` ou `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Cliquez sur l'onglet **« Application »** (Chrome/Edge) ou **« Storage »** (Firefox)
3. Dans le panneau de gauche, développez **« Session Storage »**
4. Cliquez sur **`http://localhost:8080`**
5. **Observation :** Plusieurs clés sont présentes, dont une qui contient le jeton d'accès
6. Cherchez une clé qui ressemble à `kc-callback-...` ou qui contient `access_token`
7. **Alternative plus simple :** Dans l'onglet **« Network »** (Réseau), actualisez la page (`F5`) et cherchez une requête vers `/account` ou `/userinfo`. Dans les en-têtes de la requête, vous trouverez un header `Authorization: Bearer <token>`

**Méthode recommandée : utiliser l'endpoint userinfo**

8. Dans l'onglet **« Console »** des outils développeur, exécutez le code JavaScript suivant :

```javascript
fetch('http://localhost:8080/realms/valdoria/protocol/openid-connect/userinfo', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => console.log(data));
```

9. **Observation :** Les informations de l'utilisateur s'affichent dans la console (nom, email, etc.)

**Récupérer le jeton d'accès complet**

10. Pour récupérer le jeton JWT complet, nous allons forcer une nouvelle authentification et capturer le jeton
11. Dans l'onglet **« Network »** des outils développeur, cochez **« Preserve log »** (Conserver le journal)
12. Dans la barre d'adresse, accédez à : **http://localhost:8080/realms/valdoria/protocol/openid-connect/auth?client_id=account-console&redirect_uri=http://localhost:8080/realms/valdoria/account/&response_type=code&scope=openid**
13. Vous êtes déjà authentifié, donc vous êtes immédiatement redirigé
14. Dans l'onglet **« Network »**, cherchez une requête vers `/token`
15. Cliquez sur cette requête, puis sur l'onglet **« Response »**
16. **Observation :** La réponse contient un objet JSON avec plusieurs champs, dont `access_token`
17. Copiez la valeur complète du champ `access_token` (c'est une longue chaîne de caractères encodée en base64)

**Note :** Si cette méthode est trop complexe, passez directement à l'étape suivante où nous utiliserons un jeton d'exemple pour la démonstration.

> **Checkpoint :** Vous avez identifié où se trouve le jeton JWT dans les échanges entre le navigateur et Keycloak.

---

### Étape 6 — Décoder et analyser le laissez-passer

Maintenant que nous avons le jeton, décodons-le pour observer son contenu.

#### Décoder le jeton sur jwt.io

1. Ouvrez un nouvel onglet et accédez à : **https://jwt.io**
2. Dans la section **« Encoded »** (à gauche), collez le jeton JWT que vous avez copié à l'étape précédente
3. La section **« Decoded »** (à droite) affiche automatiquement le contenu décodé du jeton

**Si vous n'avez pas réussi à récupérer le jeton, utilisez cette méthode alternative :**

4. Retournez dans la console d'administration de Keycloak (onglet non-incognito)
5. Dans le realm `valdoria`, allez dans **« Clients »**
6. Cliquez sur **« Create client »**
7. Remplissez :
   - **Client ID :** `test-jwt`
   - **Client type :** `OpenID Connect`
8. Cliquez sur **« Next »**
9. Activez **« Direct access grants »**
10. Cliquez sur **« Save »**
11. Ouvrez un terminal et exécutez la commande suivante :

```bash
curl -X POST 'http://localhost:8080/realms/valdoria/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=test-jwt' \
  -d 'username=alaric' \
  -d 'password=valdoria123'
```

12. La réponse contient un champ `access_token` — copiez sa valeur
13. Collez cette valeur dans **https://jwt.io**

#### Analyser le contenu du jeton

Une fois le jeton décodé sur jwt.io, observez les trois sections :

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

C'est ici que se trouvent les informations importantes. Cherchez les claims suivants :

```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "jti": "...",
  "iss": "http://localhost:8080/realms/valdoria",
  "sub": "...",
  "typ": "Bearer",
  "azp": "test-jwt",
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

**Points d'observation importants :**

- **`preferred_username`** : le nom d'utilisateur (`alaric`)
- **`email`** : l'adresse email de l'utilisateur
- **`given_name`** et **`family_name`** : le prénom et le nom de famille
- **`realm_access.roles`** : **C'EST ICI QUE SE TROUVENT LES RÔLES !**
  - Le rôle `gouverneur` est présent
  - Les rôles hérités (`sujet`, `artisan`, `marchand`, `scribe`) sont également présents grâce au rôle composite
  - Les rôles par défaut du realm sont aussi inclus

**Point clé :** Les applications utilisent le claim `realm_access.roles` pour contrôler l'accès aux ressources. Par exemple, une application peut vérifier si le jeton contient le rôle `gouverneur` avant d'afficher la page d'administration.

**Note importante :** Les attributs personnalisés (`rang`, `ville_origine`) **n'apparaissent pas encore** dans le jeton. Pour les inclure, il faudra configurer des **mappers** (ce sera abordé dans un exercice ultérieur).

> **Checkpoint :** Vous avez décodé le jeton JWT d'Alaric et identifié les rôles dans le claim `realm_access.roles`. Vous constatez que les rôles hérités via le rôle composite `gouverneur` sont tous présents.

---

### Étape 7 — Comparer les jetons de différents utilisateurs

Pour bien comprendre comment les rôles sont transportés, comparons les jetons de plusieurs utilisateurs.

#### Récupérer le jeton de Cedric

1. Fermez l'onglet incognito où vous étiez connecté en tant qu'Alaric
2. Ouvrez un **nouvel onglet incognito**
3. Accédez à : **http://localhost:8080/realms/valdoria/account**
4. Connectez-vous avec les identifiants de Cedric :
   - **Username :** `cedric`
   - **Password :** `valdoria123`
5. Utilisez la même méthode que précédemment pour récupérer le jeton (via curl ou via les outils développeur)

**Avec curl :**

```bash
curl -X POST 'http://localhost:8080/realms/valdoria/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'client_id=test-jwt' \
  -d 'username=cedric' \
  -d 'password=valdoria123'
```

6. Copiez le jeton et décodez-le sur **https://jwt.io**

#### Comparer les rôles

7. Observez le claim `realm_access.roles` dans le jeton de Cedric :

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

**Comparaison avec le jeton d'Alaric :**

| Utilisateur | Rôle attribué | Rôles dans le jeton |
| --- | --- | --- |
| Alaric | `gouverneur` (composite) | `gouverneur`, `sujet`, `artisan`, `marchand`, `scribe` + rôles par défaut |
| Cedric | `artisan` (simple) | `artisan` + rôles par défaut |

**Point d'observation :** Cedric ne possède que le rôle `artisan` car c'est un rôle simple (non composite). Il n'hérite d'aucun autre rôle. En revanche, Alaric possède tous les rôles car `gouverneur` est un rôle composite qui inclut tous les autres.

#### Tester avec Brunhild (rôle composite)

8. Répétez l'opération avec Brunhild (`brunhild` / `valdoria123`)
9. Observez le claim `realm_access.roles` :

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

**Point d'observation :** Brunhild possède le rôle `maitre-forgeron` (composite) qui inclut automatiquement `artisan` et `sujet`. C'est la hiérarchie que nous avons définie dans l'exercice 2.

> **Checkpoint :** Vous avez comparé les jetons de trois utilisateurs et constaté que les rôles composites injectent automatiquement tous leurs rôles associés dans le jeton JWT.

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
| Impossible de se connecter à la Account Console | Mauvais identifiants ou realm incorrect | Vérifiez que l'URL contient `/realms/valdoria/account` et que les identifiants sont corrects |
| Le jeton ne s'affiche pas dans les outils développeur | Session Storage vide ou mauvais onglet | Utilisez la méthode curl pour récupérer le jeton directement |
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
| Client applicatif | Échoppe (point de service métier) |
| Groupe | Guilde (ex : guilde des forgerons) |
| Client Scope / Mapper | Parchemin officiel |
| Service Account (M2M) | Automate impérial |
| Annuaire LDAP | Province alliée |
| IDP externe (SSO) | Ambassade étrangère |
| Politique de sécurité | Fortification |
| SMTP / Email | Réseau de messagers impériaux |
