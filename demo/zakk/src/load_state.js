/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// load_state.js | Game load state.

/*jshint esversion:9*/

//
// load state
//
const loadState = new myst.State();

loadState.init = function() {
	this.gfx_scanlines = assets.preload.graphics.scanlines;

	function EmulatedConsole() {
		this.surface = new myst.Surface({ width: 420, height: 340 });
		this.textBuffer = [''];
		this.textQueue = [];
		this.currentLine = 0;
		this.cursor = {
			position: [0, 0], // cursor position on the virtual terminal
			show: true // alternates on and off for blinking
		};
		const cursorBlinkTimer = new myst.Timer(15);
		const textFeedTimer = new myst.Timer(3);
		this.redraw = function() {
			// clear the surface before redrawing
			this.surface.clear();
			// draw the text
			for (let i = 0; i < this.textBuffer.length; ++i) {
				this.surface.render.bmptext(game.font, this.textBuffer[i], 10, 10 + 25 * i);
			}
			// draw the cursor
			if (this.cursor.show) {
				const cursorXOffset = getBMPTextWidth(game.font, this.textBuffer[this.currentLine]);
				this.surface.render.rectFill(10 + cursorXOffset, 9 + 25 * this.currentLine, 9, 16, '#fff');
			}
		};
		this.update = function() {
			let stateChanged = false;
			// blink the cursor
			if (cursorBlinkTimer.run()) {
				this.cursor.show = !this.cursor.show;
				stateChanged = true;
			}
			// process the text buffer
			const textQueueSize = this.textQueue.length;
			if (textQueueSize > 0 && textFeedTimer.run()) {
				const nextChar = this.textQueue.shift();
				if (nextChar === '\n') {
					this.textBuffer.push('');
					this.currentLine += 1;
				}
				else {
					this.textBuffer[this.currentLine] += nextChar;
					this.cursor.show = true
					cursorBlinkTimer.reset();
				}
				stateChanged = true;
			}
			// issue a redraw when the state has changed
			if (stateChanged) {
				this.redraw();
			}
		};
		this.pushText = function(text) {
			this.textQueue.push(...Array.from(text));
		};
		this.isQueueEmpty = function() {
			return this.textQueue.length === 0;
		};
	}
	this.emulatedConsole = new EmulatedConsole();
	this.emulatedConsole.redraw();

	// disallow input until everything is loaded and 
	this.inputAllowed = false;
};

loadState.draw = function() {
	this.surface.clear();
	// draw the emulated console
	this.paint.surface(this.emulatedConsole.surface, 0, 0);
	// draw the cursor
	this.paint.bmptext(game.font, `v${GAME_VERSION}`, 414, 316, 0, 2);
	// draw scanlines
	this.paint.graphics(this.gfx_scanlines, 0, 0);
};

loadState.update = function() {
	this.emulatedConsole.update();
	if (this.inputAllowed) {
		let KeyEvent;
		while (keyEvent = keyHandler.pollEvent()) {
			if (keyEvent.type === keyHandler.KEYDOWN) {
				// proceed to titlescreen state
				game.setState(titleState);
			}
		}
	}
};

loadState.doIntro = function() {
	const listOfRandomThings = [
		'Acquiring hot sauce',
		'Communicating with UFOs',
		'Reticulating splines',
		'Mastering kung-fu',
		'Soldering CPU',
		'Powering up awesome',
		'Activating almonds',
		'Writing read-only memory',
		'Activating flux capacitor',
		'Staying hydrated',
		'Milking space cows',
		'Materializing success',
		'Integrating derivatives'
	];
	this.emulatedConsole.pushText('> HTML/5GW protected mode runtime\n\n');
	this.emulatedConsole.pushText('Loading system ... ok!\n');
	if (myst.getRandomInt(1, listOfRandomThings.length + 1) === 1) {
		this.emulatedConsole.pushText('Calculating meaning of life ... 42!\n');
	}
	else {
		const doingRandomThing = myst.choose(listOfRandomThings);
		this.emulatedConsole.pushText(`${doingRandomThing} ... ok!\n`);
	}
	this.emulatedConsole.pushText('Loading resources ... ');
	// wait until the intro finishes
	return waitUntil(() => this.emulatedConsole.isQueueEmpty());
};

loadState.doOutro = function() {
	this.emulatedConsole.pushText('all done!\n\n');
	this.emulatedConsole.pushText('----\n\n');
	this.emulatedConsole.pushText('PRESS ANY KEY');
	// wait until the outro finishes
	return waitUntil(() => this.emulatedConsole.isQueueEmpty());
};

loadState.allowInput = function() {
	this.inputAllowed = true;
	keyHandler.clear(); // clear key buffer
};
