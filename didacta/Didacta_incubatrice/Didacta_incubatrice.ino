#include <Modulino.h>
#include <Edge.h>

Edge knobEdge = Edge(false,true);

#include <SimpleWebSerial.h>
SimpleWebSerial WebSerial;

#include <elapsedMillis.h>
elapsedMillis timer; //declare global if you don't want it reset every time loop runs


// Create object instance
ModulinoThermo thermo;
ModulinoKnob knob;

bool knob_state = true;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(57600);

  // Initialize Modulino I2C communication
  Modulino.begin();
  // Detect and connect to temperature/humidity sensor module
  thermo.begin();
  knob.begin();
  pinMode(11,OUTPUT);

}

int setPoint = 28;
float hysteresis = 0.25;

void loop() {
  WebSerial.check();
  // Read temperature in Celsius from the sensor
  float sensorTemp = thermo.getTemperature();
  // Read humidity percentage from the sensor
  float humidity = thermo.getHumidity();
  // Get the current position value of the knob
  int position = knob.getDirection();

  

  Serial.print("Temperature: ");
  Serial.print(sensorTemp);
  Serial.print(", Setpoint: ");
  Serial.print(setPoint);
  Serial.print(", Knob: ");
  Serial.print(position);
  Serial.print(", Histeresis: ");
  Serial.print(hysteresis);

  if (sensorTemp < setPoint + position - hysteresis ) { //accendi luce e scalda
    analogWrite(11,200);
    Serial.print("!!! WARMING UP !!!");
    WebSerial.send("light_state", 255);
  } else if (sensorTemp > setPoint + position +hysteresis ) {
    analogWrite(11,0);
    Serial.print("!!! COOLING DOWN!!!");
    WebSerial.send("light_state", 0);
  }
  Serial.println();
  if (knobEdge.update(knob.isPressed())==1) {
    Serial.println("Premuto");
    knob_state = !knob_state;
  } 

  if (knob_state) { //temperatura
    setPoint = setPoint + position;
  } else { //isteresi
    hysteresis = hysteresis + ((float)position *0.05);
  }

  WebSerial.send("temperature_setpoint", setPoint);
  WebSerial.send("hysteresis", hysteresis);
  WebSerial.send("temperature_sensor", sensorTemp);
  

  delay(50);




}
