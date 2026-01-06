import { ChocoWinWindow, ChocoWinColor, ChocoWinCoordinates, ChocoWinTileSet, ChocoWinTilesetCorners, ChocoWinTilsetEdges, ChocoWinSettings } from './ChocoWindow.js';

class ChocoStudioTileSheet {
    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioTileSheet} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type {String} */ this.id = crypto.randomUUID();
            /** @type {String} */ this.name = "";
            /** @type {String} */ this.attribution = "";
            /** @type {String} */ this.imageDataUrl = null;
        }
        else {
            this.id = arg1.id;
            this.name = arg1.name;
            this.attribution = arg1.attribution;
            this.imageDataUrl = arg1.imageDataUrl;
        }
    }
}

const CHOCO_WINDOW_REGIONS = Object.freeze({
    TOP_LEFT: "TOP_LEFT",
    TOP: "TOP",
    TOP_RIGHT: "TOP_RIGHT",
    LEFT: "LEFT",
    CENTER: "CENTER",
    RIGHT: "RIGHT",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    BOTTOM: "BOTTOM",
    BOTTOM_RIGHT: "BOTTOM_RIGHT"
});

class ChocoStudioWindowRegionDefinition {
    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioWindowRegionDefinition} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type {Number} */ this.width = 1;
            /** @type {Number} */ this.height = 1;
            /** @type {{ x: Number, y: Number }[][]} */ this.tileSheetPositions = [[{ x: null, y: null }]]
        }
        else {
            this.width = arg1.width;
            this.height = arg1.height;
            this.tileSheetPositions = arg1.tileSheetPositions.map((col) =>
                // pos could be null if passed in from a not-yet-assignd value in the GUI.
                // ?? will coalesce undefined but not zero. JavaScript is weird.
                col.map((pos) => ({ x: pos?.x ?? null, y: pos?.y ?? null }))
            )
        }
    }
}

class ChocoStudioTileSetDefinition {
    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioTileSetDefinition} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            /** @type {String} */ this.id = crypto.randomUUID();
            /** @type {String} */ this.name = "";
            /** @type {String} */ this.tileSheetId = "";
            /** @type {Number} */ this.tileSize = 8; // A reasonable guess!
            /** @type {Object.<String, ChocoStudioWindowRegionDefinition>} */ this.regions = {}

            this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.TOP] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.LEFT] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.CENTER] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.RIGHT] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM] = new ChocoStudioWindowRegionDefinition();
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT] = new ChocoStudioWindowRegionDefinition();
        }
        else {
            this.id = arg1.id;
            this.name = arg1.name;
            this.tileSheetId = arg1.tileSheetId;
            this.tileSize = arg1.tileSize;

            /** @type {Object.<String, ChocoStudioWindowRegionDefinition>} */ this.regions = {}
            this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.TOP] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP]);
            this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT]);
            this.regions[CHOCO_WINDOW_REGIONS.LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.CENTER] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.CENTER]);
            this.regions[CHOCO_WINDOW_REGIONS.RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.RIGHT]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT]);
        }
    }

    toChocoWinTileSet(sourceFileUrl) {
        return new ChocoWinTileSet({
            "id": "00000000-0000-0000-0000-000000000000",
            "name": "Preview",
            "sourceFileUrl": sourceFileUrl,
            "tileSize": this.tileSize,
            "corners": {
                "TL": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].tileSheetPositions[0][0].x,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].tileSheetPositions[0][0].y
                },
                "TR": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].tileSheetPositions[0][0].x,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].tileSheetPositions[0][0].y
                },
                "BL": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].tileSheetPositions[0][0].x,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].tileSheetPositions[0][0].y
                },
                "BR": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].tileSheetPositions[0][0].x,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].tileSheetPositions[0][0].y
                }
            },
            "edges": {
                "T": this.regions[CHOCO_WINDOW_REGIONS.TOP].tileSheetPositions.map((col) => ({ "x": col[0].x, "y": col[0].y })),
                "B": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].tileSheetPositions.map((col) => ({ "x": col[0].x, "y": col[0].y })),
                "L": this.regions[CHOCO_WINDOW_REGIONS.LEFT].tileSheetPositions[0].map((row) => ({ "x": row.x, "y": row.y })),
                "R": this.regions[CHOCO_WINDOW_REGIONS.RIGHT].tileSheetPositions[0].map((row) => ({ "x": row.x, "y": row.y })),
            },
            "patternRows": this.regions[CHOCO_WINDOW_REGIONS.CENTER].tileSheetPositions.map((row) =>
                row.map((col) => ({ x: col.x, y: col.y }))
            ),
            "substitutableColors": [
            ]
        });
    }
}

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
            /** @type {String} */ this.tileSetDefinitionId = null;
            /** @type {Number} */ this.tileScale = 1;
            /** @type {Array<ChocoWinColor} */ this.substituteColors = [];
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
            this.tileSetDefinitionId = arg1.tileSetDefinitionId
            this.tileScale = arg1.tileScale
            this.substituteColors = arg1.substituteColors.map((c) => new ChocoWinColor(c));
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
            /** @type { Array<String>} */ this.windowIds = [];
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
            this.windowIds = (arg1.windowIds || []).slice();
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
            this.presetId = null;
            this.x = 40;
            this.y = 30;
            this.h = 480;
            this.w = 640;
            this.singularPreset = null;
        }
        else {
            /** @type { String } */ this.name = arg1.name;
            /** @type { String } */ this.id = arg1.id;
            /** @type { String } */ this.presetId = arg1.presetId;
            /** @type { Number } */ this.x = arg1.x;
            /** @type { Number } */ this.y = arg1.y;
            /** @type { Number } */ this.w = arg1.w;
            /** @type { Number } */ this.h = arg1.h;
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
            /** @type {Array<ChocoStudioTileSheet>} */ this.tileSheets = [];
            /** @type {Array<ChocoStudioTileSetDefinition>} */ this.tileSetDefinitions = [];
            /** @type {Array<ChocoWinTileSet>} */ this.tileSets = [];
            /** @type {Array<ChocoStudioPreset} */ this.presets = [];
            /** @type {Array<ChocoStudioLayout} */ this.layouts = [];
            /** @type {Array<ChocoStudioWindow} */ this.windows = [];
            /** @type {Array<ChocoStudioVariable} */ this.variables = [];
        }
        else {
            this.workspaceName = arg1.workspaceName;
            this.id = arg1.id;
            this.width = arg1.width;
            this.height = arg1.height;
            this.tileSheets = arg1.tileSheets.map((ts => new ChocoStudioTileSheet(ts)));
            this.tileSetDefinitions = arg1.tileSetDefinitions.map((tsd) => new ChocoStudioTileSetDefinition(tsd));
            this.tileSets = arg1.tileSets.map((ts) => new ChocoWinTileSet(ts));
            this.presets = arg1.presets.map((wp) => new ChocoStudioPreset(wp));
            this.layouts = arg1.layouts.map((wp) => new ChocoStudioLayout(wp));
            this.windows = arg1.windows.map((w) => new ChocoStudioWindow(w));
            this.variables = arg1.variables.map((v) => new ChocoStudioVariable(v));
        }
    }
}

export { ChocoStudioWorkspace, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioLayout, ChocoStudioVariable, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, CHOCO_WINDOW_REGIONS, ChocoStudioWindowRegionDefinition as ChocoStudioWindowRegionSize };