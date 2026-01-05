class ChocoWinSettings {
    static ignoreScaleMisalignmentErrors = false;
}

class ChocoWinColor {
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
        }
        else {
            /** @type {number} */ this.r = 0;
            /** @type {number} */ this.g = 0;
            /** @type {number} */ this.b = 0;
        }
    }

    toHexString() { return `#${this.r.toString(16).padStart(2, "0")}${this.g.toString(16).padStart(2, "0")}${this.b.toString(16).padStart(2, "0")}`; }
}

class ChocoWinCoordinates {
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
        }
        else {
            /** @type {number} */ this.x = 0;
            /** @type {number} */ this.y = 0;
        }
    }
}

class ChocoWinTilesetCorners {
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
    }
}

class ChocoWinOptionEdges {
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
    }
}

class ChocoWinTileSet {
    /**
     * Default consturctor
     */
    /**
     * Copy constructor, useful for JSON objects.
     * @param {ChocoWinTileSet} arg1
     */
    constructor(arg1) {
        if (arg1 && arg1.sourceFileUrl && !isNaN(arg1.tileSize) && arg1.corners && arg1.edges && arg1.patternRows) {
            this.id = arg1.id || null; // might be null in original
            this.name = arg1.name || null; // might be null in original
            this.sourceFileUrl = String(arg1.sourceFileUrl);
            this.tileSize = Number(arg1.tileSize);
            this.corners = new ChocoWinTilesetCorners(arg1.corners);
            this.edges = new ChocoWinOptionEdges(arg1.edges);
            this.patternRows = arg1.patternRows.map((col) => col.map(coord => new ChocoWinCoordinates(coord)));
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
            this.patternRows = [[{ y: 0, x: 0 }]];
            /** @type {Array<ChocoWinColor>} */
            this.substitutableColors = []
        }
    }
}

