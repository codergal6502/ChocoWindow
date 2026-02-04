import { useContext, useEffect, useRef, useState } from "react";
import { CHOCO_REGION_GRANULARITY, CHOCO_WINDOW_REGIONS, ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioTileSheetBlobUrlManager, ChocoStudioWindowRegionDefinition, ChocoStudioWindowRegionTileAssignment, ChocoStudioWindowRegionTileAssignmentArray } from "../../../ChocoStudio";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { ChocoWinAbstractPixelReader, ChocoRectangle, ChocoWinRegionPixelReader, WrapReaderForTileTransformation } from "../../../ChocoWindow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { AssignableTileInfo } from "../TileSetDefinitionEditor";
import { WriterFactoryForStudio } from "../../../App";
import './WindowRegionDefinition.css'
import BasicEdgeSizeEditor, { BasicEdgeRegionSize } from "../window-region-size-components/BasicEdgeSizeEditor";
import SingleTileEdgeSizeEditor, { SingleTileEdgeSize } from "../window-region-size-components/SingleTileEdgeSizeEditor";
import { CloneRegionDictionary } from "../../../Utilities";
import ArbitraryEdgeGeometryEditor from "../window-region-size-components/ArbitraryEdgeGeometryEditor";

/**
 * Directly modifies the provided tile set definition.
 * @param {object} props 
 * @param {number} props.tileSize
 * @param {string} props.granularity
 * @param {{[key: string]: ChocoStudioWindowRegionDefinition}} props.regions
 * @param {ChocoWinAbstractPixelReader} props.tileSheetReader
 * @param {AssignableTileInfo} props.assignableTileInfo
 * @param {function(AssignableTileInfo)} props.onTileAssignmentRetrieved
 * @param {function({[key: string]: ChocoStudioWindowRegionDefinition}): void} props.onChanged
 */
