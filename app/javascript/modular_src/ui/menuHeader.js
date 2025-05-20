var domUtils = require('./domUtils');
var createDiv = domUtils.createDiv;
var createDom = domUtils.createDom;
var removeDom = domUtils.removeDom;
var makeButton = domUtils.makeButton;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
var PANELS = {
	audioEditor: require('./audioEditor'),
	moduleLibrary: require('./moduleLibrary'),
	bufferLibrary: require('./bufferLibrary'),
	synthEditor: require('./synthEditor'),
};

function openPanel(panel) {
	return function () {
		panel.open();
	}
}

function closeAllPanels() {
	for (var id in PANELS) {
		PANELS[id].close();
	}
}

module.exports = function (moduleManager) {
	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	function exportPatch() {
		var patch = moduleManager.getPatch(); // Use passed moduleManager

		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(patch));
		var anchor = createDom('a');
		anchor.setAttribute("href", dataStr);
		anchor.setAttribute("download", "patch.json");
		anchor.click();
		removeDom(anchor);
	}

	function importPatch() {
		// TODO
	}

	function openPatch(patchData) {
		return function () {
			moduleManager.setPatch(patchData); // Use passed moduleManager
		}
	}

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	// read patches folder and populate the "Patches" menu
	// window.assets should be defined by the time this factory is called from modular_entry.js
	var patchList = window.assets.patches || {};
	var patchMenu = [];

	for (var patchId in patchList) {
		patchMenu.push({ label: patchId, click: openPatch(patchList[patchId]) });
	}

	// open first patch if exist
	// Consider if this automatic patch loading should be here or handled by the main InitializeModularSystem
	if (patchMenu.length) {
		// patchMenu[0].click(); // This might be called before moduleManager is fully ready or synth types registered.
	}

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	var MENU_TEMPLATE = [
		{
			label: 'File',
			submenu: [
				{ label: 'Load Patch', click: null }, // Placeholder, implement if needed
				{ label: 'Save Patch', click: null }, // Placeholder, implement if needed
				//--------------------------------------------------------
				{ type: 'separator' },
				{ label: 'Import Patch', click: importPatch },
				{ label: 'Export Patch', click: exportPatch },
				//--------------------------------------------------------
				{ type: 'separator' },
				{ label: 'Clear', click: function clearPatch() { moduleManager.clearPatch(); } }, // Use passed moduleManager
			]
		},
		{
			label: 'Patches',
			submenu: patchMenu,
		},
		{
			label: 'View',
			submenu: [
				{ label: 'Modules Library', type: 'checkbox', checked: true, click: openPanel(PANELS.moduleLibrary) },
				{ label: 'Buffers Library', type: 'checkbox', checked: true, click: openPanel(PANELS.bufferLibrary) },
				{ label: 'Audio Editor', type: 'checkbox', checked: true, click: openPanel(PANELS.audioEditor) },
				// ... other view items ...
				{ type: 'separator' },
				{ label: 'Close all', click: closeAllPanels },
			]
		},
	];

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	var menuBar = createDiv('menuHeader', null); // Assuming createDiv appends to a known parent or document.body
	menuBar._currentSubmenu = null;
	var closedAt = 0;

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	function closeCurrentSubmenu() {
		if (!menuBar._currentSubmenu) return;
		menuBar._currentSubmenu.style.display = 'none';
		menuBar._currentSubmenu = null;
		closedAt = Date.now();
	}

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	function addItemInSubmenu(subItem, submenuContainer) {
		if (subItem.type === 'separator') {
			createDiv('submenuSeparator', submenuContainer);
			return;
		}
		var subItemBtn = createDiv('submenuItem', submenuContainer);
		subItemBtn.innerText = subItem.label;

		makeButton(subItemBtn, function onClick() {
			subItem.click && subItem.click();
			closeCurrentSubmenu();
		});
	}

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	function addItemInMenuBar(item) {
		if (!item.label) return;
		var itemBtn = createDiv('menuItem', menuBar);
		itemBtn.innerText = item.label;

		var submenu = item.submenu;
		if (submenu) {
			var submenuContainer = createDiv('submenu', itemBtn);
			submenuContainer.style.display = 'none';
			for (var i = 0; i < submenu.length; i++) {
				addItemInSubmenu(submenu[i], submenuContainer);
			}
		}

		function openSubMenu() {
			// closing submenu
			if (menuBar._currentSubmenu === submenuContainer) {
				closeCurrentSubmenu();
				return;
			}

			closeCurrentSubmenu();
			menuBar._currentSubmenu = submenuContainer;
			submenuContainer.style.display = '';
		}

		makeButton(itemBtn, function onClick() {
			openSubMenu();
			item.click && item.click();
		});

		itemBtn.addEventListener('mouseleave', closeCurrentSubmenu);
		itemBtn.addEventListener('mouseenter', function () {
			if (Date.now() < closedAt + 300) openSubMenu();
		});
	}

	//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
	function createMenuFromTemplate(template) {
		for (var i = 0; i < template.length; i++) {
			var item = template[i];
			addItemInMenuBar(item);
		}
	}

	createMenuFromTemplate(MENU_TEMPLATE);

	// If menuBar needs to be returned or attached to a specific element, do it here.
	// For example, if it's not automatically appended by createDiv:
	// document.body.insertBefore(menuBar, document.body.firstChild); 
};
