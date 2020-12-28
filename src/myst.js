/*
 * myst.js
 * Tiny HTML5 game engine
 *
 * (c) 2020 Danijel Durakovic
 * MIT License
 *
 */

/*jshint globalstrict:true*/
/*jshint browser:true*/

/**
 * @file myst.js
 * @version 0.9.1
 * @author Danijel Durakovic
 * @copyright 2020
 */

"use strict";

/**
 * myst.js namespace
 * @namespace
 */
var myst = {};

////////////////////////////////////////////////////////////////////////////////////
//
//  Constants
//
////////////////////////////////////////////////////////////////////////////////////

var C_NULL = void 0;
var C_EMPTYF = function(){};

var C_VIEW_DEFAULT = 0;
var C_VIEW_CENTER = 1;
var C_VIEW_SCALE_FIT = 2;
var C_VIEW_SCALE_STRETCH = 3;
var C_VIEW_EXPAND = 4;

////////////////////////////////////////////////////////////////////////////////////
//
//  Common functions
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Composes an object from multiple component objects.
 *
 * @param {...object} var_args - Component objects.
 *
 * @returns {object}
 */
myst.compose = function(/**/) {
	// es6
	if (Object.assign) {
		return Object.assign.apply(null, arguments);
	}
	// non-es6
	var obj = arguments[0];
	var n_args = arguments.length;
	for (var i = 1; i < n_args; ++i) {
		var component = arguments[i];
		if (!component)
			continue;
		for (var key in component) {
			if (component.hasOwnProperty(key)) {
				obj[key] = component[key];
			}
		}
	}
	return obj;
};

/**
 * Returns a number limited to a given range.
 *
 * @param {number} number - Input number.
 * @param {number} min - Lower range boundary.
 * @param {number} max - Upper range boundary.
 *
 * @returns {number}
 */
myst.clamp = function(number, min, max) {
	if (number <= min)
		return min;
	else if (number >= max)
		return max;
	return number;
};

/**
 * Returns a random integer in range (inclusive).
 *
 * @param {number} min - Lower range boundary.
 * @param {number} max - Upper range boundary.
 *
 * @returns {number}
 */
myst.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns the result of a coin flip.
 *
 * @returns {bool}
 */
myst.coinFlip = function() {
	return 1 == Math.floor(Math.random() * 2);
};

/**
 * Shuffles a list of elements. This method modifies the original array.
 *
 * @param {array} list
 */
myst.shuffle = function(list) {
	// fisher-yates shuffle
	var i = list.length;
	while (--i) {
		var r = Math.floor(Math.random() * (i + 1));
		var tmp = list[i];
		list[i] = list[r];
		list[r] = tmp;
	}
};

/**
 * Picks an element from a list at random.
 *
 * @param {array} list
 *
 * @returns {number}
 */
myst.choose = function(list) {
	if (list instanceof Array) {
		return list[Math.floor(Math.random() * list.length)];
	}
};

/**
 * Checks whether a point resides within a given rectangle.
 *
 * @param {number} x - Point x coordinate.
 * @param {number} y - Point y coordinate.
 * @param {number} rx - Rectangle x coordinate.
 * @param {number} ry - Rectangle y coordinate.
 * @param {number} rw - Rectangle width.
 * @param {number} rh - Rectangle height.
 *
 * @returns {bool}
 */
myst.pointInRect = function(x, y, rx, ry, rw, rh) {
	return x >= rx && x < rx + rw && y >= ry && y < ry + rh;
};

/**
 * Checks whether a point resides within a given circle.
 *
 * @param {number} x - Point x coordinate.
 * @param {number} y - Point y coordinate.
 * @param {number} cx - Circle x center coordinate.
 * @param {number} cy - Circle y center coordinate.
 * @param {number} radius - Circle radius.
 *
 * @returns {bool}
 */
myst.pointInCircle = function(x, y, cx, cy, radius) {
	return Math.pow(x - cx, 2) + Math.pow(y - cy, 2) < Math.pow(radius, 2);
};

/**
 * Checks whether two line segments A-B and C-D intersect. Ignores colinear segment intersections.
 *
 * @param {number} ax - Point A x coordinate.
 * @param {number} ay - Point A y coordinate.
 * @param {number} bx - Point B x coordinate.
 * @param {number} by - Point B y coordinate.
 * @param {number} cx - Point C x coordinate.
 * @param {number} cy - Point C y coordinate.
 * @param {number} dx - Point D x coordinate.
 * @param {number} dy - Point D y coordinate.
 *
 * @returns {bool}
 */
myst.linesIntersect = function(ax, ay, bx, by, cx, cy, dx, dy) {
	var ccwise = function(ax, ay, bx, by, cx, cy) {
		return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
	};
	return ccwise(ax, ay, cx, cy, dx, dy) != ccwise(bx, by, cx, cy, dx, dy) &&
		ccwise(ax, ay, bx, by, cx, cy) != ccwise(ax, ay, bx, by, dx, dy);
};

/**
 * Returns the distance from point A to point B.
 */
myst.pointToPointDistance = function(ax, ay, bx, by) {
	return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2));
};

/**
 * Returns the distance from point P to line segment A-B.
 *
 * @param {number} x - Point P x coordinate.
 * @param {number} y - Point P y coordinate.
 * @param {number} ax - Point A x coordinate.
 * @param {number} ay - Point A y coordinate.
 * @param {number} bx - Point B x coordinate.
 * @param {number} by - Point B y coordinate.
 *
 * @returns {bool}
 */
myst.pointToLineDistance = function(x, y, ax, ay, bx, by) {
	var dx = bx - ax;
	var dy = by - ay;
	var l = Math.pow(dx, 2) + Math.pow(dy, 2);
	if (l == 0) {
		return 0;
	}
	var t = Math.min(1, Math.max(0, (dx * (x - ax) + dy * (y - ay)) / l));
	var cx = ax + t * dx;
	var cy = ay + t * dy;
	return Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
};

/**
 * Moves point A towards point B by a difference of d.
 *
 *
 * @param {number} ax - Point A x coordinate.
 * @param {number} ay - Point A y coordinate.
 * @param {number} bx - Point B x coordinate.
 * @param {number} by - Point B y coordinate.
 * @param {number} d - Distance to move by.
 *
 * @returns {array} Coordinates to point A after moving.
 */
myst.movePoint = function(ax, ay, bx, by, d) {
	var dir = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
	return [
		ax + Math.floor(Math.cos(dir * Math.PI / 180) * d),
		ay + Math.floor(Math.sin(dir * Math.PI / 180) * d)
	];
};

/**
 * Iterates over non-function members of an object.
 *
 * @param {object} collection
 * @param {iterCallback} callback
 */
myst.iter = function(object, callback) {
	for (var key in object) {
		var item = object[key];
		if (object.hasOwnProperty(key) && !(item instanceof Function)) {
			callback(key, item);
		}
	}
};
/**
 * @callback iterCallback
 * @param {string} key - Item's key.
 * @param {object} item - The item itself.
 */

/**
 * Retreives the extension of a filename. Outputs lowercase.
 *
 * @param {string} filename
 *
 * @returns {string}
 */
