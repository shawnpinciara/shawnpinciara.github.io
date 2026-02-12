// =======================================================================
// MIDI Survivor - Refactored Code
// =======================================================================

// --- Game State Variables ---
let midiAccess = null;
let midiInput = null;
let isGameRunning = false;
let isGameOver = false;
let score = 0;
let spawnTimer = 0;

// --- Game Objects ---
let player;
let monsters = [];
let lasers = [];

// --- Audio Engine ---
let synth; // Will hold our synthesizer
let isAudioStarted = false;

// --- Game Constants ---
const MONSTER_BASE_SPEED = 0.5;
const MONSTER_SPAWN_RATE = 300; // Spawn rate in frames (higher = slower spawn)
const PLAYER_RADIUS = 20;
const MONSTER_RADIUS = 20;

// =======================================================================
// P5.js Main Functions (setup, draw)
// =======================================================================

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    // UI Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('midi-select').addEventListener('change', selectMidiInput);
    
    // Initialize MIDI and Game Objects
    initMidi();
    player = new Player();
    // synth will be created after user gesture in startGame()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    player.pos.set(width / 2, height / 2);
}

function draw() {
    background(20, 20, 30); // Dark blue background

    if (!isGameRunning) {
        // We are in the start screen or game over screen
        // The HTML overlay handles this. We don't need to draw anything here.
        return;
    }

    // --- Gameplay Loop ---
    player.draw();
    
    handleLasers();
    handleMonsters();
    handleTargetingAndAudio();
    
    // Apply LFO modulation to monster note
    if (synth && synth.currentBaseFreq > 0) {
        synth.modifyFreqWithLFO();
    }

    updateUI();
}

// =======================================================================
// Gameplay Loop Functions
// =======================================================================

function handleMonsters() {
    // 1. Spawn new monsters - spawn rate increases with score
    spawnTimer++;
    // Start with longer intervals, decrease slowly as score increases
    let currentSpawnRate = Math.max(80, MONSTER_SPAWN_RATE - Math.floor(score / 2) * 10);
    if (spawnTimer > currentSpawnRate) {
        monsters.push(new Monster());
        spawnTimer = 0;
    }

    // 2. Update and draw existing monsters
    for (let i = monsters.length - 1; i >= 0; i--) {
        let m = monsters[i];
        m.update(player);
        m.draw();

        // 3. Check for collision with player
        if (m.isColliding(player)) {
            player.takeHit();
            monsters.splice(i, 1); // Remove monster
            if (player.lives <= 0) {
                gameOver();
            }
        }
    }
}

function handleLasers() {
    for (let i = lasers.length - 1; i >= 0; i--) {
        let l = lasers[i];
        l.update();
        l.draw();
        if (l.isDone()) {
            lasers.splice(i, 1);
        }
    }
}

function handleTargetingAndAudio() {
    if (!synth) return; // Synth not yet initialized
    
    let closest = findClosestMonster();
    
    if (closest.monster) {
        // Set this monster as the official target
        monsters.forEach(m => m.isTarget = false);
        closest.monster.isTarget = true;
        
        // Update sound timer and play note every 2 seconds
        const currentTime = millis();
        if (currentTime - closest.monster.lastSoundTime >= closest.monster.soundInterval) {
            synth.playNote(closest.monster.note, closest.monster);
            closest.monster.lastSoundTime = currentTime;
        }
    } else {
        // No monsters left, turn off sound
        synth.stopNote();
        monsters.forEach(m => m.isTarget = false);
    }
}

function updateUI() {
    fill(255);
    textSize(24);
    textAlign(RIGHT, TOP);
    text(`Lives: ${player.lives}`, width - 20, 20);
    text(`Score: ${score}`, width - 20, 50);
}


// =======================================================================
// Classes (Player, Monster, Laser, Synth)
// =======================================================================

class Player {
    constructor() {
        this.pos = createVector(width / 2, height / 2);
        this.radius = PLAYER_RADIUS;
        this.lives = 3;
        this.shakeTimer = 0; // For shake animation when wrong note
        this.shakeDuration = 150; // ms
    }

