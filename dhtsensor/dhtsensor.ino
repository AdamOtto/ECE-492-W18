/* Created by: QIkai Lu
 * Date of Creation: Jan 25, 2018
 * Relevant external (not already on arduino IDE) source code:
 *    Library sources
 *      https://github.com/adafruit/DHT-sensor-library
 *      https://github.com/adafruit/Adafruit_Sensor
 *      https://github.com/rocketscream/Low-Power (Not currently used)
 *      https://github.com/vancegroup-mirrors/avr-libc (Not currently used)
 *    Modified from: None
 * Additional Notes: 
 * 1. Note this code is currently a test code for the sensors. While the code is not modified from any particular code bases, 
 * initialisation and the usage of the functions for reading from the sensors were learned from the provided example code
 * in the library of the correponding devices. 
 * 2. It is not known if the dust sensor code actually works yet, as we are wating for the header for wiring.
 */


//Libraries
#include <stdio.h>
#include <string.h>
#include <DHT.h>
#include "SMPWM01A.h"


// Constants
// DHT22 specific
#define DHTPIN 2     // Temp & Humid Sensor
#define DHTTYPE DHT22   // DHT 22 signal pin

// Dust Sensor Specific

// FONA808 specific



// instantiate DHT
DHT dht(DHTPIN, DHTTYPE); // Instantiate dht
SMPWM01A dust; // Instantiate dust sensor

float hum;  //Stores humidity value
float temp; //Stores temperature value
float dust25; //Store PM2.5 (fine)
float dust100; //Store PM10 (coarse)


// char buffer for printing
// Always leave a space for \n
char text[501];
char t[11];
char h[11];
char d25[11];
char d100[11];

// byte buffer for storage
byte textb[36];
byte tb[4];
byte hb[4];
byte d25b[4];
byte d100b[4];

float start, end; // for timing purposes

void setup()
{
  Serial.begin(9600);
  dht.begin();
  dust.begin();
}

void loop()
{
//LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  Serial.println("Start");
  start = millis();

  // Clear all buffers
  /////// byte
  memset(textb, 0, 36);
  memset(tb, 0, 4);
  memset(hb, 0, 4);
  memset(d25b, 0, 4);
  memset(d100b, 0, 4);
  /////// char
//  memset(text, 0, 501);
//  memset(t, 0, 11);
//  memset(h, 0, 11);
//  memset(d25, 0, 11);
//  memset(d100, 0, 11);
  // Read from the sensors
  hum = dht.readHumidity();
  temp = dht.readTemperature();
  dust25 = dust.getPM2();
  dust100 = dust.getPM10();

  ///// byte arrangement for data entry (might not be in right order at this time)
  memcpy(hb, &hum, 4);
  memcpy(tb, &temp, 4);
  memcpy(d25b, &dust25, 4);
  memcpy(d100b, &dust100, 4);

  memcpy(textb + 0, hb, 4);
  memcpy(textb + 4, "\n", 1);
  memcpy(textb + 5, tb, 4);
  memcpy(textb + 9, "\n", 1);
  memcpy(textb + 10, d25b, 4);
  memcpy(textb + 14, "\n", 1);
  memcpy(textb + 15, d100b, 4);
  memcpy(textb + 19, "\n", 1);
  
  //Print variables to determine if values are acquired correctly

  // %f not supported!
//  dtostrf(temp, 10, 4, t);
//  dtostrf(hum, 10, 4, h);
//  dtostrf(dust25, 10, 4, d25);
//  dtostrf(dust100, 10, 4, d100);
//  snprintf(text, sizeof(text), "Humidity: %s percent,\nTemperature: %s C\n, PM2.5: %sg/um^3\n, PM10: %sg/um^3\n", h, t, d25, d100);
//  Serial.println(text);


  end = millis();

  Serial.println(end-start);
  
  delay(2000); //Delay 2 sec.
}
