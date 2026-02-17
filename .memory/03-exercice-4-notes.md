# Notes — Exercice 4 : Configuration et choix pédagogiques

> Document de référence pour l'équipe pédagogique

---

## Résumé de l'exercice 4

**Titre :** Ouvrir le Comptoir des voyageurs et sa Réserve

**Module :** Module 2 — Gestion des clients

**Durée estimée :** 45 minutes

**Difficulté :** ★★★☆☆ (intermédiaire)

---

## Choix pédagogiques principaux

### 1. Focus sur la configuration Keycloak (pas d'application réelle)

**Décision :** L'exercice se concentre sur la **configuration des clients et des mappers** dans Keycloak, sans nécessiter le lancement d'une application front-end ou d'une API backend.

**Justification :**
- Permet de se concentrer sur les concepts OIDC/OAuth2 sans être distrait par du code applicatif
- L'outil **Evaluate** de Keycloak permet de visualiser parfaitement le contenu des jetons sans avoir à gérer une vraie application
- Simplifie la logistique (pas de dépendances Node.js/React/etc. à installer)
- Réduit les sources d'erreur (problèmes réseau, ports occupés, etc.)

**Applications de démonstration :**
- Existantes dans `src/front` et `src/api` (pour référence future ou exercices avancés)
- Non utilisées dans cet exercice de base
- Peuvent être activées dans une variante approfondie de l'exercice (voir CORRECTION.md)

### 2. Utilisation de l'outil Evaluate comme outil central

**Décision :** L'outil **Client scopes > Evaluate** est l'outil principal pour vérifier la configuration.

**Avantages :**
- Permet de prévisualiser les jetons **avant** de connecter une vraie application
- Permet de tester rapidement différents utilisateurs sans se reconnecter manuellement
- Visualisation claire et décodée du JWT (pas besoin de jwt.io)
- Outil natif Keycloak, toujours disponible

**Limites pédagogiques assumées :**
- Ne montre pas le flux complet (redirection, callback, etc.)
- Ne montre pas l'intégration réelle dans une application
- Solution : ces aspects seront abordés dans l'exercice 5 (Explorer les voies de commerce) avec Postman

### 3. Configuration de PKCE dès le début

**Décision :** PKCE (Proof Key for Code Exchange) avec méthode **S256** est activé dès la création du client public.

**Justification :**
- PKCE est **obligatoire** selon les recommandations OAuth 2.1 pour les clients publics
- Former dès maintenant aux bonnes pratiques de sécurité
- PKCE sera utilisé par défaut dans les applications modernes (oidc-client-ts, Auth0, etc.)

**Note :** Keycloak 26.1 ne force pas PKCE par défaut → configuration manuelle nécessaire.

### 4. Introduction progressive des concepts de mappers

**Décision :** L'exercice montre que certains mappers existent déjà (rôles de royaume dans le scope `roles`) tandis que d'autres doivent être créés (attribut `ville_origine`, audience).

**Objectif pédagogique :**
- Montrer la différence entre scopes **par défaut** (partagés) et scopes **personnalisés** (métier)
- Expliquer le concept de **scope dédié** (propre à un client)
- Introduire les différents types de mappers (User Attribute, Audience, etc.)

**Progression :**
- Étape 5 : Vérification d'un mapper existant (passif)
- Étape 6 : Création d'un mapper personnalisé (actif)
- Étape 8 : Création d'un mapper d'audience dans un scope dédié (avancé)

### 5. Concept d'audience (`aud`) explicitement configuré

**Décision :** Un mapper d'audience manuel est créé pour forcer `reserve-valdoria` dans le claim `aud`.

**Justification :**
- Le mapper `audience resolve` automatique ne fonctionne **que** si l'utilisateur a des rôles sur le client cible
- Dans notre cas, `reserve-valdoria` est bearer-only sans rôles de client → audience resolve ne l'ajoute pas
- Créer un mapper manuel **force** l'audience et illustre explicitement le concept

**Alternative envisagée (non retenue) :**
Créer des rôles de client sur `reserve-valdoria` (ex : `api-reader`, `api-writer`) et les attribuer aux utilisateurs → audience resolve fonctionnerait automatiquement. Mais cela complexifie l'exercice et mélange deux concepts (rôles de client vs rôles de royaume).

