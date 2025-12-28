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
            this.name = "";
            this.id = String(crypto.randomUUID());
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
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
            this.name = "";
            this.id = String(crypto.randomUUID());
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
            this.name = "";
            this.id = String(crypto.randomUUID());
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
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
            this.workspaceName = "";
            this.id = String(crypto.randomUUID());
            /** @type {Array<ChocoWinTileSet>} */ this.tileSets = [ ];
            /** @type {Array<ChocoPreset} */ this.presets = [ ]
            /** @type {Array<ChocoStudioLayout} */ this.layouts = [ ]
            /** @type {Array<ChocoStudioWindow} */ this.windows = [ ]
            /** @type {Array<ChocoStudioVariable} */ this.variables = [ ]
        }
        else {
            this.workspaceName = arg1.workspaceName;
            this.id = arg1.id;
            this.tileSets = arg1.tileSets.map((ts) => new ChocoWinTileSet(ts));
            this.presets = arg1.presets.map((wp) => new ChocoStudioPreset(wp));
            this.layouts = arg1.layouts.map((wp) => new ChocoStudioLayout(wp));
            this.windows = arg1.windows.map((w) => new ChocoStudioWindow(w));
            this.variables = arg1.variables.map((v) => new ChocoStudioVariable(v));
        }
    }
}

export default ChocoStudioWorkspace;