/*
 *  myst.ui.js Example 03 - containers
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create some Frames
	// a Frame is a container component that can hold multiple other components, including other Frames
	// we use "debug" and "debugColor" options to help us visualize container geometry
	this.myFrame = new myst.ui.Frame({
		width: 210,
		height: 200,
		background: '#eee',
		debug: true,
		// use the "components" entry to add controls on construction
		// we may also add controls later by calling myFrame.addComponents({...});
		components: {
			myFrame2: new myst.ui.Frame({
				x: 22,
				y: 30,
				width: 50,
				height: 50,
				background: '#fff',
				debug: true,
				debugColor: '#c05'
			}),
			myFrame3: new myst.ui.Frame({
				x: 90,
				y: 50,
				width: 150,
				height: 130,
				background: '#fff',
				debug: true,
				debugColor: '#f92',
				components: {
					myFrame4: new myst.ui.Frame({
						x: -15,
						y: 20,
						width: 50,
						height: 30,
						background: '#aaf',
						debug: true,
						debugColor: '#82f'
					}),
					myFrame5: new myst.ui.Frame({
						x: 25,
						y: 80,
						width: 105,
						height: 200,
						background: '#afc',
						debug: true,
						debugColor: '#5a0',
						components: {
							myControl: new myst.ui.Control({
								x: 50,
								y: 28,
								width: 80,
								height: 25,
								background: '#ffa',
								debug: true,
								debugColor: '#02f'
							})
						}
					})
				}
			})
		}
	});

	this.myFrame.center();
};

myState.init = function() {
	myState.createUI();
	(function() {
		// activate easter-egg after 3 presses on canvas
		var duration = 20000;
		var pressedTimes = 0;
		function doEasterEgg() {
			var myFrame = myState.myFrame;
			myFrame.myFrame3.myFrame5.myControl.setAngle(0).tween({ angle: -720 }, { duration: duration });
			myFrame.myFrame3.myFrame5.setAngle(0).tween({ angle: -720 }, { duration: duration });
			myFrame.myFrame3.myFrame4.setAngle(0).tween({ angle: 720 }, { duration: duration });
			myFrame.myFrame3.setAngle(0).tween({ angle: 720 * 2 }, { duration: duration });
			myFrame.myFrame2.setAngle(0).tween({ angle: 720 }, { duration: duration });
			myFrame.setAngle(0).tween({ angle: -720 }, { duration: duration, onDone: function() { pressedTimes = 0; }});
		}
		inputHandler.on('press', function() {
			if (pressedTimes === 3) {
				return;
			}
			pressedTimes++;
			if (pressedTimes === 3) {
				doEasterEgg();
			}
		});
	}());
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

