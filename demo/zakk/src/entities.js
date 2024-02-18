/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// entities.js | Implements game entities.

/*jshint esversion:9*/

const entities = {};

//
// player entity
//
entities.player = function(scene, x, y, properties) {
	myst.compose(
		this,
		new components.position(x, y),
		new components.velocity(),
		new components.acceleration(0, GRAVITY),
		new components.size(20, 40)
	);
};

/*
//
//  Entity base class
//
class Entity {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.bbox = 0;
	}
	draw() {
		console.log('draw from entity!');
	}
}

//
//  Player class
//
class Player extends Entity {
	constructor() {
		super();
	}
	draw() {
		console.log('draw from player!');
	}
}

*/