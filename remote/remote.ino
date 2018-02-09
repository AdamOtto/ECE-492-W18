#include <GSM.h>
#include <string.h>
#include <DHT.h>
#include "SMPWM01A.h"


// Constants
// DHT22 specific
#define DHTPIN 2     // Temp & Humid Sensor
#define DHTTYPE DHT22   // DHT 22 signal pin
#define HOME_PHONE "+1780555555" //Home node phone number

DHT dht(DHTPIN, DHTTYPE); // Instantiate dht
SMPWM01A dust; // Instantiate dust sensor

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  boolean notConnected = true;
  while (notConnected) {
    if (gsmAccess.begin(PINNUMBER) == GSM_READY) {
      notConnected = false;
    } else {
      delay(1000);
    }
  }
}

void loop() {
  //floating point variables to hold sensor values
  float hum;  //Stores humidity value
  float temp; //Stores temperature value
  float dust25; //Store PM2.5 (fine)
  float dust100; //Store PM10 (coarse)
  float lat; //latitude
  float lon; //longitude

  //character buffers for each value
  char h[11];
  char t[11];
  char d25[11];
  char d100[11];
  char la[11];
  char lo[11];
  char txtmsg[80];

  //Update sensor values here
  
  //convert floating point values to strings
  dtostrf(hum, 10, 4, h);
  dtostrf(temp, 10, 4, t);
  dtostrf(dust25, 10, 4, d25);
  dtostrf(dust100, 10, 4, d100);
  dtostrf(lat, 10, 4, la);
  dtostrf(lon, 10, 4, lo);
  
  sms.beginSMS(HOME_PHONE);
  snprintf(txtmsg, sizeof(txtmsg), "%s,%s,%s,%s,%s,%s", h,t,d25,d100,la,lo);
  //Serial.println(txtmsg);
  sms.print(txtmsg);
  sms.endSMS();
}
