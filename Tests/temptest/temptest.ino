#include <stdio.h>
#include "DHT.h"

#define DHTPIN 8
#define DHTTYPE DHT22 

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  // put your main code here, to run repeatedly:
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
  delay(30000);
}
