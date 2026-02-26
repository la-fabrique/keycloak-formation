# Checklist fil rouge — Couverture des objectifs (Ex. 1 à 11)

Croisement des points ● de la formation (`.memory/00-presentation.md`) avec les exercices 1 à 11.
**Ex. n** = exercice 1 à 11 | **Exposé** = théorie / démo | **—** = non couvert par un exo (exposé ou à prévoir).

---

## Objectifs généraux


| Objectif                                                              | Ex. / Exposé   |
| --------------------------------------------------------------------- | -------------- |
| ● Maîtriser le cycle de vie des jetons d'accès et de rafraîchissement | Ex. 4 + Exposé |
| ● Créer une architecture efficace IAM avec Keycloak                   | Ex. 1, 2, 3, 4 |
| ● Comprendre les protocoles de sécurité et quand les utiliser         | Ex. 4 + Exposé |
| ● Concevoir et configurer la gestion des rôles                        | Ex. 2, 3, 4    |
| ● Intégrer Keycloak avec des annuaires existants                      | Ex. 9          |
| ● Intégrer des IDP externes (SSO)                                     | Ex. 10         |
| ● Politiques de sécurité additionnelles                               | Ex. 11         |


---

## Programme — Points ●

### Introduction à Keycloak


| Point          | Ex. / Exposé   |
| -------------- | -------------- |
| ● Notion d'IDP | Exposé + Ex. 4 |


### Gestion des clients Keycloak


| Point                               | Ex. / Exposé   |
| ----------------------------------- | -------------- |
| ● Configuration basique d'un client | Ex. 4          |
| ● OAuth 2.0 & OpenID Connect        | Ex. 4 + Exposé |
| ● Flows d'authentification (OIDC)   | Ex. 4          |
| ● Gestion des secrets               | Ex. 4          |
| ● Configuration des rôles           | Ex. 2, 3, 4    |
| ● Rôles de comptes de service       | Ex. 6          |


### Gestion des Client Scopes


| Point                                 | Ex. / Exposé |
| ------------------------------------- | ------------ |
| ● Attributs et rôles des utilisateurs | Ex. 3, 4     |
| ● Impersonate (usage)                 | Ex. 8        |
| ● Gestion des groupes                 | Ex. 7        |
| ● Gestion des sessions                | Ex. 2        |


### Gestion des groupes & utilisateurs


| Point                        | Ex. / Exposé |
| ---------------------------- | ------------ |
| ● Intégration AD / LDAP      | Ex. 9        |
| ● Mapping des attributs LDAP | Ex. 9        |


*(Création utilisateurs et attribution de rôles : Ex. 3.)*

### Division par royaume (Realms)


| Point                       | Ex. / Exposé |
| --------------------------- | ------------ |
| ● Le royaume Master         | Ex. 1        |
| ● Segmentation              | Ex. 1, 2     |
| ● Realm roles               | Ex. 2, 3     |
| ● Gestion des sessions      | Ex. 2        |
| ● Division par organisation | Ex. 2        |


### Utilisation de Keycloak en tant que client


| Point                               | Ex. / Exposé   |
| ----------------------------------- | -------------- |
| ● Configuration côté client         | Ex. 4 + Exposé |
| ● Configuration et test d'un client | Ex. 4 (config), Ex. 5 (test) |


### Intégration annuaire existant


| Point                        | Ex. / Exposé |
| ---------------------------- | ------------ |
| ● Intégration AD / OpenLDAP  | Ex. 9        |
| ● Mapping des attributs LDAP | Ex. 9        |
| ● Configuration Kerberos     | Exposé       |


### Intégration IDP externe


| Point                                | Ex. / Exposé |
| ------------------------------------ | ------------ |
| ● Configuration de l'intégration     | Ex. 10       |
| ● Méthodes SSO pour les applications | Ex. 10       |


### Renforcer la sécurité


| Point                                     | Ex. / Exposé |
| ----------------------------------------- | ------------ |
| ● Politiques et exigences de mot de passe | Ex. 11       |
| ● MFA et autres mesures                   | Ex. 11       |


### Bonus


| Point                          | Ex. / Exposé |
| ------------------------------ | ------------ |
| ● Audit et conformité Keycloak | Exposé       |


---

## Synthèse Ex. 1 à 11


| Ex. | Thème                                         | Couverture                           |
| --- | --------------------------------------------- | ------------------------------------ |
| 1   | Realm master, isolation                       | Master, segmentation                 |
| 2   | Realm Valdoria, rôles, session, SMTP          | Realm roles, sessions, organisation  |
| 3   | Utilisateurs, rôles, attributs                | Utilisateurs, attribution, attributs |
| 4   | Clients SPA + RS, mappers, audience, Evaluate | Clients, OIDC, jetons, config client |
| 5   | Parchemins (tokens, Debug, RBAC/ABAC)         | Test d'un client, lecture des jetons  |
| 6   | Automate impérial (M2M)                       | Rôles de comptes de service, Client Credentials |
| 7   | Guilde des Marchands (groupes)                | Groupes, héritage de rôles           |
| 8   | Impersonation (support)                       | Impersonate, diagnostic de droits    |
| 9   | Maître des Registres (LDAP)                   | Fédération LDAP, mappers attributs/groupe/rôle |
| 10  | Traité diplomatique (IDP externe)             | Identity Provider OIDC, broker, IDP Mappers |
| 11  | Fortifier les murailles (durcissement)        | Politique MDP, WebAuthn MFA, détection force brute |


