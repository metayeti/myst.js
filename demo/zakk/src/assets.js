/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// assets.js | Instantiates the asset loader and Lists game assets to be loaded. Also defines custom asset handlers.

/*jshint esversion:9*/

//
// asset loader
//
const loader = new myst.AssetLoader();

//
// asset lists
//
const assets = {
	// preload assets, required for loadscreen
	preload: {
		graphics: {
			// bitmap font glyphs
			gamefont: 'data/gfx/gamefont.png',
			// scanlines for a fake CRT-like effect
			scanlines: 'data/gfx/scanlines.png'
		}
	},
	// main game assets
	game: {
		graphics: {
			// scanlines for a fake CRT-like effect
			// (redundant, trust browser is smart enough not to load this asset again)
			scanlines: 'data/gfx/scanlines.png',
			// titlescreen
			titlescreen: 'data/gfx/titlescreen.png',
			// master tileset
			master: 'data/gfx/master.png',
			// player tileset
			player: 'data/gfx/player.png',
			// entities tilesets
			barrier: 'data/gfx/barrier.png',
		},
		data: {
			// levels
			level1: 'data/levels/level1.json'
		},
		music: {
			// game music
			gametrack: 'data/music/game.mp3'
		}
	}
};

//
// custom asset handlers
//
loader.handler.sfx = (filenames, ready) => {
	const sfx = new Howl({
		src: filenames,
		autoplay: false,
		loop: false,
		volume: 1,
		onload: () => ready(sfx),
		onloaderror: ready
	});
};

loader.handler.music = (filenames, ready) => {
	const sfx = new Howl({
		src: filenames,
		autoplay: false,
		loop: true,
		volume: 1,
		onload: () => ready(sfx),
		onloaderror: ready
	});
};