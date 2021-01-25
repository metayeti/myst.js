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

/**
 * @file myst.ui.js
 * @version 0.1.0
 * @author Danijel Durakovic
 * @copyright 2020
 */

"use strict";

myst.UI = (function() {

var base_components = {

	/**
	 * Base component.
	 */
	Base: function(options, self) {
		self = self || this;

		self._x = 0;
		self._y = 0;
		self._width = 0;
		self._height = 0;
		self._alpha = 0;
		self._enabled = true;
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
};

return myst.compose(public_components, public_functions);

}()); // end of myst.UI
