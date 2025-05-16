import board
import busio
import digitalio
import usb_midi
import adafruit_midi

#https://github.com/diyelectromusic/sdemp/blob/main/src/SDEMP/CircuitPython/USBUARTMidiRouter.py
#https://docs.circuitpython.org/projects/midi/en/latest/api.html

from adafruit_midi.note_off import NoteOff
from adafruit_midi.note_on import NoteOn
from adafruit_midi.polyphonic_key_pressure import PolyphonicKeyPressure
from adafruit_midi.control_change import ControlChange
from adafruit_midi.program_change import ProgramChange
from adafruit_midi.channel_pressure import ChannelPressure
from adafruit_midi.pitch_bend import PitchBend
from adafruit_midi.midi_message import MIDIUnknownEvent

uart = busio.UART(tx=board.TX, rx=board.RX, baudrate=31250, timeout=0.001)
sermidi = adafruit_midi.MIDI(midi_in=uart, midi_out=uart)

print("start")
while True:
    msg = sermidi.receive()
    if (isinstance(msg, MIDIUnknownEvent)):
        pass
    elif msg is not None:
        print(msg)
    else:
       pass