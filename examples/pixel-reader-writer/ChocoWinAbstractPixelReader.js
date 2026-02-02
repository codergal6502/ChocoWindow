import { ChocoColor, ChocoRectangle } from "./ChocoWindow.js";

/**
 * @interface
 */
class ChocoWinAbstractPixelReader {
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
class ChocoWinAbstractPixelWriter {
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
}

class ChocoWinRegionPixelReader extends ChocoWinAbstractPixelReader {
    /** @param {ChocoWinAbstractPixelReader} */ #reader;
    /** @param {ChocoRectangle} */ #region;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {ChocoRectangle} region
     */
    constructor(reader, region) {
        super();
        this.#reader = reader;
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
        return this.#reader.getPixel({ x: this.#region.x + coordinate.x, y: this.#region.y + coordinate.y });
    }

    /**
     * @return {Promise<ChocoWinAbstractPixelReader>}
     */
    isReady() {
        return this.#reader.isReady();
    }
}

/**
 * Rotates in 90º increments.
 */
class ChocoWinRotatePixelReader extends ChocoWinAbstractPixelReader {
    /** @param {ChocoWinAbstractPixelReader} */ #reader;
    /** @param {Number} */ #rotationCount;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {Number} rotationCount
     */
    constructor(reader, rotationCount) {
        super();
        this.#reader = reader;
        this.#rotationCount = Math.round(rotationCount ?? 0) % 4;
    }

    /**
     * @return {Number}
     */
    get width() {
        switch (this.#rotationCount) {
            case 0: case 2: default: return this.#reader.width;
            case 1: case 3: return this.#reader.height;
        }
    }

    /**
     * @return {Number}
     */
    get height() {
        switch (this.#rotationCount) {
            case 0: case 2: default: return this.#reader.height;
            case 1: case 3: return this.#reader.width;
        }
    }

    /**
     * @param {ChocoCoordinates} coordinate
     * @return {ChocoColor}
     */
    getPixel(coordinate) {
        switch (this.#rotationCount) {
            case 0: default:
                return this.#reader.getPixel(coordinate);
            case 1:
                // {0, 0} -> { 0, h }
                // {h, 0} => { 0, 0 }
                // {h, w} => { w, 0 }
                // {0, w} => { w, h }
                return this.#reader.getPixel({ x: coordinate.y, y: this.#reader.height - coordinate.x });
            case 2:
                return this.#reader.getPixel({ x: this.#reader.width - coordinate.x, y: this.#reader.height - coordinate.y });
            case 3:
                // {0, 0} -> { w, 0 }
                // {h, 0} => { 0, 0 }
                // {h, w} => { 0, h }
                // {0, w} => { w, h }
                return this.#reader.getPixel({ x: this.#reader.width - coordinate.y, y: coordinate.x });
        }
    }

    /**
     * @return {Promise<ChocoWinAbstractPixelReader>}
     */
    isReady() {
        return this.#reader.isReady();
    }
}

/**
 * @typedef {String} ReflectionTypes
 **/

/**
 * @enum {ReflectionTypes}
 */
const ChocoWinReflectionTypes = Object.freeze({
    HORIZONTAL: "HORIZONTAL",
    VERTICAL: "VERTICAL",
    ASCENDING: "ASCENDING",
    DESCENDING: "DESCENDING",
    POINT: "POINT",
})

/**
 * Reflects.
 */
class ChocoWinReflectionPixelReader extends ChocoWinAbstractPixelReader {
    /** @param {ChocoWinAbstractPixelReader} */ #reader;
    /** @param {ReflectionTypes} */ #reflectionType;

    /**
     * @param {ChocoWinAbstractPixelReader} reader
     * @param {Object} reflections
     * @param {ReflectionTypes} reflectionType
     */
    constructor(reader, reflectionType) {
        super();
        this.#reader = reader;
        this.#reflectionType = reflectionType;
    }

    /**
     * @return {Number}
     */
    get width() {
        return this.#reader.width;
    }

    /**
     * @return {Number}
     */
    get height() {
        return this.#reader.height;
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
                x = this.#reader.width - coordinate.x;
                break;
            }
            case ChocoWinReflectionTypes.ASCENDING:
                x = this.#reader.width - coordinate.y;
                break;
            case ChocoWinReflectionTypes.DESCENDING:
                x = coordinate.y;
                break;
        }

        switch (this.#reflectionType) {
            case ChocoWinReflectionTypes.VERTICAL: case ChocoWinReflectionTypes.POINT: {
                y = this.#reader.height - coordinate.y;
                break;
            }
            case ChocoWinReflectionTypes.ASCENDING:
                y = this.#reader.height - coordinate.x;
                break;
            case ChocoWinReflectionTypes.DESCENDING:
                y = coordinate.x;
                break;
        }

        return this.#reader.getPixel({ x, y });
    }

    /**
     * @return {Promise<ChocoWinAbstractPixelReader>}
     */
    isReady() {
        return this.#reader.isReady();
    }
}

export { ChocoWinAbstractPixelReader, ChocoWinAbstractPixelWriter, ChocoWinRegionPixelReader, ChocoWinRotatePixelReader, ChocoWinReflectionPixelReader, ChocoWinReflectionTypes }