/*
 *  Myst.js Example 09 - Tween
 *
 */

function Button(state, options) {
	let self = this;

	let graphics = options.graphics;
	let width = 200;
	let height = 100;
	let tileNormal = [0, 0];
	let tilePressed = [1, 0];
	let x = Math.floor((state.surface.width - width) / 2);
	let y = Math.floor((state.surface.height - height) / 2);
	let pressed = false;
	let holding = false;
	let enabled = true;
	let angle = 0;

	this.enable = function() { enabled = true; };
	this.disable = function() { enabled = false; };
	this.setAngle = function(a) { angle = a; };

	this.draw = function() {
		if (angle !== 0) {
			// rotate around a central point
			let center = [Math.floor(x + width / 2), Math.floor(y + height / 2)];
			state.paint.rotate(angle, center);
		}
		// draw the button tile
		let tile = (pressed) ? tilePressed : tileNormal;
		state.paint.tile(graphics, x, y, width, height, tile[0] * width, tile[1] * height);
		if (angle !== 0) {
			// restore saved context from rotation
			state.paint.restore();
		}
	};

	// register button events	
	function pointInButton(coords) {
		return myst.pointInRect(coords[0], coords[1], x, y, width, height);
	}

	inputHandler.on('press', function(coords) {
		if (!enabled) {
			return;
		}
		if (pointInButton(coords)) {
			holding = pressed = true;
		}
	}).bindTo(state);
	inputHandler.on('move', function(coords) {
		if (holding && enabled) {
			let prevPressed = pressed;
			let nextPressed = pointInButton(coords);
			if (prevPressed !== nextPressed) {
				pressed = nextPressed;
			}
		}
	}).bindTo(state);
	inputHandler.on('release', function(coords) {
		if (holding && enabled) {
			let prevPressed = pressed;
			holding = pressed = false;
			if (prevPressed && options.onClick instanceof Function) {
				// invoke onClick event
				options.onClick.call(self);
			}
		}
	}).bindTo(state);
}

// create the main state
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create a simple tiled button
	this.myButton = new Button(this, { // we pass the state for context
		graphics: myAssets.graphics.button,
		onClick: function() {
			let button = this;
			// disable button during animation
			button.disable();
			// setup a tween
			let tweenFrom = 0; // tween from angle 0
			let tweenTo = 360; // to angle 360
			let tweenDuration = 1500; // 1.5 seconds
			let tweenEasingFunction = myst.ease[myState.easingFunction]; // select easing function provided by user
			let tweenUpdateFunction = button.setAngle; // function to call with updates
			let tweenDoneFunction = function() {
				// reset and enable button when tween finishes
				button.setAngle(0);
				button.enable();
			};
			let tween = new myst.Tween(tweenFrom, tweenTo, tweenDuration, tweenUpdateFunction, tweenDoneFunction, tweenEasingFunction);
			// perform the tween
			tween.start();
		}
	});
	// tween easing method
	this.easingFunction = 'linear';
};

myState.draw = function() {
	this.surface.clear();
	// draw the button
	this.myButton.draw();
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// asset list
let myAssets = {
	graphics: {
		button: 'button.png'
	}
};

// asset loader
let myLoader = new myst.AssetLoader();

// initialize input handler on game
let inputHandler = new myst.Input(myGame);

// toggle between easing functions
let selectEaseElement = document.querySelector('#selectease');

selectEaseElement.addEventListener('change', function() {
	let optionElement = selectEaseElement.options[selectEaseElement.selectedIndex];
	myState.easingFunction = optionElement.text;
});

// load assets on window load
window.addEventListener('load', function() {
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all assets are loaded
	});
});
