/*
 * myst.ui.js
 * UI extension for myst.js
 *
 * (c) 2021 Danijel Durakovic
 * MIT License
 *
 */

/*jshint globalstrict:true*/
/*jshint browser:true*/
/*globals myst*/

/**
 * @file myst.ui.js
 * @version 0.1.0
 * @author Danijel Durakovic
 * @copyright 2020
 */

"use strict";

myst.ui = (function() {

var globalContext = null;

var base_components = {

	/**
	 * Base component.
	 */
	Base: function(options, self) {
		self = self || this;

		self._x = options.x || 0;
		self._y = options.y || 0;
		self._width = options.width || 0;
		self._height = options.height || 0;
		self._alpha = (options.alpha) ? options.alpha : 1;
		self._enabled = (options.enabled) ? options.enabled : true;

		self._context = options.context || globalContext;

		self._surface = new myst.Surface({
			width: self._width,
			height: self._height
		});

		self._events = {};
		self._owner = null;
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
	},

	/**
	 * Tile component.
	 */
	Tile: function(options, self) {
	},

	/**
	 * AbstractButton component.
	 */
	AbstractButton: function(options, self) {
	}

};

var public_controls = {

	/**
	 * Base control.
	 */
	Control: function(options, self) {
		self = self || this;

		myst.compose(
			this,
			base_components.Base,
			base_components.Tweenable
		);
	},

	/**
	 * Frame control.
	 */
	Frame: function(options, self) {
		self = self || this;

		myst.compose(
			this,
			public_controls.Control
		);
	}

};

var public_functions = {

	/**
	 * Sets a global context which all newly created controls will default to when
	 * being constructed.
	 *
	 * @param {object} stateContext - Context to set as global context.
	 */
	setContext: function(stateContext) {
		globalContext = stateContext;
	}

};

return myst.compose(public_controls, public_functions);

}()); // end of myst.UI
