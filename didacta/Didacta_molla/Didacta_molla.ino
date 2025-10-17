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

const int buffer_peak_size = 30; 
int peak_buffer[buffer_peak_size];
int buffer_index = 0;
int sample_count = 0;
const int h_peak_buffer_size = 50;
const int PEAK_SENSITIVITY = 4; // Valore di sensibilità (da tarare)
int h_peak_buffer[h_peak_buffer_size];
int h_peak_buffer_index = 0;



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

  for (int i = 0; i < h_peak_buffer_size; i++) {
        h_peak_buffer[i] = 0;
    }
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


void updateHorizontalPeakBuffer(int sample) {
    h_peak_buffer[h_peak_buffer_index] = sample;
    h_peak_buffer_index++;

    if (h_peak_buffer_index >= h_peak_buffer_size) {
        h_peak_buffer_index = 0;
    }
}

int findHorizontalAverage() {
    long sum = 0;
    for (int i = 0; i < h_peak_buffer_size; i++) {
        sum += h_peak_buffer[i];
    }
    return (int)(sum / h_peak_buffer_size);
}

int findHorizontalMinPeak() {
    int min_peak = h_peak_buffer[0];
    for (int i = 1; i < h_peak_buffer_size; i++) {
        if (h_peak_buffer[i] < min_peak) {
            min_peak = h_peak_buffer[i];
        }
    }

    // Ritorna il picco solo se è significativamente sotto la media
    int avg = findHorizontalAverage();
    if (avg - min_peak > PEAK_SENSITIVITY) {
        return min_peak;
    }
    return 0; // Altrimenti ritorna 0
}

int findHorizontalMaxPeak() {
    int max_peak = h_peak_buffer[0];
    for (int i = 1; i < h_peak_buffer_size; i++) {
        if (h_peak_buffer[i] > max_peak) {
            max_peak = h_peak_buffer[i];
        }
    }

    // Ritorna il picco solo se è significativamente sopra la media
    int avg = findHorizontalAverage();
    if (max_peak - avg > PEAK_SENSITIVITY) {
        return max_peak;
    }
    return 0; // Altrimenti ritorna 0
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
    updateHorizontalPeakBuffer(measure);
    int h_min_p = findHorizontalMinPeak();
    if (h_min_p!=0) {
      //Serial.println("MIN PEAK");
      //Serial.println(h_min_p);
      WebSerial.send("h_min_peak", measure);
    }

    int h_max_p = findHorizontalMaxPeak();
    if (h_max_p!=0) {
      //Serial.println("MIN PEAK");
      //Serial.println(h_min_p);
      WebSerial.send("h_max_peak", measure);
    }
  }
  //delay(10);

}