# Correction — Exercice 1 : Fonder la capitale

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Les 4 conteneurs Docker sont en état `running`
- [ ] Le conteneur `autheria-keycloak` est `healthy`
- [ ] Le participant est connecté à la console d'administration
- [ ] Le realm `master` a été exploré (utilisateurs, paramètres, sessions, clients)
- [ ] Un realm `test-isolation` a été créé et l'isolation constatée (Users vide, clients par défaut)
- [ ] Le client `realm-management` du realm `test-isolation` a été exploré (onglet Roles)
- [ ] La création automatique du client `test-isolation` dans le realm `master` a été observée
- [ ] Le realm `test-isolation` a été supprimé et le client correspondant disparu de `master`

---

## Correction détaillée

### Étape 1 — Lancer l'environnement Docker

**Notes formateur :**
- Si un participant a un Mac Apple Silicon (ARM), les images sont compatibles multi-architecture — aucun problème attendu
- Alternative pour le debug : `docker compose up` (sans `-d`) affiche les logs en temps réel dans le terminal
- En cas de problème persistant : `docker compose down -v` pour repartir de zéro, puis `docker compose up -d`

---

### Étape 2 — Accéder à la console d'administration

**URL exacte :** `http://localhost:8080`

**Identifiants :**
- Utilisateur : `admin`
- Mot de passe : `admin`

Ces valeurs proviennent des variables `KC_BOOTSTRAP_ADMIN_USERNAME` et `KC_BOOTSTRAP_ADMIN_PASSWORD` définies dans le `docker-compose.yml` (syntaxe Keycloak 26+).

**Note formateur :** Si un participant a modifié le fichier `.env`, ses identifiants seront différents. Vérifier le contenu de son `.env` en cas de problème de connexion.

---

### Étape 3 — Explorer le realm `master`

#### 3a. Utilisateurs

**Résultat attendu :**
- Un seul utilisateur : `admin`
- Cet utilisateur a le rôle composé `admin` dans le realm (visible dans l'onglet « Role mappings »)
- L'onglet « Sessions » montre la session navigateur actuelle

#### 3b. Realm Settings

**Points à observer :**
- **General** : le nom du realm est `master` — ce champ ne peut pas être modifié
- **Login** : par défaut, l'auto-inscription (« User registration ») est désactivée
- **Email** : aucun serveur SMTP n'est configuré pour `master` (ce sera fait dans l'exercice 2 pour le realm `valdoria`)
- **Themes** : le thème par défaut est `keycloak` pour toutes les pages
- **Sessions** : SSO Session Idle = 30 minutes, SSO Session Max = 10 heures (valeurs par défaut)
- **Tokens** : Access Token Lifespan = 5 minutes (valeur par défaut)

#### 3c. Sessions

**Résultat attendu :**
- La session admin est visible avec :
  - L'adresse IP (généralement `172.x.x.x` depuis le réseau Docker, ou `127.0.0.1`)
  - Le client `security-admin-console`
  - L'heure de début et le dernier accès

#### 3d. Clients du realm `master`

**Résultat attendu :** la liste initiale contient (au minimum) :
- `admin-cli` — client en ligne de commande pour l'administration via l'API REST
- `security-admin-console` — la console d'administration elle-même
- `broker` — utilisé pour la fédération d'identité
- `master-realm` — client interne du realm

**Point à souligner :** noter cette liste, car un nouveau client va y apparaître à l'étape 4 lors de la création d'un realm. C'est le mécanisme par lequel le realm `master` maintient le contrôle sur les autres realms.

---

### Étape 4 — Créer puis supprimer un realm de test

**Point à souligner :** 

ce client est créé automatiquement dans **chaque** realm. Il permet de déléguer finement les droits d'administration d'un realm sans donner accès au realm `master`.

Un nouveau client nommé **`test-isolation`** doit être apparu dans la liste
C'est le mécanisme automatique de Keycloak : chaque nouveau realm génère un client du même nom dans `master`, permettant au Château de l'empereur d'administrer la province

**Note :** Dans Keycloak 26, la confirmation de suppression demande de retaper le nom du realm. C'est une mesure de sécurité pour éviter les suppressions accidentelles.

---

## Points de vigilance formateur

### Erreurs fréquentes des participants

| Erreur | Explication |
| --- | --- |
| Créer des utilisateurs dans le realm `master` | Expliquer que `master` est réservé à l'administration. Les utilisateurs applicatifs seront créés dans un realm dédié (exercice 2 et 3). |
| Confondre le menu déroulant des realms (haut gauche) avec le menu utilisateur (haut droite) | Le menu déroulant des realms se trouve **à gauche** du logo Keycloak. Le menu utilisateur (déconnexion, server info) est **à droite**. |
| Oublier de revenir sur `master` avant de supprimer le realm de test | On ne peut supprimer un realm que depuis un **autre** realm. Si le participant est dans `test-isolation`, il doit d'abord basculer vers `master`. |
| Tenter de supprimer le realm `master` | Le realm `master` ne peut pas être supprimé. C'est le seul realm protégé dans Keycloak. |

### Gestion du timing

- Si la session prend du retard, les étapes 3b (Realm Settings) et 3c (Sessions) peuvent être abrégées
- L'étape 4 (création/suppression de realm) est essentielle — ne pas la sauter car elle démontre le concept fondamental d'isolation

---

## Points de discussion

Sujets à aborder avec les participants après l'exercice :

1. **Pourquoi `master` est-il spécial ?**
   - C'est le seul realm qui ne peut pas être supprimé
   - Il contrôle la gestion de tous les autres realms
   - En production, il ne contient que les administrateurs de la plateforme Keycloak elle-même

2. **Que se passe-t-il en production ?**
   - Le realm `master` n'a que des utilisateurs admin (l'équipe infrastructure / plateforme)
   - Chaque application, tenant ou organisation dispose de son propre realm
   - Exemple : une entreprise avec 3 applications aurait un realm par application (ou un realm unique si les utilisateurs sont partagés)

3. **Analogie avec d'autres technologies**
   - L'isolation des realms est comparable aux **namespaces** Kubernetes
   - Ou aux **schémas** de base de données
   - Ou aux **tenants** dans une architecture multi-tenant

---

## Transition vers l'exercice 2

> Maintenant que la capitale est fondée et le Château de l'empereur découvert, les administrateurs impériaux vont créer la **Province de Valdoria** — un realm dédié où seront configurés les utilisateurs, clients et rôles de la formation.
>
> Dans l'exercice suivant, vous créerez le realm `valdoria`, établirez les profils métier de la province (rôles) et brancherez le serveur de courrier (Mailhog) pour les notifications officielles.