myst.getFilenameExtension = function(filename) {
	return filename.split('.').pop().toLowerCase();
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Common classes
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Grid2D object.
 *
 * @class myst.Grid2D
 * @classdesc Represents a 2D game grid.
 *
 * @param {number} w - Grid width.
 * @param {number} h - Grid height.
 * @param {number} [defaultValue] - Default value. This value will be used to populate
 *   the grid on clear.
 */
myst.Grid2D = function(w, h, defaultValue) {
	this.width = w;
	this.height = h;
	this.data = new Array(w * h);
	defaultValue = (defaultValue === undefined) ? 0 : defaultValue;

	/**
	 * Fills the grid with default values.
	 */
	this.clear = function() {
		var n = w * h;
		for (var i = 0; i < n; ++i) {
			this.data[i] = defaultValue;
		}
	};

	/**
	 * Retreives an item from the grid.
	 *
	 * @param {number} x - x position in the grid.
	 * @param {number} y - y position in the grid.
	 */
	this.get = function(x, y) {
		return this.data[y * this.width + x];
	};
	/**
	 * Sets an item on the grid.
	 *
	 * @param {number} x - x position in the grid.
	 * @param {number} y - y position in the grid.
	 * @param {object} value - Item value.
	 */
	this.set = function(x, y, value) {
		this.data[y * this.width + x] = value;
	};
};

/**
 * Constructs a Timer object.
 *
 * @class myst.Timer
 * @classdesc A simple timer that ticks at regular intervals.
 *
 * @param {number} interval - Interval at which the timer ticks.
 */
myst.Timer = function(interval) {
	interval = interval || 1;
	if (interval < 1) {
		interval = 1;
	}
	var accumulator = 0;
	/**
	 * Indicates whether the timer has ticked or not.
	 *
	 * @name myst.Timer#ticked
	 * @type boolean
	 * @default false
	 */
	this.ticked = false;
	/**
	 * Runs the timer and reports back the ticked state.
	 *
	 * @returns {bool}
	 */
	this.run = function() {
		accumulator += 1;
		if (accumulator >= interval) {
			accumulator -= interval;
			this.ticked = true;
			return true;
		}
		this.ticked = false;
		return false;
	};
	/**
	 * Resets the timer.
	 */
	this.reset = function() {
		accumulator = 0;
		this.ticked = false;
	};
};

/**
 * Constructs a Tween object.
 *
 * @class myst.Tween
 * @classdesc Class used for tweening values.
 *
 * @param {number} from - Value to tween from.
 * @param {number} to - Value to tween to.
 * @param {number} duration - Duration of tween in milliseconds.
 * @param {tweenUpdateCallback} [onUpdate] - Update callback.
 * @param {function} [onDone] - Triggers when Tween finishes.
 * @param {function} [easef=myst.ease.linear] - Easing function. Use one of the functions from myst.ease
 *   (myst.ease.linear, myst.ease.quadIn, myst.ease.quadOut, myst.ease.quadInOut, myst.ease.backIn or
 *   myst.ease.backOut) or substitute your own.
 * @param {function} [procf] - Value post-process function.
 * @param {function} [resetf] - This function is called whenever the Tween is interrupted through
 *   tween.finish() and is intended for resetting an object's state when using multiple, nested tweens.
 *
 * @example
 * // Tween from 0 to 100 over 1.5 seconds with quadInOut easing
 * (new myst.Tween(0, 100, 1500, function(value) {
 *    console.log(value);
 * }, function() {
 *    console.log('Tween done!');
 * }, myst.ease.quadInOut)).start();
 *
 * @example
 * // Tween from 100 to 0 over 2 seconds with linear easing and floor output values.
 * (new myst.Tween(100, 0, 2000, function(value) {
 *    console.log(value);
 * }, function() {
 *    console.log('Tween done!');
 * }, myst.ease.linear, Math.floor)).start();
 */
myst.Tween = function(from, to, duration, onUpdate, onDone, easef, procf, resetf) {
	if (isNaN(duration) || isNaN(to) || isNaN(from) || duration <= 0) {
		throw new Error('Erroneous parameters for Tween.');
	}
 	if (!(easef instanceof Function)) {
		easef = myst.ease.linear;
	}

	var twTimeout = null;
	var twFrametime = 5;

	var hasUpdate = onUpdate instanceof Function;
	var hasDone = onDone instanceof Function;
	var hasProc = procf instanceof Function;
	var hasReset = resetf instanceof Function;

	function doTween(elapsed) {
		var progress = elapsed / duration;
		var value = from + easef(progress) * (to - from);
		if (hasProc) {
			value = procf(value);
		}
		if (hasUpdate) {
			onUpdate(value);
		}
		if (progress < 1) {
			twTimeout = setTimeout(function() {
				doTween(elapsed + twFrametime);
			}, twFrametime);
		}
		else {
			if (hasUpdate) {
				onUpdate(to);
			}
			if (hasDone) {
				onDone();
			}
			clearTimeout(twTimeout);
			twTimeout = null;
		}
	}

	/**
	 * Halts currently active tween.
	 */
	this.stop = function() {
		clearTimeout(twTimeout);
		twTimeout = null;
	};

	/**
	 * Starts the tween.
	 */
	this.start = function() {
		if (twTimeout === null) {
			doTween(0);
		}
	};

	/**
	 * Restarts the tween.
	 */
	this.restart = function() {
		if (twTimeout !== null) {
			clearTimeout(twTimeout);
		}
		doTween(0);
	};

	/**
	 * Finishes a currently active tween.
	 */
	this.finish = function() {
		if (twTimeout !== null) {
			clearTimeout(twTimeout);
			twTimeout = null;
			if (onUpdate instanceof Function) {
				onUpdate(to);
			}
			if (hasReset) {
				resetf();
			}
		}
	};

	/**
	 * Reports back the tween active state.
	 *
	 * @returns {bool}
	 */
	this.isActive = function() {
		return (twTimeout !== null);
	};
};
/**
 * @callback tweenUpdateCallback
 * @param {number} value - Current tween value.
 */

/**
 * Easing functions for the Tween class.
 */
myst.ease = {
	linear: function(t) {
		return t;
	},
	quadIn: function(t) {
		return t * t;
	},
	quadOut: function(t) {
		return t * (2 - t);
	},
	quadInOut: function(t) {
		if (t < 0.5) {
			return 2 * t * t;
		}
		return (4 - 2 * t) * t - 1;
	},
	backIn: function(t) {
		return t * t * t - t * (0.8) * Math.sin(t * Math.PI);
	},
	backOut: function(t) {
		return t * t * t - t * (-1.2) * Math.sin(t * Math.PI);
	}
};

////////////////////////////////////////////////////////////////////////////////////
//
//  AssetLoader class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs an AssetLoader object.
 *
 * @class myst.AssetLoader
 * @classdesc Preloads and stores game assets.
 *
 */
myst.AssetLoader = function() {
	var self = this;
	var bank = {};

	/**
	 * A list of load handlers. These can be overriden by the user or used to create custom
	 * asset load handlers. The name of the function and the name of the category within
	 * an asset list must match.
	 *
	 * AssetLoader provides handlers for graphics, data and text. Graphics handler is used
	 * for loading image files. Data handler is used for loading JSON files, and Text handler
	 * is used for loading plaintext files.
	 *
	 * Handler functions can be overriden by the user if needed. Custom handlers can be defined
	 * to handle custom data like audio, levels, or other custom data formats. A handler is an
	 * async function that receives a filename and passes the processed object to ready().
	 *
	 * @type {object}
	 *
	 * @example
	 * // Create a custom handler
	 * var loader = new myst.AssetLoader();
	 * loader.handler.customCategory = function(filename, ready) {
	 *    // handler for customCategory
	 *    // .. do something with filename ..
	 *    var data = 'test';
	 *    // process the asset and return data with ready when done
	 *    ready(data);
	 * };
	 *
	 * @example
	 * // Override default graphics handler
	 * loader.handler.graphics = function(filename, ready) {
	 *    // ...
	 * };
	 */
	this.handler = {};

	// default graphics load handler - used for loading image files
	this.handler.graphics = function(filename, ready) {
		var img = new Image();
		img.src = filename;
		img.addEventListener('load', function() {
			ready(img);
		});
	};

	// default data load handler - used for loading JSON files
	this.handler.data = function(filename, ready) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', filename, true);
		xhr.send(null);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var response = xhr.responseText;
				var data = JSON.parse(response);
				ready(data);
			}
		};
	};

	// default text load handler - used for loading text files
	this.handler.text = function(filename, ready) {
		var xhr = new XMLHttpRequest();
		xhr.open('get', filename, true);
		xhr.send(null);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				var response = xhr.responseText;
				var data = response;
				ready(data);
			}
		};
	};

	/**
	 * Loads assets from an asset list. Iterates over categories in the list and then calls
	 * the appropriate load handler on every item in the category.
	 *
	 * @param {object} options
	 * @param {object} options.assets - A categorized list of assets.
	 * @param {function} [options.done] - Triggers when all assets are done loading.
	 * @param {progressCallback} [options.progress] - Triggers when a single asset is loaded.
	 *
	 * @example
	 * var assetList = {
	 *    graphics: {
	 *       mysprite: 'mysprite.png',
	 *       myimage: 'myimage.jpg'
	 *    },
	 *    json: {
	 *       mydata: 'mydata.json'
	 *    }
	 * };
	 * var assetLoader = new myst.AssetLoader();
	 * assetLoader.load({
	 *    assets: assetList,
	 *    done: function() {
	 *       console.log('All assets loaded and ready!');
	 *    }
	 * });
	 */
	this.load = function(options) {
		var assetList = options.assets;
		if (!assetList) {
			return;
		}
		var done = options.done || C_EMPTYF;
		var progress = options.progress || C_EMPTYF;
		// count assets
		var n_loaded = 0;
		var n_toload = 0;
		var n_categories = 0;
		myst.iter(assetList, function(category, itemList) {
			n_categories++;
			myst.iter(itemList, function() {
				n_toload++;
			});
		});
		function advanceLoad() {
			n_loaded++;
			progress(n_loaded, n_toload);
			if (n_loaded === n_toload)
				done();
		}
		// call appropriate handlers on items
		myst.iter(assetList, function(category, itemList) {
			var loadHandler = self.handler[category];
			if (loadHandler instanceof Function) {
				if (!bank[category]) {
					bank[category] = {};
				}
				myst.iter(itemList, function(key, filename) {
					loadHandler(filename, function(asset) {
						bank[category][key] = asset;
						advanceLoad();
					});
				});
			}
		});
		// return the resource bank
		return bank;
	};

	/**
	 * Retreives loaded assets.
	 *
	 * @param {...object} var_args - Asset or asset list to retreive.
	 *
	 * @returns {object}
	 *
	 * @example
	 * // retreive a single asset from a category, result is a single object
	 * loader.get('category.key');
	 * // retreive multiple assets, result is an object of objects: {key1: data, key2: data}
	 * loader.get('category.key1', 'category.key2');
	 * // alternative syntaxes
	 * loader.get('category.key1 category.key2');
	 */
	this.get = function(/**/) {
		var n_args = arguments.length;
		var tokens;
		var tokenPair;
		var output = {};
		var n_objects = 0;
		var category, assetName;
		var assetData;
		var i, j;
		for (i = 0; i < n_args; i++) {
			if (typeof arguments[i] !== 'string')
				continue;
			tokens = arguments[i]
				.trim()
				.replace(/,/g, '')
				.split(/\s+/);
			for (j = 0; j < tokens.length; j++) {
				tokenPair = tokens[j].split('.');
				if (tokenPair.length === 2) {
					category = tokenPair[0];
					assetName = tokenPair[1];
					assetData = (bank[category]) ? bank[category][assetName] : undefined;
					output[assetName] = assetData;
					n_objects++;
				}
			}
		}
		if (n_objects == 1) {
			return output[Object.keys(output)[0]];
		}
		else if (n_objects > 1) {
			return output;
		}
	};


	/**
	 * A From object containing a store from the main asset bank with the
	 * associated get function.
	 */
	function FromObject(store) {
		this.get = function(/**/) {
			var n_args = arguments.length;
			var tokens;
			var output = {};
			var n_objects = 0;
			var assetName;
			var assetData;
			var i, j;
			for (i = 0; i < n_args; i++) {
				if (typeof arguments[i] !== 'string')
					continue;
				tokens = arguments[i]
					.trim()
					.replace(/,/g, '')
					.split(/\s+/);
				for (j = 0; j < tokens.length; j++) {
					assetName = tokens[j];
					assetData = store[assetName];
					output[assetName] = assetData;
					n_objects++;
				}
			}
			if (n_objects == 1) {
				return output[Object.keys(output)[0]];
			}
			else if (n_objects > 1) {
				return output;
			}
		};
	}

	/**
	 * Retreives a store of loaded assets from the main bank with the associated get function.
	 *
	 * @param {string} category - Asset category to extract the store from.
	 *
	 * @returns {object}
	 *
	 * @example
	 * // retreive a single asset from a category, result is a single object
	 * loader.from('category').get('key');
	 * // retreive multiple assets, result is an object of objects: {key1: data, key2: data}
	 * loader.from('category').get('key1', 'key2');
	 * // alternative syntax
	 * loader.from('category').get('key1, key2');
	 * loader.from('category').get('key1 key2');
	 */
	this.from = function(category) {
		if (typeof category === 'string') {
			return new FromObject(bank[category.trim()]);
		}
	};

	/**
	 * Retreives the resource bank.
	 */
	this.getResources = function() {
		return bank;
	};
};
/**
 * @callback progressCallback
 * @param {number} n_loaded - Total number of items loaded.
 * @param {number} n_toload - Total number of items to load.
 */

