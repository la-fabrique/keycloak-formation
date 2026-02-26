# Exercice 11 — Fortifier les murailles

> **Module 4 — Intégrations externes et durcissement**

---

## Objectifs pédagogiques

À l'issue de cet exercice, vous serez capable de :

- Configurer une **politique de mots de passe** stricte dans un realm
- Activer l'**authentification multi-facteurs (MFA)** avec WebAuthn
- Mettre en place la **détection de force brute** pour bloquer les attaques par essais successifs

---

## Prérequis

### Prérequis techniques

- L'environnement Docker doit être **actif** (exercice 1 complété)
- Le realm `valdoria` doit exister avec les utilisateurs `alaric`, `brunhild` et `cedric` (exercice 3 complété)

### Prérequis de connaissances

- Avoir complété les exercices 1 à 10
- Connaître les concepts de realm, utilisateurs et rôles dans Keycloak

---

## Contexte narratif

> L'Empire d'Authéria est désormais pleinement opérationnel : ses guildes sont organisées, ses registres connectés, ses alliés intégrés. Mais un empire prospère attire les convoitises.
>
> Les espions des royaumes rivaux tentent de forcer les portes de Valdoria : mots de passe devinés, tentatives répétées, accès volés. Il est temps de **fortifier les murailles**.
>
> Les administrateurs impériaux renforcent trois lignes de défense : la robustesse des mots de passe, l'ajout d'un second facteur d'authentification, et la détection automatique des intrusions.

---

## Concepts nouveaux

### Politique de mots de passe

Keycloak permet de définir des règles que tout mot de passe doit respecter avant d'être accepté. Ces règles sont vérifiées à la création ou au changement de mot de passe.

| Règle | Description |
|-------|-------------|
| **Length** | Longueur minimale |
| **Upper Case** | Au moins N majuscules |
| **Digits** | Au moins N chiffres |
| **Special Chars** | Au moins N caractères spéciaux |

### WebAuthn

**WebAuthn** (Web Authentication) est un standard W3C qui permet une authentification forte sans mot de passe — ou en complément d'un mot de passe (MFA). L'utilisateur s'authentifie avec un **authentificateur** : smartphone (biométrie ou PIN d'écran de verrouillage), clé de sécurité matérielle (YubiKey, etc.) ou capteur intégré (Touch ID, Windows Hello).

```
Utilisateur entre son mot de passe
        │
        ▼
Keycloak demande un second facteur
        │
        ▼
Smartphone / clé matérielle  ←── authentification biométrique ou PIN
        │
        │  signature cryptographique
        ▼
Keycloak valide la signature ✅
        │
        ▼
Accès accordé
```

Le secret ne circule jamais sur le réseau : seule une signature cryptographique est échangée.

### Détection de force brute

Keycloak détecte les tentatives d'attaque par force brute (essais répétés de mots de passe) et peut **verrouiller temporairement un compte** après un certain nombre d'échecs consécutifs.

---

## Étapes

### Étape 1 — Configurer la politique de mots de passe

1. Connectez-vous à la console Keycloak : **http://localhost:8080**
2. Sélectionnez le realm **valdoria**
3. Dans le menu de gauche, allez dans **Authentication**
4. Cliquez sur l'onglet **Policies**, puis **Password policy**
5. Ajoutez les règles suivantes en cliquant sur **Add policy** pour chacune :

   | Règle | Valeur |
   |-------|--------|
   | **Minimum length** | `8` |
   | **Uppercase Characters** | `1` |
   | **Digits** | `1` |
   | **Special characters** | `1` |

6. Cliquez **Save**

**Vérification — tester un mot de passe trop faible :**

1. Dans le menu de gauche, allez dans **Users**
2. Cliquez sur **brunhild**, puis sur l'onglet **Credentials**
3. Cliquez **Reset password**
4. Entrez un mot de passe faible, par exemple `abc`
5. Désactivez **Temporary**, puis cliquez **Save**
6. Constatez le message d'erreur : Keycloak rejette le mot de passe ✅
7. Annulez — le mot de passe actuel de Brunhild reste inchangé

---

### Étape 2 — Activer WebAuthn comme second facteur

