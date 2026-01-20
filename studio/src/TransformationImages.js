import { Canvas, Rect, Textbox } from "fabric";
import { createContext } from "react";
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter, ChocoWinPngJSPixelWriterFactory } from "./ChocoWinPngJsReaderWriter";
import { ChocoWinReflectionPixelReader, ChocoWinReflectionTypes, ChocoWinRotatePixelReader } from "./ChocoWindow";

// See https://stackoverflow.com/a/13983150 for info on the lifespan of URLs created with URL.toObjectUrl(blob)

export class TransformationImageSet {
    get NullTransformationLightImage() {
        throw "abstract class"
    }

    /**
     * @returns {Promise<{isDark: Boolean, transformationName: String, url: Boolean}>}
     */
    isReady() {
        throw "abstract class"
    }
}

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

class TransformationImageSetImpl extends TransformationImageSet {
    #size = 48;
    /** @type {Promise} */ #isReadyPromise;

    constructor() {
        super();
        const nullLightBlobPromise = this.#renderNullTransformationImage(false);
        const nullDarkBlobPromise = this.#renderNullTransformationImage(true);

        /**
         * 
         * @param {Object} args
         * @param {Boolean} args.isDark
         * @param {String} args.transformationName
         * @param {ChocoWinAbstractPixelReader} args.reader
         * @returns 
         */
        const doTheThing = ({ reader, isDark, transformationName }) => {
            const result = {
                promise: new Promise(resolve => {
                    reader.isReady().then(r => {
                        const writer = new ChocoWinPngJsPixelWriter(this.#size, this.#size);
                        writer.writeAll(r);
                        const url = URL.createObjectURL(writer.makeBlob());
                        resolve({ isDark, transformationName: transformationName, url });
                    });
                })
            }
            result.promise.then(url => result.url = url);
            return result;
        }

        this.#isReadyPromise = Promise.all([nullDarkBlobPromise, nullLightBlobPromise]).then(baseImages => {
            const ret = Promise.all(baseImages.map(baseImage => {

                const baseUrl = URL.createObjectURL(baseImage.blob);
                const reader = new ChocoWinPngJsPixelReaderFactory().build({ blob: baseImage.blob });

                const rotate90 = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.ROTATE_90, reader: new ChocoWinRotatePixelReader(reader, 1) });
                const rotate180 = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.ROTATE_180, reader: new ChocoWinRotatePixelReader(reader, 2) });
                const rotate270 = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.ROTATE_270, reader: new ChocoWinRotatePixelReader(reader, 3) });
                const reflectHorizontal = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.REFLECT_HORIZONTAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.HORIZONTAL) });
                const reflectVertical = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.REFLECT_VERTICAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.VERTICAL) });
                const reflectAscending = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.REFLECT_ASCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.ASCENDING) });
                const reflectDescending = doTheThing({ isDark: baseImage.isDark, transformationName: TileTransformationTypes.REFLECT_DESCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.DESCENDING) });

                const ret = Promise.all([
                    new Promise((resolve) => resolve({ isDark: baseImage.isDark, transformationName: "base", url: baseUrl })),
                    rotate90.promise,
                    rotate180.promise,
                    rotate270.promise,
                    reflectHorizontal.promise,
                    reflectVertical.promise,
                    reflectAscending.promise,
                    reflectDescending.promise,
                ])

                return ret;
            }));

            return ret;
        }).then(nonFlat => nonFlat.flat()) // See https://stackoverflow.com/a/59929655/1102726
    }

    isReady() {
        return this.#isReadyPromise;
    }

    /**
     * @param {Boolean} isDark 
     * @returns {Promise<{blob: Blob, isDark: Boolean}>}
     */
    #renderNullTransformationImage(isDark) {
        return new Promise((resolve) => {
            const canvas = new Canvas('canvas', {
                width: this.#size,
                height: this.#size
            });

            const rect = new Rect({
                fill: isDark ? "#111" : "#EEE",
                width: this.#size,
                height: this.#size,
                left: this.#size / 2,
                top: this.#size / 2,
                strokeWidth: 0,
            })

            const text = new Textbox('A', {
                fontSize: this.#size,
                fontFamily: 'Courier New',
                left: this.#size / 2,
                top: this.#size / 2,
                originX: 'center',
                originY: 'center',
                textAlign: 'center',
                width: this.#size,
                height: this.#size,
                fill: isDark ? "#EEE" : "#111",
                padding: 0,
                strokeWidth: 0,
            });

            canvas.add(rect);
            canvas.add(text);
            canvas.renderAll();

            canvas.toBlob().then((blob) => {
                resolve({ blob, isDark });
            });
        });
    }
}

const /** @type {TransformationImageSet} */ myTransformationImages = new TransformationImageSetImpl();
export const TransformationImages = createContext(myTransformationImages);