////////////////////////////////////////////////////////////////////////////////////
//
//  Input class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs an Input object.
 *
 * @class myst.Input
 * @classdesc Provides features for dealing with mouse and touch input.
 *
 * @param {object} game - Reference to Game object to capture input on.
 */
myst.Input = function(game) {
	// input agents
	var MOUSE = 0;
	var TOUCH = 1;

	// capture element
	var element = game.getSurface().getCanvas();
	var elementOwner = element.parentElement;

	function translateCoords(e, agent) {
		var ratio_x, ratio_y;
		switch(game.getViewMode()) {
			case C_VIEW_SCALE_FIT:
				ratio_x = ratio_y = (element.offsetWidth < elementOwner.offsetWidth) ?
					element.height / elementOwner.offsetHeight :
					element.width / elementOwner.offsetWidth;
				break;
			case C_VIEW_SCALE_STRETCH:
				ratio_x = element.width / elementOwner.offsetWidth;
				ratio_y = element.height / elementOwner.offsetHeight;
				break;
			case C_VIEW_EXPAND:
			case C_VIEW_CENTER:
			case C_VIEW_DEFAULT:
				ratio_x = ratio_y = 1;
				break;
		}
		var bounds = element.getBoundingClientRect();
		var px = (agent === TOUCH) ? e.changedTouches[0].clientX : e.clientX;
		var py = (agent === TOUCH) ? e.changedTouches[0].clientY : e.clientY;
		return [
			Math.floor((px - bounds.left) * ratio_x),
			Math.floor((py - bounds.top) * ratio_y)
		];
	}

	// event callback lists
	var cb = { press: [], move: [], release: [] };

	// event handlers
	function mouseHandler(callbackList, e) {
		if (e.preventDefault)
			e.preventDefault();
		var button = e.which || e.button;
		if (button !== 1)
			return;
		// translate
		var coords = translateCoords(e, MOUSE);
		// dispatch
		var i = callbackList.length;
		while (i--) {
			var cbObj = callbackList[i];
			var cbFunc = cbObj[0];
			var cbState = cbObj[1];
			if (!cbState || cbState._active) {
				cbFunc(coords);
			}
		}
		return false;
	}

	function mouseMoveHandler(callbackList, e) {
		if (e.preventDefault)
			e.preventDefault();
		// translate
		var coords = translateCoords(e, MOUSE);
		// dispatch
		var i = callbackList.length;
		while (i--) {
			var cbObj = callbackList[i];
			var cbFunc = cbObj[0];
			var cbState = cbObj[1];
			if (!cbState || cbState._active) {
				cbFunc(coords);
			}
		}
		return false;
	}

	function touchHandler(callbackList, e) {
		if (e.preventDefault)
			e.preventDefault();
		if (e.touches.length > 1)
			return;
		// translate
		var coords = translateCoords(e, TOUCH);
		// dispatch
		var i = callbackList.length;
		while (i--) {
			var cbObj = callbackList[i];
			var cbFunc = cbObj[0];
			var cbState = cbObj[1];
			if (!cbState || cbState._active) {
				cbFunc(coords);
			}
		}
		return false;
	}

	// attach listeners
	element.addEventListener('mousedown', function(e) {
		mouseHandler(cb.press, e);
	});
	element.addEventListener('touchstart', function(e) {
		touchHandler(cb.press, e);
	});
	window.addEventListener('mousemove', function(e) {
		mouseMoveHandler(cb.move, e);
	});
	window.addEventListener('touchmove', function(e) {
		touchHandler(cb.move, e);
	});
	window.addEventListener('mouseup', function(e) {
		mouseHandler(cb.release, e);
	});
	window.addEventListener('touchend', function(e) {
		touchHandler(cb.release, e);
	});

	/**
	 * A Bind object used to associate events with states.
	 */
	function BindObject(cbRef) {
		this.bindTo = function(state) {
			if (state) {
				cbRef[1] = state;
			}
		};
	}

	/**
	 * Registers an event.
	 *
	 * @param {string} eventType - Type of event to register: press, move or release.
	 * @param {inputEventCallback} callback - Event callback.
	 * @param {string} [id] - Event id.
	 *
	 * @returns {object} - BindObject
	 */
	this.on = function(eventType, callback, id) {
		var callbackList = cb[eventType];
		var cbRef = [callback, C_NULL, id];
		callbackList.push(cbRef);
		return new BindObject(cbRef);
	};
	/**
	 * @callback inputEventCallback
	 * @param {array} coordinates - Event coordinates.
	 */

	/**
	 * Deregisters an event.
	 *
	 * @param {string} [eventType] - Type of event to unregister: press, move or release.
	 * @param {string} [id] - Event id. If omitted, all events of named type will be removed.
	 */
	this.off = function(eventType, id) {
		if (!eventType && !id) {
			cb = { press: [], move: [], release: [] };
		}
		else if (!id) {
			cb[eventType] = [];
		}
		else {
			var callbackList = cb[eventType];
			if (!callbackList) {
				return;
			}
			var i = callbackList.length;
			while (i--) {
				var cbObj = callbackList[i];
				var cbId = cbObj[2];
				if (cbId === id) {
					callbackList.splice(i, 1);
				}
			}
		}
	};
};

