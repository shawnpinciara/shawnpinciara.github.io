#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

#include <Modulino.h>

#include <elapsedMillis.h>
elapsedMillis timer; //declare global if you don't want it reset every time loop runs

// Create a ModulinoPixels object
ModulinoPixels leds;

ModulinoDistance distance;

void setup() {
    // 57600 is the default connection speed used in the JavaScript library.
  Serial.begin(57600);
  WebSerial.on("pixels", changeColor);
  // Initialize Modulino I2C communication
  Modulino.begin();
  // Detect and connect to pixels module
  leds.begin();

  distance.begin();
  //Serial.begin(9600);
}

void changeColor(JSONVar val) {
    for (int i = 0; i < 8; i++) {
      // Set each LED (index, color, brightness)
      // Available colors: RED, BLUE, GREEN, VIOLET, WHITE
      leds.set(i, BLUE, val);
      // Update the physical LEDs with new settings
      leds.show();
    }
}


int i =0;

void loop() {
  WebSerial.check();

  if (distance.available()) {
    // Get the latest distance measurement in millimeters
    int measure = distance.get();
    //Serial.println(measure);
    WebSerial.send("event-from-arduino", measure);
  }

  // if (timer>300) {
  //   timer=0;
  //   WebSerial.send("event-from-arduino", i);
  //   // Serial.print(i);
  //   // Serial.print(",");
  //   // Serial.print(200-i);
  //   // Serial.println();

  //   if (i>100) i=0;
  //   i++;
  // }
}