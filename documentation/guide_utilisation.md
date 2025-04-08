# Guide d'utilisation - Application de Suivi de Localisation

## Introduction

Cette application web permet de suivre la localisation d'enfants, de personnes âgées et d'objets en temps réel grâce à un module GPS NEO-M8N connecté à un ESP32. Les données de localisation sont stockées dans Firebase et affichées sur une carte interactive.

## Fonctionnalités

1. **Authentification utilisateur**
   - Création de compte
   - Connexion / Déconnexion
   - Récupération de mot de passe

2. **Dashboard**
   - Vue d'ensemble des appareils liés à l'utilisateur
   - Dernière position reçue
   - État de la connexion (en ligne / hors ligne)

3. **Carte interactive**
   - Affichage des positions en temps réel
   - Points cliquables pour afficher les informations détaillées

4. **Historique des positions**
   - Liste des positions avec date, heure, latitude et longitude
   - Filtrage par date
   - Visualisation du trajet sur la carte

5. **Gestion des appareils**
   - Ajout d'un nouveau tracker
   - Suppression d'un tracker
   - Liaison d'un tracker à un utilisateur

6. **Export de données**
   - Export CSV ou JSON de l'historique des positions

7. **Geofencing**
   - Création de zones de sécurité
   - Alertes en cas de sortie de zone

## Configuration matérielle

### Composants nécessaires
- ESP32 DevKit V1
- Module GPS NEO-M8N
- Batterie (optionnel)

### Connexions
- GPS TX → ESP32 GPIO16 (RX2)
- GPS RX → ESP32 GPIO17 (TX2)
- GPS VCC → ESP32 3.3V
- GPS GND → ESP32 GND

## Configuration logicielle

### ESP32
1. Installez l'IDE Arduino et les bibliothèques nécessaires :
   - TinyGPS++
   - ArduinoJson
   - WiFi
   - HTTPClient

2. Modifiez le fichier `gps_firebase.ino` avec vos informations :
   - SSID et mot de passe WiFi
   - ID de l'appareil (créé dans l'application web)

3. Téléversez le code sur votre ESP32

### Application Web
1. Créez un compte sur l'application
2. Ajoutez un nouvel appareil dans la section "Appareils"
3. Notez l'ID de l'appareil et utilisez-le dans le code ESP32
4. Configurez les zones de geofencing si nécessaire

## Utilisation

1. **Connexion**
   - Accédez à l'URL de l'application
   - Connectez-vous avec vos identifiants

2. **Dashboard**
   - Visualisez tous vos appareils
   - Cliquez sur "Voir sur la carte" pour suivre un appareil en temps réel

3. **Carte**
   - La position de l'appareil est mise à jour automatiquement
   - Cliquez sur le marqueur pour voir les détails

4. **Historique**
   - Sélectionnez un appareil et une plage de dates
   - Visualisez le trajet sur la carte
   - Exportez les données si nécessaire

5. **Gestion des appareils**
   - Ajoutez de nouveaux appareils
   - Configurez les zones de geofencing
   - Supprimez les appareils inutilisés

## Dépannage

1. **L'ESP32 ne se connecte pas au WiFi**
   - Vérifiez les identifiants WiFi
   - Assurez-vous que le signal WiFi est suffisamment fort

2. **Les positions ne s'affichent pas**
   - Vérifiez que le module GPS a un signal (en extérieur)
   - Vérifiez que l'ID de l'appareil est correct
   - Vérifiez les connexions entre l'ESP32 et le module GPS

3. **Problèmes d'authentification**
   - Utilisez la fonction "Mot de passe oublié" si nécessaire
   - Vérifiez que vous utilisez la bonne adresse email

## Support

Pour toute question ou problème, veuillez contacter le support technique à l'adresse support@example.com.
