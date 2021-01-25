/*
 * myst.ui.js
 * UI extension for myst.js
 *
 * (c) 2021 Danijel Durakovic
 * MIT License
 *
 */

/*jshint browser:true*/
/*globals myst*/

/**
 * @file myst.ui.js
 * @version 0.1.0
 * @author Danijel Durakovic
 * @copyright 2021
 */

myst.ui = (function() { "use strict";

	var input = null;
	var globalContext = null;
	
	///////////////////////////////////////////////////////////////////////////////
	//
	//  Utility
	//
	///////////////////////////////////////////////////////////////////////////////

	/**
	 * Applies an action to an arbitrary group of components.
	 *
	 * @param {object} group - Group of components.
	 * @param {string} fname - Function name.
	 * @param {string} [fargs] - Function arguments.
	 */
	function applyToGroup(group, fname, fargs) {
		if (fargs != null) {
			fargs = (fargs instanceof Array) ? fargs : [fargs];
		}
		myst.iter(group, function(key, component) {
			if (component[fname] instanceof Function) {
				component[fname].apply(component, fargs);
			}
		});
	}

	///////////////////////////////////////////////////////////////////////////////
	//
	//  Elementary components
	//
	///////////////////////////////////////////////////////////////////////////////
	
	var elementary_components = {

		/**
		 * Base component.
		 */
		Base: function(options, self) {
			self = self || this;

			self._x = options.x || 0;
			self._y = options.y || 0;
			self._width = options.width || 0;
			self._height = options.height || 0;
			self._rotation = options.rotation || 0;
			self._alpha = (options.alpha) ? options.alpha : 1;
			self._enabled = (options.enabled) ? options.enabled : true;

			self._context = options.context || globalContext;

			self._requestRepaint = true;

			self._surface = new myst.Surface({
				width: self._width,
				height: self._height
			});

			self._texSurface = self._surface.canvas;

			self._owner = null;
			
			self._events = {};

			self.paint = self._surface.render;

			self.enable = function() {
				self._enabled = true;
				return this;
			};

			self.disable = function() {
				self._enabled = false;
				return this;
			};

			self.isEnabled = function() {
			};

			self.setX = function(x) {
				self._x = x;
				return self;
			};

			self.setY = function(y) {
				self._y = y;
				return self;
			};

			self.getX = function() {
				return x;
			};

			self.getY = function() {
				return y;
			};

			self.moveTo = function(x, y) {
				self._x = x;
				self._y = y;
				return self;
			};

			self.moveBy = function(dx, dy) {
				self._x += dx;
				self._y += dy;
				return self;
			};

			self.resetX = function() {
				self._x = options.x || 0;
				return self;
			};

			self.resetY = function() {
				self._y = options.y || 0;
				return self;
			};

			self.resize = function(width, height) {
			};

			self.show = function() {
				self._alpha = 1;
				return this;
			};

			self.hide = function() {
				self._alpha = 0;
				return this;
			};

			self.setAlpha = function(alpha) {
				self._alpha = alpha;
				return this;
			};

			self.getAlpha = function() {
				return self._alpha;
			};

			self.centerX = function() {
				var ownerWidth = (self._owner) ? self.owner._width : self._context.surface.width;
				self.setX(Math.floor((ownerWidth - self._width) / 2));
				return self;
			};

			self.centerY = function() {
				var ownerHeight = (self._owner) ? self.owner._height : self._context.surface.height;
				self.setY(Math.floor((ownerHeight - self._height) / 2));
				return self;
			};

			self.center = function() {
				return self.centerX().centerY();
			};

			self.draw = function() {
				if (self._requestRepaint && self._events.onRepaint) {
					self._events.onRepaint.call(self);
					self._requestRepaint = false;
				}
				var alpha = self.getAlpha();
				if (alpha <= 0) {
					return;
				}
				if (alpha < 1) {
					self._context.paint.setAlpha(alpha);
				}
				self._context.paint.graphics(self._texSurface, self._x, self._y);
				if (alpha < 1) {
					self._context.paint.setAlpha();
				}
			};

			if (options.debug) {
				var s_draw = self.draw;
				self.draw = function() {
					s_draw();
					var dbgColor = '#c2f';
					self._context.paint.text(self._type, self._x, self._y - 15, dbgColor, 'left', '11px sans-serif');
					self._context.paint.rect(self._x, self._y, self._width, self._height, dbgColor, 2);
				}
			}
		},

		/**
		 * Tweenable component.
		 */
		Tweenable: function(options, self) {
		},

		/**
		 * Graphics component.
		 */
		Graphics: function(options, self) {
			self = self || this;

			self._texGraphic = options.texture;

			self._events.onRepaint = function() {
				self.paint.graphics(self._texGraphic, self._x, self._y, self._width, self._height);
			};
		},

		/**
		 * Tile component.
		 */
		Tile: function(options, self) {
			self = self || this;

			self._texTileset = options.texture;
			self._tileWidth = options.tileWidth || self._width;
			self._tileHeight = options.tileHeight || self._height;
			
			self._activeTile = [0, 0];

			self._events.onRepaint = function() {
				self.paint.stretchTile(
					self._texTileset, 0, 0,
					self._tileWidth, self._tileHeight,
					self._activeTile[0] * self._tileWidth, self._activeTile[1] * self._tileHeight,
					self._width, self._height
				);
			};
		},

		/**
		 * AbstractButton component.
		 */
		AbstractButton: function(options, self) {
			self = self || this;
		}

	};

	///////////////////////////////////////////////////////////////////////////////
	//
	//  Public components
	//
	///////////////////////////////////////////////////////////////////////////////

	var public_components = {

		/**
		 * Base component.
		 */
		Control: function(options, self) {
			self = self || this;

			myst.compose(
				this,
				new elementary_components.Base(options, self),
				new elementary_components.Tweenable(options, self)
			);

			self._type = 'Control';
		},

		/**
		 * Frame component.
		 */
		Frame: function(options, self) {
			self = self || this;

			myst.compose(
				this,
				new public_controls.Control(options.self)
			);

			self._type = 'Frame';
		},

		Shape: function() {
		},

		Image: function() {
		},

		Label: function() {
		},

		SimpleButton: function(options, self) {
			self = self || this;

			myst.compose(
				this,
				new public_components.Control(options, self),
				new elementary_components.Tile(options, self),
				new elementary_components.AbstractButton(options, self)
			);

			self._type = 'SimpleButton';
		},
		GraphicButton: function() {
		},
		ToggleButton: function() {
		}

	};

	///////////////////////////////////////////////////////////////////////////////
	//
	//  Public functions
	//
	///////////////////////////////////////////////////////////////////////////////

	var public_functions = {

		/**
		 * Initializes myst.ui
		 *
		 * @param {object} inputObject - myst.js Input object
		 */
		init: function(inputObject) {
			input = inputObject;
		},

		/**
		 * Creates a tile from a given texture.
		 *
		 * @param {object} texture - Source graphics.
		 * @param {number} tileX
		 * @param {number} tileY
		 * @param {number} tileWidth
		 * @param {number} tileHeight
		 *
		 * @returns {object}
		 */
		createTile: function(texture, tileX, tileY, tileWidth, tileHeight) {
			var tileSurface = new myst.Surface({
				width: tileWidth,
				height: tileHeight
			});
			tileSurface.render.tile(texture, 0, 0, tileWidth, tileHeight, tileX, tileY);
			return tileSurface.canvas;
		},

		/**
		 * Sets a global context which all newly created controls will default to when
		 * being constructed.
		 *
		 * @param {object} stateContext - Context to set as global context.
		 */
		setGlobalContext: function(stateContext) {
			globalContext = stateContext;
		}

	};

	return myst.compose(public_components, public_functions);

}()); // end of myst.UI
