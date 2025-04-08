# Structure de la Base de Données Firebase pour l'Application de Suivi de Localisation

## Introduction

Ce document décrit la structure de la base de données Firebase qui sera utilisée pour notre application de suivi de localisation. Nous utiliserons Firebase Realtime Database pour stocker les données en temps réel et Firebase Authentication pour gérer l'authentification des utilisateurs.

## Collections et Documents

### Collection: Users
Cette collection stocke les informations relatives aux utilisateurs de l'application.

```
users/
  ├── {userId}/
  │     ├── email: string
  │     ├── displayName: string
  │     ├── photoURL: string (optionnel)
  │     ├── createdAt: timestamp
  │     ├── lastLogin: timestamp
  │     └── settings/
  │           ├── notifications: boolean
  │           └── language: string
```

### Collection: Devices
Cette collection stocke les informations relatives aux appareils de suivi.

```
devices/
  ├── {deviceId}/
  │     ├── name: string
  │     ├── type: string (enfant, personne âgée, objet)
  │     ├── ownerId: string (référence à userId)
  │     ├── createdAt: timestamp
  │     ├── lastActive: timestamp
  │     ├── isOnline: boolean
  │     ├── batteryLevel: number (optionnel)
  │     └── geofences/
  │           ├── {geofenceId}/
  │                 ├── name: string
  │                 ├── lat: number
  │                 ├── lng: number
  │                 ├── radius: number (en mètres)
  │                 ├── active: boolean
  │                 └── createdAt: timestamp
```

### Collection: Positions
Cette collection stocke l'historique des positions pour chaque appareil.

```
positions/
  ├── {deviceId}/
  │     ├── {positionId}/
  │           ├── timestamp: timestamp
  │           ├── lat: number
  │           ├── lng: number
  │           ├── accuracy: number (optionnel)
  │           ├── altitude: number (optionnel)
  │           ├── speed: number (optionnel)
  │           └── batteryLevel: number (optionnel)
```

### Collection: Notifications
Cette collection stocke les notifications générées par le système.

```
notifications/
  ├── {userId}/
  │     ├── {notificationId}/
  │           ├── type: string (geofence_exit, geofence_enter, signal_lost, battery_low)
  │           ├── deviceId: string (référence à deviceId)
  │           ├── message: string
  │           ├── timestamp: timestamp
  │           ├── read: boolean
  │           └── data: object (données supplémentaires spécifiques au type de notification)
```

## Relations entre les Collections

1. **Users -> Devices**: Un utilisateur peut posséder plusieurs appareils. La relation est établie par le champ `ownerId` dans la collection Devices.

2. **Devices -> Positions**: Chaque appareil a un historique de positions. La relation est établie par l'utilisation de `deviceId` comme clé dans la collection Positions.

3. **Devices -> Geofences**: Chaque appareil peut avoir plusieurs zones de geofencing. Ces zones sont stockées dans la sous-collection `geofences` de chaque appareil.

4. **Users -> Notifications**: Les notifications sont liées à un utilisateur spécifique. La relation est établie par l'utilisation de `userId` comme clé dans la collection Notifications.

## Règles de Sécurité

```javascript
{
  "rules": {
    "users": {
      "$uid": {
        // Seul l'utilisateur authentifié peut lire et écrire ses propres données
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "devices": {
      "$deviceId": {
        // Seul le propriétaire de l'appareil peut lire et écrire les données de l'appareil
        ".read": "data.child('ownerId').val() === auth.uid",
        ".write": "data.child('ownerId').val() === auth.uid || newData.child('ownerId').val() === auth.uid"
      }
    },
    "positions": {
      "$deviceId": {
        // Seul le propriétaire de l'appareil peut lire les positions
        // L'ESP32 peut écrire de nouvelles positions avec une clé API
        ".read": "root.child('devices').child($deviceId).child('ownerId').val() === auth.uid",
        ".write": "root.child('devices').child($deviceId).child('ownerId').val() === auth.uid || auth.token.device_write === true"
      }
    },
    "notifications": {
      "$uid": {
        // Seul l'utilisateur authentifié peut lire et modifier ses notifications
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Indexation

Pour optimiser les performances des requêtes fréquentes, nous recommandons d'indexer les champs suivants:

1. `devices/$deviceId/ownerId`
2. `positions/$deviceId/timestamp`
3. `notifications/$userId/read`
4. `notifications/$userId/timestamp`

## Considérations pour les Données en Temps Réel

Pour les mises à jour en temps réel des positions, nous utiliserons la fonctionnalité de Firebase Realtime Database qui permet de s'abonner aux changements. Cela permettra à l'interface utilisateur de se mettre à jour automatiquement lorsque de nouvelles positions sont enregistrées par l'ESP32.

## Gestion des Données Historiques

Pour éviter une croissance excessive de la base de données, nous pouvons envisager d'implémenter une fonction Cloud pour archiver ou supprimer les anciennes positions après une certaine période (par exemple, 30 jours). Les données archivées pourraient être exportées vers un stockage à long terme si nécessaire.
