/*
 * myst.js Example browser and live editor
 *
 * Copyright (c) 2021 Danijel Durakovic
 * MIT License
 *
 * host.js
 * Host application logic.
 *
 */
 
var _host_app = (function() { "use strict"

var _q = document.querySelector.bind(document);

var layoutManager = (function() {
	var $layoutContainer = _q('main');
	var $layoutCodeView = _q('main .code.layout-view');
	var $layoutExampleView = _q('main .example.layout-view');
	var $layoutSizer = _q('main .layout-sizer');
}());

var public_api = {

};

function main() {
	// load example scripts
	// initialize layout manager
	layoutMngr.init();
}

window.addEventListener('load', main);

return public_api;

}());
