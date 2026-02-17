# Correction — Exercice 3 : Peupler Valdoria et attribuer les profils métier

> Ce document est destiné au **formateur**. Il contient les réponses attendues, les points de vigilance et les sujets de discussion pour chaque étape.

---

## Checklist de validation rapide

Utilisez cette checklist pour vérifier rapidement chaque participant :

- [ ] 3 utilisateurs créés dans le realm `valdoria` (`alaric`, `brunhild`, `cedric`)
- [ ] Les rôles sont correctement attribués (alaric→gouverneur, brunhild→marchand, cedric→sujet)
- [ ] L'attribut `ville_origine` est configuré sur les 3 utilisateurs
- [ ] L'outil Evaluate a été utilisé pour prévisualiser les jetons JWT
- [ ] La connexion à la Account Console fonctionne (test avec alaric)
- [ ] Le participant comprend la distinction entre rôles realm et rôles client

---

## Correction détaillée

### Étape 1 — Créer les premiers sujets de Valdoria

**Procédure pour chaque utilisateur :**

1. Menu **« Users »** > **« Create new user »**
2. Remplir les champs (voir tableau ci-dessous)
3. **« Create »**
4. Onglet **« Credentials »** > **« Set password »**
5. Password : `valdoria123` | Temporary : OFF
6. **« Save »** > Confirmer

**Utilisateurs à créer :**

| Username | Email | Email verified | First name | Last name | Password |
| --- | --- | --- | --- | --- | --- |
| `alaric` | alaric@valdoria.empire | ✅ | Alaric | le gouverneur | valdoria123 |
| `brunhild` | brunhild@valdoria.empire | ✅ | Brunhild | la marchande | valdoria123 |
| `cedric` | cedric@valdoria.empire | ✅ | Cedric | le sujet | valdoria123 |

**Résultat attendu :**
- 3 utilisateurs apparaissent dans la liste des utilisateurs (menu **« Users »** > **« View all users »**)
- Chaque utilisateur a un email vérifié (Email verified : `Yes`)

**Points de vigilance :**

