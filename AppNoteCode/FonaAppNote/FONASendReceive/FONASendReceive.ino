#include "Adafruit_FONA.h"
#include <SoftwareSerial.h>

#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4
#define PINNUMBER ""

SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

Adafruit_FONA fona = Adafruit_FONA(FONA_RST);

void setup() {
  Serial.begin(115200);
  while (!Serial) {} // wait for serial port to connect
  
  fonaSerial->begin(4800);
  if (! fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  fonaSerial->print("AT+CNMI=2,1\r\n");
}

void loop() {
  char notifBuffer[64];
  char smsBuffer[250];
  char callerIDBuffer[32];
  char* bufPtr = notifBuffer;
  if(fona.available()){
    int slot = 0;
    int charCount = 0;
    
    do  {//Copy notification into buffer
      *bufPtr = fona.read();
      Serial.write(*bufPtr);
      delay(1);
    } while ((*bufPtr++ != '\n') && (fona.available()) && (++charCount < (sizeof(notifBuffer)-1)));

    *bufPtr = 0;

    if (1 == sscanf(notifBuffer, "+CMTI: " FONA_PREF_SMS_STORAGE ",%d", &slot)) {//Look for SMS received message
      int smslen = 0;
      fona.getSMSSender(slot, callerIDBuffer, 31); //Get Sender's Phone Number
      fona.readSMS(slot, smsBuffer, 250, &smslen); //Get Message Contents
      fona.sendSMS(callerIDBuffer, "Got your message!"); //Reply to Sender
      fona.deleteSMS(slot); //Delete Message

      Serial.print("Message length: ");
      Serial.println(smslen); 
      Serial.println(smsBuffer);
      Serial.print("From:");
      Serial.println(callerIDBuffer);
    }
  }
}
