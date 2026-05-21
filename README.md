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

## ⚙️ Intégration Continue (CI / Pipeline)

Le projet utilise **GitHub Actions** pour assurer la qualité et la stabilité du code à l'aide d'un pipeline d'intégration continue automatisé. La configuration de ce pipeline se trouve dans `.github/workflows/ci.yml`.

À chaque `push` ou `pull_request` sur les branches `main` et `develop`, les étapes suivantes sont déclenchées de manière séquentielle sur un environnement distant (Ubuntu / Node.js 20) :

1. **Installation des dépendances** (`npm ci`) : Téléchargement d'un arbre de dépendances strict.
2. **Qualité du code / Lint** (`npm run lint`) : Analyse statique du code TypeScript pour détecter les potentielles erreurs de typage et de syntaxe avant exécution.
3. **Tests Unitaires** (`npm run test`) : Passage de la suite de tests automatisés (via Vitest) sur nos composants React pour s'assurer du non-bris des fonctionnalités critiques (connexion, swipe, mise à jour des paramètres).
4. **Compilation / Build** (`npm run build`) : Construction complète du frontend et du backend pour vérifier que le projet est apte à être déployé en production (`dist/`).

Si l'une de ces étapes échoue, le pipeline sera signalé en erreur et sécurisera le dépôt en bloquant potentiellement le déploiement ou l'intégration d'un code instable.
