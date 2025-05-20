// Define inherits globally, similar to modular/src/editor.js
// This ensures it's available before other modular_src files might need it.
window.inherits = function (Child, Parent) {
  Child.prototype = Object.create(Parent.prototype, {
    constructor: {
      value: Child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

// Function to load JSON, adapted from modular/src/editor.js
function loadJson(path, cb) {
  var xobj = new XMLHttpRequest();
  xobj.onreadystatechange = function () {
    if (~~xobj.readyState !== 4) return;
    if (~~xobj.status !== 200) {
      console.error('XHR Error:', xobj.status, xobj.statusText, 'for path:', path);
      return cb('xhrError:' + xobj.status);
    }
    try {
      return cb && cb(null, JSON.parse(xobj.response));
    } catch (e) {
      console.error('JSON Parse Error:', e, 'for path:', path, 'response:', xobj.response.substring(0, 100));
      return cb && cb('jsonParseError: ' + e);
    }
  };
  // Path will be relative to the public folder, e.g., /modular_assets/buffers.json
  xobj.open('GET', path, true);
  xobj.send();
}

// Load assets and then initialize the main modular UI
// The path '/modular_assets/buffers.json' assumes buffers.json is in public/modular_assets/
loadJson('/modular_assets/buffers.json', function onAssetsLoaded(error, assets) {
  if (error) {
    console.error('Failed to load modular assets (buffers.json):', error);
    const canvasElement = document.getElementById('cableCanvas');
    if (canvasElement && canvasElement.parentElement) {
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Error loading modular synth assets. Please check the console for details.';
      errorDiv.style.color = 'red';
      errorDiv.style.padding = '10px';
      errorDiv.style.border = '1px solid red';
      canvasElement.parentElement.insertBefore(errorDiv, canvasElement);
    }
    return;
  }
  window.assets = { buffers: assets };
  // Pre-initialize global arrays that modules might access.
  // The main InitializeModularSystem function will later populate these.
  window.connectors = [];
  window.cables = [];

  // --- Initialize Modular System (adapted from modular/src/main.js) ---
  // Note: Adjust paths if bun has trouble resolving them.
  // These paths assume bun can resolve from app/javascript or you've configured it.
  // Otherwise, use relative paths like './modular_src/modules.js'

  try {
    // Load dataTypes first, as it defines MIDI_MESSAGE_TYPES which might be used by 'modules'
    require('./modular_src/data/dataTypes').initializeDatabase(window.assets.buffers);
    // Core & modules
    require('./modular_src/modules');

    // Get the main modular system initializer function
    const InitializeModularSystem = require('./modular_src/modular');

    // UI components that are simple definitions (usually classes or objects)
    // These should now find window.connectors and window.cables if they access them at load time.
    require('./modular_src/ui/moduleGUI');
    require('./modular_src/ui/connectorGUI');
    require('./modular_src/ui/cableGUI');
    require('./modular_src/ui/knobGUI');
    require('./modular_src/ui/buttonGUI');

    require('./modular_src/ui/dropFile');
    require('./modular_src/ui/onWindowResize');

    // Initialize synthEditor first as it's a dependency for moduleManager and InitializeModularSystem
    var synthEditor = require('./modular_src/ui/synthEditor');
    synthEditor.register('disco', require('./modular_src/synthesizers/disco/editor'));
    synthEditor.register('hats', require('./modular_src/synthesizers/hats/editor'));

    // Initialize moduleManager using its factory, which depends on synthEditor
    const moduleManagerFactory = require('./modular_src/ui/moduleManager');
    var moduleManager = moduleManagerFactory(synthEditor); // Call factory

    // Initialize menuHeader using its factory, which depends on moduleManager
    // Assuming menuHeader.js also exports a factory function
    const menuHeaderFactory = require('./modular_src/ui/menuHeader');
    menuHeaderFactory(moduleManager); // Call factory

    // Finally, initialize the main modular system.
    // This function will further populate window.connectors, window.cables,
    // load patches, start the draw loop, etc.
    InitializeModularSystem(window.assets.buffers, synthEditor);

    console.log('Modular synth UI initialized successfully.');

  } catch (e) {
    console.error("Error during modular system initialization:", e);
    const canvasElement = document.getElementById('cableCanvas');
    if (canvasElement && canvasElement.parentElement) {
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Error initializing modular synth UI. Please check the console for details.';
      errorDiv.style.color = 'red';
      errorDiv.style.padding = '10px';
      errorDiv.style.border = '1px solid red';
      canvasElement.parentElement.insertBefore(errorDiv, canvasElement);
    }
  }
});