---

## Concepts OIDC/OAuth2 abordés

### Flux d'authentification
- **Authorization Code Flow** (Standard flow dans Keycloak)
- **PKCE** (Proof Key for Code Exchange) avec méthode S256

### Types de clients
- **Client public** (SPA — Single Page Application)
  - Pas de secret (Client authentication = OFF)
  - Initie des flux d'authentification
  - Exemple : `comptoir-des-voyageurs`

- **Client bearer-only** (API)
  - Client confidentiel sans flux activé
  - Se contente de valider les jetons
  - Exemple : `reserve-valdoria`

### Types de jetons
- **Access Token** : jeton d'autorisation envoyé à l'API
- **ID Token** : jeton d'identité utilisé par le client (mentionné dans "Pour aller plus loin")
- **Refresh Token** : jeton de renouvellement (mentionné dans "Pour aller plus loin")

### Claims JWT
- **`aud`** (audience) : destinataire du jeton
- **`azp`** (authorized party) : client qui a demandé le jeton
- **`realm_access.roles`** : rôles de royaume de l'utilisateur
- **`resource_access.{client}.roles`** : rôles de client de l'utilisateur
- **Attributs personnalisés** : `ville_origine` (exemple de claim métier)

### Mappers
- **User Realm Role** : injecte les rôles de royaume
- **User Attribute** : injecte un attribut utilisateur
- **Audience** : force une audience dans le jeton

### Client Scopes
- **Scopes par défaut** : `profile`, `email`, `roles`, `web-origins` (partagés entre tous les clients)
- **Scopes personnalisés** : `profil-valdorien` (créé pour les besoins métier)
- **Scopes dédiés** : `comptoir-des-voyageurs-dedicated` (propre à un client)

---

## Points TODO / Questions ouvertes

### 1. Ports des applications de démonstration

**Statut :** À vérifier

**Détail :** L'exercice suppose que l'app front-end tourne sur `http://localhost:3000`. Vérifier dans `src/front` le port exact utilisé (peut être 5173 pour Vite, 3000 pour Create React App, etc.).

**Impact :** Si le port diffère, ajuster dans le README.md :
- Étape 2 : Valid redirect URIs, Root URL, Web origins
- CORRECTION.md : Note formateur sur le port

### 2. Logique métier de filtrage par `ville_origine`

**Statut :** À clarifier

**Détail :** L'exercice mentionne que l'attribut `ville_origine` permet le filtrage des artefacts, mais la logique exacte n'est pas implémentée (pas d'API réelle). Trois approches possibles :

**Approche A — Strict :**
```
Si ville_origine != {id} de l'URL → HTTP 403 Forbidden
```

**Approche B — Filtrage automatique :**
```
Ignorer {id} de l'URL, toujours filtrer par ville_origine du jeton
```

**Approche C — Gouverneur omniscient :**
```
Si rôle "gouverneur" → accès à toutes les villes
Sinon → filtrer par ville_origine
```

**Recommandation :** Approche A pour cet exercice (plus simple à expliquer). Documenter dans la CORRECTION.md la logique choisie.

### 3. Nom du scope dédié dans Keycloak 26.1

**Statut :** À confirmer

**Détail :** Le nom exact du scope dédié peut varier selon la version de Keycloak. Dans les versions récentes, il est généralement nommé `{client-id}-dedicated`, mais cela peut changer.

**Impact :** Étape 8 du README.md mentionne de chercher le scope dédié. Ajouter une note alternative si le nom diffère dans Keycloak 26.1.

**Vérification :** Tester sur une instance Keycloak 26.1 réelle et documenter le comportement exact.

### 4. Exercice 5 et au-delà

**Question :** Comment articuler l'exercice 4 (configuration) avec l'exercice 5 (flux OIDC avec Postman) ?

**Suggestion :**
- **Exercice 4** : Configuration Keycloak + Evaluate (focus sur les jetons)
- **Exercice 5** : Flux OIDC complets avec Postman (Authorization Code, Client Credentials, Refresh Token, Introspection)
- **Exercice 6** : Comptes de service et M2M (Client Credentials en pratique)
- **Exercice 7+** : Retour prévu dans le fil conducteur (groupes, scopes avancés, etc.)

