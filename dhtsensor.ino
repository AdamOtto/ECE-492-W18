//#include <LowPower.h>

/* Src site
 *  http://www.instructables.com/id/How-to-use-DHT-22-sensor-Arduino-Tutorial/
 *  
 */
 /* Lib site
  *  https://github.com/adafruit/DHT-sensor-library
  *  https://github.com/adafruit/Adafruit_Sensor
  *  https://github.com/rocketscream/Low-Power (Not Used)
  *  https://github.com/vancegroup-mirrors/avr-libc
  */

//Libraries
#include <DHT.h>
#include <stdio.h>
#include <string.h>
#include <avr/sleep.h>

//Constants
// Allocate on Board
#define DHTPIN 2     // Temp & Humid Sensor


// DHT22 Specific
#define DHTTYPE DHT22   // DHT 22 signal pin

// instantiate DHT
DHT dht(DHTPIN, DHTTYPE); //// Initialize DHT sensor for normal 16mhz Arduino


float hum;  //Stores humidity value
float temp; //Stores temperature value

void setup()
{
  Serial.begin(9600);
  dht.begin();
  set_sleep_mode(SLEEP_MODE_PWR_DOWN);
}

// Always leave a space for \n
char text[501];
char t[11];
char h[11];
int n = 0;
void loop()
{
LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF);
  
  //Read data and store it to variables hum and temp
  memset(text, 0, 501);
  memset(t, 0, 11);
  memset(h, 0, 11);
  n++;
  hum = dht.readHumidity();
  temp = dht.readTemperature();
  //Print temp and humidity values to serial monitor

  // %f not supported!
  dtostrf(temp, 10, 4, t);
  dtostrf(hum, 10, 4, h);

  snprintf(text, sizeof(text), "Humidity: %s,\nTemperature: %s C\n", h, t);
  Serial.println(text);
//  LowPower.powerDown(SLEEP_8S, ADC_OFF, BOD_OFF); 
//  delay(2000); //Delay 2 sec.
}

