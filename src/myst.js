/*
 * myst.js
 * Tiny HTML5 game engine
 *
 * (c) 2023 Danijel Durakovic
 * MIT License
 *
 */

/*jshint globalstrict:true*/
/*jshint browser:true*/

/**
 * @file myst.js
 * @version 0.9.8
 * @author Danijel Durakovic
 */

"use strict";

/**
 * myst.js namespace
 * @namespace
 */
const myst = {};

////////////////////////////////////////////////////////////////////////////////////
//
//  Constants
//
////////////////////////////////////////////////////////////////////////////////////

const C_NULL = void 0;
const C_EMPTYF = function(){};

const C_VIEW_DEFAULT = 0;
const C_VIEW_CENTER = 1;
const C_VIEW_SCALE_FIT = 2;
const C_VIEW_SCALE_STRETCH = 3;
const C_VIEW_EXPAND = 4;

////////////////////////////////////////////////////////////////////////////////////
//
//  Common functions
//
////////////////////////////////////////////////////////////////////////////////////

/**
 * Composes an object from multiple component objects.
 *
 * @function compose
 * @memberof myst
 * @instance
 *
 * @param {...object} var_args - Component objects.
 *
 * @returns {object}
 */
myst.compose = function(/**/) {
	return Object.assign.apply(null, arguments);
};

/**
 * Returns a number limited to a given range.
 *
 * @function clamp
 * @memberof myst
 * @instance
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
 * Returns a random integer in range.
 *
 * @function getRandomInt
 * @memberof myst
 * @instance
 *
 * @param {number} min - Lower range boundary.
 * @param {number} max - Upper range boundary.
 *
 * @returns {number}
 */
myst.getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Returns the result of a coin flip.
 *
 * @function coinFlip
 * @memberof myst
 * @instance
 *
 * @returns {bool}
 */
myst.coinFlip = function() {
	return 1 == Math.floor(Math.random() * 2);
};

/**
 * Returns the result of a dice roll.
 *
 * @function diceRoll
 * @memberof myst
 * @instance
 *
 * @param {number} [N=6] - Number of sides on the dice.
 *
 * @returns {number}
 */
myst.diceRoll = function(N) {
	N = (N >= 1) ? N : 6;
	return Math.floor(Math.random() * N) + 1;
};

/**
 * Shuffles a list of elements. This method modifies the original array.
 *
 * @function shuffle
 * @memberof myst
 * @instance
 *
 * @param {array} list
 */
myst.shuffle = function(list) {
	// fisher-yates shuffle
	let i = list.length;
	while (--i) {
		let r = Math.floor(Math.random() * (i + 1));
		let tmp = list[i];
		list[i] = list[r];
		list[r] = tmp;
	}
};

/**
 * Picks an element from a list at random.
 *
 * @function choose
 * @memberof myst
 * @instance
 *
 * @param {array} list
 *
 * @returns {object}
 */
myst.choose = function(list) {
	if (list instanceof Array) {
		return list[Math.floor(Math.random() * list.length)];
	}
};

/**
 * Picks an element from a list at random, and removes it from the list.
 *
 * @function pick
 * @memberof myst
 * @instance
 *
 * @param {array} list
 *
 * @returns {object}
 */
myst.pick = function(list) {
	if (list instanceof Array && list.length > 0) {
		return list.splice(Math.floor(Math.random() * list.length), 1)[0];
	}
};


/**
 * Checks whether a point resides within a given rectangle.
 *
 * @function pointInRect
 * @memberof myst
 * @instance
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
 * @function pointInCircle
 * @memberof myst
 * @instance
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
	return (x - cx) * (x - cx) + (y - cy) * (y - cy) < radius * radius;
};

/**
 * Checks whether two line segments A-B and C-D intersect. Ignores colinear segment intersections.
 *
 * @function linesIntersect
 * @memberof myst
 * @instance
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
	let ccwise = function(ax, ay, bx, by, cx, cy) {
		return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
	};
	return ccwise(ax, ay, cx, cy, dx, dy) != ccwise(bx, by, cx, cy, dx, dy) &&
		ccwise(ax, ay, bx, by, cx, cy) != ccwise(ax, ay, bx, by, dx, dy);
};

/**
 * Returns the distance from point A to point B.
 *
 * @function pointToPointDistance
 * @memberof myst
 * @instance
 *
 * @param {number} x - Point A x coordinate.
 * @param {number} y - Point A y coordinate.
 * @param {number} x - Point B x coordinate.
 * @param {number} y - Point B y coordinate.
 * 
 * @returns {number}
 */
