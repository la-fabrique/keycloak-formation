# Correction — Exercice 1 : Fonder la capitale

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Les 4 conteneurs Docker sont en état `running`
- [ ] Le conteneur `autheria-keycloak` est `healthy`
- [ ] Le participant est connecté à la console d'administration
- [ ] Le realm `master` a été exploré (utilisateurs, paramètres, sessions)
- [ ] Un realm `test-isolation` a été créé et l'isolation constatée
- [ ] Le realm `test-isolation` a été supprimé

---

## Correction détaillée

### Étape 1 — Lancer l'environnement Docker

**Commandes exactes :**

```bash
cd infrastructure
docker compose up -d
```

**Sortie attendue :**

```
[+] Running 5/5
 ✔ Network infrastructure_autheria-network  Created
 ✔ Volume "infrastructure_postgres_data"     Created
 ✔ Volume "infrastructure_openldap_data"     Created
 ✔ Volume "infrastructure_openldap_config"   Created
 ✔ Container autheria-postgres               Started
 ✔ Container autheria-mailhog                Started
 ✔ Container autheria-openldap               Started
 ✔ Container autheria-keycloak               Started
```

**Timing :**
- PostgreSQL : prêt en ~5 secondes
- Keycloak : `healthy` en 30 à 60 secondes (peut aller jusqu'à 90 secondes sur des machines lentes)
- Mailhog et OpenLDAP : démarrage immédiat

**Vérification :**

```bash
docker compose ps
```

Résultat :

```
NAME                  STATUS                   PORTS
autheria-keycloak     running (healthy)        0.0.0.0:8080->8080/tcp
autheria-mailhog      running                  0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
autheria-openldap     running                  0.0.0.0:389->389/tcp
autheria-postgres     running (healthy)        0.0.0.0:5432->5432/tcp
```

**Notes formateur :**
- Si un participant a un Mac Apple Silicon (ARM), les images sont compatibles multi-architecture — aucun problème attendu
- Alternative pour le debug : `docker compose up` (sans `-d`) affiche les logs en temps réel dans le terminal
- En cas de problème persistant : `docker compose down -v` pour repartir de zéro, puis `docker compose up -d`

---

### Étape 2 — Accéder à la console d'administration

**URL exacte :** `http://localhost:8080`

Après clic sur « Administration Console », l'URL devient :
`http://localhost:8080/admin/master/console/`

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
- **Email** : aucun serveur SMTP n'est configuré pour `master` (ce sera fait dans l'exercice 2 pour le realm `autheria`)
- **Themes** : le thème par défaut est `keycloak` pour toutes les pages
- **Sessions** : SSO Session Idle = 30 minutes, SSO Session Max = 10 heures (valeurs par défaut)
- **Tokens** : Access Token Lifespan = 5 minutes (valeur par défaut)

#### 3c. Sessions

**Résultat attendu :**
- La session admin est visible avec :
  - L'adresse IP (généralement `172.x.x.x` depuis le réseau Docker, ou `127.0.0.1`)
  - Le client `security-admin-console`
  - L'heure de début et le dernier accès

---

### Étape 4 — Créer puis supprimer un realm de test

#### Création

1. Menu déroulant du realm (haut gauche, affiche `master`)
2. Bouton **« Create realm »**
3. Champ « Realm name » : saisir `test-isolation`
4. Cliquer sur **« Create »**
5. La console bascule automatiquement vers le nouveau realm

#### Vérification de l'isolation

- **Users > View all users** : 0 utilisateurs — aucun héritage depuis `master`
- **Clients** : seuls les clients par défaut sont présents (`account`, `admin-cli`, `broker`, `realm-management`, `security-admin-console`)
- **Realm roles** : seuls les rôles par défaut existent (`default-roles-test-isolation`, `offline_access`, `uma_authorization`)

#### Suppression

La procédure de suppression dans Keycloak 26 :

1. Rebasculer sur `master` via le menu déroulant
2. Ouvrir à nouveau le menu déroulant des realms
3. A côté de `test-isolation`, cliquer sur les **trois points** (icône kebab)
4. Cliquer sur **« Delete »**
5. Saisir le nom du realm (`test-isolation`) pour confirmer la suppression
6. Cliquer sur **« Delete »**

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

> Maintenant que la capitale est fondée et la Couronne découverte, les architectes vont créer le **Royaume d'Authéria** — un realm dédié où seront configurés les utilisateurs, clients et rôles de la formation.
>
> Dans l'exercice suivant, vous créerez le realm `autheria`, configurerez son thème et brancherez le serveur de courrier (Mailhog) pour les notifications du royaume.
