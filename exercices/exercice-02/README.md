# Exercice 2 — Fonder la Province de Valdoria

> **Module 1 — Fondations et environnement**
> Durée estimée : 30 minutes | Difficulté : ★★☆☆☆ (débutant-intermédiaire)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Créer et configurer un realm dédié pour une organisation
- Comprendre l'isolation complète entre realms (utilisateurs, rôles, clients)
- Créer des rôles de royaume (Realm roles) simples et composites
- Comprendre l'héritage de droits via les rôles composites
- Configurer les paramètres de session et de tokens
- Paramétrer les notifications par email (SMTP)

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Les 4 conteneurs doivent être en état `running` et `healthy`
- Accès à la console d'administration de Keycloak

### Prérequis de connaissances

- Avoir complété l'exercice 1 (compréhension du realm `master`)
- Comprendre la notion d'isolation entre realms

---

## Contexte narratif

> Le Château de l'empereur accorde une charte pour fonder la **Province de Valdoria**, joyau de l'Empire d'Authéria.
>
> Les architectes créent cette nouvelle province et établissent ses **institutions fondamentales** : les profils métier qui structureront toute la société valdorienne.
>
> Chaque sujet de Valdoria recevra un profil selon sa fonction : simple citoyen, artisan, marchand, scribe ou gouverneur. Certains profils incluent automatiquement les droits d'autres profils — c'est la hiérarchie des responsabilités.

