/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// components.js | Implements components which make up game entities.

/*jshint esversion:9*/

const components = {
	position: function(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	},
	velocity: function(vx = 0, vy = 0) {
		this.vx = vx;
		this.vy = vy;
	},
	acceleration: function(ax = 0, ay = 0) {
		this.ax = ax;
		this.ay = ay;
	},
	size: function(width = 0, height = 0) {
		this.width = width;
		this.height = height;
		// respective x and y tile-count this object occupies on the game grid
		this.tilesX = Math.floor(width % TILESIZE);
		this.tilesY = Math.floor(height % TILESIZE);
	},
	tile: function(tile = [0, 0]) { // depends on <position, size>
		this.tile = tile;
	},
	animation: function() {
	},
	boundingbox: function(x = 0, y = 0, width = 0, height = 0) { // depends on <position, size>
		this.bbox = {
			x: x,
			y: y,
			width: width,
			height: height
		};
	}
};