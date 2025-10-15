#include <Modulino.h>

// Create object instance
ModulinoThermo thermo;
ModulinoKnob knob;


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

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
  // Read temperature in Celsius from the sensor
  float sensorTemp = thermo.getTemperature();
  // Read humidity percentage from the sensor
  float humidity = thermo.getHumidity();
  // Get the current position value of the knob
  int position = knob.get();

  

  Serial.print("Temperature: ");
  Serial.print(sensorTemp);
  Serial.print(", Setpoint: ");
  Serial.print(setPoint + position);
  Serial.print(", Knob: ");
  Serial.print(position);
  if (sensorTemp < setPoint + position - hysteresis ) { //accendi luce e scalda
    analogWrite(11,100);
    Serial.print("!!! WARMING UP !!!");
  } else if (sensorTemp > setPoint + position +hysteresis ) {
    analogWrite(11,0);
    Serial.print("!!! COOLING DOWN!!!");
  }
  Serial.println();

  delay(50);




}
