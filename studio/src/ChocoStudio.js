import { ChocoWin, ChocoWinColor, ChocoWinCoordinates, ChocoWinTileSet, ChocoWinTilesetCorners, ChocoWinOptionEdges, ChocoWinSettings } from './ChocoWindow.js';

class ChocoStudioPreset {
    /**
     * Default constructor.
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioPreset} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type {String} */ this.name = "";
            /** @type {String} */ this.id = String(crypto.randomUUID());
            /** @type {String} */ this.tileSetId = null;
            /** @type {Number} */ this.tileScale = 1;
            /** @type {Array<ChocoWinColor} */ this.substituteColors = [];
        }
        else {
            this.name             = arg1.name;
            this.id               = arg1.id;
            this.tileSetId        = arg1.tileSetId
            this.tileScale        = arg1.tileScale
            this.substituteColors = arg1.substituteColors?.map((c) => new ChocoWinColor(c)) || [];
        }
    }
}

class ChocoStudioLayout {
    /**
     * Default constructor.
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioLayout} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type { String } */ this.name = "";
            /** @type { String } */ this.id = String(crypto.randomUUID());
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
        }
    }
}

class ChocoStudioWindow {
    /**
     * Default constructor.
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioWindow} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            this.name     = "";
            this.id       = String(crypto.randomUUID());
            this.presetId = null;
            this.x        = 40;
            this.y        = 30;
            this.h        = 480;
            this.w        = 640;
            this.singularPreset = null;
        }
        else {
            /** @type { String } */ this.name     = arg1.name;
            /** @type { String } */ this.id       = arg1.id;
            /** @type { String } */ this.presetId = arg1.presetId;
            /** @type { Number } */ this.x        = arg1.x;
            /** @type { Number } */ this.y        = arg1.y;
            /** @type { Number } */ this.w        = arg1.w;
            /** @type { Number } */ this.h        = arg1.h;
            /** @type { ChocoStudioPreset } */ this.singularPreset = arg1.singularPreset && new ChocoStudioPreset(arg1.singularPreset)
        }
    }
}

class ChocoStudioVariable {
    /**
     * Default constructor.
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioVariable} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            this.name = "";
            this.id = String(crypto.randomUUID());
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
        }
    }
}

class ChocoStudioWorkspace {
    /**
     * Default constructor.
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioWorkspace} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type { String } */ this.workspaceName = "";
            /** @type { String } */ this.id = String(crypto.randomUUID());
            /** @type { Number } */ this.width = 1920;
            /** @type { Number } */ this.height = 1080;
            /** @type {Array<ChocoWinTileSet>} */ this.tileSets = [ ];
            /** @type {Array<ChocoStudioPreset} */ this.presets = [ ]
            /** @type {Array<ChocoStudioLayout} */ this.layouts = [ ]
            /** @type {Array<ChocoStudioWindow} */ this.windows = [ ]
            /** @type {Array<ChocoStudioVariable} */ this.variables = [ ]
        }
        else {
            this.workspaceName = arg1.workspaceName;
            this.id = arg1.id;
            this.width = arg1.width;
            this.height = arg1.height;
            this.tileSets = arg1.tileSets.map((ts) => new ChocoWinTileSet(ts));
            this.presets = arg1.presets.map((wp) => new ChocoStudioPreset(wp));
            this.layouts = arg1.layouts.map((wp) => new ChocoStudioLayout(wp));
            this.windows = arg1.windows.map((w) => new ChocoStudioWindow(w));
            this.variables = arg1.variables.map((v) => new ChocoStudioVariable(v));
        }
    }
}

export { ChocoStudioWorkspace, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioLayout, ChocoStudioVariable };