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

	var event_uiid = 0;
	/**
	 * Return the next unique incremental event id.
	 *
	 * @returns {number}
	 */
	function getEventUIID() {
		return ++event_uiid;
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
				//TODO check chain of owners for disabled state?
				return self._enabled;
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
				return self._x;
			};

			self.getY = function() {
				return self._y;
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

			self.setWidth = function() {
			};

			self.setHeight = function() {
			};

			self.getWidth = function() {
				return self._width;
			};

			self.getHeight = function() {
				return self._height;
			};

			self.resize = function(width, height) {
			};

			self.growByWidth = function(width) {
			};

			self.growByHeight = function(height) {
			};

			self.growBy = function(amount) {
				return self.growByWidth(amount).growByHeight(amount);
			};

			self.resetX = function() {
				self._x = options.x || 0;
				return self;
			};

			self.resetY = function() {
				self._y = options.y || 0;
				return self;
			};

			self.resetPosition = function() {
				return self.resetX().resetY();
			};

			self.resetWidth = function() {
			};

			self.resetHeight = function() {
			};

			self.resetSize = function() {
				return self.resetWidth().resetHeight();
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

			// DEBUG FEATURES BEGIN
			if (options.debug) {
				var debugDisplayText = '';
				var debugWatch = (options.debugData)
					? options.debugData.replace(/\$/g, '_').split(' ')
					: ['_type'];
				function updateDebugDisplayText() {
					debugDisplayText = '';
					for (var i = 0; i < debugWatch.length; i++) {
						debugDisplayText += self[debugWatch[i]] + ' ';
					}
				}
				var debugColor = options.debugColor || '#c2f';
				updateDebugDisplayText();
				setInterval(updateDebugDisplayText, 100);
				var s_draw = self.draw;
				self.draw = function() {
					s_draw();
					self._context.paint.text(debugDisplayText, self._x, self._y - 15, debugColor, 'left', '11px sans-serif');
					self._context.paint.rect(self._x, self._y, self._width, self._height, debugColor, 2);
				}
			}
			// DEBUG FEATURES END
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
				self.paint.graphics(self._texGraphic, 0, 0, self._width, self._height);
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

			// unique event identifier
			var _eventId = '_myst_ui_evntid_' + getEventUIID();

			// "press" gets triggered whenever a button is pressed down
			self._events.onPress = C_EMPTYF;
			// "release" gets triggered whenever a button is released
			self._events.onRelease = C_EMPTYF;
			// "click" gets triggered whenever a button is clicked
			self._events.onClick = C_EMPTYF;

			function _mouseIn(coords) {
				return myst.pointInRect(coords[0], coords[1], self._x, self._y, self._width, self._height);
			}

			self._holding = false;
			self._pressed = false;

			input.on('press', function(coords) {
				if (!self.isEnabled()) {
					return;
				}
				if (_mouseIn(coords)) {
					self._holding = self._pressed = true;
					self._events.onPress();
				}
			}, _eventId).bindTo(self._context);

			input.on('move', function(coords) {
				if (self._holding && self.isEnabled()) {
					var prevPressed = self._pressed;
					var nextPressed = _mouseIn(coords);
					if (prevPressed !== nextPressed) {
						if (self._pressed = nextPressed) {
							self._events.onPress();
						}
						else if (!self._pressed) {
							self._events.onRelease();
						}
					}
				}
			}, _eventId).bindTo(self._context);

			input.on('release', function(coords) {
				if (self._holding && self.isEnabled()) {
					var prevPressed = self._pressed;
					self._holding = self._pressed = false;
					if (prevPressed) {
						self._events.onRelease();
						self._events.onClick();
					}
				}
			}, _eventId).bindTo(self._context);

			self.unregisterEvents = function() {
				if (_eventId) {
					input.off('press', _eventId);
					input.off('move', _eventId);
					input.off('release', _eventId);
				}
			};
		},

		/**
		 * Container component.
		 */
		Container: function(options, self) {
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

			self._events.onPress = function() { // @override
				self._activeTile = options.tiles.pressed;
				self._requestRepaint = true;
				console.log('press');
			};

			self._events.onRelease = function() { // @override
				self._activeTile = options.tiles.normal;
				self._requestRepaint = true;
				console.log('release');
			};

			self._events.onClick = function() { // @override
				if (options.onClick instanceof Function) {
					options.onClick.call(self);
				}
			};
		},

		GraphicButton: function() {
		},

		ToggleButton: function() {
		},

		StateBox: function() {
		},

		CheckBox: function() {
		},

		OptionBox: function() {
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
