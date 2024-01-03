# Guide d'installation et d'exécution du serveur

Ce guide fournit des instructions pour installer Node.js, installer les dépendances du projet depuis le dossier et lancer le serveur.

## Installation de Node.js

1. **Téléchargement de Node.js** :

   - Allez sur le site officiel de [Node.js](https://nodejs.org/).
   - Téléchargez la version recommandée pour votre système d'exploitation.
   - Suivez les instructions d'installation pour installer Node.js.

2. **Vérification de l'installation de Node.js** :
   - Ouvrez un terminal (ou une invite de commande).
   - Tapez `node -v` et appuyez sur Enter.
   - Tapez `npm -v` et appuyez sur Enter.
   - Assurez-vous que les versions de Node.js et de npm sont affichées. Cela confirme que Node.js est installé correctement.

## Installation des dépendances du projet

1. **Clonage du projet** :

   - Clonez ce dépôt sur votre machine locale en utilisant `git clone <URL du dépôt>`.

2. **Accès au répertoire du projet** :

   - Ouvrez un terminal (ou une invite de commande).
   - Allez dans le répertoire du projet en utilisant `cd nom-du-repertoire`.

3. **Installation des dépendances** :
   - Tapez `npm i` pour installer toutes les dépendances répertoriées dans le fichier `package.json`.

## Lancement du serveur

1. **Configuration des paramètres** :

   - Assurez-vous que toutes les configurations nécessaires sont correctement définies dans le fichier `server.js`.

2. **Lancement du serveur** :

   - Tapez `node server.js` dans le terminal pour démarrer le serveur.

3. **Accès au serveur** :
   - Ouvrez un navigateur web et accédez au serveur en utilisant l'URL `http://localhost:5000`.