    draw() {
        push();
        // Apply shake offset if active
        let shakeX = 0, shakeY = 0;
        if (this.shakeTimer > 0) {
            shakeX = random(-5, 5);
            shakeY = random(-5, 5);
        }
        translate(this.pos.x + shakeX, this.pos.y + shakeY);
        fill(100, 255, 100);
        noStroke();
        ellipse(0, 0, this.radius * 2);
        pop();
        
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
        }
    }
    
    takeHit() {
        this.lives--;
    }
    
    startShake() {
        this.shakeTimer = this.shakeDuration;
    }
}

class Monster {
    constructor() {
        // Spawn at the edge of screen (on the border)
        const angle = random(TWO_PI);
        const radius = max(width, height) * 0.5;
        this.pos = createVector(width / 2 + cos(angle) * radius, height / 2 + sin(angle) * radius);
        
        // Assign a unique MIDI note (C4 to B4) - 12 semitones
        // Make sure no other active monster has this note
        let newNote;
        let usedNotes = monsters.map(m => m.note);
        do {
            newNote = 60 + floor(random(12)); // 60-71 (C4 to B4)
        } while (usedNotes.includes(newNote));
        this.note = newNote;
        
        // Speed increases significantly with score
        const speedMultiplier = 1 + (score * 0.15);
        this.speed = MONSTER_BASE_SPEED + random(0.3) * speedMultiplier;
        
        this.radius = MONSTER_RADIUS;
        this.isTarget = false;
        
        // Sound timer: track when to play the next note
        // Repeat every 2 seconds
        this.soundInterval = 2000; // milliseconds (2 seconds)
        this.lastSoundTime = millis();
    }

    update(player) {
        const dir = p5.Vector.sub(player.pos, this.pos).normalize();
        this.pos.add(dir.mult(this.speed));
    }

    draw() {
        // Main body
        fill(255, 100, 100);
        stroke(200, 0, 0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);

        // Draw focus ring if this is the target
        if (this.isTarget) {
            noFill();
            stroke(255, 255, 0);
            strokeWeight(3);
            ellipse(this.pos.x, this.pos.y, this.radius * 3);
        }
    }
    
    isColliding(player) {
        return dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < this.radius + player.radius;
    }
}

class Laser {
    constructor(startPos, endPos) {
        this.start = startPos.copy();
        this.end = endPos.copy();
        this.life = 20; // lasts for 20 frames
    }
    
    update() {
        this.life--;
    }
    
    draw() {
        const alpha = map(this.life, 0, 20, 0, 255);
        stroke(0, 255, 255, alpha);
        strokeWeight(5);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }
    
    isDone() {
        return this.life <= 0;
    }
}

class Synth {
    constructor() {
        // Monster note oscillator with envelope
        this.osc = new p5.Oscillator('sine');
        this.oscAmp = new p5.Envelope();
        this.oscAmp.setADSR(0, 0.3, 0.6, 1.5);
        this.oscAmp.setRange(0.3, 0);
        this.oscAmp.setInput(this.osc);
        this.osc.start();
        
        // LFO for monster note vibrato
        this.lfo = new p5.Oscillator('sine');
        this.lfo.freq(5); // 5 Hz vibrato
        this.lfo.amp(20); // Depth in Hz
        this.lfo.start();
        this.currentBaseFreq = 0;
        
        // Beep oscillator for MIDI feedback
        this.beepOsc = new p5.Oscillator('sine');
        this.beepEnv = new p5.Envelope();
        this.beepEnv.setADSR(0.02, 0.1, 0, 1.0); // Release: 1 second
        this.beepEnv.setRange(0.2, 0);
        this.beepEnv.setInput(this.beepOsc);
        this.beepOsc.start();
        
        this.currentNote = -1;
    }
    
    playNote(midiNote, monster) {
        if (!isAudioStarted) return;
        
        this.currentBaseFreq = midiToFreq(midiNote);
        this.osc.freq(this.currentBaseFreq, 0.05);
        this.oscAmp.play();
    }
    
    modifyFreqWithLFO() {
        // Modulate frequency with LFO using sine wave
        if (this.currentBaseFreq > 0) {
            const t = millis() / 1000.0;
            const lfoValue = Math.sin(t * 2 * Math.PI * 5) * 20; // 5 Hz LFO with 20Hz depth
            const modulatedFreq = this.currentBaseFreq + lfoValue;
            this.osc.freq(modulatedFreq);
        }
    }

