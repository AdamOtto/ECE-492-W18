/*
 * Created by: Ken Hidalgo
 * Code for the remote station using SMS
 * 
 * Remote stations poll their sensors and send the received data
 * to the home station once every defined period. (Default 1 minute)
 * Remote stations will resend their data at least two more times if
 * they do not receive an acknowledgment message within a 30 second window.
 * After receiving an acknowledgment, remote stations go to sleep
 * until it is time to send data again.
 * 
 * Remote stations polling frequency can be updated by receiving a message from
 * the home station.
*/
#include "DHT.h"
#include "Adafruit_FONA.h"
#include "SMPWM01A.h"
#include "SoftwareSerial.h" //Use the version included in this directory
#include <avr/sleep.h>

//FONA Shield Pin Constants
#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

//Temp/Hum Sensor Constants
#define DHTPIN 8     // Temp & Humid Sensor
#define DHTTYPE DHT22   // DHT 22 signal pin

//Home Station Phone Number
#define HOME_PHONE "+17809944626"
#define PINNUMBER "" //SIM card PIN number
#define MAXTRIES 2

//FONA object initialization
SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;
Adafruit_FONA fona = Adafruit_FONA(FONA_RST);

//Sensor object initialization
DHT dht(DHTPIN, DHTTYPE);
SMPWM01A dust;

//Global variables needed for sleep interrupts
volatile int interval = 1; //Interval in mins
volatile int sleep_total = (interval*60)/8; //Arduino sleeps for 8 seconds at a time, count is taken every time it wakes 
volatile int sleep_count = 0;

void setup() {
  watchdogOn();
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  dust.begin();
  
  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  fonaSerial->print("AT+CNMI=2,1\r\n"); //Makes FONA print SMS notification
  fona.enableGPS(true); //Turns on GPS locator
  //while(fona.available()){}
}

/**
 * Polls sensors for values and sends data string to given phone number
 **/
void sendSMS(char* Phone){
   //floating point variables to hold sensor values
    float hum;  
    float temp; 
    float dust2; 
    float dust10;
    float lat;
    float lon;
    uint16_t batt; 
  
    //character buffers for each value
    char h[11];
    char t[11];
    char d2[11];
    char d10[11];
    char lt[15];
    char ln[15];
    char b[11];
    
    delay(10000);//wait 10 seconds for sensors to stabilize
    
    //Update sensor values
    hum = dht.readHumidity();
    temp = dht.readTemperature();
    dust2 = dust.getPM2();
    dust10 = dust.getPM10();
    fona.getBattPercent(&batt);
    if(!(fona.getGPS(&lat, &lon))){//If no GPS signal default to University location
      lat = 53.523219;
      lon = -113.526319;
      Serial.print("Failed to get GPS");
    }
    
    //convert floating point values to strings
    dtostrf(hum, 10, 1, h);
    dtostrf(temp, 10, 1, t);
    dtostrf(dust2, 10, 4, d2);
    dtostrf(dust10, 10, 4, d10);
    dtostrf(lat, 14, 6, lt);
    dtostrf(lon, 14, 6, ln);
    dtostrf(batt, 10, 0, b);
    
    char txtmsg[100];
    //Package and Send
    snprintf(txtmsg, sizeof(txtmsg), "D,%s,%s,%s,%s,%s,%s,%s",lt,ln,t,d10,d2,h,b);
    fona.sendSMS(Phone, txtmsg);
}

/**
 * Extracts a received SMS message from the notification string.
 * Deletes the message once extracted.
 */
void extractSMS(char* smsBuffer, char* fonaNotificationBuffer){      
  char* bufPtr = fonaNotificationBuffer;
  int slot = 0;            
  int charCount = 0;

  //Read in the notification string
  do  {
    *bufPtr = fona.read();
    Serial.write(*bufPtr);
    delay(1);
  } while ((*bufPtr++ != '\n') && (fona.available()) && (++charCount < (64-1)));
    
  //Add a terminal NULL to the notification string
  *bufPtr = 0;

  //Read the notification string for a SMS received flag, only continue if it is there
  if (1 == sscanf(fonaNotificationBuffer, "+CMTI: " FONA_PREF_SMS_STORAGE ",%d", &slot)) {
    //pass in appropriate buffers and max lengths
    uint16_t smslen;
    fona.readSMS(slot, smsBuffer, 250, &smslen);
    fona.deleteSMS(slot);//Remember to delete the message once done!
  }
}

void loop() {
  goToSleep();
  if (sleep_count >= sleep_total){//Time to wake up!
    sleep_count = 0;
    char smsBuffer[250];
    char notifBuffer[64];
    bool AckRec = false;
    int trycount = 0;
    
    while(fona.available()){//check for interval changes
      memset(smsBuffer, NULL, sizeof(smsBuffer)); //Clear out any old messages
      extractSMS(smsBuffer, notifBuffer);
        if (smsBuffer[0]=='T'){//Interval change message from home station
          interval = atoi(&smsBuffer[2]);
          sleep_total = (interval*60)/8;
          Serial.print("New interval: ");
          Serial.println(interval);
        }
    }
    
    sendSMS(HOME_PHONE); //Poll sensors and send data
    
    while((!(AckRec))&&(trycount<MAXTRIES)){//Wait for acknowledgment or timeout
      delay(30000); //30 seconds between each resend
      memset(smsBuffer, NULL, sizeof(smsBuffer)); //Clear out any old messages
      while(fona.available()){
        extractSMS(smsBuffer, notifBuffer);
        if (smsBuffer[0]=='A'){
          AckRec = true;
          Serial.print("Ack Received");
        }else if (smsBuffer[0]=='T'){//Not an ack but a frequency update
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

/**
 * An Arduino Uno can only be put to sleep for about 8 seconds at a time.
 * To make it sleep for longer we make use of a watchdog timer that will increment
 * a count everytime the Arduino wakes.
 * 
 * The code for the sleep method and watchdog timer is taken from here:
 * //http://www.fiz-ix.com/2012/11/low-power-arduino-using-the-watchdog-timer/
 */
void goToSleep()   {
  set_sleep_mode(SLEEP_MODE_PWR_DOWN); // Set sleep mode.
  sleep_enable(); // Enable sleep mode.
  sleep_mode(); // Enter sleep mode.
  sleep_disable(); // Disable sleep mode after waking.
}

//Clears any reset flags and enable watchdog interrupt
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
