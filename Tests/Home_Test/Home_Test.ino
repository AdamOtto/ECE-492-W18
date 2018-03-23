/*
 * Created by: Ken Hidalgo
 * Code for testing the home station.
*/
#include "Adafruit_FONA.h"
#include <SPI.h>
#include <SD.h>

#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

// Constants
#define PINNUMBER "" //SIM card PIN number
#define CHIPSELECT 10

#include <SoftwareSerial.h>
SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

Adafruit_FONA fona = Adafruit_FONA(FONA_RST);

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    //Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  if (!SD.begin(CHIPSELECT)) {
    //Serial.println("Card failed, or not present");
    // don't do anything more:
    while(1);
  }
  fonaSerial->print("AT+CNMI=2,1\r\n");
}

void ackSMS(char* PhoneNum){
    char txtmsg[80];
    snprintf(txtmsg, sizeof(txtmsg), "A");
    fona.sendSMS(PhoneNum, txtmsg);
}

void changefreqSMS(char* PhoneNum, int newinterval){
    char txtmsg[80];
    snprintf(txtmsg, sizeof(txtmsg), "T,%d", newinterval);
    fona.sendSMS(PhoneNum, txtmsg);
}

void extractSMS(char* smsBuffer, char* fonaNotificationBuffer, char* callerIDbuffer){      
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
      //Serial.print("slot: "); Serial.println(slot);
    
      //char callerIDbuffer[32];  //we'll store the SMS sender number in here
      
      // Retrieve SMS sender address/phone number.
      if (! fona.getSMSSender(slot, callerIDbuffer, 31)) {
        //Serial.println("Didn't find SMS message in slot!");
      }
      //Serial.print(F("FROM: ")); Serial.println(callerIDbuffer);

        // Retrieve SMS value.
        uint16_t smslen;
        if (fona.readSMS(slot, smsBuffer, 80, &smslen)) { // pass in buffer and max len!
          //Serial.println("SMS stored");
        }
        
      // delete the original msg after it is processed
      //   otherwise, we will fill up all the slots
      //   and then we won't be able to receive SMS anymore
      if (fona.deleteSMS(slot)) {
        //Serial.println(F("OK!"));
      } else {
        //Serial.print(F("Couldn't delete SMS in slot ")); Serial.println(slot);
        fona.print(F("AT+CMGD=?\r\n"));
      }
    }
  //}
}

void loop() {
  char smsBuffer[80];
  char notifBuffer[64];
  char callerIDBuffer[32];
  //smsBuffer[0]='0'; 
  delay(1000);
  if (fona.available()){
    memset(smsBuffer, 0, sizeof(smsBuffer));
    extractSMS(smsBuffer, notifBuffer, callerIDBuffer);
    //Send back a response
    if(smsBuffer[0]=='D'){
      //Serial.println("Received data, now sending ack...");
      ackSMS(callerIDBuffer);
      File datafile = SD.open("mylog.csv", FILE_WRITE);
      if (datafile){
        datafile.println(smsBuffer);
        datafile.close();
        //Serial.println(smsBuffer);
      }
      Serial.println(smsBuffer);
    }
  }
}   
