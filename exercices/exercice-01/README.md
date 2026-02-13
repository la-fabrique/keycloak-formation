# Exercice 1 — Fonder la capitale

> **Module 1 — Fondations et environnement**
> Durée estimée : 30 minutes | Difficulté : ★☆☆☆☆ (débutant)

---

## Objectifs pédagogiques

A l'issue de cet exercice, vous serez capable de :

- Installer et lancer Keycloak 26.1 via Docker
- Naviguer dans la console d'administration
- Comprendre le rôle du realm `master` (le Château de l'empereur)
- Observer l'isolation entre realms (provinces)

---

## Prérequis

### Prérequis techniques

- **Docker** (Docker Desktop ou Docker Engine + Docker Compose) installé et fonctionnel
- Un **navigateur web** moderne (Chrome, Firefox, Edge)
- Un **terminal** / ligne de commande
- Minimum **4 Go de RAM** disponibles pour les conteneurs Docker
- Les **ports suivants** doivent être libres : `8080`, `8025`, `5432`, `389`

### Prérequis de connaissances

- Notions de base Docker (`docker compose up`, `docker compose down`)
- Navigation web standard
- Aucune connaissance préalable de Keycloak n'est requise

---

## Contexte narratif

> Vous êtes un **Architecte de la Sécurité** de l'Empire d'Authéria.
>
> Avant de gouverner, il faut bâtir la capitale. Votre première mission : déployer le **château central** — le serveur Keycloak — et découvrir **le Château de l'empereur**, siège du pouvoir absolu qui contrôle l'ensemble de l'empire.
>
> Le Château de l'empereur (realm `master`) est le centre nerveux de l'administration. Aucune application ne doit jamais y être rattachée directement : il est réservé aux super-administrateurs.

### Lexique de l'Empire

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm `master` | Le Château de l'empereur (super-admin) |
| Utilisateur | Sujet de l'empire |

---

## Étapes

### Étape 1 — Lancer l'environnement Docker

Ouvrez un terminal et placez-vous dans le dossier `infrastructure/` du dépôt de formation :

```bash
cd infrastructure
```

Lancez l'ensemble des services en arrière-plan :

```bash
docker compose up -d
```

Attendez que tous les conteneurs soient prêts, puis vérifiez leur état :

```bash
docker compose ps
```

**Résultat attendu :**

```
NAME                  STATUS
autheria-keycloak     running (healthy)
autheria-postgres     running (healthy)
autheria-mailhog      running
autheria-openldap     running
```

> **Note :** Le conteneur `autheria-keycloak` peut mettre **30 à 60 secondes** avant de passer au statut `healthy`. Si le statut indique `starting`, patientez quelques instants et relancez `docker compose ps`.

**A quoi servent ces conteneurs ?**

| Conteneur | Rôle |
| --- | --- |
| `autheria-keycloak` | Le serveur Keycloak 26.1 — le château central |
| `autheria-postgres` | La base de données PostgreSQL qui stocke la configuration de Keycloak |
| `autheria-mailhog` | Un serveur SMTP de test pour capturer les emails (vérification, réinitialisation) |
| `autheria-openldap` | Un annuaire LDAP — le registre de la province voisine (utilisé au Jour 2) |

> **Checkpoint :** La commande `docker compose ps` affiche 4 conteneurs avec le statut `running`. Le conteneur `autheria-keycloak` est au statut `healthy`.

---

### Étape 2 — Accéder à la console d'administration

1. Ouvrez votre navigateur web
2. Rendez-vous à l'adresse : **http://localhost:8080**
3. Sur la page d'accueil de Keycloak, cliquez sur **« Administration Console »**
4. Connectez-vous avec les identifiants suivants :
   - **Utilisateur :** `admin`
   - **Mot de passe :** `admin`

Vous arrivez sur le tableau de bord de la console d'administration. En haut à gauche, un menu déroulant affiche **« master »** — c'est le realm actif.

> **Checkpoint :** Vous êtes connecté à la console d'administration. Le menu déroulant en haut à gauche affiche `master`.

---

### Étape 3 — Explorer le realm `master` (le Château de l'empereur)

Le realm `master` est le siège du Château de l'empereur. Explorons ses différentes composantes.

#### 3a. Les sujets du Château de l'empereur (Utilisateurs)

1. Dans le **menu latéral gauche**, cliquez sur **« Users »**
2. Cliquez sur **« View all users »** (ou cherchez avec un filtre vide)
3. Observez : il n'existe qu'**un seul utilisateur** — `admin`
4. Cliquez sur cet utilisateur et parcourez les onglets principaux :
   - **Details** — informations de base (nom, email, statut)
   - **Credentials** — gestion du mot de passe
   - **Role mappings** — rôles attribués à cet utilisateur
   - **Groups** — groupes auxquels appartient l'utilisateur
   - **Consents** — consentements accordés par l'utilisateur
   - **Identity provider links** — liens avec des fournisseurs d'identité externes
   - **Sessions** — sessions actives de cet utilisateur
   - **Events** — événements liés à cet utilisateur

#### 3b. Les paramètres de la province (Realm Settings)

1. Dans le menu latéral gauche, cliquez sur **« Realm Settings »**
2. Explorez les onglets principaux :
   - **General** — le nom du realm (`master`, non modifiable) et le nom d'affichage
   - **Login** — options de la page de connexion (inscription, mot de passe oublié, etc.)
   - **Email** — configuration du serveur SMTP (vide pour `master`)
   - **Themes** — personnalisation visuelle des pages de connexion et de la console
   - **Keys** — clés cryptographiques utilisées pour signer les jetons
   - **Events** — configuration de la journalisation des événements de sécurité
   - **Localization** — traductions et langues disponibles pour l'interface
   - **Security defenses** — protection contre les attaques (brute force, clickjacking, etc.)
   - **Sessions** — durée de vie des sessions (SSO Session Idle, SSO Session Max)
   - **Tokens** — durée de vie des jetons d'accès
   - **Client policies** — politiques de sécurité pour les clients
   - **User profile** — configuration des attributs et champs utilisateur
   - **User registration** — configuration de l'auto-enregistrement des utilisateurs

#### 3c. Les sessions actives

1. Dans le menu latéral gauche, cliquez sur **« Sessions »**
2. Votre session administrateur actuelle devrait être visible
3. Observez les informations affichées : adresse IP, heure de début, dernier accès

> **Checkpoint :** Vous avez identifié l'utilisateur `admin` comme seul sujet du Château de l'empereur. Vous avez parcouru les onglets Realm Settings et observé votre propre session active.

---

### Étape 4 — Créer puis supprimer un realm de test

L'objectif de cette étape est de constater par vous-même l'**isolation totale** entre les realms.

#### Créer un nouveau realm

1. Cliquez sur **Manage realms** en haut à gauche
2. Cliquez sur **« Create realm »**
3. Dans le champ **« Realm name »**, saisissez : `test-isolation`
4. Cliquez sur **« Create »**

La console bascule automatiquement sur le nouveau realm `test-isolation`.

#### Constater l'isolation

5. Naviguez vers **« Users »** et cliquez sur **« View all users »**
   - **Observation :** la liste est **vide** — aucun utilisateur du realm `master` n'apparaît ici
6. Naviguez vers **« Clients »**
   - **Observation :** seuls les clients par défaut sont présents (`account`, `admin-cli`, etc.) — aucun client personnalisé de `master`

Chaque realm est un **univers complètement isolé**. Les utilisateurs, clients, rôles et paramètres sont indépendants d'un realm à l'autre.

#### Supprimer le realm de test

7. Rebasculez sur le realm `master` via le menu déroulant en haut à gauche
8. Ouvrez à nouveau le menu déroulant des realms
9. A côté du realm `test-isolation`, cliquez sur les **trois points** (menu contextuel) puis sur **« Delete »**
10. Confirmez la suppression dans la boîte de dialogue

> **Checkpoint :** Le realm `test-isolation` a été créé, vous avez constaté qu'il ne contient aucun utilisateur. Après suppression, seul le realm `master` subsiste dans le menu déroulant.

---

## Point clé

> **Le realm `master` est le Château de l'empereur.**
>
> Il est réservé **exclusivement** à l'administration globale de Keycloak. Les applications et les utilisateurs finaux ne doivent **jamais** être rattachés au realm `master`. Chaque application ou organisation doit disposer de son propre realm dédié.

---

## Dépannage

| Problème | Cause probable | Solution |
| --- | --- | --- |
| `docker compose up` échoue avec « port already in use » | Un autre service utilise le port 8080, 5432 ou 389 | Arrêtez le service concurrent ou modifiez le port dans le fichier `.env` |
| Keycloak démarre puis s'arrête | PostgreSQL n'est pas encore prêt | Relancez avec `docker compose up -d` et consultez les logs : `docker compose logs keycloak` |
| La page `localhost:8080` ne répond pas | Keycloak n'a pas fini de démarrer | Patientez 30 à 60 secondes, puis vérifiez avec `docker compose ps` que le statut est `healthy` |
| « Invalid credentials » lors de la connexion admin | Mauvais identifiants | Vérifiez le fichier `.env` : les valeurs par défaut sont `admin` / `admin` |
| Les conteneurs consomment trop de RAM | Mémoire insuffisante allouée à Docker | Dans Docker Desktop > Settings > Resources, allouez au minimum 4 Go de RAM |

---

## Pour aller plus loin

Si vous avez terminé en avance, explorez ces éléments supplémentaires :

- **Server Info** — dans la console d'administration, cliquez sur votre nom d'utilisateur (en haut à droite) puis sur « Server info ». Observez la version de Keycloak, les providers disponibles et les thèmes installés.
- **Endpoint de santé** — dans votre navigateur, accédez à `http://localhost:9000/health/ready`. Vous devriez voir `{"status":"UP"}`. Ce endpoint est exposé sur le port de management (9000), distinct du port HTTP principal (8080).
- **Interface Mailhog** — accédez à `http://localhost:8025`. L'interface est vide pour l'instant (aucun email envoyé), mais elle sera utilisée dans les exercices suivants.
- **Logs Keycloak** — dans votre terminal, lancez `docker compose logs -f keycloak` pour suivre les logs en temps réel. Identifiez le message indiquant que Keycloak est prêt.

---

## Récapitulatif des commandes

| Commande | Description |
| --- | --- |
| `docker compose up -d` | Lancer l'environnement en arrière-plan |
| `docker compose ps` | Vérifier l'état des conteneurs |
| `docker compose logs -f keycloak` | Suivre les logs de Keycloak en temps réel |
| `docker compose down` | Arrêter l'environnement (données conservées) |
| `docker compose down -v` | Arrêter l'environnement et supprimer les données |

---

## Lexique complet de l'Empire d'Authéria

| Concept Keycloak | Métaphore Authéria |
| --- | --- |
| Realm | Province de l'empire |
| Realm `master` | Le Château de l'empereur (super-admin) |
| Client applicatif | Échoppe (point de service métier) |
| Rôle (Realm role) | Profil métier (paysan, chambellan, forgeron) |
| Groupe | Guilde (ex : guilde des forgerons) |
| Utilisateur | Sujet de l'empire |
| Client Scope / Mapper | Parchemin officiel |
| Service Account (M2M) | Automate impérial |
| Annuaire LDAP | Province alliée |
| IDP externe (SSO) | Ambassade étrangère |
| Politique de sécurité | Fortification |
