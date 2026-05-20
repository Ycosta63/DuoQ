# Stratégie de Branches Git (Git Workflow)

Ce document décrit la stratégie de gestion de versions (Git Workflow) adoptée pour notre projet. Nous utilisons une approche inspirée de **GitFlow**, adaptée pour une intégration et un déploiement continus fluides.

## Types de Branches

### Les Branches Principales (Longue durée)

1. **`main`** (ou `master`) :
   - C'est la branche de **production**.
   - Le code sur cette branche doit *toujours* être stable, testé et prêt à être déployé.
   - On ne commit **jamais** directement sur `main`. Les modifications proviennent uniquement de fusions (Merge Requests / Pull Requests) depuis `develop` ou `hotfix`.
   - Chaque fusion sur `main` s'accompagne d'un *tag* de version (ex: `v1.0.0`, `v1.1.0`).

2. **`develop`** :
   - C'est la branche d'**intégration** (ou branche de pré-production / staging).
   - Elle contient le code des prochaines fonctionnalités à livrer.
   - Les développeurs créent leurs branches de fonctionnalités (`feature/*`) à partir de `develop`.
   - Une fois intégrées et testées, les modifications de `develop` sont fusionnées dans `main` pour la mise en production (souvent complété via une branche de `release`).

### Les Branches Éphémères (Courte durée)

3. **`feature/*`** (ex: `feature/user-questionnaire`, `feature/dark-mode`) :
   - Créées à partir de : `develop`
   - Fusionnées vers : `develop`
   - Objectif : Développer une nouvelle fonctionnalité ou une amélioration spécifique.
   - Convention de nommage : `feature/<nom-de-la-fonctionnalite>` ou `feature/TICKET-123-<nom>`.

4. **`hotfix/*`** (ex: `hotfix/login-crash`, `hotfix/security-patch`) :
   - Créées à partir de : `main`
   - Fusionnées vers : `main` **ET** `develop`
   - Objectif : Corriger un bug critique en production (sur la branche `main`) qui ne peut pas attendre la prochaine release.
   - Convention de nommage : `hotfix/<description-du-bug>`.

---

## Cycle de vie d'une Feature Branch (Exemple)

Voici un exemple concret du cycle de développement d'une nouvelle fonctionnalité, par exemple : "Ajout d'un questionnaire personnalisé".

### 1. Création de la branche (Développeur)
Le développeur s'assure d'être à jour et crée une nouvelle branche à partir de `develop` :
```bash
git checkout develop
git pull origin develop
git checkout -b feature/questionnaire-match
```

### 2. Développement et Commits
Le développeur travaille sur sa fonctionnalité et effectue plusieurs commits clairs et isolés :
```bash
git add src/components/Login.tsx
git commit -m "feat: ajout des questions au formulaire d'inscription"

git add src/components/Chat.tsx
git commit -m "feat: affichage du questionnaire type dans la messagerie"

# Pousse la branche sur le dépôt distant (ex: GitHub/GitLab)
git push -u origin feature/questionnaire-match
```

### 3. Pull Request / Merge Request (PR/MR)
Une fois la fonctionnalité terminée, le développeur ouvre une Pull Request (PR) sur la plateforme d'hébergement :
- **Source** : `feature/questionnaire-match`
- **Destination** : `develop`
- **Titre** : `feat: Questionnaire de match personnalisé`
- **Description** : Liste ce qui a été fait, contexte fonctionnel et éventuelles captures d'écran.

### 4. Code Review (Revue de code)
Les membres de l'équipe examinent le code proposé.
- Les relecteurs peuvent demander des ajustements ; dans ce cas, le développeur met à jour sa branche avec de nouveaux commits.
- Lorsque tout est validé, la PR est approuvée.

### 5. Intégration (Merge)
Une fois validée et tous les tests continus (CI) au vert, la branche est fusionnée dans `develop` :
- Généralement, on favorise la stratégie **"Squash and Merge"** pour regrouper tous les petits commits de la PR en un seul commit propre sur `develop` (ou **"Merge commit"** standard).
- La branche locale et distante `feature/questionnaire-match` est ensuite supprimée pour garder le projet propre.

```bash
# Opération généralement effectuée depuis l'interface web (GitHub/GitLab)
git checkout develop
git merge --no-ff feature/questionnaire-match
git push origin develop
git branch -d feature/questionnaire-match # Nettoyage local
```

### 6. Étape future (Déploiement)
Lors de la prochaine itération de livraison, la branche `develop` entière (qui inclut maintenant notre nouvelle feature) sera ramenée sur `main` pour être mise en production !
