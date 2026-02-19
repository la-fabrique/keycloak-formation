# Correction — Exercice 3 : Peupler Valdoria et attribuer les profils métier

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] 3 utilisateurs créés dans le realm `valdoria` (`alaric`, `brunhild`, `cedric`)
- [ ] Les rôles sont correctement attribués (alaric→gouverneur, brunhild→marchand, cedric→sujet)
- [ ] L'héritage fonctionne pour alaric (rôles `sujet` et `marchand` visibles avec « Show inherited roles »)
- [ ] L'attribut `villeOrigine` est configuré dans le User Profile du realm
- [ ] L'attribut `villeOrigine` est renseigné sur les 3 utilisateurs
- [ ] La connexion à la Account Console fonctionne (test avec alaric)

---

## Correction détaillée

### Étape 1 — Créer les premiers sujets de Valdoria

**Utilisateurs à créer :**

| Username | Email | First name | Last name | Password |
| --- | --- | --- | --- | --- |
| `alaric` | alaric@valdoria.empire | Alaric | le gouverneur | valdoria123 |
| `brunhild` | brunhild@valdoria.empire | Brunhild | la marchande | valdoria123 |
| `cedric` | cedric@valdoria.empire | Cedric | le sujet | valdoria123 |

**Points de vigilance :**

- **Email verified** : certains participants oublient de cocher cette case.
- **Temporary password** : vérifier que le toggle est bien sur OFF. Sinon, l'utilisateur devra changer son mot de passe à la première connexion, ce qui complique les tests.
- **Realm sélectionné** : s'assurer que le participant est bien dans le realm `valdoria`.

---

### Étape 2 — Attribuer les profils métier (rôles)

**Rôles à attribuer :**

| Utilisateur | Rôle à attribuer | Type | Rôles hérités |
| --- | --- | --- | --- |
| `alaric` | `gouverneur` | Composite | `sujet`, `marchand` |
| `brunhild` | `marchand` | Simple | aucun |
| `cedric` | (rôle par défaut `sujet` suffit) | Simple | aucun |

**Note formateur :** `cedric` reçoit automatiquement le rôle `sujet` via `default-roles-valdoria` (configuré dans l'exercice 2) — pas besoin de l'attribuer manuellement. C'est un bon moment pour rappeler l'utilité des rôles par défaut.

**Points de vigilance :**

- **Rôle composite non hérité pour alaric** : si l'héritage ne fonctionne pas, vérifier dans **« Realm roles »** > `gouverneur` > **« Associated roles »** que `sujet` et `marchand` sont bien listés (configuration exercice 2).
- **Mauvais realm** : vérifier que le participant est toujours dans le realm `valdoria`.

---

### Étape 3 — Ajouter les attributs personnalisés

**Attributs à renseigner :**

| Utilisateur | Attribut `villeOrigine` |
| --- | --- |
| `alaric` | `Valdoria-Centre` |
| `brunhild` | `Nordheim` |
| `cedric` | `Sudbourg` |

**Points de vigilance :**

- **Créer d'abord l'attribut dans le User Profile** : dans Keycloak 26+, les attributs libres sont gérés via **Realm Settings > User Profile**. L'attribut doit y être déclaré avant d'être renseigné sur chaque utilisateur.
- **Orthographe** : vérifier que le participant écrit bien `villeOrigine` (camelCase, sensible à la casse).
- **Attributs non visibles dans les jetons** : à ce stade, l'attribut n'est pas inclus dans les jetons JWT. Il sera mappé dans l'exercice 8 via un client scope.

---

### Étape 4 — Se connecter à la console de gestion du compte

**Note formateur :** Insister sur l'utilisation d'un onglet incognito pour éviter les conflits de session avec la session admin ouverte.

**Points de vigilance :**

- **Mauvaise URL** : vérifier que l'URL contient bien `/realms/valdoria/account` (et non `/realms/master/account`).
- **Mot de passe temporary** : si le mot de passe était en mode temporary, l'utilisateur sera forcé de le changer. Recommencer avec le bon paramètre.

---

## Points de vigilance formateur

| Erreur | Explication |
| --- | --- |
| Email non vérifié | Modifier l'utilisateur > Details > Email verified ON |
| Rôles non hérités pour alaric | Vérifier Realm roles > gouverneur > Associated roles (exercice 2) |
| Attribut absent de l'onglet utilisateur | Déclarer d'abord l'attribut dans Realm Settings > User Profile |
| Attribut mal orthographié (`villeOrigine`) | Sensible à la casse — corriger |
| Mauvaise URL pour la Account Console | `/realms/valdoria/account` et non `/realms/master/account` |

---

## Points de discussion

### 1. Quand utiliser un attribut vs un rôle ?

- **Rôle** : contrôle d'accès (autorisation) — logique binaire (on a le rôle ou non)
- **Attribut** : enrichissement contextuel (information) — permet un filtrage ou une personnalisation sans affecter les permissions

### 2. Différence entre User Attributes et User Profile ?

- **User Profile (Realm Settings > User Profile)** : schéma d'attributs déclaré au niveau realm (Keycloak 26+) — permet validation, permissions, affichage dans la Account Console
- Les attributs déclarés dans le User Profile sont la bonne pratique ; les attributs libres (onglet Attributes) existent toujours mais sans contrôle de schéma

### 3. Pourquoi les attributs n'apparaissent pas dans le jeton ?

- Les attributs utilisateur ne sont pas inclus automatiquement dans les jetons JWT
- Ils nécessitent un mapper de type « User Attribute » dans un client scope (abordé en exercice 8)
- C'est un choix délibéré : on ne divulgue que les informations explicitement configurées

---

## Transition vers l'exercice 4

> Les premiers sujets de Valdoria sont créés, leurs profils métier attribués et leurs traits personnels enregistrés.
>
> Dans l'exercice suivant, les architectes ouvriront le **Comptoir des voyageurs** (application front-end) et sécuriseront la **Réserve** (API), et configureront les mappers pour que les jetons transportent les rôles et attributs nécessaires.
