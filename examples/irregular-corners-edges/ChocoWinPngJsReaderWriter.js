// import { ChocoWinAbstractPixelReader, ChocoWinAbstractPixelReaderFactory, ChocoWinAbstractPixelWriter, ChocoWinAbstractPixelWriterFactory, ChocoWinColor, pngBase64DataUrlToBlob } from './ChocoWindow.js';

// export class ChocoWinPngJsPixelReader extends ChocoWinAbstractPixelReader {
//     /** @type {Boolean} */ #ready = false;
//     /** @type {PNG} */ #png;
//     /** @type {Promise} */ #imageParsed;

//     /**
//      * @param {PNG} png
//      */
//     constructor(png) {
//         super();
//         this.#png = png;
//         this.#imageParsed = new Promise(resolve => {
//             this.#png.on("parsed", () => {
//                 this.#ready = true;
//                 resolve(this);
//             });
//         });
//     }

//     /**
//      * @return {Number}
//      */
//     get width() {
//         return this.#png.width;
//     }

//     /**
//      * @return {Number}
//      */
//     get height() {
//         return this.#png.height;
//     }

//     /**
//      * @param {ChocoWinCoordinates} coordinate
//      * @return {ChocoWinColor}
//      */
//     getPixel(coordinate) {
//         if (coordinate.x < 0 || coordinate.x >= this.#png.width) return null;
//         if (coordinate.y < 0 || coordinate.y >= this.#png.height) return null;
//         const i = 4 * (coordinate.x + coordinate.y * this.#png.width);
//         return new ChocoWinColor({ r: this.#png.data[i + 0], g: this.#png.data[i + 1], b: this.#png.data[i + 2], a: this.#png.data[i + 3] });
//     }

//     /**
//      * @return {Promise}
//      */
//     isReady() {
//         return this.#imageParsed;
//     }
// }

// export class ChocoWinPngJsPixelWriter extends ChocoWinAbstractPixelWriter {
//     /** @type {PNG} */ #png;
//     /** @type {function(new:PNG)} */ #pngClass;
//     /** @type {Promise} */ #alwaysResolved;

//     /**
//      * @param {function(new:PNG)} pngClass;
//      * @param {Number} width
//      * @param {Number} height
//      */
//     constructor(width, height, pngClass) {
//         super();
//         this.#pngClass = pngClass;
//         this.#png = new this.#pngClass();
//         this.#png.width = width;
//         this.#png.height = height;
//         this.#png.data = new Uint8Array(this.#png.width * this.#png.height * 4);
//         this.#alwaysResolved = new Promise((resolve) => resolve(this));
//     }

//     writePixel(coordinate, color) {
//         const i = 4 * (coordinate.x + coordinate.y * this.#png.width);

//         // if (0 < color.a && color.a < 255) {
//             // For a better imlpementation, see https://arxiv.org/pdf/2202.02864.
//             // See https://stackoverflow.com/a/10768854/1102726.
//             // oh, no, though: what if nothing has been written yet? in that case, this array's gonna contain zero and you should go make breakfast
//             // no, that scenario is okay! you can check if alpha is 0, but THEN you have the scenario of 0<alpha<255.
//             this.#png.data[i + 0] = ((this.#png.data[i + 0] * (255 - (color.a ?? 255)) / 255) + color.r * (color.a ?? 255) / 255)
//             this.#png.data[i + 1] = ((this.#png.data[i + 1] * (255 - (color.a ?? 255)) / 255) + color.g * (color.a ?? 255) / 255)
//             this.#png.data[i + 2] = ((this.#png.data[i + 2] * (255 - (color.a ?? 255)) / 255) + color.b * (color.a ?? 255) / 255)
//         // }
//         // else if (color.a ?? 255 >= 255) {
//         //     this.#png.data[i + 0] = color?.r ?? 0;
//         //     this.#png.data[i + 1] = color?.g ?? 0;
//         //     this.#png.data[i + 2] = color?.b ?? 0;
//         // }
        
//         // const makeOpaque = (255 == this.#png.data[i + 3]) || (255 == (color?.a ?? 255));
//         // const makeTransparent = (0 == this.#png.data[i + 3]) && (0 == (color?.a ?? 0));

//         // if (makeOpaque) {
//         //     this.#png.data[i + 3] = 255;
//         // }
//         // else if (makeTransparent) {
//         //     this.#png.data[i + 3] = 0;
//         // }
//         // else {
//             const remainingAlpha = 255 - this.#png.data[i + 3];
//             const colorAlphaContribution = Math.round((color.a ?? 255) / 255.0 * remainingAlpha);
//             this.#png.data[i + 3] = this.#png.data[i + 3] + colorAlphaContribution;
//         // }
//     }

//     makeDataUrl() {
//         const buffer = this.#pngClass.sync.write(this.#png);
//         const uint8Array = new Uint8Array(buffer);
//         const binaryString = String.fromCharCode(...uint8Array);
//         const base64 = window.btoa(binaryString);

//         return `data:image/png;base64,${base64}`;
//     }

//     makeBlob() {
//         const buffer = this.#pngClass.sync.write(this.#png);
//         const blob = new Blob([buffer], { type: 'image/png' });
//         return blob;
//     }

//     /**
//      * @return {Promise}
//      */
//     isReady() {
//         return this.#alwaysResolved;
//     }

//     /**
//      * @return {Number}
//      */
//     get width() {
//         return this.#png.width;
//     }

//     /**
//      * @return {Number}
//      */
//     get height() {
//         return this.#png.height;
//     }
// }

// export class ChocoWinPngJsPixelWriterFactory extends ChocoWinAbstractPixelWriterFactory {
//     /** @type {function(new:PNG)} */ pngClass;

//     /**
//      * @param {function(new:PNG)} pngClass
//      */
//     constructor(pngClass) {
//         // See https://stackoverflow.com/a/45438239 for info on the JsDoc
//         super();
//         this.pngClass = pngClass;
//     }

//     /**
//      * @type {Number} width
//      * @type {Number} height
//      * @returns {ChocoWinAbstractPixelWriter}
//      */
//     build(width, height) {
//         return new ChocoWinPngJsPixelWriter(width, height, this.pngClass);
//     }
// }

// export class ChocoWinPngJsPixelReaderFactory extends ChocoWinAbstractPixelReaderFactory {
//     /** @type {function(new:PNG)} */ #pngClass;

//     /**
//      * @param {function(new:PNG)} pngClass Function that return a PNG.
//      */
//     constructor(pngClass) {
//         super();
//         this.#pngClass = pngClass;
//     }

//     /**
//      * @param {Object} args
//      * @param {Blob} args.blob Will be prioritized over the data URL version.
//      * @param {String} args.dataUrl
//      * @return {ChocoWinAbstractPixelReader}
//      */
//     build({ blob, dataUrl }) {
//         const myPng = new this.#pngClass();

//         if (!blob) {
//             blob = pngBase64DataUrlToBlob(dataUrl);
//         }

//         blob.arrayBuffer().then(buffer => myPng.parse(buffer))

//         return new ChocoWinPngJsPixelReader(myPng);
//     }
// }