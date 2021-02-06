/*
 *  myst.ui.js Example 01 - Button
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create a shape
	this.myShape = new myst.ui.Shape({
		x: 50,
		y: 50,
		width: 50,
		height: 50,
		shapeColor: '#c2f',
		shapeFill: false,
		shapeBorder: 1,
		//shapeType: 'rectangle',
		//shapePoints: [[0.5, 0.5], [0.9, 0.9]],
		shapeType: 'triangle',
		shapePoints: [[0.2, 0.2], [0.2, 0.8], [0.8, 0.8]],
		//background: '#cc9'
	});

};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	// draw button
	///this.myButton.draw();
	this.myShape.draw();
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

