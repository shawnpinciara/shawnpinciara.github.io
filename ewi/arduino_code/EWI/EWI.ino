#include <BLEMIDI_Transport.h>
#include <hardware/BLEMIDI_ESP32.h>
//sudo chmod 0777 /dev/ttyACM0
//LEFT HAND: near:  15 - 2 - 4 - 32
//RIGHT HAND: near: 12 - 14 - 27 - 33
byte nota =  0b00000000;
byte chiave = 0b00000000;
byte mask1 = 0b00001000;
byte mask2 = 0b00000100;
byte mask3 = 0b00000010;
byte mask4 = 0b00000001;
// char note[] = {'C','D','B','E','C','A','F','G','C#','D#','U','U','E','A#','F#','G#'};
int noteIndex[] = {0,1,11,4,12,9,5,7,2,3,0,0,16,10,6,8};
// int noteIndex[] = {1,3,12,5,1,10,6,8,2,4,0,0,5,11,7,9};
char scale[] = {'C','C#','D','D#','E','F','F#','G','G#','A','A#','B','C','C#','D','D#','E','F','F#','G','G#','A','A#','B'};
boolean ottavaSopra = false;
int octave = 6;
int velocity = 127;
const int numButtons = 8;  // The number of touch buttons you have
const int buttonPins[numButtons] = { 15 ,2 , 4 , 32 , 12 , 14 , 27 , 33};  // The pins of the touch buttons
const int midiNotes[numButtons] = { 60, 62, 64, 65 , 60+12, 62+12, 64+12, 65+12 };  // The MIDI notes to send when a button is pressed
volatile bool buttonStates[numButtons] = { false ,false ,false ,false,false ,false ,false ,false };  // Initialize all buttons to be off
volatile int currentNota = 0;
int threshold = 25;

BLEMIDI_CREATE_INSTANCE("EWI",MIDI);

void pressSxButton1() {
  nota = nota | mask1; 
  MIDI.sendNoteOn(scale[noteIndex[int(nota)]+noteIndex[int(chiave)]-2]+octave, velocity, 1);  // Send a MIDI note on message
}

void releaseSxButton1() {
  nota = nota & mask1; 
  MIDI.sendNoteOn(scale[noteIndex[int(nota)]+noteIndex[int(chiave)]-2]+octave, velocity, 1);  // Send a MIDI note on message
}

void pressSxButton2() {
  nota = nota | mask3; 
  MIDI.sendNoteOn(scale[noteIndex[int(nota)]+noteIndex[int(chiave)]-2]+octave, velocity, 1);  // Send a MIDI note on message
}

void pressSxButton3() {
  nota = nota | mask2; 
  MIDI.sendNoteOn(scale[noteIndex[int(nota)]+noteIndex[int(chiave)]-2]+octave, velocity, 1);  // Send a MIDI note on message
}

void pressSxButton4() {
  nota = nota | mask1; 
  MIDI.sendNoteOn(scale[noteIndex[int(nota)]+noteIndex[int(chiave)]-2]+octave, velocity, 1);  // Send a MIDI note on message
}

void setup() {
  // put your setup code here, to run once:
  MIDI.begin(10);
  Serial.begin(9600);
  // attachInterrupt(digitalPinToInterrupt(touchRead(32)), pressSxButton1, RISING);
  // attachInterrupt(digitalPinToInterrupt(touchRead(32)), releaseSxButton1, FALLING);
  // attachInterrupt(digitalPinToInterrupt(touchRead(4)), pressSxButton2, RISING);
  // attachInterrupt(digitalPinToInterrupt(touchRead(2)), pressSxButton3, RISING);
  // attachInterrupt(digitalPinToInterrupt(touchRead(15)), pressSxButton4, RISING);

}

void loop() {
  // put your main code here, to run repeatedly:
    int touchValue = touchRead(32);
    if (touchValue < threshold) {  // If the button is pressed
      if (!buttonStates[0]) {  // If the button state has changed to on
        buttonStates[0] = true;  // Update the button state
        // MIDI.sendNoteOn(midiNotes[buttonIndex], 127, 1);  // Send a MIDI note on message
        nota = nota | mask4; 
        MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
        MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
        currentNota = noteIndex[int(nota)]+octave*12;
      }
    }
    else {  // If the button is released
      if (buttonStates[0]) {  // If the button state has changed to off
        buttonStates[0] = false;  // Update the button state
        nota = nota - mask4; 
        MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
        MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
        currentNota = noteIndex[int(nota)]+octave*12;
        
      }
    }
  touchValue = touchRead(4);
  if (touchValue < threshold) {  // If the button is pressed
      if (!buttonStates[1]) {  // If the button state has changed to on
        buttonStates[1] = true;  // Update the button state
        // MIDI.sendNoteOn(midiNotes[buttonIndex], 127, 1);  // Send a MIDI note on message
        nota = nota | mask3; 
        MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
        MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
        currentNota = noteIndex[int(nota)]+octave*12;
      }
    }
    else {  // If the button is released
      if (buttonStates[1]) {  // If the button state has changed to off
        buttonStates[1] = false;  // Update the button state
        nota = nota - mask3; 
        MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
        MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
        currentNota = noteIndex[int(nota)]+octave*12;
        
      }
    }
  touchValue = touchRead(2);
  if (touchValue < threshold) {  // If the button is pressed
        if (!buttonStates[2]) {  // If the button state has changed to on
          buttonStates[2] = true;  // Update the button state
          // MIDI.sendNoteOn(midiNotes[buttonIndex], 127, 1);  // Send a MIDI note on message
          nota = nota | mask2; 
          MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
          MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
          currentNota = noteIndex[int(nota)]+octave*12;
        }
      }
      else {  // If the button is released
        if (buttonStates[2]) {  // If the button state has changed to off
          buttonStates[2] = false;  // Update the button state
          nota = nota - mask2; 
          MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
          MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
          currentNota = noteIndex[int(nota)]+octave*12;
        
        }
      }
  touchValue = touchRead(14);
  if (touchValue < threshold) {  // If the button is pressed
        if (!buttonStates[3]) {  // If the button state has changed to on
          buttonStates[3] = true;  // Update the button state
          // MIDI.sendNoteOn(midiNotes[buttonIndex], 127, 1);  // Send a MIDI note on message
          nota = nota | mask1; 
          MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
          MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
          currentNota = noteIndex[int(nota)]+octave*12;
        }
      }
      else {  // If the button is released
        if (buttonStates[3]) {  // If the button state has changed to off
          buttonStates[3] = false;  // Update the button state
          nota = nota - mask1; 
          MIDI.sendNoteOff(currentNota, 127, 1);  // Send a MIDI note off message
          MIDI.sendNoteOn(noteIndex[int(nota)]+octave*12, velocity, 1);  // Send a MIDI note on message
          currentNota = noteIndex[int(nota)]+octave*12;
        
        }
      }
}