#### Activer le support WebAuthn dans le realm

1. Dans le menu de gauche, allez dans **Authentication**
2. Cliquez sur l'onglet **Policies**, puis **WebAuthn Policy**
3. Vérifiez que les paramètres sont les suivants (valeurs par défaut suffisantes) :

   | Paramètre | Valeur | Commentaire |
   |-----------|--------|-------------|
   | **Relying Party Name** | `Valdoria WebAuthn` | Nom affiché à l'utilisateur lors de l'enregistrement de la clé |
   | **Relying Party ID** | _(vide)_ | Domaine associé à la clé ; vide = domaine courant du serveur |
   | **Signature Algorithms** | `ES256`, `RS256` | Algorithmes acceptés pour signer le challenge |
   | **Attestation Conveyance Preference** | `none` | Ne demande pas de preuve d'authenticité du device |
   | **Authenticator Attachment** | _(not specified)_ | Pas de restriction : clé USB, Touch ID, Windows Hello… |
   | **Require Discoverable Credential** | _(not specified)_ | Si activé, la clé peut identifier l'utilisateur sans login préalable |
   | **User Verification Requirement** | `preferred` | Demande un PIN ou biométrie si le device le supporte |
   | **Timeout** | _(vide)_  | Délai en secondes pour l'enregistrement ; 0 = valeur par défaut du navigateur |
   | **Avoid Same Authenticator Registration** | `disabled` | Autorise l'enregistrement multiple du même authenticator |
   | **Acceptable AAGUIDs** | _(vide)_ | Liste blanche de modèles d'authenticator autorisés ; vide = tous acceptés |
   | **Extra Origins** | _(vide)_ | Origines supplémentaires autorisées pour les requêtes WebAuthn |

> ES256 est plus récent, mais il est possible de conserver le RS256 qui est plus largement supporté. 

4. Cliquez **Save**

#### Ajouter WebAuthn au flux d'authentification de connexion

1. Dans le menu de gauche, allez dans **Authentication**
2. Cliquez sur l'onglet **Flows**
3. Cliquez sur **browser** pour ouvrir le flux de connexion par défaut
4. Cliquez **Actions-** - **Duplicate** (en haut à droite) pour créer une copie modifiable
   - Nommez-la `browser-valdoria`, cliquez **Duplicate**
5. Dans le flux `browser-valdoria`, localisez le sous-flux **browser-valdoria Browser - Conditional 2FA**
6. Cliquez sur les **Delete** à droite de cette étape
7. Cliquez sur **Add** - **Add execution** au niveau de **browser-valdoria forms** (le sous-flux)
8. Dans la liste, sélectionnez **WebAuthn Authenticator**, cliquez **Add**
9. Définissez son niveau comme **Required**

   > **Résultat :** après le mot de passe, Keycloak exigera systématiquement une validation WebAuthn.

#### Activer le nouveau flux sur le realm

10. Cliquez sur **Actions-** - **Bind flow** (en haut à droite), sélectionnez **`Browser flow`** dans le menu déroulant
3. Cliquez **Save**

---

### Étape 3 — Enregistrer un authentificateur WebAuthn avec `alaric`

1. Ouvrez le Comptoir des voyageurs : **http://localhost:5173**
2. Déconnectez-vous si une session est active
3. Cliquez **Se connecter**
4. Connectez-vous avec **`alaric`** / `valdoria123`
5. Keycloak affiche une page **PasskeyRegistration** (enregistrement WebAuthn)
6. Cliquez **Register**
7. Le navigateur ouvre une fenêtre de sélection d'authentificateur :
   - **Sur ordinateur avec capteur intégré** : validez avec Touch ID ou Windows Hello si disponible,
   - **Sinon** : Un QR code s'affiche pour valider avec votre smartphone
8. Une fois l'enregistrement confirmé, donnez un nom à la clé (ex : `Mon téléphone`) et validez
9. Keycloak vous connecte au Comptoir des voyageurs ✅

**Vérification dans la console d'administration :**

1. Retournez dans la console Keycloak, realm **valdoria**
2. Allez dans **Users**, cliquez sur **alaric**
3. Allez dans l'onglet **Credentials**
4. Constatez qu'un credential de type **WebAuthn** est désormais enregistré ✅

