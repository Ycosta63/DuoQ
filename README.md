# DuoQ

DuoQ est une application pour trouver votre partenaire de jeu idéal. Elle permet de matcher avec d'autres joueurs et de communiquer avec eux en temps réel.

## 🚀 Installation

Pour installer le projet localement et ses dépendances :

1. Assurez-vous d'avoir [Node.js](https://nodejs.org/) installé sur votre machine.
2. Clonez le dépôt et naviguez dans le dossier du projet ou ouvrez-le.
3. Exécutez la commande suivante pour installer les dépendances :

```bash
npm install
```

## 🛠 Lancement de l'application (Développement)

Pour démarrer l'application en mode développement (ceci lance le backend Express et l'application frontend Vite) :

```bash
npm run dev
```

Le serveur sera ensuite accessible sur `http://localhost:3000`.

## 🧪 Lancer les tests

L'application possède une commande de vérification (lint). Pour analyser l'intégrité du code :

```bash
npm run lint
```
*(Remarque : par défaut, la commande lint vérifie la validité des composants TypeScript de l'application.*)

## 📦 Build et Production

Pour préparer l'application pour la production, exécutez la commande suivante :

```bash
npm run build
```

Cela va regrouper l'interface et le serveur dans le dossier `dist/`. Pour démarrer cette version de production :

```bash
npm run start
```

## ⚙️ Intégration Continue et Déploiement Continu (CI/CD Pipeline)

Le projet utilise **GitHub Actions** pour assurer la qualité et la stabilité du code, ainsi que son déploiement automatique en production. La configuration de ce pipeline complet se trouve dans `.github/workflows/ci.yml`.

À chaque `push` ou `pull_request` sur les branches `main` et `develop`, une première étape d'intégration continue (CI) garantit l'intégrité du code (Job `build-and-test`) :

1. **Installation des dépendances** (`npm ci`) : Téléchargement d'un arbre de dépendances strict pour reproduire l'environnement.
2. **Qualité du code / Lint** (`npm run lint`) : Analyse statique du code TypeScript pour détecter les potentielles erreurs de typage et de syntaxe avant exécution.
3. **Tests Unitaires** (`npm run test`) : Passage de la suite de tests automatisés (via Vitest) sur nos composants React pour s'assurer du non-bris des fonctionnalités critiques.
4. **Compilation / Build** (`npm run build`) : Construction complète pour vérifier que le projet est apte à être exécuté. Si une de ces étapes échoue, le processus s'arrête ici.

### 🚀 Déploiement Automatique (CD)

Si toutes les étapes précédentes réussissent, et **uniquement lors d'un merge ou d'un push sur la branche `main`**, le job `deploy-production` s'exécute pour mettre en ligne la dernière version :

5. **Déploiement en Production** (`Deploy to Firebase Hosting`) : L'action GitHub utilise les identifiants sécurisés (Secrets GitHub) pour authentifier le dépôt et déployer automatiquement la version validée sur les serveurs de production. Cela rend la nouvelle version de l'application immédiatement et automatiquement disponible pour les utilisateurs, complétant ainsi notre boucle d'intégration et de livraison continue.
