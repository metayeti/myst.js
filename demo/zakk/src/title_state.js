/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// game_state.js | Main game state.

/*jshint esversion:9*/

//
// title state
//
const titleState = new myst.State();

titleState.init = function() {
	this.gfx_titlescreen = assets.game.graphics.titlescreen;
	this.gfx_scanlines = assets.game.graphics.scanlines;

	function BlackCover(paint) {
		const coverTimer = new myst.Timer(1);
		const coverColor = '#111';
		const coverW = VIEWPORT_W;
		const coverH = Math.floor(VIEWPORT_H / 2);
		let coverPerc = 1;
		let coverVal = 1;

		this.draw = function() {
			// upper half
			paint.rectFill(0, 0, coverW, coverH * coverPerc, coverColor);
			// lower half
			const lowerH = coverH * coverPerc;
			paint.rectFill(0, coverH + (coverH - lowerH), coverW, lowerH, coverColor);
		};

		this.update = function() {
			if (coverVal <= 0) {
				return;
			}
			if (coverTimer.run()) {
				coverVal -= 0.01;
				if (coverVal < 0) {
					coverVal = 0;
				}
				coverPerc = myst.ease.quadInOut(coverVal);
			}
		};
	}

	this.blackCover = new BlackCover(this.paint);
};

titleState.enter = function() {
	// play game music as we enter game, this will just continuously loop
	assets.game.music.gametrack.fade(0, 1, 300); // fade in tract to cover up the the loop cross-fade effect which is baked in the track itself
	assets.game.music.gametrack.play();
};

titleState.draw = function() {
	this.surface.clear();
	// draw titlescreen
	this.paint.graphics(this.gfx_titlescreen, 0, 0);
	// draw black cover
	this.blackCover.draw();
	// draw scanlines
	this.paint.graphics(this.gfx_scanlines, 0, 0);
};

titleState.update = function() {
	this.blackCover.update();
};