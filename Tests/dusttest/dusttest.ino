/**
 * Created by: Ken Hidalgo and Qikai Lu
 * Simple functionality test for the SMPWM-01C dust sensor
 * Polls the sensor every 15 secs
 * Prints values to serial monitor
 */
#include <stdio.h>
#include "SMPWM01A.h"

SMPWM01A dust;

void setup() {
  Serial.begin(9600);
  dust.begin();
}

void loop() {
  
  float dust25; 
  float dust100; 
  Serial.println("Start");
  dust25 = dust.getPM2();
  dust100 = dust.getPM10();

  char d25[11];
  char d100[11];

  dtostrf(dust25, 10, 4, d25);
  dtostrf(dust100, 10, 4, d100);

  Serial.print("Small Particulate Concentration: ");
  Serial.println(d25);
  Serial.print("Large Particulate Concentration: ");
  Serial.println(d100);
  delay(30000);
}