const WindowRegionDefinition = ({ regions, tileSize, granularity, tileSheetReader, assignableTileInfo, onTileAssignmentRetrieved, onChanged }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const DEFAULT_TA_SCALE = 3;
    // const BIGGEST_ZOOM_FACTOR = 6;
    const CONFIGURED_TILE_BLOB_KEY = "SELECTED_TILE_BLOB_KEY";
    const writerFactory = useContext(WriterFactoryForStudio);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            HTML REFERENCES                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    /** @type {ReturnType<typeof useRef<HTMLDivElement>>} */
    const tileAssignmentContainerRef = useRef(null);
    /** @type {ReturnType<typeof useRef<HTMLStyleElement>>} */
    const styleRef = useRef(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                    STATE, CONTEXT HOOKS                        //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [helpVisibile, setHelpVisible] = useState(true);
    const [regionIdentifier, setRegionIdentifier] = useState(CHOCO_WINDOW_REGIONS.TOP_LEFT);
    const colCount = regions[regionIdentifier].colCount;
    const rowCount = regions[regionIdentifier].rowCount;    

    const [assignmentTileScale, setAssignmentTileScale] = useState(DEFAULT_TA_SCALE);
    // const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());
    const [selectedAssignmentTile, setSelectedAssignmentTile] = useState({ colIndex: 0, rowIndex: 0 });

    const [singleTileEdgeSizes, setSingleTileEdgeSizes] = useState(
        new SingleTileEdgeSize({
            regions: {
                [CHOCO_WINDOW_REGIONS.TOP_LEFT]: { colCount: 1, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.TOP_RIGHT]: { colCount: 1, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.BOTTOM_LEFT]: { colCount: 1, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT]: { colCount: 1, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.TOP]: { colCount: regions[CHOCO_WINDOW_REGIONS.TOP].colCount, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.BOTTOM]: { colCount: regions[CHOCO_WINDOW_REGIONS.BOTTOM].colCount, rowCount: 1 },
                [CHOCO_WINDOW_REGIONS.LEFT]: { colCount: 1, rowCount: regions[CHOCO_WINDOW_REGIONS.LEFT].rowCount },
                [CHOCO_WINDOW_REGIONS.RIGHT]: { colCount: 1, rowCount: regions[CHOCO_WINDOW_REGIONS.RIGHT].rowCount },
                [CHOCO_WINDOW_REGIONS.CENTER]: { colCount: regions[CHOCO_WINDOW_REGIONS.TOP].colCount, rowCount: regions[CHOCO_WINDOW_REGIONS.RIGHT].rowCount },
            }
        })
    );

    const [basicRegionEdgeSizes, setBasicRegionEdgeSizes] = useState(new BasicEdgeRegionSize({
        topSharedRowCount: Math.max(regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].rowCount, regions[CHOCO_WINDOW_REGIONS.TOP].rowCount, regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].rowCount),
        topEdgeColCount: regions[CHOCO_WINDOW_REGIONS.TOP].colCount,

        bottomSharedRowCount: Math.max(regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].rowCount, regions[CHOCO_WINDOW_REGIONS.BOTTOM].rowCount, regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].rowCount),
        bottomEdgeColCount: regions[CHOCO_WINDOW_REGIONS.BOTTOM].colCount,

        leftSharedColCount: Math.max(regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].colCount, regions[CHOCO_WINDOW_REGIONS.LEFT].colCount, regions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].colCount),
        leftEdgeRowCount: regions[CHOCO_WINDOW_REGIONS.TOP_LEFT].rowCount,

        rightSharedColCount: Math.max(regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].colCount, regions[CHOCO_WINDOW_REGIONS.RIGHT].colCount, regions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].colCount),
        rightEdgeRowCount: regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].rowCount,

        centerColCount: regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].colCount,
        centerRowCount: regions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].rowCount,
    }));

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
        removeRule(styleSheet, selectorText);

        styleSheet.insertRule(ruleText);
    }

    /**
     * @param {CSSStyleSheet} styleSheet 
     * @param {string} selectorText 
     */
    const removeRule = (styleSheet, selectorText) => {
        /** @type {CSSStyleRule[]} */
        const ruleArray = Array.from(styleSheet.cssRules);
        const oldRuleIndex = ruleArray.findIndex(r => r.selectorText == selectorText);
        if (oldRuleIndex >= 0) { styleSheet.deleteRule(oldRuleIndex) };
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                         NEW EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    useEffect(() => {
        if (regions && tileSheetReader && regionIdentifier && tileBlobUrlMap?.current && styleRef?.current) {
            const region = regions[regionIdentifier];
            const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;

            for (let rowIndex = 0; rowIndex < region.rowCount; rowIndex++) {
                for (let colIndex = 0; colIndex < region.colCount; colIndex++) {
                    const tp = region.get(rowIndex, colIndex);

                    const tileBlobKey = computeTileBlobKey(regionIdentifier, colIndex, rowIndex);
                    const selectorText = `label.region-tile-radio.${tileBlobKey}`;

                    if (tp) {
                        let reader = new ChocoWinRegionPixelReader(tileSheetReader, new ChocoRectangle({
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

                            const ruleText = `${selectorText} { background-image: url(${tileUrl}); }`;

                            replaceRule(styleSheet, selectorText, ruleText);
                        })
                    }
                    else {
                        removeRule(styleSheet, selectorText);
                    }
                }
            }
        }
    }, [regions, tileSheetReader, regionIdentifier, tileBlobUrlMap, styleRef]);

    // set the URL for the "assign this" tile CSS
    useEffect(() => {
        if (styleRef?.current && tileBlobUrlMap?.current && assignableTileInfo?.transformedReader?.isReady) {

            assignableTileInfo.transformedReader.isReady().then(/** @param {ChocoWinAbstractPixelReader} r */ r => {
                if (!styleRef.current) return;
                const tileBlobKey = CONFIGURED_TILE_BLOB_KEY;
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
            })
        }
    }, [tileBlobUrlMap, styleRef, assignableTileInfo])







    // // // // // // // // // // // // // // // // // // // // // // // // // //
    // //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // // //

    // // resize the tile assignment container
    // useEffect(() => {
    //     if (!tileAssignmentContainerRef && regionColCount) return;
    //     // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.

    //     const possibleScale = Math.floor(tileAssignmentContainerRef.current.offsetWidth / regionColCount / tileSize);
    //     const assignmentTileScale = Math.min(BIGGEST_ZOOM_FACTOR, possibleScale);
    //     setAssignmentTileScale(assignmentTileScale);
    // }, [tileAssignmentContainerRef, lastResizeTimestamp])

    // // set up resize event handler to force a pixel grid resize
    // useEffect(() => {
    //     // See https://www.geeksforgeeks.org/reactjs/react-onresize-event/
    //     // See https://react.dev/reference/react/useEffect#parameters

    //     const onResize = () => {
    //         setLastResizeTimestamp(Date.now());
    //     }

    //     window.addEventListener("resize", onResize);
    //     return () => {
    //         window.removeEventListener("resize", onResize);
    //     };
    // }, [])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //



    /**
     * @param {Object} e
     * @param {HTMLInputElement} e.target
     */
    const regionTileRadioOnChange = (e) => {
        const label = e.target.parentElement;
        const otherLabels = Array.from(label.parentElement.children).filter(l => l != label);

        otherLabels.forEach(l => l.classList.remove("region-tile-selected"));
        label.classList.add("region-tile-selected");

        setSelectedAssignmentTile({ colIndex: Number(e.target.dataset.colIndex), rowIndex: Number(e.target.dataset.rowIndex) });
    }

    /**
     * @param {Object} e 
     * @param {HTMLButtonElement} e.target
     */
    const onRetrieveTileButtonClick = (e) => {
        const rta = regions[regionIdentifier].get(selectedAssignmentTile.rowIndex, selectedAssignmentTile.colIndex);

        if (rta) {
            const /** @type {AssignableTileInfo} */ outboundTileAssignment = {
                xSheetCoordinate: rta.xSheetCoordinate,
                ySheetCoordinate: rta.ySheetCoordinate,
                geometricTransformation: rta.geometricTransformation,
                transparencyOverrides: rta?.transparencyOverrides?.map(t => ({ x: t.x, y: t.y })) ?? [],
            }

            onTileAssignmentRetrieved(outboundTileAssignment);
        }
    }








    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          NEW EVENT HANDLERS                          //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const toggleHelp = () => setHelpVisible(!helpVisibile);

    /**
     * @param {Object} e 
     * @param {HTMLSelectElement} e.target
     */
    const onWindowRegionIdentifierChange = (e) => {
        const identifier = e.target.value
        setRegionIdentifier(identifier);

        const colCount = regions[identifier].colCount;
        const rowCount = regions[identifier].rowCount;

        setSelectedAssignmentTile({
            colIndex: Math.min(selectedAssignmentTile.colIndex, colCount - 1),
            rowIndex: Math.min(selectedAssignmentTile.rowIndex, rowCount - 1),
        })
    }

    /**
     * @param {BasicEdgeRegionSize} newBasicEdgeRegionSize 
     */
    const onBasicEdgeRegionSizeChange = (newBasicEdgeRegionSize) => {
        const newRegions = CloneRegionDictionary(regions);

        // shared sizes
        newRegions[CHOCO_WINDOW_REGIONS.TOP_LEFT].rowCount = newBasicEdgeRegionSize.topSharedRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.TOP].rowCount = newBasicEdgeRegionSize.topSharedRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].rowCount = newBasicEdgeRegionSize.topSharedRowCount;
        
        newRegions[CHOCO_WINDOW_REGIONS.TOP_LEFT].colCount = newBasicEdgeRegionSize.leftSharedColCount;
        newRegions[CHOCO_WINDOW_REGIONS.LEFT].colCount = newBasicEdgeRegionSize.leftSharedColCount;
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].colCount = newBasicEdgeRegionSize.leftSharedColCount;
        
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].rowCount = newBasicEdgeRegionSize.bottomSharedRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM].rowCount = newBasicEdgeRegionSize.bottomSharedRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].rowCount = newBasicEdgeRegionSize.bottomSharedRowCount;
        
        newRegions[CHOCO_WINDOW_REGIONS.TOP_RIGHT].colCount = newBasicEdgeRegionSize.rightSharedColCount;
        newRegions[CHOCO_WINDOW_REGIONS.RIGHT].colCount = newBasicEdgeRegionSize.rightSharedColCount;
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].colCount = newBasicEdgeRegionSize.rightSharedColCount;
        
        // distinct sizes
        newRegions[CHOCO_WINDOW_REGIONS.TOP].colCount = newBasicEdgeRegionSize.topEdgeColCount;
        newRegions[CHOCO_WINDOW_REGIONS.BOTTOM].colCount = newBasicEdgeRegionSize.bottomEdgeColCount;
        
        newRegions[CHOCO_WINDOW_REGIONS.LEFT].rowCount = newBasicEdgeRegionSize.leftEdgeRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.RIGHT].rowCount = newBasicEdgeRegionSize.rightEdgeRowCount;

        newRegions[CHOCO_WINDOW_REGIONS.CENTER].rowCount = newBasicEdgeRegionSize.centerRowCount;
        newRegions[CHOCO_WINDOW_REGIONS.CENTER].colCount = newBasicEdgeRegionSize.centerColCount;


        setBasicRegionEdgeSizes(newBasicEdgeRegionSize);

        onChanged(newRegions);
    }

    /**
     * @param {SingleTileEdgeSize} newSingleTileEdgeSize 
     */
    const onSingleTileEdgeSizeChange = (newSingleTileEdgeSize) => {
        const newRegions = CloneRegionDictionary(regions);
        newRegions[regionIdentifier].colCount = newSingleTileEdgeSize.regions[regionIdentifier].colCount
        newRegions[regionIdentifier].rowCount = newSingleTileEdgeSize.regions[regionIdentifier].rowCount;

        setSingleTileEdgeSizes(newSingleTileEdgeSize);
        onChanged(newRegions);
    }

    /**
     * 
     * @param {ChocoStudioWindowRegionDefinition} newRegionDefinition 
     */
    const onArbitraryEdgeRegionSizeChange = (newRegionDefinition) => {
        const newRegions = CloneRegionDictionary(regions);
        newRegions[regionIdentifier] = newRegionDefinition;
        onChanged(newRegions);
    }

    /**
     * @param {object} args
     * @param {Number} args.rowIndex 
     * @param {Number} args.colIndex 
     */
    const onClearRegionTileAssignmentButtonClick = ({ rowIndex, colIndex }) => {
        const newRegions = CloneRegionDictionary(regions);
        newRegions[regionIdentifier].set(rowIndex, colIndex, null);
        onChanged(newRegions);
    }

    /**
     * @param {Object} e 
     * @param {HTMLButtonElement} e.target
     */
    const onAssignTileButtonClick = (e) => {
        const newRegions = CloneRegionDictionary(regions);
        newRegions[regionIdentifier].set(selectedAssignmentTile.rowIndex, selectedAssignmentTile.colIndex, assignableTileInfo);
        onChanged(newRegions);
    }

    return (<>
        <h3 className="mb-1 text-xl font-bold">Window Region Definition {helpVisibile || <a href="#" onClick={toggleHelp} className="text-xs font-normal text-blue-900 dark:text-blue-100 py-1 hover:underline italic">show help</a>}</h3>
        {helpVisibile && <p className="mb-2 text-sm mx-6">
            <span><span className="italic">First,</span> select a window region to define tiles for. <span className="italic">Second,</span> click on the tile location in the selected region. <span className="italic">Third,</span> change the tile selection, transformation, and transparent pixels below. <span className="italic">Finally</span>, assign the configured tile to the location.</span>
            &nbsp;<a href="#" onClick={toggleHelp} className="text-xs text-blue-900 dark:text-blue-100 py-1 hover:underline italic">hide help</a>
        </p>}

        <div className={`grid grid-cols-12 gap-4`}>
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
            {(CHOCO_REGION_GRANULARITY.SINGLE_TILE_EDGES == (granularity ?? CHOCO_REGION_GRANULARITY.SINGLE_TILE_EDGES)) && <SingleTileEdgeSizeEditor regionIdentifier={regionIdentifier} singleTileEdgeSizes={singleTileEdgeSizes} onSizeChange={onSingleTileEdgeSizeChange} />}
            {(CHOCO_REGION_GRANULARITY.BASIC_EDGES == (granularity)) && <BasicEdgeSizeEditor regionIdentifier={regionIdentifier} sizes={basicRegionEdgeSizes} onSizeChange={onBasicEdgeRegionSizeChange} />}
            {(CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES == (granularity)) && <ArbitraryEdgeGeometryEditor regionIdentifier={regionIdentifier} regionDefinition={regions[regionIdentifier]} onGeometryChange={onArbitraryEdgeRegionSizeChange} />}
        </div>


        <div
            ref={tileAssignmentContainerRef}
            className="mb-4 w-full"
            style={{
                '--region-width': colCount,
                '--region-height': rowCount,
                '--tile-size': `${tileSize}px`,
                '--tile-sheet-scale': assignmentTileScale,
            }}
        >
            <style ref={styleRef} />
            <div className="grid grid-cols-6">
                <div>
                    <h4 className="mb-1 font-bold">Configured Tile</h4>
                    <div className="assign-this-tile-container self-center">
                        <div className="assign-this-tile"></div>
                    </div>
                </div>
                <div className="self-center justify-self-center">
                    <h4><span className="invisible">Actions</span></h4>
                    <button className="block" onClick={onAssignTileButtonClick}>
                        <FontAwesomeIcon icon={faRightFromBracket} className="text-3xl" />
                        <span className="sr-only">Assign to Region Tile</span>
                    </button>
                    <button className="block" onClick={onRetrieveTileButtonClick}>
                        <FontAwesomeIcon icon={faRightFromBracket} flip="horizontal" className="text-3xl" />
                        <span className="sr-only">Retrieve to Configuration</span>
                    </button>
                </div>
                <div className="col-span-3 self-center">
                    <h4 className="mb-1 font-bold">Tile Assignments</h4>
                    <div className="region-tile-container">
                        {
                            Array.from({ length: rowCount || 1 }).map((_, rowIndex) =>
                                Array.from({ length: colCount || 1 }).map((_, colIndex) =>
                                    <label
                                        className={`${computeTileBlobKey(regionIdentifier, colIndex, rowIndex)} region-tile-radio ${(selectedAssignmentTile.colIndex == colIndex && selectedAssignmentTile.rowIndex == rowIndex) ? "region-tile-selected" : ""}`}
                                        key={`transparency-pixel-${colIndex}-${rowIndex}`}
                                    >
                                        <input
                                            name="selected-region-tile"
                                            className='sr-only'
                                            type="radio"
                                            onChange={regionTileRadioOnChange} data-col-index={colIndex} data-row-index={rowIndex}
                                            checked={selectedAssignmentTile.colIndex == colIndex && selectedAssignmentTile.rowIndex == rowIndex}
                                        />
                                        <button onClick={() => onClearRegionTileAssignmentButtonClick({ rowIndex, colIndex })}>
                                            <FontAwesomeIcon icon={faCircleXmark} />
                                        </button>
                                    </label>
                                ))
                        }
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default WindowRegionDefinition;