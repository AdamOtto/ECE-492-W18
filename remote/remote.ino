#include "DHT.h"
#include "SMPWM01A.h"
#include "Adafruit_FONA.h"
#include <avr/sleep.h>

#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

// Constants
// DHT22 specific
#define DHTPIN 8     // Temp & Humid Sensor
#define DHTTYPE DHT22   // DHT 22 signal pin
#define HOME_PHONE "+1780555555" //Home node phone number
#define PINNUMBER "" //SIM card PIN number
#define RI_PIN 12 //Ring Indicator Pin


#include "SoftwareSerial.h"
SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

Adafruit_FONA fona = Adafruit_FONA(FONA_RST);

DHT dht(DHTPIN, DHTTYPE); // Instantiate dht
SMPWM01A dust; // Instantiate dust sensor
int stateRI;

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  fonaSerial->print("AT+CNMI=2,1\r\n");
  fona.enableGPS(true);

  stateRI = HIGH;
  PCMSK0 |= (1<<PCINT4);  //pin 12
  pinMode(RI_PIN, INPUT);
}

ISR(PCINT0_vect) {
 if (stateRI != digitalRead(RI_PIN)){ 
   if ((stateRI = digitalRead(RI_PIN)) == LOW){
    sleep_disable();
    PCMSK0 |= ~(1<<PCINT4);
    }
 } 
 else{
  dust.PCINT2_ISR();
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
  hum = dht.readHumidity();
  temp = dht.readTemperature();
  dust25 = dust.getPM2();
  dust100 = dust.getPM10();

  if (fona.getNetworkStatus() == 1) {
    boolean gsmloc_success = fona.getGSMLoc(&lat, &lon);
  }
  
  //convert floating point values to strings
  dtostrf(hum, 10, 4, h);
  dtostrf(temp, 10, 4, t);
  dtostrf(dust25, 10, 4, d25);
  dtostrf(dust100, 10, 4, d100);
  dtostrf(lat, 10, 4, la);
  dtostrf(lon, 10, 4, lo);

  //Package and Send
  snprintf(txtmsg, sizeof(txtmsg), "%s,%s,%s,%s,%s,%s", h,t,d25,d100,la,lo);
  fona.sendSMS(HOME_PHONE, txtmsg);

  //Time to go to sleep!
  ADCSRA = 0;
  set_sleep_mode (SLEEP_MODE_PWR_DOWN);  
  sleep_enable();
  cli();
  sleep_bod_disable();
  sei();
  PCMSK0 |= (1<<PCINT4);
  sleep_cpu();
 }
