/*
 *  Myst.js Example 03 - Graphics
 *
 */

// create the main state
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	// get the sprite from our loaded assets
	this.sprite = myAssets.graphics.sprite;
	// alternatively, we can fetch through the asset loader
	//this.sprite = myLoader.get('graphics.sprite');
};

// draw the sprite
myState.draw = function() {
	this.surface.clear();
	this.paint.graphics(this.sprite, 140, 90);
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// asset list
let myAssets = {
	graphics: {
		sprite: 'sprite.png'
	}
};

// asset loader
let myLoader = new myst.AssetLoader();

// load assets on window load
window.addEventListener('load', function() {

	// When loading assets, there is a distinction made between the asset list
	// (categories with keys pointing to filenames) and the resource list
	// (categories with keys pointing to resources). The following pattern allows
	// us to convert myAssets from an asset list into a resource list which we
	// can then use throughout the game to access graphics or other resources.
	
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run // run game when all assets are loaded
	});
	
	// Note that this pattern is not strictly necessary, you can simply call
	// myLoader.load and the resource list will be kept in myLoader. You can then
	// access the resources using .get() and .from(). Or, you can access
	// the resource list by calling myLoader.getResources().
});
