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

Ces trois utilisateurs suffisent pour illustrer tous les concepts pédagogiques :
- **Alaric** (gouverneur) → rôle composite (hérite de `sujet` + `marchand`)
- **Brunhild** (marchand) → rôle simple
- **Cedric** (sujet) → rôle simple (rôle de base)

---

### Étape 2 — Attribuer les profils métier (rôles)

Chaque sujet reçoit maintenant son profil métier officiel.

**Point d'observation :** Comme le rôle `sujet` est maintenant un composant du rôle `default-roles-valdoria` il est affecté à tous les utilisateurs. (cf exercice 2) 

#### Attribuer le rôle `gouverneur` à Alaric

1. Dans la liste des utilisateurs, cliquez sur **`alaric`**
2. Cliquez sur l'onglet **« Role mapping »**
3. Cliquez sur **« Assign role »**
4. Dans la liste qui apparaît, **cochez le rôle** `gouverneur`
5. Cliquez sur **« Assign »**
6. **Observation :** Le rôle `gouverneur` apparaît maintenant dans la liste des rôles attribués
7. **Point d'observation :** Comme `gouverneur` est un rôle composite (créé dans l'exercice 2), Alaric hérite automatiquement des rôles `sujet` et `marchand`. Vous pouvez le vérifier en activant le filtre **« Show inherited roles »** (ou **« Afficher les rôles hérités »**) en haut de la liste.

#### Attribuer les rôles aux autres utilisateurs

Répétez les étapes 1 à 5 pour attribuer le rôle `marchand` à `brunhild`

> **Checkpoint :** Chaque utilisateur possède maintenant son rôle. Vérifiez en consultant l'onglet « Role mapping » de chaque utilisateur.

---

### Étape 3 — Ajouter les attributs personnalisés 

Les attributs permettent d'enrichir le profil utilisateur avec des informations contextuelles qui ne sont pas liées au contrôle d'accès.

#### 3.1 Comprendre la distinction : rôle vs. attribut

- **Rôle** (`gouverneur`, `marchand`, `sujet`) → **Contrôle d'accès** (qui peut faire quoi)
- **Attribut** (`villeOrigine`) → **Enrichissement contextuel** (informations sur l'utilisateur)

Les rôles définissent les permissions, les attributs définissent les caractéristiques.

#### 3.2 Ajouter l'attribut `villeOrigine` à la configuration du realm

1. Dans **« Realm settings »** > **« User profile »**, cliquez sur l'onglet **« Attributes »**
2. Cliquer sur **« Create attribute »** 
3. Remplissez les champs :
   - **Name :** `villeOrigine`
   - **Display :** `Ville d'origine` 
5. Cliquez sur **« Save »**

#### 3.3 Renseigner l'attribut pour chaque utilisateur

Pour chaque utilisateur créé, ajoutons une ville d'origine :

1. Dans la liste des **« Users »**, cliquez sur **`alaric`**
4. Remplissez le champ `ville d'origine` : `Valdoria-Centre`
5. Cliquez sur **« Save »**

Répétez l'opération pour les autres utilisateurs :

| Utilisateur | Attribut `villeOrigine` |
| --- | --- |
| `alaric` | `Valdoria-Centre` |
| `brunhild` | `Nordheim` |
| `cedric` | `Sudbourg` |

#### 3.4 Vérifier les attributs

**Point d'observation :** Ces attributs personnalisés enrichissent le profil utilisateur. 

> **Checkpoint :** Les 3 utilisateurs ont l'attribut `villeOrigine` configuré.

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

**Point d'observation :** La Account Console est une interface en libre-service qui permet aux utilisateurs de gérer leur propre compte sans intervention d'un administrateur. En production, c'est ici que les utilisateurs peuvent mettre à jour leur profil, activer la double authentification, ou révoquer des sessions.

> **Checkpoint :** Vous êtes connecté à la Account Console en tant qu'Alaric. L'interface affiche "Alaric le gouverneur".

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| Le champ « Users » ne propose aucun utilisateur | Les utilisateurs n'ont pas été créés ou vous êtes dans le mauvais realm | Vérifiez que vous êtes dans le realm `valdoria` et que les utilisateurs existent |
| Impossible de se connecter à la Account Console | Mauvais identifiants ou realm incorrect | Vérifiez que l'URL contient `/realms/valdoria/account` et que les identifiants sont corrects |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Activer la journalisation des événements

1. Dans **« Realm settings »** > **« Events »**, cliquez sur l'onglet **« User events settings »**
2. Activez **« Save events »** (toggle ON)
3. Cliquez sur **« Save »**
4. Connectez-vous à nouveau avec un utilisateur via la Account Console
5. Retournez dans **« Events »**, onglet **« User events »**
6. **Observation :** Les événements de connexion sont enregistrés avec l'horodatage, l'adresse IP et le type d'événement

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
4. Décocher  **« Hide inherited roles »**
5. **Observation :** Vous voyez le rôle `gouverneur` directement attribué, et les rôles `sujet` et `marchand` marqués comme hérités
6. Répétez l'opération pour `brunhild` : vous verrez `marchand` directement attribué, sans héritage

**Point d'observation :** Cette vue permet de vérifier rapidement la hiérarchie des rôles et l'héritage via les rôles composites.
