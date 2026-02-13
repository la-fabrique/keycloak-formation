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
| Client applicatif       | Échoppe (point de service métier)         |
| Rôle (Realm role)       | Profil métier (paysan, chambellan, forgeron) |
| Groupe                  | Guilde (ex : guilde des forgerons)        |
| Utilisateur             | Sujet de l'empire                         |
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
- Une **mini-application front** (échoppe principale de la province)
- Une **API back-end** protégée (salle du trésor)

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
Le Château de l'empereur accorde une charte pour fonder la Province de Valdoria, joyau de l'Empire d'Authéria. Les architectes créent cette nouvelle province et établissent ses institutions fondamentales : les profils métier qui structureront toute la société valdorienne.

**Objectifs pédagogiques**

- Créer et configurer un realm dédié pour une organisation
- Comprendre l'isolation complète entre realms (utilisateurs, rôles, clients)
- Créer les rôles de royaume (Realm roles) qui serviront de fondation à l'autorisation
- Configurer les paramètres de session et de tokens
- Paramétrer les notifications par email

**Étapes**

1. Créer le realm `valdoria` depuis la console d'administration
2. Vérifier l'isolation : observer que les utilisateurs et rôles du realm `master` n'existent pas dans `valdoria`
3. Créer trois rôles de royaume fondamentaux :
   - `chambellan` (administrateur de la province)
   - `forgeron` (artisan avec accès aux ressources de production)
   - `paysan` (citoyen avec accès de base)
4. Configurer les paramètres de session : durées de vie des sessions SSO et des tokens
5. Paramétrer le serveur SMTP vers Mailhog pour les emails de vérification (préparation pour la gestion des utilisateurs)
6. Explorer les paramètres de tokens : observer les options d'Access Token et Refresh Token

**Point clé** — Chaque realm est un espace totalement isolé : utilisateurs, clients, rôles et configuration sont indépendants. Les Realm roles créés ici constituent la base du système d'autorisation et seront utilisés dans tous les exercices suivants.

---

### Exercice 3 — Peupler Valdoria et attribuer les profils métier

**Module 1 — Fondations et environnement**

**Contexte narratif**
La province de Valdoria possède désormais ses institutions. Il est temps d'accueillir les premiers sujets et de leur attribuer leurs profils métier. Les architectes créent les premiers habitants et observent comment leurs droits sont matérialisés dans leurs laissez-passer numériques.

**Objectifs pédagogiques**

- Créer des utilisateurs dans le realm
- Attribuer des rôles de royaume aux utilisateurs
- Observer les rôles dans un jeton JWT (Access Token)
- Comprendre comment les applications exploiteront ces rôles

**Étapes**

1. Créer trois utilisateurs de test dans le realm `valdoria` :
   - `alaric` (chambellan)
   - `brunhild` (forgeron)
   - `cedric` (paysan)
