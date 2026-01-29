import { useContext, useEffect, useRef, useState } from "react";
import { CHOCO_WINDOW_REGIONS, ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioTileSheetBlobUrlManager, ChocoStudioWindowRegionTileAssignment, ChocoStudioWindowRegionTileAssignmentArray } from "../../../ChocoStudio";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { TileSheetBlobUrlDictionary } from '../../SettingsModal';
import './WindowRegionDefinition.css'
import { ChocoWinAbstractPixelReader, ChocoWinRectangle, ChocoWinRegionPixelReader, WrapReaderForTileTransformation } from "../../../ChocoWindow";
import { ChocoWinPngJSPixelWriterFactory } from "../../../ChocoWinPngJsReaderWriter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { AssignableTileInfo } from "../TileSetDefinitionEditor";

/**
 * Directly modifies the provided tile set definition.
 * @param {object} props 
 * @param {number} props.tileSize
 * @param {ChocoWinAbstractPixelReader} props.tileSheetReader
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {AssignableTileInfo} props.assignableTileInfo
 * @param {function({regionIdentifier: String, colCount: number, rowCount: number})} props.onRegionResized
 * @param {function({regionIdentifier: String, colIndex: number, rowIndex: number, info: AssignableTileInfo})} props.onAssignmentMade
 * @param {function(AssignableTileInfo)} props.onTileAssignmentRetrieved
 */
