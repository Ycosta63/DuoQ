# Livrable : Plan de Tests et Cas de Test

## 1. Plan de Tests

**Stratégie Globale** :
L'objectif est d'assurer que l'application (DuoQ) permet une connexion fiable, un système de matching résilient, et que les données utilisateurs sont à jour et sécurisées. L'approche privilégie le *"fail-fast"* sur les parcours critiques.

- **Types de tests retenus** :
    - **Tests Unitaires** : Tester de manière isolée la logique métier complexe (utilitaires, parsing) et les composants UI sans dépendances (boutons, champs).
    - **Tests d’Intégration** : S'assurer que nos composants communiquent correctement avec Firebase (AuthContext, Settings).
    - **Tests End-to-End (E2E)** : Jouer le workflow utilisateur complet (inscription -> matching) dans un environnement naviguable complet.
- **Outils** :
    - *Vitest / React Testing Library* pour les tests unitaires et intégration (performant, orienté composants).
    - *Playwright* ou *Cypress* pour l'E2E.
- **Couverture Cible** : 75-80% des fichiers logiques (`contexts/`, `components/Login`, `components/Discover`, `components/Settings`), ce qui sécurise les fonctionnalités clés sans sur-tester l'UI pure.
- **Environnements** :
    - *Local* (exécutés côté développeur avec des émulateurs Firebase).
    - *Intégration Continue (CI)* automatique à chaque Pull Request vers `develop`.

---

## 2. Cas de Test (3 Fonctionnalités Critiques)

### Cas 1 : Création d’un nouveau profil joueur (Authentification)
- **Identifiant** : `TEST-AUTH-001`
- **Préconditions** : L'utilisateur n'est pas connecté. Aucun compte existant ne partage le pseudo "TestUser" et l'email "test@test.com".
- **Étapes** :
  1. Afficher l'application, aller sur la vue "S'inscrire".
  2. Renseigner un pseudo, un email, un mot de passe et cocher +18 ans.
  3. Passer aux étapes 2 et 3 : remplir le profil (Bio, Plateforme) et le Questionnaire de Match.
  4. Cliquer sur le sous-bouton "Continuer" (Submit final).
- **Résultat Attendu** : Un profil est asynchrone généré dans Firestore (avec les champs du password haché, pp/avatar, questionnaire etc.). L'utilisateur est connecté et le localStorage conserve son `id`.
- **Résultat Obtenu (Simulé)** : ✅ **Succès**. (Le profil est créé et on bascule instantanément sur l'Arena).

### Cas 2 : L'Action "GG" dans l'Arena (Le Matching)
- **Identifiant** : `TEST-ARENA-001`
- **Préconditions** : L'utilisateur est connecté. L'état `profiles` de l'Arena a chargé les 5 comptes tests générés.
- **Étapes** :
  1. Depuis l'onglet Arena, visionner la carte du tout premier profil ("ChillGirl99" par exemple).
  2. Cliquer sur l'icône Information pour lire ses réponses au questionnaire.
  3. Cliquer sur le bouton **GG** (Swipe Droit/Validé).
- **Résultat Attendu** : Le composant déclenche l'animation de translation vers la droite. Dans Firestore, un document "match" est croisé et consigné entre les deux IDs. Le composant met à jour son état en supprimant "ChillGirl99" (le second profil apparaît).
- **Résultat Obtenu (Simulé)** : ✅ **Succès**. (L'animation se déroule sans erreur, document créé avec le `matchId` concaténé des deux clés).

### Cas 3 : Personnalisation du Profil (Settings/Updates)
- **Identifiant** : `TEST-SETTING-001`
- **Préconditions** : L'utilisateur est connecté et se trouve sur l'onglet "Profil" / Paramètres.
- **Étapes** :
  1. Modifier le champ `Avatar (URL de l'image)` pour lui donner une vignette valide.
  2. Changer la Bio par un nouveau texte.
  3. Cliquer sur le bouton "Enregistrer".
- **Résultat Attendu** : Le bouton passe en état "Enregistrement...". Un appel de modification au profil Firestore s'opère (`updateProfile`). Un `msg` de statut s'affiche (Succès ou Erreur).
- **Résultat Obtenu (Simulé)** : ✅ **Succès**. (Les changements sont visualisables immédiatement car le contexte local est rafraichi).

---

## 3. Rapport de Couverture

- **Estimation du Taux de Couverture Ciblé sur le code métier :**
    - `src/contexts/AuthContext.tsx` : **85%** (Gestion connexion/inscription)
    - `src/components/Login.tsx` : **80%** (Les étapes, formulaires et validations)
    - `src/components/Discover.tsx` : **70%** (Filtrage profil et swiping GG/FF)
    - *Moyenne globale des fichiers critiques* : **~75%**

- **Justification des zones non (ou peu) couvertes :**
    - **Composants d'animations pures** : L'utilisation de `motion/react` et des timeouts (comme ceux de `Discover.tsx` fixés à `400ms` lors d'un swipe) ajoutent un niveau de complexité inutile en test unitaire. Les transitions et l'affichage purement visuel (les textures transparentes de fond, les icônes de Gamepad2 avec opacité) sont couverts partiellement et ne garantissent pas de crash fatal.
    - **Composant Chat.tsx** : Les sous-composants dédiés au scroll automatique via les Refs (`messagesEndRef`) dans la vue de chat sont souvent difficiles à mesurer par un runner virtuel non-DOM (jsdom).
    - **Bouton Discord Oauth** : Les popups externes (ou les redicrections Oauth externes) ne sont pas couverts en tests unitaires mais via des Post-messages Mockés, car les environnements serveur (Firebase Google/Discord) réels ne doivent pas être interrogés excessivement par une CI.
