/*
 * Created by: Ken Hidalgo
 * Code for the home station.
 * 
 * Home station waits for messages from remote stations.
 * Upon receiving a message it replys with an acknowledgment.
 * The received message is saved to a CSV file in the SD card and 
 * it is also relayed to the host computer via the Serial Port.
 * 
 * Home station can also update the polling frequency of remote stations
 * by sending each of them a message.
*/
#include "Adafruit_FONA.h"
#include <SPI.h>
#include <SD.h>
#include <SoftwareSerial.h>

//FONA Shield Pin Constants
#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

//SIM Card pin number (if any)
#define PINNUMBER ""

//Chipselect pin for data logging shield
#define CHIPSELECT 10

/** 
 * The phone numbers of the remote stations are saved here 
 * as a temporary workaround for polling frequency updates.
 * Ideally these would be pulled from the databases and sent
 * to the Arduino through the serial port, but we were experiencing
 * too many issues with that method.
 */ 
const char phonebook[][12] = {"17809944628", "17809944630"};
const int num_stations = 2;

//FONA object initialization
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
    Serial.println(F("Couldn't find FONA"));
    while(1);
  }

  if (!SD.begin(CHIPSELECT)) {
    Serial.println("Card failed, or not present");
    while(1);
  }
  
  fonaSerial->print("AT+CNMI=2,1\r\n"); //Makes FONA print SMS notification
  fileDump();
  clearSlots(); //Clear out any old messages so the station can continue receiving more
}

/**
 * Sends an acknowledgment message to the given phone number
 * For simplicity sake, acknowledgment message is a single character, A
 */
void ackSMS(char* PhoneNum){
    fona.sendSMS(PhoneNum, "A");
}

/**
 * Sends the freqSMS to the given phone number
 */
void changefreqSMS(char* PhoneNum, char* freqSMS){
    fona.sendSMS(PhoneNum, freqSMS);
}

/**
 * Extracts a received SMS message from the notification string.
 * Able to grab the message, sender's phone number, as well as date and time of received message.
 * Deletes the message once extracted.
 */
void extractSMS(char* smsBuffer, char* fonaNotificationBuffer, char* callerIDbuffer, char* date, char* smstime){      
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

  //Look through the notification buffer for a SMS received flag, only continue if it is there
  if (1 == sscanf(fonaNotificationBuffer, "+CMTI: " FONA_PREF_SMS_STORAGE ",%d", &slot)) {
    
    //Pass in appropriate buffers and max lengths
    fona.getSMSSender(slot, callerIDbuffer, 31);
    fona.getSMSDate(slot,date,9);
    fona.getSMSTime(slot,smstime,12);
    memset(smstime+8, 0, 3); //Remove the -24 or -12 from the end of time string
    uint16_t smslen;
    fona.readSMS(slot, smsBuffer, 100, &smslen);
    fona.deleteSMS(slot); //Remember to delete the message once done!
  }
}

void loop() {
  //Please note that larger buffer lengths may cause the system to run
  //out of memory and therefore malfunction
  char smsBuffer[100];
  char notifBuffer[64];
  char callerIDBuffer[32];
  char date[9];
  char smstime[12];
  delay(1000);
  if (fona.available()){
    memset(smsBuffer, 0, sizeof(smsBuffer)); //Clear out any old messages
    extractSMS(smsBuffer, notifBuffer, callerIDBuffer,date,smstime);
    if(smsBuffer[0]=='D'){//Data from a home station was received
      ackSMS(callerIDBuffer); //Send back an acknowledgement

      //Open up the CSV on the SD card and save the data string there
      File datafile = SD.open("datalog.csv", FILE_WRITE);
      if (datafile){
        datafile.print(callerIDBuffer);
        datafile.print(",");
        datafile.print(smsBuffer+2);
        datafile.print(",");
        datafile.print("\"");
        datafile.print(date);
        datafile.print(" ");
        datafile.print(smstime);
        datafile.println("\"");
        datafile.close();
      }
       //Print the data string to the Serial port in the required form
       Serial.print("?");
       Serial.print(callerIDBuffer+1);
       Serial.print(",");
       Serial.print(smsBuffer+2);
       Serial.print(",");
       Serial.print("\"");
       Serial.print(date);
       Serial.print(" ");
       Serial.print(smstime);
       Serial.print("\"");
       Serial.print("!");
       Serial.println("\n");
    }
  }
  if(Serial.available()){//Message from the host computer to update polling frequency
    String buffer;
    buffer = Serial.readStringUntil('\n');
    if (buffer[0]=='T'){
      int i;
      char arr[buffer.length()+1];
      buffer.toCharArray(arr, buffer.length()+1);
      for (i=0; i<num_stations; i++){
        changefreqSMS(phonebook[i], arr); 
      }
    }
  }
}   

/**
 * Opens up the CSV in the SD card and prints out the content to the serial port.
 */
void fileDump(){
  File datafile = SD.open("datalog.csv", FILE_READ);
   if (datafile) {
    while (datafile.available()) {
      String buffer;
      Serial.print("?");
      buffer = datafile.readStringUntil('\n');
      buffer[0]=' ';//Database doesn't like the "+" in front of phone numbers
      buffer.remove(buffer.length()-1);//Remove the newline character
      Serial.print(buffer);
      Serial.println("!");
    }
    datafile.close();
  }
}

/**
 * Clears out all SMS slots of FONA
 */
void clearSlots(){
  int i = 0;
  for (i=1; i<=50; i++){
    fona.deleteSMS(i); 
  }
}

