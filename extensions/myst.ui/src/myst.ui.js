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
	 * Rotate point P around point R by angle.
	 *
	 * @param {array} P - Point P.
	 * @param {array} R - Point R.
	 * @param {number} angle - Angle to rotate by.
	 *
	 * @returns {array}
	 */
	/*
	function rotatePointAroundPoint(P, R, angle) {
		P[0] -= R[0];
		P[1] -= R[1];
		var B = [
			Math.floor(P[0] * Math.cos(angle) - P[1] * Math.sin(angle)),
			Math.floor(P[1] * Math.cos(angle) + P[0] * Math.sin(angle))
		];
		B[0] += R[0];
		B[1] += R[1];
		return B;
	}
	*/

	/**
	 * Converts degrees to radians.
	 *
	 * @param {number} degrees
	 *
	 * @returns {number}
	 */
	/*
	function toRadians(degrees) {
		return degrees * Math.PI / 180;
	}
	*/

	/**
	 * Applies an action to an arbitrary group of components.
	 *
	 * @param {object} group - Group of components.
	 * @param {string} fname - Function name.
	 * @param {string} [fargs] - Function arguments.
	 */
	/*
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
	*/

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

	/**
	 * Invoke a user event.
	 *
	 * @param {function} callback - User function to call.
	 * @param {object} self - Reference to component invoking the event.
	 */
	function invokeEvent(callback, self) {
		if (callback instanceof Function) {
			callback.call(self);
		}
	}

	///////////////////////////////////////////////////////////////////////////////
	//
	//  Elementary components
	//
	///////////////////////////////////////////////////////////////////////////////
	
	var elementary_components = {

		/**
		 * Base elementary component.
		 *
		 * @class elementary_components.Base
		 * @classdesc Base component implements functions common to all components.
		 *
		 * @param {object} options - Constructor options.
		 * @param {object} [options.context] - State context. Global context by default.
		 * @param {number} [options.x=0] - Component x position.
		 * @param {number} [options.y=0] - Component y position.
		 * @param {number} [options.width=0] - Component width.
		 * @param {number} [options.height=0] - Component height.
		 * @param {number} [options.alpha=1] - Component alpha level.
		 * @param {number} [options.angle=0] - Component rotation angle.
		 * @param {bool} [options.enabled=true] - Component enabled status.
		 * @param {string} [options.background] - Component background color. Default to null
		 *   for transparent background.
		 * @param {function} [options.onAdded] - Added event is triggered when the component is
		 *   added to a container.
		 * @param {function} [options.onRemoved] - Removed event is triggered when the component is
		 *   removed from a container.
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
			
			self._events = {};

			// "onRepaint" is triggered when the component requests a repaint
			self._events.onRepaint = C_EMPTYF;
			// "onAdded" is triggered when the component is added to a container
			self._events.onAdded = function() { invokeEvent(options.onAdded, self); };
			// "onRemoved" is triggered when the component is removed from a container
			self._events.onRemoved = function() { invokeEvent(options.onRemoved, self); };
/*
				onEnabled: function() { invokeEvent(options.onEnabled, self); },
				onDisabled: function() { invokeEvent(options.onDisabled, self); },
				onMoved: function() { invokeEvent(options.onMoved, self); },
				onResized: function() { invokeEvent(options.onResized, self); },
				onAlphaSet: function() { invokeEvent(options.onAlphaSet, self); },
				onAngleSet: function() { invokeEvent(options.onAngleSet, self); }
			};
			*/

			self.paint = self._surface.render;

			/**
			 * Enables the component.
			 */
			self.enable = function() {
				self._enabled = true;
				return self;
			};

			/**
			 * Disables the component.
			 */
			self.disable = function() {
				self._enabled = false;
				return self;
			};

			/**
			 * Returns the component enabled state.
			 */
			self.isEnabled = function() {
				// climb the chain of owners to determine enabled state
				var component = self;
				do {
					if (!component._enabled) {
						return false;
					}
				} while ((component = component._owner));
				return true;
			};

			/**
			 * Sets the component x position.
			 */
			self.setX = function(x) {
				self._x = x;
				return self;
			};

			/**
			 * Sets the component y position.
			 */
			self.setY = function(y) {
				self._y = y;
				return self;
			};

			/**
			 * Returns the component x position.
			 *
			 * @returns {number}
			 */
			self.getX = function() {
				return self._x;
			};

			/**
			 * Returns the component y position.
			 *
			 * @returns {number}
			 */
			self.getY = function() {
				return self._y;
			};

			/**
			 * Returns the component global x position.
			 *
			 * @returns {number}
			 */
			self.getRealX = function() {
				var x = 0;
				var component = self;
				do { x += component._x; } while ((component = component._owner));
				return x;
			};

			/**
			 * Returns the component global y position.
			 *
			 * @returns {number}
			 */
			self.getRealY = function() {
				var y = 0;
				var component = self;
				do { y  += component._y; } while ((component = component._owner));
				return y;
			};

			/**
			 * Moves the component to given position.
			 *
			 * @param {number} x - x position.
			 * @param {number} y - y position.
			 */
			self.moveTo = function(x, y) {
				self._x = x;
				self._y = y;
				return self;
			};

			/**
			 * Moves the component by desired distance.
			 *
			 * @param {number} x - x distance.
			 * @param {number} y - y distance.
			 */
			self.moveBy = function(dx, dy) {
				self._x += dx;
				self._y += dy;
				return self;
			};

			/**
			 * Sets the component width.
			 *
			 * @param {number} width
			 */
			self.setWidth = function(width) {
				self._width = width;
				self._surface.resize(self._width, self._height);
				return self;
			};

			/**
			 * Sets the component height.
			 *
			 * @param {number} height
			 */
			self.setHeight = function(height) {
				self._height = height;
				self._surface.resize(self._width, self._height);
				return self;
			};

			/**
			 * Returns the component width.
			 *
			 * @returns {number}
			 */
			self.getWidth = function() {
				return self._width;
			};

			/**
			 * Returns the component height.
			 *
			 * @returns {number}
			 */
			self.getHeight = function() {
				return self._height;
			};

			/**
			 * Resize the component.
			 *
			 * @param {number} width
			 * @param {number} height
			 */
			self.resize = function(width, height) {
				// TODO constraints
				self._width = width;
				self._height = height;
				self._surface.resize(self._width, self._height);
				return self;
			};

			/**
			 * Grow the component width in both directions by given amount.
			 *
			 * @param {number} width
			 */
			self.growByWidth = function(width) {
				self._x -= width;
				self._width += width * 2;
				self._requestRepaint = true;
				self._surface.resize(self._width, self._height);
				return self;
			};

			/**
			 * Shrink the component width in both directions by given amount.
			 *
			 * @param {number} width
			 */
			self.shrinkByWidth = function(width) {
				self.growByWidth(-width);
			};

			/**
			 * Grow the component height in both directions by given amount.
			 *
			 * @param {number} height
			 */
			self.growByHeight = function(height) {
				self._y -= height;
				self._height += height * 2;
				self._requestRepaint = true;
				self._surface.resize(self._width, self._height);
				return self;
			};

			/**
			 * Shrink the component height in both directions by given amount.
			 *
			 * @param {number} height
			 */
			self.shrinkByHeight = function(height) {
				self.growByHeight(-height);
			};

			/**
			 * Grow the component in all directions by given amount.
			 */
			self.growBy = function(size) {
				return self.growByWidth(size).growByHeight(size);
			};

			/**
			 * Shrink the component in all directions by given amount.
			 */
			self.shrinkBy = function(size) {
				return self.growBy(-size);
			};

			/**
			 * Reset component x position to one provided at construction.
			 */
			self.resetX = function() {
				self.setX(fromOption(options.x, 0));
				return self;
			};

			/**
			 * Reset component y position to one provided at construction.
			 */
			self.resetY = function() {
				self.setY(fromOption(options.y, 0));
				return self;
			};

			/**
			 * Reset component position to one provided at construction.
			 */
			self.resetPosition = function() {
				return self.resetX().resetY();
			};

			/**
			 * Reset component width to one provided at construction.
			 */
			self.resetWidth = function() {
				self.setWidth(fromOption(options.width, 0));
			};

			/**
			 * Reset component height to one provided at construction.
			 */
			self.resetHeight = function() {
				self.setHeight(fromOption(options.height, 0));
			};

			/**
			 * Reset component size to one provided at construction.
			 */
			self.resetSize = function() {
				return self.resetWidth().resetHeight();
			};

			/**
			 * Shows the component.
			 */
			self.show = function() {
				self._alpha = 1;
				return self;
			};

			/**
			 * Hides the component.
			 */
			self.hide = function() {
				self._alpha = 0;
				return self;
			};

			/**
			 * Sets component alpha level.
			 *
			 * @param {number} alpha - Alpha level (0 to 1).
			 */
			self.setAlpha = function(alpha) {
				self._alpha = alpha;
				return self;
			};

			/**
			 * Returns component alpha level.
			 *
			 * @returns {number}
			 */
			self.getAlpha = function() {
				return self._alpha;
			};

			/**
			 * Centers component x position relative to owner.
			 */
			self.centerX = function() {
				var ownerWidth = (self._owner) ? self.owner._width : self._context.surface.width;
				self.setX(Math.floor((ownerWidth - self._width) / 2));
				return self;
			};

			/**
			 * Centers component y position relative to owner.
			 */
			self.centerY = function() {
				var ownerHeight = (self._owner) ? self.owner._height : self._context.surface.height;
				self.setY(Math.floor((ownerHeight - self._height) / 2));
				return self;
			};

			/**
			 * Centers component relative to owner.
			 */
			self.center = function() {
				return self.centerX().centerY();
			};

			/**
			 * Sets component rotation angle.
			 *
			 * @param {number} angle - Rotation angle in degrees.
			 */
			self.setAngle = function(angle) {
				self._angle = angle;
			};

			/**
			 * Returns component rotation angle.
			 *
			 * @returns {number}
			 */
			self.getAngle = function() {
				return self._angle;
			};

			/**
			 * Set component background to specified background color.
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
			 * Set component background to transparent.
			 */
			self.removeBackground = function() {
				self._background = null;
				self._surface.setDefaultClearMethod();
				self._requestRepaint = true;
				return self;
			};

			/**
			 * Returns component background color. Returns null when background is transparent.
			 */
			self.getBackground = function() {
				return self._background;
			};

			/**
			 * Draw the component.
			 */
			self.draw = function() {
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
				if (self._alwaysRepaint || self._requestRepaint) {
					console.log('repaint called');
					self._surface.clear();
					self._events.onRepaint();
					self._requestRepaint = false;
				}
			};

			// initialize background
			if (options.background) {
				self.setBackground(options.background);
			}
		},

		/**
		 * Debuggable elementary component.
		 *
		 * @class elementary_components.Debuggable
		 * @classdesc Adds debug features to component.
		 *
		 * @param {object} options - Constructor options.
		 * @param {bool} [options.debug=false] - When set to true, debugging features will be enabled.
		 * @param {string} [options.debugColor=#c2f] - Color of debug display.
		 * TODO @param {string} [options.debugString=$type] - String of variables to watch and display.
		 *   Private variables are prefixed with $, public variables with %.
		 * TODO @param {number} [options.debugOutputAnchor=1] - Debug label anchor. 1-4 for each corner
		 *   of the container.
		 * TODO @param {array} [options.debugOutputOffset=[0,-15]] - Debug label position.
		 * TODO @param {number} [options.debugBorderWidth=2] - Debug border thickness.
		 */
		Debuggable: function(options, self) {
			self = self || this;

			var debugDisplayText = '';
			function updateDebugDisplayText() {
				debugDisplayText = '';
				for (var i = 0; i < debugWatch.length; i++) {
					debugDisplayText += self[debugWatch[i]] + ' ';
				}
			}

			if (options.debug) {
				var debugWatch = (options.debugString) ? options.debugString.replace(/\$/g, '_').split(' ') : ['_type'];
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
				};
			}
		},

		/**
		 * Tweenable elementary component.
		 *
		 * @class elementary_components.Tweenable
		 * @classdesc Gives component superpowers.
		 */
		Tweenable: function(options, self) {

			var _activeTweens = [];

			function finalizeAllTweens() {
				_activeTweens.forEach(function(tween) {
					if (tween.isActive()) {
						tween.finish();
					}
				});
			}

			/**
			 * Performs a tween.
			 *
			 * @param {object} properties - Collection of properties and corresponding values to tween.
			 * @param {object} [options] - Tween options.
			 * @param {number} [options.duration=240] - Tween duration in milliseconds.
			 * @param {function} [options.ease=myst.ease.quadInOut] - Easing function.
			 * TODO @param {number} [options.delay=0] - Tween delay in milliseconds.
			 * TODO @param {function} [options.onDone] - Is called when tween is done animating.
			 */
			self.tween = function(properties, options) {
				options = options || {};
				var duration = fromOption(options.duration, 240);
				var easef = fromOption(options.ease, myst.ease.quadInOut);

				finalizeAllTweens();
				_activeTweens = [];

				myst.iter(properties, function(key, value) {
					var memberfstr = key.charAt(0).toUpperCase() + key.slice(1);
					var from = self['get' + memberfstr]();
					var to = value;
					var setf = self['set' + memberfstr];
					console.log(memberfstr, from, to, setf);
					var tween = new myst.Tween(from, to, duration, setf, function() {
						invokeEvent(options.onDone, self);
					}, easef);
					_activeTweens.push(tween);
					tween.start();
				});
				return self;
			};

			/**
			 * Fade out a component.
			 *
			 * @param {object} [options] - Tween options.
			 * @param {number} [options.duration=240] - Tween duration in milliseconds.
			 * @param {function} [options.ease=myst.ease.quadInOut] - Easing function.
			 * TODO @param {number} [options.delay=0] - Tween delay in milliseconds.
			 */
			self.fadeOut = function(options) {
				self.tween({ alpha: 0 }, options);
			};

			/**
			 * Fade in a component.
			 *
			 * @param {object} [options] - Tween options.
			 * @param {number} [options.duration=240] - Tween duration in milliseconds.
			 * @param {function} [options.ease=myst.ease.quadInOut] - Easing function.
			 * TODO @param {number} [options.delay=0] - Tween delay in milliseconds.
			 */
			self.fadeIn = function(options) {
				self.tween({ alpha: 1 }, options);
			};
		},

		/**
		 * Graphics elementary component.
		 *
		 * @class elementary_components.Graphics
		 * @classdesc Displays graphics.
		 *
		 * @param {object} options - Constructor options.
		 * @param {object} options.texture - Component graphics.
		 */
		Graphics: function(options, self) {
			self = self || this;

			self._texGraphic = options.texture;

			self._events.onRepaint = function() {
				self.paint.graphics(self._texGraphic, 0, 0, self._width, self._height);
			};
		},

		/**
		 * Tile elementary component.
		 *
		 * @class elementary_components.Tile
		 * @classdesc Displays a tile from a tileset.
		 *
		 * @param {object} options - Constructor options.
		 * @param {object} options.texture - Component graphics.
		 * @param {array} [options.tile=[0,0]] - Current tile.
		 */
		Tile: function(options, self) {
			self = self || this;

			self._texTileset = options.texture;
			self._tileWidth = options.tileWidth || self._width;
			self._tileHeight = options.tileHeight || self._height;
			
			self._activeTile = fromOption(options.tile, [0, 0]);

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
		 * AbstractButton elementary component.
		 *
		 * @class elementary_components.AbstractButton
		 * @classdesc Defines a button abstraction with corresponding events.
		 *
		 * @param {object} options - Constructor options.
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

			function _pointInAABB(coords) {
				//return myst.pointInRect(coords[0], coords[1], self._x, self._y, self._width, self._height);
				return myst.pointInRect(coords[0], coords[1], self.getRealX(), self.getRealY(), self._width, self._height);
			}

			function _pointIn(coords) {
				var component = self;
				var list = [];
				do {
					list.push(component);
				} while ((component = component._owner));
				for (var i = list.length - 1; i >= 0; i--) {
					component = list[i];
					if (component._angle !== 0) {
						var centerPoint = [
							Math.floor(component.getRealX() + component._width / 2),
							Math.floor(component.getRealY() + component._height / 2)
						];
						//coords = rotatePointAroundPoint(coords, centerPoint, toRadians(-component._angle));
						coords = myst.rotatePoint(coords[0], coords[1], centerPoint[0], centerPoint[1], -component._angle);
					}
				}
				return _pointInAABB(coords);
			}

			self._holding = false;
			self._pressed = false;

			input.on('press', function(coords) {
				if (!self.isEnabled()) {
					return;
				}
				if (_pointIn(coords)) {
					self._holding = self._pressed = true;
					self._events.onPress();
				}
			}, _eventId).bindTo(self._rootContext);

			input.on('move', function(coords) {
				if (self._holding && self.isEnabled()) {
					var prevPressed = self._pressed;
					var nextPressed = _pointIn(coords);
					if (prevPressed !== nextPressed) {
						if ((self._pressed = nextPressed)) {
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
		 * Container elementary component.
		 *
		 * @class elementary_components.Container
		 * @classdesc Defines a container abstraction.
		 *
		 * @param {object} options - Constructor options.
		 * @param {object} [options.components] - Components to add to container.
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
				return self;
			};

			/**
			 * Get the list of components.
			 *
			 * @returns {array}
			 */
			self.getComponents = function() {
				return self._componentList;
			};

			/**
			 * Get the list of component keys.
			 *
			 * @returns {array}
			 */
			self.getComponentKeys = function() {
				return self._componentKeys;
			};

			/**
			 * Remove all components from the container.
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
				return self;
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
				self,
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
				self,
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

		Shape: function(options, self) {
			self = self || this;

			myst.compose(
				self,
				new public_components.Control(options, self)
			);

			self._type = 'Shape';

			var SHAPE_TYPE = {
				rectangle: 0,
				line: 1,
				triangle: 2,
				polygon: 3,
				arc: 4,
				circle: 5
			};

			self._shapeColor = fromOption(options.shapeColor, '#fff');
			self._shapeFill = fromOption(options.shapeFill, false);
			self._shapeBorder = fromOption(options.shapeBorder, 1);
			self._shapePoints = fromOption(options.shapePoints, [[0, 0], [1, 1]]);
			self._shapeType = 0;

			self._events.onRepaint = function() { // @override
				var points = self._shapePoints;
				var n_points = points.length;
				var scale_x = self.getWidth();
				var scale_y = self.getHeight();
				// normalize points
				for (var p = 0; p < n_points; p++) {
					points[p][0] *= scale_x;
					points[p][1] *= scale_y;
				}
				switch (self._shapeType) {
					//
					// rectangle shape
					//
					case SHAPE_TYPE.rectangle:
						if (n_points < 2) {
							return;
						}
						if (self._shapeFill) {
							self.paint.rectFill(
								points[0][0], points[0][1],
								points[1][0] - points[0][0], points[1][1] - points[0][1],
								self._shapeColor
							);
						}
						else {
							self.paint.rect(
								points[0][0], points[0][1],
								points[1][0] - points[0][0], points[1][1] - points[0][1],
								self._shapeColor,
								self._shapeBorder
							);
						}
						break;
					//
					// line shape
					//
					case SHAPE_TYPE.line:
						if (n_points < 2) {
							return;
						}
						self.paint.line(
							points[0][0], points[0][1],
							points[1][0], points[1][1],
							self._shapeColor,
							self._shapeBorder
						);
						break;
					//
					// triangle shape
					//
					case SHAPE_TYPE.triangle:
						if (n_points < 3) {
							return;
						}
						if (self._shapeFill) {
							self.paint.polygon(points, self._shapeColor);
						}
						else {
							for (var i = 0; i < 3; i++) {
								var indexCurrent = i;
								var indexNext = (i < 2) ? i + 1 : 0;
								self.paint.line(
									points[indexCurrent][0], points[indexCurrent][1],
									points[indexNext][0], points[indexNext][1],
									self._shapeColor,
									self._shapeBorder
								);
							}
						}
						break;
					//
					// polygon shape
					//
					case SHAPE_TYPE.polygon:
						if (n_points < 3) {
							return;
						}
						if (self._shapeFill) {
							self.paint.polygon(points, self._shapeColor);
						}
						else {
							for (var i = 0; i < n_points; i++) {
								var indexCurrent = i;
								var indexNext = (i < n_points - 1) ? i + 1 : 0;
								self.paint.line(
									points[indexCurrent][0], points[indexCurrent][1],
									points[indexNext][0], points[indexNext][1],
									self._shapeColor,
									self._shapeBorder
								);
							}

						}
						break;
					//
					// arc shape
					//
					case SHAPE_TYPE.arc:
						break;
					//
					// circle shape
					//
					case SHAPE_TYPE.circle:
						break;
					//
					// rounded rectangle shape
					//
				}
			};

			/**
			 * Sets shape type.
			 */
			self.setShapeType = function(shapeType) {
				if (!shapeType) {
					shapeType = 'rectangle';
				}
				self._shapeType = SHAPE_TYPE[shapeType];
			};

			// set shape type on init
			self.setShapeType(fromOption(options.shapeType));
		},

		Image: function() {
			self = self || this;

			myst.compose(
				self,
				new public_components.Control(options, self),
				new elementary_components.Graphics(options, self)
			);

			self._type = 'Image';
		},

		TileImage: function() {
		},

		Label: function() {
			self = self || this;
		},

		BitmapLabel: function() {
		},

		TileButton: function(options, self) {
			self = self || this;

			myst.compose(
				self,
				new public_components.Control(options, self),
				new elementary_components.Tile(options, self),
				new elementary_components.AbstractButton(options, self)
			);

			self._type = 'TileButton';

			self._events.onPress = function() { // @override
				self._activeTile = options.tiles.pressed;
				self._requestRepaint = true;
				invokeEvent(options.onPress, self);
			};

			self._events.onRelease = function() { // @override
				self._activeTile = options.tiles.normal;
				self._requestRepaint = true;
				invokeEvent(options.onRelease, self);
			};

			self._events.onClick = function() { // @override
				invokeEvent(options.onClick, self);
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
