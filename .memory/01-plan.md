# Plan de la formation Keycloak

## Vue d'ensemble

Formation de 2 jours (14 h) couvrant l'architecture, la configuration et l'exploitation de Keycloak pour sécuriser des applications avec OAuth 2.0 et OpenID Connect.

---

## Module 1 — Fondations et environnement *(Jour 1 matin)*

**Objectifs** : Comprendre le rôle d'un IAM, installer Keycloak et maîtriser la notion de Realm.

- Introduction à Keycloak : IAM, Identity Provider (IDP)
- Version 26.1 et écosystème open-source
- Installation et lancement via Docker ou Podman
- Realms : rôle de la province « Master » (le Château de l'empereur), segmentation par organisation
- Introduction aux protocoles OAuth 2.0 et OpenID Connect (OIDC)
- Configuration des rôles de royaume (Realm roles)

---

## Module 2 — Gestion des clients *(Jour 1 après-midi)*

**Objectifs** : Créer et sécuriser des clients applicatifs, maîtriser les flux OIDC et l’accès machine-to-machine.

- Paramètres de base et types d'accès des clients
- Création et sécurisation d'un client applicatif
- Étude détaillée des flux d'authentification (OIDC Flows)
- Test des flux et gestion des secrets de clients
- Déconnexion et Single Logout (objectif, front-channel / back-channel)
- Rôles de comptes de service et automatisation
- Mise en œuvre des accès machine-to-machine

---

## Module 3 — Identités, groupes et scopes *(Jour 2 matin)*

**Objectifs** : Gérer les utilisateurs à grande échelle, organiser par groupes et enrichir les tokens.

- Gestion des groupes, utilisateurs et sessions
- Création massive d'utilisateurs et groupes hiérarchiques
- Client Scopes : mapping des attributs et rôles
- Configuration des mappers pour enrichir les tokens d'accès
- Fonction Impersonate pour le support utilisateur
- Test de l'impersonation et debug des jetons de session

---

## Module 4 — Intégrations externes et durcissement *(Jour 2 après-midi)*

**Objectifs** : Fédérer des annuaires, interconnecter avec des IDP externes et renforcer la sécurité.

- Intégration d'annuaires : Active Directory et OpenLDAP
- Mapping d'attributs LDAP et configuration Kerberos
- Intégration avec un IDP externe (SSO) pour l'interopérabilité
- Utilisation de Keycloak en tant que client (flux OAuth2)
- Renforcement : politiques de mots de passe et MFA
- Audit et vérification de conformité de l'installation
- Questionnaire QCM de fin de formation

---

# Déroulé pédagogique

---

## Jour 1 : Architecture, Realms et Gestion des Clients

### Matinée — Fondations et Environnement (3h30)


| Horaire       | Activité                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------ |
| 09h00 – 09h15 | Accueil des stagiaires, tour de table des attentes et présentation des objectifs           |
| 09h15 – 09h30 | Introduction à Keycloak : Pourquoi un IAM ? Notion d'Identity Provider (IDP)               |
| 09h30 – 09h45 | Présentation de la version 26.1 et de l'écosystème open-source                             |
| 09h45 – 10h15 | **Pratique** : Installation et lancement de Keycloak via Docker ou Podman                  |
| 10h15 – 10h30 | *Pause*                                                                                    |
| 10h30 – 10h45 | Division par Province (Realms) : Le rôle crucial du Château de l'empereur (realm "Master") |
| 10h45 – 11h15 | **Pratique** : Création d'une province, segmentation et isolation par organisation         |
| 11h15 – 11h45 | **Théorie** : Introduction aux protocoles OAuth 2.0 et OpenID Connect (OIDC)               |
| 11h45 – 12h15 | **Pratique** : Configuration des rôles de royaume (Realm roles)                            |
| 12h15 – 12h30 | Synthèse de la matinée et questions/réponses                                               |


### Après-midi — Configuration Avancée des Clients (3h30)


| Horaire       | Activité                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------- |
| 13h30 – 14h00 | Gestion des Clients : Paramètres de base et types d'accès                                      |
| 14h00 – 14h30 | **Pratique** : Création et sécurisation d'un premier client applicatif                         |
| 14h30 – 15h00 | Étude détaillée des Flux d'authentification (OIDC Flows)                                       |
| 15h00 – 15h15 | *Pause*                                                                                        |
| 15h15 – 16h00 | **Pratique** : Test des différents flux et gestion des secrets de clients                      |
| 16h00 – 16h30 | Rôles de comptes de service et automatisation                                                  |
| 16h30 – 17h00 | **Pratique** : Mise en œuvre des rôles de comptes de service pour les accès machine-to-machine |


---

## Jour 2 : Identités, Fédération et Sécurité Renforcée

### Matinée — Utilisateurs, Groupes et Scopes (3h30)


| Horaire       | Activité                                                                                |
| ------------- | --------------------------------------------------------------------------------------- |
| 09h00 – 09h15 | Rappel du Jour 1 et introduction à la gestion des identités                             |
| 09h15 – 09h45 | Gestion des groupes, utilisateurs et gestion des sessions                               |
| 09h45 – 10h15 | **Pratique** : Création massive d'utilisateurs et organisation en groupes hiérarchiques |
| 10h15 – 10h30 | *Pause*                                                                                 |
| 10h30 – 11h00 | Gestion des Client Scopes : Mapping des attributs et rôles                              |
| 11h00 – 11h30 | **Pratique** : Configuration des mappers pour enrichir les tokens d'accès               |
| 11h30 – 12h00 | Usage de la fonction « Impersonate » pour le support utilisateur                        |
| 12h00 – 12h30 | **Pratique** : Test de l'impersonation et debug des jetons de session                   |


### Après-midi — Intégrations Externes et Durcissement (3h30)


| Horaire       | Activité                                                                          |
| ------------- | --------------------------------------------------------------------------------- |
| 13h30 – 14h00 | Intégration d'annuaires existants : Active Directory et OpenLDAP                  |
| 14h00 – 14h45 | **Pratique** : Mapping d'attributs LDAP et configuration Kerberos                 |
| 14h45 – 15h15 | Intégration avec un IDP externe (SSO) pour l'interopérabilité                     |
| 15h15 – 15h30 | *Pause*                                                                           |
| 15h30 – 16h00 | **Pratique** : Utilisation de Keycloak en tant que client (flux OAuth2)           |
| 16h00 – 16h30 | Renforcement de la sécurité : Politiques de mots de passe et MFA                  |
| 16h30 – 16h45 | **Bonus** : Audit et vérification de la conformité de l'installation              |
| 16h45 – 17h00 | **Validation** : Questionnaire QCM de fin de formation et remise des attestations |