**Note :** Le fil conducteur actuel mentionne l'exercice 5 comme "Explorer les voies de commerce". Vérifier la cohérence avec cette progression.

---

## Cohérence avec le fil conducteur

### Modifications apportées au fil conducteur

Le fichier `.memory/02-fil-exercices.md` a été mis à jour pour refléter l'approche retenue :

**Avant (version initiale) :**
- Lancer l'application front-end
- Tester la connexion réelle
- Appeler les endpoints de l'API
- Observer les erreurs HTTP 403

**Après (version mise à jour) :**
- Configuration des clients et mappers dans Keycloak
- Utilisation de l'outil Evaluate pour prévisualiser les jetons
- Simulation du contrôle d'accès (analyse des jetons)
- Pas de lancement d'application réelle

**Cohérence maintenue :**
- Le contexte narratif reste identique (Comptoir et Réserve)
- Les objectifs pédagogiques sont alignés
- Les concepts OIDC/OAuth2 restent les mêmes
- La métaphore de l'Empire d'Authéria est préservée

---

## Lexique des métaphores

| Concept Keycloak | Métaphore Authéria | Première apparition |
| --- | --- | --- |
| Client public (SPA) | Comptoir des voyageurs | Exercice 4 |
| Client bearer-only (API) | Réserve | Exercice 4 |
| Authorization Code Flow + PKCE | Procédure d'obtention d'un laissez-passer sécurisé | Exercice 4 |
| Jeton JWT (Access Token) | Laissez-passer numérique | Exercice 3 (réutilisé ici) |
| Audience (`aud`) | Destination du laissez-passer | Exercice 4 |
| Mapper | Cachet officiel | Exercice 4 |
| Attribut utilisateur | Caractéristique du sujet | Exercice 4 |
| Outil Evaluate | Atelier de prévisualisation des laissez-passer | Exercice 4 |

---

## Variantes pédagogiques possibles

### Variante A — Simplifiée (30 min)

**Public :** Débutants complets en IAM

**Suppressions :**
- Étape 1 (attribut `ville_origine`) → se concentrer uniquement sur les rôles
- Étape 8 (audience manuelle) → utiliser uniquement `audience resolve`
- Étapes 10-11 (simulations avancées)

**Conservé :**
- Création des clients (Comptoir + Réserve)
- Activation de PKCE
- Vérification des rôles dans Evaluate

**Objectifs réduits :**
- Créer un client public et un client bearer-only
- Comprendre que les jetons contiennent les rôles
- Visualiser un jeton avec Evaluate

### Variante B — Approfondie avec application réelle (75 min)

**Public :** Développeurs expérimentés

**Ajouts :**
- Lancement de l'app front-end (`src/front`)
- Connexion réelle via le navigateur
- Récupération du jeton depuis le sessionStorage
- Appel manuel de l'API avec Postman en injectant le jeton dans l'en-tête `Authorization: Bearer {token}`
- Test de validation de signature JWT avec une librairie (Node.js : jsonwebtoken, Python : PyJWT)

**Concepts supplémentaires :**
- Endpoint `.well-known/openid-configuration`
- Endpoint JWKS (`/protocol/openid-connect/certs`)
- Validation locale vs introspection distante
- Gestion du refresh token

### Variante C — Focus sécurité (60 min)

**Public :** Responsables sécurité, architectes

