// mainly following the code on 
// https://github.com/dantudose/SM-PWM-01A
/* Src site
 *  http://www.amphenol-sensors.com/en/component/edocman/3-co2/4-co2-modules/194-sm-pwm-01a
 *  https://www.digikey.com/en/articles/techzone/2017/may/development-kit-simplifies-air-quality-sensor-system-design
 */
 /* Lib site
  *  https://github.com/Flowm/air-quality
  *  https://github.com/dantudose/SM-PWM-01A
  */
//Note the SM-PWM-01A is discontinued and is changed to the SM-PWM-01C

/*
// Pin1 - GND
// Pin2 - OUTPUT P2 particles > 2um - Micro digital pin 4
// Pin3 - 5V
// Pin4 - OUTPUT P1 particles ~ 1um - Micro digital pin 5
// Pin5 - NC
//
*/
 
//Libraries
#include "SMPWM01C.h"
#include "stdio.h"
#include "string.h"
#include Arduino.h

#define SMPWM01C_h

int SMPWM01C::state__var_1
int SMPWM01C::state_var_2

unsigned long SMPWM01C::start_var_1
unsigned long SMPWM01C::start_var_2

unsigned long SMPWM01C::low_pulse_var_1
unsigned long SMPWM01C::low_pulse_var_2

float SMPWM01C::concentration_var_1
float SMPWM01C::concentration_var_2

//Using interrupts to find the particle concentrations 

void SMPWM01C::begin( ){
		concentration_var_1 = 0;
		concentration_var_2 = 0;
		
		start_var_1 = HIGH 
		start_var_2 = HIGH
		
		/*
		  Need to figure out the pin's for the arduino uno when setting it up
		  // http://gammon.com.au/interrupts
		  PCMSK2 |= (1<<PCINT20);  // want pin  4
		  PCMSK2 |= (1<<PCINT21);  // want pin  5
		  PCIFR  |= (1<<PCIF2);   	// clear any outstanding interrupts
		  PCICR  |= (1<<PCIE2);   	// enable pin change interrupts for PD4 & PD5

		*/
		
		pinMode(P1,INPUT);
		pinMode(P2, INPUT);
		
}


void SMPWM01C::interrupt_read() {
		usigned long micro_time = micros();
		if(state__var_1 != digitalRead(P2))
		{	if((state__var_1 == digitalRead(P2) ) == LOW)
			{start_var_1 = micro_time; }
			else 
			{low_pulse_var_1 = low_pulse_var_1 + (micro_time - start_var_1) }
		}		
		if(state__var_2 != digitalRead(P1))
		{	if((state__var_2 == digitalRead(P1) ) == LOW)
			{start_var_2 = micro_time; }
			else 
			{low_pulse_var_2 = low_pulse_var_2 + (micro_time - start_var_2) }
		}
		
}

void SMPWM01C::interrupt_handler () {
	float ratio
	float concentration
	
	// calculating the concentrations 
	
	ratio = 0.1 * float(low_pulse_var_1) /float (4000ul);
	
	concentration = 1.1 *ratio*ratio*ratio - 3.8*ratio*ratio + 520*ratio;
	
	concentration_var_1 = (concentration + concentration_var_1*(2.0 - 1.0) )
	
	low_pulse_var_1 = 0;
	
	ratio = 0.1 * float(low_pulse_var_2) /float (4000ul);
	
	concentration = 1.1 *ratio*ratio*ratio - 3.8*ratio*ratio + 520*ratio;
	
	concentration_var_2 = (concentration + concentration_var_2*(2.0 - 1.0) )
	
	low_pulse_var_2 = 0;
}

float SMPWM01C::get_concentration_1(){
	return::concentration_var_1;
}

float SMPWM01C::get_concentration_2(){
	return::concentration_var_2;
}
