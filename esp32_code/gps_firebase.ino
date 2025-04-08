#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <ArduinoJson.h>

// Configuration WiFi
const char* ssid = "VOTRE_SSID_WIFI";
const char* password = "VOTRE_MOT_DE_PASSE_WIFI";

// Configuration Firebase
const String firebaseHost = "https://espgps-baa76-default-rtdb.europe-west1.firebasedatabase.app";
const String firebaseAuth = "AIzaSyDOFTJZ9kSOPYRGPDT0F4gigkNVRWUz0DE";
const String deviceId = "VOTRE_ID_APPAREIL"; // Vous devez créer cet ID dans l'application web

// Configuration GPS
TinyGPSPlus gps;
HardwareSerial GPSSerial(1); // Utilisation de UART1 pour le GPS

// Variables pour la gestion de la batterie (optionnel)
const int batteryPin = 35; // Broche analogique pour lire le niveau de batterie
float batteryLevel = 0;

// Intervalle d'envoi des données (en millisecondes)
const unsigned long sendInterval = 10000; // 10 secondes
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(115200);
  GPSSerial.begin(9600, SERIAL_8N1, 16, 17); // RX, TX pour le GPS
  
  // Connexion au WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connexion au WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connecté au WiFi avec l'adresse IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Lecture des données GPS
  while (GPSSerial.available() > 0) {
    gps.encode(GPSSerial.read());
  }
  
  // Vérifier si c'est le moment d'envoyer les données
  if (millis() - lastSendTime > sendInterval) {
    lastSendTime = millis();
    
    if (gps.location.isValid()) {
      // Lire le niveau de batterie (optionnel)
      int rawValue = analogRead(batteryPin);
      batteryLevel = map(rawValue, 0, 4095, 0, 100); // Adapter selon votre circuit
      
      // Envoyer les données à Firebase
      sendGPSData(gps.location.lat(), gps.location.lng(), gps.altitude.meters(), 
                  gps.speed.kmph(), gps.hdop.value(), batteryLevel);
    } else {
      Serial.println("Position GPS non valide");
    }
  }
}

void sendGPSData(double lat, double lng, double altitude, double speed, double accuracy, float battery) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Construire l'URL pour l'API
    String url = "https://espgps-baa76-default-rtdb.europe-west1.firebasedatabase.app/positions/" + deviceId + ".json";
    
    // Préparer les données JSON
    DynamicJsonDocument doc(200);
    doc["lat"] = lat;
    doc["lng"] = lng;
    doc["timestamp"] = String(millis()); // Idéalement, utilisez un timestamp réel
    
    // Ajouter des données optionnelles
    if (altitude) doc["altitude"] = altitude;
    if (speed) doc["speed"] = speed;
    if (accuracy) doc["accuracy"] = accuracy;
    if (battery) doc["batteryLevel"] = battery;
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    // Envoyer les données
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("HTTP Response code: " + String(httpResponseCode));
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error on sending POST: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("WiFi déconnecté");
  }
}
