# Exercice 2 — Fonder la Province de Valdoria

> **Module 1 — Fondations et environnement**
> Durée estimée : 30 minutes | Difficulté : ★★☆☆☆ (débutant-intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer et configurer un realm dédié pour une organisation
- Comprendre l'isolation complète entre realms (utilisateurs, rôles, clients)
- Créer des rôles de royaume (Realm roles) simples et composites
- Configurer un rôle par défaut attribué automatiquement à tout nouvel utilisateur
- Comprendre l'héritage de droits via les rôles composites
- Configurer les paramètres de session et de tokens
- Paramétrer les notifications par email (SMTP)

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Les 3 conteneurs (postgres, mailhog, keycloak) doivent être en état `running` et `healthy`
- Accès à la console d'administration de Keycloak

### Prérequis de connaissances

- Avoir complété l'exercice 1 (compréhension du realm `master`)
- Comprendre la notion d'isolation entre realms

---

## Contexte narratif

> L'empereur accorde une charte pour fonder la **Province de Valdoria**, joyau de l'Empire d'Authéria.
>
> Les administrateurs de l'empire créent cette nouvelle province et établissent ses **institutions fondamentales** : les profils métier qui structureront toute la société valdorienne.
>
> Chaque sujet de Valdoria recevra un titre (`role`) selon sa fonction : simple sujet, marchand ou gouverneur. Certains profils incluent automatiquement les droits d'autres profils — c'est la hiérarchie des responsabilités.


## Étapes

### Étape 1 — Créer la province (`realm`) de `valdoria`

L'administration impériale accorde la charte. Il est temps de fonder officiellement la province.

1. Connectez-vous à la console d'administration de Keycloak : **http://localhost:8080/admin**
2. Identifiants : `admin` / `admin`
3. Cliquez sur le **menu déroulant des realms** (en haut à gauche, affiche actuellement `master`)
4. Cliquez sur **« Create realm »**
5. Dans le champ **« Realm name »**, saisissez : `valdoria`
6. Laissez l'option **« Enabled »** cochée
7. Cliquez sur **« Create »**

La console bascule automatiquement sur le nouveau realm `valdoria`.

> **Checkpoint :** Le menu déroulant en haut à gauche affiche maintenant `valdoria`. Vous êtes dans la nouvelle province.

---

### Étape 2 — Constater l'isolation du nouveau realm

Valdoria est une province vierge. Vérifions qu'elle ne contient aucun élément hérité du realm `master`.

#### 2a. Vérifier l'absence d'utilisateurs

1. Dans le menu latéral gauche, cliquez sur **« Users »**
2. Cliquez sur **« View all users »**
3. **Observation :** la liste est vide — aucun utilisateur du realm `master` n'apparaît ici

#### 2b. Observer les clients par défaut

4. Dans le menu latéral gauche, cliquez sur **« Clients »**
5. **Observation :** seuls les clients système sont présents :
   - `account` — console de gestion du compte utilisateur
   - `account-console` — nouvelle interface de gestion du compte
   - `admin-cli` — client en ligne de commande
   - `broker` — utilisé pour la fédération d'identité
   - `realm-management` — client interne pour l'administration du realm
      > Ce client définit des rôles pour manager le realm (ex: `create-client`, `manage-users`, `view-events` ...) 
   - `security-admin-console` — console d'administration

#### 2c. Observer les rôles par défaut

6. Dans le menu latéral gauche, cliquez sur **« Realm roles »**
7. **Observation :** seuls 3 rôles par défaut existent :
   - `default-roles-valdoria` — rôle composite attribué automatiquement à tous les nouveaux utilisateurs
   - `offline_access` — permet d'obtenir des refresh tokens offline
   - `uma_authorization` — utilisé pour l'autorisation User-Managed Access

**Point d'observation :** Chaque realm est un **univers totalement isolé**. Aucun utilisateur, client personnalisé ou rôle métier n'est partagé entre realms. Valdoria repart de zéro.

> **Checkpoint :** Vous avez constaté que le realm `valdoria` ne contient aucun utilisateur, uniquement des clients système et 3 rôles par défaut.

---

### Étape 3 — Créer les profils métier de base (rôles simples)

Les institutions de Valdoria nécessitent 2 profils métier de base. Créons-les.

#### Créer le rôle `sujet`

1. Dans le menu latéral gauche, cliquez sur **« Realm roles »**
2. Cliquez sur **« Create role »**
3. Remplissez les champs :
   - **Role name :** `sujet`
   - **Description :** `Sujet du royaume de Valdoria — citoyen ordinaire avec accès minimal aux services du royaume`
4. Cliquez sur **« Save »**

#### Créer le rôle `marchand`

5. Retournez à la liste des rôles (cliquez sur **« Realm roles »** dans le menu latéral)
6. Cliquez sur **« Create role »**
7. Remplissez les champs :
   - **Role name :** `marchand`
   - **Description :** `Marchand du royaume de Valdoria — commerçant avec accès aux places de marché et registres commerciaux`
8. Cliquez sur **« Save »**

#### Configurer `sujet` comme rôle par défaut

Tout habitant de Valdoria est automatiquement un sujet de la province. Configurons le rôle `sujet` pour qu'il soit attribué automatiquement à chaque nouvel utilisateur.

9. Dans la liste des **« Realm roles »**, cliquez sur le rôle **`default-roles-valdoria`**
   > Redirection vers `Realm sttings`/`User registration`
10. Cliquez sur l'onglet **« Associated roles »**
11. Cliquez sur **« Assign role »**
12. Dans la liste qui apparaît, **cochez le rôle** `sujet`
13. Cliquez sur **« Assign »**

**Point d'observation :** Le rôle `default-roles-valdoria` est un rôle composite spécial, créé automatiquement par Keycloak pour chaque realm. Tout utilisateur créé dans le realm hérite automatiquement de ses rôles associés. En y ajoutant `sujet`, chaque nouvel habitant de Valdoria recevra ce titre de citoyen sans intervention manuelle.

> **Checkpoint :** Vous avez créé 2 rôles de base : `sujet` et `marchand`. Le rôle `sujet` est configuré comme rôle par défaut — tout nouvel utilisateur du realm `valdoria` le recevra automatiquement.

---

### Étape 4 — Créer le profil hiérarchique (rôle composite)

Certains profils métier incluent automatiquement les droits d'autres profils. C'est le principe des **rôles composites**.

#### Créer le rôle composite `gouverneur`

Le gouverneur est l'administrateur suprême de la province. Il possède tous les droits de base.

1. Dans la liste des **« Realm roles »**, cliquez sur **« Create role »**
2. Remplissez les champs :
   - **Role name :** `gouverneur`
   - **Description :** `Gouverneur du royaume de Valdoria — administrateur suprême de la province avec tous les droits`
3. Cliquez sur **« Save »**
4. Une fois le rôle créé, vous êtes redirigé vers la page de détails du rôle
5. Cliquez sur l'onglet **« Associated roles »** (ou **« Rôles associés »**)
6. Cliquez sur **« Assign role »**
7. Dans la liste qui apparaît, **cochez les deux rôles de base** :
   - `sujet`
   - `marchand`
8. Cliquez sur **« Assign »**

**Point d'observation :** Le rôle `gouverneur` est maintenant un **rôle composite**. Tout utilisateur ayant le rôle `gouverneur` héritera automatiquement des rôles `sujet` et `marchand`. Il n'est pas nécessaire de les attribuer manuellement. C'est ainsi que se construit la hiérarchie administrative de Valdoria.

> **Checkpoint :** Vous avez créé 1 rôle composite : `gouverneur` (inclut `sujet` + `marchand`).

---

### Étape 5 — Vérifier la hiérarchie des rôles

Visualisons la structure hiérarchique que nous venons de créer.

1. Dans la liste des **« Realm roles »**, cliquez sur le rôle **`gouverneur`**
2. Observez l'onglet **« Associated roles »** : les 2 rôles de base (`sujet` et `marchand`) sont listés

**Schéma conceptuel de la hiérarchie :**

```
default-roles-valdoria (rôle par défaut du realm)
└── sujet  ←  attribué automatiquement à tout nouvel utilisateur

gouverneur (composite)
├── sujet
└── marchand
```

**Point clé :** Les rôles composites permettent de gérer efficacement les hiérarchies de droits. En production, ils évitent d'attribuer manuellement des dizaines de rôles individuels à chaque utilisateur. Ici, notre modèle simplifié (3 rôles au total) facilite la compréhension du concept d'héritage. Le rôle `sujet`, configuré comme rôle par défaut, garantit que tout nouvel habitant de Valdoria est reconnu comme citoyen dès sa création.

> **Checkpoint :** Vous comprenez la structure hiérarchique des rôles de Valdoria. Le gouverneur hérite automatiquement des droits de `sujet` et `marchand`. Le rôle `sujet` est attribué par défaut à tout nouvel utilisateur.

---

### Étape 6 — Configurer les paramètres de session et de tokens

Valdoria doit définir combien de temps un sujet peut rester connecté et combien de temps son laissez-passer (jeton) reste valide.

1. Dans le menu latéral gauche, cliquez sur **« Realm settings »**
2. Cliquez sur l'onglet **« Sessions »**
3. Observez les valeurs par défaut :
   - **SSO Session Idle :** 30 minutes (durée d'inactivité avant déconnexion automatique)
   - **SSO Session Max :** 10 heures (durée maximale d'une session, même active)
   - **SSO Session Idle Remember Me :** _
   - **SSO Session Max Remember Me :** _

**Pour cet exercice, modifions les valeurs pour des sessions plus courtes (environnement de test) :**

4. Modifiez les valeurs suivantes :
   - **SSO Session Idle :** `15 minutes`
   - **SSO Session Max :** `2 hours`
5. Cliquez sur **« Save »** en bas de la page

#### Configurer les durées de vie des tokens

6. Cliquez sur l'onglet **« Tokens »**
7. Observez les valeurs par défaut :
   - **Access Token Lifespan :** 5 minutes
   - **Access Token Lifespan For Implicit Flow :** 15 minutes
   - **Client login timeout :** 1 minute
   - **Revoke Refresh Token :** OFF (les refresh tokens ne sont pas révoqués après usage)

**Pour cet exercice, gardons les valeurs par défaut.** Ces paramètres sont adaptés à un environnement de production.

**Note :** Le paramètre **Revoke Refresh Token** contrôle si un refresh token peut être réutilisé plusieurs fois ou s'il est révoqué après un seul usage. En mode OFF (par défaut), le refresh token reste valide jusqu'à son expiration, ce qui améliore les performances. En mode ON, chaque rafraîchissement génère un nouveau refresh token, ce qui augmente la sécurité mais nécessite plus d'appels au serveur.

**Point d'observation :** Les sessions SSO (Single Sign-On) contrôlent combien de temps un utilisateur reste connecté dans Keycloak. Les tokens contrôlent combien de temps une application peut utiliser un jeton d'accès avant de devoir le rafraîchir. Ce sont deux mécanismes distincts mais complémentaires.

> **Checkpoint :** Vous avez configuré les sessions SSO pour une durée d'inactivité de 15 minutes et une durée maximale de 2 heures.

---

### Étape 7 — Configurer le réseau de messagers impériaux (SMTP)

Valdoria doit pouvoir envoyer des messages officiels à ses sujets : vérification d'email, réinitialisation de mot de passe, notifications. Configurons le serveur SMTP vers Mailhog.

1. Dans **« Realm settings »**, cliquez sur l'onglet **« Email »**
2. Remplissez les champs suivants :

| Champ | Valeur |
| --- | --- |
| **From** | `noreply@valdoria.empire` |
| **From display name** | `Province de Valdoria` |
| **Reply to** | *(laisser vide)* |
| **Reply to display name** | *(laisser vide)* |
| **Envelope from** | *(laisser vide)* |
| **Host** | `autheria-mailhog` |
| **Port** | `1025` |
| **Encryption** | *(laisser vide / disabled)* |
| **Authentication** | *(désactivé — laisser le toggle OFF)* |

3. Cliquez sur **« Save »**

#### Tester la configuration SMTP

Avant de pouvoir tester l'envoi d'email, l'utilisateur administrateur doit avoir une adresse email configurée.

4. Cliquez sur **« Configure e-mail address »**
5. **Attention :** vous êtes redirigé vers le profil de l'utilisateur `admin` **dans le realm `master`**
6. Dans le champ **« Email »**, saisissez : `admin@empire.local`
7. Cliquez sur **« Save »**
8. **Important :** Retournez sur le realm **`valdoria`** via le menu déroulant en haut à gauche
9. Naviguez à nouveau vers **« Realm settings »** > onglet **« Email »**
10. Cliquez sur **« Test connection »**
11. Un message de confirmation devrait apparaître : *« Success! E-mail sent. »*

#### Vérifier la réception dans Mailhog

12. Ouvrez un nouvel onglet de navigateur et accédez à : **http://localhost:8025**
13. L'interface de Mailhog s'affiche
14. **Observation :** un email de test est arrivé avec :
    - **From :** `Province de Valdoria <noreply@valdoria.empire>`
    - **To :** `admin@empire.local`
    - **Subject :** `Test message`

**Point d'observation :** Mailhog est un serveur SMTP de test. Il capture tous les emails envoyés par Keycloak sans les transmettre réellement. C'est l'outil idéal pour tester les notifications en environnement de développement.

> **Checkpoint :** Vous avez configuré le serveur SMTP et vérifié qu'un email de test arrive bien dans Mailhog.

---

## Point clé

> **Le realm `valdoria` est maintenant opérationnel.**
>
> Il dispose de :
> - **3 profils métier** (2 simples + 1 composite) qui structurent la société valdorienne
> - **Un rôle par défaut** (`sujet`) attribué automatiquement à tout nouvel utilisateur
> - **Une hiérarchie de droits** via le rôle composite (le gouverneur hérite des droits de sujet et marchand)
> - **Des paramètres de session** adaptés à un environnement de test
> - **Un réseau de messagers** (SMTP) pour envoyer des notifications officielles
>
> Les rôles créés ici serviront de fondation à tous les exercices suivants. Chaque utilisateur créé dans Valdoria recevra automatiquement le titre de `sujet`, et pourra se voir attribuer des profils métier supplémentaires.

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| Le test SMTP échoue avec « Connection refused » | Le conteneur Mailhog n'est pas démarré | Vérifiez avec `docker compose ps` que `autheria-mailhog` est en état `running` |
| Le test SMTP échoue avec « Unknown host » | Le nom d'hôte est incorrect | Vérifiez que vous avez bien saisi `autheria-mailhog` (et non `mailhog` ou `localhost`) |
| L'email de test n'arrive pas dans Mailhog | Mauvais port SMTP | Vérifiez que le port est bien `1025` (et non `8025` qui est le port web) |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Activer la journalisation des événements

1. Dans **« Realm settings »** > **« Events »**, cliquez sur l'onglet **« User events settings »**
2. Activez **« Save events »** (toggle ON)
3. Cliquez sur **« Save »**

**Point d'observation :** Les événements sont essentiels pour l'audit de sécurité et le debug. En production, ils sont souvent exportés vers un SIEM (Security Information and Event Management). Vous pourrez observer ces événements en action dans l'exercice suivant, lors de la création et de la connexion des premiers utilisateurs.

### Tester la page de connexion du realm

1. Ouvrez un nouvel onglet de navigation privée (mode incognito)
2. Accédez à : **http://localhost:8080/realms/valdoria/account**
3. Vous arrivez sur la page de connexion de Valdoria
4. **Observation :** le thème est encore celui par défaut de Keycloak
5. **Important :** Ne tentez pas de vous connecter — aucun utilisateur n'existe encore dans le realm `valdoria` (l'utilisateur `admin` existe uniquement dans le realm `master`, pas dans `valdoria`)
6. Fermez l'onglet incognito

**Note :** Les premiers utilisateurs de Valdoria seront créés dans l'exercice suivant. La personnalisation du thème de connexion sera abordée dans un exercice ultérieur.

---