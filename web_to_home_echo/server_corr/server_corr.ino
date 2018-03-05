#define REQLEN 64
char reqbuf[REQLEN]; // keep the request char size under 64
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  memset(reqbuf, 0, REQLEN);
}

void loop() {
  // put your main code here, to run repeatedly
  if (Serial.available() > 0) {
    Serial.readBytesUntil('\n', reqbuf, REQLEN);
    Serial.print("Ack: ");
    Serial.print(reqbuf); // echo the received text
    Serial.print(" :Done\n");
    memset(reqbuf, 0, REQLEN);
  }
  delay(1000);
}
