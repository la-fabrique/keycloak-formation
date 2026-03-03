# Plan de la formation Keycloak

## Vue d'ensemble

Formation de 2 jours (14 h) couvrant l'architecture, la configuration et l'exploitation de Keycloak pour sécuriser des applications avec OAuth 2.0 et OpenID Connect.

---

## Module 1 — Fondations et environnement *(Jour 1 matin)*

**Objectifs** : Comprendre le rôle d'un IAM, installer Keycloak et maîtriser la notion de Realm.

- Introduction à Keycloak : IAM, Identity Provider (IDP)
- Version 26.1 et écosystème open-source
- Installation et lancement via Docker
- Realms : rôle de la province « Master » (le Château de l'empereur), segmentation par organisation
- Introduction aux protocoles OAuth 2.0 et OpenID Connect (OIDC)
- Configuration des rôles de royaume (Realm roles) simples et composites
- Gestion des utilisateurs et attributs personnalisés (User Profile)

---

## Module 2 — Gestion des clients *(Jour 1 après-midi et 2 matin)*

**Objectifs** : Créer et sécuriser des clients applicatifs, maîtriser les flux OIDC, enrichir les tokens et gérer l'accès machine-to-machine.

- Paramètres de base et types d'accès des clients (public, confidentiel, resource server)
- Création d'un client public (SPA) avec flux Authorization Code + PKCE
- Création d'un client confidentiel (Resource Server / API)
- Client Scopes et mappers : injection des rôles et attributs dans les tokens
- Concept d'audience (`aud`) et configuration via `audience resolve`
- Utilisation de l'outil Evaluate pour prévisualiser et valider les tokens
- Lecture et interprétation des tokens JWT (access token, ID token, refresh token)
- RBAC et ABAC : contrôle d'accès par rôles et par attributs dans une API
- Déconnexion et Single Logout (front-channel / back-channel)
- Délégation d'administration : fine-grained admin permissions
- Rôles de comptes de service et accès machine-to-machine (Client Credentials)

---

## Module 3 — Identités, groupes et scopes *(Jour 2 matin)*

**Objectifs** : Gérer les utilisateurs à grande échelle, organiser par groupes et maîtriser l'impersonation.

- Gestion des groupes et héritage de rôles
- Ajout d'utilisateurs à un groupe, vérification de l'héritage dans les tokens
- Fonction Impersonate pour le support utilisateur
- Diagnostic de problèmes de droits via l'impersonation

---

## Module 4 — Intégrations externes et durcissement *(Jour 2 après-midi)*

**Objectifs** : Fédérer des annuaires, interconnecter avec des IDP externes et renforcer la sécurité.

- Intégration d'annuaires : OpenLDAP (User Federation)
- Mapping d'attributs LDAP, Group Mapper et Role Mapper
- Intégration avec un IDP externe (broker OIDC) pour l'interopérabilité
- IDP Mappers : traduction des rôles étrangers en rôles locaux
- Renforcement : politiques de mots de passe, MFA (WebAuthn) et détection de force brute
- Questionnaire QCM de fin de formation

---

# Déroulé pédagogique

---

## Jour 1 : Architecture, Realms et Gestion des Clients

### Matinée — Fondations et Environnement (3h30)


| Horaire       | Activité                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| 09h00 – 09h15 | Accueil des stagiaires, tour de table des attentes et présentation des objectifs                     |
| 09h15 – 09h30 | Introduction à Keycloak : Pourquoi un IAM ? Notion d'Identity Provider (IDP)                         |
| 09h30 – 09h45 | Présentation de la version 26.1 et de l'écosystème open-source                                       |
| 09h45 – 10h15 | **Pratique** : Ex.1 — Installer et lancer Keycloak via Docker, explorer le realm `master`            |
| 10h15 – 10h30 | *Pause*                                                                                              |
| 10h30 – 10h45 | Division par Province (Realms) : Le rôle crucial du Château de l'empereur (realm "Master")           |
| 10h45 – 11h15 | **Pratique** : Ex.2 — Créer le realm `valdoria`, rôles simples et composites, SMTP                   |
| 11h15 – 11h45 | **Théorie** : Introduction aux protocoles OAuth 2.0 et OpenID Connect (OIDC)                         |
| 11h45 – 12h15 | **Pratique** : Ex.3 — Créer les utilisateurs, attribuer les rôles, ajouter l'attribut `villeOrigine` |
| 12h15 – 12h30 | Synthèse de la matinée et questions/réponses                                                         |


### Après-midi — Configuration Avancée des Clients (3h30)


| Horaire       | Activité                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| 13h30 – 14h00 | Gestion des Clients : types d'accès, flux Authorization Code + PKCE, concept d'audience                   |
| 14h00 – 15h00 | **Pratique** : Ex.4 — Créer le Comptoir (public) et la Réserve (Resource Server), mappers, outil Evaluate |
| 15h00 – 15h15 | *Pause*                                                                                                   |
| 15h15 – 15h45 | **Pratique** : Ex.5 — Lire les tokens JWT dans l'application, tester RBAC/ABAC et Single Logout           |
| 15h45 – 16h15 | **Pratique** : Ex.4.1 — Délégation d'administration (fine-grained permissions) via l'API REST             |
| 16h15 – 16h45 | Rôles de comptes de service et accès machine-to-machine (Client Credentials)                              |
| 16h45 – 17h00 | **Pratique** : Ex.6 — Créer l'automate impérial et tester l'accès M2M                                     |


---

## Jour 2 : Identités, Fédération et Sécurité Renforcée

### Matinée — Utilisateurs, Groupes et Impersonation (3h30)


| Horaire       | Activité                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------- |
| 09h00 – 09h15 | Rappel du Jour 1 et introduction à la gestion des identités à grande échelle                   |
| 09h15 – 09h45 | Gestion des groupes : héritage de rôles, organisation des utilisateurs                         |
| 09h45 – 10h15 | **Pratique** : Ex.7 — Créer la Guilde des Marchands, vérifier l'héritage dans le token         |
| 10h15 – 10h30 | *Pause*                                                                                        |
| 10h30 – 11h00 | Usage de la fonction « Impersonate » pour le support utilisateur                               |
| 11h00 – 12h00 | **Pratique** : Ex.8 — Créer `support-imperial`, impersonner Brunhild, diagnostiquer les droits |
| 12h00 – 12h30 | Synthèse de la matinée et questions/réponses                                                   |


### Après-midi — Intégrations Externes et Durcissement (3h30)


| Horaire       | Activité                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------- |
| 13h30 – 14h00 | Intégration d'annuaires existants : OpenLDAP, User Federation                                  |
| 14h00 – 14h45 | **Pratique** : Ex.9 — Connecter OpenLDAP, mappers d'attributs, Group/Role Mapper               |
| 14h45 – 15h15 | Broker d'identité OIDC : Keycloak comme intermédiaire entre IDP externes                       |
| 15h15 – 15h30 | *Pause*                                                                                        |
| 15h30 – 16h00 | **Pratique** : Ex.10 — Créer le realm Ostmark, configurer l'IDP, IDP Mapper                    |
| 16h00 – 16h30 | Renforcement de la sécurité : politiques de mots de passe, WebAuthn et force brute             |
| 16h30 – 16h45 | **Pratique** : Ex.11 — Configurer MFA (WebAuthn), politique de mots de passe, anti-brute-force |
| 16h45 – 17h00 | **Validation** : Questionnaire QCM de fin de formation et remise des attestations              |