---

### Étape 4 — Tester la connexion complète avec MFA

1. Dans le Comptoir des voyageurs, déconnectez-vous
2. Cliquez **Se connecter**
3. Entrez les identifiants **`alaric`** / `valdoria123`
4. Keycloak demande la validation WebAuthn (second facteur)
5. Validez avec votre authentificateur (smartphone ou capteur)
6. Constatez l'accès au Comptoir ✅

**Point d'observation :** Sans le second facteur, la connexion ne peut pas aboutir — même si le mot de passe est correct.

---

### Étape 5 — Activer la détection de force brute

1. Dans la console Keycloak, realm **valdoria**
2. Dans le menu de gauche, allez dans **Realm settings**
3. Cliquez sur l'onglet **Security defenses**
4. Dans la section **Brute force mode**, selectionnez **Lockout permanently**
5. Configurez les paramètres suivants :

   | Paramètre | Valeur | Explication |
   |-----------|--------|-------------|
   | **Max login failures** | `5` | Nombre de tentatives échouées avant verrouillage |
   | **Quick login check milliseconds** | `1000` | Fenêtre (ms) pour détecter un login trop rapide (bot) |
   | **Minimum quick login wait** | `1 Minute` | Durée de verrouillage si deux tentatives en moins de 1000 ms |

6. Cliquez **Save**

---

### Étape 6 — Tester le verrouillage par force brute

1. Dans le Comptoir des voyageurs, déconnectez-vous
2. Cliquez **Se connecter**
3. Entrez **`cedric`** comme nom d'utilisateur
4. Entrez un **mauvais mot de passe** et validez — répétez **5 fois**
5. Keycloak continue d'afficher le même message d'erreur générique (`Invalid username or password`) — c'est volontaire pour ne pas révéler à un attaquant que le compte est verrouillé

**Vérification dans la console d'administration :**

1. Retournez dans la console Keycloak, realm **valdoria**
2. Allez dans **Users**, cliquez sur **cedric**
3. L'onglet **Details** affiche **User enabled : OFF** — le compte est bien verrouillé ✅

**Débloquer un utilisateur verrouillé :**

1. Toujours dans le profil de `cedric`, cliquez **Enable** (ou **Unlock**) pour rétablir l'accès
2. Le compte est immédiatement déverrouillé ✅

---

## Point clé

> **Le durcissement est indispensable avant toute mise en production.**
>
> Une politique de mots de passe solide élimine les comptes trop faciles à compromettre. Le MFA avec WebAuthn ajoute un second facteur cryptographique que l'attaquant ne peut pas deviner — même s'il connaît le mot de passe. La détection de force brute rend les attaques par essais successifs impraticables.
>
> Ces trois mécanismes sont complémentaires : chacun couvre des vecteurs d'attaque différents.

---

## Dépannage
browser-valdoria
| Problème | Cause probable | Solution |
|----------|---------------|----------|
| Le mot de passe faible est accepté | La politique n'a pas été sauvegardée | Vérifiez dans **Authentication > Policies > Password policy** que les règles sont bien listées |
| La page d'enregistrement WebAuthn n'apparaît pas après le mot de passe | Le flux `browser-valdoria` n'est pas activé dans les Bindings | Vérifiez **Authentication > Bindings > Browser flow** |
| Le navigateur ne propose pas d'authentificateur WebAuthn | Version de navigateur trop ancienne ou contexte non-HTTPS | Sur localhost, WebAuthn fonctionne sans HTTPS ; mettez à jour le navigateur |
| Le smartphone n'apparaît pas comme option | Le navigateur du PC et le smartphone ne sont pas sur le même réseau | Utilisez un navigateur Chrome récent et assurez-vous que la connexion Bluetooth ou réseau local est active |
| Le compte n'est pas verrouillé après 5 échecs | La détection de force brute n'est pas sauvegardée | Vérifiez **Realm settings > Security defenses > Brute force detection > Enabled** |
| Impossible de se reconnecter après verrouillage | Le compte est effectivement verrouillé | Déverrouillez depuis la console : **Users > cedric > Enable** |
