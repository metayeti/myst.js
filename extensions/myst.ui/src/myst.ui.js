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

	/**
	 * Returns the next incremental event id.
	 *
	 * @returns {number}
	 */
	var getNextEventId = (function() {
		var uid = 0;
		return function() {
			return ++uid;
		};
	}());

	/**
	 * Passes given option, or returns the default.
	 *
	 * @returns {object}
	 */
	function fromOption(option, defaultOption) {
		return (option != null) ? option : defaultOption;
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

			self._x = fromOption(options.x, 0);
			self._y = fromOption(options.y, 0);
			self._width = fromOption(options.width, 0);
			self._height = fromOption(options.height, 0);
			self._alpha = fromOption(options.alpha, 1);
			self._angle = fromOption(options.angle, 0);
			self._background = null;
			self._enabled = fromOption(options.enabled, true);
			self._context = fromOption(options.context, globalContext);

			self._rootContext = self.context;
			self._owner = null;

			self._requestRepaint = true;
			self._alwaysRepaint = false;

			self._surface = new myst.Surface({
				width: self._width,
				height: self._height
			});

			self._texSurface = self._surface.canvas;
			
			self._events = {
				// "onRepaint" is triggered when the component requests a repaint
				onRepaint: C_EMPTYF,
				// "onAdded" is triggered whenever the component is added to a container
				onAdded: function() {
					if (options.onAdded instanceof Function) {
						options.onAdded.call(self);
					}
				},
				// "onRemoved" is triggered whenever the component is removed from a container
				onRemoved: function() {
					if (options.onRemoved instanceof Function) {
						options.onRemoved.call(self);
					}
				}
			};

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
				// climb the chain of owners to determine enabled state
				var component = self;
				do {
					if (!component._enabled) {
						return false;
					}
					component = component._owner;
				} while (component);
				return true;
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

			self.setAngle = function(angle) {
				self._angle = angle;
			};

			self.getAngle = function() {
				return self._angle;
			};

			/**
			 * Set background to specified background color.
			 *
			 * @param {string} color - Component background color.
			 */
			self.setBackground = function(color) {
				self._background = color;
				self._surface.setFillClearMethod(color);
				self._requestRepaint = true;
				return self;
			};

			/**
			 * Set background to transparent.
			 */
			self.removeBackground = function() {
				self._background = null;
				self._surface.setDefaultClearMethod();
				self._requestRepaint = true;
				return self;
			};

			/**
			 * Retreive current component background color.
			 */
			self.getBackground = function() {
				return self._background;
			};

			self.draw = function() {
				if (self._alwaysRepaint || self._requestRepaint && self._events.onRepaint) {
					console.log('repaint called');
					self._surface.clear();
					self._events.onRepaint();
					self._requestRepaint = false;
				}
				var alpha = self.getAlpha();
				if (alpha <= 0) {
					return;
				}
				if (self._angle !== 0) {
					var centerX = Math.floor(self._x + self._width / 2);
					var centerY = Math.floor(self._y + self._height / 2);
					self._context.paint.rotate(self._angle, [centerX, centerY]);
				}
				if (alpha < 1) {
					self._context.paint.setAlpha(alpha);
				}
				self._context.paint.graphics(self._texSurface, self._x, self._y);
				if (alpha < 1) {
					self._context.paint.setAlpha();
				}
				if (self._angle !== 0) {
					self._context.paint.restore();
				}
			};

			// initialize background
			if (options.background) {
				self.setBackground(options.background);
			}
		},

		/**
		 * Debuggable component.
		 */
		Debuggable: function(options, self) {
			self = self || this;

			if (options.debug) {
				var debugDisplayText = '';
				var debugWatch = (options.debugString)
					? options.debugString.replace(/\$/g, '_').split(' ')
					: ['_type'];
				function updateDebugDisplayText() {
					debugDisplayText = '';
					for (var i = 0; i < debugWatch.length; i++) {
						debugDisplayText += self[debugWatch[i]] + ' ';
					}
				}
				var debugColor = options.debugColor || '#c2f';
				setInterval(updateDebugDisplayText, 100);
				var s_draw = self.draw; // @super:draw
				self.draw = function() { // @override
					s_draw();
					if (self._angle !== 0) {
						var centerX = Math.floor(self._x + self._width / 2);
						var centerY = Math.floor(self._y + self._height / 2);
						self._context.paint.rotate(self._angle, [centerX, centerY]);
					}
					self._context.paint.text(debugDisplayText, self._x, self._y - 15, debugColor, 'left', '11px sans-serif');
					self._context.paint.rect(self._x, self._y, self._width, self._height, debugColor, 2);
					if (self._angle !== 0) {
						self._context.paint.restore();
					}
				}
			}
		},

		/**
		 * Tweenable component.
		 */
		Tweenable: function(options, self) {

			self.tween = function(properties, options) {
				var duration = fromOption(options.duration, 240);
				var easef = fromOption(options.ease, myst.ease.quadInOut);

				myst.iter(properties, function(key, value) {
					var memberfstr = key.charAt(0).toUpperCase() + key.slice(1);
					var from = self['get' + memberfstr]();
					var to = value;
					var setf = self['set' + memberfstr];
					console.log(memberfstr, from, to, setf);
					(new myst.Tween(from, to, duration, setf, function() {
						if (options.onDone instanceof Function) {
							options.onDone.call(self);
						}
					}, easef)).start();
				});
			};

			self.fadeOut = function(options) {
			};

			self.fadeIn = function(options) {
			};
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
			var _eventId = '_@' + getNextEventId();
			console.log(_eventId);

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
			}, _eventId).bindTo(self._rootContext);

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
			}, _eventId).bindTo(self._rootContext);

			input.on('release', function(coords) {
				if (self._holding && self.isEnabled()) {
					var prevPressed = self._pressed;
					self._holding = self._pressed = false;
					if (prevPressed) {
						self._events.onRelease();
						self._events.onClick();
					}
				}
			}, _eventId).bindTo(self._rootContext);

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

			// list of components
			self._componentList = [];
			self._componentKeys = [];

			/**
			 * Adds components to the container.
			 *
			 * @param {object} components - Components to be added.
			 */
			self.add = function(components) {
				myst.iter(components, function(componentKey, componentObject) {
					if (self[componentKey]) { // disallow reserved or duplicate keys
						console.error('Cannot add component "' + componentKey + '" due to a name clash.');
						return;
					}
					self._componentList.push(self[componentKey] = componentObject);
					self._componentKeys.push(componentKey);
					// set component context to this container
					componentObject._context = componentObject._owner = self;
					// set root context to current root context
					componentObject._rootContext = self._rootContext;
					// invoke added event
					if (componentObject._events.onAdded) {
						componentObject._events.onAdded();
					}
				});
			};

			/**
			 * Get all components.
			 */
			self.getComponents = function() {
				return self._componentList;
			};

			/**
			 * Remove all components.
			 */
			self.removeAll = function() {
				self._componentList.forEach(function(componentObject) {
					// unregister any events attached to components
					if (componentObject.unregisterEvents) {
						componentObject.unregisterEvents();
					}
					// recursively remove all contained containers
					if (componentObject.removeAll) {
						componentObject.removeAll();
					}
					// invoke removed event
					if (componentObject._events.onRemoved) {
						componentObject._events.onRemoved();
					}
				});
				// clear component lists
				self._componentList = [];
				// clear component keys
				self._componentKeys.forEach(function(componentKey) {
					delete self[componentKey];
				});
				// clear component key list
				self._componentKeys = [];
			};

			// add components from options
			if (options.components) {
				self.add(options.components);
			}
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
				new elementary_components.Debuggable(options, self),
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
				new public_components.Control(options, self),
				new elementary_components.Container(options, self)
			);

			self._type = 'Frame';

			/**
			 * Draw the component and all children components.
			 */
			var s_draw = self.draw; // @super:draw
			self.draw = function() { // @override
				self._surface.clear();
				var n_components = self._componentList.length;
				for (var i = 0; i < n_components; i++) {
					self._componentList[i].draw();
				}
				s_draw();
			};
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
			};

			self._events.onRelease = function() { // @override
				self._activeTile = options.tiles.normal;
				self._requestRepaint = true;
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
