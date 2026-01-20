import { PNG } from 'pngjs/browser'
import { ChocoWinAbstractPixelReader, ChocoWinAbstractPixelReaderFactory, ChocoWinAbstractPixelWriter, ChocoWinAbstractPixelWriterFactory, ChocoWinColor, pngBase64DataUrlToBlob } from './ChocoWindow';

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
     * @param {ChocoWinCoordinates} coordinate
     * @return {ChocoWinColor}
     */
    getPixel(coordinate) {
        if (coordinate.x < 0 || coordinate.x >= this.#png.width) return null;
        if (coordinate.y < 0 || coordinate.y >= this.#png.height) return null;
        const i = 4 * (coordinate.x + coordinate.y * this.#png.width);
        return new ChocoWinColor({ r: this.#png.data[i + 0], g: this.#png.data[i + 1], b: this.#png.data[i + 2], a: this.#png.data[i + 3] });
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
    /** @type {Promise} */ #alwaysResolved;

    /**
     * @param {Number} width
     * @param {Number} height
     */
    constructor(width, height) {
        super();
        this.#png = new PNG();
        this.#png.width = width;
        this.#png.height = height;
        this.#png.data = new Uint8Array(this.#png.width * this.#png.height * 4);
        this.#alwaysResolved = new Promise((resolve) => resolve(this));
    }

    writePixel(coordinate, color) {
        const i = 4 * (coordinate.x + coordinate.y * this.#png.width);
        this.#png.data[i + 0] = color?.r ?? 0;
        this.#png.data[i + 1] = color?.g ?? 0;
        this.#png.data[i + 2] = color?.b ?? 0;
        this.#png.data[i + 3] = color?.a ?? 0;
    }

    makeDataUrl() {
        const buffer = PNG.sync.write(this.#png);
        const uint8Array = new Uint8Array(buffer);
        const binaryString = String.fromCharCode(...uint8Array);
        const base64 = window.btoa(binaryString);

        return `data:image/png;base64,${base64}`;
    }

    makeBlob() {
        const buffer = PNG.sync.write(this.#png);
        const blob = new Blob([buffer], { type: 'image/png' });
        return blob;
    }

    /**
     * @return {Promise}
     */
    isReady() {
        return this.#alwaysResolved;
    }
}

export class ChocoWinPngJSPixelWriterFactory extends ChocoWinAbstractPixelWriterFactory {
    /**
     * @type {Number} width
     * @type {Number} height
     * @returns {ChocoWinAbstractPixelWriter}
     */
    build(width, height) {
        return new ChocoWinPngJsPixelWriter(width, height);
    }
}

export class ChocoWinPngJsPixelReaderFactory extends ChocoWinAbstractPixelReaderFactory {
    /**
     * @param {Object} args
     * @param {Blob} args.blob Will be prioritized over the data URL version.
     * @param {String} args.dataUrl
     * @return {ChocoWinAbstractPixelReader}
     */
    build({ blob, dataUrl }) {
        const myPng = new PNG(); // png is what is provided by the CDN.

        if (!blob) {
            blob = pngBase64DataUrlToBlob(dataUrl);
        }

        blob.arrayBuffer().then(buffer => myPng.parse(buffer))

        return new ChocoWinPngJsPixelReader(myPng);
    }
}