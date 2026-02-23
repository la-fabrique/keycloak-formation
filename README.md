# Formation Keycloak — L'Empire d'Authéria

Formation pratique de 2 jours pour maîtriser Keycloak 26.1 avec OAuth 2.0 et OpenID Connect.

## Prérequis

- **Docker** et **Docker Compose** — pour lancer l'environnement de formation
- **Node.js** et **npm** — pour exécuter les scripts de gestion de l'environnement

## Démarrage rapide

```bash
# 1. Copier le fichier d'environnement
cp infrastructure/.env.example infrastructure/.env

# 2. Lancer l'environnement
npm run docker:up

# 3. Accéder à Keycloak
# http://localhost:8080 (admin / admin)
```

Pour arrêter les services :

```bash
npm run docker:down
```

> **Alternative (sans Node.js)** : vous pouvez lancer l'environnement manuellement avec  
> `cd infrastructure && docker compose up -d` et l'arrêter avec `docker compose down`.

## Structure du dépôt

| Dossier | Contenu |
| --- | --- |
| `infrastructure/` | Docker Compose et configuration des services |
| `exercices/` | Énoncés et corrections des exercices |
| `apps/` | Applications de l'échoppe principale (à partir de l'exercice 4) |

## Exercices

| # | Titre | Module | Jour |
| --- | --- | --- | --- |
| 01 | Fonder la capitale | Module 1 — Fondations | J1 matin |
| 02 | Fonder la Province d'Authéria | Module 1 — Fondations | J1 matin |
| 03 | Attribuer les profils métier | Module 1 — Fondations | J1 matin |
| 04 | Ouvrir la première échoppe | Module 2 — Clients | J1 après-midi |
| 05 | Explorer les voies de commerce | Module 2 — Clients | J1 après-midi |
| 06 | Déployer l'automate impérial | Module 2 — Clients | J1 après-midi |
| 07 | Organiser les guildes | Module 3 — Identités | J2 matin |
| 08 | Rédiger les parchemins officiels | Module 3 — Identités | J2 matin |
| 09 | Déléguer au Maître des Registres | Module 4 — Intégrations | J2 après-midi |
| 10 | Signer un traité diplomatique | Module 4 — Intégrations | J2 après-midi |
| 11 | Fortifier les murailles | Module 4 — Intégrations | J2 après-midi |

## Services disponibles

| Service | URL | Identifiants |
| --- | --- | --- |
| Keycloak (admin) | http://localhost:8080 | `admin` / `admin` |
| Mailhog (emails) | http://localhost:8025 | — |
| PostgreSQL | `localhost:5432` | `keycloak` / `keycloak` |
| OpenLDAP | `localhost:389` | `cn=admin,dc=registre,dc=valdoria,dc=local` / `admin` |
