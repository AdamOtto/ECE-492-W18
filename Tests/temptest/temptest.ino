/**
 * Created by: Ken Hidalgo and Qikai Lu
 * Simple functionality test for the DHT22 Temp/Humidity sensor
 * Polls the sensor every 15 secs
 * Prints values to serial monitor
 */
#include <stdio.h>
#include "DHT.h"

#define DHTPIN 8
#define DHTTYPE DHT22 

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float hum;  //Stores humidity value
  float temp; //Stores temperature value
  Serial.println("Start");
  hum = dht.readHumidity();
  temp = dht.readTemperature();

  char h[11];
  char t[11];

  dtostrf(hum, 10, 4, h);
  dtostrf(temp, 10, 4, t);

  Serial.print("Temp: ");
  Serial.println(t);
  Serial.print("Hum: ");
  Serial.println(h);
  delay(2000);
}
