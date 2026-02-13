# Correction — Exercice 2 : Fonder la Province de Valdoria

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Le realm `valdoria` a été créé et est actif
- [ ] L'isolation a été constatée (0 utilisateurs, clients système uniquement)
- [ ] Les 4 rôles simples ont été créés (`sujet`, `artisan`, `marchand`, `scribe`)
- [ ] Les 2 rôles composites ont été créés (`maitre-forgeron`, `gouverneur`)
- [ ] Les rôles composites incluent bien les rôles de base (vérification dans « Associated roles »)
- [ ] Les paramètres de session ont été modifiés (15 min idle, 2h max)
- [ ] La configuration SMTP a été testée avec succès
- [ ] Un email de test est visible dans Mailhog

---

## Correction détaillée

### Étape 1 — Créer le realm `valdoria`

**Procédure exacte :**

1. Menu déroulant des realms (haut gauche) > **« Create realm »**
2. Champ « Realm name » : `valdoria`
3. Toggle « Enabled » : ON (par défaut)
4. Bouton **« Create »**

**Résultat attendu :**
- La console bascule automatiquement sur le realm `valdoria`
- Le menu déroulant affiche maintenant `valdoria`
- L'URL devient : `http://localhost:8080/admin/valdoria/console/`

**Note formateur :** Si un participant a des difficultés à trouver le menu déroulant, rappelez qu'il se trouve **à gauche** du logo Keycloak (et non dans le menu utilisateur en haut à droite).

---

### Étape 2 — Constater l'isolation du nouveau realm

#### 2a. Utilisateurs

**Résultat attendu :**
- Menu **« Users »** > **« View all users »** : 0 utilisateurs
- Message affiché : *« No users found »*

#### 2b. Clients

**Clients système présents par défaut :**
- `account` — console de compte utilisateur (ancienne version)
- `account-console` — nouvelle console de compte (Keycloak 26+)
- `admin-cli` — client pour l'API d'administration
- `broker` — utilisé pour la fédération d'identité
- `realm-management` — client interne pour administrer le realm
- `security-admin-console` — console d'administration web

**Total : 6 clients système**

#### 2c. Rôles

**Rôles par défaut présents :**
- `default-roles-valdoria` — rôle composite attribué automatiquement à tous les nouveaux utilisateurs
- `offline_access` — permet d'obtenir des refresh tokens offline
- `uma_authorization` — User-Managed Access (autorisation fine)

**Total : 3 rôles par défaut**

**Point de vigilance :** Certains participants peuvent être surpris de voir des clients et rôles "par défaut". Expliquez que ce sont des éléments système créés automatiquement par Keycloak pour chaque nouveau realm. Ils ne proviennent pas du realm `master`.

---

### Étape 3 — Créer les profils métier de base (rôles simples)

**Procédure pour chaque rôle :**

1. Menu **« Realm roles »** > **« Create role »**
2. Remplir les champs (voir tableau ci-dessous)
3. **« Save »**

**Rôles à créer :**

| Role name | Description |
| --- | --- |
| `sujet` | Sujet du royaume de Valdoria — accès minimal aux services du royaume |
| `artisan` | Artisan du royaume de Valdoria — accès aux ateliers et ressources de production |
| `marchand` | Marchand du royaume de Valdoria — accès aux places de marché et registres commerciaux |
| `scribe` | Scribe du royaume de Valdoria — accès en lecture aux archives de la province |

**Résultat attendu :**
- 4 nouveaux rôles apparaissent dans la liste des **« Realm roles »**
- Total de rôles dans le realm : 7 (3 par défaut + 4 créés)

**Note formateur :** Les descriptions sont importantes pour la documentation. Encouragez les participants à les remplir soigneusement.

---

### Étape 4 — Créer les profils hiérarchiques (rôles composites)

#### Créer `maitre-forgeron`

**Procédure :**

1. **« Create role »**
2. Role name : `maitre-forgeron`
3. Description : `Maître artisan du royaume de Valdoria — droits étendus sur les ateliers et la formation des apprentis`
4. **« Save »**
5. Onglet **« Associated roles »** > **« Assign role »**
6. Cocher : `artisan` et `sujet`
7. **« Assign »**

**Vérification :**
- Dans l'onglet **« Associated roles »**, les 2 rôles doivent être listés
- Un badge indique le nombre de rôles associés : `2`

#### Créer `gouverneur`

**Procédure :**

1. **« Create role »**
2. Role name : `gouverneur`
3. Description : `Gouverneur du royaume de Valdoria — administrateur suprême de la province avec tous les droits`
4. **« Save »**
5. Onglet **« Associated roles »** > **« Assign role »**
6. Cocher : `sujet`, `artisan`, `marchand`, `scribe`
7. **« Assign »**

