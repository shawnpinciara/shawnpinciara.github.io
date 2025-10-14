#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

void setup() {
    // 57600 is the default connection speed used in the JavaScript library.
    Serial.begin(57600);
}

void loop() {
  WebSerial.send("event-with-number", 100);
}