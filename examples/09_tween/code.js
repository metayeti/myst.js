/*
 *  Myst.js Example 09 - Tween
 *
 */

function Button(state, options) {
	var self = this;

	var graphics = options.graphics;
	var width = 200;
	var height = 100;
	var tileNormal = [0, 0];
	var tilePressed = [1, 0];
	var x = Math.floor((state.surface.width - width) / 2);
	var y = Math.floor((state.surface.height - height) / 2);
	var pressed = false;
	var holding = false;
	var enabled = true;
	var angle = 0;

	this.enable = function() { enabled = true; };
	this.disable = function() { enabled = false; };
	this.setAngle = function(a) { angle = a; };

	this.draw = function() {
		if (angle !== 0) {
			// rotate around a central point
			var center = [Math.floor(x + width / 2), Math.floor(y + height / 2)];
			state.paint.rotate(angle, center);
		}
		// draw the button tile
		var tile = (pressed) ? tilePressed : tileNormal;
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
			var prevPressed = pressed;
			var nextPressed = pointInButton(coords);
			if (prevPressed !== nextPressed) {
				pressed = nextPressed;
			}
		}
	}).bindTo(state);
	inputHandler.on('release', function(coords) {
		if (holding && enabled) {
			var prevPressed = pressed;
			holding = pressed = false;
			if (prevPressed && options.onClick instanceof Function) {
				// invoke onClick event
				options.onClick.call(self);
			}
		}
	}).bindTo(state);
}

// create the main state
var myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create a simple tiled button
	this.myButton = new Button(this, { // we pass the state for context
		graphics: myAssets.graphics.button,
		onClick: function() {
			var button = this;
			// disable button during animation
			button.disable();
			// setup a tween
			var tweenFrom = 0; // tween from angle 0
			var tweenTo = 360; // to angle 360
			var tweenDuration = 1500; // 1.5 seconds
			var tweenEasingFunction = myst.ease[myState.easingFunction]; // select easing function provided by user
			var tweenUpdateFunction = button.setAngle; // function to call with updates
			var tweenDoneFunction = function() {
				// reset and enable button when tween finishes
				button.setAngle(0);
				button.enable();
			};
			var tween = new myst.Tween(tweenFrom, tweenTo, tweenDuration, tweenUpdateFunction, tweenDoneFunction, tweenEasingFunction);
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
var myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// asset list
var myAssets = {
	graphics: {
		button: 'button.png'
	}
};

// asset loader
var myLoader = new myst.AssetLoader();

// initialize input handler on game
var inputHandler = new myst.Input(myGame);

// toggle between easing functions
var selectEaseElement = document.querySelector('#selectease');

selectEaseElement.addEventListener('change', function() {
	var optionElement = selectEaseElement.options[selectEaseElement.selectedIndex];
	myState.easingFunction = optionElement.text;
});

// load assets on window load
window.addEventListener('load', function() {
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all assets are loaded
	});
});