- **Email verified** : Certains participants oublient de cocher cette case. Sans elle, les emails de test ne seront pas envoyés (bien que l'attribut puisse être modifié manuellement après coup).
- **Temporary password** : Vérifiez que le toggle est bien sur OFF. Sinon, l'utilisateur devra changer son mot de passe à la première connexion (ce qui complique les tests).
- **Realm sélectionné** : Assurez-vous que le participant est bien dans le realm `valdoria` (menu déroulant en haut à gauche).

---

### Étape 2 — Attribuer les profils métier (rôles)

**Procédure pour chaque utilisateur :**

1. Menu **« Users »** > clic sur l'utilisateur
2. Onglet **« Role mapping »**
3. **« Assign role »**
4. Cocher le rôle correspondant
5. **« Assign »**

**Rôles à attribuer :**

| Utilisateur | Rôle à attribuer | Type | Rôles hérités |
| --- | --- | --- | --- |
| `alaric` | `gouverneur` | Composite | `sujet`, `marchand` |
| `brunhild` | `marchand` | Simple | aucun |
| `cedric` | `sujet` | Simple | aucun |

**Vérification de l'héritage (alaric) :**

1. Onglet **« Role mapping »** d'alaric
2. Activer **« Show inherited roles »**
3. Observer : `gouverneur` (assigned) + `sujet` (inherited) + `marchand` (inherited)

**Points de vigilance :**

- **Rôle composite non hérité** : Si le participant a mal configuré le rôle `gouverneur` dans l'exercice 2, l'héritage ne fonctionnera pas. Vérifier dans **« Realm roles »** > `gouverneur` > **« Associated roles »** que `sujet` et `marchand` sont bien listés.
- **Mauvais realm** : Vérifier que le participant est toujours dans le realm `valdoria`.

---

### Étape 3 — Ajouter les attributs personnalisés aux utilisateurs

**Procédure pour chaque utilisateur :**

1. Menu **« Users »** > clic sur l'utilisateur
2. Onglet **« Attributes »**
3. **« Add »** (ou bouton d'ajout)
4. Key : `ville_origine` | Value : (voir tableau)
5. **« Save »**

**Attributs à ajouter :**

| Utilisateur | Key | Value |
| --- | --- | --- |
| `alaric` | `ville_origine` | `Valdoria-Centre` |
| `brunhild` | `ville_origine` | `Nordheim` |
| `cedric` | `ville_origine` | `Sudbourg` |

**Vérification :**
- Retourner sur l'onglet **« Attributes »** de chaque utilisateur
- L'attribut `ville_origine` doit apparaître dans la liste avec la valeur correcte

**Points de vigilance :**

- **Confusion User Attributes vs User Profile** : Keycloak 26+ introduit une distinction entre :
  - **User Attributes** (onglet Attributes) : attributs libres au niveau utilisateur
  - **User Profile** (Realm Settings > User Profile) : schéma d'attributs au niveau realm

  Dans cet exercice, on utilise les **User Attributes** (onglet Attributes de chaque utilisateur).

- **Orthographe de l'attribut** : Vérifier que le participant écrit bien `ville_origine` (avec underscore, pas tiret ou espace). Les attributs sont case-sensitive.

- **Attributs non visibles dans le jeton** : À ce stade, les attributs ne sont PAS inclus dans les jetons JWT. Ils seront mappés dans l'exercice 8 via les mappers de client scopes.

---

### Étape 4 — Vérifier les profils utilisateurs

**Vérification du profil d'Alaric :**

1. Menu **« Users »** > `alaric`
2. Onglet **« Details »** :
   - Username : `alaric`
   - Email : `alaric@valdoria.empire`
   - Email verified : `Yes`
   - First name : `Alaric`
   - Last name : `le gouverneur`
3. Onglet **« Role mapping »** (avec « Show inherited roles » activé) :
   - `gouverneur` (assigned)
   - `sujet` (inherited)
   - `marchand` (inherited)
4. Onglet **« Attributes »** :
   - `ville_origine` : `Valdoria-Centre`

**Résultat attendu :**
- Les 3 utilisateurs sont complets (informations de base + rôles + attributs)
- L'héritage fonctionne pour alaric (2 rôles hérités visibles)

---

### Étape 5 — Prévisualiser le laissez-passer avec l'outil Evaluate

#### Accès à l'outil Evaluate

**Navigation :**
1. Menu **« Clients »**
2. Clic sur **`account-console`**
3. Onglet **« Client scopes »**
4. Sous-onglet **« Evaluate »**

**Génération du jeton pour alaric :**

1. Champ **« Users »** : sélectionner `alaric`
2. Champ **« Audience target »** : `account`
3. **« Generated access token »**

**Contenu attendu du jeton (extraits clés) :**

```json
{
  "exp": 1771336689,
  "iat": 1771336389,
  "iss": "http://localhost:8080/realms/valdoria",
  "aud": "account",
  "sub": "2937527b-b2ad-4844-b70b-6d43acd7428e",
  "typ": "Bearer",
  "azp": "account-console",
  "preferred_username": "alaric",
  "email": "alaric@valdoria.empire",
  "email_verified": true,
  "given_name": "Alaric",
  "family_name": "le gouverneur",
  "name": "Alaric le gouverneur",
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links"
      ]
    }
  }
}
```

**Points clés à observer :**

- **`aud`** (audience) : `account` — le jeton est destiné à l'API account
- **`azp`** (authorized party) : `account-console` — le client qui a demandé le jeton
- **`preferred_username`**, **`email`**, **`name`** : informations utilisateur
- **`resource_access.account.roles`** : rôles du client `account` (PAS les rôles realm)

**Point d'observation IMPORTANT :**

Les rôles realm (`gouverneur`, `sujet`, `marchand`) ne sont **PAS présents** dans ce jeton. Seuls les rôles du client `account` sont inclus. C'est normal à ce stade : les rôles realm doivent être mappés explicitement via des mappers de client scopes (exercice 8).

**Points de vigilance :**

- **Confusion sur les rôles** : Les participants peuvent être surpris de ne pas voir les rôles `gouverneur`, `sujet`, `marchand` dans le jeton. Expliquer que :
  - Les rôles dans `resource_access.account.roles` sont les rôles du **client** `account`
  - Les rôles realm nécessitent une configuration de mappers pour être inclus dans les jetons

- **Attributs non visibles** : L'attribut `ville_origine` n'apparaît pas non plus dans le jeton à ce stade. Il sera mappé dans l'exercice 8.

---

### Étape 6 — Se connecter à la console de gestion du compte

**Procédure :**

1. Ouvrir un onglet de navigation privée (incognito)
2. URL : **http://localhost:8080/realms/valdoria/account**
3. Identifiants : `alaric` / `valdoria123`
4. **« Sign In »**

**Résultat attendu :**
- Redirection vers la Account Console
- Page d'accueil avec "Personal info" affichant :
  - Name : `Alaric le gouverneur`
  - Email : `alaric@valdoria.empire`
- Sections disponibles : Personal info, Account security, Applications, Resources

**Points de vigilance :**

- **Mauvaise URL** : Vérifier que l'URL contient bien `/realms/valdoria/account` (et non `/realms/master/account`)
- **Port confusion** : Port 8080 pour Keycloak (et non 8025 qui est Mailhog web UI)
- **Mot de passe temporary** : Si le mot de passe était en mode temporary, l'utilisateur sera forcé de le changer. Recommencer avec le bon paramètre.

---

### Étape 7 — Récapitulatif : comprendre les rôles de royaume vs rôles de client

**Tableau récapitulatif :**

| Utilisateur | Rôle realm | Rôles dans le jeton account |
| --- | --- | --- |
| alaric | `gouverneur` (composite) | `manage-account`, `manage-account-links` |
| brunhild | `marchand` (simple) | `manage-account`, `manage-account-links` |
| cedric | `sujet` (simple) | `manage-account`, `manage-account-links` |

**Observations clés :**

1. **Tous les utilisateurs ont les mêmes rôles sur le client `account`** : C'est normal, car par défaut tous les utilisateurs d'un realm peuvent gérer leur propre compte.

2. **Les rôles realm ne sont pas présents** : Les rôles `gouverneur`, `marchand`, `sujet` ne sont pas inclus dans le jeton pour le client `account-console`. Ils seront mappés pour les applications métier dans l'exercice 4.

3. **Les attributs ne sont pas présents** : L'attribut `ville_origine` n'est pas non plus présent. Il sera mappé dans l'exercice 8.

---

## Erreurs courantes

| Erreur | Cause | Solution |
| --- | --- | --- |
| Email non vérifié → tests email échouent | Case "Email verified" non cochée | Modifier l'utilisateur > Details > Email verified ON |
| Rôles non hérités pour alaric | Rôle composite `gouverneur` mal configuré dans Ex2 | Vérifier Realm roles > gouverneur > Associated roles |
| Attribut non visible dans l'onglet Attributes | Confusion avec User Profile (Realm Settings) | Utiliser onglet Attributes de l'utilisateur, pas Realm Settings |
| Attribut mal orthographié | `ville_origin` au lieu de `ville_origine` | Corriger l'orthographe (avec underscore) |
| L'outil Evaluate ne propose aucun utilisateur | Mauvais realm sélectionné | Vérifier le menu déroulant (valdoria) |
| Les rôles realm n'apparaissent pas dans le jeton | Configuration normale à ce stade | Expliquer que les mappers seront configurés dans Ex8 |
| Impossible de se connecter à Account Console | Mauvaise URL ou identifiants | Vérifier /realms/valdoria/account et alaric/valdoria123 |
| Page blanche après connexion | Problème de session ou cache navigateur | Vider le cache, utiliser vraiment un onglet incognito |

---

## Sujets de discussion

### 1. Quand utiliser un attribut vs un rôle ?

**Rôle :**
- Contrôle d'accès (autorisation)
- Exemple : `gouverneur` peut créer des ressources, `sujet` peut seulement lire
- Logique binaire : on a le rôle ou on ne l'a pas

**Attribut :**
- Enrichissement contextuel (information)
- Exemple : `ville_origine` permet de filtrer des données par ville
- N'affecte pas les permissions, mais enrichit l'expérience utilisateur

### 2. Sécurité : qui peut voir les attributs utilisateur ?

- Les **administrateurs du realm** peuvent voir tous les attributs (onglet Attributes)
- L'**utilisateur lui-même** peut voir ses propres attributs dans l'Account Console (si configuré)
- Les **applications** peuvent recevoir les attributs dans les jetons JWT (si mappés via client scopes)

**Point de vigilance :** Ne pas stocker de données sensibles (numéro de sécurité sociale, données médicales) dans les attributs utilisateur sans chiffrement approprié.

### 3. Pourquoi les rôles realm n'apparaissent pas dans le jeton account ?

- Le client `account-console` est configuré pour inclure uniquement les rôles du client `account`
- Les rôles realm ne sont pas mappés par défaut pour éviter de surcharger les jetons
- Les applications métier doivent configurer leurs propres mappers pour inclure les rôles realm pertinents

### 4. Différence User Attributes (tab) vs User Profile (Realm Settings) ?

**User Attributes (onglet Attributes de l'utilisateur) :**
- Attributs libres au niveau utilisateur
- Pas de validation de schéma
- Utilisés dans cet exercice

**User Profile (Realm Settings > User Profile) :**
- Configuration de schéma d'attributs au niveau realm (Keycloak 26+)
- Permet de définir des règles de validation, permissions, affichage
- Plus avancé, abordé dans les exercices avancés

---

## Annexes

### Exemple de JWT complet pour alaric

```json
{
  "exp": 1771336689,
  "iat": 1771336389,
  "jti": "e8f7c123-456d-789e-012f-34567890abcd",
  "iss": "http://localhost:8080/realms/valdoria",
  "aud": "account",
  "sub": "2937527b-b2ad-4844-b70b-6d43acd7428e",
  "typ": "Bearer",
  "azp": "account-console",
  "sid": "f1e2d3c4-5b6a-7890-1234-567890abcdef",
  "acr": "1",
  "allowed-origins": [
    "http://localhost:8080"
  ],
  "realm_access": {
    "roles": [
      "default-roles-valdoria",
      "offline_access",
      "uma_authorization"
    ]
  },
  "resource_access": {
    "account": {
      "roles": [
        "manage-account",
        "manage-account-links",
        "view-profile"
      ]
    }
  },
  "scope": "openid profile email",
  "email_verified": true,
  "name": "Alaric le gouverneur",
  "preferred_username": "alaric",
  "given_name": "Alaric",
  "family_name": "le gouverneur",
  "email": "alaric@valdoria.empire"
}
```

### Tableau récapitulatif des 3 utilisateurs

| Username | Nom complet | Email | Rôle | Rôles hérités | Ville d'origine |
| --- | --- | --- | --- | --- | --- |
| `alaric` | Alaric le gouverneur | alaric@valdoria.empire | `gouverneur` | `sujet`, `marchand` | Valdoria-Centre |
| `brunhild` | Brunhild la marchande | brunhild@valdoria.empire | `marchand` | aucun | Nordheim |
| `cedric` | Cedric le sujet | cedric@valdoria.empire | `sujet` | aucun | Sudbourg |

**Mot de passe commun :** `valdoria123`

### Commandes de vérification Docker

```bash
# Vérifier que tous les conteneurs sont up
docker compose ps

# Vérifier les logs de Keycloak
docker compose logs autheria-keycloak

# Vérifier la santé de Keycloak
docker inspect autheria-keycloak | grep -A 5 Health
```

---

## Transition vers l'exercice 4

L'exercice 3 a permis de :
- ✅ Créer des utilisateurs dans un realm
- ✅ Attribuer des rôles realm (simples et composites)
- ✅ Ajouter des attributs personnalisés
- ✅ Observer le contenu des jetons JWT
- ✅ Comprendre la différence entre rôles realm et rôles client

**L'exercice 4** abordera la création d'un client applicatif métier et la configuration des mappers pour inclure les rôles realm et les attributs dans les jetons JWT.

**Timing :** 30 minutes (création utilisateurs : 10 min, rôles : 5 min, attributs : 5 min, Evaluate : 5 min, Account Console : 5 min)
