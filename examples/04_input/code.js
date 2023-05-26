/*
 *  Myst.js Example 04 - Input
 *
 */

function DraggableSquare(state) {
	// position
	let x = 170;
	let y = 120;
	let size = 60;
	let color = 'orange';

	// dragging
	let dragging = false;
	let drag_x;
	let drag_y;

	// draw the square
	this.draw = function() {
		state.surface.clear();
		state.paint.rectFill(x, y, size, size, color);
	};

	// register events
	inputHandler.on('press', function(coords) {
		// check if event occured within the square
		let cx = coords[0];
		let cy = coords[1];
		if (myst.pointInRect(cx, cy, x, y, size, size)) {
			// begin dragging
			dragging = true;
			drag_x = cx - x;
			drag_y = cy - y;
		}
	}).bindTo(state);
	inputHandler.on('move', function(coords) {
		if (dragging) {
			let cx = coords[0];
			let cy = coords[1];
			// calculate new coordinates
			let next_x = cx - drag_x;
			let next_y = cy - drag_y;
			// disallow dragging beyond canvas boundaries
			let max_x = 400 - size;
			let max_y = 300 - size;
			x = myst.clamp(next_x, 0, max_x);
			y = myst.clamp(next_y, 0, max_y);
		}
	}).bindTo(state);
	inputHandler.on('release', function(coords) {
		// stop dragging
		dragging = false;
	}).bindTo(state);
	
	// stop dragging when window loses focus mid-drag (for example when ctrl+tab is pressed);
	window.onblur = function() {
		dragging = false;
	};
}

// create the main state
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	this.square = new DraggableSquare(this);
};

// draw the sprite
myState.draw = function() {
	this.square.draw();
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// initialize input handler on game
let inputHandler = new myst.Input(myGame);

// run game on window load
window.addEventListener('load', myGame.run);