2. Attribuer à chaque utilisateur son rôle correspondant
3. Se connecter avec l'utilisateur `alaric` via la Account Console
4. Récupérer le jeton JWT (depuis les outils développeur du navigateur ou via un client de test)
5. Décoder le jeton sur [jwt.io](https://jwt.io)
6. Identifier où apparaissent les rôles dans les claims du jeton (section `realm_access.roles`)
7. Comparer avec un jeton obtenu par `cedric` : observer les différences de rôles

**Point clé** — Les rôles de royaume sont le mécanisme central d'autorisation dans Keycloak. Ils sont transportés dans le jeton JWT et exploitables par les applications pour contrôler l'accès aux ressources.

---

### Exercice 4 — Ouvrir la première échoppe

**Module 2 — Gestion des clients**

**Contexte narratif**
La province a besoin d'un point de service pour accueillir ses sujets. Les architectes ouvrent la première échoppe : une application web sécurisée.

**Objectifs pédagogiques**

- Créer et configurer un client applicatif (public)
- Comprendre le flux Authorization Code (OIDC)
- Connecter une application front-end à Keycloak

**Étapes**

1. Créer le client `echoppe-principale` dans le realm `valdoria` (type : public, redirect URI vers l'application locale)
2. Lancer la mini-application front-end
3. Tester la connexion : l'utilisateur est redirigé vers Keycloak, puis revient authentifié
4. Afficher le nom et les rôles de l'utilisateur connecté
5. Vérifier que seul un utilisateur avec le rôle `chambellan` accède à la page d'administration

**Point clé** — Le flux Authorization Code est le flux recommandé pour les applications web. Le navigateur ne voit jamais le secret ; seul un code temporaire est échangé.

---

### Exercice 5 — Explorer les voies de commerce

**Module 2 — Gestion des clients**

**Contexte narratif**
La province possède plusieurs voies de commerce, chacune adaptée à un type de marchand. Les architectes testent les différentes voies d'accès pour en comprendre les usages et les limites.

**Objectifs pédagogiques**

- Distinguer les principaux flux OIDC (Authorization Code, Client Credentials)
- Comprendre le rôle des secrets client
- Manipuler les jetons dans Postman

**Étapes**

1. Depuis Postman, exécuter un flux **Authorization Code** : observer la redirection, le code, puis l'échange contre un jeton
2. Examiner le contenu du jeton d'accès (access token) et du jeton d'identité (ID token)
3. Tester le **refresh token** : rafraîchir le jeton d'accès sans se reconnecter
4. Appeler le **endpoint d'introspection** pour valider un jeton côté serveur
5. Comparer les claims présentes selon le flux utilisé

**Point clé** — Le choix du flux OIDC dépend du contexte : application web interactive, application mobile, ou service automatisé. Le flux Authorization Code avec PKCE est aujourd'hui le standard recommandé.

---

### Exercice 6 — Déployer l'automate impérial

**Module 2 — Gestion des clients**

**Contexte narratif**
Certaines missions ne nécessitent aucun humain. L'automate impérial exécute des tâches de manière autonome, sans l'intervention d'un sujet.

**Objectifs pédagogiques**

- Créer un client confidentiel avec un compte de service
- Comprendre l'accès machine-to-machine (M2M) via Client Credentials
- Attribuer des rôles à un compte de service

**Étapes**

1. Créer le client `automate-imperial` (type : confidential, service account activé)
2. Attribuer le rôle `forgeron` au compte de service
3. Depuis Postman, obtenir un jeton via le flux **Client Credentials**
4. Vérifier que le rôle `forgeron` est bien présent dans le jeton
5. Appeler l'API back-end protégée avec ce jeton et constater l'accès autorisé

**Point clé** — Le flux Client Credentials ne fait intervenir aucun utilisateur. Le client s'authentifie directement avec son secret et reçoit un jeton portant ses propres rôles.

---

## Jour 2 — Population et Diplomatie

*Modules 3 et 4 du plan de formation.*

---

### Exercice 7 — Organiser les guildes

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
La province grandit. Pour gérer efficacement des centaines de sujets, les architectes créent des guildes et organisent la population en une structure hiérarchique.

**Objectifs pédagogiques**

- Créer et organiser des groupes (hiérarchiques)
- Assigner des rôles à des groupes plutôt qu'à des utilisateurs individuels
- Comprendre l'héritage de rôles via les groupes
- Gérer les sessions utilisateur

**Étapes**

1. Créer les groupes : `guilde-forgerons`, `guilde-paysans`, `conseil-des-maitres` (sous-groupe de `guilde-forgerons`)
2. Attribuer le rôle `forgeron` au groupe `guilde-forgerons` et `paysan` au groupe `guilde-paysans`
3. Importer une dizaine d'utilisateurs (import JSON ou création manuelle)
4. Affecter les utilisateurs aux groupes
5. Se connecter avec un utilisateur d'une guilde et vérifier qu'il hérite du rôle du groupe
6. Observer les sessions actives dans la console d'administration

**Point clé** — Les groupes permettent de gérer les droits à grande échelle. Un rôle attribué à un groupe est automatiquement hérité par tous ses membres et sous-groupes.

---

### Exercice 8 — Rédiger les parchemins officiels

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
Les parchemins officiels déterminent quelles informations figurent sur le laissez-passer de chaque sujet. Les architectes apprennent à enrichir ces documents avec des données personnalisées.

**Objectifs pédagogiques**

- Comprendre le rôle des Client Scopes et des Mappers
- Ajouter un attribut personnalisé à un utilisateur
- Configurer un mapper pour injecter cet attribut dans le jeton

**Étapes**

1. Ajouter un attribut personnalisé `rang` (ex. : `capitaine`) à un utilisateur
2. Créer un Client Scope `profil-avance`
3. Ajouter un mapper de type « User Attribute » pour projeter `rang` dans le jeton
4. Associer le scope `profil-avance` au client `echoppe-principale`
5. Se connecter et comparer le jeton **avant** et **après** l'ajout du scope

**Point clé** — Les Client Scopes et les Mappers contrôlent finement le contenu des jetons. C'est le mécanisme qui permet d'adapter les informations transmises à chaque application.

---

### Exercice 9 — Se faire passer pour un sujet

**Module 3 — Identités, groupes et scopes**

**Contexte narratif**
Le service de renseignement impérial a besoin de voir la province à travers les yeux d'un sujet ordinaire, sans connaître son mot de passe. C'est la fonction d'impersonation.

**Objectifs pédagogiques**

- Utiliser la fonction Impersonate pour le support utilisateur
- Observer l'impact sur les sessions
- Débuguer un problème de droits

**Étapes**

1. Créer un utilisateur `support-imperial` avec les droits d'impersonation
2. Depuis la console d'administration, impersonner un utilisateur standard
3. Observer la session créée : vérifier qu'elle est distincte de la session admin
4. Provoquer volontairement une erreur de rôle (ex. : un `paysan` tente d'accéder à une ressource réservée au `chambellan`) et la diagnostiquer via le jeton

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
| J1 matin | Module 1 — Fondations | Ex. 1 à 3 | Fonder l'empire, organiser les métiers |
| J1 après-midi | Module 2 — Clients | Ex. 4 à 6 | Ouvrir les échoppes, sécuriser les accès |
| J2 matin | Module 3 — Identités | Ex. 7 à 9 | Organiser la population, enrichir les laissez-passer |
| J2 après-midi | Module 4 — Intégrations | Ex. 10 à 12 | Alliances, diplomatie et fortification |

---

## Idées de gamification

- **Cartes de rôle** : distribuer des cartes physiques (chambellan, forgeron, paysan) à chaque stagiaire pour matérialiser les attributions de profils métier.
- **Incident impérial** : injecter un problème de configuration à résoudre en équipe.
  > *« Un paysan accède à l'échoppe du chambellan. Trouvez la faille et corrigez-la. »*
- **Défi chronométré** : lancer un mini-challenge en fin de module.
  > *« Bloquez l'accès aux échoppes réservées aux paysans en moins de 10 minutes. »*
- **Parchemin récapitulatif** : chaque stagiaire maintient un journal de bord avec les commandes et configurations clés réalisées.
