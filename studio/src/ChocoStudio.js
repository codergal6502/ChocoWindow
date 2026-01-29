import { ChocoWinAbstractPixelReaderFactory, ChocoWinColor, ChocoWinCoordinates, ChocoWinSettings, ChocoWinTileSet, pngBase64DataUrlToBlob, TileTransformationTypes } from './ChocoWindow.js';

/**
 * Provides 
 */
class ChocoStudioTileSheetBlobUrlManager {
    /** @typedef {{url: String, width: number, height: number, blob: Blob}} TileSheetData */

    /** @type {Map<String, TileSheetData>} */ #map;
    /** @type {ChocoWinAbstractPixelReaderFactory} */ #readerFactory;

    /**
     * 
     * @param {ChocoWinAbstractPixelReaderFactory} readerFactory 
     */
    constructor(readerFactory) {
        this.#map = new Map();
        this.#readerFactory = readerFactory;
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
     * @returns {TileSheetData} The blob URL for the PNG referenced by the tile sheet or null if it hasn't been set.
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

        /** @type {TileSheetData} */
        const newObject = {
            url: newBlobUrl,
            width: null,
            height: null,
            blob: blob,
        }
        this.#map.set(tileSheetId, newObject);

        return this.#readerFactory.
            build({ blob: blob }).
            isReady().
            then(r => {
                newObject.width = r.width;
                newObject.height = r.height;
                return newObject;
            });
    }

    /**
     * @param {String} tileSheetId 
     * @param {String} dataUrl 
     */
    setDataUrl(tileSheetId, dataUrl) {
        const oldData = this.get(tileSheetId);
        if (oldData?.url) {
            URL.revokeObjectURL(oldData?.url);
        }

        const blob = pngBase64DataUrlToBlob(dataUrl);
        return this.setBlob(tileSheetId, blob);
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

class ChocoStudioWindowRegionTileAssignment {
    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioWindowRegionTileAssignment} arg1 
     */
    constructor(arg1) {
        if (!arg1) {
            this.id = crypto.randomUUID();
            this.xSheetCoordinate = 0;
            this.ySheetCoordinate = 0;
            this.geometricTransformation = TileTransformationTypes.BASE;
            /** @type {ChocoWinCoordinates[]} */ this.transparencyOverrides = [];
        }
        else {
            this.id = arg1.id;
            this.xSheetCoordinate = arg1.xSheetCoordinate;
            this.ySheetCoordinate = arg1.ySheetCoordinate;
            this.geometricTransformation = arg1.geometricTransformation;
            this.transparencyOverrides = arg1?.transparencyOverrides?.map(c => ({ x: c.x, y: c.y }));
        }
    }
}

class ChocoStudioWindowRegionDefinition {
    /** @type {number} */ #colCount;
    /** @type {number} */ #rowCount;

    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for loading JSON.
     * @param {ChocoStudioWindowRegionDefinition} arg1 
     */
    constructor(arg1) {
        if (arg1) {
            this.id = arg1.id
            this.#colCount = Number(arg1.colCount);
            this.#rowCount = Number(arg1.rowCount);
            this.internalArray = arg1.internalArray.map(row => row.map(a => new ChocoStudioWindowRegionTileAssignment(a)))
            this.#resizeArray();
        }
        else {
            this.id = crypto.randomUUID();
            this.#colCount = 1;
            this.#rowCount = 1;
            this.internalArray = [[new ChocoStudioWindowRegionTileAssignment()]];
        }
    }

    /** @param {number} w */
    set colCount(w) {
        this.#colCount = w;
        this.#resizeArray();
    }

