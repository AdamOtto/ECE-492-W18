#define REQLEN 64

int n;

char reqbuf[REQLEN]; // keep the request char size under 64
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  memset(reqbuf, 0, REQLEN);
  n = 0;
}

void loop() {
  // put your main code here, to run repeatedly
  Serial.print("?");
//  Serial.print("This is the ");
//  Serial.print(n);
//  Serial.print(" message.)
  Serial.print("Station1,56,-114,-20,50,2018 Feb 13 14:34:55");
  Serial.print("!");
  Serial.print("\n");
  n++;
  delay(1000);
}
