# TESTS

## Plan de Tests

**Stratégie Globale :**  
L'objectif est d'assurer que l'application permet une connexion fiable, un système de matching résilient, et que les données utilisateurs sont à jour et sécurisées. L'approche privilégie le *"fail-fast"* sur les parcours critiques.

- **Types de tests retenus** :
    - **Tests Unitaires** : Tester de manière isolée la logique métier complexe (utilitaires, parsing) et les composants UI sans dépendances (boutons, champs).
    - **Tests d’Intégration** : S'assurer que nos composants communiquent correctement avec Firebase (AuthContext, Settings).
    - **Tests End-to-End (E2E)** : Jouer le workflow utilisateur complet (inscription -> matching) dans un environnement naviguable complet.
- **Outils** :
    - *Vitest / React Testing Library* pour les tests unitaires et intégration (performant, orienté composants).
    - *Playwright* ou *Cypress* pour l'E2E.
- **Couverture Cible** : 75-80% des fichiers logiques (`contexts/`, `components/Login`, `components/Discover`, `components/Settings`) afin de sécuriser les fonctionnalités clés sans sur-tester l'UI pure.
- **Environnements** :
    - *Local* (exécutés côté développeur avec des émulateurs Firebase).
    - *Intégration Continue (CI)* automatique à chaque Pull Request vers `develop`.

## Cas de Test (3 Fonctionnalités Critiques)

Nous avons mis en place une suite de tests unitaires automatisés avec **Vitest** et **React Testing Library** pour valider les comportements métiers sans solliciter les bases de données réelles (les appels Firebase sont simulés ou *mockés*).

### Cas 1 : Création d’un nouveau profil joueur (Authentification)
- **Identifiant** : `TEST-AUTH-01`,`TEST-AUTH-02`
- **Préconditions** : L'utilisateur n'est pas connecté. Aucun compte existant ne partage le pseudo "TestUser" et l'email "test@test.com".
- **Étapes** :
  1. Afficher l'application, aller sur la vue "S'inscrire".
  2. Renseigner un pseudo, un email, un mot de passe et cocher +18 ans.
  3. Passer aux étapes 2 et 3 : remplir le profil (Bio, Plateforme) et le Questionnaire de Match.
  4. Cliquer sur le sous-bouton "Continuer" (Submit final).
- **Résultat Attendu** : Un profil est asynchrone généré dans Firestore (avec les champs du password haché, pp/avatar, questionnaire etc.). L'utilisateur est connecté et le localStorage conserve son `id`.  
Les tests :
    - Vérifient que le composant rend bien les champs par défaut.
    - Vérifient que la fonction `login` du context est appelée avec les mots de passe et pseudo tapés par l'outil de test.
    - Simulent une erreur de connexion ("Mot de passe incorrect") et s'assure que le message d'erreur rouge s'affiche à l'écran.
    - Vérifient que si le joueur n'coche PAS la case "18 ans et plus", l'inscription bloque avec un message d'erreur.
- **Résultat Obtenu** : **Succès**.  
`Login.test.tsx` simule la saisie d'informations dans les champs de texte (pseudo, mots de passe) et clique sur les boutons d'envoi.
Le profil est créé et on bascule instantanément sur l'Arena.
    

### Cas 2 : L'Action "GG" dans l'Arena (Le Matching)
- **Identifiant** : `TEST-ARENA-01`,`TEST-ARENA-02`,`TEST-ARENA-03`, `TEST-ARENA-04`
- **Préconditions** : L'utilisateur est connecté. L'état `profiles` de l'Arena a chargé les 5 comptes tests générés.
- **Étapes** :
  1. Depuis l'onglet Arena, visionner la carte du tout premier profil ("ChillGirl99" par exemple).
  2. Cliquer sur l'icône Information pour lire ses réponses au questionnaire.
  3. Cliquer sur le bouton **GG** (Swipe Droit/Validé).
- **Résultat Attendu** : Le composant déclenche l'animation de translation vers la droite. Dans Firestore, un document "match" est croisé et consigné entre les deux IDs. Le composant met à jour son état en supprimant "ChillGirl99" (le second profil apparaît).
Les tests :
     - Vérifient l'apparition globale d'un profil (Ex: *TestUser1*) après suppression du spinner de chargement (état initial).
     - Simulent le clic sur le bouton de match ("GG").
     - Valident que Firestore enregistre bien l'action logicielle liée à l'interaction en local.
- **Résultat Obtenu** : **Succès**.  
`Discover.test.tsx` simule l'appel de données Firestore (qui retourne une liste fixe de profils virtuels). L'animation se déroule sans erreur, document créé avec le `matchId` concaténé des deux clés.

### Cas 3 : Personnalisation du Profil (Settings/Updates)
- **Identifiant** : `TEST-SETTING-01`, `TEST-SETTING-02`
- **Préconditions** : L'utilisateur est connecté et se trouve sur l'onglet "Profil" / Paramètres.
- **Étapes** :
  1. Modifier le champ `Avatar (URL de l'image)` pour lui donner une vignette valide.
  2. Changer la Bio par un nouveau texte.
  3. Cliquer sur le bouton "Enregistrer".
- **Résultat Attendu** : Le bouton passe en état "Enregistrement...". Un appel de modification au profil Firestore s'opère (`updateProfile`). Un `msg` de statut s'affiche (Succès ou Erreur).
Les tests :
    - S'assurent que les valeurs par défaut issues de la base sont bien injectées dans les champs.
     - Simulent le changement du champ *"Bio"* en lui passant *"New Bio"* puis soumet.
     - S'assurent que la fonction `updateProfile` de Firebase est bien appelée avec la nouvelle valeur.
- **Résultat Obtenu** : **Succès**.  
`Settings.test.tsx` charge le composant *"Paramètres"* en lui simulant un profil utilisateur existant (Ex: avec une "Old Bio"). Les changements sont visualisables immédiatement car le contexte local est rafraichi.
     

## Rapport de Couverture

File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                      
---|---|---|---|---|---                                                
 Discover.tsx |   68.05 |    46.75 |   57.14 |    72.3 | 48,60-61,82-88,99-106,115,184-219,286,300
 Login.tsx    |   56.94 |    70.21 |      24 |   58.46 | 50-51,57-68,89-101,161-384
 Settings.tsx |   44.94 |    64.81 |   30.43 |   45.88 | 39-169,184,191-192,198-200,208-218,263,283-324,351-407
**All files**     |   **55.79** |    **58.42** |   **33.87** |   **57.67** | 

**Zones non (ou peu) couvertes :**
- **Composants d'animations pures**  
L'utilisation de `motion/react` et des timeouts (comme ceux de `Discover.tsx` fixés à `400ms` lors d'un swipe) ajoutent de la complexité inutile en test unitaire. Les transitions et l'affichage purement visuel (les textures transparentes de fond, les icônes de Gamepad2 avec opacité) sont couverts partiellement et ne garantissent pas de crash fatal.
- **Composant Chat.tsx**  
Les sous-composants dédiés au scroll automatique via les Refs (`messagesEndRef`) dans la vue de chat sont souvent difficiles à mesurer par un runner virtuel non-DOM (jsdom).
- **Bouton Discord Oauth**  
Les popups externes (ou les redicrections Oauth externes) ne sont pas couverts en tests unitaires mais via des Post-messages Mockés, car les environnements serveur (Firebase Google/Discord) réels ne doivent pas être interrogés excessivement par une CI.