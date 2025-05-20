/**
 * main file for modular system initialization logic
 */

// Core components
var MIDI = require('./core/MIDI');
// UI components
// var CableGUI = require('./ui/cableGUI'); // Not needed as an object here, its require modifies Cable.prototype
var moduleManagerFactory = require('./ui/moduleManager'); // The factory

// UI Panels - these are typically singletons or modules that manage their own state/DOM
var moduleLibrary = require('./ui/moduleLibrary');
var bufferLibrary = require('./ui/bufferLibrary');
var audioEditor = require('./ui/audioEditor');

// Global API object (can be useful for debugging or external interaction)
window.MODULAR = {
	Patch: require('./core/Patch'),
	Synths: require('./synthesizers'),
};

// The main initialization function
function InitializeModularSystem(buffers, synthEditorInstance) {
	// window.assets.buffers is set by modular_entry.js and passed as 'buffers'
	// window.connectors and window.cables are initialized in modular_entry.js

	// Get the singleton moduleManager instance.
	// This relies on moduleManagerFactory returning the same instance if called multiple times
	// with the same synthEditorInstance, or simply the already created one.
	var moduleManager = moduleManagerFactory(synthEditorInstance);

	// Initialize MIDI
	if (MIDI && typeof MIDI.open === 'function') {
		MIDI.open();
	} else {
		console.warn("MIDI.open is not available.");
	}

	// Open default UI panels
	// These panels might initialize themselves upon require, or need an explicit .open()
	if (moduleLibrary && typeof moduleLibrary.open === 'function') {
		moduleLibrary.open();
	}
	if (bufferLibrary && typeof bufferLibrary.open === 'function') {
		bufferLibrary.open();
	}
	if (audioEditor && typeof audioEditor.open === 'function') {
		audioEditor.open();
	}

	// Load a default patch if available in window.assets.patches
	// menuHeader.js also has logic for a patch menu, ensure this doesn't conflict.
	// Typically, an explicit default patch takes precedence.
	if (window.assets && window.assets.patches && window.assets.patches.default) {
		console.log("Loading default patch from modular.js...");
		moduleManager.setPatch(window.assets.patches.default);
	} else {
		console.log("No default patch specified in assets. Patches might be loadable via menu.");
	}

	// Start the cable drawing loop/initial draw
	// CableGUI.js modifies Cable.prototype.draw. The actual drawing of all cables
	// is managed by moduleManager.
	if (moduleManager && typeof moduleManager.drawCables === 'function') {
		moduleManager.drawCables();
	} else {
		console.warn("moduleManager.drawCables is not a function or moduleManager is not loaded correctly.");
	}

	console.log('Modular system initialized by modular.js');
}

module.exports = InitializeModularSystem;
