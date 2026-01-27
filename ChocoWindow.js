export class ChocoWinSettings {
    static ignoreScaleMisalignmentErrors = false;
    static suggestedMaximumTileSheetColorCount = 8;
    static get CURRENT_VERSION() { return ("1.1.0") };
}

export class ChocoWinColor {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinColor} arg1
     */
    constructor(arg1) {
        if (typeof (arg1) == 'string') {
            const regex = /^#[0-9A-Fa-f]{6}/;

            if (!regex.test(arg1)) {
                /** @type {number} */ this.r = 0;
                /** @type {number} */ this.g = 0;
                /** @type {number} */ this.b = 0;
            }
            else {
                arg1 = arg1.replace(/^#/, '');

                this.r = parseInt(arg1.slice(0, 2), 16);
                this.g = parseInt(arg1.slice(2, 4), 16);
                this.b = parseInt(arg1.slice(4, 6), 16);
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
}

export class ChocoWinCoordinates {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinCoordinates} arg1
     */
    constructor(arg1) {
        if (arg1 && !isNaN(arg1.x) && !isNaN(arg1.y)) {
            this.x = arg1.x;
            this.y = arg1.y;
            this.t = arg1.t;
        }
        else {
            /** @type {Number} */ this.x = 0;
            /** @type {Number} */ this.y = 0;
            /** @type {TileTransformationTypes} */ this.t = TileTransformationTypes.BASE;
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinRectangle {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinRectangle} arg1
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
            this.TL = new ChocoWinCoordinates(arg1.TL);
            this.TR = new ChocoWinCoordinates(arg1.TR);
            this.BL = new ChocoWinCoordinates(arg1.BL);
            this.BR = new ChocoWinCoordinates(arg1.BR);
        }
        else {
            /** @type {ChocoWinCoordinates} - The top-left corner tile coordinates. */     this.TL = { x: 0, y: 0 };
            /** @type {ChocoWinCoordinates} - The top-right corner tile coordinates. */    this.TR = { x: 0, y: 0 };
            /** @type {ChocoWinCoordinates} - The bottom-left corner tile coordinates. */  this.BL = { x: 0, y: 0 };
            /** @type {ChocoWinCoordinates} - The bottom-right corner tile coordinates. */ this.BR = { x: 0, y: 0 };
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
            this.T = arg1.T.map((c) => new ChocoWinCoordinates(c));
            this.B = arg1.B.map((c) => new ChocoWinCoordinates(c));
            this.L = arg1.L.map((c) => new ChocoWinCoordinates(c));
            this.R = arg1.R.map((c) => new ChocoWinCoordinates(c));
        }
        else {
            /** @type {Array<ChocoWinCoordinates>} The top edge tile coordinate pairs. */   this.T = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinCoordinates>} The bottom edge tile coordinate paors */ this.B = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinCoordinates>} The left edge tile coordinate paors. */  this.L = [{ x: 0, y: 0 }];
            /** @type {Array<ChocoWinCoordinates>} The right edge tile coordinate pairs. */ this.R = [{ x: 0, y: 0 }];
        }
        this.id = arg1?.id ?? crypto.randomUUID();
    }
}

