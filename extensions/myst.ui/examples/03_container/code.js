/*
 *  myst.ui.js Example 03 - containers
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create some frames
	// we use "debug" and "debugColor" options to help us visualize container geometry
	this.myFrame = new myst.ui.Frame({
		width: 265,
		height: 250,
		background: '#eee',
		debug: true,
		components: {
			nestedFrame: new myst.ui.Frame({
				x: 90,
				y: 60,
				width: 150,
				height: 150,
				background: '#fff',
				debug: true,
				debugColor: '#f92',
				components: {
					nestedNestedFrame: new myst.ui.Frame({
						x: -15,
						y: 20,
						width: 50,
						height: 30,
						background: '#aaf',
						debug: true,
						debugColor: '#82f'
					}),
					nestedNestedFrame2: new myst.ui.Frame({
						x: 30,
						y: 80,
						width: 105,
						height: 200,
						background: '#afc',
						debug: true,
						debugColor: '#5a0',
						components: {
							testControl: new myst.ui.Control({
								x: 50,
								y: 30,
								width: 80,
								height: 25,
								background: '#ffa',
								debug: true,
								debugColor: '#02f'
							})
						}
					})
				}
			}),
			nestedFrame2: new myst.ui.Frame({
				x: 22,
				y: 30,
				width: 50,
				height: 50,
				background: '#fff',
				debug: true,
				debugColor: '#c05'
			})
		}
	});

	this.myFrame.center();
};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	// draw frame
	this.myFrame.draw();
};

var myGame = new myst.Game({
	canvasId: 'myst-example',
	state: myState,
	simpleLoop: true
});

var inputHandler = new myst.Input(myGame);

var myLoader = new myst.AssetLoader();

window.addEventListener('load', function() {
	// initialize the user interface extension
	myst.ui.init(inputHandler);
	// run game
	myGame.run();
});

