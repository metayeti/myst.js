/*
 *  myst.ui.js Example 01 - Button
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

	// create a shape
	this.myShape = new myst.ui.Shape({
		x: 95,
		y: 95,
		width: 50,
		height: 50,
		
		// set the shape type and appearance with the "shape" entry. we may change shape at runtime
		// by calling setShape({...}) with one or more of the same parameters as listed below
		shape: {			
			// shape color. default is #fff
			color: '#c2f',
			// whether or not to fill the shape. when false, only the border is displayed. default is true
			fill: true,
			// border thickness. default is 1
			border: 1,
			// type of shape. can be any of the following: rectangle, line, triangle, polygon, circle, arc
			type: 'rectangle',
			// shape geometry. this is an array of tuples of coordinates in the unit coordinate system (0 to 1)
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
		},
		
		// the following are examples of various shapes we can achieve with the Shape component.
		
		/*
		shape: {
			color: 'coral',
			fill: false,
			type: 'triangle',
			geometry: [[0, 0], [1, 0], [1, 1]]
		}
		*/		
		
	});

};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	// draw button
	this.myShape.draw();

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

