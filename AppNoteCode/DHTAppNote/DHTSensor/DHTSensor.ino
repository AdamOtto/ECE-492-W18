#include "DHT.h"

#define DHTPIN 8
#define DHTTYPE DHT22 

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temp;
  float hum;
  
  temp = dht.readTemperature();
  hum = dht.readHumidity();

  Serial.print("Temperature(*C): "); Serial.println(temp);
  Serial.print("Humidity(%): "); Serial.println(hum);
}
