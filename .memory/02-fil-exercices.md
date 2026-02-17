# Fil rouge des exercices — L'Empire d'Authéria

## Présentation du scénario

Les stagiaires incarnent les **Architectes de la Sécurité** de l'Empire d'Authéria.
Leur mission : bâtir, étape par étape, le système de gestion des identités et des accès (IAM) qui protégera l'ensemble de l'empire, en commençant par sa province principale : **Valdoria**.

Chaque exercice correspond à une étape de construction de cet IAM impérial, depuis la fondation de la capitale jusqu'à la fortification des murailles.

### Lexique de l'Empire

| Concept Keycloak        | Métaphore Authéria                        |
| ----------------------- | ----------------------------------------- |
| Realm                   | Province de l'empire                      |
| Realm `master`          | Le Château de l'empereur (super-admin)    |
| Client applicatif (front) | Comptoir des voyageurs (application accessible aux sujets) |
| Client applicatif (API)   | Réserve (API protégée, ressources du royaume) |
| Rôle (Realm role)       | Titre impérial (voyageur, marchand, gouverneur) |
| Groupe                  | Guilde (ex : guilde des marchands)        |
| Utilisateur             | Sujet de l'empire                         |
| Attribut utilisateur    | Trait du sujet (ex : ville d'origine)     |
| Client Scope / Mapper   | Parchemin officiel                        |
| Service Account (M2M)   | Automate impérial                         |
| Annuaire LDAP           | Province alliée                           |
| IDP externe (SSO)       | Ambassade étrangère                       |
| Politique de sécurité   | Fortification                             |

### Environnement technique

Un `docker-compose.yml` pré-configuré fournit :

- **Keycloak 26.1** + PostgreSQL
- **Mailhog** (serveur SMTP de test)
- **OpenLDAP** (utilisé au Jour 2)
- Une **mini-application front** (le Comptoir des voyageurs)
- Une **API back-end** protégée (la Réserve)

> Les stagiaires lancent l'environnement une seule fois en début de formation.

---

## Jour 1 — Construction de l'Empire

*Modules 1 et 2 du plan de formation.*

---

### Exercice 1 — Fonder la capitale

**Module 1 — Fondations et environnement**

**Contexte narratif**
Avant de gouverner, il faut bâtir la capitale. Les architectes déploient le château central et découvrent le Château de l'empereur, siège du pouvoir absolu.

**Objectifs pédagogiques**

- Installer et lancer Keycloak 26.1 via Docker
- Naviguer dans la console d'administration
- Comprendre le rôle du realm `master` (le Château de l'empereur)

**Étapes**

1. Lancer l'environnement Docker (`docker compose up`)
2. Accéder à la console d'administration de Keycloak
3. Explorer le realm `master` : utilisateurs, paramètres, sessions
4. Créer puis supprimer un realm de test pour observer l'isolation entre provinces

**Point clé** — Le realm `master` est réservé à l'administration globale ; les applications ne doivent jamais y être rattachées.

---

### Exercice 2 — Fonder la Province de Valdoria

**Module 1 — Fondations et environnement**

**Contexte narratif**
Le Château de l'empereur accorde une charte pour fonder la Province de Valdoria, joyau de l'Empire d'Authéria. Les architectes créent cette nouvelle province et établissent ses titres impériaux : les rôles qui structureront toute la société valdorienne et détermineront l'accès aux ressources du royaume.

**Objectifs pédagogiques**

- Créer et configurer un realm dédié pour une organisation
- Comprendre l'isolation complète entre realms (utilisateurs, rôles, clients)
- Créer les rôles de royaume (Realm roles) qui serviront de fondation à l'autorisation
- Créer un rôle composite pour illustrer l'héritage de droits
- Configurer les paramètres de session et de tokens
- Paramétrer les notifications par email

**Étapes**

1. Créer le realm `valdoria` depuis la console d'administration
2. Vérifier l'isolation : observer que les utilisateurs et rôles du realm `master` n'existent pas dans `valdoria`
3. Créer deux rôles de royaume simples :
   - `sujet` (citoyen ordinaire de Valdoria — accès minimal aux services du royaume)
   - `marchand` (commerçant de l'empire — accès aux places de marché et registres commerciaux)
4. Créer un rôle composite :
   - `gouverneur` (administrateur suprême de la province — hérite de `sujet` + `marchand`)
5. Configurer les paramètres de session : durées de vie des sessions SSO et des tokens
6. Paramétrer le serveur SMTP vers Mailhog pour les emails de vérification (préparation pour la gestion des utilisateurs)
7. Explorer les paramètres de tokens : observer les options d'Access Token et Refresh Token

**Rôles créés :**

*Rôles de base (simples) :*
- `sujet` : Citoyen ordinaire de Valdoria
- `marchand` : Commerçant de l'empire

*Rôles composites (hiérarchiques) :*
- `gouverneur` : Hérite de `sujet` + `marchand` → Administrateur suprême de la province

**Pédagogie du modèle simplifié :**
Cette structure volontairement épurée (3 rôles au total) facilite la compréhension des concepts fondamentaux :
- L'isolation des rôles entre realms
- L'héritage via les rôles composites
- La hiérarchie administrative

Les modèles de rôles plus complexes (avec rôles métier spécialisés) seront abordés dans les exercices avancés du Module 3.

**Point clé** — Chaque realm est un espace totalement isolé : utilisateurs, clients, rôles et configuration sont indépendants. Le rôle composite `gouverneur` hérite automatiquement des droits de `sujet` et `marchand` : c'est le mécanisme clé pour gérer les hiérarchies de droits sans attributions manuelles répétitives.

---

### Exercice 3 — Peupler Valdoria et attribuer les titres impériaux

**Module 1 — Fondations et environnement**

**Contexte narratif**
La province de Valdoria possède désormais ses titres impériaux. Il est temps d'accueillir les premiers sujets et de leur attribuer leurs rôles. Les architectes créent les premiers habitants et observent comment leurs droits sont matérialisés dans leurs laissez-passer numériques (jetons JWT). Ils ajoutent également un trait personnel — la ville d'origine — pour illustrer la différence entre un rôle (ce qu'on est autorisé à faire) et un attribut (ce qui nous décrit).

**Objectifs pédagogiques**

- Créer des utilisateurs dans le realm
- Attribuer des rôles de royaume aux utilisateurs
- Ajouter un attribut personnalisé (`ville_origine`) à chaque utilisateur
- Observer les rôles dans un jeton JWT (Access Token)
- Comprendre la distinction entre rôle et attribut : le rôle contrôle l'**accès**, l'attribut enrichit le **contexte**

**Étapes**

1. Créer trois utilisateurs de test dans le realm `valdoria` :
   - `alaric` le gouverneur (ville d'origine : Valdoria-Centre) → rôle composite
   - `brunhild` la marchande (ville d'origine : Nordheim) → rôle simple
   - `cedric` le sujet (ville d'origine : Sudbourg) → rôle de base
2. Attribuer à chaque utilisateur son rôle correspondant (`gouverneur`, `marchand`, `sujet`)
3. Ajouter l'attribut `ville_origine` à chaque utilisateur (onglet « Attributes »)
4. Vérifier les profils utilisateurs et l'héritage des rôles pour alaric
5. Utiliser l'outil Evaluate pour prévisualiser le jeton JWT
6. Se connecter avec l'utilisateur `alaric` via la Account Console
7. Comprendre la différence entre rôles de royaume et rôles de client dans les jetons

**Point clé** — Le **rôle** détermine si un sujet peut accéder à une ressource (ex : seul un `marchand` peut consulter l'inventaire). L'**attribut** (`ville_origine`) enrichit le jeton avec des informations contextuelles que l'API pourra utiliser pour filtrer les données (ex : ne montrer que les artefacts de la ville du sujet).

---

### Exercice 4 — Ouvrir le Comptoir des voyageurs et sa Réserve

**Module 2 — Gestion des clients**

**Contexte narratif**
La province a besoin d'un point de service pour accueillir ses sujets et protéger ses ressources. Les architectes ouvrent le **Comptoir des voyageurs** (l'application front-end où les sujets se présentent) et sécurisent la **Réserve** (l'API qui détient les ressources du royaume). Le Comptoir demande des laissez-passer (jetons) **au nom de la Réserve** — c'est le concept d'audience.

**Objectifs pédagogiques**

- Créer et configurer deux clients : un client public (front) et un client API (resource server)
- Comprendre le flux Authorization Code (OIDC)
- Comprendre le concept d'audience (`aud`) : le jeton émis par le Comptoir est destiné à la Réserve
- Connecter l'application front-end à Keycloak et tester l'accès à l'API

**Étapes**

1. Créer le client `comptoir-des-voyageurs` dans le realm `valdoria` (type : public, redirect URI vers l'application locale)
2. Créer le client `reserve-valdoria` (type : bearer-only ou confidential — il ne sert qu'à valider les jetons)
3. Lancer la mini-application front-end (le Comptoir)
4. Tester la connexion : l'utilisateur est redirigé vers Keycloak, puis revient authentifié
5. Observer le jeton : le champ `aud` (audience) pointe vers `reserve-valdoria` — c'est pour cette API que le jeton est valide
6. Tester les endpoints de la Réserve :
   - `GET /infos` → accessible par tous les utilisateurs authentifiés (Alaric, Brunhild, Cedric)
   - `GET /inventaire` → accessible uniquement par un `marchand` (Brunhild ✓, Cedric ✗)
   - `GET /villes/{id}/artefacts` → accessible par un `marchand`, résultats filtrés par l'attribut `ville_origine`
7. Se connecter avec Cedric (`voyageur`) et constater le refus sur `/inventaire` (HTTP 403)

**Point clé** — Le flux Authorization Code est le flux recommandé pour les applications web. L'**audience** (`aud`) indique à quelle API le jeton est destiné : le Comptoir (front) obtient un jeton pour la Réserve (API). L'API vérifie à la fois le rôle (`marchand`) pour l'accès et l'attribut (`ville_origine`) pour le filtrage des données.

---

### Exercice 5 — Explorer les voies de commerce

**Module 2 — Gestion des clients**

**Contexte narratif**
La province possède plusieurs voies de commerce, chacune adaptée à un type de sujet. Les architectes testent les différentes voies d'accès pour en comprendre les usages et les limites : comment un sujet obtient-il son laissez-passer ? Comment la Réserve vérifie-t-elle sa validité ?

**Objectifs pédagogiques**

- Distinguer les principaux flux OIDC (Authorization Code, Client Credentials)
- Comprendre le rôle des secrets client
- Manipuler les jetons dans Postman
- Observer l'audience (`aud`) et les rôles dans les différents jetons

**Étapes**

1. Depuis Postman, exécuter un flux **Authorization Code** via le client `comptoir-des-voyageurs` : observer la redirection, le code, puis l'échange contre un jeton
2. Examiner le contenu du jeton d'accès (access token) et du jeton d'identité (ID token) — vérifier que l'audience pointe vers `reserve-valdoria`
3. Tester le **refresh token** : rafraîchir le jeton d'accès sans se reconnecter
4. Appeler le **endpoint d'introspection** pour valider un jeton côté serveur
5. Comparer les claims présentes selon le flux utilisé

**Point clé** — Le choix du flux OIDC dépend du contexte : application web interactive, application mobile, ou service automatisé. Le flux Authorization Code avec PKCE est aujourd'hui le standard recommandé.

---

### Exercice 6 — Déployer l'automate impérial

**Module 2 — Gestion des clients**

**Contexte narratif**
Certaines missions ne nécessitent aucun humain. L'automate impérial exécute des tâches de manière autonome, sans l'intervention d'un sujet. Il doit pouvoir consulter l'inventaire de la Réserve pour réapprovisionner automatiquement les stocks.

**Objectifs pédagogiques**

- Créer un client confidentiel avec un compte de service
- Comprendre l'accès machine-to-machine (M2M) via Client Credentials
- Attribuer des rôles à un compte de service

**Étapes**

1. Créer le client `automate-imperial` (type : confidential, service account activé)
2. Attribuer le rôle `marchand` au compte de service (pour accéder à l'inventaire de la Réserve)
3. Depuis Postman, obtenir un jeton via le flux **Client Credentials**
4. Vérifier que le rôle `marchand` est bien présent dans le jeton
5. Appeler `GET /inventaire` sur la Réserve avec ce jeton et constater l'accès autorisé

**Point clé** — Le flux Client Credentials ne fait intervenir aucun utilisateur. Le client s'authentifie directement avec son secret et reçoit un jeton portant ses propres rôles.

---

## Jour 2 — Population et Diplomatie

*Modules 3 et 4 du plan de formation.*

---

### Exercice 7 — Organiser les guildes

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
La province grandit. Pour gérer efficacement des centaines de sujets, les architectes créent des guildes et organisent la population en une structure hiérarchique. Plutôt que d'attribuer les titres impériaux un par un, ils les associent directement aux guildes.

**Objectifs pédagogiques**

- Créer et organiser des groupes (hiérarchiques)
- Assigner des rôles à des groupes plutôt qu'à des utilisateurs individuels
- Comprendre l'héritage de rôles via les groupes
- Gérer les sessions utilisateur

**Étapes**

1. Créer les groupes : `guilde-marchands`, `guilde-voyageurs`, `conseil-de-valdoria` (sous-groupe de `guilde-marchands`)
2. Attribuer le rôle `marchand` au groupe `guilde-marchands` et `voyageur` au groupe `guilde-voyageurs`
3. Importer une dizaine d'utilisateurs (import JSON ou création manuelle)
4. Affecter les utilisateurs aux groupes
5. Se connecter avec un utilisateur d'une guilde et vérifier qu'il hérite du rôle du groupe
6. Observer les sessions actives dans la console d'administration

**Point clé** — Les groupes permettent de gérer les droits à grande échelle. Un rôle attribué à un groupe est automatiquement hérité par tous ses membres et sous-groupes.

---

### Exercice 8 — Rédiger les parchemins officiels

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
Les parchemins officiels déterminent quelles informations figurent sur le laissez-passer de chaque sujet. Les architectes apprennent à enrichir ces documents pour que la Réserve puisse exploiter l'attribut `ville_origine` : sur l'endpoint `GET /villes/{id}/artefacts`, l'API doit connaître la ville du sujet pour filtrer les résultats.

**Objectifs pédagogiques**

- Comprendre le rôle des Client Scopes et des Mappers
- Configurer un mapper pour injecter l'attribut `ville_origine` dans le jeton
- Observer comment la Réserve utilise cet attribut pour filtrer les données

**Étapes**

1. Vérifier que l'attribut `ville_origine` est bien défini sur les utilisateurs (exercice 3)
2. Créer un Client Scope `profil-valdorien`
3. Ajouter un mapper de type « User Attribute » pour projeter `ville_origine` dans le jeton
4. Associer le scope `profil-valdorien` au client `comptoir-des-voyageurs`
5. Se connecter et comparer le jeton **avant** et **après** l'ajout du scope : l'attribut `ville_origine` apparaît dans les claims
6. Tester `GET /villes/nordheim/artefacts` avec Brunhild (`ville_origine: Nordheim`) → résultats filtrés
7. Tester le même endpoint avec Cedric (`ville_origine: Sudbourg`) → résultats différents, car la Réserve utilise l'attribut du jeton pour filtrer

**Point clé** — Les Client Scopes et les Mappers contrôlent finement le contenu des jetons. Le rôle `marchand` ouvre la porte (autorisation), tandis que l'attribut `ville_origine` indique à la Réserve quelles données montrer (filtrage contextuel). C'est la complémentarité entre RBAC (rôles) et ABAC (attributs).

---

### Exercice 9 — Se faire passer pour un sujet

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
Le service de renseignement impérial a besoin de voir la province à travers les yeux d'un sujet ordinaire, sans connaître son mot de passe. C'est la fonction d'impersonation. Un voyageur se plaint de ne pas voir l'inventaire de la Réserve — l'administrateur doit diagnostiquer le problème.

**Objectifs pédagogiques**

- Utiliser la fonction Impersonate pour le support utilisateur
- Observer l'impact sur les sessions
- Débuguer un problème de droits

**Étapes**

1. Créer un utilisateur `support-imperial` avec les droits d'impersonation
2. Depuis la console d'administration, impersonner l'utilisateur `cedric` (voyageur)
3. Observer la session créée : vérifier qu'elle est distincte de la session admin
4. Tenter d'accéder à `GET /inventaire` via le Comptoir : constater le refus (Cedric n'a pas le rôle `marchand`) et diagnostiquer via le jeton

**Point clé** — L'impersonation est un outil puissant de support. Elle crée une session réelle au nom de l'utilisateur cible, permettant de reproduire exactement son expérience.

---

### Exercice 10 — Forger une alliance avec une Province voisine

**Module 4 — Intégrations externes et durcissement**

**Contexte narratif**
La province voisine dispose de son propre registre de population. Plutôt que de recréer tous ces comptes, Valdoria établit une alliance : les sujets de la province voisine sont reconnus automatiquement.

**Objectifs pédagogiques**

- Connecter Keycloak à un annuaire LDAP externe
- Configurer le mapping des attributs LDAP
- Comprendre la synchronisation et le mode lecture seule

**Étapes**

1. Vérifier que le conteneur OpenLDAP est actif dans l'environnement Docker
2. Configurer une fédération d'utilisateurs LDAP dans le realm `valdoria`
3. Mapper les attributs : `uid` → `username`, `mail` → `email`
4. Lancer une synchronisation complète
5. Vérifier qu'un utilisateur LDAP apparaît dans Keycloak
6. Tenter de modifier cet utilisateur dans Keycloak et constater le mode lecture seule

**Point clé** — La fédération LDAP permet d'intégrer un annuaire existant sans migration. Keycloak interroge l'annuaire en temps réel ou par synchronisation périodique.

---

### Exercice 11 — Signer un traité diplomatique

**Module 4 — Intégrations externes et durcissement**

**Contexte narratif**
Valdoria ouvre une ambassade avec un empire lointain. Grâce au traité diplomatique (SSO), les sujets de cet empire peuvent entrer dans Valdoria avec leur propre identité.

**Objectifs pédagogiques**

- Configurer un Identity Provider (IDP) externe
- Comprendre le fonctionnement du SSO fédéré
- Tester l'authentification déléguée

**Étapes**

1. Configurer Google comme IDP externe dans le realm `valdoria` (ou, en alternative, configurer un second realm Keycloak comme IDP)
2. Activer le bouton « Se connecter avec Google » sur la page de login
3. Tester la connexion : un utilisateur s'authentifie via Google et obtient un compte dans Valdoria
4. Observer le profil créé automatiquement (first login flow)
5. Vérifier les attributs mappés depuis l'IDP externe

**Point clé** — L'intégration d'un IDP externe permet le SSO inter-organisations. Keycloak agit comme un broker d'identité : il délègue l'authentification tout en gardant le contrôle des autorisations.

---

### Exercice 12 — Fortifier les murailles

**Module 4 — Intégrations externes et durcissement**

**Contexte narratif**
L'empire est fonctionnel, mais vulnérable. Les architectes renforcent les défenses : mots de passe robustes, authentification multi-facteurs et détection des intrusions.

**Objectifs pédagogiques**

- Configurer une politique de mots de passe stricte
- Activer l'authentification multi-facteurs (MFA/OTP)
- Mettre en place la détection de force brute

**Étapes**

1. Configurer une politique de mots de passe : longueur minimale, complexité, historique
2. Tester la création d'un utilisateur avec un mot de passe trop faible et observer le rejet
3. Activer l'OTP (TOTP) comme second facteur d'authentification
4. Configurer l'OTP avec une application d'authentification (Google Authenticator, FreeOTP)
5. Tester la connexion complète : mot de passe + code OTP
6. Activer la détection de force brute et tester le verrouillage après plusieurs tentatives échouées

**Point clé** — Le durcissement est une étape indispensable avant la mise en production. Keycloak offre nativement des mécanismes de MFA, de politique de mots de passe et de protection contre les attaques par force brute.

---

## Synthèse du parcours

| Jour | Module | Exercices | Thème narratif |
| ---- | ------ | --------- | -------------- |
| J1 matin | Module 1 — Fondations | Ex. 1 à 3 | Fonder l'empire, attribuer les titres impériaux |
| J1 après-midi | Module 2 — Clients | Ex. 4 à 6 | Ouvrir le Comptoir et la Réserve, sécuriser les accès |
| J2 matin | Module 3 — Identités | Ex. 7 à 9 | Organiser les guildes, enrichir les laissez-passer |
| J2 après-midi | Module 4 — Intégrations | Ex. 10 à 12 | Alliances, diplomatie et fortification |

---

## Idées de gamification

- **Cartes de titre** : distribuer des cartes physiques (voyageur, marchand, gouverneur) à chaque stagiaire pour matérialiser les attributions de rôles.
- **Incident impérial** : injecter un problème de configuration à résoudre en équipe.
  > *« Un voyageur accède à l'inventaire de la Réserve. Trouvez la faille et corrigez-la. »*
- **Défi chronométré** : lancer un mini-challenge en fin de module.
  > *« Faites en sorte que Cedric puisse consulter les artefacts de Nordheim en moins de 10 minutes. »*
- **Parchemin récapitulatif** : chaque stagiaire maintient un journal de bord avec les commandes et configurations clés réalisées.
