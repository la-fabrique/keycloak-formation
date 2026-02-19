# Correction — Exercice 2 : Fonder la Province de Valdoria

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] Le realm `valdoria` a été créé et est actif
- [ ] L'isolation a été constatée (0 utilisateurs, clients système uniquement)
- [ ] Les 2 rôles simples ont été créés (`sujet`, `marchand`)
- [ ] Le rôle `sujet` est configuré comme rôle par défaut (ajouté à `default-roles-valdoria`)
- [ ] Le rôle composite a été créé (`gouverneur`)
- [ ] Le rôle composite inclut bien les 2 rôles de base (vérification dans « Associated roles »)
- [ ] Les paramètres de session ont été modifiés (15 min idle, 2h max)
- [ ] La configuration SMTP a été testée avec succès
- [ ] Un email de test est visible dans Mailhog

---

## Correction détaillée

### Étape 1 — Créer le realm `valdoria`

**Note formateur :** Si un participant a des difficultés à trouver le menu déroulant, rappelez qu'il se trouve **à gauche** du logo Keycloak (et non dans le menu utilisateur en haut à droite).

---

### Étape 2 — Constater l'isolation du nouveau realm


**Point de vigilance :** Certains participants peuvent être surpris de voir des clients et rôles "par défaut". Expliquez que ce sont des éléments système créés automatiquement par Keycloak pour chaque nouveau realm. Ils ne proviennent pas du realm `master`.

---

### Étape 3 — Créer les profils métier de base (rôles simples)

**Note formateur :** Les descriptions sont importantes pour la documentation. Encouragez les participants à les remplir soigneusement. Le modèle simplifié (2 rôles de base + 1 composite) facilite la compréhension du concept d'héritage sans surcharger les débutants.

#### Configurer `sujet` comme rôle par défaut

**Point de vigilance :** Certains participants peuvent confondre `default-roles-valdoria` (qui gère les rôles par défaut de tout le realm) avec le rôle composite `gouverneur` (qui est attribué manuellement). Rappeler que `default-roles-valdoria` est un mécanisme automatique du realm, tandis que `gouverneur` est un rôle métier composite attribué individuellement.

**Note formateur :** C'est un bon moment pour expliquer le concept de rôles par défaut. En production, on y place souvent les rôles de base que tout utilisateur doit posséder (ex : `user`, `basic-access`). Cela évite d'oublier d'attribuer manuellement ces rôles à chaque nouvel utilisateur.

---

### Étape 4 — Créer le profil hiérarchique (rôle composite)

#### Créer `gouverneur`

**Point de vigilance :** Vérifiez que les participants cochent bien les deux rôles. L'héritage ne fonctionne que si les rôles sont explicitement associés dans l'onglet « Associated roles ».

---

### Étape 5 — Vérifier la hiérarchie des rôles

**Point de discussion :** Les rôles composites sont essentiels en production pour gérer des hiérarchies complexes. Exemple réel : un rôle `admin-application` pourrait inclure `view-users`, `manage-users`, `view-logs`, `manage-config`, etc. Sans rôles composites, il faudrait attribuer manuellement des dizaines de rôles à chaque administrateur.

**Note pédagogique :** Notre modèle simplifié (3 rôles au total) permet de comprendre le mécanisme d'héritage sans surcharger les participants. Des structures de rôles plus complexes seront abordées dans les exercices avancés du Module 3.

---

### Étape 6 — Configurer les paramètres de session et de tokens

#### Sessions

**Note formateur :** Les participants peuvent être tentés de modifier les durées de tokens. Expliquez que les valeurs par défaut sont adaptées à la production. Un Access Token de 5 minutes est un bon compromis entre sécurité (courte durée) et performance (moins de rafraîchissements).

Le paramètre **Revoke Refresh Token** (OFF par défaut) permet de réutiliser un refresh token plusieurs fois jusqu'à son expiration. En mode ON, chaque rafraîchissement génère un nouveau refresh token (rotation), ce qui augmente la sécurité mais nécessite plus d'appels au serveur.

**Point de discussion :**
- **Session SSO** : combien de temps l'utilisateur reste connecté dans Keycloak
- **Access Token** : combien de temps une application peut utiliser un jeton avant de le rafraîchir
- **Refresh Token** : permet de renouveler l'Access Token sans redemander le mot de passe

---

### Étape 7 — Configurer le réseau de messagers impériaux (SMTP)

#### Configuration SMTP

**Note formateur :** Mailhog est un outil de développement uniquement. En production, Keycloak serait connecté à un serveur SMTP réel (SendGrid, AWS SES, serveur SMTP d'entreprise, etc.).

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

