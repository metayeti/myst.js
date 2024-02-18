/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// init.js | Game initialization.

/*jshint esversion:9*/

const $canvas = document.getElementById('game');

//
// game object
//
const game = new myst.Game({
	canvasId: 'game',
	state: loadState,
	viewMode: 'center'
});

game.createFont = function() {
	// create a non-monospaced font by specifying widths for characters
	// it is safe to skip characters that have the same width as the
	// default character width
	this.font = new myst.Font({
		graphics: assets.preload.graphics.gamefont, // font graphics
		size: [12, 18], // default character width and height
		spacing: 3, // font spacing
		widths: { // character widths
			' ': 10, '!': 4, '"': 10, '#': 10, '$': 10, '%': 12, '&': 12,
			'\'': 4, '(': 6, ')': 6, '*': 8, '+': 10, ',': 4, '-': 8,
			'.': 4, '/': 8, '0': 10, '1': 6, '2': 10, '3': 10, '4': 10,
			'5': 10, '5': 10, '6': 10, '7': 10, '8': 10, '9': 10, ':': 4,
			';': 4, '<': 8, '=': 10, '>': 8, '?': 8, '@': 10, 'A': 10,
			'B': 10, 'C': 10, 'D': 10, 'E': 8, 'F': 8, 'G': 10, 'H': 10,
			'I': 2, 'J': 8, 'K': 10, 'L': 8, 'M': 12, 'N': 10, 'O': 10,
			'P': 10, 'Q': 10, 'R': 10, 'S': 10, 'T': 10, 'U': 10, 'V': 10,
			'W': 12, 'X': 10, 'Y': 10, 'Z': 10, '[': 8, '\\': 8, ']': 8,
			'^': 10, '_': 10, '`': 6, 'a': 8, 'b': 8, 'c': 8, 'd': 8,
			'e': 8, 'f': 8, 'g': 8, 'h': 8, 'i': 2, 'j': 4, 'k': 8,
			'l': 2, 'm': 10, 'n': 8, 'o': 8, 'p': 8, 'q': 8, 'r': 6,
			's': 8, 't': 6, 'u': 8, 'v': 8, 'w': 10, 'x': 10, 'y': 8,
			'z': 8, '{': 8, '|': 2, '}': 8, '~': 10
		}
	});
};

// key handler
const keyHandler = new myst.KeyInput();

// splash "press" effect
function canvasMDown(e) {
	$canvas.classList.add('pressed');
}

function canvasMUp(e) {
	$canvas.classList.remove('pressed');
}

$canvas.addEventListener('mousedown', canvasMDown);
window.addEventListener('mouseup', canvasMUp);

// run game on splash screen click
$canvas.addEventListener('click', () => {
	// prevent clicking multiple times
	if (game.getState()) { // if game has state it is already running
		return;
	}
	// darken screen
	document.body.querySelector('body > .darken').classList.add('active');
	$canvas.classList.add('active');
	// remove splash press listeners
	$canvas.removeEventListener('mousedown', canvasMDown);
	window.removeEventListener('mouseup', canvasMUp);
	// load the preload assets
	assets.preload = loader.load({
		assets: assets.preload,
		done: function() {
			// create the game font
			game.createFont();
			// we have all assets required for the loadscreen
			// run the game
			game.run();

// We will do some preprocessing sorcery here to determine if we're running a debug
// (local) version of the game. For release, we want the fancy intro to be displayed
// and for debug we want to skip it.

//? if (DEBUG) {

	// This is a debug build, so we can leave this code uncommented as-is, since we want to run it locally.
	// Trust the preprocessor to skip this block of code when building release.

			if (false) { // change this to "true" to skip intro locally, or to "false" to play it

				// load assets and move to game state immediately, skipping loadscreen
				assets.game = loader.load({
					assets: assets.game, // here we are converting an asset list to actual assets
					done: () => {
						// all done loading assets
						game.setState(titleState);
					}
				});
			
			}
			else {

				// play the loadscreen intro and wait until it's done
				loadState.doIntro().then(() => {
					// add a slight delay just for effect
					const delay = 1500;
					setTimeout(() => {
						// start loading the game assets
						assets.game = loader.load({
							assets: assets.game,
							done: () => {
								// play the loadscreen outro
								loadState.doOutro().then(() => {
									// done loading, allow input from the loadscree
									loadState.allowInput();
								});
							}
						});
					}, delay);
				});

			}


//? } else if (RELEASE) {

	// This is a release build

	// Because this is a release build and we do not wish this code to run locally,
	// we need to comment the code for local side to ignore it, but evaluate it as string expressions so it is
	// written literally in the (release) version.

	// Because this is a release build, the following 

			// play the loadscreen intro and wait until it's done
			//?= 'loadState.doIntro().then(() => {'
				// add a slight delay just for effect
				//?= 'const delay = 1500;'
				//?= 'setTimeout(() => {'
					// start loading the game assets
					//?= 'assets.game = loader.load({'
						//?= 'assets: assets.game,'
						//?= 'done: () => {'
							// play the loadscreen outro
							//?= 'loadState.doOutro().then(() => {'
								// all done loading, allow input from the loadscreen
								//?= 'loadState.allowInput();'
							//?= '});'
						//?= '}'
					//?= '});'
				//?= '}, delay);'
			//?= '});'

//? }

		}
	});
});

//? if (DEBUG) {

	// Comment or uncomment the following line to skip the splash for debug builds.
	//$canvas.click();

//? }