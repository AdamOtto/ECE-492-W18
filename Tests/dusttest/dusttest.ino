#include <stdio.h>
#include "SMPWM01A.h"

SMPWM01A dust;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  dust.begin();
}

void loop() {
  // put your main code here, to run repeatedly:
  float dust25; //Store PM2.5 (fine)
  float dust100; //Store PM10 (coarse)
  Serial.println("Start");
  dust25 = dust.getPM2();
  dust100 = dust.getPM10();

  char d25[11];
  char d100[11];

  dtostrf(dust25, 10, 4, d25);
  dtostrf(dust100, 10, 4, d100);

  Serial.print("Large Particulate Concentration: ");
  Serial.println(d25);
  Serial.print("Small Particulate Concentration: ");
  Serial.println(d100);
  delay(30000);
}
