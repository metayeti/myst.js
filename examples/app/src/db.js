/*
 * myst.js Example browser and live editor
 *
 * Copyright (c) 2021 Danijel Durakovic
 * MIT License
 *
 * db.js
 * Host application examples database.
 *
 */
 
var _host_db = (function() { "use strict"

var store = {};

var public_api = {
	// adds example source to database
	add: function(categoryName, exampleName, code) {
		if (!store[categoryName]) {
			store[categoryName] = {};
		}
		store[categoryName][exampleName] = code;
	},
	// returns example source
	get: function(categoryName, exampleName) {
		return (store[categoryName] && store[categoryName][exampleName])
			? store[categoryName][exampleName]
			: "";
	},
	// returns true if example exists
	has: function(categoryName, exampleName) {
		return Boolean(store[categoryName] && store[categoryName][exampleName]);
	}
};

return public_api;

}());
