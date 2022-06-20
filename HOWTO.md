# myst.js Reference

## Contents

- [Introduction](#introduction)
- [Quick start guide](#quick-start-guide)
- [Classes](#classes)
   - [Game](#game)
   - [State](#state)
   - [Render](#render)
   - [Surface](#surface)
   - [Input](#input)
   - [KeyInput](#keyinput)
   - [AssetLoader](#assetloader)
   - [Grid2D](#grid2d)
   - [Timer](#timer)
   - [Configuration](#configuration)
   - [Font](#font)
   - [Tween](#tween)
- [Other functions](#other-functions)
   - [General purpose](#general-purpose)
   - [Math and randomness](#math-and-randomness)

## Introduction

This library provides a collection of classes and functions that aim to simplify some of the heavy-lifting involved in implementing simple 2D games using HTML5. It aims to be lightweight and provide a clear API that's both powerful and easy to use, and lets you focus on game logic instead of working with all the technical details behind the scenes.

This engine is still in ongoing development. The release version is stable, but API may change in future releases.

## Quick start guide

To get started, create a HTML file with your favorite HTML5 template and add a canvas element of desired dimensions to it:

```HTML
<canvas id="myCanvasId" width="500" height="400"></canvas>
```

Add myst.js and the associated scripts for your game to the HTML:

```HTML
<script src="path/to/myst.min.js"></script>
<script src="path/to/game.js"></script>
```

You can now use myst.js in your code! Hooray! All we need to create a basic myst.js game is a game state and the game definition.

Put the following code in your JavaScript file:

```JavaScript
// create a game state
var myState = new myst.State();

// state draw function
myState.draw = function() {
	// clear the surface
	this.surface.clear();
	// draw a red square
	this.paint.rectFill(10, 10, 50, 50, 'red');
};

// setup the game
var myGame = new myst.Game({
	canvasId: 'myCanvasId',
	state: myState,
	simpleLoop: true
});

// run the game when window finishes loading
window.addEventListener('load', myGame.run);
```

That's it! Your first myst.js game is complete. If you run it in your browser, you will see a nice red square displayed on your canvas.

A game state represents a single segment of the game, or a screen. You may for example create one state for the game menu, another for the actual game, yet another for story screen, and so on. Alternatively, you can pack your entire game into a single state - your choice.

In the code above, we're using the state's `draw` function to paint to the screen. This function gets called by the Game object whenever this particular state is active. Note the `state: myState` line which informs the engine that we would like `myState` to be the initial state when the game runs. This argument is needed for the game to run and is not optional. Once running, we may change the active game state using `myGame.setState(nextState)`.

Note the line that reads `simpleLoop: true`. This informs the engine that we would like to make a game where we don't care for logic updates, we only want to draw to the screen. Defining this flag will make the engine run an alternate game loop that's optimized for this mode. Use it if your game relies on user input to "push" the game forward. To avoid entering this mode, simpy skip the definition.

What if we want to make a simple animation instead? Let's define both update and draw functions for our state, and let's use a regular loop for our game:

```JavaScript
// create a game state
var myState = new myst.State();

// state init function
// gets called once as the state initializes
myState.init = function() {
	// initialize all our goodies here
	this.rotation = 0;
};

// state draw function
myState.draw = function() {
	// clear the surface
	this.surface.clear();
	// draw a blue circle
	var circle_x = 50 * Math.cos(this.rotation) + 200;
	var circle_y = 50 * Math.sin(this.rotation) + 200;
	this.paint.circleFill(circle_x, circle_y, 30, 'blue');
};

// state update function
myState.update = function() {
	// increase rotation
	var speed = 0.1;
	this.rotation += speed;
};

// setup the game
var myGame = new myst.Game({
	canvasId: 'myCanvasId',
	state: myState
});

// run the game when window finishes loading
window.addEventListener('load', myGame.run);
```

This will display a blue circle orbiting around a central point. Note the `init` function, which is meant for initialization of variables and preparation of data. This function is called once as the state is being initialized. This happens automatically when the state is activated for the first time, or you can initialize states manually using `myGame.initStates([state1, state2, ...])`. Either way, `init` is guaranteed to only be executed once per state and **before** `enter`.

Note that we are **not** using `simpleLoop` in the above example. This means that the engine will call both `update` and `draw` functions on the active game state.

Ideally, we would do all of our state calculations in the `update` function and we would only use `draw` for rendering calls. However, doing some calculations inside `draw` makes the example above simpler since we don't need to bother with defining extra variables. Generally speaking, it's ok to do some calculations on the rendering side of your game as long as you keep all the game logic updates in the `update` function. The purpose of the `update` function is to update the game state to a renewed state, constantly keeping it afresh as it were, and the purpose of the `draw` function is to render whatever state the game is currently in, to the screen. You should always keep performance in mind when writing any sort of code in either of these functions, as they are being updated in real time (in most cases that means about 60 times per second).

See the [/examples/](examples/) folder for more examples on usage. See the [/doc/](doc/) folder for API reference.

## Classes

Below is a short summary of classes found in myst.js and examples on how to use them.

### Game

The Game class constructs a Game object that exists at the core of a myst.js game. It handles initialization and runs the main game loop. It is initialized in the following way:

```JavaScript
var myGame = new myst.Game({
	canvasId: 'myCanvasId',
	state: myState
});
```

The argument `canvasId` is the id of the `<canvas>` element in the DOM tree. The `state` argument points to the initial game state. Both parameters are required. Optionally, you can define `simpleLoop: true` to the options argument to make the engine use a simplified loop that doesn't call the `update` function on states.

The game will not start automatically. To start the game, use:
```JavaScript
myGame.run();
```

To change the active game state:
```JavaScript
myGame.setState(nextState);
```

To retreive the active game state:
```JavaScript
var activeState = myGame.getState();
```

States will initialize automatically when they are first entered into. For cases where you wish to manually initialize states, use:

```JavaScript
myGame.initStates([state1, state2, ...]);
```

myst.js can handle the view for your game. To set view mode, use one of the following:
```JavaScript
// centers canvas element to parent
myGame.setViewMode('center');

// scales canvas element to parent maintaining a fixed aspect ratio
myGame.setViewMode('scale-fit');

// scales canvas element to parent fully, ignoring aspect ratio
myGame.setViewMode('scale-stretch');

// expands canvas element to parent, changing physical diemensions of the canvas
myGame.setViewMode('expand');
```

Note that changing the view mode changes elements' CSS and has an effect on user input since coordinates must be translated accordingly. This is handled automatically by the Input class.

### State

The State class allows you to create State instances. These can be used to handle various game screens. At least one state is needed for a myst.js game to function. A state with its corresponding functions is defined in the following way:

```JavaScript
var myState = new myst.State();

myState.init = function() {
	/* initialize state here */
};

myState.draw = function() {
	/* draw to screen here */
};

myState.update = function() {
	/* update state here */
};

myState.enter = function() {
	/* state was entered */
};

myState.exit = function() {
	/* state was exited */
};
```

All functions are optional. When `simpleLoop` is used, `update` will be ignored.

You can use an alternate syntax if you want to:

```JavaScript
var myState = new myst.State({
	init: function() {
		/* initialize state here */
	},
	draw: function() {
		/* draw to screen here */
	},
	update: function() {
		/* update state here */
	},
	enter: function() { 
		/* state was entered */
	},
	exit: function() {
		/* state was exited */
	}
});
```

The `init` function initializes and prepares the state and is guaranteed to only be invoked once per state. The `draw` function is used for rendering graphics to screen and `update` is used for updating state logic. When a state becomes active, `enter` is called. Similarly, when the state stops being active, `exit` is called.

To check whether a state is active:
```JavaScript
var stateIsActive = myState.isActive();
```

### Render

The Render class contains functions that deal with on-screen rendering. An instance of Render is automatically initialized whenever a Surface is initialized (see next section for information on the Surface class).

It can be accessed via `state.surface.render` or the shorthand `state.paint`. It is preferable to use the shorthand method. Methods are listed below. Note the optional and default values.

Rendering shapes:
```JavaScript
// line
line(x1, y1, x2, y2, [lineColor='#fff'], [width=1]);

// rectangle
rect(x, y, width, height, [lineColor='#fff'], [width=1], [radius=0]);

// filled rectangle
rectFill(x, y, width, height, [color='#fff'], [radius=0]);

// circle
circle(x, y, radius, lineColor, [width=1)];

// filled circle
circleFill(x, y, radius, [color='#fff']);

// arc (part of a circle)
arc(x, y, radius, startAngle, endAngle, [lineColor='#fff'], [width=1]);

// filled arc
arcFill(x, y, radius, startAngle, endAngle, [color='#fff']);

// circular sector
sector(x, y, radius, startAngle, endAngle, [color='#fff'], [width=1]);

// filled circular sector
sectorFill(x, y, radius, startAngle, endAngle, [color='#fff']);

// polygon
points = [[x1, y1], [x2, y2], ...];
polygon(points, [color='#fff'], [width=1]);

// filled polygon
polygonFill(points, [color='#fff']);
```

Rendering graphics and tiles:
```JavaScript
// plain or stretched graphics
graphics(gfxSource, x, y, [width], [height]);

// surface
surface(surfaceSource, x, y);

// tile
tile(gfxSource, tileX, tileY, tileWidth, tileHeight, sourceX, sourceY);

// stretched tile
stretchTile(gfxSource, tileX, tileY, sourceWidth, sourceHeight, sourceX, sourceY, tileWidth, tileHeight);

// native text
text(textString, x, y, [textColor='#fff'], [alignment='left'], [font='11px sans-serif']);

// bitmap text
bmptext(fontObject, text, x, y, [colorIndex=0], [align=0]);
```

Alpha blending example:
```JavaScript
myState.draw = function() {
	this.surface.clear();
	this.paint.setAlpha(0.5); // set alpha level
	this.paint.rectFill(0, 0, 100, 100, 'red');
	this.paint.setAlpha(); // restore alpha
};
```

Rotation example:
```JavaScript
myState.draw = function() {
	this.surface.clear();
	var angle = 45; // angle of rotation
	var point = [50, 50]; // rotation pivot point
	this.paint.rotate(angle, point); // rotate at 45 degrees around point 50, 50
	this.paint.rectFill(0, 0, 100, 100, 'red');
	// once we are done rotating, we need to restore saved context
	this.paint.restore();
};
```

If you require additional rendering functions, you can extend the renderer.

You can access the global surface's render like so:
```JavaScript
myGame.getSurface().render
```

To add a custom function to renderer:
```JavaScript
myst.compose(myGame.getSurface().render, {
	blueCircle: function(x, y) {
		// renders a blue circle at x, y
		// use this.ctx for raw API calls
		this.ctx.strokeStyle = 'blue';
		this.ctx.lineWidth = 10;
		this.ctx.arc(x, y, 20, 0, Math.PI * 2);
		this.ctx.stroke();
	}
});

myState.draw = function() {
	// we can now use the function in any state
	this.surface.clear();
	this.paint.blueCircle(20, 20);
};
```

### Surface

Surface is a class that wraps a `<canvas>` element and includes a Render. A global surface is instantiated on the main canvas element when the game first runs and is available to all game states. You can instantiate your own surfaces to pre-render graphics. This is useful for optimizing expensive graphic calls.

To create a Surface object:
```JavaScript
var mySurface = new myst.Surface({
	width: 200,
	height: 200
});
```

This creates a Surface with its own internal `<canvas>` of specified dimensions.

You may also create a Surface that wraps an existing `<canvas>` element:
```JavaScript
var sourceCanvas = document.getElementById('someCanvasId');
var mySurface = new myst.Surface({
	fromCanvas: sourceCanvas
});
```

You can access the internal `<canvas>` element with `mySurface.canvas`.

To draw on a Surface, simply access the internal `render` object and use any of its methods:
```JavaScript
// paints a yellow rectangle of size 50x50 at 20, 20 onto mySurface
mySurface.render.rectFill(20, 20, 50, 50, 'yellow');
```

To clear a surface:
```JavaScript
mySurface.clear();
```

By default, surfaces will clear to transparent color. You can set a solid fill color instead if needed:
```JavaScript
// sets fill clear method with default (black) color
mySurface.setFillClearMethod();
// sets fill clear method with custom color
mySurface.setFillClearMethod('#aabbcc');
```

To toggle back to default clear method:
```JavaScript
mySurface.setDefaultClearMethod();
```

### Input

The Input class is used for handling mouse and touch events. The engine does not differentiate between mouse and touch events, they are treated in an equivalent way.

To instantiate an Input object, you need to associate it with a Game object:
```JavaScript
var myInputHandler = new myst.Input(myGame);
```

You can register events with the `on` function. You can register one of three events: press, move or release:
```JavaScript
myInputHandler.on('press', function(coords) {
	// mousedown or touch-start has occured
	var cx = coords[0]; // event x coordinate
	var cy = coords[1]; // event y coordinate
});
myInputHandler.on('move', function(coords) {
	// mousemove or touch-move has occured
});
myInputHandler.on('release', function(coords) {
	// mouseup or touch-end has occured
});
```

Note that the above events will fire any time an event is detected, regardless of the currently active state. To associate an event with a state context, you can use `bindTo`:

```JavaScript
myInputHandler.on('press', function(coords) {
	/* ... */
}).bindTo(myState);
myInputHandler.on('move', function(coords) {
	/* ... */
}).bindTo(myState);
myInputHandler.on('release', function(coords) {
	/* ... */
}).bindTo(myState);
```

Above events will only fire whenever `myState` is the active game state.

If you want to be able to deregister an event, you need to associate an identifier with it:

```JavaScript
myInputHandler.on('press', function(coords) {
	/* ... */
}, 'myId');
```

To deregister an event, use `off` with a desired identifier:

```JavaScript
myInputHandler.off('press', 'myId');
```

To deregister all events of given type:

```JavaScript
myInputHandler.off('press');
```

To deregister all events, call `off` with no arguments:

```JavaScript
myInputHandler.off();
```

### KeyInput

The KeyInput class handles keyboard events.

To create a handler:
```JavaScript
var myKeyInputHandler = new myst.KeyInput();
```

To poll last keyboard event:
```JavaScript
var keyEvent = myKeyInputHandler.pollEvent();
```

The return value stored in `keyEvent` will contain two properties, `type` and `keycode` - `type` can be either `myKeyInputHandler.KEYDOWN` or `myKeyInputHandler.KEYUP`, which are static values representing the event type. The `keycode` property contains a value with the corresponding key code.

The keyboard handler conatins key codes for all common keys. You can access them in your handler by the key prefix:
```JavaScript
myKeyInputHandler.keyEnter
myKeyInputHandler.keyA
myKeyInputHandler.keyB
myKeyInputHandler.key1
myKeyInputHandler.key2
```

To clear the event queue and key buffer:
```JavaScript
myKeyInputHandler.clear();
```

To check if a key code is alphanumeric:
```JavaScript
myKeyInputHandler.isAlphanumeric(keyEvent.keycode);
```

To convert a key code into a character:
```JavaScript
myKeyInputHandler.getCharacter(keyEvent.keycode);
```

To check if a given key is in keydown state:
```JavaScript
var key = myKeyInputHandler.keyEnter; // check if Enter is currently pressed
myKeyInputHandler.isKeyDown(key);
```

The keyboard handler is typically used in the `update` function of some game state thereby binding it to that particular state.

Example usage:
```JavaScript
myState.update = function() {
	// fetching keyboard events
	// loop through keyboard events until there are none left
	var keyEvent;
	while (keyEvent = myKeyInputHandler.pollEvent()) {
		if (keyEvent.type === myKeyInputHandler.KEYDOWN) {
			// a keydown event has occured
			// do something with keyEvent.keycode
		}
		else if (keyEvent.type === myKeyInputHandler.KEYUP) {
			// a keyup event has occured
			// do something with keyEvent.keycode
		}
	}
	// checking individual key states
	var isKeyWDown = myKeyInputHandler.isKeyDown(myKeyInputHandler.keyW);
	var isKeyQDown = myKeyInputHandler.isKeyDown(myKeyInputHandler.keyQ);
};
```

### AssetLoader

The AssetLoader class is used to preload various types of game assets, and provides a way to access them later on.

AssetLoader includes a few default handlers for loading assets. Custom handler functions can be defined to process various types of data. Default handlers can be safely overriden as well.

To create an AssetLoader, use:
```JavaScript
var myAssetLoader = new myst.AssetLoader();
```

You will need a list of assets that point to the files. This list needs to have specific category names that correspond to the appropriate load handler functions. The default handlers are `graphics` for any type of image files, `data` for JSON files and `text` for plaintext files.
```JavaScript
var myAssets = {
	graphics: {
		player: 'path/to/player.png',
		monster: 'path/to/monster.png',
		background: 'path/to/background.jpg'
	},
	data: {
		levels: 'level.json'
	},
	text: {
		story: 'story.txt'
	}
};
```

To preload assets, use the `load` function. Use the `assets` attribute to point to a list of assets you want preloaded. Attach a `done` function to inform you of when all processing is complete. Optionally, you can attach a `progress` function to track the load progress:
```JavaScript
myAssetLoader.load({ // returns the resource list
	assets: myAssets,
	done: function() {
		// we are done loading assets!
		// typically we would run the game here, or continue to the main screen
	},
	progress: function(loaded, all) {
		// track progress
		console.log('Loaded ' + loaded + ' out of ' + all + ' assets!');
	}
});
```

Note: When loading multiple asset lists into a single AssetLoader instance, resources from all lists will merge into a single resource list so be mindful of name clashes between the lists. (A common usage of multiple asset lists is for loading one asset list with assets required for the game's load screen, and another asset list with the game's actual resources, which you load while the load screen is displayed.)

To retreive resources, you can use the `get` function:
```JavaScript
var gfxPlayer = myAssetLoader.get('graphics.player');
var storyText = myAssetLoader.get('text.story');
```

To retreive several resources at once:
```JavaScript
var gfx = myAssetLoader.get('graphics.player graphics.monster graphics.background');
// we can now use gfx.player, gfx.monster, gfx.background
```

You can use the `from` function for better readability:
```JavaScript
var gfx = myAssetLoader.from('graphics').get('player monster background');
var storyText = myAssetLoader.from('text').get('story');
```

You can also retreive the resource list directly:
```JavaScript
var resourceList = myAssetLoader.getResources();
var gfxPlayer = resourceList.graphics.player;
```

In some cases, you may want to use the following pattern to "convert" the asset list into a resource list (actually you're retreiving a reference to the resource list and overriding myAssets with it - so be careful when loading multiple asset lists):
```JavaScript
myAssets = myLoader.load({
	assets: myAssets,
	done: function() {
		var gfxPlayer = myAssets.graphics.player;
	}
});
```

To define a custom category, add a handler function to the list of handlers:
```JavaScript
myAssetLoader.handler.custom = function(filename, ready) {
	// process file given by filename
	var object;
	/* ... */
	// call ready with the loaded object when done
	ready(object);
};
```

You can now use a custom category:
```JavaScript
var myAssets = {
	custom: {
		/* keys and filenames */
	}
};
```

This is an example for a sound effect asset handler using [howler.js](https://howlerjs.com/):
```javascript
myAssetLoader.handler.sfx = function(filenames, ready) {
	var sfx = new Howl({
		src: filenames,
		autoplay: false,
		loop: false,
		volume: 1,
		onload: function() {
			// return sfx once everything is loaded
			ready(sfx);
		},
		onloaderror: ready // will return an undefined asset
	});
};

var myAssets = {
	sfx: {
		foo: ['foo.ogg', 'foo.aac', 'foo.wav'].
		bar: ['bar.ogg', 'bar.aac', 'bar.wav']
	}
};

myAssets = myAssetLoader.load({
	assets: myAssets,
	done: function() {
		// retreive sfx
		var sfx_foo = myAssets.sfx.foo;
		var sfx_bar = myAssets.sfx.bar;
		// play foo
		sfx_foo.play();
	}
});
```

### Grid2D

The Grid2D class is a container for a 2D matrix of values. It can be instantiated in the following way:
```JavaScript
// creates a grid of size 100x100 with the default value 0
var gridWidth = 100;
var gridHeight = 100;
var gridDefaultValue = 0;
var myGrid = new myst.Grid2D(gridWidth, gridHeight, gridDefaultValue);
```

Use the `clear` function to clear the entire grid to the default value specified in the constructor:
```JavaScript
myGrid.clear();
```

**Important**: note that on instantiation, every cell in the grid has a value of *undefined* until `clear` is applied (or values are set manually).

Use the `set` function to set a grid value:
```JavaScript
var x = 10;
var y = 10;
var value = 20;
myGrid.set(x, y, value);
```

Use the `get` function to retreive a value from the grid:
```JavaScript
var x = 10;
var y = 10;
var value = myGrid.get(x, y);
```

### Timer

The Timer class is used for creating simple, tick-based timer objects that can be used in conjunction with a state's `update` function.

To create a Timer object:
```JavaScript
var interval = 60; // specifies the rate at which the timer ticks. 60 ticks ~ 1 second
var myTimer = new myst.Timer(interval);
```

A timer's interval represents the number of ticks that need to occur for the timer to tick. Example usage:
```JavaScript
myState.init = function() {
	this.showRectangle = true;
};

myState.draw = function() {
	this.surface.clear();
	if (this.showRectangle) {
		this.paint.rectFill(20, 20, 100, 100, 'purple');
	}
};

myState.update = function() {
	if (myTimer.run()) {
		// timer has ticked
		// toggle visibility of rectangle
		this.showRectangle = !this.showRectangle;
	}
};
```

The `run` function advances the timer state and reports back whether or not the timer has ticked. Alternatively, you can ignore the return value and check whether the timer has ticked or not by accessing the `ticked` property.

You can use the `reset` function to reset the timer back to initial state:
```JavaScript
myTimer.reset();
```

### Configuration

The Configuration class provides a way to handle persistant storage for your game. It wraps the localStorage API in a neat and easy to use interface. You may instantiate more than one Configuration as long as the key for each configuration remain unique.

A Configuration object is initialized in the following way:

```javascript
var myKey = 'example';
var myDefaultConfig = {
	foo: 'value',
	bar: 0
};
var myConfig = new myst.Configuration(myKey, myDefaultConfig);
```

A configuration object acts like any other object and you may populate it with any sort of data. A default configuration serves as a template for your configuration. A `load` call needs to be applied at the start of the game to retreive the active configuration. If the key is not found within localStorage, the default configuration will be used.

You can control saving and loading using the `save` and `load` functions:
```javascript
// NOTE: myConfig will remain empty untill a load call is applied!

// load configuration
// load retreives the configuration from local storage if the key is present;
// otherwise it retreives the default configuration
myConfig.load();

// do some changes to configuration
myConfig.foo = 'other value';
myConfig.bar = 2;

// save configuration to local storage
myConfig.save();
```

### Font

The Font class provides a bitmap font construct. This is useful for some games that only require a limited set of characters. The problem with regular HTML5 text routines is that they can slow the game down if the text is being redrawn over and over again. This can be solved by pre-rendering texts and then drawing those instead, but you still can't have dynamic texts unless you develop some sort of a workaround where you dynamically render only *changes* to the text. The other problem with text is it is very often inconsistent between browsers, where one browser will render your text slightly offset to the top, or the spacing will be different, or hinting, etc. Modern browsers are very complex in their way to render fonts and this comes with its own set of problems with regards to game development. This class essentially dumbs down font rendering by displaying text characters as if they were sprites in a tileset, and provides an interface for ease of use. You are limited to an ASCII range of characters with this class and you will also need to create your own fonts (create graphics and define character widths) to go with it.

Examples on usage can be found in the [/examples/](examples/) folder.

### Tween

The Tween class allows tweening (inbetweening) values in a certain range with a desired easing function. This is useful for animations and typically only used for games that use `simpleLoop` (games that rely on user input to push game state forward). This is an asynchronous method - do not use in a state's `update` function (or at least be very careful with how you handle it - there be dragons).

To construct a tween object:
```JavaScript
new Tween(from, to, duration, onUpdate, onDone, easef, procf, resetf);
```

- `from` and `to` define the range of the tween.
- `duration` is a non-zero, positive number representing the time in milliseconds.
- `onUpdate` is a callback with a `value` parameter that you can use to map the tween to a custom variable.
- `onDone` is a callback that gets called when the tween is done executing.
- `easef` is the easing function. Use one of the functions from myst.ease (myst.ease.linear, myst.ease.quadIn, myst.ease.quadOut, myst.ease.quadInOut, myst.ease.backIn or myst.ease.backOut) or substitute your own. Defaults to myst.ease.linear.
- `procf` is a value post-processing pure function that takes a single number parameter and outputs a single number parameter. Leave undefined for no post-processing. You can use `Math.floor`, `Math.ceil` for this parameter.
- `resetf` is a reset function intended for manually restoring or finalizing several nested tweens in order to prevent having the animation stuck in mid-state whenever `tween.finish()` is called on a single level. This function will get called whenever the tween is interrupted through `tween.finish()`.

All but first three parameters are optional (use `null` to skip the function parameters).

The following example tweens from 0 to 2 over 1.5 seconds with quadInOut easing:
```JavaScript
(new myst.Tween(0, 2, 1500, function(value) {
   console.log(value);
}, function() {
   console.log('Tween done!');
}, myst.ease.quadInOut)).start();
```

The following example tweens from 100 to 0 over 2 seconds with linear easing and floors output values:
```JavaScript
(new myst.Tween(100, 0, 2000, function(value) {
   console.log(value);
}, function() {
   console.log('Tween done!');
}, myst.ease.linear, Math.floor)).start();
```

To start a tween:
```JavaScript
tween.start();
```

To restart an active tween or start an inactive one:
```JavaScript
tween.restart();
```

To stop a tween:
```JavaScript
tween.stop();
```

To finalize an active tween:
```JavaScript
tween.finish();
```

To check if a tween is active:
```JavaScript
var tweenIsActive = tween.isActive();
```

## Other functions

Listed here are some additional functions included with myst.js that may come in handy when developing games:

### General purpose

`compose` takes a number of JavaScript objects and creates a single object out of them. This is useful for creating any sort of entity-component systems, as well as extending functionality of objects or simply using it for syntax sugar. It uses Object.assign under the hood or emulates it on non-ES6 compliant browsers.
```JavaScript
var result = myst.compose({
	apples: 10
}, {
	oranges: 20
});
// result: { apples: 10, oranges: 20 }
```

`iter` iterates over members of an object, ignoring any member functions.
```JavaScript
var object = {
	pumpkins: 30,
	strawberries: 40
};
myst.iter(object, function(key, item) {
	console.log(key + ': ' + item);
});
```

`getFilenameExtension` retreives the extension of a filename (always outputs lowercase).
```JavaScript
var filename = 'file.json';
myst.getFilenameExtension(filename); // returns 'json'
```

### Math and randomness

`clamp` returns a number, constrained to a given range.
```JavaScript
myst.clamp(number, min, max);
```

`pointInRect` checks whether a point is within a given rectangle.
```JavaScript
myst.pointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight);
```

`pointInCircle` checks whether a point is within a given circle.
```JavaScript
myst.pointInCircle(pointX, pointY, circleX, circleY, circleRadius);
```

`linesIntersect` checks whether two line segments A-B and C-D intersect. Ignores colinearity.
```JavaScript
myst.linesIntersect(ax, ay, bx, by, cx, cy, dx, dy);
```

`pointToPointDistance` returns the distance from point A to point B.
```JavaScript
myst.pointToPointDistance(ax, ay, bx, by);
```

`pointToLineDistance` returns the distance from point to line segment A-B.
```JavaScript
myst.pointToLineDistance(x, y, ax, ay, bx, by);
```

`movePoint` returns a point which was moved from point A towards point B by a difference of d.
```JavaScript
myst.movePoint(ax, ay, bx, by, d);
```

`getRandomInt` returns an integer from a range at random.
```JavaScript
myst.getRandomInt(min, max); // returns an integer in range [min..max]
```

`coinFlip` returns either true or false at random.
```JavaScript
if (myst.coinFlip()) {
	console.log('heads!');
}
else {
	console.log('tails!');
}
```

`diceRoll` returns the result of a random dice roll. The parameter is the number of sides on the die - default is 6.
```JavaScript
myst.diceRoll([N=6]); // returns an integer in range [1..N]
```

`shuffle` shuffles an array.
```JavaScript
myst.shuffle(array);
```

`choose` picks an element from an array at random.
```JavaScript
myst.choose(array);
```

`pick` picks an element from an array at random and **removes that element** from the array.
```JavaScript
myst.pick(array);
```
