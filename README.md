# Gestion des Événements - React Native App

Une application mobile React Native pour la gestion d'événements avec inscription des utilisateurs.

## Fonctionnalités

- **Authentification** : Inscription et connexion des utilisateurs
- **Gestion des événements** : Affichage de tous les événements disponibles
- **Inscription aux événements** : Les utilisateurs peuvent s'inscrire aux événements
- **Détails des événements** : Vue détaillée avec liste des participants
- **Création d'événements** : Interface pour créer de nouveaux événements
- **Upload d'images** : Support pour les images d'événements

## Configuration de l'API

L'application est configurée pour se connecter à l'API backend à l'adresse :

- **Toutes les plateformes** : `http://192.168.43.219:3000`

> **Note** : Assurez-vous que votre serveur API backend est démarré sur le port 3000 et accessible depuis cette adresse IP.

## Installation

1. Cloner le projet
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Installer les nouvelles dépendances ajoutées :
   ```bash
   npx expo install expo-secure-store expo-image-picker
   ```

## Lancement

```bash
# Démarrer le serveur de développement
npx expo start
scan qr code 
```

## Structure de l'application

### Écrans principaux

1. **Splash Screen** (`app/splash.tsx`)
   - Écran de démarrage avec logo
   - Redirection automatique selon l'état d'authentification

2. **Authentification**
   - **Connexion** (`app/auth/login.tsx`)
   - **Inscription** (`app/auth/register.tsx`)

3. **Événements**
   - **Liste des événements** (`app/(tabs)/index.tsx`)
   - **Détails d'un événement** (`app/event/[id].tsx`)
   - **Création d'événement** (`app/create-event.tsx`)

### Services

- **API Service** (`services/api.ts`) : Gestion de toutes les requêtes API
- **Auth Context** (`contexts/AuthContext.tsx`) : Gestion de l'état d'authentification

### Fonctionnalités implémentées

#### Authentification
- Inscription avec validation des champs
- Connexion avec gestion des erreurs
- Stockage sécurisé du token JWT
- Déconnexion automatique en cas d'erreur 401

#### Gestion des événements
- Affichage de la liste des événements avec images
- Pull-to-refresh pour actualiser
- Inscription/désinscription aux événements
- Indicateur visuel pour les événements où l'utilisateur est inscrit

#### Interface utilisateur
- Design moderne avec Material Design
- Navigation fluide avec Expo Router
- Gestion des états de chargement
- Messages d'erreur et de succès

## API Endpoints utilisés

L'application utilise tous les endpoints documentés dans l'API :

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/events` - Liste des événements
- `GET /api/events/{id}` - Détails d'un événement
- `POST /api/events` - Création d'événement
- `POST /api/events/{id}/register` - Inscription à un événement
- `GET /api/events/{id}/clients` - Liste des participants
- `POST /api/upload/image` - Upload d'image



## Notes de développement

- L'application utilise Expo Router pour la navigation
- Le stockage sécurisé est géré par `expo-secure-store`
- Les images sont gérées avec `expo-image-picker`
- L'authentification est centralisée via React Context
- Toutes les requêtes API incluent automatiquement le token JWT quand nécessaire# eventsMobile
