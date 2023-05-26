/*
 *  Myst.js Example 05 - View Mode
 *
 */

// bouncy box class
function BouncyBox(state, options) {
	// position, velocity and size of the box
	let pos = { x: options.x, y: options.y };
	let vel = { x: options.vel_x, y: options.vel_y };
	let size = options.size;

	this.animate = function() {
		// bounce the box around
		pos.x += vel.x;
		pos.y += vel.y;
		let max_x = state.surface.width - size;
		let max_y = state.surface.height - size;
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
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create several bouncing boxes
	this.boxes = [];
	for (let i = 0; i < 50; i++) {
		let box_size = myst.getRandomInt(10, 30);
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
	let n_boxes = this.boxes.length;
	for (let i = 0; i < n_boxes; i++) {
		this.boxes[i].draw();
	}
};

myState.update = function() {
	let n_boxes = this.boxes.length;
	for (let i = 0; i < n_boxes; i++) {
		this.boxes[i].animate();
	}
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState // initial game state
});

// set "center" view mode
// this alters the canvas elements' style
myGame.setViewMode('center');

// toggle between view modes
let selectViewElement = document.querySelector('#selectview');
let viewExplanationElement = document.querySelector('#viewmode-explanation');

function updateSelectExplanation(optionElement) {
	let info = optionElement.getAttribute('data-info');
	viewExplanationElement.innerText = info;
}

selectViewElement.addEventListener('change', function() {
	let optionElement = selectViewElement.options[selectViewElement.selectedIndex];
	let mode = optionElement.text;
	myGame.setViewMode(mode);
	updateSelectExplanation(optionElement);
});

updateSelectExplanation(selectViewElement.options[0]);

// run game on window load
window.addEventListener('load', myGame.run);
