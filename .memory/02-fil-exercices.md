# Fil rouge des exercices — L'Empire d'Authéria

## Présentation du scénario

Les stagiaires incarnent les **Architectes de la Sécurité** de l'Empire d'Authéria.
Leur mission : bâtir, étape par étape, le système de gestion des identités et des accès (IAM) qui protégera l'ensemble de l'empire, en commençant par sa province principale : **Valdoria**.

Chaque exercice correspond à une étape de construction de cet IAM impérial, depuis la fondation de la capitale jusqu'à la fortification des murailles.

### Lexique de l'Empire

| Concept Keycloak        | Métaphore Authéria                        |
| ----------------------- | ----------------------------------------- |
| Realm                   | Province de l'empire                      |
| Realm `master`          | la (province) capitale de l'empire et son château (super-admin)    |
| Client applicatif (front) | Comptoir des voyageurs (application accessible aux sujets) |
| Client applicatif (API)   | Réserve (API protégée, ressources du royaume) |
| Rôle (Realm role)       | Titre impérial (sujet, marchand, gouverneur) |
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
Les stagiaires incarnent un membre de la **Garde Impériale** (`super-administrateur`). Avant d'instaurer l'ordre impérial, il faut bâtir la capitale (1ère province de l'empire) et le **Château de l'empereur** (realm `master`), siège du pouvoir absolu. La capitale est le centre nerveux de l'administration : aucun comptoir (`client` app) ne doit jamais y être rattaché directement — elle est réservée aux membres de la Garde impériale qui administrent l'empire et ses provinces (autres `realms`).

**Objectifs pédagogiques**

- Installer et lancer Keycloak 26.1 via Docker
- Naviguer dans la console d'administration
- Comprendre le rôle du realm `master` (le Château de l'empereur)
- Observer l'isolation entre realms (provinces)

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
- Créer des rôles de royaume (Realm roles) simples et composites
- Configurer un rôle par défaut attribué automatiquement à tout nouvel utilisateur
- Comprendre l'héritage de droits via les rôles composites
- Configurer les paramètres de session et de tokens
- Paramétrer les notifications par email (SMTP)

**Étapes**

1. Créer le realm `valdoria` depuis la console d'administration
2. Constater l'isolation : utilisateurs (vide), clients système uniquement, rôles par défaut (3)
3. Créer deux rôles de royaume simples : `sujet`, `marchand` — puis configurer `sujet` comme rôle par défaut (via `default-roles-valdoria`)
4. Créer le rôle composite `gouverneur` (hérite de `sujet` + `marchand`)
5. Vérifier la hiérarchie des rôles (schéma default-roles-valdoria / gouverneur)
6. Configurer les paramètres de session (SSO idle 15 min, max 2 h) et observer les tokens (valeurs par défaut)
7. Configurer le serveur SMTP vers Mailhog et tester l’envoi d’email

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

**Point clé** — Chaque realm est un espace totalement isolé : utilisateurs, clients, rôles et configuration sont indépendants. Le rôle `sujet` est configuré comme rôle par défaut (attribué automatiquement à tout nouvel utilisateur). Le rôle composite `gouverneur` hérite automatiquement des droits de `sujet` et `marchand` : c'est le mécanisme clé pour gérer les hiérarchies de droits sans attributions manuelles répétitives.

---

### Exercice 3 — Peupler Valdoria et attribuer les titres impériaux

**Module 1 — Fondations et environnement**

**Contexte narratif**
La province de Valdoria possède désormais ses titres impériaux. Il est temps d'accueillir les premiers sujets et de leur attribuer leurs rôles. Les architectes créent les premiers habitants et leur ajoutent un trait personnel — la ville d'origine — pour illustrer la différence entre un rôle (ce qu'on est autorisé à faire) et un attribut (ce qui nous décrit).

**Objectifs pédagogiques**

- Créer des utilisateurs dans le realm
- Attribuer des rôles de royaume aux utilisateurs
- Ajouter un attribut personnalisé (`villeOrigine`) à chaque utilisateur
- Comprendre la distinction entre rôle et attribut : le rôle contrôle l'**accès**, l'attribut enrichit le **contexte**

**Étapes**

1. Créer trois utilisateurs de test dans le realm `valdoria` :
   - `alaric` le gouverneur (ville d'origine : Valdoria-Centre) → rôle composite
   - `brunhild` la marchande (ville d'origine : Nordheim) → rôle simple
   - `cedric` le sujet (ville d'origine : Sudbourg) → rôle de base
2. Attribuer à chaque utilisateur son rôle correspondant (`gouverneur`, `marchand`, `sujet`)
3. Ajouter l'attribut `villeOrigine` via le User Profile du realm, puis renseigner la valeur pour chaque utilisateur
4. Vérifier les profils utilisateurs et l'héritage des rôles pour alaric
5. Se connecter avec l'utilisateur `alaric` via la Account Console

**Point clé** — Le **rôle** détermine si un sujet peut accéder à une ressource (ex : seul un `marchand` peut consulter l'inventaire). L'**attribut** (`villeOrigine`) enrichit le profil avec des informations contextuelles qui seront exploitées par les applications (ex : filtrer les données par ville d'origine).

---

### Exercice 4 — Ouvrir le Comptoir des voyageurs et sa Réserve

**Module 2 — Gestion des clients**

**Contexte narratif**
La province a besoin d'un point de service pour accueillir ses sujets et protéger ses ressources. Les architectes ouvrent le **Comptoir des voyageurs** (l'application front-end où les sujets se présentent) et sécurisent la **Réserve** (l'API qui détient les ressources du royaume). Le Comptoir demande des laissez-passer (jetons) **au nom de la Réserve** — c'est le concept d'audience.

Les architectes enrichissent d'abord les profils des sujets avec l'attribut **ville d'origine**, puis configurent les clients et les mappers pour injecter toutes les informations nécessaires dans les jetons. Ils utilisent l'**atelier de prévisualisation des laissez-passer** (outil Evaluate) pour vérifier que tout est correctement configuré avant même de connecter une vraie application.

**Objectifs pédagogiques**

- Créer et configurer un client **public** (SPA) avec PKCE pour le front-end
- Créer et configurer un client **confidentiel (Resource Server)** pour l'API
- Configurer des **mappers** pour injecter les rôles de royaume et attributs dans les jetons
- Configurer l'**audience** (`aud`) pour indiquer la destination des jetons
- Utiliser l'outil **Evaluate** pour prévisualiser et valider le contenu des jetons
- Simuler le contrôle d'accès de l'API en analysant les jetons

**Étapes**

1. Créer le client `comptoir-des-voyageurs` (type : public, Standard flow activé, PKCE S256)
2. Créer le client `reserve-valdoria` (type : client confidentiel RS — Service accounts roles activé)
3. Vérifier que le mapper des rôles de royaume existe déjà dans le scope `roles` (assigné par défaut)
4. Créer un Client Scope `attributs-valdorien` avec un mapper pour l'attribut `villeOrigine`
5. Assigner le scope `attributs-valdorien` au client Comptoir (type Default)
6. Configurer l'audience via `audience resolve` : créer un client role `access` sur `reserve-valdoria`, l'inclure dans le rôle composite `sujet`
7. Utiliser l'outil Evaluate pour prévisualiser les jetons et vérifier rôles, `villeOrigine` et `aud: reserve-valdoria`
8. Simuler le contrôle d'accès de la Réserve :
   - Alaric (gouverneur → inclut `marchand`) peut accéder à `/inventaire` ✅
   - Brunhild (`marchand`) peut accéder à `/inventaire` ✅
   - Cedric (`sujet`, sans `marchand`) ne peut **pas** accéder à `/inventaire` ❌
9. Observer comment l'attribut `villeOrigine` permet le filtrage contextuel des données

**Point clé** — Le flux Authorization Code avec PKCE (S256) est le standard pour les applications web modernes. Les **mappers** contrôlent finement le contenu des jetons : rôles de royaume (autorisation), attributs personnalisés (filtrage contextuel), audience (sécurité). L'**outil Evaluate** est indispensable pour vérifier la configuration avant de connecter une vraie application. L'**audience** (`aud`) est configurée via le mapper `audience resolve` combiné à un client role : tous les porteurs du rôle `sujet` obtiennent automatiquement `reserve-valdoria` dans leur `aud`.

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
Les parchemins officiels déterminent quelles informations figurent sur le laissez-passer de chaque sujet. Les architectes apprennent à enrichir ces documents pour que la Réserve puisse exploiter l'attribut `villeOrigine` : sur l'endpoint `GET /villes/{id}/artefacts`, l'API doit connaître la ville du sujet pour filtrer les résultats.

**Objectifs pédagogiques**

- Comprendre le rôle des Client Scopes et des Mappers
- Configurer un mapper pour injecter l'attribut `villeOrigine` dans le jeton
- Observer comment la Réserve utilise cet attribut pour filtrer les données

**Étapes**

1. Vérifier que l'attribut `villeOrigine` est bien défini sur les utilisateurs (exercice 3)
2. Créer un Client Scope `attributs-valdorien`
3. Ajouter un mapper de type « User Attribute » pour projeter `villeOrigine` dans le jeton
4. Associer le scope `attributs-valdorien` au client `comptoir-des-voyageurs`
5. Se connecter et comparer le jeton **avant** et **après** l'ajout du scope : l'attribut `villeOrigine` apparaît dans les claims
6. Tester `GET /villes/nordheim/artefacts` avec Brunhild (`villeOrigine: Nordheim`) → résultats filtrés
7. Tester le même endpoint avec Cedric (`villeOrigine: Sudbourg`) → résultats différents, car la Réserve utilise l'attribut du jeton pour filtrer

**Point clé** — Les Client Scopes et les Mappers contrôlent finement le contenu des jetons. Le rôle `marchand` ouvre la porte (autorisation), tandis que l'attribut `villeOrigine` indique à la Réserve quelles données montrer (filtrage contextuel). C'est la complémentarité entre RBAC (rôles) et ABAC (attributs).

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
