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
  //fona.enableNetworkTimeSync(true);
  //fonaSerial->print("AT&W\r\n");
  fileDump();
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

void extractSMS(char* smsBuffer, char* fonaNotificationBuffer, char* callerIDbuffer, char* date, char* smstime){      
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
      fona.getSMSDate(slot,date,9);
      fona.getSMSTime(slot,smstime,14);
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
}

void loop() {
  char smsBuffer[80];
  char notifBuffer[64];
  char callerIDBuffer[32];
  char date[9];
  char smstime[14];
  //smsBuffer[0]='0'; 
  delay(1000);
  if (fona.available()){
    memset(smsBuffer, 0, sizeof(smsBuffer));
    extractSMS(smsBuffer, notifBuffer, callerIDBuffer,date,smstime);
    //Send back a response
    if(smsBuffer[0]=='D'){
      //Serial.println("Received data, now sending ack...");
      ackSMS(callerIDBuffer);
      File datafile = SD.open("newlog.csv", FILE_WRITE);
      if (datafile){
        datafile.print(callerIDBuffer);
        datafile.print(",");
        datafile.print(smsBuffer+2);
        datafile.print(",");
        datafile.print(date);
        datafile.print(" ");
        datafile.println(smstime);
        datafile.close();
        //Serial.println(smsBuffer+2);
      }
     //Serial.print("?%s,%s!",callerIDBuffer,&smsBuffer[2]);
     Serial.print("?");
     Serial.print(callerIDBuffer);
     Serial.print(",");
     Serial.print(smsBuffer+2);
     Serial.print(",");
     Serial.print(date);
     Serial.print(" ");
     Serial.println(smstime);
     Serial.print("!");
     Serial.println("\n");
    }
  }
}   

void fileDump(){
  File datafile = SD.open("newlog.csv", FILE_READ);
  String buffer;
   if (datafile) {
    while (datafile.available()) {
      Serial.print("?");
      buffer = datafile.readStringUntil('\n');
      Serial.print(buffer);
      Serial.println("!");
    }
    datafile.close();
  }
}
