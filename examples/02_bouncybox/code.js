/*
 *  Myst.js Example 02 - Bouncy Box
 *
 */

// bouncy box class
function BouncyBox(state, options) {
	// position and velocity of the box
	let pos = { x: options.x, y: options.y };
	let vel = { x: options.vel_x, y: options.vel_y };

	this.animate = function() {
		// bounce the box around
		pos.x += vel.x;
		pos.y += vel.y;
		if (pos.x <= 0 || pos.x >= 350)
			vel.x = -vel.x;
		if (pos.y <= 0 || pos.y >= 250)
			vel.y = -vel.y;
	};

	this.draw = function() {
		// we have access to state's paint
		state.paint.rectFill(pos.x, pos.y, 50, 50, options.color);
	};
}

// create the main game state
let myState = new myst.State();

myState.init = function() {
	// attach a custom object
	this.box = new BouncyBox(this, { // we pass the state for context
		x: 100, // position
		y: 100,
		vel_x: 1, // velocity
		vel_y: 1.8,
		color: 'orange'
	});
};

myState.update = function() {
	// animate the bouncy square
	this.box.animate();
};

myState.draw = function() {
	this.surface.clear();
	// draw the bouncy square
	this.box.draw();
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	background: '#000' // background fill color (optional)
});

// run game on window load
window.addEventListener('load', myGame.run);
