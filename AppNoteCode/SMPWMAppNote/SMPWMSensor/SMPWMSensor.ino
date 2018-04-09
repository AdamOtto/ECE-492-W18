#include "SMPWM01A.h"

SMPWM01A dust;

void setup() {
  Serial.begin(9600);
  dust.begin();
}

void loop() {
  float d2; 
  float d10; 
  d2 = dust.getPM2();
  d10 = dust.getPM10();

  Serial.print("Small Particulate Concentration(ug/m^3): ");
  Serial.println(d2);
  Serial.print("Large Particulate Concentration(ug/m^3): ");
  Serial.println(d10);
  delay(30000);
}
