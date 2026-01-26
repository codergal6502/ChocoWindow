import { useContext, useEffect, useRef, useState } from "react";
import { CHOCO_WINDOW_REGIONS, ChocoStudioTileSetDefinition, ChocoStudioTileSheetBlobUrlManager } from "../../../ChocoStudio";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { TileSheetBlobUrlDictionary } from '../../SettingsModal';
import './WindowRegionDefinition.css'
import { ChocoWinAbstractPixelReader } from "../../../ChocoWindow";
import { ChocoWinPngJSPixelWriterFactory } from "../../../ChocoWinPngJsReaderWriter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faK, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

/**
 * Directly modifies the provided tile set definition.
 * @param {object} props 
 * @param {number} props.tileSize
 * @param {{width: number, height: number}} props.sheetSize
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {Object} props.assignmentFromUser
 * @param {Function} props.onTileSetDefinitionChange
 */
const WindowRegionDefinition = ({ tileSetDefinition, sheetSize, tileSize, assignmentFromUser, onTileSetDefinitionChange }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                        CONSTANTS & GLOBALS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const DEFAULT_TA_SCALE = 3;
    const BIGGEST_ZOOM_FACTOR = 6;
    const SELECTED_TILE_BLOB_KEY = "SELECTED_TILE_BLOB_KEY";
    const writerFactory = new ChocoWinPngJSPixelWriterFactory();

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                    STATE, REF & CONTEXT HOOKS                        //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    /** @type {ReturnType<typeof useRef<HTMLDivElement>>} */
    const tileAssignmentContainerRef = useRef(null);
    /** @type {ReturnType<typeof useRef<HTMLStyleElement>>} */
    const styleRef = useRef(null);
    /** @type {ReturnType<typeof useContext<ChocoStudioTileSheetBlobUrlManager>>} */

    const [helpVisibile, setHelpVisible] = useState(true);
    const [regionIdentifier, setRegionIdentifier] = useState(CHOCO_WINDOW_REGIONS.TOP_LEFT);
    const [regionWidth, setRegionWidth] = useState(1);
    const [regionHeight, setRegionHeight] = useState(1);
    const [assignmentTileScale, setAssignmentTileScale] = useState(DEFAULT_TA_SCALE);
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());
    const [selectedTile, setSelectedTile] = useState({ x: 0, y: 0 });
    const [tileAssignments, setTileAssignments] = useState([]);
    const [isAssignThisReady, setIsAssignThisReady] = useState(false);
    const [lastAssignThisButtonClick, setLastAssignThisButtonClick] = useState(Date.now());

    /** @type {ReturnType<typeof useRef<Map<String, String>>>} */
    const tileBlobUrlMap = useRef(new Map());

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {String} identifer 
     * @param {number} regionLocationX 
     * @param {number} regionLocationY 
     */
    const computeTileBlobKey = (identifer, regionLocationX, regionLocationY) => {
        return `${identifer}-${regionLocationX}-${regionLocationY}`
    }

    /**
     * @param {CSSStyleSheet} styleSheet 
     * @param {string} selectorText 
     * @param {string} ruleText 
     */
    const replaceRule = (styleSheet, selectorText, ruleText) => {
        /** @type {CSSStyleRule[]} */
        const ruleArray = Array.from(styleSheet.cssRules);
        const oldRuleIndex = ruleArray.findIndex(r => r.selectorText == selectorText);
        if (oldRuleIndex >= 0) { styleSheet.deleteRule(oldRuleIndex) };

        styleSheet.insertRule(ruleText);
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // read the selected tile
    useEffect(() => {
        if (styleRef?.current && tileBlobUrlMap?.current && assignmentFromUser?.reader?.isReady) {
            setIsAssignThisReady(false);
            assignmentFromUser.reader.isReady().then(/** @param {ChocoWinAbstractPixelReader} r */ r => {
                const tileBlobKey = SELECTED_TILE_BLOB_KEY;
                const writer = writerFactory.build(r.width, r.height);
                writer.writeAll(r);

                if (tileBlobUrlMap.current.has(tileBlobKey)) {
                    URL.revokeObjectURL(tileBlobUrlMap.current.get(tileBlobKey));
                }

                const tileUrl = URL.createObjectURL(writer.makeBlob());
                tileBlobUrlMap.current.set(tileBlobKey, tileUrl);

                const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;
                const selectorText = "div.assign-this-tile";
                const ruleText = `${selectorText} { background-image: url(${tileUrl}); }`;

                replaceRule(styleSheet, selectorText, ruleText);
                setIsAssignThisReady(true);
            })
        }
    }, [tileBlobUrlMap, styleRef, assignmentFromUser])

    // resize the tile assignment container
    useEffect(() => {
        if (!tileAssignmentContainerRef && regionWidth) return;
        // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.

        const possibleScale = Math.floor(tileAssignmentContainerRef.current.offsetWidth / regionWidth / tileSize);
        const assignmentTileScale = Math.min(BIGGEST_ZOOM_FACTOR, possibleScale);
        setAssignmentTileScale(assignmentTileScale);
    }, [tileAssignmentContainerRef, lastResizeTimestamp])

    // resize event handler to force a pixel grid resize
    useEffect(() => {
        // See https://www.geeksforgeeks.org/reactjs/react-onresize-event/
        // See https://react.dev/reference/react/useEffect#parameters

        const onResize = () => {
            setLastResizeTimestamp(Date.now());
        }

        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [])

    // assign the selected tile to the region position
    useEffect(() => {
        if (isAssignThisReady && styleRef?.current && tileBlobUrlMap?.current) {
            const tileBlobKey = computeTileBlobKey(regionIdentifier, selectedTile.x, selectedTile.y);
            /** @type {ChocoWinAbstractPixelReader} */ const reader = assignmentFromUser.reader;
            const writer = writerFactory.build(reader.width, reader.height);
            writer.writeAll(reader);

            if (tileBlobUrlMap.current.has(tileBlobKey)) {
                URL.revokeObjectURL(tileBlobUrlMap.current.get(tileBlobKey));
            }

            const tileUrl = URL.createObjectURL(writer.makeBlob());
            tileBlobUrlMap.current.set(tileBlobKey, tileUrl);

            const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;

            const selectorText = `label.region-tile-radio.${tileBlobKey}`;
            const ruleText = `${selectorText} { background-image: url(${tileUrl}); }`;

            replaceRule(styleSheet, selectorText, ruleText);

            const tileSheetPositions = tileSetDefinition.regions[regionIdentifier].tileSheetPositions;
            if (!tileSheetPositions[selectedTile.y]) { tileSheetPositions[selectedTile.y] = []; }

            tileSheetPositions[selectedTile.y][selectedTile.x] = {
                x: assignmentFromUser.x,
                y: assignmentFromUser.y,
                geometricTransformation: assignmentFromUser.geometricTransformation,
                transparencyOverrides: assignmentFromUser.transparencyOverrides,
            };

            onTileSetDefinitionChange(tileSetDefinition);
        }
    }, [isAssignThisReady, lastAssignThisButtonClick, styleRef, tileBlobUrlMap])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const toggleHelp = () => setHelpVisible(!helpVisibile);

    /**
     * @param {Object} e 
     * @param {HTMLSelectElement} e.target
     */
    const onWindowRegionIdentifierChange = (e) => {
        const identifier = e.target.value
        setRegionIdentifier(identifier);
        setRegionWidth(tileSetDefinition.regions[identifier].width);
        setRegionHeight(tileSetDefinition.regions[identifier].height);
        // TODO!!! rename TileSetDefinition....tileSheet~~Position~~ to assigments, and x/y to tileSheetPixelX, tileSheetPixelY
        setTileAssignments(
            Array.from(tileSetDefinition.regions[identifier].width).map((_, x) => {
                return Array.from(tileSetDefinition.regions[identifier].height).map((_, y) => {
                    const oldAssignment = tileSetDefinition.regions[identifier].tileSheetPositions[x]?.[y];
                    const assignment = {
                        x: oldAssignment?.x ?? 0,
                        y: oldAssignment?.y ?? 0,
                        geometricTransformation: oldAssignment?.geometricTransformation ?? [],
                        transparencyOverrides: oldAssignment?.transparencyOverrides ?? []
                    };

                    return assignment;
                })
            })
        )
    }

    /**
     * 
     * @param {{x: number, y: number, geometricTransformation: string, transparencyOverrides: []}[][]} tileSheetPositions 
     * @param {*} height 
     * @param {*} width 
     */
    const resizeTileSheetPositions = (tileSheetPositions, height, width) => {
        tileSheetPositions.splice(height);
        Array.from(Array(height)).forEach((_, rowIndex) => {
            let row = tileSheetPositions[rowIndex];
            if (!row) {
                row = [];
                tileSheetPositions[rowIndex] = row;
            }
            row.splice(width);

            if (row.length < width) {
                row = row.concat(Array(width - row.length).map(() => { }))
            }
        })
    }

    /**
     * @param {Object} e 
     * @param {HTMLInputElement} e.target
     */
    const onRegionWidthChange = (e) => {
        const width = Number(e.target.value);
        if (width == e.target.value && width > 0) {
            setRegionWidth(width);
            tileSetDefinition.regions[regionIdentifier].width = width;
            resizeTileSheetPositions(tileSetDefinition.regions[regionIdentifier].tileSheetPositions, regionHeight, width);
        }
    }

    /**
     * @param {Object} e 
     * @param {HTMLInputElement} e.target
     */
    const onRegionHeightChange = (e) => {
        const height = Number(e.target.value);
        if (height == e.target.value && height > 0) {
            setRegionHeight(height);
            tileSetDefinition.regions[regionIdentifier].height = height;
            resizeTileSheetPositions(tileSetDefinition.regions[regionIdentifier].tileSheetPositions, height, regionWidth);
        }
    }

    /**
     * @param {Object} e
     * @param {HTMLInputElement} e.target
     */
    const regionTileRadioOnChange = (e) => {
        const label = e.target.parentElement;
        const otherLabels = Array.from(label.parentElement.children).filter(l => l != label);

        otherLabels.forEach(l => l.classList.remove("region-tile-selected"));
        label.classList.add("region-tile-selected");

        setSelectedTile({ x: Number(e.target.dataset.x), y: Number(e.target.dataset.y) });
    }


    /**
     * @param {Object} e 
     * @param {HTMLButtonElement} e.target
     */
    const onAssignTileButtonClick = (e) => {
        // It's conceivable that this button might get clicked between the
        // reader for the tile getting set and the tile getting read, so
        // this timestamp trick is used to assign the the tile.
        setLastAssignThisButtonClick(Date.now());
    }

    return (<>
        <h3 className="mb-1 text-xl font-bold">Window Region Definition {helpVisibile || <a href="#" onClick={toggleHelp} className="text-xs font-normal text-blue-900 dark:text-blue-100 py-1 hover:underline italic">show help</a>}</h3>
        {helpVisibile && <p className="mb-2 text-sm mx-6">
            <span><span className="italic">First,</span> select a window region to define tiles for. <span className="italic">Second,</span> click on the tile location in the selected region. <span className="italic">Third,</span> change the tile selection, transformation, and transparent pixels below.</span>
            &nbsp;<a href="#" onClick={toggleHelp} className="text-xs text-blue-900 dark:text-blue-100 py-1 hover:underline italic">hide help</a>
        </p>}

        <div className={`grid grid-cols-10 gap-4`}>
            <div className="col-span-4 w-full">
                <label htmlFor="fca684ea-2f2e-459a-ae5c-99e602f3d57e">Window Region:</label>
                <select className={TAILWIND_INPUT_CLASS_NAME} id="fca684ea-2f2e-459a-ae5c-99e602f3d57e" value={regionIdentifier} onChange={onWindowRegionIdentifierChange}>
                    <option value={CHOCO_WINDOW_REGIONS.TOP_LEFT}>Top-Left Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.TOP}>Top Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.TOP_RIGHT}>Top-Right Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.LEFT}>Left Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.CENTER}>Center</option>
                    <option value={CHOCO_WINDOW_REGIONS.RIGHT}>Right Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM_LEFT}>Bottom-Left Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM}>Bottom Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT}>Bottom-Right Corner</option>
                </select>
            </div>
            <div className="w-full col-span-2">
                <label htmlFor="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961">Width (tiles)</label>
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.TOP || regionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM || regionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionWidth} onChange={onRegionWidthChange} />}
                {(regionIdentifier != CHOCO_WINDOW_REGIONS.TOP && regionIdentifier != CHOCO_WINDOW_REGIONS.BOTTOM && regionIdentifier != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
            </div>
            <div className="w-full col-span-2">
                <label htmlFor="7ae42bae-9eeb-4491-be31-00161a3af632">Height (tiles)</label>
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.LEFT || regionIdentifier == CHOCO_WINDOW_REGIONS.RIGHT || regionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionHeight} onChange={onRegionHeightChange} />}
                {(regionIdentifier != CHOCO_WINDOW_REGIONS.LEFT && regionIdentifier != CHOCO_WINDOW_REGIONS.RIGHT && regionIdentifier != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
            </div>
            <div className="col-span-10 -mt-4">
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.TOP_LEFT || regionIdentifier == CHOCO_WINDOW_REGIONS.TOP_RIGHT || regionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM_LEFT || regionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT) && <p className="mb-2 text-sm italic">Corners can only be 1 tile wide and 1 tile high.</p>}
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.TOP || regionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM) && <p className="mb-2 text-sm italic">Top and bottom edge pattern can be any number of tiles wide.</p>}
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.LEFT || regionIdentifier == CHOCO_WINDOW_REGIONS.RIGHT) && <p className="mb-2 text-sm italic">Left and right edge pattern can be any number of tiles wide.</p>}
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <p className="mb-2 text-sm italic">The center repeated pattern can be any number of tiles wide or high.</p>}
            </div>
        </div>
        <div
            ref={tileAssignmentContainerRef}
            className="mb-4 w-full"
            style={{
                '--region-width': regionWidth,
                '--region-height': regionHeight,
                '--tile-size': `${tileSetDefinition.tileSize}px`,
                '--tile-sheet-scale': assignmentTileScale,
            }}
        >
            <h4 className="mb-1 font-bold">Tile Assignment</h4>
            <style ref={styleRef} />
            <div className="grid grid-cols-6">
                <div className="assign-this-tile"></div>
                <div className="">
                    <button onClick={onAssignTileButtonClick}>
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-3xl" />
                        <span className="sr-only">Assign to Region  Tile</span>
                    </button>
                </div>
                <div className="region-tile-container col-span-4">
                    {
                        Array.from({ length: regionHeight || 1 }).map((_, y) =>
                            Array.from({ length: regionWidth || 1 }).map((_, x) =>
                                <label
                                    className={`${computeTileBlobKey(regionIdentifier, x, y)} region-tile-radio ${(selectedTile.x == x && selectedTile.y == y) ? "region-tile-selected" : ""}`}
                                    style={{
                                        "--tile-sheet-top-pixel-x": `${tileAssignments?.[x]?.[y]?.x ?? 0}px`,
                                        "--tile-sheet-top-pixel-y": `${tileAssignments?.[x]?.[y]?.y ?? 0}px`,
                                    }}
                                    key={`transparency-pixel-${x}-${y}`}
                                >
                                    <input
                                        name="selected-region-tile"
                                        className='sr-only'
                                        type="radio"
                                        onChange={regionTileRadioOnChange} data-x={x} data-y={y}
                                        checked={selectedTile.x == x && selectedTile.y == y}
                                    />
                                </label>
                            ))
                    }
                </div>
            </div>
        </div>


    </>)
}

export default WindowRegionDefinition;