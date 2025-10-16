#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

#include <Modulino.h>

#include <elapsedMillis.h>
elapsedMillis timer; //declare global if you don't want it reset every time loop runs

// Create a ModulinoPixels object
ModulinoPixels leds;

ModulinoDistance distance;

// Create a ModulinoBuzzer object
ModulinoBuzzer buzzer;


void setup() {
    // 57600 is the default connection speed used in the JavaScript library.
  Serial.begin(57600);
  WebSerial.on("pixels", changeColor);
  WebSerial.on("rec_on", recOn);
  // Initialize Modulino I2C communication
  Modulino.begin();
  // Detect and connect to pixels module
  leds.begin();

  distance.begin();

  buzzer.begin();
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

void recOn(JSONVar val) {
    if (int(val)>100) { //rec on
        buzzer.tone(260, 500);
    } else { //rec off
        buzzer.tone(200, 500);
    }
}

const int buffer_peak_size = 30; 

int peak_buffer[buffer_peak_size];

int buffer_index = 0;

int sample_count = 0;

bool findPeak(int sample) {
    peak_buffer[buffer_index] = sample;
    buffer_index = (buffer_index + 1) % buffer_peak_size;
    if (sample_count < buffer_peak_size) {
        sample_count++;
        return false;
    }
    int center_index = (buffer_index - buffer_peak_size / 2 + buffer_peak_size) % buffer_peak_size;
    int center_value = peak_buffer[center_index];
    bool is_peak = true;
    for (int i = 0; i < buffer_peak_size; i++) {
        if (peak_buffer[i] > center_value) {
            is_peak = false;
            break; 
        }
    }
    return is_peak;
}


int i =0;

void loop() {
  WebSerial.check();

  if (distance.available()) {
    // Get the latest distance measurement in millimeters
    int measure = distance.get();
    //Serial.println(measure);
    WebSerial.send("event-from-arduino", measure);
    if(findPeak(measure)) {
      WebSerial.send("peak_found", measure);
    }
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