# Formation Keycloak — Le Royaume d'Authéria

Formation pratique de 2 jours pour maîtriser Keycloak 26.1 avec OAuth 2.0 et OpenID Connect.

## Démarrage rapide

```bash
# 1. Copier le fichier d'environnement
cp infrastructure/.env.example infrastructure/.env

# 2. Lancer l'environnement
cd infrastructure
docker compose up -d

# 3. Accéder à Keycloak
# http://localhost:8080 (admin / admin)
```

## Structure du dépôt

| Dossier | Contenu |
| --- | --- |
| `infrastructure/` | Docker Compose et configuration des services |
| `exercices/` | Énoncés et corrections des exercices |
| `apps/` | Applications du portail royal (à partir de l'exercice 4) |

## Exercices

| # | Titre | Module | Jour |
| --- | --- | --- | --- |
| 01 | Fonder la capitale | Module 1 — Fondations | J1 matin |
| 02 | Créer le Royaume d'Authéria | Module 1 — Fondations | J1 matin |
| 03 | Définir les titres de noblesse | Module 1 — Fondations | J1 matin |
| 04 | Ouvrir les portes du château | Module 2 — Clients | J1 après-midi |
| 05 | Explorer les routes d'accès | Module 2 — Clients | J1 après-midi |
| 06 | Déployer l'armée automatisée | Module 2 — Clients | J1 après-midi |
| 07 | Organiser les guildes | Module 3 — Identités | J2 matin |
| 08 | Rédiger les parchemins officiels | Module 3 — Identités | J2 matin |
| 09 | Se faire passer pour un sujet | Module 3 — Identités | J2 matin |
| 10 | Forger une alliance avec un royaume voisin | Module 4 — Intégrations | J2 après-midi |
| 11 | Signer un traité diplomatique | Module 4 — Intégrations | J2 après-midi |
| 12 | Fortifier les murailles | Module 4 — Intégrations | J2 après-midi |

## Services disponibles

| Service | URL | Identifiants |
| --- | --- | --- |
| Keycloak (admin) | http://localhost:8080 | `admin` / `admin` |
| Mailhog (emails) | http://localhost:8025 | — |
| PostgreSQL | `localhost:5432` | `keycloak` / `keycloak` |
| OpenLDAP | `localhost:389` | `cn=admin,dc=voisin,dc=autheria,dc=local` / `admin` |
