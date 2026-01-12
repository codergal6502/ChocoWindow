import { faLandMineOn } from '@fortawesome/free-solid-svg-icons';
import { ChocoWinColor, ChocoWinSettings, ChocoWinTileSet } from './ChocoWindow.js';

/**
 * Provides 
 */
class ChocoStudioTileSheetBlobUrlManager {
    /** @type {Map<String, String} */ #map;
    constructor() {
        this.#map = new Map();
    }

    /**
     * @param {String} tileSheetId 
     * @returns 
     */
    has(tileSheetId) {
        return this.#map.has(String(tileSheetId));
    }

    /**
     * @param {String} tileSheetId 
     * @returns {String} The blob URL for the PNG referenced by the tile sheet or null if it hasn't been set.
     */
    get(tileSheetId) {
        return this.#map.get(String(tileSheetId)) ?? null;
    }

    /**
     * @param {String} tileSheetId 
     * @param {Blob} blob 
     */
    setBlob(tileSheetId, blob) {
        const newBlobUrl = URL.createObjectURL(blob);
        this.#map.set(tileSheetId, newBlobUrl);
    }

    /**
     * @param {String} tileSheetId 
     * @param {String} dataUrl 
     */
    setDataUrl(tileSheetId, dataUrl) {
        const oldBlobUrl = this.get(tileSheetId);
        if (oldBlobUrl) {
            URL.revokeObjectURL(oldBlobUrl);
        }

        const blob = ChocoStudioTileSheetBlobUrlManager.#pngBase64DataUrlToBlob(dataUrl);
        const newBlobUrl = URL.createObjectURL(blob);
        this.#map.set(tileSheetId, newBlobUrl);
    }

    /**
     * @param {String} dataUrl 
     * @returns {Blob}
     */
    static #pngBase64DataUrlToBlob(dataUrl) {
        // This is permissive of weird URLs, but this application isn't a spaceship so good enough is good enough!
        // Example: data:image/png;base64,iVBORw0KGg
        const [protocol, mimeType, encoding, dataUrlEncodedBase64] = dataUrl.split(/[:,;]/);
        if (!dataUrlEncodedBase64 || encoding != "base64" || mimeType != "image/png" || protocol != "data") {
            console.warn(`Got unexpected data url (truncated): ${dataUrlEncodedBase64?.substring(0, 30)}:`);
            return null;
        }

        // See https://stackoverflow.com/a/16245768/1102726
        const sliceSize = 512;
        const byteCharacters = atob(dataUrlEncodedBase64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: "image/png;base64" });
        return blob;
    }
}

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
                !col ? null : col.map((pos) => ({ x: pos?.x ?? null, y: pos?.y ?? null }))
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
            // todo: replace this with a map at some point
            /** @type {Object<string, ChocoStudioWindowRegionDefinition>} */ this.regions = {}
            /** @type {Array.<ChocoWinColor> } */ this.defaultColors = []

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

            this.regions = {};
            this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.TOP] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP]);
            this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT]);
            this.regions[CHOCO_WINDOW_REGIONS.LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.CENTER] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.CENTER]);
            this.regions[CHOCO_WINDOW_REGIONS.RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.RIGHT]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM]);
            this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT] = new ChocoStudioWindowRegionDefinition(arg1.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT]);

            this.defaultColors = arg1?.defaultColors?.map((c) => new ChocoWinColor(c));
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
                "T": this.regions[CHOCO_WINDOW_REGIONS.TOP].tileSheetPositions[0].filter(
                    (_, colIdx) => colIdx < this.regions[CHOCO_WINDOW_REGIONS.TOP].width
                ).map(
                    column => !column ? { x: 0, y: 0 } : { "x": column.x, "y": column.y }
                ),
                "B": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].tileSheetPositions[0].filter(
                    (_, colIdx) => colIdx < this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].width
                ).map(
                    column => !column ? { x: 0, y: 0 } : ({ "x": column.x, "y": column.y })
                ),
                "L": this.regions[CHOCO_WINDOW_REGIONS.LEFT].tileSheetPositions.filter(
                    (_, rn) => rn < this.regions[CHOCO_WINDOW_REGIONS.LEFT].height
                ).map(
                    row => !row ? { x: 0, y: 0 } : ({ "x": row[0].x, "y": row[0].y })
                ),
                "R": this.regions[CHOCO_WINDOW_REGIONS.RIGHT].tileSheetPositions.filter(
                    (_, rn) => rn < this.regions[CHOCO_WINDOW_REGIONS.RIGHT].height
                ).map(
                    row => !row ? { x: 0, y: 0 } : ({ "x": row[0].x, "y": row[0].y })
                ),
            },
            "patternRows":
                new Array(Number(this.regions[CHOCO_WINDOW_REGIONS.CENTER].width)).fill().map((_, rowIdx) =>
                    this.regions[CHOCO_WINDOW_REGIONS.CENTER].tileSheetPositions[rowIdx] ?
                        new Array(Number(this.regions[CHOCO_WINDOW_REGIONS.CENTER].height)).fill().map((_, colIdx) =>
                            this.regions[CHOCO_WINDOW_REGIONS.CENTER].tileSheetPositions[rowIdx][colIdx] ?? { x: 0, y: 0 }
                        ) :
                        new Array(Number(this.regions[CHOCO_WINDOW_REGIONS.CENTER].height)).fill().map(() => ({ x: 0, y: 0 }))
                ),
            "substitutableColors": this.defaultColors?.map((c) => new ChocoWinColor(c)) ?? []
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
            this.substituteColors = arg1?.substituteColors?.map((c) => c ? new ChocoWinColor(c) : null) || [];
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
        this.version = ChocoWinSettings.CURRENT_VERSION;
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
            this.tileSheets = arg1.tileSheets.map((ts) => new ChocoStudioTileSheet(ts));
            this.tileSetDefinitions = arg1.tileSetDefinitions.map((tsd) => new ChocoStudioTileSetDefinition(tsd));
            this.tileSets = arg1.tileSets.map((ts) => new ChocoWinTileSet(ts));
            this.presets = arg1.presets.map((p) => new ChocoStudioPreset(p));
            this.layouts = arg1.layouts.map((l) => new ChocoStudioLayout(l));
            this.windows = arg1.windows.map((w) => new ChocoStudioWindow(w));
            this.variables = arg1.variables.map((v) => new ChocoStudioVariable(v));
        }
    }
}

export { ChocoStudioWorkspace, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioLayout, ChocoStudioVariable, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, CHOCO_WINDOW_REGIONS, ChocoStudioWindowRegionDefinition, ChocoStudioTileSheetBlobUrlManager };