    get colCount() { return this.#colCount; }

    /** @param {number} h */
    set rowCount(h) {
        this.#rowCount = h;
        this.#resizeArray();
    }

    get rowCount() { return this.#rowCount; }

    #resizeArray() {
        this.internalArray.splice(this.#rowCount);
        while (this.internalArray.length < this.#rowCount) {
            this.internalArray[this.internalArray.length] = [];
        }

        this.internalArray.forEach(row => {
            row.splice(this.#colCount);
            while (row.length < this.#colCount) {
                row[row.length] = null;
            }
        })
    }

    /**
     * @param {number} rowIndex 
     * @param {number} colIndex 
     * @param {ChocoStudioWindowRegionTileAssignment} assigment 
     */
    set(rowIndex, colIndex, assigment) {
        if (0 <= rowIndex && rowIndex < this.#rowCount) {
            if (0 <= colIndex && colIndex < this.#colCount) {
                this.internalArray[rowIndex][colIndex] = new ChocoStudioWindowRegionTileAssignment(assigment);
            }
        }
    }

    /**
     * @param {number} rowIndex 
     * @param {number} colIndex 
     * @returns {ChocoStudioWindowRegionTileAssignment}
     */
    get(rowIndex, colIndex) {
        return this.internalArray?.[rowIndex]?.[colIndex];
    }

    /**
     * @param {number} rowIndex 
     */
    getRow(rowIndex) {
        return this.internalArray[rowIndex].slice();
    }

    /**
     * @param {number} colIndex 
     */
    getColumn(colIndex) {
        return this.internalArray.map(row => row[colIndex]);
    }

    toJSON() {
        // See https://stackoverflow.com/a/42107611/1102726
        return {
            rowCount: this.#rowCount,
            colCount: this.#colCount,
            internalArray: this.internalArray
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
                    "x": this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].get(0, 0).xSheetCoordinate,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].get(0, 0).ySheetCoordinate,
                    "t": this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].get(0, 0).geometricTransformation,
                },
                "TR": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].get(0, 0).xSheetCoordinate,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].get(0, 0).ySheetCoordinate,
                    "t": this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].get(0, 0).geometricTransformation,
                },
                "BL": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].get(0, 0).xSheetCoordinate,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].get(0, 0).ySheetCoordinate,
                    "t": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].get(0, 0).geometricTransformation,
                },
                "BR": {
                    "x": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].get(0, 0).xSheetCoordinate,
                    "y": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].get(0, 0).ySheetCoordinate,
                    "t": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].get(0, 0).geometricTransformation
                }
            },
            "edges": {
                "T": this.regions[CHOCO_WINDOW_REGIONS.TOP].getRow(0).map(
                    a => !a ? { x: 0, y: 0, "t": null } : { "x": a.xSheetCoordinate, "y": a.ySheetCoordinate, t: a.geometricTransformation }
                ),
                "B": this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].getRow(0).map(
                    a => !a ? { x: 0, y: 0, "t": null } : { "x": a.xSheetCoordinate, "y": a.ySheetCoordinate, t: a.geometricTransformation }
                ),
                "L": this.regions[CHOCO_WINDOW_REGIONS.LEFT].getColumn(0).map(
                    a => !a ? { x: 0, y: 0, "t": null } : { "x": a.xSheetCoordinate, "y": a.ySheetCoordinate, t: a.geometricTransformation }
                ),
                "R": this.regions[CHOCO_WINDOW_REGIONS.RIGHT].getColumn(0).map(
                    a => !a ? { x: 0, y: 0, "t": null } : { "x": a.xSheetCoordinate, "y": a.ySheetCoordinate, t: a.geometricTransformation }
                ),
            },
            "centerRows":
                new Array(Number(this.regions[CHOCO_WINDOW_REGIONS.CENTER].rowCount)).fill().map((_, rowIdx) =>
                    new Array(Number(this.regions[CHOCO_WINDOW_REGIONS.CENTER].colCount)).fill().map((_, colIdx) => {
                        const assignment = this.regions[CHOCO_WINDOW_REGIONS.CENTER].get(rowIdx, colIdx);
                        return { x: assignment?.xSheetCoordinate ?? 0, y: assignment?.ySheetCoordinate ?? 0, t: assignment?.geometricTransformation ?? TileTransformationTypes.BASE }
                    }
                    )
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
            this.tileScale = Number(arg1.tileScale)
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
            /** @type { Number } */ this.x = Number(arg1.x);
            /** @type { Number } */ this.y = Number(arg1.y);
            /** @type { Number } */ this.w = Number(arg1.w);
            /** @type { Number } */ this.h = Number(arg1.h);
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
            this.width = Number(arg1.width);
            this.height = Number(arg1.height);
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



export { ChocoStudioWorkspace, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioLayout, ChocoStudioVariable, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, CHOCO_WINDOW_REGIONS, ChocoStudioWindowRegionDefinition, ChocoStudioTileSheetBlobUrlManager, ChocoStudioWindowRegionTileAssignment, ChocoStudioWindowRegionDefinition as ChocoStudioWindowRegionTileAssignmentArray };