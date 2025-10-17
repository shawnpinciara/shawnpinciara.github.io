#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

#include <Modulino.h>

// Create a ModulinoButtons object
ModulinoButtons buttons;

#include <elapsedMillis.h>
elapsedMillis timer; //declare global if you don't want it reset every time loop runs

// Create a ModulinoPixels object
ModulinoPixels leds;

#include "Arduino_LED_Matrix.h"
 
ArduinoLEDMatrix matrix;

const uint32_t felice[] = {
    0x19819,
    0x80000001,
    0x81f8000
};
const uint32_t cuore[] = {
    0x3184a444,
    0x44042081,
    0x100a0040
};

bool button_a = true;
bool button_b = true;
bool button_c = true;

void setup() {
    // 57600 is the default connection speed used in the JavaScript library.
  Serial.begin(57600);
  WebSerial.on("pixels", changeColor);
  // Initialize Modulino I2C communication
  Modulino.begin();
  // Detect and connect to pixels module
  leds.begin();
  matrix.begin();
  buttons.begin();
  // Turn on the LEDs above buttons A, B, and C
  buttons.setLeds(true, true, true);
  //Serial.begin(9600);
}

void changeColor(JSONVar val) {
  if (val==0) {
    matrix.loadFrame(cuore);

  } else {
    matrix.loadFrame(felice);
  }
}


int i =0;

void loop() {
  WebSerial.check();
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

  if (buttons.update()) {
    // You can use either index (0=A, 1=B, 2=C) or letter ('A', 'B', 'C') to check buttons
    // Below we use the letter-based method for better readability

    if (buttons.isPressed('A')) {
      Serial.println("Button A pressed!");
      button_a = !button_a;
      WebSerial.send("event-from-arduino", 40);
    } else if (buttons.isPressed("B")) {
      Serial.println("Button B pressed!");
      button_b = !button_b;
      WebSerial.send("event-from-arduino", 100);
    } else if (buttons.isPressed('C')) {
      Serial.println("Button C pressed!");
      button_c = !button_c;
      WebSerial.send("event-from-arduino", 230);
    }

    // Update the LEDs above buttons, depending on the variables value
    buttons.setLeds(button_a, button_b, button_c);
  }
}