**Vérification :**
- Dans l'onglet **« Associated roles »**, les 4 rôles doivent être listés
- Un badge indique le nombre de rôles associés : `4`

**Point de vigilance :** Certains participants peuvent tenter d'ajouter `maitre-forgeron` au rôle `gouverneur`. Ce n'est pas nécessaire (et peut créer de la confusion). Le gouverneur hérite directement des rôles de base. Le `maitre-forgeron` est un profil métier spécialisé, pas un niveau hiérarchique inférieur au gouverneur.

**Résultat attendu :**
- Total de rôles dans le realm : 9 (3 par défaut + 4 simples + 2 composites)

---

### Étape 5 — Vérifier la hiérarchie des rôles

**Vérification `gouverneur` :**
- Menu **« Realm roles »** > clic sur `gouverneur`
- Onglet **« Associated roles »** : 4 rôles listés (`sujet`, `artisan`, `marchand`, `scribe`)

**Vérification `maitre-forgeron` :**
- Menu **« Realm roles »** > clic sur `maitre-forgeron`
- Onglet **« Associated roles »** : 2 rôles listés (`artisan`, `sujet`)

**Schéma hiérarchique :**

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

**Point de discussion :** Les rôles composites sont essentiels en production pour gérer des hiérarchies complexes. Exemple réel : un rôle `admin-application` pourrait inclure `view-users`, `manage-users`, `view-logs`, `manage-config`, etc. Sans rôles composites, il faudrait attribuer manuellement des dizaines de rôles à chaque administrateur.

---

### Étape 6 — Configurer les paramètres de session et de tokens

#### Sessions

**Navigation :**
- Menu **« Realm settings »** > onglet **« Sessions »**

**Valeurs à modifier :**
- **SSO Session Idle :** `15 minutes` (au lieu de 30 minutes)
- **SSO Session Max :** `2 hours` (au lieu de 10 heures)

**Valeurs à conserver :**
- **SSO Session Idle Remember Me :** 30 jours
- **SSO Session Max Remember Me :** 30 jours
- **Offline Session Idle :** 30 jours
- **Offline Session Max :** 60 jours

**Bouton « Save »** en bas de la page.

#### Tokens

**Navigation :**
- Menu **« Realm settings »** > onglet **« Tokens »**

**Valeurs par défaut à observer (ne pas modifier) :**
- **Access Token Lifespan :** 5 minutes
- **Access Token Lifespan For Implicit Flow :** 15 minutes
- **Client login timeout :** 1 minute
- **Login timeout :** 30 minutes
- **Login action timeout :** 5 minutes
- **User-Initiated Action Lifespan :** 5 minutes
- **Default Admin-Initiated Action Lifespan :** 12 heures
- **Revoke Refresh Token :** OFF (les refresh tokens ne sont pas révoqués après usage)

**Note formateur :** Les participants peuvent être tentés de modifier les durées de tokens. Expliquez que les valeurs par défaut sont adaptées à la production. Un Access Token de 5 minutes est un bon compromis entre sécurité (courte durée) et performance (moins de rafraîchissements).

Le paramètre **Revoke Refresh Token** (OFF par défaut) permet de réutiliser un refresh token plusieurs fois jusqu'à son expiration. En mode ON, chaque rafraîchissement génère un nouveau refresh token (rotation), ce qui augmente la sécurité mais nécessite plus d'appels au serveur.

**Point de discussion :**
- **Session SSO** : combien de temps l'utilisateur reste connecté dans Keycloak
- **Access Token** : combien de temps une application peut utiliser un jeton avant de le rafraîchir
- **Refresh Token** : permet de renouveler l'Access Token sans redemander le mot de passe

Ces 3 mécanismes sont distincts mais complémentaires.

---

### Étape 7 — Configurer le réseau de messagers impériaux (SMTP)

#### Configuration SMTP

**Navigation :**
- Menu **« Realm settings »** > onglet **« Email »**

**Valeurs exactes à saisir :**

| Champ | Valeur |
| --- | --- |
| **From** | `noreply@valdoria.empire` |
| **From display name** | `Province de Valdoria` |
| **Reply to** | *(vide)* |
| **Reply to display name** | *(vide)* |
| **Envelope from** | *(vide)* |
| **Host** | `autheria-mailhog` |
| **Port** | `1025` |
| **Encryption** | *(disabled / vide)* |
| **Authentication** | OFF (toggle désactivé) |

**Bouton « Save »** en bas de la page.

#### Test de connexion

**Procédure complète :**

