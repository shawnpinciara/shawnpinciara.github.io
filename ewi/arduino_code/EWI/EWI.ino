#include <BLEMIDI_Transport.h>
#include <hardware/BLEMIDI_ESP32.h>
#include <Wire.h>
#include "Adafruit_MPR121.h"

//LINUX port:
//sudo chmod 0777 /dev/ttyACM0

//PINS:
//LEFT HAND: near:  15 - 2 - 4 - 32
//RIGHT HAND: near: 12 - 14 - 27 - 33


//binary no midi note map es: binary:0001 -> decimal: 1 -->note: D (1 in midi value)
const int noteArray[16] = {0,2,11,4,12,9,5,7,1,3,0,0,16,10,6,8};
// int noteIndex[] = {1,3,12,5,1,10,6,8,2,4,0,0,5,11,7,9};
char scale[] = {'C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B'};
// boolean ottavaSopra = false;
int octave = 5;
int velocity = 127;
int threshold = 30;
uint8_t currentNote = 0;
uint8_t lastNote = 120;
uint8_t mpr121 = 0;
Adafruit_MPR121 mpr = Adafruit_MPR121();
BLEMIDI_CREATE_INSTANCE("EWI",MIDI);


void setup() {
  // put your setup code here, to run once:
  MIDI.begin(10);
  Serial.begin(115200);

  //MPR121 setup
  while (!Serial) { // needed to keep leonardo/micro from starting too fast!
    delay(10);
  }
  Serial.println("Adafruit MPR121 Capacitive Touch sensor test"); 
  // Default address is 0x5A, if tied to 3.3V its 0x5B
  // If tied to SDA its 0x5C and if SCL then 0x5D
  if (!mpr.begin(0x5A)) {
    Serial.println("MPR121 not found, check wiring?");
    while (1);
  }
  Serial.println("MPR121 found!");
}

void loop() {

  currentNote = mpr.touched(); //nota corrente cioè lavore letto dal sensore
  if (currentNote != lastNote) { //se il valore letto da sensore è diverso da quello letto in precedenza
    //fai smettere di suonare la nota precedente (perchè siamo in monofonia)
    MIDI.sendNoteOff((octave*12)+noteArray[lastNote],velocity,1);
    //aggiorna valore di nota precedente
    lastNote = currentNote;
    //inizia a suonare la nota premuta
    MIDI.sendNoteOn((octave*12)+noteArray[currentNote], velocity, 1);  // Send a MIDI note 
    Serial.println(scale[currentNote]); //log
  }
  //delay(500);
    
}
