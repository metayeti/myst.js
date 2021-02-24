/*
 *  Myst.js Example 09 - Tween
 *
 */

function TweenableBox(state, options) {
	var x = 0;
	var y = 0;
	var graphics = options.graphics;
	var width = 110;
	var height = 110;
	var enabled = true;

	var animationStage = 0;

	var tweenDuration = 1000; // tween duration in milliseconds
	var tweenProc = Math.floor; // tween value post-processing function (we use floor so we only get whole numbers)

	var infoText = '';

	this.draw = function() {
		state.paint.graphics(graphics, x, y);
		state.paint.text(infoText, 200, 150, '#c0c', 'center', 'bold 13px sans-serif');
	};

	function tweenDone() {
		// will get called whenever a Tween finishes
		enabled = true;
		infoText = '';
	}

	// X and Y setters for tween
	function setX(nextX) {
		x = nextX;
	}
	function setY(nextY) {
		y = nextY;
	}

	function nextTween() {
		animationStage += 1;
		if (animationStage > 4) {
			animationStage = 1;
		}
		enabled = false;
		switch (animationStage) {
			case 1:
				infoText = 'ease.linear';
				//            from  to     duration    set_f   done_f      ease_f          proc_f
				//              |   |         |          |       |           |               |
				(new myst.Tween(0, 190, tweenDuration, setY, tweenDone, myst.ease.linear, tweenProc)).start();
				break;
			case 2:
				infoText = 'ease.quadIn';
				(new myst.Tween(0, 290, tweenDuration, setX, tweenDone, myst.ease.quadIn, tweenProc)).start();
				break;
			case 3:
				infoText = 'ease.quadOut';
				(new myst.Tween(190, 0, tweenDuration, setY, tweenDone, myst.ease.quadOut, tweenProc)).start();
				break;
			case 4:
				infoText = 'ease.quadInOut';
				(new myst.Tween(290, 0, tweenDuration, setX, tweenDone, myst.ease.quadInOut, tweenProc)).start();
				break;
		}
	}

	inputHandler.on('press', function(coords) {
		if (enabled) {
			var cx = coords[0];
			var cy = coords[1];
			if (myst.pointInRect(cx, cy, x, y, width, height)) {
				// perform next tween
				nextTween();
			}
		}
	});
}

// create the main state
var myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create a tweenablebox
	this.box = new TweenableBox(this, { // we pass the state for context
		graphics: myAssets.graphics.box
	});
	// get the sprite from our loaded assets
	//this.sprite = myAssets.graphics.sprite;
	// alternatively, we can fetch through the asset loader
	//this.sprite = myLoader.get('graphics.sprite');
};

myState.draw = function() {
	this.surface.clear();
	// draw the box
	this.box.draw();
};

// setup and run the game
var myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// asset list
var myAssets = {
	graphics: {
		box: 'box.png'
	}
};

// asset loader
var myLoader = new myst.AssetLoader();

// initialize input handler on game
var inputHandler = new myst.Input(myGame);

// load assets on window load
window.addEventListener('load', function() {
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all assets are loaded
	});
});
