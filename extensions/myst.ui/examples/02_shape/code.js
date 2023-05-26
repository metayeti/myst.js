/*
 *  myst.ui.js Example 02 - Components
 *
 */

let myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create some shapes
	this.shape1 = new myst.ui.Shape({
		x: 30,
		y: 70,
		width: 50,
		height: 50,	
		// set shape type and appearance.  we may change shape at runtime
		// by calling setShape({...}) with one or more of the same parameters as listed below
		// shape color. default is #000
		color: '#c2f',
		// whether or not to fill the shape. when false, only the border is displayed. default is true
		fill: false,
		// border thickness. default is 1
		border: 1,
		// type of shape. can be any of the following: rectangle, line, triangle, polygon, circle, arc, pie
		type: 'rectangle',
		// shape geometry. this is an array of pairs of coordinates in the unit coordinate system (0 to 1)
		// different shapes may require different number of coordinates. polygon may have any number of coordinates.
		geometry: [[0, 0], [1, 1]],
		// shape radius. only applicable to circle, arc, and rectangle. rectangle may have multiple radii in the form
		// of an array (one radius for each corner, top-left first, clockwise). these values may be 0 to 1
		radius: 0,
		// additional shape parameters in the form of a list of values. only applicable to shapes that require these
		// (such as arc)
		//parameters: []
		// real units flag. set to true if you want to use pixel instead of unit coordinates. default is false
		realUnits: false
	});

	this.shape2 = new myst.ui.Shape({
		x: 100,
		y: 70,
		width: 50,
		height: 50,
		type: 'line',
		geometry: [[0, 0], [1, 1]]
	});

	this.shape3 = new myst.ui.Shape({
		x: 170,
		y: 70,
		width: 50,
		height: 50,
		type: 'triangle',
		geometry: [[0, 1], [0.5, 0], [1, 1]],
		color: 'blue',
		fill: false
	});

	this.shape4 = new myst.ui.Shape({
		x: 240,
		y: 70,
		width: 50,
		height: 50,
		type: 'polygon',
		color: 'tomato',
		geometry: [[0.3, 0], [0.7, 0], [1, 0.3], [1, 0.7], [0.7, 1], [0.3, 1], [0, 0.7], [0, 0.3]],
		fill: true
	});

	this.shape5 = new myst.ui.Shape({
		x: 312,
		y: 70,
		width: 50,
		height: 50,
		type: 'circle',
		color: 'dodgerblue',
		//geometry: [[0.5, 0.5]], // [0.5, 0.5] is the default geometry for circle and arc (center point)
		fill: false,
		border: 1
	});
	
	this.shape6 = new myst.ui.Shape({
		x: 50,
		y: 170,
		width: 50,
		height: 50,
		type: 'arc',
		color: 'skyblue',
		fill: false,
		parameters: [90, 360], // start and end angles in degrees
		border: 10
	});
	
	this.shape7 = new myst.ui.Shape({
		x: 120,
		y: 170,
		width: 50,
		height: 50,
		type: 'pie',
		color: 'green',
		parameters: [-90, 180],
		fill: false,
		border: 1
	});
	
	this.shape8 = new myst.ui.Shape({
		x: 194,
		y: 160,
		width: 70,
		height: 70,
		type: 'polygon',
		color: 'orange',
		geometry: [[0.5, 0], [0.17, 1], [1, 0.37], [0, 0.37], [0.83, 1]],
		fill: false
	});
	
	this.shape9 = new myst.ui.Shape({
		x: 280,
		y: 160,
		width: 70,
		height: 70,
		type: 'polygon',
		color: 'limegreen',
		geometry: [[0.5, 0], [0.17, 1], [1, 0.37], [0, 0.37], [0.83, 1]],
		fill: true
	});

};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	
	// draw shapes
	this.shape1.draw();
	this.shape2.draw();
	this.shape3.draw();
	this.shape4.draw();
	this.shape5.draw();
	this.shape6.draw();
	this.shape7.draw();
	this.shape8.draw();
	this.shape9.draw();
};

let myGame = new myst.Game({
	canvasId: 'myst-example',
	state: myState,
	simpleLoop: true
});

let inputHandler = new myst.Input(myGame);


window.addEventListener('load', function() {
	// initialize the user interface extension
	myst.ui.init(inputHandler);
	// run game
	myGame.run();
});

