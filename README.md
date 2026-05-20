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
