#include "Adafruit_FONA.h"
#include <SoftwareSerial.h>

#define FONA_RX 2
#define FONA_TX 3
#define FONA_RST 4

// this is a large buffer for replies
char replybuffer[255];

SoftwareSerial fonaSS = SoftwareSerial(FONA_TX, FONA_RX);
SoftwareSerial *fonaSerial = &fonaSS;

Adafruit_FONA fona = Adafruit_FONA(FONA_RST);


// Privacy
# define HOME_TO_HOME 0x0 // for testing (future development?)
# define SIGNAL1 0x1 // sgnal to specific remote station
# define BROADCAST 0xF // signal to all stations

// Operation Code
# define REQUEST_DATA 0x0 // get data from remote -- temperature, humidity...
# define REQUEST_COND 0x1 // get condition from remote -- battery supply 1, battery supply 2, borken component
# define CHANGE_SENSE_METHOD 0x2 // single poll upon request, minutely poll
# define REMOTE_ECHO 0x3 // get id of all remotes
# define REMOTE_SHUTDOWN 0xf// shut down remote (do we need this?)

//ACK
# define NACK = 0; // the message is not an echo specifying message is received
# define ACK 1;

// Base station Communication Guideline:
// csv line:
//  --Request ID, Privacy, Remote ID, ACK, Operation, Information\n
// Request ID: each request initiated by base station will have its own id (response to each request id will only be processed once): 4 bytes (allows repetition if requests are sufficiently far apart in time)
// Operation: defines what the remote stations(s) must do: 1 byte (only 16 operations currently, right?)
// Information: Provide information specific to the operation (if necessary): Permit 8 byte of information:

// size: 4+1+8 = 13 bytes -> set to 16 bytes
# define REQUEST_ID_SIZE 4
# define OPERATION_SIZE 1
# define INFORMATION_SIZE 8
# define BUFFER_SIZE REQUEST_ID_SIZE+OPERATION_SIZE+INFORMATION_SIZE
# define INT_PIN 6
char* buffer;
char* cpy_ptr;
int rid = 0;
char request_id[REQUEST_ID_SIZE], operation, information[8];
int delay_time;

void printStr() { // testing
  Serial.println("Interrupted");
}

void getNewDelayTime() {
  delay_time = 1000;
}

void setup() {
  // put your setup code here, tfo run once:
  Serial.begin(1152000);

  fonaSerial->begin(4800);
  if (!fona.begin(*fonaSerial)) {
    Serial.println(F("Couldn't find FONA"));
    while (1);
  }
  Serial.println("Found Fona");
  Serial.print("Module IMEI: ");
  char imei[16]; 
  fona.getIMEI(imei);
  Serial.println(imei);
  
  buffer = (char*) malloc (BUFFER_SIZE * sizeof(char));
  pinMode(INT_PIN, INPUT_PULLUP);
  // unattach interrupt from pin
  attachInterrupt(digitalPinToInterrupt(INT_PIN), printStr, FALLING);
  delay_time = 1000;
  rid = 0;
}

void loop() {
  int i;
  // make sure ISR does not affect this!
  delay(delay_time);

  memset(buffer, 0, BUFFER_SIZE);

  // echo test
  
  for(i = REQUEST_ID_SIZE - 1; i >= 0; i--) {
    request_id[i] = (rid >> (sizeof(char) * i)) & 0xFF;
  }
  operation = REMOTE_ECHO;
  memset(information, 0, INFORMATION_SIZE);
  
  
  cpy_ptr = buffer;
  strncpy(cpy_ptr, (char*)&request_id, REQUEST_ID_SIZE); // int to ptr?
  cpy_ptr += REQUEST_ID_SIZE;
  strncpy(cpy_ptr, (char*)&operation, OPERATION_SIZE);
  cpy_ptr += OPERATION_SIZE;
  strncpy(cpy_ptr, (char*)&information, INFORMATION_SIZE);
  cpy_ptr += INFORMATION_SIZE;

  char sendto[21] = "123456789";
  fona.sendSMS(sendto, buffer);
//  fona.sendSMS(sendto, "Hello WOrld!");

  //wait for response
  rid++; // modulus if overflow
}
