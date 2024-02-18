/*
 * Zakk
 * myst.js game demo
 * This project implements a simple HTML5 game.
 */

// world.js | Implements the World class.

/*jshint esversion:9*/

const World = function() {
	this.width = 0;
	this.height = 0;
	this.entities = [];

	this.loadLevel = function(levelData) {
		this.width = levelData.width;
		this.height = levelData.height;
		// extract layers
		let layer_background,
			layer_walls,
			layer_entities;
		for (let i = 0; i < 3; i++) {
			const layer = levelData.layers[i];
			const layerName = layer.name.toLowerCase();
			const layerType = layer.type.toLowerCase();

			if (layerName === 'background' && layerType === 'tilelayer') {
				layer_background = layer;
			}
			else if (layerName === 'walls' && layerType === 'tilelayer') {
				layer_walls = layer;
			}
			else if (layerName === 'entities' && layerType === 'objectgroup') {
				layer_entities = layer;
			}
		}

		// construct level
		this.map = new myst.Grid2D(this.width, this.height);
		for (let mapy = 0; mapy < this.height; mapy++) {
			for (let mapx = 0; mapx < this.width; mapx++) {
				const dataIndex = mapx + mapy * this.width;
				this.map.set(mapx, mapy, [
					layer_background.data[dataIndex] - 1,
					layer_walls.data[dataIndex] - 1
				]);
			}
		}
	};
};