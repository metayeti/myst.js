/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// constants.js | Defines game constants.

/*jshint esversion:9*/

//
// tileset constants
//
const TILESIZE = 20;
const MASTER_TILESET_COLS = 10;

//
// viewport constants
//
const VIEWPORT_W = 420;
const VIEWPORT_H = 340;
const VIEWPORT_TILES_X = Math.floor(VIEWPORT_W / TILESIZE) + 1;
const VIEWPORT_TILES_Y = Math.floor(VIEWPORT_H / TILESIZE) + 1;

//
// animation constants
//
const UNIFORM_ANIM_INTERVAL = 8;

//
// direction constants
//
const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

//
// physics constants
//
const GRAVITY = 1.1;