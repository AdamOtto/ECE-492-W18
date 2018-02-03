//#include <LowPower.h>

/* Src site
 * https://learn.adafruit.com/adafruit-data-logger-shield/using-the-real-time-clock-3
 *  
 */
 /* Lib site
  *  https://github.com/adafruit/Light-and-Temp-logger
  https://learn.adafruit.com/adafruit-data-logger-shield/using-the-real-time-clock-3 // mainly following this tutorial 
  */

//Libraries
#include <SPI.h>
#include <stdio.h>
#include <SD.h> 	//libary to let the SD talk to the card
#include <Wire.h>	//helps with i2c 
#include "RTClib.h" //This library is for chatting wit the real time clock

//Defining Constants 
#define LOG_INTERVAL 1000 //Time between sensor reading 1s
#define echo 1 // sends data to card and monitor can turn off by changing to 0
#define wait 0 // basically means you need to send a character to start the data logger 


//digital pins 
#define redPin 3  //this is the pin that we connect the red led on the shield the value will change 
#define greenPin 4 // again this is the pin that we connect the green led on the shield the value will change 


//analog pins 
#define photoPin 0 //analog for the CdS cell where its wired too 
#define tempPin  1 //analog input for TMP36


RTC_DS1307 RTC;

//global 
File datafile;
// pin 10 will be the chip select pin 
const int chipSelect = 10;

void error_checker (char * str)
{
	Serial.print(" error has occured: ");
	Serial.println(str);
	
	digitalWrite(redPin , HIGH);
	
	while(1);
}


void setup()
{
	Serial.begin(9600);
	
	Serial.print("Initializing SD card ");
	pinMode(10, OUTPUT);
	
	if( !SD.being(chipSelect) ){
		Serial.println("Sd card failed ");
		return;
	}
	Serial.println("Initialize");
	
	//creating the file 
	char filename[] ="LOGGER00.CSV";
	for(uint8_t i = 0; i <100;i++){
		//creating a file and increment int the value 01 --> 99
		filename[6] = i/10 + '0';
		filename[7] = i%10 + '0';
		
		if( !SD.exists(filename) ){
		datafile = SD.open(filename ,FILE_WRITE);
		break;
		}
	}
	
	if(! logfile) {
	error_checker("file couldnt be made");
	}
	
	//using the wire libary we check if the RTC is on
	//then start writing to file
	Wire.begin()
	if(!RTC.begin () )
	{
		logfile.println(" RTC failed");
	
	}
	//Example of how to write to the file
	logfile.println("millis,time,light,temp"); // this is writing to CSV file wit hthe headers millis,time,light,temp
	pinMode(redPin, OUTPUT );
	pinMode(greenPin, OUTPUT );
	//use logfile.print() to log data on to the csv file
	
	
}

