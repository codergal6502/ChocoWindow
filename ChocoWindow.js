const isNumber = (foo) => typeof 0 == typeof foo;

export class ChocoWinSettings {
    static ignoreScaleMisalignmentErrors = false;
    static suggestedMaximumTileSheetColorCount = 8;
    static get CURRENT_VERSION() { return ("1.2.0") };
}

export class ChocoCoordinates {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoCoordinates} arg1
     */
    constructor(arg1) {
        if (arg1 && !isNaN(arg1.x) && !isNaN(arg1.y)) {
            this.x = arg1.x;
            this.y = arg1.y;
        }
        else {
            /** @type {Number} */ this.x = 0;
            /** @type {Number} */ this.y = 0;
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoRectangle {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoRectangle} arg1
     */
    constructor(arg1) {
        if (arg1 && !isNaN(arg1.x) && !isNaN(arg1.y) && !isNaN(arg1.width) && !isNaN(arg1.height)) {
            this.x = arg1.x;
            this.y = arg1.y;
            this.width = arg1.width;
            this.height = arg1.height;
        }
        else {
            /** @type {number} */ this.x = 0;
            /** @type {number} */ this.y = 0;
            /** @type {number} */ this.width = 0;
            /** @type {number} */ this.height = 0;
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoSideTuple {
    /**
     * 
     */
    /**
     * @param {ChocoSideTuple} arg1 
     */
    constructor(arg1) {
        // null is preferred to undefined
        this.top = arg1?.top ?? null;
        this.bottom = arg1?.bottom ?? null;
        this.left = arg1?.left ?? null;
        this.right = arg1?.right ?? null;
    }
}

export class ChocoColor {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoColor} arg1
     */
    constructor(arg1) {
        if (typeof (arg1) == 'string') {
            const regex = /^#[0-9A-Fa-f]{6}/;

            if (!regex.test(arg1)) {
                /** @type {number} */ this.r = 0;
                /** @type {number} */ this.g = 0;
                /** @type {number} */ this.b = 0;
                /** @type {number} */ this.a = 255;
            }
            else {
                arg1 = arg1.replace(/^#/, '');

                this.r = parseInt(arg1.slice(0, 2), 16);
                this.g = parseInt(arg1.slice(2, 4), 16);
                this.b = parseInt(arg1.slice(4, 6), 16);
                this.a = 255;
            }
        }
        else if (arg1 && !isNaN(arg1.r) && !isNaN(arg1.g) && !isNaN(arg1.b)) {
            this.r = arg1.r;
            this.g = arg1.g;
            this.b = arg1.b;
            this.a = isNaN(arg1.a) ? 255 : arg1.a;
        }
        else {
            /** @type {number} */ this.r = 0;
            /** @type {number} */ this.g = 0;
            /** @type {number} */ this.b = 0;
            /** @type {number} */ this.a = 255;
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }

    toHexString() { return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`; }
    toRgba() { return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255.0})`; }
}

export class ChocoWinTileDrawData {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoCoordinates} arg1
     */
    constructor(arg1) {
        if (arg1) {
            this.x = arg1.x;
            this.y = arg1.y;
            this.t = arg1.t;
            this.a = arg1.a?.map(c1 => new ChocoCoordinates(c1));
        }
        else {
            /** @type {Number} */ this.x = 0;
            /** @type {Number} */ this.y = 0;
            /** @type {TileTransformationTypes} */ this.t = TileTransformationTypes.BASE;
            /** @type {ChocoCoordinates[]} */ this.a = [];
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinTilesetCorners {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinTilesetCorners} arg1
     */
    constructor(arg1) {
        if (arg1 && arg1.TL && arg1.TR && arg1.BL && arg1.BR) {
            this.TL = new ChocoWinTileDrawData(arg1.TL);
            this.TR = new ChocoWinTileDrawData(arg1.TR);
            this.BL = new ChocoWinTileDrawData(arg1.BL);
            this.BR = new ChocoWinTileDrawData(arg1.BR);
        }
        else {
            /** @type {ChocoWinTileDrawData} - The top-left corner tile coordinates. */     this.TL = { x: 0, y: 0 };
            /** @type {ChocoWinTileDrawData} - The top-right corner tile coordinates. */    this.TR = { x: 0, y: 0 };
            /** @type {ChocoWinTileDrawData} - The bottom-left corner tile coordinates. */  this.BL = { x: 0, y: 0 };
            /** @type {ChocoWinTileDrawData} - The bottom-right corner tile coordinates. */ this.BR = { x: 0, y: 0 };
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinOptionEdges {
    /**
     * Default consturctor.
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinOptionEdges} arg1
     */
    constructor(arg1) {
        if (arg1 && arg1.T && arg1.B && arg1.L && arg1.R) {
            this.T = arg1.T.map((c) => new ChocoWinTileDrawData(c));
            this.B = arg1.B.map((c) => new ChocoWinTileDrawData(c));
            this.L = arg1.L.map((c) => new ChocoWinTileDrawData(c));
            this.R = arg1.R.map((c) => new ChocoWinTileDrawData(c));
        }
        else {
            /** @type {Array<ChocoWinTileDrawData>} The top edge tile coordinate pairs. */   this.T = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinTileDrawData>} The bottom edge tile coordinate paors */ this.B = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinTileDrawData>} The left edge tile coordinate paors. */  this.L = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinTileDrawData>} The right edge tile coordinate pairs. */ this.R = [{ x: 0, y: 0 }];
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinRegion {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinRegion} arg1
     */
    constructor(arg1) {

    }
}

export class ChocoWinTileSetRegion {
    /** @type {String} */ id;
    /** @type {number} */ priority;
    /** @type {number} */ bufferLeft;
    /** @type {number} */ bufferRight;
    /** @type {number} */ bufferTop;
    /** @type {number} */ bufferBottom;
    /** @type {ChocoWinTileDrawData[][]} */ tiles; // todo: move directly to here

    /**
     * Default constructor
     */
    /**
     * Copy constructor; useful for JSON objects.
     * @param {ChocoWinTileSetRegion} arg1
     */
    constructor(arg1) {
        if (arg1) {
            this.priority = arg1.priority;
            this.bufferLeft = arg1.bufferLeft;
            this.bufferRight = arg1.bufferRight;
            this.bufferTop = arg1.bufferTop;
            this.bufferBottom = arg1.bufferBottom;
            this.tiles = arg1.tiles.map(row => row.map(tile => tile ? new ChocoWinTileDrawData(tile) : null));
        }
        else {
            this.priority = 1;
            this.bufferLeft = 0;
            this.bufferRight = 0;
            this.bufferTop = 0;
            this.bufferBottom = 0;
            this.tiles = [[]]
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinTileSet {
    /** @type {String} */ sourceFileUrl;
    /** @type {String} */ name;
    /** @type {Number} */ tileSize;
    /** @type {ChocoWinTileSetRegion[]} */ regions;
    /** @type {ChocoColor[]} */ substitutableColors;

    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinTileSet} arg1
     */
    constructor(arg1) {
        if (arg1) {
            this.id = arg1.id || null; // might be null in original
            this.name = arg1.name || null; // might be null in original
            this.sourceFileUrl = String(arg1.sourceFileUrl);
            this.tileSize = Number(arg1.tileSize);
            this.regions = arg1.regions.map(r => new ChocoWinTileSetRegion(r));
            if (arg1.substitutableColors) {
                this.substitutableColors = arg1.substitutableColors.map((color) => new ChocoColor(color));
            }
            else {
                this.substitutableColors = null;
            }
        }
        else {
            this.sourceFileUrl = "";
            this.name = "";
            this.tileSize = 0;
            this.regions = [];
            this.substitutableColors = null;
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinWindow {
    /** @type {ChocoWinAbstractPixelReader} */ #tileSheetReader;
    /** @type {ChocoWinTileSet} */ #winTileSet;
    /** @type {Number} */ #tileScale;
    /** @type {Number} */ #x;
    /** @type {Number} */ #y;
    /** @type {Number} */ #w;
    /** @type {Number} */ #h;
    /** @type {ChocoColor} */ #backgroundColor;
    /** @type {ChocoColor[]} */ #colorSubstitutions;

    /**
     * @param {Object} args
     * @param {ChocoWinTileSet} args.winTileSet 
     * @param {Number} args.tileScale 
     * @param {Number} args.x 
     * @param {Number} args.y 
     * @param {Number} args.w 
     * @param {Number} args.h 
     * @param {ChocoWinAbstractPixelReaderFactory} args.readerFactory
     * @param {ChocoColor} args.backgroundColor
     * @param {ChocoColor[]} args.colorSubstitutions
     */
    constructor({ winTileSet, tileScale, x, y, w, h, readerFactory, backgroundColor = null, colorSubstitutions = [] }) {
        this.id = crypto.randomUUID();
        this.#tileSheetReader = readerFactory.build({
            dataUrl: winTileSet.sourceFileUrl,
        });

        this.#winTileSet = winTileSet;
        this.#tileScale = tileScale;
        this.#x = x;
        this.#y = y;
        this.#w = w;
        this.#h = h;
        this.#backgroundColor = backgroundColor;
        this.#colorSubstitutions = colorSubstitutions ?? [];

        if ((true != ChocoWinSettings.ignoreScaleMisalignmentErrors) && ((this.#w % this.#tileScale != 0) || (this.#h % this.#tileScale != 0))) {
            console.warn(`Scale misalignment: one or both window dimensions [${this.#w}, ${this.#h}] are not multiples of tile scale ${tileScale}. Artifacts may occur on the right and bottom edges as a result, especially if the sprite map includes transparency. To ignore this warning, set ChocoWinSettings.ignoreScaleMisalignmentErrors = true`);
        }
    }

    isReady() {
        return new Promise((resolve) => {
            this.#tileSheetReader.isReady().then(read => resolve());
        });
    }

    drawTo(/** @type {ChocoWinAbstractPixelWriter} */ writer) {
        this.#doDrawWindow(writer);
    }

    /**
     * @returns {ChocoWinWindow} The same object, for method chaining.
     */
    substituteColor(/** @type {Number} */ index, /** @type {ChocoColor} */ color) {
        this.#colorSubstitutions[index] = new ChocoColor(color);
        return this;
    }

    hasColorSubstitutions() {
        return Object.keys(this.#colorSubstitutions).length > 0 && this.#colorSubstitutions.some(cs => cs != null);
    }

    #doDrawTile( // reader, writer, this.#w - destSize, dy
        /** @type {ChocoWinAbstractPixelReader} */ reader,
        /** @type {ChocoWinAbstractPixelWriter} */ writer,
        /** @type {Number} */ destX,
        /** @type {Number} */ destY,
        /** @type {Number} */ cutoffX = null,
        /** @type {Number} */ cutoffY = null,
    ) {
        const areColorsExactMatch = (/** @type {ChocoColor} */ color1, /** @type {ChocoColor} */ color2) => {
            return color1.r == color2.r && color1.g == color2.g && color1.b == color2.b && (color1.a ?? 255) == (color2.a ?? 255);
        }

        for (let sourceX = 0; sourceX < reader.width; sourceX++) {
            for (let sourceY = 0; sourceY < reader.width; sourceY++) {
                let pixelColor = reader.getPixel({ x: sourceX, y: sourceY });
                if (pixelColor.a === 0 && this.#backgroundColor) {
                    pixelColor = this.#backgroundColor;
                }
                else if (this.hasColorSubstitutions() && this.#winTileSet.substitutableColors?.length) {
                    for (const keyValuePair of Object.entries(this.#colorSubstitutions)) {
                        /** @type {number} */ const index = keyValuePair[0];
                        /** @type {ChocoColor} */ const newColor = keyValuePair[1];

                        if (!newColor) {
                            continue;
                        }

                        /** @type {ChocoColor} */ const oldColor = this.#winTileSet.substitutableColors[index];

                        if (index < 0) continue;
                        if (index >= this.#winTileSet.substitutableColors.length) continue;

                        if (areColorsExactMatch(oldColor, pixelColor)) {
                            pixelColor = newColor;
                        }
                    }
                }

                for (let offsetX = 0; offsetX < this.#tileScale; offsetX++) {
                    const writerX = destX + sourceX * this.#tileScale + offsetX;
                    if (writerX >= Math.min(cutoffX, writer.width)) {
                        continue;
                    }
                    for (let offsetY = 0; offsetY < this.#tileScale; offsetY++) {
                        const writerY = destY + sourceY * this.#tileScale + offsetY;
                        if (writerY >= Math.min(cutoffY, writer.height)) {
                            continue;
                        }
                        writer.writePixel({ x: writerX, y: writerY }, pixelColor);
                    }
                }
            }
        }

        return;
    }

    // This will be calculated every time a window is instantiated but thankfully
    // it's not an expensive operation.
    // If anybody's tile sheet is more than 2^53 pixels in total, something's wrong.
    // For reference, 1080p is less than 10^21, so that tile sheet would have more
    // pixels than a 1920x1080 matrix of 1080p displays.
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER.
    #sillyMaxWidth = Math.sqrt(Number.MAX_SAFE_INTEGER);

    #doDrawWindow(/** @type {ChocoWinAbstractPixelWriter} */ writer) {
        const wo = this.#winTileSet;
        const tileSize = wo.tileSize;

        if (0 == tileSize) {
            console.error("tile size cannot be zero");
            return;
        }

        const /** @type {Map<String, ChocoWinAbstractPixelReader>} */ cachedTileReaders = new Map();
        const posToCacheKey = ({/** @type { String } */ id, /** @type {Number} */ x, /* @type {Number} */ y }) => {
            return id;
        }
        const getTileReader = (/** @type {ChocoWinTileDrawData} */ drawData) => {
            let reader = cachedTileReaders.get(posToCacheKey(drawData));
            if (!reader) {
                reader = new ChocoWinRegionPixelReader(this.#tileSheetReader, new ChocoRectangle({ x: drawData.x, y: drawData.y, width: tileSize, height: tileSize }));

                switch (drawData.t) {
                    case TileTransformationTypes.BASE: default: {
                        // don't modify reader
                        break;
                    }
                    case TileTransformationTypes.REFLECT_HORIZONTAL: {
                        reader = new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.HORIZONTAL);
                        break;
                    }
                    case TileTransformationTypes.REFLECT_VERTICAL: {
                        reader = new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.VERTICAL);
                        break;
                    }
                    case TileTransformationTypes.REFLECT_ASCENDING: {
                        reader = new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.ASCENDING);
                        break;
                    }
                    case TileTransformationTypes.REFLECT_DESCENDING: {
                        reader = new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.DESCENDING);
                        break;
                    }
                    case TileTransformationTypes.ROTATE_90: {
                        reader = new ChocoWinRotatePixelReader(reader, 1);
                        break;
                    }
                    case TileTransformationTypes.ROTATE_180: {
                        reader = new ChocoWinRotatePixelReader(reader, 2);
                        break;
                    }
                    case TileTransformationTypes.ROTATE_270: {
                        reader = new ChocoWinRotatePixelReader(reader, 3);
                        break;
                    }
                }

                if (drawData.a?.length) {
                    reader = new ChocoWinTransparencyOverrideReader(reader, drawData.a.map(c => new ChocoCoordinates(c)));
                }

                cachedTileReaders.set(posToCacheKey(drawData), reader);
            }
            return reader;
        }

        for (const region of this.#winTileSet.regions.toSorted((r1, r2) => r2.priority - r1.priority)) {
            const regionWidth = tileSize * Math.max(...region.tiles.map(row => row.length));
            const regionHeight = tileSize * region.tiles.length;

            const computeStartAndEnd = (
                /** @type {number} */ lowBuffer,
                /** @type {number} */ highBuffer,
                /** @type {number} */ windowLoc,
                /** @type {number} */ windowSize,
                /** @type {number} */ regionSize,
            ) => {
                let /** @type {number} */ start;
                let /** @type {number} */ end;

                if (isNumber(lowBuffer) && isNumber(highBuffer)) {
                    start = windowLoc + lowBuffer * this.#tileScale;
                    end = windowLoc + windowSize - highBuffer * this.#tileScale;
                }
                else if (isNumber(lowBuffer)) {
                    start = windowLoc + lowBuffer * this.#tileScale;
                    end = start + regionSize * this.#tileScale;
                }
                else if (isNumber(highBuffer)) {
                    start = windowLoc + windowSize - highBuffer * this.#tileScale - regionSize * this.#tileScale;
                    end = windowLoc + windowSize;
                }
                else {
                    console.warn("neither high nor low buffer was provided: full window will be used");
                    start = windowLoc;
                    end = start + windowLoc;
                }

                return { start, end }
            }

            const xStartEnd = computeStartAndEnd(region.bufferLeft, region.bufferRight, this.#x, this.#w, regionWidth);
            const yStartEnd = computeStartAndEnd(region.bufferTop, region.bufferBottom, this.#y, this.#h, regionHeight);

            for (let destY = yStartEnd.start, rowIndex = 0; destY < yStartEnd.end; rowIndex = (rowIndex + 1) % region.tiles.length, destY += tileSize * this.#tileScale) {
                const column = region.tiles[rowIndex];
                for (let destX = xStartEnd.start, colIndex = 0; destX < xStartEnd.end; (colIndex = (colIndex + 1) % column.length), destX += tileSize * this.#tileScale) {
                    const tile = column[colIndex];
                    if (tile) {
                        const reader = getTileReader(tile);
                        this.#doDrawTile(reader, writer, destX, destY, xStartEnd.end, yStartEnd.end);
                    }
                }
            }
        }

        return;
    };
}

/**
 * @interface
 */
export class ChocoWinAbstractPixelReader {
    /**
     * @return {Number}
     */
    get width() {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * @return {Number}
     */
    get height() {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * Returns a Promise that passes the same pixel reader into the resolve
     * callback.
     * @return {Promise<ChocoWinAbstractPixelReader>}
     */
    isReady() {
        throw new Error("cannot call methods on abstract class");
    }
}

/**
 * @interface 
 */
export class ChocoWinAbstractPixelWriterFactory {
    /**
     * @type {Number} width
     * @type {Number} height
     * @returns {ChocoWinAbstractPixelWriter}
     */
    build(width, height) {
        throw new Error("cannot call methods on abstract class");
    }
}

/**
 * @interface
 */
export class ChocoWinAbstractPixelWriter {
    /**
     * @param {ChocoCoordinates} coordinate
     * @param {ChocoColor} color
     */
    writePixel(coordinate, color) {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * Returns a Promise that passes the same pixel writer into the resolve
     * callback.
     * @return {Promise<ChocoWinAbstractPixelWriter>}
     */
    isReady() {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * @return {String}
     */
    makeDataUrl() {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * @return {Blob}
     */
    makeBlob() {
        throw new Error("cannot call methods on abstract class");
    }

    /**
     * @return {number}
     */
    get width() {
        throw new Error("cannot use getter method on abstract class")
    }

    /**
     * @return {number}
     */
    get height() {
        throw new Error("cannot use getter method on abstract class")
    }

    /**
     * 
     * @param {ChocoWinAbstractPixelReader} reader 
     */
    writeAll(reader) {
        for (let x = 0; x < reader.width; x++) {
            for (let y = 0; y < reader.height; y++) {
                const pixel = reader.getPixel({ x, y });
                this.writePixel({ x, y }, pixel);
            }
        }
    }
}

export class ChocoWinAbstractPixelReaderFactory {
    /**
     * @param {Object} args
     * @param {Blob} args.blob Will be prioritized over the data URL version.
     * @param {String} args.dataUrl
     * @return {ChocoWinAbstractPixelReader}
     */
    build({ blob, dataUrl }) {
        throw new Error("cannot call methods on abstract class");
    }
}

class ChocoWinAbstractTransformationPixelReader extends ChocoWinAbstractPixelReader {
    /** @param {ChocoWinAbstractPixelReader} */ _reader;
    /** @type {Promise<ChocoWinAbstractPixelReader} */ _isReadyWrapper;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {ChocoRectangle} region
     */
    constructor(reader) {
        super();
        this._reader = reader;

        this._isReadyWrapper = new Promise(resolve => {
            this._reader.isReady().then(r => {
                if (r != this._reader) {
                    console.warn("Wrapped reader fulfilled its promise with a different reader");
                }

                resolve(this);
            })
        });
    }

    isReady() {
        return this._isReadyWrapper;
    }
}

export class ChocoWinRegionPixelReader extends ChocoWinAbstractTransformationPixelReader {
    /** @param {ChocoRectangle} */ #region;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {ChocoRectangle} region
     */
    constructor(reader, region) {
        super(reader);
        this._reader = reader;
        this.#region = region;
    }

    /**
     * @return {Number}
     */
    get width() {
        return this.#region.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        return this.#region.height;
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        return this._reader.getPixel({ x: this.#region.x + coordinate.x, y: this.#region.y + coordinate.y });
    }
}

/**
 * Rotates in 90º increments.
 */
export class ChocoWinRotatePixelReader extends ChocoWinAbstractTransformationPixelReader {
    /** @param {Number} */ #rotationCount;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {Number} rotationCount
     */
    constructor(reader, rotationCount) {
        super(reader);
        this._reader = reader;
        this.#rotationCount = Math.round(rotationCount ?? 0) % 4;
    }

    /**
     * @return {Number}
     */
    get width() {
        switch (this.#rotationCount) {
            case 0: case 2: default: return this._reader.width;
            case 1: case 3: return this._reader.height;
        }
    }

    /**
     * @return {Number}
     */
    get height() {
        switch (this.#rotationCount) {
            case 0: case 2: default: return this._reader.height;
            case 1: case 3: return this._reader.width;
        }
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        switch (this.#rotationCount) {
            case 0: default:
                return this._reader.getPixel(coordinate);
            case 1:
                // {0, 0} -> { 0, h }
                // {h, 0} => { 0, 0 }
                // {h, w} => { w, 0 }
                // {0, w} => { w, h }
                return this._reader.getPixel({ x: coordinate.y, y: this._reader.height - 1 - coordinate.x });
            case 2:
                return this._reader.getPixel({ x: this._reader.width - 1 - coordinate.x, y: this._reader.height - 1 - coordinate.y });
            case 3:
                // {0, 0} -> { w, 0 }
                // {h, 0} => { 0, 0 }
                // {h, w} => { 0, h }
                // {0, w} => { w, h }
                return this._reader.getPixel({ x: this._reader.width - 1 - coordinate.y, y: coordinate.x });
        }
    }
}

/**
 * Makes chosen pixels transparent.
 */
export class ChocoWinTransparencyOverrideReader extends ChocoWinAbstractTransformationPixelReader {
    /** @param {ChocoCoordinates[]} */ #transparentPixels;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {ChocoCoordinates[]} transparentPixels;
     */
    constructor(reader, transparentPixels) {
        super(reader);
        this._reader = reader;
        this.#transparentPixels = transparentPixels.map(c => new ChocoCoordinates(c));
    }

    /**
     * @return {Number}
     */
    get width() {
        return this._reader.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        this._reader.height;
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        if (this.#transparentPixels.find(c => c.x == coordinate.x && c.y == coordinate.y)) {
            return new ChocoColor({ r: 0, g: 0, b: 0, a: 0 });
        }
        else {
            return this._reader.getPixel(coordinate);
        }
    }
}

/**
 * @typedef {String} ReflectionTypes
 **/

/**
 * @enum {ReflectionTypes}
 */
export const ChocoWinReflectionTypes = Object.freeze({
    HORIZONTAL: "HORIZONTAL",
    VERTICAL: "VERTICAL",
    ASCENDING: "ASCENDING",
    DESCENDING: "DESCENDING",
    POINT: "POINT",
})

/**
 * Reflects.
 */
export class ChocoWinReflectionPixelReader extends ChocoWinAbstractTransformationPixelReader {
    /** @param {ReflectionTypes} */ #reflectionType;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {Object} reflections
     * @param {ReflectionTypes} reflectionType
     */
    constructor(reader, reflectionType) {
        super(reader);
        this._reader = reader;
        this.#reflectionType = reflectionType;

    }

    /**
     * @return {Number}
     */
    get width() {
        return this._reader.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        return this._reader.height;
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        let x = coordinate.x;
        let y = coordinate.y;

        // Ascending
        // (0, 0) => (w, h)
        // (h, 0) => (w, 0)
        // (h, w) => (0, 0)
        // (0, w) => (0, h)

        switch (this.#reflectionType) {
            case ChocoWinReflectionTypes.HORIZONTAL: case ChocoWinReflectionTypes.POINT: {
                x = this._reader.width - 1 - coordinate.x;
                break;
            }
            case ChocoWinReflectionTypes.ASCENDING:
                x = this._reader.width - 1 - coordinate.y;
                break;
            case ChocoWinReflectionTypes.DESCENDING:
                x = coordinate.y;
                break;
        }

        switch (this.#reflectionType) {
            case ChocoWinReflectionTypes.VERTICAL: case ChocoWinReflectionTypes.POINT: {
                y = this._reader.height - 1 - coordinate.y;
                break;
            }
            case ChocoWinReflectionTypes.ASCENDING:
                y = this._reader.height - 1 - coordinate.x;
                break;
            case ChocoWinReflectionTypes.DESCENDING:
                y = coordinate.x;
                break;
        }

        return this._reader.getPixel({ x, y });
    }
}

/**
 * @param {String} dataUrl 
 * @returns {Blob}
*/
export function pngBase64DataUrlToBlob(dataUrl) {
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
};

/**
 * @typedef {String} TransformationTypes
 */

/**
 *  @enum {TransformationTypes} 
 */
export const TileTransformationTypes = Object.freeze({
    BASE: "base",
    ROTATE_90: "rotate90",
    ROTATE_180: "rotate180",
    ROTATE_270: "rotate270",
    REFLECT_HORIZONTAL: "reflectHorizontal",
    REFLECT_VERTICAL: "reflectVertical",
    REFLECT_ASCENDING: "reflectAscending",
    REFLECT_DESCENDING: "reflectDescending",
})

/**
 * @param {ChocoWinAbstractPixelReader} reader 
 * @param {TransformationTypes} tileTransformationType 
 */
export const WrapReaderForTileTransformation = (reader, tileTransformationType) => {
    switch (tileTransformationType) {
        case TileTransformationTypes.BASE: default: {
            return reader;
        }
        case TileTransformationTypes.ROTATE_90: {
            return new ChocoWinRotatePixelReader(reader, 1);
        }
        case TileTransformationTypes.ROTATE_180: {
            return new ChocoWinRotatePixelReader(reader, 2);
        }
        case TileTransformationTypes.ROTATE_270: {
            return new ChocoWinRotatePixelReader(reader, 3);
        }
        case TileTransformationTypes.REFLECT_HORIZONTAL: {
            return new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.HORIZONTAL);
        }
        case TileTransformationTypes.REFLECT_VERTICAL: {
            return new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.VERTICAL);
        }
        case TileTransformationTypes.REFLECT_ASCENDING: {
            return new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.ASCENDING);
        }
        case TileTransformationTypes.REFLECT_DESCENDING: {
            return new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.DESCENDING);
        }
    }
}

export class ChocoWinPngJsPixelReader extends ChocoWinAbstractPixelReader {
    /** @type {Boolean} */ #ready = false;
    /** @type {PNG} */ #png;
    /** @type {Promise} */ #imageParsed;

    /**
     * @param {PNG} png
     */
    constructor(png) {
        super();
        this.#png = png;
        this.#imageParsed = new Promise(resolve => {
            this.#png.on("parsed", () => {
                this.#ready = true;
                resolve(this);
            });
        });
    }

    /**
     * @return {Number}
     */
    get width() {
        return this.#png.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        return this.#png.height;
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        if (coordinate.x < 0 || coordinate.x >= this.#png.width) return null;
        if (coordinate.y < 0 || coordinate.y >= this.#png.height) return null;
        const i = 4 * (coordinate.x + coordinate.y * this.#png.width);
        return new ChocoColor({ r: this.#png.data[i + 0], g: this.#png.data[i + 1], b: this.#png.data[i + 2], a: this.#png.data[i + 3] });
    }

    /**
     * @return {Promise}
     */
    isReady() {
        return this.#imageParsed;
    }
}

export class ChocoWinPngJsPixelWriter extends ChocoWinAbstractPixelWriter {
    /** @type {PNG} */ #png;
    /** @type {function(new:PNG)} */ #pngClass;
    /** @type {Promise} */ #alwaysResolved;

    /**
     * @param {function(new:PNG)} pngClass;
     * @param {Number} width
     * @param {Number} height
     */
    constructor(width, height, pngClass) {
        super();
        this.#pngClass = pngClass;
        this.#png = new this.#pngClass();
        this.#png.width = width;
        this.#png.height = height;
        this.#png.data = new Uint8Array(this.#png.width * this.#png.height * 4);
        this.#alwaysResolved = new Promise((resolve) => resolve(this));
    }

    writePixel(coordinate, color) {
        const i = 4 * (coordinate.x + coordinate.y * this.#png.width);

        // if (0 < color.a && color.a < 255) {
        // For a better imlpementation, see https://arxiv.org/pdf/2202.02864.
        // See https://stackoverflow.com/a/10768854/1102726.
        // oh, no, though: what if nothing has been written yet? in that case, this array's gonna contain zero and you should go make breakfast
        // no, that scenario is okay! you can check if alpha is 0, but THEN you have the scenario of 0<alpha<255.
        this.#png.data[i + 0] = ((this.#png.data[i + 0] * (255 - (color.a ?? 255)) / 255) + color.r * (color.a ?? 255) / 255)
        this.#png.data[i + 1] = ((this.#png.data[i + 1] * (255 - (color.a ?? 255)) / 255) + color.g * (color.a ?? 255) / 255)
        this.#png.data[i + 2] = ((this.#png.data[i + 2] * (255 - (color.a ?? 255)) / 255) + color.b * (color.a ?? 255) / 255)
        // }
        // else if (color.a ?? 255 >= 255) {
        //     this.#png.data[i + 0] = color?.r ?? 0;
        //     this.#png.data[i + 1] = color?.g ?? 0;
        //     this.#png.data[i + 2] = color?.b ?? 0;
        // }

        // const makeOpaque = (255 == this.#png.data[i + 3]) || (255 == (color?.a ?? 255));
        // const makeTransparent = (0 == this.#png.data[i + 3]) && (0 == (color?.a ?? 0));

        // if (makeOpaque) {
        //     this.#png.data[i + 3] = 255;
        // }
        // else if (makeTransparent) {
        //     this.#png.data[i + 3] = 0;
        // }
        // else {
        const remainingAlpha = 255 - this.#png.data[i + 3];
        const colorAlphaContribution = Math.round((color.a ?? 255) / 255.0 * remainingAlpha);
        this.#png.data[i + 3] = this.#png.data[i + 3] + colorAlphaContribution;
        // }
    }

    makeDataUrl() {
        const buffer = this.#pngClass.sync.write(this.#png);
        const uint8Array = new Uint8Array(buffer);
        const binaryString = String.fromCharCode(...uint8Array);
        const base64 = window.btoa(binaryString);

        return `data:image/png;base64,${base64}`;
    }

    makeBlob() {
        const buffer = this.#pngClass.sync.write(this.#png);
        const blob = new Blob([buffer], { type: 'image/png' });
        return blob;
    }

    /**
     * @return {Promise}
     */
    isReady() {
        return this.#alwaysResolved;
    }

    /**
     * @return {Number}
     */
    get width() {
        return this.#png.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        return this.#png.height;
    }
}

export class ChocoWinPngJsPixelWriterFactory extends ChocoWinAbstractPixelWriterFactory {
    /** @type {function(new:PNG)} */ pngClass;

    /**
     * @param {function(new:PNG)} pngClass
     */
    constructor(pngClass) {
        // See https://stackoverflow.com/a/45438239 for info on the JsDoc
        super();
        this.pngClass = pngClass;
    }

    /**
     * @param {number} width
     * @param {number} height
     * @returns {ChocoWinAbstractPixelWriter}
     */
    build(width, height) {
        return new ChocoWinPngJsPixelWriter(width, height, this.pngClass);
    }
}

export class ChocoWinPngJsPixelReaderFactory extends ChocoWinAbstractPixelReaderFactory {
    /** @type {function(new:PNG)} */ #pngClass;

    /**
     * @param {function(new:PNG)} pngClass Function that return a PNG.
     */
    constructor(pngClass) {
        super();
        this.#pngClass = pngClass;
    }

    /**
     * @param {Object} args
     * @param {Blob} args.blob Will be prioritized over the data URL version.
     * @param {String} args.dataUrl
     * @return {ChocoWinAbstractPixelReader}
     */
    build({ blob, dataUrl }) {
        const myPng = new this.#pngClass();

        if (!blob) {
            blob = pngBase64DataUrlToBlob(dataUrl);
        }

        blob.arrayBuffer().then(buffer => myPng.parse(buffer))

        return new ChocoWinPngJsPixelReader(myPng);
    }
}