////////////////////////////////////////////////////////////////////////////////////
//
//  KeyInput class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a KeyInput object.
 *
 * @class myst.KeyInput
 * @classdesc Provides features for dealing with keyboard input.
 */
myst.KeyInput = function() {
	var self = this;

	var eventQueue = [];
	var keyBuffer = [];

	function addKeyEvent(type, keycode) {
		// add event to the queue
		eventQueue.push({
			type: type,
			keycode: keycode
		});
	}

	// event type constants
	this.KEYDOWN = 0;
	this.KEYUP = 1;

	// attach listeners
	document.addEventListener('keydown', function(e) {
		var key = e.keyCode || e.which;
		// prevent default backspace behavior
		if (key === self.keyBackspace || key === self.keyAlt)
			e.preventDefault();
		if (!keyBuffer[key]) {
			keyBuffer[key] = true;
			addKeyEvent(self.KEYDOWN, key);
		}
	});
	document.addEventListener('keyup', function(e) {
		var key = e.keyCode || e.which;
		if (key === self.keyBackspace || key === self.keyAlt)
			e.preventDefault();
		if (keyBuffer[key]) {
			delete keyBuffer[key];
			addKeyEvent(self.KEYUP, key);
		}
	});
	window.onblur = function() {
		// clear event queue and key buffer on defocus so we don't end up with dangling events
		eventQueue = [];
		keyBuffer = [];
	};

	/**
	 * Clear the event queue and key buffer.
	 */
	this.clear = function() {
		eventQueue = [];
		keyBuffer = [];
	};

	/**
	 * Poll a single keyboard event from the queue.
	 *
	 * @returns {keyboardEvent}
	 */
	this.pollEvent = function() {
		return eventQueue.shift();
	};
	/**
	 * @typedef {object} keyboardEvent
	 * @property {number} type - Either a KeyInput.KEYDOWN or a KeyInput.KEYUP.
	 * @property {number} keycode
	 */

	/**
	 * Checks if a keycode is alphanumeric.
	 *
	 * @param {number} keycode
	 *
	 * @returns {bool}
	 */
	this.isAlphanumeric = function(keycode) {
		return !(!(keycode > 47 && keycode < 58) &&
			!(keycode > 64 && keycode < 91) &&
			!(keycode > 96 && keycode < 123));
	};

	/**
	 * Converts a keycode into a character.
	 *
	 * @param {number} keycode
	 *
	 * @returns {string}
	 */
	this.getCharacter = function(keycode) {
		return String.fromCharCode(keycode);
	};

	/**
	 * Gets keydown state for a given keycode.
	 *
	 * @param {number} keycode
	 *
	 * @returns {bool}
	 */
	this.isKeyDown = function(keycode) {
		var keyState = keyBuffer[keycode];
		return keyState !== undefined && keyState;
	};

	// keycodes
	this.keyCancel = 3; this.keyHelp = 6; this.keyBackspace = 8; this.keyTab = 9; this.keyClear = 12;
	this.keyEnter = 13; this.keyReturn = 14; this.keyShift = 16; this.keyControl = 17; this.keyAlt = 18;
	this.keyPause = 19; this.keyCapsLock = 20; this.keyEscape = 27; this.keySpace = 32; this.keyPageUp = 33;
	this.keyPageDown = 34; this.keyEnd = 35; this.keyHome = 36; this.keyLeft = 37; this.keyUp = 38;
	this.keyRight = 39; this.keyDown = 40; this.keyPrintscreen = 44; this.keyInsert = 45; this.keyDelete = 46;
	this.key0 = 48; this.key1 = 49; this.key2 = 50; this.key3 = 51; this.key4 = 52; this.key5 = 53; this.key6 = 54;
	this.key7 = 55; this.key8 = 56; this.key9 = 57; this.keySemicolon = 59; this.keyEquals = 61; this.keyA = 65;
	this.keyB = 66; this.keyC = 67; this.keyD = 68; this.keyE = 69; this.keyF = 70; this.keyG = 71; this.keyH = 72;
	this.keyI = 73; this.keyJ = 74; this.keyK = 75; this.keyL = 76; this.keyM = 77; this.keyN = 78; this.keyO = 79;
	this.keyP = 80; this.keyQ = 81; this.keyR = 82; this.keyS = 83; this.keyT = 84; this.keyU = 85; this.keyV = 86;
	this.keyW = 87; this.keyX = 88; this.keyY = 89; this.keyZ = 90; this.keyContextMenu = 93; this.keyNumpad0 = 96;
	this.keyNumpad1 = 97; this.keyNumpad2 = 98; this.keyNumpad3 = 99; this.keyNumpad4 = 100; this.keyNumpad5 = 101;
	this.keyNumpad6 = 102; this.keyNumpad7 = 103; this.keyNumpad8 = 104; this.keyNumpad9 = 105; this.keyMultiply = 106;
	this.keyAdd = 107; this.keySeparator = 108; this.keySubtract = 109; this.keyDecimal = 110; this.keyDivide = 111;
	this.keyF1 = 112; this.keyF2 = 113; this.keyF3 = 114; this.keyF4 = 115; this.keyF5 = 116; this.keyF6 = 117;
	this.keyF7 = 118; this.keyF8 = 119; this.keyF9 = 120; this.keyF10 = 121; this.keyF11 = 122; this.keyF12 = 123;
	this.keyF13 = 124; this.keyF14 = 125; this.keyF15 = 126; this.keyF16 = 127; this.keyF17 = 128; this.keyF18 = 129;
	this.keyF19 = 130; this.keyF20 = 131; this.keyF21 = 132; this.keyF22 = 133; this.keyF23 = 134; this.keyF24 = 135;
	this.keyNumLock = 144; this.keyScrollLock = 145; this.keyComma = 188; this.keyPeriod = 190; this.keySlash = 191;
	this.keyBackQuote = 192; this.keyOpenBracket = 219; this.keyBackSlash = 220; this.keyCloseBracket = 221;
	this.keyQuote = 222; this.keyMeta = 224;
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Configuration class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Configuration object.
 *
 * @class myst.Configuration
 * @classdesc A class for persistent configuration using local storage.
 *
 * @param {string} key - Local storage key.
 * @param {object} defaultConfiguration - Configuration template (loaded when local storage
 *   key is not found).
 */
myst.Configuration = function(key, defaultConfiguration) {
	var self = this;
	/**
	 * Save configuration to local storage.
	 */
	this.save = function() {
		localStorage.setItem(key, JSON.stringify(self));
	};
	/**
	 * Load configuration.
	 */
	this.load = function() {
		var localConfig = localStorage.getItem(key);
		var config = (localConfig) ? JSON.parse(localConfig) : defaultConfiguration;
		// clear all config beforehand
		myst.iter(self, function(key) {
			delete self[key];
		});
		// populate config
		myst.iter(config, function(key, item) {
			self[key] = item;
		});
	};
	/**
	 * Remove configuration.
	 */
	this.remove = function() {
		localStorage.removeItem(key);
	};
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Render class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Render object.
 *
 * @class myst.Render
 * @classdesc Provides various drawing functions.
 *
 * @param {object} ctx - Rendering context.
 *
 */
myst.Render = function(ctx) {
	// ctx reference for custom functions
	this.ctx = ctx;

	/**
	 * Sets the global alpha value.
	 *
	 * @param {number} [alpha=1] - A value in range from 0 to 1.
	 */
	this.setAlpha = function(alpha) {
		if (alpha === undefined)
			alpha = 1;
		else if (alpha <= 0)
			alpha = 0;
		else if (alpha >= 1)
			alpha = 1;
		ctx.globalAlpha = alpha;
	};

	/**
	 * Saves context and sets up rotation translation; restore() needs to be
	 * called to restore the saved context.
	 *
	 * @param {number} angle - Angle in degrees.
	 * @param {array} point - Point to rotate around.
	 */
	this.rotate = function(angle, point) {
		ctx.save();
		ctx.translate(point[0], point[1]);
		ctx.rotate(angle * Math.PI / 180);
		ctx.translate(-point[0], -point[1]);
	};

	/**
	 * Restores saved context.
	 */
	this.restore = function() {
		ctx.restore();
	};

	/**
	 * Renders a line.
	 *
	 * @param {number} x1 - Line x1 coordinate.
	 * @param {number} y1 - Line y1 coordinate.
	 * @param {number} x2 - Line x2 coordinate.
	 * @param {number} y2 - Line y2 coordinate.
	 * @param {string} [color="#fff"] - Line color.
	 * @param {number} [width=1] - Line width.
	 */
	this.line = function(x1, y1, x2, y2, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	};

	/**
	 * Renders a rectangle.
	 *
	 * @param {number} x - Rectangle x coordinate.
	 * @param {number} y - Rectangle y coordinate.
	 * @param {number} w - Rectangle width.
	 * @param {number} h - Rectangle height.
	 * @param {string} [color="#fff"] - Rectangle line color.
	 * @param {number} [width=1] - Rectangle line width.
	 */
	this.rect = function(x, y, w, h, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.strokeRect(x, y, w, h);
	};

	/**
	 * Renders a filled rectangle.
	 *
	 * @param {number} x - Rectangle x coordinate.
	 * @param {number} y - Rectangle y coordinate.
	 * @param {number} w - Rectangle width.
	 * @param {number} h - Rectangle height.
	 * @param {string} [color="#fff"] - Rectangle fill color.
	 */
	this.rectFill = function(x, y, w, h, color) {
		color = (color === undefined) ? '#fff' : color;
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);
	};

	/**
	 * Renders an arc.
	 *
	 * @param {number} x - Arc x coordinate.
	 * @param {number} y - Arc y coordinate.
	 * @param {number} rad - Arc radius.
	 * @param {number} start - Arc start angle.
	 * @param {number} end - Arc end angle.
	 * @param {string} [color="#fff"] - Arc color.
	 * @param {number} [width=1] - Arc line width.
	 */
	this.arc = function(x, y, rad, start, end, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.arc(x, y, rad, start, end);
		ctx.stroke();
	};

	/**
	 * Renders a circle.
	 *
	 * @param {number} x - Circle x center coordinate.
	 * @param {number} y - Circle y center coordinate.
	 * @param {number} rad - Circle radius.
	 * @param {string} [color="#fff"] - Circle line color.
	 * @param {number} [width=1] - Circle line width.
	 */
	this.circle = function(x, y, rad, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.arc(x, y, rad, 0, Math.PI * 2);
		ctx.stroke();
	};

	/**
	 * Renders a filled circle.
	 *
	 * @param {number} x - Circle x coordinate.
	 * @param {number} y - Circle y coordinate.
	 * @param {number} rad - Circle radius.
	 * @param {string} [color="#fff"] - Circle fill color.
	 */
	this.circleFill = function(x, y, rad, color) {
		color = (color === undefined) ? '#fff' : color;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, rad, 0, Math.PI * 2);
		ctx.fill();
		ctx.closePath();
	};

	/**
	 * Renders a polygon.
	 *
	 * @param {array} points - A list of polygon points. Each point is an array of length two,
	 *   containing the coordinates.
	 * @param {string} color - Polygon color.
	 */
	this.polygon = function(points, color) {
		color = (color === undefined) ? '#fff' : color;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(points[0][0], points[0][1]);
		var n_points = points.length;
		for (var i = 1; i < n_points; i++) {
			var p = points[i];
			ctx.lineTo(p[0], p[1]);
		}
		ctx.closePath();
		ctx.fill();
	};

	/**
	 * Renders graphics.
	 *
	 * @param {object} gfx - Source graphics.
	 * @param {number} x - Graphics x coordinate.
	 * @param {number} y - Graphics y coordinate.
	 * @param {number} [w] - Graphics width.
	 * @param {number} [h] - Graphics height.
	 */
	this.graphics = function(gfx, x, y, w, h) {
		if (w === undefined || h === undefined) {
			ctx.drawImage(gfx, x, y);
		}
		else {
			ctx.drawImage(gfx, x, y, w, h);
		}
	};

	/**
	 * Renders a surface.
	 *
	 * @param {object} surface - Surface object
	 * @param {number} x - Destination x coordinate.
	 * @param {number} y - Destination y coordinate.
	 */
	this.surface = function(surface, x, y) {
		ctx.drawImage(surface.canvas, x, y);
	};

	/**
	 * Renders a tile from a tileset.
	 *
	 * @param {object} gfx - Source graphics.
	 * @param {number} x - Tile x coordinate.
	 * @param {number} y - Tile y coordinate.
	 * @param {number} w - Tile width.
	 * @param {number} h - Tile height.
	 * @param {number} sx - Source x coordinate.
	 * @param {number} sy - Source y coordinate.
	 */
	this.tile = function(gfx, x, y, w, h, sx, sy) {
		ctx.drawImage(gfx, sx, sy, w, h, x, y, w, h);
	};

	/**
	 * Renders a stretched tile from a tileset.
	 *
	 * @param {object} gfx - Source graphics.
	 * @param {number} x - Tile x coordinate.
	 * @param {number} y - Tile y coordinate.
	 * @param {number} sw - Source width.
	 * @param {number} sh - Source height.
	 * @param {number} sx - Source x coordinate.
	 * @param {number} sy - Source y coordinate.
	 * @param {number} w - Tile width.
	 * @param {number} h - Tile height.
	 */
	this.stretchTile = function(gfx, x, y, sw, sh, sx, sy, w, h) {
		ctx.drawImage(gfx, sx, sy, sw, sh, x, y, w, h);
	};

	/**
	 * Renders text. Note that this method is slow when executed repeatedly.
	 * Pre-render texts onto surfaces whenever possible.
	 *
	 * @param {string} text - Text to display.
	 * @param {number} x - Text x coordinate.
	 * @param {number} y - Text y coordinate.
	 * @param {string} [color=#000] - Color code.
	 * @param {string} [alignment=left] - Text alignment: left, center or right.
	 * @param {string} [font=11px sans-serif] - Font to use.
	 */
	this.text = function(text, x, y, color, alignment, font) {
		color = (color === undefined) ? '#000' : color;
		alignment = (alignment === undefined) ? 'left' : alignment;
		font = (font === undefined) ? '11px sans-serif' : font;
		ctx.textBaseline = 'top';
		ctx.fillStyle = color;
		ctx.textAlign = alignment;
		ctx.font = font;
		ctx.fillText(text, x, y);
	};

	/**
	 * Renders ASCII text with custom bitmap font.
	 *
	 * @param {myst.Font} font - Bitmap font.
	 * @param {string} text - Text to display.
	 * @param {number} x - Text x coordinate.
	 * @param {number} y - Text y coordinate.
	 * @param {number} [color=0] - Color index.
	 * @param {number} [align=0] - Align left: 0, center: 1, or right: 2.
	 */
	this.bmptext = function(font, text, x, y, color, align) {
		if (color === undefined)
			color = 0;
		var len = text.length;
		var fw = font.width;
		var fh = font.height;
		var fgfx = font.gfx;
		var ry = font.tilesH * color;
		var acc = 0;
		var varw = font.varwidth;
		var offset = 0;
		var textw;
		var i, ci, cf;
		var tileOffset = font.tileOffset;
		if (align > 0) {
			if (varw) {
				for (i = 0; i < len; i++) {
					ci = text.charCodeAt(i) - 32;
					acc += font.widths[ci] + font.spacing;
				}
				textw = acc;
				acc = 0;
			}
			else {
				textw = len * fw;
			}
			offset = (align == 1) ? Math.floor(textw / 2) : textw;
		}
		for (i = 0; i < len; i++) {
			ci = text.charCodeAt(i) - 32;
			cf = ci - tileOffset;
			var px;
			if (varw) {
				px = x + acc;
				acc += font.widths[ci] + font.spacing;
			}
			else {
				px = x + i * (fw + font.spacing);
			}
			if (ci === 0)
				continue;
			var cx = fw * (cf % font.tilesPerRow);
			var cy = fh * Math.floor(cf / font.tilesPerRow) + ry;
			ctx.drawImage(fgfx, cx, cy, fw, fh, px - offset, y, fw, fh);
		}
	};
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Font class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Font object.
 *
 * @class myst.Font
 * @classdesc Provides a bitmap font construct. This is a faster alternative to native
 *   canvas text rendering routines. It is more consistent since letters and spacings
 *   will always be rendered pixel perfect in all browsers, but it is also more
 *   limiting since it is confined to a relatively small set of characters. The range of
 *   characters is limited to ASCII 32-126.
 *
 * @param {object} options - Font options.
 * @param {object} options.graphics - Font graphics.
 * @param {array} options.size - Character size given by [width, height]. This corresponds to a single
 *   tile in the tilesheet.
 * @param {number} [options.spacing=2] - Letter spacing in pixels.
 * @param {number} [options.offset=0] - Tile offset in the tilesheet.
 * @param {object|array} [options.widths] - Map or list of character widths.
 */
myst.Font = function(options) {
	this.gfx = options.graphics;
	this.width = options.size[0];
	this.height = options.size[1];
	this.spacing = (options.spacing === undefined) ? 2 : options.spacing;
	this.tileOffset = (options.offset === undefined) ? 0 : options.offset;
	this.tilesPerRow = Math.floor(this.gfx.width / this.width);
	this.tilesH = Math.ceil(95 / this.tilesPerRow) * this.height;
	this.varwidth = (options.widths !== undefined);
	if (this.varwidth) {
		if (options.widths instanceof Array) {
			// use the widths list as is
			this.widths = options.width;
		}
		else {
			// convert widths map to an array
			this.widths = [];
			for (var c = 32; c <= 126; c++) {
				var key = String.fromCharCode(c);
				var w = options.widths[key];
				this.widths.push((w) ? w : this.width);
			}
		}
	}
};

////////////////////////////////////////////////////////////////////////////////////
//
//  Surface class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Surface object.
 *
 * @class myst.Surface
 * @classdesc An interface for drawing graphics. Can be used either to wrap an
 *     existing canvas element or create a virtual canvas element.
 *
 * @param {object} options - Surface options.
 * @param {string} [options.fromCanvas] - HTML id of canvas element to create Surface on.
 * @param {number} [options.width=100] - Width of new virtual Surface.
 * @param {number} [options.height=100] - Height of new virtual Surface.
 *
 * @example
 * // Create a new Surface on canvas with ID "myCanvas"
 * // width and height are inferred from the element
 * new myst.Surface({ fromCanvas: 'myCanvas' });
 *
 * @example
 * // Create a new virtual Surface with size 200x100
 * new myst.Surface({ width: 200, height: 100 });
 */
myst.Surface = function(options) {
	options = options || {};

	var canvas, ctx;
	var fill;

	if (options.fromCanvas) {
		// wrap around existing canvas element
		canvas = options.fromCanvas;
		this.width = canvas.width;
		this.height = canvas.height;
	}
	else {
		// create a new canvas instance
		var w = (options.width === undefined) ? 100 : options.width;
		var h = (options.height === undefined) ? 100 : options.height;
		canvas = document.createElement('canvas');
		this.width = canvas.width = w;
		this.height = canvas.height = h;
	}
	ctx = canvas.getContext('2d');

	var original_width = this.width;
	var original_height = this.height;

	/**
	 * Reference to canvas.
	 *
	 * @name myst.Surface#canvas
	 */
	this.canvas = canvas;

	/**
	 * An instance of Render.
	 *
	 * @name myst.Surface#render
	 * @type {myst.Render}
	 */
	this.render = new myst.Render(ctx);

	// clear methods
	this.cm_clear = function() {
		ctx.clearRect(0, 0, this.width, this.height);
	};

	this.cm_fill = function() {
		ctx.fillStyle = fill;
		ctx.fillRect(0, 0, this.width, this.height);
	};

	/**
	 * Clears the surface of anything that is drawn on it.
	 * @name clear
	 * @function
	 * @memberof myst.Surface
	 * @instance
	 */
	this.clear = C_NULL;

	/**
	 * Sets Default clear method. When clear() is called, it will clear all
	 * pixel data from the surface.
	 */
	this.setDefaultClearMethod = function() {
		this.clear = this.cm_clear;
	};

	/**
	 * Sets Fill clear method. When clear() is called, it will fill the surface
	 * with the given color.
	 *
	 * @param {string} fill_color - Color to use for clearing.
	 */
	this.setFillClearMethod = function(fill_color) {
		fill = (fill_color === undefined) ? '#000' : fill_color;
		this.clear = this.cm_fill;
	};

	/**
	 * Retreives the canvas object.
	 *
	 * @returns {object} Canvas object
	 */
	this.getCanvas = function() {
		return canvas;
	};

	/**
	 * Resets the size of Surface back to original.
	 *
	 */
	this.resetSize = function() {
		this.resize(original_width, original_height);
	};

	/**
	 * Resizes the Surface.
	 *
	 * @param {number} width - New width.
	 * @param {number} height - New height.
	 */
	this.resize = function(width, height) {
		this.width = canvas.width = width;
		this.height = canvas.height = height;
	};

	// set default clearing
	this.setDefaultClearMethod();
};


////////////////////////////////////////////////////////////////////////////////////
//
//  State class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a State object.
 *
 * @class myst.State
 * @classdesc Implements a game state. Every game state comes with a reference to
 *   the global Surface object which is used for drawing.
 *
 * @param {object} options - Functions to override.
 * @param {function} [options.init] - Triggers once on state initialization.
 * @param {function} [options.enter] - Triggers on state enter.
 * @param {function} [options.exit] - Triggers on state exit.
 * @param {function} [options.draw] - Triggers on state paint events.
 * @param {function} [options.update] - Triggers on state update events.
 */
myst.State = function(options) {
	options = options || {};
	this._initialized = false;
	this._initState = function(surface) {
		if (!this._initialized) {
			this._initialized = true;
			this.surface = surface;
			this.paint = surface.render;
			this.init();
		}
	};
	this._active = false;
	/**
	 * Global surface.
	 *
	 * @name myst.State#surface
	 * @type {myst.Surface}
	 */
	this.surface = C_NULL;
	/**
	 * Shorthand for state.surface.render.
	 *
	 * @name myst.State#paint
	 * @type {myst.Render}
	 */
	this.paint = C_NULL;

	/**
	 * Retreives state active state. Only one state may be active at any given time.
	 *
	 * @returns {bool}
	 */
	this.isActive = function() {
		return this._active;
	};

	// user functions
	this.init   = options.init   || C_EMPTYF;
	this.enter  = options.enter  || C_EMPTYF;
	this.exit   = options.exit   || C_EMPTYF;
	this.update = options.update || C_EMPTYF;
	this.draw   = options.draw   || C_EMPTYF;
};


////////////////////////////////////////////////////////////////////////////////////
//
//  Game class
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a Game object.
 *
 * @class myst.Game
 * @classdesc Initializes and runs the game.
 *
 * @param {object} options - Game options.
 * @param {string} options.canvasId - ID of canvas element to create Game on.
 * @param {string} [options.background] - Fill color (if ommitted clear is used instead).
 * @param {boolean} [options.simpleLoop=false] - When set to true, a simple main loop
 *   will be used. This is an alternative version of the core game loop that only does
 *   drawing, and leaves updates to the programmer. Use this if your game does not require
 *   timed events and relies on user input to push the game state forward.
 * @param {string} [options.viewMode] - Sets view mode. Available options are: 'center',
 *   'scale-fit', 'scale-stretch' or 'expand'.
 * @param {number} [options.framerate=60] - Game frame rate (ignored when simpleLoop=true).
 * @param {array} [options.gameStates] - List of states to be initialized upon game run.
 *   If states are left uninitialized, they will initialize once as they activate for the
 *   first time. You can safely omit this argument if your states can load independently.
 *   Alternatively, use initStates() to initialize states manually.
 */
myst.Game = function(options) {
	var self = this;

	var state = C_NULL;
	var surface = C_NULL;

	// references to canvas and canvas parent elements
	var canvas;
	var canvasOwner;

	// main loop variables
	var currentTime = Date.now() / 1000;
	var accumulator = 0;
	var framerate = 60;
	var tickRate = 1 / framerate;

	//
	// main loop variants
	//
	function mainLoop(time) {
		var timeNow = Date.now() / 1000;
		var frameTime = timeNow - currentTime;
		if (frameTime > 0.25) {
			frameTime = 0.25;
		}
		currentTime = timeNow;
		accumulator += frameTime;
		while (accumulator >= tickRate) {
			state.update();
			accumulator -= tickRate;
		}
		state.draw();
		requestAnimationFrame(mainLoop);
	}

	function simpleMainLoop() {
		state.draw();
		requestAnimationFrame(simpleMainLoop);
	}

	//
	// view handling
	//
	var view_mode = C_VIEW_DEFAULT;
	var view_updatehandler = C_NULL;
	var view_debounce_timeout = C_NULL;
	var view_debounce_delay = 20;
	var viewHandlers = {
		init: {},
		update: {}
	};

	// center view handler
	viewHandlers.init[C_VIEW_CENTER] = function() {
		surface.resetSize();
		canvas.style.width = surface.width + 'px';
		canvas.style.height = surface.height + 'px';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.right = '0';
		canvas.style.bottom = '0';
		canvas.style.margin = 'auto';
	};
	viewHandlers.update[C_VIEW_CENTER] = C_NULL;

	// scale-fit handlers
	viewHandlers.init[C_VIEW_SCALE_FIT] = function() {
		surface.resetSize();
		viewHandlers.update[C_VIEW_SCALE_FIT]();
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.right = '0';
		canvas.style.bottom = '0';
		canvas.style.margin = 'auto';
	};
	viewHandlers.update[C_VIEW_SCALE_FIT] = function() {
		var cw = surface.width;
		var ch = surface.height;
		var dw = canvasOwner.offsetWidth;
		var dh = canvasOwner.offsetHeight;
		var ratio = cw / ch;
		var width = dh * ratio;
		var height;
		if (width > dw) {
			ratio = ch / cw;
			width = dw;
			height = dw * ratio;
		}
		else {
			height = dh;
		}
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
	};

	// scale-stretch handlers
	viewHandlers.init[C_VIEW_SCALE_STRETCH] = function() {
		surface.resetSize();
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.top = '0';
		canvas.style.left = '0';
	};
	viewHandlers.update[C_VIEW_SCALE_STRETCH] = C_NULL;

	// expand handlers
	viewHandlers.init[C_VIEW_EXPAND] = function() {
		viewHandlers.update[C_VIEW_EXPAND]();
		canvas.style.top = '0';
		canvas.style.left = '0';
	};
	viewHandlers.update[C_VIEW_EXPAND] = function() {
		surface.resize(canvasOwner.offsetWidth, canvasOwner.offsetHeight);
	};

	function pollViewUpdate() {
		clearTimeout(view_debounce_timeout);
		view_debounce_timeout = setTimeout(view_updatehandler, view_debounce_delay);
	}

	/**
	 * Changes active game state.
	 *
	 * @param {myst.State} next - State to switch to.
	 */
	this.setState = function(next) {
		if (state) {
			state._active = false;
			state.exit();
		}
		state = next;
		if (!state._initialized) {
			state._initState(surface);
		}
		state._active = true;
		state.enter();
	};

	/**
	 * Retreives active game state.
	 *
	 * @returns {myst.State}
	 */
	this.getState = function() {
		return state;
	};

	/**
	 * Retreives the main game surface.
	 *
	 * @returns {myst.Surface}
	 */
	this.getSurface = function() {
		return surface;
	};

	/**
	 * Initializes game states. Skips already initialized states.
	 *
	 * @param {array|object} states - A list of states to be initialized.
	 *
	 */
	this.initStates = function(states) {
		states = (states instanceof Array) ? states : [states];
		var n_states = states.length;
		for (var i = 0; i < n_states; i++) {
			var game_state = states[i];
			if (!game_state._initialized) {
				game_state._initState(surface);
			}
		}
	};

	/**
	 * Starts the game.
	 */
	this.run = function() {
		// initialize game states on startup if provided
		if (options.gameStates instanceof Array) {
			var n_states = options.gameStates.length;
			for (var i = 0; i < n_states; i++) {
				var game_state = options.gameStates[i];
				if (!game_state._initialized) {
					game_state._initState(surface);
				}
			}
		}
		// set initial game state
		self.setState(options.state);
		// enter main loop
		if (options.simpleLoop) {
			// enter simple loop
			requestAnimationFrame(simpleMainLoop);
		}
		else {
			// setup main loop
			if (options.framerate) {
				framerate = options.framerate;
				tickRate = 1 / framerate;
			}
			// enter normal loop
			requestAnimationFrame(mainLoop);
		}
	};

	/**
	 * Sets the view mode.
	 *
	 * @param {string|number} mode - Set the view mode to one of the following:
	 *   'center', 'scale-fit', 'scale-stretch' or 'expand'.
	 */
	this.setViewMode = function(mode) {
		// remove the update handler and the resize event
		if (view_updatehandler) {
			view_updatehandler = C_NULL;
			window.removeEventListener('resize', pollViewUpdate);
		}
		// setup view mode
		if (typeof mode === 'string') {
			switch (mode.trim().toLowerCase()) {
				case 'scale-fit':
				case 'scale_fit':
					view_mode = C_VIEW_SCALE_FIT;
					break;
				case 'scale-stretch':
				case 'scale_stretch':
					view_mode = C_VIEW_SCALE_STRETCH;
					break;
				case 'expand':
					view_mode = C_VIEW_EXPAND;
					break;
				default:
					view_mode = C_VIEW_CENTER;
					break;
			}
		}
		else {
			view_mode = mode;
		}
		// reset view
		canvas.removeAttribute('style');
		canvas.style.position = 'absolute';
		// set the update handler
		view_updatehandler = viewHandlers.update[view_mode];
		// initialize view
		viewHandlers.init[view_mode]();
		// attach resize listener only if the update handler is defined
		if (view_updatehandler) {
			window.addEventListener('resize', pollViewUpdate);
		}
	};

	/**
	 * Retreives the view mode.
	 *
	 * @returns {number}
	 */
	this.getViewMode = function() {
		return view_mode;
	};

	/**
	 * Force a view update.
	 */
	this.updateView = function() {
		if (view_updatehandler)
			view_updatehandler();
	};

	// retreive the canvas element
	canvas = document.getElementById(options.canvasId);
	canvasOwner = canvas.parentElement;

	// create the surface object
	surface = new myst.Surface({ fromCanvas: canvas });
	if (options.background) {
		surface.setFillClearMethod(options.background);
	}

	// set view mode if provided by options
	if (options.viewMode) {
		this.setViewMode(options.viewMode);
	}
};
