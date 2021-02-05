/*
 *  myst.ui.js Example 01 - Button
 *
 */

var myState = new myst.State();

myState.createUI = function() {
	// set the global context to this particular state
	// every created component from here on will default to this context
	myst.ui.setGlobalContext(this);

	// create a button component
	this.myButton = new myst.ui.TileButton({
		//context: this, // commented on purpose, not needed after global context has been set
		// define button geometry and texture
		//x: 0, // commented on purpose, not needed as we're calling myButton.center to position the button
		//y: 0,
		width: 200,
		height: 100,
		texture: myAssets.graphics.button,
		//tileWidth: 200, // commented on purpose, not needed unless a stretchable button is desired
		//tileHeight: 100,
		// button tile data
		tiles: {
			normal: [0, 0],
			pressed: [1, 0]
		},
		// events
		onClick: function() {
			// make the button spin
			this.disable(); // disable button during spin
			this.tween({ angle: this.getAngle() + 360 }, { // animate "angle" property
				duration: 1000,
				ease: myst.ease.easeInOut,
				onDone: function() {
					this.enable(); // enable button again
				}
			});
		},
		//test
		
		//debug: true,
		//debugString: '$type $x $y',
		//debugColor: 'blue'
		
	});

	// center the component
	this.myButton.center();
};

myState.init = function() {
	myState.createUI();
};
myState.draw = function() {
	this.surface.clear();
	// draw button
	this.myButton.draw();
};

var myGame = new myst.Game({
	canvasId: 'myst-example',
	state: myState,
	simpleLoop: true
});

var inputHandler = new myst.Input(myGame);

var myAssets = {
	graphics: {
		button: 'button.png'
	}
};

var myLoader = new myst.AssetLoader();

window.addEventListener('load', function() {
	// initialize the user interface extension
	myst.ui.init(inputHandler);
	// load assets
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all is loaded
	});
});