    playBeep(midiNote) {
        if (!isAudioStarted) return;
        
        const freq = midiToFreq(midiNote);
        this.beepOsc.freq(freq, 0.02);
        this.beepEnv.play();
    }

    stopNote() {
        // Envelope will handle the release
    }
}


// =======================================================================
// MIDI Handling
// =======================================================================

async function initMidi() {
    try {
        midiAccess = await navigator.requestMIDIAccess();
        populateMidiInputs();
        midiAccess.onstatechange = populateMidiInputs; // Listen for device changes
    } catch (err) {
        console.error("MIDI Access Failed:", err);
        alert("MIDI access failed. Please use a browser that supports Web MIDI (like Chrome).");
    }
}

function populateMidiInputs() {
    const select = document.getElementById('midi-select');
    select.innerHTML = '<option value="">Select MIDI Input...</option>';
    if (midiAccess && midiAccess.inputs.size > 0) {
        for (let input of midiAccess.inputs.values()) {
            let opt = document.createElement('option');
            opt.value = input.id;
            opt.text = input.name;
            select.appendChild(opt);
        }
    }
}

function selectMidiInput() {
    const id = this.value;
    if (midiInput) {
        midiInput.onmidimessage = null; // Remove listener from old device
    }
    if (id && midiAccess) {
        midiInput = midiAccess.inputs.get(id);
        if (midiInput) {
            midiInput.onmidimessage = handleMidiMessage;
            document.getElementById('start-btn').disabled = false;
        }
    } else {
        document.getElementById('start-btn').disabled = true;
    }
}

function handleMidiMessage(event) {
    if (!isGameRunning) return;

    const command = event.data[0] & 0xF0; // Note On/Off
    const note = event.data[1];
    const velocity = event.data[2];

    if (command === 144 && velocity > 0) { // Note On
        checkHit(note);
    }
}

function checkHit(note) {
    if (!synth) return; // Audio not yet initialized
    
    const target = monsters.find(m => m.isTarget);

    // Always play beep feedback for the pressed note
    synth.playBeep(note);

    if (target) {
        if (target.note === note) {
            // HIT!
            score++;
            console.log(`✓ HIT! Pressed MIDI ${note}, matched with monster note ${target.note}. Score: ${score}`);
            
            // Fire a laser for visual effect
            lasers.push(new Laser(player.pos, target.pos));

            // Remove the monster
            monsters = monsters.filter(m => m !== target);
            
            // Stop the current note; the loop will find the next target
            synth.stopNote();
        } else {
            // Wrong note - shake the player
            console.log(`✗ MISS! Pressed MIDI ${note}, target needs MIDI ${target.note}`);
            player.startShake();
        }
    }
}

// =======================================================================
// Game Control & Utility Functions
// =======================================================================

function startGame() {
    // Audio can only be started by a user gesture
    if (!isAudioStarted) {
        userStartAudio();
        isAudioStarted = true;
        // Create synth after audio context is active
        synth = new Synth();
    }
    
    // Reset state
    score = 0;
    player.lives = 3;
    monsters = [];
    lasers = [];
    spawnTimer = 0;
    isGameRunning = true;
    isGameOver = false;

    // Show/hide UI
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
}

function gameOver() {
    isGameRunning = false;
    isGameOver = true;
    if (synth) synth.stopNote();
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over-screen').classList.remove('hidden');
}

function resetGame() {
    gameOver(); // Go to game over screen to hide canvas elements
    startGame(); // Then immediately start a new game
}

function findClosestMonster() {
    let closestDist = Infinity;
    let closestMonster = null;

    for (const m of monsters) {
        const d = dist(player.pos.x, player.pos.y, m.pos.x, m.pos.y);
        if (d < closestDist) {
            closestDist = d;
            closestMonster = m;
        }
    }
    return { monster: closestMonster, distance: closestDist };
}

function getNoteName(note) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(note / 12) - 1;
    return noteNames[note % 12] + octave;
}