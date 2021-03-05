/*
 *  myst.ui.js Example 02 - Components
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	////z-index test
	this.frame = new myst.ui.Frame({
		width: 400,
		height: 300
	});

	this.shape1 = new myst.ui.Shape({
		x: 100,
		y: 70,
		width: 100,
		height: 100,
		shape: {
			type: 'rectangle',
			geometry: [[0, 0], [1, 1]],
			color: 'orange'
		},
		zIndex: 2
	});
	
	this.shape2 = new myst.ui.Shape({
		x: 120,
		y: 90,
		width: 100,
		height: 100,
		shape: {
			type: 'rectangle',
			geometry: [[0, 0], [1, 1]],
			color: 'forestgreen'
		},
		zIndex: 1
	});
	
	this.shape3 = new myst.ui.Shape({
		x: 140,
		y: 110,
		width: 100,
		height: 100,
		shape: {
			type: 'rectangle',
			geometry: [[0, 0], [1, 1]],
			color: 'blue'
		},
		zIndex: 2
	});
	
	this.frame.addComponents({shape1: this.shape1, shape2: this.shape2, shape3: this.shape3});

};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	
	// draw shapes
	this.frame.draw();
};

var myGame = new myst.Game({
	canvasId: 'myst-example',
	state: myState,
	simpleLoop: true
});

var inputHandler = new myst.Input(myGame);


window.addEventListener('load', function() {
	// initialize the user interface extension
	myst.ui.init(inputHandler);
	// run game
	myGame.run();
});