class ChocoWinWindow {
    /** @type {HTMLImageElement} */ #pixmap;
    /** @type {ChocoWinTileSet} */ #winOption;
    /** @type {Number} */ #tileScale;
    /** @type {Number} */ #x;
    /** @type {Number} */ #y;
    /** @type {Number} */ #w;
    /** @type {Number} */ #h;
    /** @type {Object<Number, ChocoWinColor>} */ #colorSubstitutions;
    constructor(/** @type {ChocoWinTileSet} */ winOption, /** @type {Number} */ tileScale, /** @type {Number} */ x, /** @type {Number} */ y, /** @type {Number} */ w, /** @type {Number} */ h) {
        this.#pixmap = new Image();
        this.#pixmap.src = winOption.sourceFileUrl;

        this.#winOption = winOption;
        this.#tileScale = tileScale;
        this.#x = x;
        this.#y = y;
        this.#w = w;
        this.#h = h;

        if ((true != ChocoWinSettings.ignoreScaleMisalignmentErrors) && ((this.#w % this.#tileScale != 0) || (this.#h % this.#tileScale != 0))) {
            console.warn(`Scale misalignment: one or both window dimensions [${this.#w}, ${this.#h}] are not multiples of tile scale ${tileScale}. Artifacts may occur on the right and bottom edges as a result, especially if the sprite map includes transparency. To ignore this warning, set ChocoWinSettings.ignoreScaleMisalignmentErrors = true`);
        }

        this.#colorSubstitutions = {};
    }

    isReady() {
        return new Promise((resolve) => {
            this.#pixmap.onload = () => {
                resolve();
            }
            if (this.#pixmap.complete) {
                resolve();
            }
        });
    }

    drawTo(/** @type {CanvasRenderingContext2D} */ ctx) {
        const oldSmoothing = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        this.#doDrawWindow(ctx);
        ctx.imageSmoothingEnabled = oldSmoothing
    }

    /**
     * @returns {ChocoWinWindow} The same object, for method chaining.
     */
    substituteColor(/** @type {Number} */ index, /** @type {ChocoWinColor} */ color) {
        this.#colorSubstitutions[index] = new ChocoWinColor(color);
        return this;
    }

    hasColorSubstitutions() {
        return Object.keys(this.#colorSubstitutions).length > 0;
    }

    #doDrawTile(
        /** @type {CanvasRenderingContext2D} */ ctx
        , /** @type {Number} */ tileSize
        , /** @type {Number} */ sx
        , /** @type {Number} */ sy
        , /** @type {Number} */ dxRelative
        , /** @type {Number} */ dyRelative
        , /** @type {Boolean} */ allowOverrunX
        , /** @type {Boolean} */ allowOverrunY
    ) {
        let destWidth = tileSize * this.#tileScale;
        let destHeight = tileSize * this.#tileScale;
        let sw = tileSize;
        let sh = tileSize;
        const pixmap = this.#pixmap;

        if ((true != allowOverrunX) && (dxRelative + destWidth > this.#w - destWidth)) {
            const pixelsToDraw = this.#w - destWidth - dxRelative;
            const pixelsToSource = Math.ceil(pixelsToDraw / this.#tileScale);
            if ((true != ChocoWinSettings.ignoreScaleMisalignmentErrors) && (pixelsToSource != Math.floor(pixelsToDraw / this.#tileScale))) {
                console.warn(`Scale horizontal misalignment: cannot trim precisely at {${dxRelative}, ${dyRelative}}; drawing desination tile size ${destWidth} will horizontally overrun right edge/corner tiles at x=${this.#w - destWidth}; draw ${pixelsToSource} source tile pixels where ${pixelsToDraw} destination pixels should be drawn.`);
            }
            sw = pixelsToSource;
            destWidth = sw * this.#tileScale;
        }

        if ((true != allowOverrunY) && (dyRelative + destHeight > this.#h - destHeight)) {
            const pixelsToDraw = this.#h - destHeight - dyRelative;
            const pixelsToSource = Math.ceil(pixelsToDraw / this.#tileScale);
            if ((true != ChocoWinSettings.ignoreScaleMisalignmentErrors) && (pixelsToSource != Math.floor(pixelsToDraw / this.#tileScale))) {
                console.warn(`Scale vertical misalignment: cannot trim precisely at {${dxRelative}, ${dyRelative}}; drawing desination tile size ${destHeight} will vertically overrun right edge/corner tiles at y=${this.#h - destHeight}; draw ${pixelsToSource} source tile pixels where ${pixelsToDraw} destination pixels should be drawn.`);
            }
            sh = pixelsToSource;
            destHeight = sh * this.#tileScale;
        }

        const dxAbsolute = this.#x + dxRelative;
        ctx.drawImage(pixmap, sx, sy, sw, sh, dxAbsolute, this.#y + dyRelative, destWidth, destHeight);

        if (this.hasColorSubstitutions && this.#winOption.substitutableColors?.length) {
            const imageData = ctx.getImageData(dxAbsolute, this.#y + dyRelative, destWidth, destHeight);
            const imagePixelBytes = imageData.data;
            for (const keyValuePair of Object.entries(this.#colorSubstitutions)) {
                /** @type {number} */ const index = keyValuePair[0];
                /** @type {ChocoWinColor} */ const newColor = keyValuePair[1];
                /** @type {ChocoWinColor} */ const oldColor = this.#winOption.substitutableColors[index];

                if (index < 0) continue;
                if (index >= this.#winOption.substitutableColors.length) continue;

                for (let i = 0; i < imagePixelBytes.length; i += 4) {
                    const areColorsCloseEnough = (r1, r2, g1, g2, b1, b2) => {
                        const maxDistance = 5;
                        return (Math.abs(r1-r2) < maxDistance) && (Math.abs(g1-g2) < maxDistance) && (Math.abs(b1-b2) < maxDistance);
                        // const maxDistance = 2;
                        // const dr = r2 - r1;
                        // const dg = g2 - g1;
                        // const db = b2 - b1

                        // return Math.sqrt(0.33 * dr * dr + 0.33 * dg * dg + 0.33 * db * db) < maxDistance
                    }

                    if (areColorsCloseEnough(imagePixelBytes[i], oldColor.r, imagePixelBytes[i + 1], oldColor.g, imagePixelBytes[i + 2], oldColor.b)) {
                        imagePixelBytes[i] = newColor.r;
                        imagePixelBytes[i + 1] = newColor.g;
                        imagePixelBytes[i + 2] = newColor.b;
                    }
                }
            }
            ctx.putImageData(imageData, dxAbsolute, this.#y + dyRelative);
        }
    }

    #doDrawWindow(/** @type {CanvasRenderingContext2D} */ ctx) {
        const wo = this.#winOption;
        const tileSize = wo.tileSize;
        const destSize = tileSize * this.#tileScale;

        if (0 == tileSize) {
            console.error("tile size cannot be zero");
            return;
        }

        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.patternRows.length) {
            let row = wo.patternRows[i];
            for (let dx = destSize, j = 0; dx < this.#w - destSize; dx += destSize, j = (j + 1) % wo.patternRows[i].length) {
                let tile = wo.patternRows[i][j];
                this.#doDrawTile(ctx, tileSize, tile.x, tile.y, dx, dy);
            }
        }
        for (let dx = destSize, i = 0; dx < this.#w - destSize; dx += destSize, i = (i + 1) % wo.edges.T.length) {
            let tile = wo.edges.T[i];
            this.#doDrawTile(ctx, tileSize, tile.x, tile.y, dx, 0, false, false);
        }
        for (let dx = destSize, i = 0; dx < this.#w - destSize; dx += destSize, i = (i + 1) % wo.edges.B.length) {
            let tile = wo.edges.B[i];
            this.#doDrawTile(ctx, tileSize, tile.x, tile.y, dx, this.#h - destSize, false, true);
        }
        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.edges.L.length) {
            let tile = wo.edges.L[i];
            this.#doDrawTile(ctx, tileSize, tile.x, tile.y, 0, dy, false, false);
        }
        for (let dy = destSize, i = 0; dy < this.#h - destSize; dy += destSize, i = (i + 1) % wo.edges.R.length) {
            let tile = wo.edges.R[i];
            this.#doDrawTile(ctx, tileSize, tile.x, tile.y, this.#w - destSize, dy, true, false);
        }

        this.#doDrawTile(ctx, tileSize, wo.corners.TL.x, wo.corners.TL.y, 0, 0, false, false);
        this.#doDrawTile(ctx, tileSize, wo.corners.TR.x, wo.corners.TR.y, this.#w - destSize, 0, true, false);
        this.#doDrawTile(ctx, tileSize, wo.corners.BL.x, wo.corners.BL.y, 0, this.#h - destSize, false, true);
        this.#doDrawTile(ctx, tileSize, wo.corners.BR.x, wo.corners.BR.y, this.#w - destSize, this.#h - destSize, true, true);
    };
}

export { ChocoWinSettings, ChocoWinColor, ChocoWinCoordinates, ChocoWinTilesetCorners, ChocoWinOptionEdges, ChocoWinTileSet, ChocoWinWindow }