myst.pointToPointDistance = function(ax, ay, bx, by) {
	return Math.sqrt((ax - bx) * (ax - bx) + (ay - by) * (ay - by));
};

/**
 * Returns the distance from point P to line segment A-B.
 *
 * @function pointToLineDistance
 * @memberof myst
 * @instance
 *
 * @param {number} x - Point P x coordinate.
 * @param {number} y - Point P y coordinate.
 * @param {number} ax - Point A x coordinate.
 * @param {number} ay - Point A y coordinate.
 * @param {number} bx - Point B x coordinate.
 * @param {number} by - Point B y coordinate.
 *
 * @returns {number}
 */
myst.pointToLineDistance = function(x, y, ax, ay, bx, by) {
	let dx = bx - ax;
	let dy = by - ay;
	let l = dx * dx + dy * dy;
	if (l == 0) {
		return 0;
	}
	let t = Math.min(1, Math.max(0, (dx * (x - ax) + dy * (y - ay)) / l));
	let cx = ax + t * dx;
	let cy = ay + t * dy;
	return Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
};

/**
 * Moves point A towards point B by a difference of d.
 *
 * @function movePoint
 * @memberof myst
 * @instance
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
	let dir = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
	return [
		ax + Math.floor(Math.cos(dir * Math.PI / 180) * d),
		ay + Math.floor(Math.sin(dir * Math.PI / 180) * d)
	];
};

/**
 * Rotate point A around point B by angle.
 *
 * @function rotatePoint
 * @memberof myst
 * @instance
 *
 * @param {number} ax - Point A x coordinate.
 * @param {number} ay - Point A y coordinate.
 * @param {number} bx - Point B x coordinate.
 * @param {number} by - Point B y coordinate.
 * @param {number} angle - Angle in degrees.
 *
 * @returns {array} Coordinates to point A after rotation.
 */
myst.rotatePoint = function(ax, ay, bx, by, angle) {
	angle *= Math.PI / 180;
	ax -= bx;
	ay -= by;
	return [
		Math.floor(ax * Math.cos(angle) - ay * Math.sin(angle)) + bx,
		Math.floor(ay * Math.cos(angle) + ax * Math.sin(angle)) + by
	];
};

/**
 * Iterates over non-function members of an object.
 *
 * @function iter
 * @memberof myst
 * @instance
 *
 * @param {object} collection
 * @param {iterCallback} callback
 */
myst.iter = function(object, callback) {
	let index = 0;
	for (let key in object) {
		let item = object[key];
		if (Object.prototype.hasOwnProperty.call(object, key) && !(item instanceof Function)) {
			callback(key, item, index++);
		}
	}
};
/**
 * @callback iterCallback
 * @param {string} key - Item's key.
 * @param {object} item - The item itself.
 * @param {number} index - Item's index.
 */

/**
 * Applies a function to an arbitrary group of objects.
 *
 * @function applyToGroup
 * @memberof myst
 * @instance
 *
 * @param {object} group - Collection of objects.
 * @param {string} fname - Function to call on objects.
 * @param {array} [fargs] - List of arguments to apply to the function.
 */
myst.applyToGroup = function(group, fname, fargs) {
	if (fargs !== undefined) {
		fargs = (fargs instanceof Array) ? fargs : [fargs];
	}
	myst.iter(group, function(key, object) {
		if (object[fname] instanceof Function) {
			object[fname].apply(object, fargs);
		}
	});
};

