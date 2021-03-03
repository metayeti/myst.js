/*
 *  myst.ui.js Example 02 - Components
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create some labels
	this.label1 = new myst.ui.Label({
		x: 10,
		y: 10,
		text: 26,
		autoResize: true
	});

	// create some shapes
	this.shape1 = new myst.ui.Shape({
		x: 30,
		y: 60,
		width: 50,
		height: 50,
		
		// set the shape type and appearance with the "shape" entry. we may change shape at runtime
		// by calling setShape({...}) with one or more of the same parameters as listed below
		shape: {			
			// shape color. default is #000
			color: '#c2f',
			// whether or not to fill the shape. when false, only the border is displayed. default is true
			fill: false,
			// border thickness. default is 1
			border: 1,
			// type of shape. can be any of the following: rectangle, line, triangle, polygon, circle, arc
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
		}
	});

	this.shape2 = new myst.ui.Shape({
		x: 100,
		y: 60,
		width: 50,
		height: 50,
		shape: {
			type: 'line',
			geometry: [[0, 0], [1, 1]]
		}
	});

	this.shape3 = new myst.ui.Shape({
		x: 170,
		y: 60,
		width: 50,
		height: 50,
		shape: {
			type: 'triangle',
			geometry: [[0, 1], [0.5, 0], [1, 1]],
			color: 'blue',
			fill: false
		}
	});

	this.shape4 = new myst.ui.Shape({
		x: 240,
		y: 60,
		width: 50,
		height: 50,
		shape: {
			type: 'polygon',
			color: 'tomato',
			geometry: [[0.3, 0], [0.7, 0], [1, 0.3], [1, 0.7], [0.7, 1], [0.3, 1], [0, 0.7], [0, 0.3]],
			fill: true
		}
	});

	this.shape5 = new myst.ui.Shape({
		x: 310,
		y: 60,
		width: 50,
		height: 50,
		shape: {
			type: 'circle',
			color: 'green',
			//geometry: [[0.5, 0.5]], // [0.5, 0.5] is the default geometry for circle and arc (center point)
			fill: false,
			border: 5
		}
	});
	
	this.shape6 = new myst.ui.Shape({
		x: 30,
		y: 150,
		width: 50,
		height: 50,
		shape: {
			type: 'arc',
			color: 'orange',
			fill: false,
			parameters: [90, 360], // start and end angles in degrees
			border: 10
		}
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

	//this.paint.rotate(45, [260, 180]);
	//this.paint.rectFill(150, 150, 100, 100, 'tomato', 150);
	//this.paint.roundRectangle(150, 150, 100, 100, 'red', 1, 30);
	//this.paint.restore();
};

var myGame = new myst.Game({
	canvasId: 'myst-example',
	state: myState,
	simpleLoop: true
});

var inputHandler = new myst.Input(myGame);

/*
var myAssets = {
	graphics: {
		button: 'button.png'
	}
};

var myLoader = new myst.AssetLoader();
*/

window.addEventListener('load', function() {
	// initialize the user interface extension
	myst.ui.init(inputHandler);
	// run game
	myGame.run();
	/*
	// load assets
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all is loaded
	});
	*/
});