### Lexique de l'Empire

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm role | Profil métier (fonction dans la société) |
| Composite role | Profil hiérarchique (qui inclut d'autres profils) |
| SMTP configuration | Réseau de messagers impériaux |

---

## Étapes

### Étape 1 — Créer le realm `valdoria`

Le Château de l'empereur accorde la charte. Il est temps de fonder officiellement la province.

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

Les institutions de Valdoria nécessitent 4 profils métier de base. Créons-les.

#### Créer le rôle `sujet`

1. Dans le menu latéral gauche, cliquez sur **« Realm roles »**
2. Cliquez sur **« Create role »**
3. Remplissez les champs :
   - **Role name :** `sujet`
   - **Description :** `Sujet du royaume de Valdoria — accès minimal aux services du royaume`
4. Cliquez sur **« Save »**

#### Créer le rôle `artisan`

5. Retournez à la liste des rôles (cliquez sur **« Realm roles »** dans le menu latéral)
6. Cliquez sur **« Create role »**
7. Remplissez les champs :
   - **Role name :** `artisan`
   - **Description :** `Artisan du royaume de Valdoria — accès aux ateliers et ressources de production`
8. Cliquez sur **« Save »**

#### Créer le rôle `marchand`

9. Retournez à la liste des rôles
10. Cliquez sur **« Create role »**
11. Remplissez les champs :
    - **Role name :** `marchand`
    - **Description :** `Marchand du royaume de Valdoria — accès aux places de marché et registres commerciaux`
12. Cliquez sur **« Save »**

#### Créer le rôle `scribe`

13. Retournez à la liste des rôles
14. Cliquez sur **« Create role »**
15. Remplissez les champs :
    - **Role name :** `scribe`
    - **Description :** `Scribe du royaume de Valdoria — accès en lecture aux archives de la province`
16. Cliquez sur **« Save »**

> **Checkpoint :** Vous avez créé 4 rôles de base : `sujet`, `artisan`, `marchand`, `scribe`. Ces rôles apparaissent dans la liste des Realm roles.

---

### Étape 4 — Créer les profils hiérarchiques (rôles composites)

Certains profils métier incluent automatiquement les droits d'autres profils. C'est le principe des **rôles composites**.

#### Créer le rôle composite `maitre-forgeron`

Un maître-forgeron est un artisan expérimenté. Il hérite de tous les droits d'un artisan, plus des droits spécifiques.

1. Dans la liste des **« Realm roles »**, cliquez sur **« Create role »**
2. Remplissez les champs :
   - **Role name :** `maitre-forgeron`
   - **Description :** `Maître artisan du royaume de Valdoria — droits étendus sur les ateliers et la formation des apprentis`
3. Cliquez sur **« Save »**
4. Une fois le rôle créé, vous êtes redirigé vers la page de détails du rôle
5. Cliquez sur l'onglet **« Associated roles »** (ou **« Rôles associés »**)
6. Cliquez sur **« Assign role »**
7. Dans la liste qui apparaît, **cochez les rôles suivants** :
   - `artisan`
   - `sujet`
8. Cliquez sur **« Assign »**

**Point d'observation :** Le rôle `maitre-forgeron` est maintenant un **rôle composite**. Tout utilisateur ayant le rôle `maitre-forgeron` héritera automatiquement des rôles `artisan` et `sujet`. Il n'est pas nécessaire de les attribuer manuellement.

#### Créer le rôle composite `gouverneur`

Le gouverneur est l'administrateur suprême de la province. Il possède tous les droits.

9. Retournez à la liste des **« Realm roles »**
10. Cliquez sur **« Create role »**
11. Remplissez les champs :
    - **Role name :** `gouverneur`
    - **Description :** `Gouverneur du royaume de Valdoria — administrateur suprême de la province avec tous les droits`
12. Cliquez sur **« Save »**
13. Cliquez sur l'onglet **« Associated roles »**
14. Cliquez sur **« Assign role »**
15. **Cochez tous les rôles de base** :
    - `sujet`
    - `artisan`
    - `marchand`
    - `scribe`
16. Cliquez sur **« Assign »**

**Point d'observation :** Le gouverneur hérite de tous les profils métier de la province. C'est la hiérarchie administrative de Valdoria.

> **Checkpoint :** Vous avez créé 2 rôles composites : `maitre-forgeron` (inclut `artisan` + `sujet`) et `gouverneur` (inclut tous les rôles de base).

---

### Étape 5 — Vérifier la hiérarchie des rôles

Visualisons la structure hiérarchique que nous venons de créer.

1. Dans la liste des **« Realm roles »**, cliquez sur le rôle **`gouverneur`**
2. Observez l'onglet **« Associated roles »** : les 4 rôles de base sont listés
3. Retournez à la liste des rôles et cliquez sur **`maitre-forgeron`**
4. Observez l'onglet **« Associated roles »** : les rôles `artisan` et `sujet` sont listés

**Schéma conceptuel de la hiérarchie :**

```
gouverneur (composite)
├── sujet
├── artisan
├── marchand
└── scribe

maitre-forgeron (composite)
├── artisan
└── sujet
```

**Point clé :** Les rôles composites permettent de gérer efficacement les hiérarchies de droits. En production, ils évitent d'attribuer manuellement des dizaines de rôles individuels à chaque utilisateur.

> **Checkpoint :** Vous comprenez la structure hiérarchique des rôles de Valdoria. Le gouverneur possède tous les droits ; le maître-forgeron possède les droits d'artisan et de sujet.

---

### Étape 6 — Configurer les paramètres de session et de tokens

Valdoria doit définir combien de temps un sujet peut rester connecté et combien de temps son laissez-passer (jeton) reste valide.

1. Dans le menu latéral gauche, cliquez sur **« Realm settings »**
2. Cliquez sur l'onglet **« Sessions »**
3. Observez les valeurs par défaut :
   - **SSO Session Idle :** 30 minutes (durée d'inactivité avant déconnexion automatique)
   - **SSO Session Max :** 10 heures (durée maximale d'une session, même active)
   - **SSO Session Idle Remember Me :** 30 jours (si "Se souvenir de moi" est coché)
   - **SSO Session Max Remember Me :** 30 jours

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

4. Après avoir sauvegardé, un bouton **« Test connection »** apparaît en haut de la page
5. Cliquez sur **« Test connection »**
6. Une boîte de dialogue apparaît avec le message : *« You need to configure your e-mail address first »*
7. Cliquez sur **« Configure e-mail address »**
8. **Attention :** vous êtes redirigé vers le profil de l'utilisateur `admin` **dans le realm `master`**
9. Dans le champ **« Email »**, saisissez : `admin@empire.local`
10. Cliquez sur **« Save »**
11. **Important :** Retournez sur le realm **`valdoria`** via le menu déroulant en haut à gauche
12. Naviguez à nouveau vers **« Realm settings »** > onglet **« Email »**
13. Cliquez sur **« Test connection »**
14. La boîte de dialogue affiche maintenant l'adresse email de l'admin : `admin@empire.local`
15. Cliquez sur **« Send test email »**
16. Un message de confirmation devrait apparaître : *« Success! E-mail sent. »*

#### Vérifier la réception dans Mailhog

17. Ouvrez un nouvel onglet de navigateur et accédez à : **http://localhost:8025**
18. L'interface de Mailhog s'affiche
19. **Observation :** un email de test est arrivé avec :
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
> - **6 profils métier** (4 simples + 2 composites) qui structurent la société valdorienne
> - **Une hiérarchie de droits** via les rôles composites (le gouverneur hérite de tous les droits)
> - **Des paramètres de session** adaptés à un environnement de test
> - **Un réseau de messagers** (SMTP) pour envoyer des notifications officielles
>
> Les rôles créés ici serviront de fondation à tous les exercices suivants. Chaque utilisateur créé dans Valdoria recevra un ou plusieurs de ces profils métier.

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| Le bouton « Create realm » n'apparaît pas | Vous n'êtes pas connecté en tant qu'admin du realm `master` | Vérifiez que vous êtes bien connecté avec `admin` / `admin` |
| Le test SMTP échoue avec « Connection refused » | Le conteneur Mailhog n'est pas démarré | Vérifiez avec `docker compose ps` que `autheria-mailhog` est en état `running` |
| Le test SMTP échoue avec « Unknown host » | Le nom d'hôte est incorrect | Vérifiez que vous avez bien saisi `autheria-mailhog` (et non `mailhog` ou `localhost`) |
| L'email de test n'arrive pas dans Mailhog | Mauvais port SMTP | Vérifiez que le port est bien `1025` (et non `8025` qui est le port web) |
| Je ne vois pas l'onglet « Associated roles » | Vous n'avez pas encore sauvegardé le rôle | Créez d'abord le rôle avec « Save », puis l'onglet apparaîtra |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

### Explorer les paramètres de tokens

1. Dans **« Realm settings »** > **« Tokens »**, observez les différents types de tokens :
   - **Access Token** — jeton d'accès aux ressources (courte durée : 5 min)
   - **Refresh Token** — jeton pour renouveler l'access token (longue durée)
   - **ID Token** — jeton d'identité OIDC (contient les informations utilisateur)
2. Notez les valeurs par défaut : elles seront utilisées dans les exercices suivants pour comprendre le cycle de vie des jetons

### Activer la journalisation des événements

1. Dans **« Realm settings »** > **« Events »**, cliquez sur l'onglet **« User events settings »**
2. Activez **« Save events »** (toggle ON)
3. Dans **« Saved types »**, cochez quelques événements : `LOGIN`, `LOGOUT`, `UPDATE_EMAIL`, `UPDATE_PROFILE`
4. Cliquez sur **« Save »**

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

## Récapitulatif des rôles créés

| Rôle | Type | Description | Rôles inclus |
| --- | --- | --- | --- |
| `sujet` | Simple | Citoyen de base | — |
| `artisan` | Simple | Accès aux ateliers | — |
| `marchand` | Simple | Accès aux marchés | — |
| `scribe` | Simple | Accès en lecture aux archives | — |
| `maitre-forgeron` | Composite | Maître artisan | `artisan`, `sujet` |
| `gouverneur` | Composite | Administrateur suprême | `sujet`, `artisan`, `marchand`, `scribe` |

---

## Lexique complet de l'Empire d'Authéria

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm `master` | Le Château de l'empereur (super-admin) |
| Realm role | Profil métier (fonction dans la société) |
| Composite role | Profil hiérarchique (inclut d'autres profils) |
| Client applicatif | Échoppe (point de service métier) |
| Groupe | Guilde (ex : guilde des forgerons) |
| Utilisateur | Sujet de l'empire |
| Client Scope / Mapper | Parchemin officiel |
| Service Account (M2M) | Automate impérial |
| Annuaire LDAP | Province alliée |
| IDP externe (SSO) | Ambassade étrangère |
| Politique de sécurité | Fortification |
| SMTP / Email | Réseau de messagers impériaux |
