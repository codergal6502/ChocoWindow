import { ChocoStudioWindowRegionDefinition } from "./ChocoStudio";

/**
 * @param {*} value 
 * @returns {Number}
 */
export const makeCountingNumber = (value) => {
    let number = Math.round(value);
    if (number < 1) {
        number = 1;
    }
    return number;
}

/**
 * @param {*} obj 
 * @returns {Boolean}
 */
export const isNumber = (obj) => typeof 0 == typeof obj;

/**
 * @param {T} obj 
 * @returns {T}
 * @template T
 */
export const JsonClone = (obj) => 
    // See https://developer.mozilla.org/en-US/docs/Glossary/Falsy
    ((obj === null) || (obj === undefined) || (obj === false) || (obj === 0) || (obj === -0) || (obj === 0n) || (obj === -0n) || (obj === ""))
        ? obj
        : JSON.parse(JSON.stringify(obj));

/**
 * @param {{ [key: string]: ChocoStudioWindowRegionDefinition}} regionDictionary;
 */
export const CloneRegionDictionary = (regionDictionary) => 
    Object.fromEntries(
        Object.keys(regionDictionary).map(key => [
            key,
            new ChocoStudioWindowRegionDefinition(regionDictionary[key])
        ])
    )