# Audit de couverture — Formation Keycloak

Analyse croisée du programme et des exercices (`.memory/00-fil-checklist.md`, `02-fil-exercices.md`) avec la [documentation Keycloak Server Administration](https://www.keycloak.org/docs/latest/server_admin/index.html).  
Objectif : repérer les manques pour les apprenants et proposer des pistes de complément.

---

## Tableau des manques identifiés

| | **Priorité** | **Quoi** | **Pourquoi** | **Comment** |
|---|--------------|----------|--------------|--------------|
| [ ] | haute | **Required actions** (vérification email, mise à jour mot de passe, premier profil) | Présents dans la doc (verify email, update password, update profile, etc.) et dans les flux réels ; non traités dans les exercices. | Dans **Ex. 2 ou 3** : activer « Verify email » et « Update profile », configurer un flux (ex. premier login) et faire tester. Ou ajouter une **séquence dédiée** (15–20 min) en Module 3. |
| [ ] | haute | **Consentement utilisateur (consent)** | La doc décrit l'écran de consentement pour les clients ; jamais abordé dans le programme ni les exercices. | **Exposé** sur le principe (qui voit quoi, quand demander le consentement). Optionnel : dans **Ex. 4**, activer « Consent Required » sur un client et faire un tour de login pour montrer l'écran. |
| [x] | haute | **Déconnexion (logout)** | Single Logout (front-channel / back-channel) fait partie de la doc et des bonnes pratiques ; non mentionné explicitement. | **Exposé** : objectif du logout fédéré, différence front/back channel. Si le Comptoir utilise déjà le logout Keycloak : **pointer** dans Ex. 4/5 où et comment c'est appelé (1 slide ou 1 étape). |
| [ ] | haute | **Audit et conformité** | Annoncé en « Bonus » et couvert en **Exposé** uniquement ; pas de manipulation des événements ni des logs. | Ajouter une **partie pratique** (15–20 min) : ouvrir Événements utilisateur / Admin, déclencher quelques actions (login, changement de rôle, etc.) et montrer où les retrouver et quoi en faire (conformité, incident). |
| [ ] | haute | **SSL/HTTPS pour un realm** | Documenté (Require SSL, modes) ; important pour la prod ; absent du programme. | **Exposé** court sur les modes SSL (External requests / None / All) et le lien avec l'environnement (dev vs prod). Optionnel : montrer dans la console Realm settings → SSL. |
| [ ] | moyenne | **SAML 2.0 (client ou IDP)** | La présentation indique « SAML, OAuth 2 et OpenID » mais tous les exercices ne traitent qu'OIDC (clients et IDP). Aucune pratique SAML. | Ajouter un **exposé court** sur les cas d'usage SAML vs OIDC, puis soit un **mini-exercice** (ex. client SAML ou IDP SAML dans Valdoria), soit une **démo** guidée dans le même temps. |
| [ ] | moyenne | **Kerberos** | Au programme et en « Intégration annuaire » mais couvert uniquement en **Exposé** ; pas de mise en œuvre. | Soit un **exposé** renforcé avec schéma + prérequis (AD, keytabs), soit un **atelier optionnel** (doc/script) pour les environnements avec AD/Kerberos. |
| [ ] | moyenne | **WebAuthn / Passkeys** | Le programme parle de « MFA et autres mesures » ; l'Ex. 11 ne traite que l'OTP (TOTP). La doc couvre WebAuthn/Passkeys. | Soit **exposé** (WebAuthn vs OTP, cas d'usage), soit **extension de l'Ex. 11** : activer une option WebAuthn en plus de l'OTP et faire un test (navigateur/authenticator). |
| [ ] | moyenne | **Inscription utilisateur (self-registration)** | Décrit dans la doc (login avec lien d'inscription) ; pas dans les exercices. | **Exposé** : quand l'activer, lien avec verify email / required actions. Optionnel : **démo** en 5 min (activer self-registration sur Valdoria, créer un compte depuis l'écran de login). |
| [ ] | basse | **Permissions admin (fine-grained) / consoles dédiées** | La doc décrit la délégation d'admin et les consoles dédiées par realm ; non abordé. | **Exposé** (ou note dans le support) : différence master vs realm admin, cas d'usage (équipes par realm). Hors scope détaillé pour 2 jours, mais à mentionner. |
| [ ] | basse | **Politiques client (Client policies, FAPI)** | Documenté (FAPI, OAuth 2.1, profils stricts) ; pas au programme. | Pour une formation « admin » 2 jours : **exposé** très court (pourquoi des politiques client, ex. FAPI). Pas d'exercice si contrainte de temps. |
| [ ] | basse | **Organisations Keycloak (B2B)** | Le programme parle de « division par organisation » via les realms (Ex. 2) ; la feature **Organisations** (multi-tenant B2B) est une autre chose dans la doc. | Clarifier dans le **support** : « division par organisation » = un realm par organisation ici ; la feature Organizations existe pour d'autres scénarios (B2B). Exposé optionnel si public concerné. |
| [ ] | basse | **Codes de récupération (recovery codes)** | Présents dans la doc MFA ; Ex. 11 ne les mentionne pas. | **Une slide ou une étape** dans Ex. 11 : montrer où sont les recovery codes après configuration MFA et expliquer l'usage (secours si perte d'OTP). |

---

## Synthèse

- **À traiter en priorité** (impact direct sur l'admin au quotidien) : Required actions, Audit (pratique), SSL realm, et éventuellement Consent + Logout (exposé).
- **Ensuite** : SAML (exposé + démo ou mini-exo), Kerberos (exposé ou atelier optionnel), WebAuthn (exposé ou extension Ex. 11), Self-registration (exposé/démo).
- **Compléments** : Permissions admin / consoles dédiées, Client policies, Organizations, Recovery codes — plutôt en exposés ou notes pour ne pas surcharger les 2 jours.