**Axes renforcés :**
- Attaques possibles sans PKCE (interception de code)
- Attaques par rejeu de jetons (importance de l'audience)
- Rotation des clés cryptographiques
- Politiques de clients (client policies)
- Détection de force brute sur le flux Authorization Code

**Exercices pratiques :**
- Désactiver PKCE et observer les risques (discussion théorique)
- Tester un jeton avec une audience incorrecte → rejet par l'API (simulation)
- Observer les événements de sécurité dans Keycloak après plusieurs tentatives

---

## Checklist formateur — Préparation de l'exercice

### Avant la session

- [ ] Vérifier que Keycloak 26.1 est bien dans le docker-compose.yml
- [ ] Tester l'environnement Docker sur la machine formateur
- [ ] Vérifier que Mailhog fonctionne (exercice 2 l'utilise)
- [ ] Préparer les slides de synthèse (flux Authorization Code, architecture des jetons)
- [ ] Imprimer la checklist de validation rapide (CORRECTION.md)

### Pendant la session

- [ ] Faire un tour de table des attentes (certains participants peuvent vouloir voir du code → mentionner la variante B)
- [ ] Dessiner le flux Authorization Code au tableau avant de commencer
- [ ] Expliquer la différence entre access token et ID token (slide ou tableau)
- [ ] Montrer un vrai jeton JWT sur jwt.io (exemple live)
- [ ] Prévoir 5-10 min de pause après l'étape 7 (configuration des mappers — étape dense)
- [ ] Vérifier régulièrement que tous les participants ont les checkpoints OK

### Après la session

- [ ] Demander un retour sur la difficulté (trop simple ? trop complexe ?)
- [ ] Noter les erreurs fréquentes rencontrées (pour améliorer le README.md)
- [ ] Vérifier si certains participants souhaitent la variante B (app réelle) pour le prochain jour

---

## Métriques de réussite de l'exercice

### Critères objectifs

- ✅ Les 3 utilisateurs ont l'attribut `ville_origine` correctement configuré
- ✅ Le client `comptoir-des-voyageurs` est créé avec PKCE S256 activé
- ✅ Le client `reserve-valdoria` est en mode bearer-only (tous flux désactivés)
- ✅ L'outil Evaluate affiche les jetons avec :
  - `aud` contenant `reserve-valdoria`
  - `realm_access.roles` contenant les rôles corrects pour chaque utilisateur
  - `ville_origine` présent avec la bonne valeur

### Critères subjectifs (compréhension)

Le participant est capable d'expliquer :
- ✅ Pourquoi PKCE est nécessaire pour un client public
- ✅ La différence entre un client public et un client bearer-only
- ✅ Le rôle de l'audience (`aud`) dans la sécurité des jetons
- ✅ Comment un mapper injecte des informations dans le jeton
- ✅ Pourquoi Brunhild (maitre-forgeron) ne peut pas accéder à `/inventaire`

---

## Références et ressources

### Documentation Keycloak

- [Keycloak 26 Documentation](https://www.keycloak.org/docs/26.0/)
- [Client Configuration](https://www.keycloak.org/docs/26.0/server_admin/#_clients)
- [Client Scopes](https://www.keycloak.org/docs/26.0/server_admin/#_client_scopes)
- [Protocol Mappers](https://www.keycloak.org/docs/26.0/server_admin/#_protocol-mappers)

### Standards OIDC/OAuth2

- [RFC 6749 — OAuth 2.0 Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7636 — PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11)

### Outils utiles

- [jwt.io](https://jwt.io) — Décodeur JWT en ligne
- [OAuth 2.0 Playground](https://www.oauth.com/playground/) — Tester les flux OAuth
- [Keycloak Admin CLI](https://www.keycloak.org/docs/26.0/server_admin/#_admin_cli) — Automatiser la configuration

---

## Historique des versions

### Version 1.0 — 2025-02-17

**Changements initiaux :**
- Création de l'exercice 4 basé sur le fil conducteur
- Choix de l'approche centrée sur la configuration Keycloak + Evaluate
- Création de la correction détaillée pour le formateur
- Mise à jour du fil conducteur pour refléter l'approche retenue

**Contributeurs :**
- Claude Code (rédaction)
- User (validation des choix pédagogiques)

---

## Notes pour les prochaines versions

### Améliorations possibles

1. **Ajouter des screenshots** pour l'étape 8 (création du mapper d'audience dans le scope dédié)
2. **Créer une vidéo de démonstration** (5 min) montrant le flux complet dans Evaluate
3. **Ajouter un quiz** de fin d'exercice (5 questions sur les concepts clés)
4. **Préparer un export JSON** de la configuration complète (realm + clients + scopes) pour dépannage rapide

### Retours utilisateurs attendus

- Clarté des instructions sur le scope dédié (étape 8)
- Difficulté perçue de la configuration des mappers (trop de champs ?)
- Pertinence de l'outil Evaluate vs une vraie application (préférence ?)
- Timing réel vs timing estimé (45 min suffisant ?)