export class ChocoWinTileSet {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinTileSet} arg1
     */
    constructor(arg1) {
        if (arg1 && arg1.sourceFileUrl && !isNaN(arg1.tileSize) && arg1.corners && arg1.edges && arg1.centerRows) {
            this.id = arg1.id || null; // might be null in original
            this.name = arg1.name || null; // might be null in original
            this.sourceFileUrl = String(arg1.sourceFileUrl);
            this.tileSize = Number(arg1.tileSize);
            this.corners = new ChocoWinTilesetCorners(arg1.corners);
            this.edges = new ChocoWinOptionEdges(arg1.edges);
            this.centerRows = arg1.centerRows.map((col) => col.map(coord => new ChocoWinCoordinates(coord)));
            if (arg1.substitutableColors) {
                this.substitutableColors = arg1.substitutableColors.map((color) => new ChocoWinColor(color));
            }
        }
        else {
            /** @type {String} */
            this.sourceFileUrl = "";
            /** @type {String} */
            this.name = "";
            /** @type {Number} */
            this.tileSize = 0;
            /** @type {ChocoWinTilesetCorners} */
            this.corners = { TL: { y: 0, x: 0 }, TR: { y: 0, x: 0 }, BL: { y: 0, x: 0 }, BR: { y: 0, x: 0 } };
            /** @type {ChocoWinOptionEdges} */
            this.edges = { T: [{ y: 0, x: 0 }], L: [{ y: 0, x: 0 }], R: [{ y: 0, x: 0 }], B: [{ y: 0, x: 0, }] };
            /** @type {Array<Array<ChocoWinCoordinates>>} */
            this.centerRows = [[{ y: 0, x: 0 }]];
            /** @type {Array<ChocoWinColor>} */
            this.substitutableColors = []
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
    /** @type {Array<Number, ChocoWinColor>} */ #colorSubstitutions;

    /**
     * @param {Object} args
     * @param {ChocoWinTileSet} args.winTileSet 
     * @param {Number} args.tileScale 
     * @param {Number} args.x 
     * @param {Number} args.y 
     * @param {Number} args.w 
     * @param {Number} args.h 
     * @param {ChocoWinAbstractPixelReaderFactory} args.readerFactory
     * @param {Array<Number, ChocoWinColor>} args.colorSubstitutions
     */
    constructor({ winTileSet, tileScale, x, y, w, h, readerFactory, colorSubstitutions }) {
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
    substituteColor(/** @type {Number} */ index, /** @type {ChocoWinColor} */ color) {
        this.#colorSubstitutions[index] = new ChocoWinColor(color);
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
        /** @type {Boolean} */ allowOverrunX,
        /** @type {Boolean} */ allowOverrunY
    ) {
        const areColorsExactMatch = (/** @type {ChocoWinColor} */ oldColor, /** @type {ChocoWinColor} */ newColor) => {
            return oldColor.r == newColor.r && oldColor.g == newColor.g && oldColor.b == newColor.b;
        }

        const areColorRmsClose = (/** @type {ChocoWinColor} */ oldColor, /** @type {ChocoWinColor} */ newColor) => {
            const maxDistance = 2;
            const dr = oldColor.r - newColor.r;
            const dg = oldColor.g - newColor.g;
            const db = oldColor.b - newColor.b;

            return Math.sqrt(0.33 * dr * dr + 0.33 * dg * dg + 0.33 * db * db) < maxDistance
        }

        for (let sourceX = 0; sourceX < reader.width; sourceX++) {
            for (let sourceY = 0; sourceY < reader.width; sourceY++) {
                let pixelColor = reader.getPixel({ x: sourceX, y: sourceY });

                if (this.hasColorSubstitutions() && this.#winTileSet.substitutableColors?.length) {
                    for (const keyValuePair of Object.entries(this.#colorSubstitutions)) {
                        /** @type {number} */ const index = keyValuePair[0];
                        /** @type {ChocoWinColor} */ const newColor = keyValuePair[1];

                        if (!newColor) {
                            continue;
                        }

                        /** @type {ChocoWinColor} */ const oldColor = this.#winTileSet.substitutableColors[index];

                        if (index < 0) continue;
                        if (index >= this.#winTileSet.substitutableColors.length) continue;

                        if (areColorsExactMatch(oldColor, pixelColor)) {
                            pixelColor = newColor;
                        }
                    }
                }

                for (let offsetX = 0; offsetX < this.#tileScale; offsetX++) {
                    for (let offsetY = 0; offsetY < this.#tileScale; offsetY++) {
                        writer.writePixel({ x: this.#x + destX + sourceX * this.#tileScale + offsetX, y: this.#y + destY + sourceY * this.#tileScale + offsetY }, pixelColor);
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
        const destSize = tileSize * this.#tileScale;

        if (0 == tileSize) {
            console.error("tile size cannot be zero");
            return;
        }
        const /** @type {Map<String, ChocoWinCoordinates>} */ cachedTileReaders = new Map();
        const xyToCacheKey = ({/** @type { String } */ id, /** @type {Number} */ x, /* @type {Number} */ y }) => {
            return id ?? String(this.#sillyMaxWidth / 2 * x + y);
        }
        const getTileReader = (/** @type {ChocoWinCoordinates} */ tilePos) => {
            let reader = cachedTileReaders.get(xyToCacheKey(tilePos));
            if (!reader) {
                reader = new ChocoWinRegionPixelReader(this.#tileSheetReader, new ChocoWinRectangle({ x: tilePos.x, y: tilePos.y, width: tileSize, height: tileSize }));

                switch (tilePos.t) {
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

                // todo: when implementing transformations, iterate over and keep reassigning the reader.
                cachedTileReaders.set(xyToCacheKey(tilePos), reader);
            }
            return reader;
        }

        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.centerRows.length) {
            let row = wo?.centerRows?.[i];
            if (!row) continue;

            for (let dx = destSize, j = 0; dx < this.#w - destSize; dx += destSize, j = (j + 1) % wo.centerRows[i].length) {
                let tilePos = row[j];
                if (!tilePos) continue;

                const reader = getTileReader(tilePos);
                this.#doDrawTile(reader, writer, dx, dy);
            }
        }

        for (let dx = destSize, i = 0; dx < this.#w - destSize; dx += destSize, i = (i + 1) % wo.edges.T.length) {
            let tilePos = wo.edges.T[i];
            const reader = getTileReader(tilePos);
            this.#doDrawTile(reader, writer, dx, 0, false, false);
        }
        for (let dx = destSize, i = 0; dx < this.#w - destSize; dx += destSize, i = (i + 1) % wo.edges.B.length) {
            let tilePos = wo.edges.B[i];
            const reader = getTileReader(tilePos);
            this.#doDrawTile(reader, writer, dx, this.#h - destSize, false, true);
        }
        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.edges.L.length) {
            let tilePos = wo.edges.L[i];
            const reader = getTileReader(tilePos);
            this.#doDrawTile(reader, writer, 0, dy, false, true);
        }
        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.edges.R.length) {
            let tilePos = wo.edges.R[i];
            const reader = getTileReader(tilePos);
            this.#doDrawTile(reader, writer, this.#w - destSize, dy, true, false);
        }

        this.#doDrawTile(getTileReader(wo.corners.TL), writer, 0, 0, false, false);
        this.#doDrawTile(getTileReader(wo.corners.TR), writer, this.#w - destSize, 0, true, false);
        this.#doDrawTile(getTileReader(wo.corners.BL), writer, 0, this.#h - destSize, false, true);
        this.#doDrawTile(getTileReader(wo.corners.BR), writer, this.#w - destSize, this.#h - destSize, true, true);
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
     * @param {ChocoWinCoordinates} coordinate
     * @return {ChocoWinColor}
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
     * @param {ChocoWinCoordinates} coordinate
     * @param {ChocoWinColor} color
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
     * @param {ChocoWinRectangle} region
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
    /** @param {ChocoWinRectangle} */ #region;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {ChocoWinRectangle} region
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
     * @param {ChocoWinCoordinates} coordinate
     * @return {ChocoWinColor}
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
     * @param {ChocoWinCoordinates} coordinate
     * @return {ChocoWinColor}
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
     * @param {ChocoWinCoordinates} coordinate
     * @return {ChocoWinColor}
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