1. Après sauvegarde, le bouton **« Test connection »** apparaît en haut de la page
2. Clic sur **« Test connection »**
3. Boîte de dialogue affiche : *« You need to configure your e-mail address first »*
4. Clic sur **« Configure e-mail address »**
5. **Redirection automatique vers le realm `master`** (profil de l'utilisateur `admin`)
6. Dans le champ **« Email »**, saisir : `admin@empire.local`
7. Clic sur **« Save »**
8. **Retour sur le realm `valdoria`** via le menu déroulant en haut à gauche
9. Navigation vers **« Realm settings »** > onglet **« Email »**
10. Clic sur **« Test connection »**
11. Boîte de dialogue affiche maintenant : `admin@empire.local`
12. Clic sur **« Send test email »**
13. Message de succès : *« Success! E-mail sent. »*

**Vérification dans Mailhog :**

1. Navigateur : `http://localhost:8025`
2. Interface Mailhog affiche 1 email
3. Détails de l'email :
   - **From :** `Province de Valdoria <noreply@valdoria.empire>`
   - **To :** `admin@empire.local`
   - **Subject :** `Test message`
   - **Body :** `This is a test message`

**Erreurs fréquentes :**

| Erreur | Cause | Solution |
| --- | --- | --- |
| `Connection refused` | Conteneur Mailhog non démarré | `docker compose ps` pour vérifier, puis `docker compose up -d` si nécessaire |
| `Unknown host: autheria-mailhog` | Mauvais nom d'hôte | Vérifier l'orthographe exacte : `autheria-mailhog` (avec tiret) |
| `Connection timeout` | Mauvais port | Vérifier le port : `1025` (SMTP), pas `8025` (web UI) |
| Email non reçu dans Mailhog | Mauvaise URL Mailhog | Vérifier l'URL : `http://localhost:8025` (pas 1025) |

**Note formateur :** Mailhog est un outil de développement uniquement. En production, Keycloak serait connecté à un serveur SMTP réel (SendGrid, AWS SES, serveur SMTP d'entreprise, etc.).

---

## Points de vigilance formateur

### Erreurs fréquentes des participants

| Erreur | Explication |
| --- | --- |
| Créer les rôles dans le realm `master` au lieu de `valdoria` | Vérifier que le menu déroulant affiche bien `valdoria` avant de créer les rôles |
| Oublier de sauvegarder un rôle avant d'ajouter les « Associated roles » | L'onglet « Associated roles » n'apparaît qu'après la première sauvegarde du rôle |
| Confondre « Assign role » (pour les rôles composites) et « Assign users » (pour attribuer un rôle à un utilisateur) | Clarifier la différence : « Assign role » = créer un rôle composite ; « Assign users » sera vu à l'exercice 3 |
| Utiliser `localhost` ou `mailhog` comme nom d'hôte SMTP | Le nom d'hôte Docker correct est `autheria-mailhog` (nom du service dans docker-compose.yml) |
| Utiliser le port `8025` pour SMTP | `8025` est le port web de Mailhog. Le port SMTP est `1025` |
| Oublier de retourner sur le realm `valdoria` après avoir configuré l'email de l'admin | Après avoir configuré l'email dans le realm `master`, il faut impérativement revenir sur `valdoria` pour tester le SMTP |
| Tenter de se connecter à la console de compte `valdoria` avec `admin/admin` | L'utilisateur `admin` n'existe que dans le realm `master`. Aucun utilisateur n'existe encore dans `valdoria` |

### Gestion du timing

- Si la session prend du retard, la section « Pour aller plus loin » peut être sautée
- L'étape 7 (SMTP) peut être abrégée : configuration uniquement, sans test complet (le SMTP sera naturellement testé dans l'exercice 3 lors de l'envoi d'emails de vérification)
- Les étapes 3 et 4 (création des rôles) sont essentielles — ne pas les sauter
- Durée estimée : 30 minutes (25 minutes pour les étapes principales + 5 minutes pour « Pour aller plus loin »)

---

## Points de discussion

Sujets à aborder avec les participants après l'exercice :

### 1. Pourquoi créer un realm dédié plutôt qu'utiliser `master` ?

**Réponse :**
- Le realm `master` est réservé à l'administration de Keycloak lui-même
- Chaque organisation, application ou tenant doit avoir son propre realm
- Cela garantit l'isolation totale des données (utilisateurs, rôles, clients)
- En production : 1 realm par environnement (dev, staging, prod) ou 1 realm par tenant (multi-tenant SaaS)

### 2. Quand utiliser des rôles composites ?

**Réponse :**
- Quand il existe une hiérarchie de droits (ex : admin > manager > user)
- Quand un profil métier nécessite plusieurs rôles de base (ex : un chef de projet a besoin de `view-users` + `view-projects` + `manage-tasks`)
- Pour simplifier la gestion : attribuer 1 rôle composite au lieu de 10 rôles individuels
- Attention : ne pas abuser des rôles composites (complexité de maintenance)

### 3. Pourquoi des sessions courtes (15 min idle) ?

**Réponse :**
- Sécurité : limite la fenêtre d'exploitation en cas de vol de session
- En production, les valeurs dépendent du contexte :
  - Application bancaire : sessions très courtes (5-10 min)
  - Application interne d'entreprise : sessions plus longues (30-60 min)
  - Application grand public : compromis (15-30 min)
- Le « Remember Me » permet de prolonger la durée pour les utilisateurs de confiance

### 4. Différence entre session SSO et durée de vie du token ?

**Réponse :**
- **Session SSO** : combien de temps l'utilisateur reste connecté **dans Keycloak**
- **Access Token** : combien de temps une application peut utiliser un jeton **sans le rafraîchir**
- **Refresh Token** : permet de renouveler l'Access Token sans redemander le mot de passe (tant que la session SSO est active)

**Exemple concret :**
- Session SSO : 2 heures
- Access Token : 5 minutes
- L'utilisateur se connecte à 10h00
- L'application rafraîchit automatiquement le token toutes les 5 minutes (invisible pour l'utilisateur)
- A 12h00, la session SSO expire : l'utilisateur doit se reconnecter

