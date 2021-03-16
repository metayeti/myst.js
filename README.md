![myst.js](/logo.png?raw=true)

:warning: You've wondered into the **development branch**. The code here is not stable and the
repository may or may not be in a coherent state. If you are looking for library files, grab
the stable version from the main branch instead.

myst.js is a lightweight HTML5 game development toolkit intended for 2D game development.

## Features

- Single file (minified: 16.6KB) with zero external dependencies
- Supports all modern browsers (IE11/Edge/Firefox/Opera/Chrome/Safari)
- Easy to use API - most features are simple, reusable classes
- State based
- Asset management
- Keyboard and mouse or touch input
- [And more!](HOWTO.md)

## Reference and Quick start guide

Please see [HOWTO.md](HOWTO.md). See documentation for API reference.

## Minimal example

```javascript
// create a game state
var myState = new myst.State();

// draw some shapes
myState.draw = function() {
	this.surface.clear();
	this.paint.rectFill(10, 10, 50, 20, 'red');
	this.paint.circleFill(100, 30, 20, 'blue');
};

// setup game
var myGame = new myst.Game({
	canvasId: 'myCanvasId', // canvas element id
	state: myState, // initial game state
	simpleLoop: true // just draw and never call myState.update()
});

// run game on window load
window.addEventListener('load', myGame.run);
```

## Future plans

- Utils (myst.UI, myst.level, ...)
- Demos

## Credits

- [howler.js](https://howlerjs.com/) - audio library used in some examples and demos
- [QUnit](https://qunitjs.com/) - unit testing framework

## License

Copyright (c) 2020 Danijel Durakovic

MIT License