/**
 * Retreives the extension of a filename. Outputs lowercase.
 *
 * @function getFilenameExtension
 * @memberof myst
 * @instance
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
		let n = w * h;
		for (let i = 0; i < n; ++i) {
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
	let accumulator = 0;
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

	let twTimeout = null;
	let twFrametime = 15;

	let hasUpdate = onUpdate instanceof Function;
	let hasDone = onDone instanceof Function;
	let hasProc = procf instanceof Function;
	let hasReset = resetf instanceof Function;

	function doTween(elapsed) {
		let progress = elapsed / duration;
		let value = from + easef(progress) * (to - from);
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
		return t * t * t - t * (0.4) * Math.sin(t * Math.PI);
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
	let self = this;
	let bank = {};

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
	 * let loader = new myst.AssetLoader();
	 * loader.handler.customCategory = function(filename, ready) {
	 *    // handler for customCategory
	 *    // .. do something with filename ..
	 *    let data = 'test';
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
		let img = new Image();
		img.src = filename;
		img.addEventListener('load', function() {
			ready(img);
		});
	};

	// default data load handler - used for loading JSON files
	this.handler.data = function(filename, ready) {
		let xhr = new XMLHttpRequest();
		xhr.open('get', filename, true);
		xhr.send(null);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				let response = xhr.responseText;
				let data = JSON.parse(response);
				ready(data);
			}
		};
	};

	// default text load handler - used for loading text files
	this.handler.text = function(filename, ready) {
		let xhr = new XMLHttpRequest();
		xhr.open('get', filename, true);
		xhr.send(null);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				let response = xhr.responseText;
				let data = response;
				ready(data);
			}
		};
	};

	/**
	 * Loads assets from an asset list. Iterates over categories in the list and then calls
	 * the appropriate load handler on every item in the category. Returns loaded assets.
	 *
	 * @param {object} options
	 * @param {object} options.assets - A categorized list of assets.
	 * @param {function} [options.done] - Triggers when all assets are done loading.
	 * @param {progressCallback} [options.progress] - Triggers when a single asset is loaded.
	 *
	 * @returns {object}
	 *
	 * @example
	 * let assetList = {
	 *    graphics: {
	 *       mysprite: 'mysprite.png',
	 *       myimage: 'myimage.jpg'
	 *    },
	 *    json: {
	 *       mydata: 'mydata.json'
	 *    }
	 * };
	 * let assetLoader = new myst.AssetLoader();
	 * assetLoader.load({
	 *    assets: assetList,
	 *    done: function() {
	 *       console.log('All assets loaded and ready!');
	 *    }
	 * });
	 */
	this.load = function(options) {
		let assetList = options.assets;
		if (!assetList) {
			return;
		}
		let done = options.done || C_EMPTYF;
		let progress = options.progress || C_EMPTYF;
		// count assets
		let n_loaded = 0;
		let n_toload = 0;
		let n_categories = 0;
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
			let loadHandler = self.handler[category];
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
		let n_args = arguments.length;
		let tokens;
		let tokenPair;
		let output = {};
		let n_objects = 0;
		let category, assetName;
		let assetData;
		let i, j;
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
			let n_args = arguments.length;
			let tokens;
			let output = {};
			let n_objects = 0;
			let assetName;
			let assetData;
			let i, j;
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
	let MOUSE = 0;
	let TOUCH = 1;

	// capture element
	let element = game.getSurface().getCanvas();
	let elementOwner = element.parentElement;

	function translateCoords(e, agent) {
		let ratio_x, ratio_y;
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
		let bounds = element.getBoundingClientRect();
		let px = (agent === TOUCH) ? e.changedTouches[0].clientX : e.clientX;
		let py = (agent === TOUCH) ? e.changedTouches[0].clientY : e.clientY;
		return [
			Math.floor((px - bounds.left) * ratio_x),
			Math.floor((py - bounds.top) * ratio_y)
		];
	}

	// event callback lists
	let cb = { press: [], move: [], release: [] };

	// event handlers
	function mouseHandler(callbackList, e) {
		if (e.preventDefault)
			e.preventDefault();
		let button = e.which || e.button;
		if (button !== 1)
			return;
		// translate
		let coords = translateCoords(e, MOUSE);
		// dispatch
		let i = callbackList.length;
		while (i--) {
			let cbObj = callbackList[i];
			let cbFunc = cbObj[0];
			let cbState = cbObj[1];
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
		let coords = translateCoords(e, MOUSE);
		// dispatch
		let i = callbackList.length;
		while (i--) {
			let cbObj = callbackList[i];
			let cbFunc = cbObj[0];
			let cbState = cbObj[1];
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
		let coords = translateCoords(e, TOUCH);
		// dispatch
		let i = callbackList.length;
		while (i--) {
			let cbObj = callbackList[i];
			let cbFunc = cbObj[0];
			let cbState = cbObj[1];
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
		let callbackList = cb[eventType];
		let cbRef = [callback, C_NULL, id];
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
			let callbackList = cb[eventType];
			if (!callbackList) {
				return;
			}
			let i = callbackList.length;
			while (i--) {
				let cbObj = callbackList[i];
				let cbId = cbObj[2];
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
	let self = this;

	let eventQueue = [];
	let keyBuffer = [];

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
		let key = e.keyCode || e.which;
		// prevent default backspace behavior
		if (key === self.keyBackspace || key === self.keyAlt)
			e.preventDefault();
		if (!keyBuffer[key]) {
			keyBuffer[key] = true;
			addKeyEvent(self.KEYDOWN, key);
		}
	});
	document.addEventListener('keyup', function(e) {
		let key = e.keyCode || e.which;
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
		let keyState = keyBuffer[keycode];
		return keyState !== undefined && keyState;
	};

	// keycodes
	myst.compose(this, {
		keyCancel: 3, keyHelp: 6, keyBackspace: 8, keyTab: 9, keyClear: 12,
		keyEnter: 13, keyReturn: 14, keyShift: 16, keyControl: 17, keyAlt: 18,
		keyPause: 19, keyCapsLock: 20, keyEscape: 27, keySpace: 32, keyPageUp: 33,
		keyPageDown: 34, keyEnd: 35, keyHome: 36, keyLeft: 37, keyUp: 38,
		keyRight: 39, keyDown: 40, keyPrintscreen: 44, keyInsert: 45, keyDelete: 46,
		key0: 48, key1: 49, key2: 50, key3: 51, key4: 52, key5: 53, key6: 54,
		key7: 55, key8: 56, key9: 57, keySemicolon: 59, keyEquals: 61, keyA: 65,
		keyB: 66, keyC: 67, keyD: 68, keyE: 69, keyF: 70, keyG: 71, keyH: 72,
		keyI: 73, keyJ: 74, keyK: 75, keyL: 76, keyM: 77, keyN: 78, keyO: 79,
		keyP: 80, keyQ: 81, keyR: 82, keyS: 83, keyT: 84, keyU: 85, keyV: 86,
		keyW: 87, keyX: 88, keyY: 89, keyZ: 90, keyContextMenu: 93, keyNumpad0: 96,
		keyNumpad1: 97, keyNumpad2: 98, keyNumpad3: 99, keyNumpad4: 100, keyNumpad5: 101,
		keyNumpad6: 102, keyNumpad7: 103, keyNumpad8: 104, keyNumpad9: 105, keyMultiply: 106,
		keyAdd: 107, keySeparator: 108, keySubtract: 109, keyDecimal: 110, keyDivide: 111,
		keyF1: 112, keyF2: 113, keyF3: 114, keyF4: 115, keyF5: 116, keyF6: 117,
		keyF7: 118, keyF8: 119, keyF9: 120, keyF10: 121, keyF11: 122, keyF12: 123,
		keyF13: 124, keyF14: 125, keyF15: 126, keyF16: 127, keyF17: 128, keyF18: 129,
		keyF19: 130, keyF20: 131, keyF21: 132, keyF22: 133, keyF23: 134, keyF24: 135,
		keyNumLock: 144, keyScrollLock: 145, keyComma: 188, keyPeriod: 190, keySlash: 191,
		keyBackQuote: 192, keyOpenBracket: 219, keyBackSlash: 220, keyCloseBracket: 221,
		keyQuote: 222, keyMeta: 224
	});
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
	let self = this;
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
		let localConfig = localStorage.getItem(key);
		let config = (localConfig) ? JSON.parse(localConfig) : defaultConfiguration;
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
	 * @param {number|array} [radius=0] - Rectangle border radius. Can be a number or
	 *   an array of 4 values for radius of each corner (top-left first, clockwise).
	 */
	this.rect = function(x, y, w, h, color, width, radius) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		if (radius === undefined || radius === 0) {
			ctx.strokeRect(x, y, w, h);
		}
		else {
			if (radius instanceof Array) {
				radius = [radius[0] || 0, radius[1] || 0, radius[2] || 0, radius[3] || 0];
			}
			else {
				radius = [radius, radius, radius, radius];
			}
			ctx.beginPath();
			ctx.moveTo(x + radius[0], y);
			ctx.lineTo(x + w - radius[1], y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + radius[1]);
			ctx.lineTo(x + w, y + h - radius[3]);
			ctx.quadraticCurveTo(x + w, y + h, x + w - radius[3], y + h);
			ctx.lineTo(x + radius[2], y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - radius[2]);
			ctx.lineTo(x, y + radius[0]);
			ctx.quadraticCurveTo(x, y, x + radius[0], y);
			ctx.closePath();
			ctx.stroke();
		}
	};

	/**
	 * Renders a filled rectangle.
	 *
	 * @param {number} x - Rectangle x coordinate.
	 * @param {number} y - Rectangle y coordinate.
	 * @param {number} w - Rectangle width.
	 * @param {number} h - Rectangle height.
	 * @param {string} [color="#fff"] - Rectangle fill color.
	 * @param {number|array} [radius=0] - Rectangle border radius. Can be a number or
	 *   an array of 4 values for radius of each corner (top-left first, clockwise).
	 */
	this.rectFill = function(x, y, w, h, color, radius) {
		color = (color === undefined) ? '#fff' : color;
		ctx.fillStyle = color;
		if (radius === undefined || radius === 0) {
			ctx.fillRect(x, y, w, h);
		}
		else {
			if (radius instanceof Array) {
				radius = [radius[0] || 0, radius[1] || 0, radius[2] || 0, radius[3] || 0];
			}
			else {
				radius = [radius, radius, radius, radius];
			}
			ctx.beginPath();
			ctx.moveTo(x + radius[0], y);
			ctx.lineTo(x + w - radius[1], y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + radius[1]);
			ctx.lineTo(x + w, y + h - radius[3]);
			ctx.quadraticCurveTo(x + w, y + h, x + w - radius[3], y + h);
			ctx.lineTo(x + radius[2], y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - radius[2]);
			ctx.lineTo(x, y + radius[0]);
			ctx.quadraticCurveTo(x, y, x + radius[0], y);
			ctx.closePath();
			ctx.fill();
		}
	};

	/**
	 * Renders an arc.
	 *
	 * @param {number} x - Arc x coordinate.
	 * @param {number} y - Arc y coordinate.
	 * @param {number} rad - Arc radius.
	 * @param {number} start - Arc start angle in degrees.
	 * @param {number} end - Arc end angle in degrees.
	 * @param {string} [color="#fff"] - Arc color.
	 * @param {number} [width=1] - Arc line width.
	 */
	this.arc = function(x, y, rad, start, end, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		start *= Math.PI / 180;
		end *= Math.PI / 180;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.arc(x, y, rad, start, end);
		ctx.stroke();
	};


	/**
	 * Renders a filled arc.
	 *
	 * @param {number} x - Arc x coordinate.
	 * @param {number} y - Arc y coordinate.
	 * @param {number} rad - Arc radius.
	 * @param {number} start - Arc start angle in degrees.
	 * @param {number} end - Arc end angle in degrees.
	 * @param {string} [color="#fff"] - Arc fill color.
	 */
	this.arcFill = function(x, y, rad, start, end, color) {
		color = (color === undefined) ? '#fff' : color;
		start *= Math.PI / 180;
		end *= Math.PI / 180;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, rad, start, end);
		ctx.closePath();
		ctx.fill();
	};

	/**
	 * Renders a circular sector.
	 *
	 * @param {number} x - Sector x coordinate.
	 * @param {number} y - Sector y coordinate.
	 * @param {number} rad - Sector radius.
	 * @param {number} start - Sector start angle in degrees.
	 * @param {number} end - Sector end angle in degrees.
	 * @param {string} [color="#fff"] - Sector color.
	 * @param {number} [width=1] - Sector line width.
	 */
	this.sector = function(x, y, rad, start, end, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		start *= Math.PI / 180;
		end *= Math.PI / 180;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, rad, start, end);
		ctx.lineTo(x, y);
		ctx.stroke();
	};

	/**
	 * Renders a filled circular sector.
	 *
	 * @param {number} x - Sector x coordinate.
	 * @param {number} y - Sector y coordinate.
	 * @param {number} rad - Sector radius.
	 * @param {number} start - Sector start angle in degrees.
	 * @param {number} end - Sector end angle in degrees.
	 * @param {string} [color="#fff"] - Sector fill color.
	 */
	this.sectorFill = function(x, y, rad, start, end, color) {
		color = (color === undefined) ? '#fff' : color;
		start *= Math.PI / 180;
		end *= Math.PI / 180;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, rad, start, end);
		ctx.lineTo(x, y);
		ctx.closePath();
		ctx.fill();
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
		ctx.beginPath();
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
		ctx.closePath();
		ctx.fill();
	};

	/**
	 * Renders a polygon.
	 *
	 * @param {array} points - A list of polygon points. Each point is an array of length two,
	 *   containing the coordinates.
	 * @param {string} color - Polygon color.
	 */
	this.polygon = function(points, color, width) {
		color = (color === undefined) ? '#fff' : color;
		width = (width === undefined) ? 1 : width;
		ctx.strokeStyle = color;
		ctx.lineWidth = width;
		let n_points = points.length;
		ctx.beginPath();
		for (let i = 0; i < n_points; i++) {
			let p1 = points[i];
			let p2 = (i < n_points - 1) ? points[i + 1] : points[0];
			ctx.moveTo(p1[0], p1[1]);
			ctx.lineTo(p2[0], p2[1]);
		}
		ctx.stroke();
	};

	/**
	 * Renders a filled polygon.
	 *
	 * @param {array} points - A list of polygon points. Each point is an array of length two,
	 *   containing the coordinates.
	 * @param {string} color - Polygon color.
	 */
	this.polygonFill = function(points, color) {
		color = (color === undefined) ? '#fff' : color;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(points[0][0], points[0][1]);
		let n_points = points.length;
		for (let i = 1; i < n_points; i++) {
			let p = points[i];
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
		let len = text.length;
		let fw = font.width;
		let fh = font.height;
		let fgfx = font.gfx;
		let ry = font.tilesH * color;
		let acc = 0;
		let varw = font.varwidth;
		let offset = 0;
		let textw;
		let i, ci, cf;
		let tileOffset = font.tileOffset;
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
			let px;
			if (varw) {
				px = x + acc;
				acc += font.widths[ci] + font.spacing;
			}
			else {
				px = x + i * (fw + font.spacing);
			}
			if (ci === 0)
				continue;
			let cx = fw * (cf % font.tilesPerRow);
			let cy = fh * Math.floor(cf / font.tilesPerRow) + ry;
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
			for (let c = 32; c <= 126; c++) {
				let key = String.fromCharCode(c);
				let w = options.widths[key];
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

	let canvas, ctx;
	let fill;

	if (options.fromCanvas) {
		// wrap around existing canvas element
		canvas = options.fromCanvas;
		this.width = canvas.width;
		this.height = canvas.height;
	}
	else {
		// create a new canvas instance
		let w = (options.width === undefined) ? 100 : options.width;
		let h = (options.height === undefined) ? 100 : options.height;
		canvas = document.createElement('canvas');
		this.width = canvas.width = w;
		this.height = canvas.height = h;
	}
	ctx = canvas.getContext('2d');

	let original_width = this.width;
	let original_height = this.height;

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
	let self = this;

	let state = C_NULL;
	let surface = C_NULL;

	// references to canvas and canvas parent elements
	let canvas;
	let canvasOwner;

	// main loop variables
	let currentTime = Date.now() / 1000;
	let accumulator = 0;
	let framerate = 60;
	let tickRate = 1 / framerate;

	//
	// main loop variants
	//
	function mainLoop(time) {
		let timeNow = Date.now() / 1000;
		let frameTime = timeNow - currentTime;
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
	let view_mode = C_VIEW_DEFAULT;
	let view_updatehandler = C_NULL;
	let view_debounce_timeout = C_NULL;
	let view_debounce_delay = 20;
	let viewHandlers = {
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
		let cw = surface.width;
		let ch = surface.height;
		let dw = canvasOwner.offsetWidth;
		let dh = canvasOwner.offsetHeight;
		let ratio = cw / ch;
		let width = dh * ratio;
		let height;
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
		let n_states = states.length;
		for (let i = 0; i < n_states; i++) {
			let game_state = states[i];
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
			let n_states = options.gameStates.length;
			for (let i = 0; i < n_states; i++) {
				let game_state = options.gameStates[i];
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
