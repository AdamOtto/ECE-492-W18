#define REQLEN 64

int n;
int y;
int m;
int d;
char* string;

char reqbuf[REQLEN]; // keep the request char size under 64
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  memset(reqbuf, 0, REQLEN);
  n = 0;
  d = 1;
  m = 1;
  y = 2000;
  string = (char*) malloc(100 * sizeof(char));
}

void loop() {
  // put your main code here, to run repeatedly
  Serial.print("\n");
  Serial.print("?");
//  Serial.print("\"Station1\",56,-114,-20,50,50,26.5,89,\"2018-02-13 14:34:55\""); // (9-arg sys) process date in Arduino
//  Serial.print("\"Station1\",56,-114,-20,50,50,26.5,89"); // (8-arg sys) process date in Nodejs
  Serial.print("\"Station");
  Serial.print(n);
  Serial.print("\",56,-114,-20,50,50,26.5,89"); // (8-arg sys) process date in Nodejs
  Serial.print("!");
  Serial.print("\n");
  n++;
  if (Serial.available() > 0){
    memset(string, 0, 100);
    Serial.readBytesUntil('\n', string, 100);
    Serial.print("\n");
    Serial.print("?");
    Serial.print("Minute: ");
    Serial.print(string);
    Serial.print("!");
    Serial.print("\n");
  }
  n = (n+1)%5;
  delay(5000);
}
