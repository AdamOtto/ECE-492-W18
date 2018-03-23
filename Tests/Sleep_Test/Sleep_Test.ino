/*
 * Created by: Ken Hidalgo
 * Code for testing the remote station using SMS
*/
//#include "DHT.h"
#include "Adafruit_FONA.h"
//#include "SMPWM01A.h"
#include <avr/sleep.h>


#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

// Constants
//#define DHTPIN 8     // Temp & Humid Sensor
//#define DHTTYPE DHT22   // DHT 22 signal pin
//#define HOME_PHONE "+17808500725" //Ken's Cell Phone Number
#define HOME_PHONE "+17806166416"
#define PINNUMBER "" //SIM card PIN number
#define MAXTRIES 2

#include "SoftwareSerial.h"
SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

Adafruit_FONA fona = Adafruit_FONA(FONA_RST);

//DHT dht(DHTPIN, DHTTYPE); // Instantiate dht
//SMPWM01A dust;

volatile int interval = 1; // Interval in mins
volatile int sleep_total = (interval*60)/8; // 
volatile int sleep_count = 0;

void setup() {
  watchdogOn();
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  //dust.begin();
  
  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  fonaSerial->print("AT+CNMI=2,1\r\n");
  //fona.enableGPS(true);
  while(fona.available()){}
}

void sendSMS(char* Phone){
   //floating point variables to hold sensor values
    /*float hum;  //Stores humidity value
    float temp; //Stores temperature value
    float dust2; 
    float dust10;
    uint16_t batt; 
  
    //character buffers for each value
    char h[11];
    char t[11];
    char d2[11];
    char d10[11];
    char b[11];
  
    //Update sensor values here
    hum = dht.readHumidity();
    temp = dht.readTemperature();
    dust2 = dust.getPM2();
    dust10 = dust.getPM10();
    fona.getBattPercent(&batt);
    
    //convert floating point values to strings
    dtostrf(hum, 10, 4, h);
    dtostrf(temp, 10, 4, t);
    dtostrf(dust2, 10, 4, d2);
    dtostrf(dust10, 10, 4, d10);
    dtostrf(batt, 10, 4, b);*/
    
    char txtmsg[80];
    //Package and Send
    //snprintf(txtmsg, sizeof(txtmsg), "D,%s,%s,%s,%s,%s", t,h,d2,d10,b);
    snprintf(txtmsg, sizeof(txtmsg), "D,50, -100, 25, 50, 50, 26.5, 80");
    fona.sendSMS(Phone, txtmsg);
}

void extractSMS(char* smsBuffer, char* fonaNotificationBuffer){      
  char* bufPtr = fonaNotificationBuffer;
  //if (fona.available()){
    int slot = 0;            
    int charCount = 0;
    
    do  {
      *bufPtr = fona.read();
      Serial.write(*bufPtr);
      delay(1);
    } while ((*bufPtr++ != '\n') && (fona.available()) && (++charCount < (64-1)));
    
    //Add a terminal NULL to the notification string
    *bufPtr = 0;

    //Scan the notification string for an SMS received notification.
    //  If it's an SMS message, we'll get the slot number in 'slot'
    if (1 == sscanf(fonaNotificationBuffer, "+CMTI: " FONA_PREF_SMS_STORAGE ",%d", &slot)) {
      Serial.print("slot: "); Serial.println(slot);
    
      char callerIDbuffer[32];  //we'll store the SMS sender number in here
      
      // Retrieve SMS sender address/phone number.
      if (! fona.getSMSSender(slot, callerIDbuffer, 31)) {
        Serial.println("Didn't find SMS message in slot!");
      }
      Serial.print(F("FROM: ")); Serial.println(callerIDbuffer);

        // Retrieve SMS value.
        uint16_t smslen;
        if (fona.readSMS(slot, smsBuffer, 250, &smslen)) { // pass in buffer and max len!
          Serial.println("SMS stored");
        }
        
      // delete the original msg after it is processed
      //   otherwise, we will fill up all the slots
      //   and then we won't be able to receive SMS anymore
      if (fona.deleteSMS(slot)) {
        Serial.println(F("OK!"));
      } else {
        Serial.print(F("Couldn't delete SMS in slot ")); Serial.println(slot);
        fona.print(F("AT+CMGD=?\r\n"));
      }
    }
  //}
}

void loop() {
  goToSleep();
  if (sleep_count >= sleep_total){
    sleep_count = 0;
    char smsBuffer[250];
    char notifBuffer[64];
    bool AckRec = false;
    int trycount = 0;
    sendSMS(HOME_PHONE);
    memset(smsBuffer, NULL, sizeof(smsBuffer));
    while(fona.available()){ //Check for delay changes
        extractSMS(smsBuffer, notifBuffer);
        if (smsBuffer[0]=='T'){
          interval = atoi(&smsBuffer[2]);
          sleep_total = (interval*60)/8;
          Serial.print("New interval: ");
          Serial.println(interval);
        }
      }
    while((!(AckRec))&&(trycount<MAXTRIES)){
      delay(30000);
      memset(smsBuffer, NULL, sizeof(smsBuffer));
      while(fona.available()){
        extractSMS(smsBuffer, notifBuffer);
        if (smsBuffer[0]=='A'){
          AckRec = true;
          Serial.print("Ack Received");
        }else if (smsBuffer[0]=='T'){
          interval = atoi(&smsBuffer[2]);
          sleep_total = (interval*60)/8;
          Serial.print("New interval: ");
          Serial.println(interval);
        }
      }
      if (!(AckRec)){//Timed out without receiving an ack
        sendSMS(HOME_PHONE);
      }
      trycount+=1;
    }
  }
}

void goToSleep()   {
  set_sleep_mode(SLEEP_MODE_PWR_DOWN); // Set sleep mode.
  sleep_enable(); // Enable sleep mode.
  sleep_mode(); // Enter sleep mode.
  sleep_disable(); // Disable sleep mode after waking.
}

void watchdogOn() { 
  MCUSR = MCUSR & B11110111;
  WDTCSR = WDTCSR | B00011000; 
  WDTCSR = B00100001;
  WDTCSR = WDTCSR | B01000000;
  MCUSR = MCUSR & B11110111;
}

ISR(WDT_vect){
  sleep_count ++; 
}
