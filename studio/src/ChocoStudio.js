import { ChocoWinAbstractPixelReaderFactory, ChocoColor, ChocoCoordinates, ChocoWinSettings, ChocoWinTileDrawData, ChocoWinTileSet, pngBase64DataUrlToBlob, TileTransformationTypes, ChocoSideTuple } from './ChocoWindow.js';

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

    /**
     * @param {String} tileSheetId
     * @param {ChocoStudioTileSheet[]} tileSheets
     */
    ensureTileSheetBlob(tileSheetId, tileSheets) {
        let tileSheetData = this.get(tileSheetId);

        if (!tileSheetData) {
            tileSheetData = this.setFromTileSheetIdAndArray(tileSheetId, tileSheets);
        }

        return tileSheetData;
    }

    /**
     * @param {String} tileSheetId
     * @param {ChocoStudioTileSheet[]} tileSheets
     */
    setFromTileSheetIdAndArray(tileSheetId, tileSheets) {
        const tileSheet = tileSheets.find(ts => ts.id == tileSheetId);
        if (!tileSheet) {
            return null;
        }
        return this.setFromTileSheet(tileSheet);
    }

    /**
     * @param {ChocoStudioTileSheet} tileSheet
     */
    setFromTileSheet(tileSheet) {
        this.setDataUrl(tileSheet.id, tileSheet.imageDataUrl);

        return this.get(tileSheet.id);
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
            /** @type {ChocoCoordinates[]} */ this.transparencyOverrides = [];
        }
        else {
            this.id = arg1.id;
            this.xSheetCoordinate = arg1.xSheetCoordinate;
            this.ySheetCoordinate = arg1.ySheetCoordinate;
            this.geometricTransformation = arg1.geometricTransformation;
            this.transparencyOverrides = arg1?.transparencyOverrides?.map(c => ({ x: c.x, y: c.y }));
        }
    }

    toChocoWinTileDrawData() {
        return new ChocoWinTileDrawData({
            x: this.xSheetCoordinate ?? 0,
            y: this.ySheetCoordinate ?? 0,
            t: this.geometricTransformation ?? TileTransformationTypes.BASE,
            a: this.transparencyOverrides?.map(c => c ? new ChocoCoordinates(c) : null)
        });
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
            this.internalArray = arg1.internalArray.map(row => row.map(a => a ? new ChocoStudioWindowRegionTileAssignment(a) : a))
            this.margin = arg1.margin ? new ChocoSideTuple(arg1.margin) : null;
            this.#resizeArray();
        }
        else {
            this.id = crypto.randomUUID();
            this.#colCount = 1;
            this.#rowCount = 1;
            this.internalArray = [[new ChocoStudioWindowRegionTileAssignment()]];
            this.margin = new ChocoSideTuple({top: 0, left: 0, right: 0, height: 0});
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
                this.internalArray[rowIndex][colIndex] = assigment ? new ChocoStudioWindowRegionTileAssignment(assigment) : null;
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

    toChocoWinTileSetRegionTileArray() {
        return (
            new Array(Number(this.#rowCount)).fill().map((_, rowIdx) =>
                new Array(Number(this.#colCount)).fill().map((_, colIdx) => {
                    const assignment = this.get(rowIdx, colIdx);
                    if (assignment) {
                        return {
                            x: assignment?.xSheetCoordinate ?? 0,
                            y: assignment?.ySheetCoordinate ?? 0,
                            t: assignment?.geometricTransformation ?? TileTransformationTypes.BASE,
                            a: assignment?.transparencyOverrides?.map(c => c ? new ChocoCoordinates(c) : null)
                        }
                    }
                    else {
                        return null;
                    }
                })
            )
        );
    }
}

const CHOCO_REGION_GRANULARITY = Object.freeze({
    SINGLE_TILE_EDGES: "SINGLE_TILE_EDGES",
    BASIC_EDGES: "BASIC_EDGES",
    ARBITRARY_EDGES: "ARBITRARY_EDGES",
});

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
            /** @type { String } */ this.granularity = CHOCO_REGION_GRANULARITY.SINGLE_TILE_EDGES;

            // todo: replace this with a map at some point
            /** @type {Object<string, ChocoStudioWindowRegionDefinition>} */ this.regions = {}
            /** @type {Array.<ChocoColor> } */ this.defaultColors = []

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
            this.granularity = arg1.granularity;

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

            this.defaultColors = arg1?.defaultColors?.map((c) => new ChocoColor(c));
        }
    }

    toChocoWinTileSet(sourceFileUrl) {
        return new ChocoWinTileSet({
            "id": "00000000-0000-0000-0000-000000000000",
            "name": "Preview",
            "sourceFileUrl": sourceFileUrl,
            "tileSize": this.tileSize,
            "regions": [
                { priority: 1, bufferLeft: 0, bufferTop: 0, tiles: this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].toChocoWinTileSetRegionTileArray() },
                { priority: 1, bufferRight: 0, bufferTop: 0, tiles: this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].toChocoWinTileSetRegionTileArray() },
                { priority: 1, bufferLeft: 0, bufferBottom: 0, tiles: this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].toChocoWinTileSetRegionTileArray() },
                { priority: 1, bufferRight: 0, bufferBottom: 0, tiles: this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].toChocoWinTileSetRegionTileArray() },

                {
                    priority: 2,
                    bufferTop: 0,
                    bufferLeft:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].colCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.TOP].margin?.left ?? this.tileSize :
                                this.tileSize,
                    bufferRight:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].colCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.TOP].margin?.right ?? this.tileSize :
                                this.tileSize,
                    tiles: this.regions[CHOCO_WINDOW_REGIONS.TOP].toChocoWinTileSetRegionTileArray()
                },
                {
                    priority: 2,
                    bufferBottom: 0,
                    bufferLeft:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].colCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].margin?.left ?? this.tileSize :
                                this.tileSize,
                    bufferRight:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].colCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].margin?.right ?? this.tileSize :
                                this.tileSize,
                    tiles: this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].toChocoWinTileSetRegionTileArray()
                },
                {
                    priority: 2,
                    bufferLeft: 0,
                    bufferTop:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].rowCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.LEFT].margin?.top ?? this.tileSize :
                                this.tileSize,
                    bufferBottom:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].rowCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.LEFT].margin?.bottom ?? this.tileSize :
                                this.tileSize,
                    tiles: this.regions[CHOCO_WINDOW_REGIONS.LEFT].toChocoWinTileSetRegionTileArray()
                },
                {
                    priority: 2,
                    bufferRight: 0,
                    bufferTop:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].rowCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.RIGHT].margin?.top ?? this.tileSize :
                                this.tileSize,
                    bufferBottom:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].rowCount * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.regions[CHOCO_WINDOW_REGIONS.RIGHT].margin?.bottom ?? this.tileSize :
                                this.tileSize,
                    tiles: this.regions[CHOCO_WINDOW_REGIONS.RIGHT].toChocoWinTileSetRegionTileArray()
                },

                {
                    priority: 3,
                    bufferLeft:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? Math.min(this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].colCount, this.regions[CHOCO_WINDOW_REGIONS.LEFT].colCount, this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].colCount) * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.tileSize :
                                this.tileSize,
                    bufferTop:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? Math.min(this.regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].rowCount, this.regions[CHOCO_WINDOW_REGIONS.TOP].rowCount, this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].rowCount) * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.tileSize :
                                this.tileSize,
                    bufferRight:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? Math.min(this.regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].colCount, this.regions[CHOCO_WINDOW_REGIONS.RIGHT].colCount, this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].colCount) * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.tileSize :
                                this.tileSize,
                    bufferBottom:
                        this.granularity == CHOCO_REGION_GRANULARITY.BASIC_EDGES ? Math.min(this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].rowCount, this.regions[CHOCO_WINDOW_REGIONS.BOTTOM].rowCount, this.regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].rowCount) * this.tileSize :
                            this.granularity == CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES ? this.tileSize :
                                this.tileSize,
                    tiles: this.regions[CHOCO_WINDOW_REGIONS.CENTER].toChocoWinTileSetRegionTileArray()
                },
            ],
            "substitutableColors": this.defaultColors?.map((c) => new ChocoColor(c)) ?? []
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
            /** @type {Array<ChocoColor} */ this.substituteColors = [];
        }
        else {
            this.name = arg1.name;
            this.id = arg1.id;
            this.tileSetDefinitionId = arg1.tileSetDefinitionId
            this.tileScale = Number(arg1.tileScale)
            this.substituteColors = arg1?.substituteColors?.map((c) => c ? new ChocoColor(c) : null) || [];
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
            this.backgroundColor = null;
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
            /** @type { ChocoColor } */ this.backgroundColor = arg1.backgroundColor ? new ChocoColor(arg1.backgroundColor) : null;
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
            // this.tileSets = arg1.tileSets.map((ts) => new ChocoWinTileSet(ts));
            this.presets = arg1.presets.map((p) => new ChocoStudioPreset(p));
            this.layouts = arg1.layouts.map((l) => new ChocoStudioLayout(l));
            this.windows = arg1.windows.map((w) => new ChocoStudioWindow(w));
            this.variables = arg1.variables.map((v) => new ChocoStudioVariable(v));
        }
    }
}



export { ChocoStudioWorkspace, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioLayout, ChocoStudioVariable, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, CHOCO_WINDOW_REGIONS, CHOCO_REGION_GRANULARITY, ChocoStudioWindowRegionDefinition, ChocoStudioTileSheetBlobUrlManager, ChocoStudioWindowRegionTileAssignment };