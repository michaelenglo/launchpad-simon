var KEYS = ['c', 'd', 'e', 'f'];
var NOTE_DURATION = 1000;

// NoteBox
//
// Acts as an interface to the coloured note boxes on the page, exposing methods
// for playing audio, handling clicks,and enabling/disabling the note box.
function NoteBox(key, onClick) {
	// Create references to box element and audio element.
	var boxEl = document.getElementById(key);
	var audioEl = document.getElementById(key + '-audio');
	if (!boxEl) throw new Error('No NoteBox element with id' + key);
	if (!audioEl) throw new Error('No audio element with id' + key + '-audio');

	// When enabled, will call this.play() and this.onClick() when clicked.
	// Otherwise, clicking has no effect.
	var enabled = true;
	// Counter of how many play calls have been made without completing.
	// Ensures that consequent plays won't prematurely remove the active class.
	var playing = 0;

	this.key = key;
	this.onClick = onClick || function () {};

	// Plays the audio associated with this NoteBox
	this.play = function () {
		playing++;
		// Always play from the beginning of the file.
		audioEl.currentTime = 0;
		audioEl.play();

		// Set active class for NOTE_DURATION time
		boxEl.classList.add('active');
		setTimeout(function () {
			playing--
			if (!playing) {
				boxEl.classList.remove('active');
			}
		}, NOTE_DURATION)
	}

	// Enable this NoteBox
	this.enable = function () {
		enabled = true;
	}

	// Disable this NoteBox
	this.disable = function () {
		enabled = false;
	}

	// Call this NoteBox's clickHandler and play the note.
	this.clickHandler = function () {
		if (!enabled) return;

		this.onClick(this.key)
		this.play()
	}.bind(this)

	boxEl.addEventListener('mousedown', this.clickHandler);
}

// --------------------- NOTE RECORDER CLASS ---------------------
function NotesRecorder(length) {
	this.notesPressed =  [];
	this.length = length;
	
	this.push = note => {
		if (this.notesPressed.length === length) return;

		this.notesPressed.push(note);
	};

	// Generate a new copy of notesPressed
	this.getNotesPressed = () => this.notesPressed.map(note => note);
	
	this.isComplete = () => this.notesPressed.length === length;

	this.clear = () => {
		this.notesPressed = [];
	};
}

// --------------------- NOTE RECORDER CLASS END ---------------------


// Example usage of NoteBox.
//
// This will create a map from key strings (i.e. 'c') to NoteBox objects so that
// clicking the corresponding boxes on the page will play the NoteBox's audio.
// It will also demonstrate programmatically playing notes by calling play directly.
var notes = {};

KEYS.forEach(function (key) {
	notes[key] = new NoteBox(key);
});

// --------------------- SIMON GAME IMPLEMENTATION ---------------------

var gameOver = false;
var level = 5;
var notesRecorder;

while(!gameOver) {
	// Go to next level
	level++;

	notesRecorder = new NotesRecorder(level);

	// disable note box when the notes are being played
	Object.values(notes).forEach(noteBox => {
		noteBox.disable();
	});

	// select randomized notes with length === current level
	var notesPlayed = [];
	for(var i = 0; i < level; i++) {
		notesPlayed[i] = KEYS[Math.floor(Math.random() * KEYS.length)];
	}

	console.log(notesPlayed);
	gameOver = true;

	notesPlayed.forEach(function(key, i) {
		setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
	});

	setTimeout(() => {
		Object.values(notes).forEach(noteBox => {
			noteBox.enable();
			noteBox.onClick = key => {
				notesRecorder.push(key);
				return new Promise((resolve, reject) => notesRecorder.isComplete() ? resolve : reject);
			}
		})
		.then(() => {
			var notesPressed = notesRecorder.getNotesPressed();

			console.log(notesPressed);

			notesPlayed.forEach((note,i) => {
				if(notesPlayed[i] !== notesPressed[i]) {
					gameOver = true;
				}
			});
		})
		.catch(() => console.log('not done yet'));
	}, notesPlayed * NOTE_DURATION);
}

// --------------------- SIMON GAME IMPLEMENTATION END ---------------------

// KEYS.concat(KEYS.slice().reverse()).forEach(function(key, i) {
// 	setTimeout(notes[key].play.bind(null, key), i * NOTE_DURATION);
// });

// I have always wanted to be involved in local software development community, whether to be a mentor to people who are new to software development and/or to learn from a mentor myself. The good thing about Launch Pad is that there is a good mix of software newbies and veterans which enables me to both of my goals.