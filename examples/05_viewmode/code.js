/*
 *  Myst.js Example 05 - View Mode
 *
 */

// bouncy box class
function BouncyBox(state, options) {
	// position, velocity and size of the box
	var pos = { x: options.x, y: options.y };
	var vel = { x: options.vel_x, y: options.vel_y };
	var size = options.size;

	this.animate = function() {
		// bounce the box around
		pos.x += vel.x;
		pos.y += vel.y;
		var max_x = state.surface.width - size;
		var max_y = state.surface.height - size;
		if (pos.x >= max_x) {
			pos.x = max_x;
			vel.x = -vel.x;
		}
		else if (pos.x <= 0) {
			vel.x = -vel.x;
		}
		if (pos.y > max_y) {
			pos.y = max_y;
			vel.y = -vel.y;
		}
		else if (pos.y <= 0) {
			vel.y = -vel.y;
		}
	};

	this.draw = function() {
		// we have access to state's paint
		state.paint.rectFill(pos.x, pos.y, size, size, options.color);
	};
}

// create the main state
var myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create several bouncing boxes
	this.boxes = [];
	for (var i = 0; i < 50; i++) {
		var box_size = myst.getRandomInt(10, 30);
		this.boxes.push(new BouncyBox(this, {
			x: myst.getRandomInt(0, 400 - box_size),
			y: myst.getRandomInt(0, 300 - box_size),
			vel_x: myst.getRandomInt(-200, 200) / 100,
			vel_y: myst.getRandomInt(-200, 200) / 100,
			color: myst.choose(['orange', 'red', 'blue', 'purple', 'gray', 'green']),
			size: box_size
		}));
	}
};

// draw the sprite
myState.draw = function() {
	this.surface.clear();
	var n_boxes = this.boxes.length;
	for (var i = 0; i < n_boxes; i++) {
		this.boxes[i].draw();
	}
};

myState.update = function() {
	var n_boxes = this.boxes.length;
	for (var i = 0; i < n_boxes; i++) {
		this.boxes[i].animate();
	}
};

// setup and run the game
var myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState // initial game state
});

// set "center" view mode
// this alters the canvas elements' style
myGame.setViewMode('center');

// toggle between view modes
var selectViewElement = document.querySelector('#selectview');
var viewExplanationElement = document.querySelector('#viewmode-explanation');

function updateSelectExplanation(optionElement) {
	var info = optionElement.getAttribute('data-info');
	viewExplanationElement.innerText = info;
}

selectViewElement.addEventListener('change', function() {
	var optionElement = selectViewElement.options[selectViewElement.selectedIndex];
	var mode = optionElement.text;
	myGame.setViewMode(mode);
	updateSelectExplanation(optionElement);
});

updateSelectExplanation(selectViewElement.options[0]);

// run game on window load
window.addEventListener('load', myGame.run);