const WindowRegionDefinition = ({ tileSetDefinition, tileSheetReader, tileSize, assignableTileInfo, onRegionResized, onAssignmentMade, onTileAssignmentRetrieved }) => {
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
    const [regionColCount, setRegionColCount] = useState(1);
    const [regionRowCount, setRegionRowCount] = useState(1);
    const [assignmentTileScale, setAssignmentTileScale] = useState(DEFAULT_TA_SCALE);
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());
    const [selectedTile, setSelectedTile] = useState({ colIndex: 0, rowIndex: 0 });
    const [tileAssignments, setTileAssignments] = useState([]);
    const [isAssignThisReady, setIsAssignThisReady] = useState(false);

    /** @type {ReturnType<typeof useRef<Map<String, String>>>} */
    const tileBlobUrlMap = useRef(new Map());

    /** @type {ReturnType<typeof useContext<ChocoStudioTileSheetBlobUrlManager>>} */
    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);


    const [assignThisTileBackground, setAssignThisTileBackground] = useState("")


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

    // initialize the tiles background images
    useEffect(() => {
        if (tileSetDefinition && tileSheetReader && regionIdentifier && tileBlobUrlMap?.current) {

            const region = tileSetDefinition.regions[regionIdentifier];
            const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;

            for (let rowIndex = 0; rowIndex < region.rowCount; rowIndex++) {
                for (let colIndex = 0; colIndex < region.colCount; colIndex++) {
                    const tp = region.get(rowIndex, colIndex);

                    if (tp) {
                        const tileBlobKey = computeTileBlobKey(regionIdentifier, colIndex, rowIndex);

                        let reader = new ChocoWinRegionPixelReader(tileSheetReader, new ChocoWinRectangle({
                            x: tp.xSheetCoordinate,
                            y: tp.ySheetCoordinate,
                            width: tileSize,
                            height: tileSize
                        }));
                        reader = WrapReaderForTileTransformation(reader, tp.geometricTransformation);

                        reader.isReady().then(r => {
                            const writer = writerFactory.build(reader.width, reader.height);
                            writer.writeAll(reader);

                            if (tileBlobUrlMap.current.has(tileBlobKey)) {
                                URL.revokeObjectURL(tileBlobUrlMap.current.get(tileBlobKey));
                            }

                            const tileUrl = URL.createObjectURL(writer.makeBlob());
                            tileBlobUrlMap.current.set(tileBlobKey, tileUrl);

                            const selectorText = `label.region-tile-radio.${tileBlobKey}`;
                            const ruleText = `${selectorText} { background-image: url(${tileUrl}); }`;

                            replaceRule(styleSheet, selectorText, ruleText);
                        })
                    }
                }
            }
        }
    }, [tileSetDefinition, tileSheetReader, regionIdentifier, tileBlobUrlMap])

    // set the URL for the 
    useEffect(() => {
        if (styleRef?.current && tileBlobUrlMap?.current && assignableTileInfo?.transformedReader?.isReady) {
            setIsAssignThisReady(false);
            assignableTileInfo.transformedReader.isReady().then(/** @param {ChocoWinAbstractPixelReader} r */ r => {
                if (!styleRef.current) return;
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
    }, [tileBlobUrlMap, styleRef, assignableTileInfo])

    // resize the tile assignment container
    useEffect(() => {
        if (!tileAssignmentContainerRef && regionColCount) return;
        // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.

        const possibleScale = Math.floor(tileAssignmentContainerRef.current.offsetWidth / regionColCount / tileSize);
        const assignmentTileScale = Math.min(BIGGEST_ZOOM_FACTOR, possibleScale);
        setAssignmentTileScale(assignmentTileScale);
    }, [tileAssignmentContainerRef, lastResizeTimestamp])

    // set up resize event handler to force a pixel grid resize
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
        return;
        // if (lastAssignThisButtonClickTime && isAssignThisReady && styleRef?.current && tileBlobUrlMap?.current) {
        //     const tileBlobKey = computeTileBlobKey(regionIdentifier, selectedTile.colIndex, selectedTile.rowIndex);
        //     /** @type {ChocoWinAbstractPixelReader} */ const reader = editorTileAssignment.transformedReader;
        //     const writer = writerFactory.build(reader.width, reader.height);
        //     writer.writeAll(reader);

        //     if (tileBlobUrlMap.current.has(tileBlobKey)) {
        //         URL.revokeObjectURL(tileBlobUrlMap.current.get(tileBlobKey));
        //     }

        //     const tileUrl = URL.createObjectURL(writer.makeBlob());
        //     tileBlobUrlMap.current.set(tileBlobKey, tileUrl);

        //     const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;

        //     const selectorText = `label.region-tile-radio.${tileBlobKey}`;
        //     const ruleText = `${selectorText} { background-image: url(${tileUrl}); }`;

        //     replaceRule(styleSheet, selectorText, ruleText);

        //     const region = tileSetDefinition.regions[regionIdentifier];
        //     if (!region[selectedTile.rowIndex]) { region[selectedTile.rowIndex] = []; }

        //     region.set(selectedTile.colIndex, selectedTile.rowIndex, new ChocoStudioWindowRegionTileAssignment({
        //         xSheetCoordinate: editorTileAssignment.x,
        //         ySheetCoordinate: editorTileAssignment.y,
        //         geometricTransformation: editorTileAssignment.geometricTransformation,
        //         transparencyOverrides: editorTileAssignment.transparencyOverrides,
        //     }));

        //     onChangeMade(tileSetDefinition);
        // }
    }, [isAssignThisReady, styleRef, tileBlobUrlMap])

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
        setRegionColCount(tileSetDefinition.regions[identifier].colCount);
        setRegionRowCount(tileSetDefinition.regions[identifier].rowCount);
        // TODO!!! rename TileSetDefinition....tileSheet~~Position~~ to assigments, and x/y to tileSheetPixelX, tileSheetPixelY
        setTileAssignments(
            Array.from(tileSetDefinition.regions[identifier].colCount).map((_, x) => {
                return Array.from(tileSetDefinition.regions[identifier].rowCount).map((_, y) => {
                    const oldAssignment = tileSetDefinition.regions[identifier].get(x, y);
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
     * @param {Object} e 
     * @param {HTMLInputElement} e.target
     */
    const onRegionColCountChange = (e) => {
        const colCount = Number(e.target.value);
        if (colCount == e.target.value && colCount > 0) {
            setRegionColCount(colCount);
            tileSetDefinition.regions[regionIdentifier].colCount = colCount;
            onRegionResized({
                regionIdentifier,
                rowCount: tileSetDefinition.regions[regionIdentifier].rowCount,
                colCount: colCount,
            });
        }
    }

    /**
     * @param {Object} e 
     * @param {HTMLInputElement} e.target
     */
    const onRegionRowCountChange = (e) => {
        const rowCount = Number(e.target.value);
        if (rowCount == e.target.value && rowCount > 0) {
            setRegionRowCount(rowCount);
            tileSetDefinition.regions[regionIdentifier].rowCount = rowCount;
            onRegionResized({
                regionIdentifier,
                rowCount: rowCount,
                colCount: tileSetDefinition.regions[regionIdentifier].colCount,
            });
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

        setSelectedTile({ colIndex: Number(e.target.dataset.colIndex), rowIndex: Number(e.target.dataset.rowIndex) });
    }

    /**
     * @param {Object} e 
     * @param {HTMLButtonElement} e.target
     */
    const onRetrieveTileButtonClick = (e) => {
        if (!onTileAssignmentRetrieved) return;

        const regionTileAssignment =
            tileSetDefinition.regions[regionIdentifier].get(selectedTile.rowIndex, selectedTile.colIndex);

        const /** @type {EditorTileAssignment} */ outboundTileAssignment = {
            xSheetCoordinate: regionTileAssignment.xSheetCoordinate,
            ySheetCoordinate: regionTileAssignment.ySheetCoordinate,
            geometricTransformation: regionTileAssignment.geometricTransformation,
            transparencyOverrides: regionTileAssignment?.transparencyOverrides?.map(t => ({ x: t.x, y: t.y })) ?? []
        }

        onTileAssignmentRetrieved(outboundTileAssignment);
    }

    /**
     * @param {Object} e 
     * @param {HTMLButtonElement} e.target
     */
    const onAssignTileButtonClick = (e) => {
        onAssignmentMade({
            regionIdentifier: regionIdentifier,
            colIndex: selectedTile.colIndex,
            rowIndex: selectedTile.rowIndex,
        })
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
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.TOP || regionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM || regionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionColCount} onChange={onRegionColCountChange} />}
                {(regionIdentifier != CHOCO_WINDOW_REGIONS.TOP && regionIdentifier != CHOCO_WINDOW_REGIONS.BOTTOM && regionIdentifier != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
            </div>
            <div className="w-full col-span-2">
                <label htmlFor="7ae42bae-9eeb-4491-be31-00161a3af632">Height (tiles)</label>
                {(regionIdentifier == CHOCO_WINDOW_REGIONS.LEFT || regionIdentifier == CHOCO_WINDOW_REGIONS.RIGHT || regionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionRowCount} onChange={onRegionRowCountChange} />}
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
                '--region-width': regionColCount,
                '--region-height': regionRowCount,
                '--tile-size': `${tileSetDefinition.tileSize}px`,
                '--tile-sheet-scale': assignmentTileScale,
            }}
        >
            <h4 className="mb-1 font-bold">Tile Assignment</h4>
            <style ref={styleRef} />
            <div className="grid grid-cols-6">
                <div className="assign-this-tile-container self-center">
                    <div className="assign-this-tile"></div>
                </div>
                <div className="self-center justify-self-center">
                    <button className="block" onClick={onAssignTileButtonClick}>
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-3xl" />
                        <span className="sr-only">Assign to Region  Tile</span>
                    </button>
                    <button className="block" onClick={onRetrieveTileButtonClick}>
                        <FontAwesomeIcon icon={faRightFromBracket} flip="horizontal" className="text-3xl" />
                        <span className="sr-only">Assign to Region  Tile</span>
                    </button>
                </div>
                <div className="region-tile-container col-span-4 self-center">
                    {
                        Array.from({ length: regionRowCount || 1 }).map((_, rowIndex) =>
                            Array.from({ length: regionColCount || 1 }).map((_, colIndex) =>
                                <label
                                    className={`${computeTileBlobKey(regionIdentifier, colIndex, rowIndex)} region-tile-radio ${(selectedTile.colIndex == colIndex && selectedTile.rowIndex == rowIndex) ? "region-tile-selected" : ""}`}
                                    style={{
                                        "--tile-sheet-top-pixel-x": `${tileAssignments?.[colIndex]?.[rowIndex]?.x ?? 0}px`,
                                        "--tile-sheet-top-pixel-y": `${tileAssignments?.[colIndex]?.[rowIndex]?.y ?? 0}px`,
                                    }}
                                    key={`transparency-pixel-${colIndex}-${rowIndex}`}
                                >
                                    <input
                                        name="selected-region-tile"
                                        className='sr-only'
                                        type="radio"
                                        onChange={regionTileRadioOnChange} data-col-index={colIndex} data-row-index={rowIndex}
                                        checked={selectedTile.colIndex == colIndex && selectedTile.rowIndex == rowIndex}
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