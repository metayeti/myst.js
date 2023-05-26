/*
 *  Myst.js Example 08 - Key Input
 *
 */

// create a key input handler
let keyInputHandler = new myst.KeyInput();

// create the main state
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	this.strBuff = '';
	this.blinkTimer = new myst.Timer(30);
	this.showCaret = false;
	this.keyStates = {
		up: false,
		down: false,
		left: false,
		right: false,
		ctrl: false,
		shift: false,
		alt: false,
		enter: false
	};
};

// draw the screen
myState.draw = function() {
	this.surface.clear();
	this.paint.text('Type something!', 10, 14, '#555', 'left', 'bold 14px sans-serif');
	this.paint.rectFill(10, 40, 380, 1, '#555');
	let displayText = this.strBuff;
	if (this.showCaret)
		displayText += '_';
	this.paint.text(displayText, 10, 60);
	this.paint.text('UP key pressed:', 10, 120, '#292');
	this.paint.text((this.keyStates.up) ? 'YES' : 'NO', 130, 120, '#f22');
	this.paint.text('DOWN key pressed:', 10, 140, '#292');
	this.paint.text((this.keyStates.down) ? 'YES' : 'NO', 130, 140, '#f22');
	this.paint.text('LEFT key pressed:', 10, 160, '#292');
	this.paint.text((this.keyStates.left) ? 'YES' : 'NO', 130, 160, '#f22');
	this.paint.text('RIGHT key pressed:', 10, 180, '#292');
	this.paint.text((this.keyStates.right) ? 'YES' : 'NO', 130, 180, '#f22');
	this.paint.text('CTRL key pressed:', 10, 200, '#292');
	this.paint.text((this.keyStates.ctrl) ? 'YES' : 'NO', 130, 200, '#f22');
	this.paint.text('SHIFT key pressed:', 10, 220, '#292');
	this.paint.text((this.keyStates.shift) ? 'YES' : 'NO', 130, 220, '#f22');
	this.paint.text('ALT key pressed:', 10, 240, '#292');
	this.paint.text((this.keyStates.alt) ? 'YES' : 'NO', 130, 240, '#f22');
	this.paint.text('ENTER key pressed:', 10, 260, '#292');
	this.paint.text((this.keyStates.enter) ? 'YES' : 'NO', 130, 260, '#f22');
};

// update game
myState.update = function() {
	// intercept key events
	let keyEvent;
	while (keyEvent = keyInputHandler.pollEvent()) {
		let type = keyEvent.type;
		if (type === keyInputHandler.KEYDOWN) {
			let keycode = keyEvent.keycode;
			if (keyInputHandler.isAlphanumeric(keycode)) {
				let ascii = keyInputHandler.getCharacter(keycode);
				let character;
				if (keyInputHandler.isKeyDown(keyInputHandler.keyShift)) {
					character = ascii;
				}
				else {
					character = ascii.toLowerCase();
				}
				this.strBuff += character;
				if (this.strBuff.length > 30) {
					this.strBuff = this.strBuff.substring(1);
				}
			}
			else {
				switch (keycode) {
					case keyInputHandler.keyBackspace:
						this.strBuff = this.strBuff.slice(0, -1);
						break;
					case keyInputHandler.keySpace:
						this.strBuff += ' ';
						break;
				}
			}
			console.log('KEYDOWN: ' + keycode);
		}
		else if (type === keyInputHandler.KEYUP) {
			let keycode = keyEvent.keycode;
			console.log('KEYUP: ' + keycode);
		}
	}
	// track arrow key states
	this.keyStates.up = keyInputHandler.isKeyDown(keyInputHandler.keyUp);
	this.keyStates.down = keyInputHandler.isKeyDown(keyInputHandler.keyDown);
	this.keyStates.left = keyInputHandler.isKeyDown(keyInputHandler.keyLeft);
	this.keyStates.right = keyInputHandler.isKeyDown(keyInputHandler.keyRight);
	this.keyStates.ctrl = keyInputHandler.isKeyDown(keyInputHandler.keyControl);
	this.keyStates.shift = keyInputHandler.isKeyDown(keyInputHandler.keyShift);
	this.keyStates.alt = keyInputHandler.isKeyDown(keyInputHandler.keyAlt);
	this.keyStates.enter = keyInputHandler.isKeyDown(keyInputHandler.keyEnter);
	// run the blinking timer
	if (this.blinkTimer.run())
		this.showCaret = !this.showCaret; // flip caret state
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState // initial game state
});

// run the game on init
myGame.init = myGame.run;

// run game on window load
window.addEventListener('load', myGame.run);
