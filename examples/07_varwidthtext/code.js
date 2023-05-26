/*
 *  Myst.js Example 07 - Variable Width Text
 *
 */

// create the main state
let myState = new myst.State();

// called when state initializes
myState.init = function() {
	// create a non-monospaced font by specifying widths for characters
	// it is safe to skip characters that have the same width as the
	// default character width
	this.font = new myst.Font({
		graphics: myAssets.graphics.font, // font graphics
		size: [12, 18], // default character width and height
		spacing: 3, // font spacing
		widths: { // character widths, this can either be a key-value map or an ordered array
			' ': 10,
			'!': 4,
			'"': 10,
			'#': 10,
			'$': 10,
			'%': 12,
			'&': 12,
			'\'': 4,
			'(': 6,
			')': 6,
			'*': 8,
			'+': 10,
			',': 4,
			'-': 8,
			'.': 4,
			'/': 8,
			'0': 10,
			'1': 6,
			'2': 10,
			'3': 10,
			'4': 10,
			'5': 10,
			'5': 10,
			'6': 10,
			'7': 10,
			'8': 10,
			'9': 10,
			':': 4,
			';': 4,
			'<': 8,
			'=': 10,
			'>': 8,
			'?': 8,
			'@': 10,
			'A': 10,
			'B': 10,
			'C': 10,
			'D': 10,
			'E': 8,
			'F': 8,
			'G': 10,
			'H': 10,
			'I': 2,
			'J': 8,
			'K': 10,
			'L': 8,
			'M': 12,
			'N': 10,
			'O': 10,
			'P': 10,
			'Q': 10,
			'R': 10,
			'S': 10,
			'T': 10,
			'U': 10,
			'V': 10,
			'W': 12,
			'X': 10,
			'Y': 10,
			'Z': 10,
			'[': 8,
			'\\': 8,
			']': 8,
			'^': 10,
			'_': 10,
			'`': 6,
			'a': 8,
			'b': 8,
			'c': 8,
			'd': 8,
			'e': 8,
			'f': 8,
			'g': 8,
			'h': 8,
			'i': 2,
			'j': 4,
			'k': 8,
			'l': 2,
			'm': 10,
			'n': 8,
			'o': 8,
			'p': 8,
			'q': 8,
			'r': 6,
			's': 8,
			't': 6,
			'u': 8,
			'v': 8,
			'w': 10,
			'x': 10,
			'y': 8,
			'z': 8,
			'{': 8,
			'|': 2,
			'}': 8,
			'~': 10
		}
	});
};

// draw some text
myState.draw = function() {
	this.surface.clear();
	this.paint.bmptext(this.font, "Variable Width Bitmap Text!", 20, 20);
	this.paint.bmptext(this.font, "I am center aligned", 200, 60, 0, 1);
	this.paint.bmptext(this.font, "I am right aligned", 380, 100, 0, 2);
	this.paint.bmptext(this.font, "---------------------------------", 20, 140);
	this.paint.bmptext(this.font, "@$*@()*{}[];'\":,.?#%^&<>`~iiiiWWWW", 20, 180);
	this.paint.bmptext(this.font, "---------------------------------", 20, 220);
};

// setup and run the game
let myGame = new myst.Game({
	canvasId: 'myst-example', // canvas element to initialize the game on
	state: myState, // initial game state
	background: '#000', // background fill color
	simpleLoop: true // use a simple game loop that only draws and doesn't call state.update
});

// asset list
let myAssets = {
	// font graphics
	graphics: {
		font: 'font.png'
	}
};

// asset loader
let myLoader = new myst.AssetLoader();

// load assets on window load
window.addEventListener('load', function() {
	myAssets = myLoader.load({
		assets: myAssets,
		done: myGame.run
	});
});
