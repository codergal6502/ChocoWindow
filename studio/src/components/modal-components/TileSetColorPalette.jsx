import "@melloware/coloris/dist/coloris.css";

import { useEffect, useRef, useState } from "react";
import { areColorsSame, ChocoStudioComputedColorPalette, ChocoStudioWindowRegionDefinition, TEMP_stringifyColorSubstitutions } from "../../ChocoStudio";
import { ChocoColor, ChocoWinAbstractPixelReader } from "../../ChocoWindow";
import Coloris from "@melloware/coloris";

/**
 * @param {object} props
 * @param {ChocoWinAbstractPixelReader} props.tileSheetReader
 * @param {object.<string, ChocoStudioWindowRegionDefinition>} props.regions
 * @param {number} props.tileSize
 * @param {Boolean} props.allowModifications
 * @param {Array<{defaultColor: ChocoColor, substituteColor: ChocoColor}} props.colorSubstitutions
 * @param {function({defaultColor: ChocoColor, substituteColor: ChocoColor}[]):void} props.onChange
 */
const TileSetColorPalette = ({ tileSheetReader, regions, tileSize, allowModifications = false, colorSubstitutions = null, onChange = null }) => {
    /** @type {ReturnType<typeof useState<ChocoColor[]>>} */
    const [defaultColors, setDefaultColors] = useState(null);
    /** @type {ReturnType<typeof useRef<HTMLStyleElement>>} */
    const styleRef = useRef(null);
    /** @type {ReturnType<typeof useRef<ReturnType<typeof setTimeout>>>} */
    const debounceTimeoutRef = useRef(null);
    /** @type {ReturnType<typeof useRef<HTMLElement>>} */
    const divRef = useRef(null);

    // without these two, colorSubstitutions in handleColorSubstitution is always one render behind.
    const [colorisFixColorSubstitute, setColorisFixColorSubstitute] = useState();
    useEffect(() => { if (colorisFixColorSubstitute) handleColorSubstitution(colorisFixColorSubstitute); }, [colorisFixColorSubstitute]);

    /**
     * @param {{defaultColor: ChocoColor, substituteColor: ChocoColor}} colorSubstitution 
     */
    const handleColorSubstitution = (colorSubstitution) => {
        const newColorSubstitutions = colorSubstitutions.map(sc => ({ defaultColor: new ChocoColor(sc.defaultColor), substituteColor: new ChocoColor(sc.substituteColor) }));

        let newSpecificSubstitution = newColorSubstitutions.find(c => areColorsSame(colorSubstitution.defaultColor, c.defaultColor));
        if (!newSpecificSubstitution) {
            newSpecificSubstitution = { defaultColor: colorSubstitution.defaultColor };
            newColorSubstitutions.push(newSpecificSubstitution);
        }
        newSpecificSubstitution.substituteColor = colorSubstitution.substituteColor;

        onChange(newColorSubstitutions);
    }

    /**
     * This is never called if Coloris is being used.
     * @param {HTMLElement} target 
     */
    const onDirectColorChange = (target) => {
        const colorSubstitution = {
            defaultColor: new ChocoColor(target.dataset.originalColor),
            substituteColor: new ChocoColor(target.value)
        };
        handleColorSubstitution(colorSubstitution);
    }

    /**
     * @param {{defaultColor: ChocoColor, substituteColor: ChocoColor}} colorSubstitution
     */
    const debounceColorPicker = (colorSubstitution) => {
        if (debounceTimeoutRef) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = setTimeout(() => {
                setColorisFixColorSubstitute(colorSubstitution);
            }, 125);
        }
    };

    // set up the coloris:pick handler.
    useEffect(() => {
        const colorisHandler = (event) => {
            const colorSubstitution = {
                defaultColor: new ChocoColor(event.detail.currentEl.dataset.originalColor),
                substituteColor: new ChocoColor(event.detail.color)
            };
            debounceColorPicker(colorSubstitution);
        };

        document.addEventListener('coloris:pick', colorisHandler);

        return () => {
            document.removeEventListener('coloris:pick', colorisHandler);
            Coloris({ parent: null });
        }
    }, [])

    // check for the div containing the color inputs every rerender
    useEffect(() => {
        if (divRef.current) {
            Coloris({ parent: divRef.current.closest('.choco-coloris-container') });
        }
    } /* no dependency array, not even an empty one */)

    /**
     * @param {ChocoColor} defaultColor 
     * @returns {ChocoColor}
     */
    const getSubstituteColor = (defaultColor) => {
        if (allowModifications && defaultColor) {
            const foundColor = colorSubstitutions?.find(cs => cs && areColorsSame(cs.defaultColor, defaultColor));

            if (foundColor) {
                return foundColor.substituteColor;
            }
        }
        return defaultColor;
    }

    // recompute the color palette 
    useEffect(() => {
        if (!tileSheetReader) return;

        new ChocoStudioComputedColorPalette({
            tileSheetReader: tileSheetReader,
            regions: regions,
            tileSize: tileSize,
        }).isReady().then(newColorPalette => {
            setDefaultColors(newColorPalette)
        })
    }, [regions, tileSize, tileSheetReader]);

    // update the styles for the color picker backgrounds
    useEffect(() => {
        if (defaultColors && styleRef?.current) {
            const styleSheet = styleRef.current.sheet;
            while (styleSheet.cssRules.length) {
                styleSheet.deleteRule(0);
            }

            for (let idx in defaultColors) {
                const leftColor = defaultColors[idx];
                const rightColor = getSubstituteColor(leftColor);

                const newRule = `.color-gradient-${idx} { background-image: linear-gradient(165deg, ${leftColor.toHexString()} 45%, ${rightColor.toHexString()} 55%) }`;
                styleSheet.insertRule(newRule);
            }
        }
    }, [defaultColors, colorSubstitutions, styleRef])

    /**
     * @param {ChocoColor} defaultColor 
     */
    const onResetClicked = (defaultColor) => {
        const newColorSubstitutions = colorSubstitutions.map(sc => ({
            defaultColor: new ChocoColor(sc.defaultColor),
            substituteColor: new ChocoColor(sc.substituteColor)
        }));

        let index;
        while (0 <= (index = newColorSubstitutions.findIndex(c => areColorsSame(defaultColor, c.defaultColor)))) {
            newColorSubstitutions.splice(index, 1);
        }

        onChange(newColorSubstitutions);
    }

    return (defaultColors && <>
        <style ref={styleRef} />
        <h3 className="mb-2 mt-4 text-xl">Color Palette</h3>
        {/* See https://stackoverflow.com/a/56541442 */}
        {/* <div className={`grid grid-cols-3 gap-4`} ref={el => { console.log("div is ", el); divRef.current = el; }}> */}
        <div className={`grid grid-cols-3 gap-4`} ref={divRef}>
            {defaultColors.map((defaultColor, i) =>
                <div key={i}>
                    <div className={`text-sm w-full text-center`}>Color {i + 1}: <span className="text-sm italic font-mono">{defaultColor.toHexString({ includeAlpha: true })}</span></div>
                    <div className={`min-h-8 rounded-lg flex justify-center color-gradient-${i}`}>
                        {allowModifications && <>
                            <button
                                className="w-1/2 text-sm rounded-md text-shadow-lg bg-[#88888888] border outline-[#22222288] dark:outline-[#BBBBBB88] text-center m-2 p-1"
                                onClick={() => onResetClicked(defaultColor)}
                            >Reset</button>
                            <input
                                data-original-color={defaultColor.toHexString()}
                                data-index={i}
                                className="w-1/2 text-sm rounded-md text-shadow-lg bg-[#88888888] border outline-[#22222288] dark:outline-[#BBBBBB88] text-center m-2 p-1"
                                value={getSubstituteColor(defaultColor).toHexString({ includeAlpha: true })}
                                onChange={(e) => { onDirectColorChange(e.target); }}
                                data-coloris
                            />
                        </>}
                    </div>
                </div>
            )}
        </div>
    </>)
}

export default TileSetColorPalette;