### 5. Pourquoi Mailhog et pas un vrai serveur SMTP ?

**Réponse :**
- Mailhog est un outil de développement : il capture les emails sans les envoyer réellement
- Avantages :
  - Pas besoin de configuration complexe (pas d'authentification, pas de TLS)
  - Pas de risque d'envoyer des emails de test à de vraies adresses
  - Interface web pratique pour visualiser les emails
- En production : utiliser un vrai serveur SMTP (SendGrid, AWS SES, Mailgun, serveur d'entreprise)

---

## Transition vers l'exercice 3

> La Province de Valdoria possède maintenant ses institutions fondamentales : les profils métier sont définis, les paramètres de session sont configurés et le réseau de messagers est opérationnel.
>
> Il est temps d'accueillir les premiers sujets de la province. Dans l'exercice suivant, vous créerez des utilisateurs, leur attribuerez des profils métier et observerez comment ces rôles apparaissent dans leurs laissez-passer numériques (jetons JWT).

---

## Annexe — Commandes de vérification

### Vérifier l'état des conteneurs

```bash
docker compose ps
```

Résultat attendu : 4 conteneurs en état `running`, dont `autheria-keycloak` et `autheria-mailhog`.

### Consulter les logs de Keycloak

```bash
docker compose logs -f keycloak
```

Utile pour débugger les problèmes de configuration SMTP.

### Consulter les logs de Mailhog

```bash
docker compose logs -f mailhog
```

Permet de voir les connexions SMTP entrantes.

### Réinitialiser complètement l'environnement

```bash
docker compose down -v
docker compose up -d
```

**Attention :** Cette commande supprime toutes les données (realms, utilisateurs, rôles). A utiliser uniquement en cas de problème majeur.

---

## Annexe — Export JSON du realm `valdoria`

Pour référence, voici à quoi ressemble un export partiel du realm `valdoria` après cet exercice :

```json
{
  "realm": "valdoria",
  "enabled": true,
  "ssoSessionIdleTimeout": 900,
  "ssoSessionMaxLifespan": 7200,
  "accessTokenLifespan": 300,
  "roles": {
    "realm": [
      {
        "name": "sujet",
        "description": "Citoyen de base de Valdoria — accès minimal aux services publics",
        "composite": false
      },
      {
        "name": "artisan",
        "description": "Artisan de Valdoria — accès aux ateliers et ressources de production",
        "composite": false
      },
      {
        "name": "marchand",
        "description": "Marchand de Valdoria — accès aux places de marché et registres commerciaux",
        "composite": false
      },
      {
        "name": "scribe",
        "description": "Scribe de Valdoria — accès en lecture aux archives de la province",
        "composite": false
      },
      {
        "name": "maitre-forgeron",
        "description": "Maître artisan de Valdoria — droits étendus sur les ateliers et la formation des apprentis",
        "composite": true,
        "composites": {
          "realm": ["artisan", "sujet"]
        }
      },
      {
        "name": "gouverneur",
        "description": "Gouverneur de Valdoria — administrateur suprême de la province avec tous les droits",
        "composite": true,
        "composites": {
          "realm": ["sujet", "artisan", "marchand", "scribe"]
        }
      }
    ]
  },
  "smtpServer": {
    "host": "autheria-mailhog",
    "port": "1025",
    "from": "noreply@valdoria.empire",
    "fromDisplayName": "Province de Valdoria"
  }
}
```

**Note formateur :** Cet export peut être utilisé pour réinitialiser rapidement un realm à l'état de fin d'exercice 2 (via **« Realm settings »** > **« Action »** > **« Partial import »**).
