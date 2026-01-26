import { use, useContext, useEffect, useRef, useState } from "react";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet } from "../../../ChocoStudio";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { TileSheetBlobUrlDictionary } from "../../SettingsModal";
import { Canvas, Polyline, Rect } from "fabric";
import { TileAssignment } from "../TileSetDefinitionEditor";

/**
 * @param {object} props 
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {number} props.tileSize
 * @param {TileAssignment} props.activeTileSheetAssignment
 * @param {boolean} props.defaultHelpVisible
 * @param {function({x: number, y: number})} props.onSelectionMade
 * @returns 
 */
const PreciseTileSelector = ({ tileSetDefinition, defaultHelpVisible, tileSize, activeTileSheetAssignment, onSelectionMade }) => {
    const TILES_IN_PTS = 3;
    const DEFAULT_PTS_SCALE = 3;
    const BIGGEST_ZOOM_FACTOR = 6;

    // Component-Wide
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [helpVisibile, setHelpVisible] = useState(defaultHelpVisible ?? true);
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());

    // Approximate Tile Selection
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);
    const tileSheetImgRef = useRef(null);

    // // utility for developers only during strict mode; "pretends" the selected tile location just got selected
    useEffect(() => {
        if (selectedTileLocation) {
            onSelectionMade && onSelectionMade(selectedTileLocation);
        }
    }, []);

    useEffect(() => {
        if (activeTileSheetAssignment) {
            if (activeTileSheetAssignment.x != selectedTileLocation.x && activeTileSheetAssignment.y != selectedTileLocation.y) {
                setSelectedTileLocation({
                    x: activeTileSheetAssignment.x,
                    y: activeTileSheetAssignment.y,
                })
                
                showTileSheetTileInSheetTileSelection({ sheetNaturalX: activeTileSheetAssignment.x, sheetNaturalY: activeTileSheetAssignment.y, overrideSnap: true })
            }
        }
    }, [activeTileSheetAssignment])

    const toggleHelp = () => setHelpVisible(!helpVisibile);

    // Resize event handler
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

    /** @typedef {String} SnapModeOptions */

    /** @enum {SnapModeOptions} */
    const SNAP_MODE_OPTIONS = Object.freeze({
        TILE_SIZE: "TILE_SIZE",
        OTHER: "OTHER",
        NONE: "NONE"
    })

    /** @type {ReturnType<typeof useState<SnapModeOptions>>} */
    const [snapMode, setSnapMode] = useState(SNAP_MODE_OPTIONS.TILE_SIZE);
    const [snapOtherSize, setSnapOtherSize] = useState(tileSize);






    const [sheetTileSelectionSemiLocked, setSheetTileSelectionSemiLocked] = useState(false);


    const [preciseTileSelectionScale, setPreciseTileSelectionScale] = useState(DEFAULT_PTS_SCALE);

    /** @type {ReturnType<typeof useState<{x: Number, y: Number}>>} */
    const [selectedTileLocation, setSelectedTileLocation] = useState(null);

    /** @type {ReturnType<typeof useState<{x: Number, y: Number}>>} */
    const [displayPreciseTileLocation, setDisplayPreciseTileLocation] = useState(null);

    const [preciseSelectionBackgroundPosition, setPreciseSelectionBackgroundPosition] = useState(null);
    const [preciseTileSelectionSize, setPreciseTileSelectionSize] = useState(tileSetDefinition.tileSize * TILES_IN_PTS * DEFAULT_PTS_SCALE ?? 72);


    const preciseSelectionContainerRef = useRef(null);
    const preciseSelectionZoomedRef = useRef(null);
    const preciseSelectionGridRef = useRef(null);






    // set the precise tile selection scale and size
    useEffect(() => {
        // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.
        if (!preciseSelectionContainerRef.current) {
            setPreciseTileSelectionSize(TILES_IN_PTS * tileSize);
        }
        else {
            // Similar to the region tile selection width, but this is always three tiles square.
            const possibleScale = Math.floor((preciseSelectionContainerRef.current.parentElement.offsetWidth / TILES_IN_PTS) / tileSize);
            const actualScale = Math.min(BIGGEST_ZOOM_FACTOR, possibleScale);
            setPreciseTileSelectionScale(actualScale);
            setPreciseTileSelectionSize(TILES_IN_PTS * tileSize * actualScale);
        }
    }, [tileSize, preciseSelectionContainerRef, lastResizeTimestamp])

    // draw grid over precise tile selection
    useEffect(() => {
        if (preciseSelectionGridRef && preciseSelectionGridRef.current) {
            const canvas = new Canvas('canvasId');
            canvas.width = preciseTileSelectionSize;
            canvas.height = preciseTileSelectionSize;
            const lineWidth = 1;
            const gridTileLength = preciseTileSelectionSize / TILES_IN_PTS;
            const translucentYellow = 'rgba(128, 128, 00, 0.5)';
            const clear = 'rgba(00, 0, 00, 0)';

            const drawNonCenterTileHaze = (x, y, color) => {
                const rectangle = new Rect({
                    left: x - 1,
                    top: y - 1,
                    fill: color,
                    width: gridTileLength - 1,
                    height: gridTileLength - 1,
                    objectCaching: false,
                    originX: 'left',
                    originY: 'top'
                })
                canvas.add(rectangle);
            }

            const drawPolyline = (points) => {
                const polyline = new Polyline(points, {
                    stroke: 'black',
                    strokeWidth: lineWidth,
                    fill: 'transparent'
                });
                canvas.add(polyline);
            }

            drawPolyline([
                { x: gridTileLength, y: 0 },
                { x: gridTileLength, y: preciseTileSelectionSize }
            ], true);

            drawPolyline([
                { x: gridTileLength * 2, y: 0 },
                { x: gridTileLength * 2, y: preciseTileSelectionSize }
            ]);

            drawPolyline([
                { x: 0, y: gridTileLength },
                { x: preciseTileSelectionSize, y: gridTileLength }
            ]);

            drawPolyline([
                { x: 0, y: gridTileLength * 2 },
                { x: preciseTileSelectionSize, y: gridTileLength * 2 }
            ]);

            drawNonCenterTileHaze(0, 0, translucentYellow);
            drawNonCenterTileHaze(gridTileLength, 0, translucentYellow);
            drawNonCenterTileHaze(gridTileLength * 2, 0, translucentYellow);

            drawNonCenterTileHaze(0, gridTileLength, translucentYellow);
            drawNonCenterTileHaze(gridTileLength, gridTileLength, clear);
            drawNonCenterTileHaze(gridTileLength * 2, gridTileLength, translucentYellow);

            drawNonCenterTileHaze(0, gridTileLength * 2, translucentYellow);
            drawNonCenterTileHaze(gridTileLength, gridTileLength * 2, translucentYellow);
            drawNonCenterTileHaze(gridTileLength * 2, gridTileLength * 2, translucentYellow);

            canvas.renderAll();
            const imageSrc = canvas.toDataURL();
            preciseSelectionGridRef.current.style.backgroundImage = `url(${imageSrc})`;
        }
    }, [preciseSelectionGridRef, preciseTileSelectionScale, preciseTileSelectionSize, lastResizeTimestamp])

    /**
     * @param {InputEvent} e 
     */
    const onSnapModeChange = (e) => {
        setSnapMode(e.target.value);
    }

    /**
     * @param {InputEvent} e 
     */
    const onSnapOtherChange = (e) => {
        setSnapOtherSize(e.target.value);
    }


    /**
     * @param {MouseEvent}
     */
    const onSheetMouseEnter = () => {
        setSheetTileSelectionSemiLocked(false);
    }

    /**
     * @param {MouseEvent}
     */
    const onSheetMouseLeave = (e) => {
        if (!selectedTileLocation) return;
        showTileSheetTileInSheetTileSelection({ sheetNaturalX: selectedTileLocation.x, sheetNaturalY: selectedTileLocation.y, overrideSnap: true });
    }

    /**
     * @param {MouseEvent} e 
     */
    const onSheetMouseMove = (e) => {
        if (!sheetTileSelectionSemiLocked) {
            showTileSheetTileInSheetTileSelection({ mouseEvent: e });
        }
    }

    /**
     * @param {MouseEvent} e 
     */
    const onSheetMouseClick = (e) => {
        if (sheetTileSelectionSemiLocked) {
            setSheetTileSelectionSemiLocked(false);
            showTileSheetTileInSheetTileSelection({ mouseEvent: e });
        }
        else {
            setSheetTileSelectionSemiLocked(true);
            showTileSheetTileInSheetTileSelection({ mouseEvent: e });
            setSelectedTileLocation(displayPreciseTileLocation);
        }
    }

    const calculateSnapSnize = () =>
        snapMode == SNAP_MODE_OPTIONS.TILE_SIZE ? tileSize :
            snapMode == SNAP_MODE_OPTIONS.OTHER ? snapOtherSize :
                null;

    /**
     * @param {{x: Number, y: Number}} naturalSheetCoordinates 
     * @returns 
     */
    const calculatePreciseTilePosition = (naturalSheetCoordinates) => ({
        x: preciseTileSelectionScale * (tileSize - naturalSheetCoordinates.x),
        y: preciseTileSelectionScale * (tileSize - naturalSheetCoordinates.y),
    });

    /**
     * @param {Object} args
     * @param {MouseEvent} args.mouseEvent The mouse event if triggered by a mouse event
     * @param {Number} naturalX The "natural" X coordinate to use; will be overriden by mouse event.
     * @param {Number} naturalY The "natural" Y coordinate to use; will be overriden by mouse event.
     * @param {Booealn} overrideSnap Whether or not to ignore the snap-to-grid settings.
     * @return {{x: Number, y: Number}}
     */
    const calculateTileSheetSelectionCoordinates = ({ mouseEvent, naturalX, naturalY, overrideSnap = false }) => {
        if (!tileSheetImgRef || !tileSheetImgRef.current) return;

        const imageWidth = tileSheetImgRef.current.naturalWidth;
        const imageHeight = tileSheetImgRef.current.naturalHeight;

        if (mouseEvent) {
            /** @type {DOMRect} */ const rect = tileSheetImgRef.current.getBoundingClientRect();
            const ratio = imageWidth / rect.width;

            naturalX = Math.max(0, Math.min(Math.floor(ratio * (mouseEvent.clientX - rect.left)), imageWidth));
            naturalY = Math.max(0, Math.min(Math.floor(ratio * (mouseEvent.clientY - rect.top)), imageHeight));
        }

        const snapSize = calculateSnapSnize();

        if (!overrideSnap && snapSize) {
            naturalX = snapSize * Math.floor(naturalX / snapSize);
            naturalY = snapSize * Math.floor(naturalY / snapSize);
        }

        return { x: naturalX, y: naturalY };
    }

    /**
     * Updates state refrenced by the precise tile selection CSS.
     * @param {object} args
     * @param {MouseEvent} args.mouseEvent The mouse event if triggered by a mouse event
     * @param {number} args.naturalX The "natural" X coordinate to use; will be overriden by mouse event.
     * @param {number} args.naturalY The "natural" Y coordinate to use; will be overriden by mouse event.
     * @param {boolean} args.overrideSnap Whether or not to ignore the snap-to-grid settings.
     */
    const showTileSheetTileInSheetTileSelection = ({ mouseEvent, sheetNaturalX, sheetNaturalY, overrideSnap = false }) => {
        const naturalSheetCoordinates = calculateTileSheetSelectionCoordinates({ mouseEvent, naturalX: sheetNaturalX, naturalY: sheetNaturalY, overrideSnap });
        if (!naturalSheetCoordinates) return;

        const preciseTilePosition = calculatePreciseTilePosition(naturalSheetCoordinates);

        setDisplayPreciseTileLocation({ x: naturalSheetCoordinates.x, y: naturalSheetCoordinates.y });
        setPreciseSelectionBackgroundPosition(preciseTilePosition);
    }

    /**
     * @param {MouseEvent} e 
     */
    const onPreciseTileSelectionClick = (e) => {
        /** @type {DOMRect} */ const rect = e.target.getBoundingClientRect();

        const /** @type {Number} */ x = e.clientX - rect.left + 1;
        const /** @type {Number} */ y = e.clientY - rect.top + 1;

        let deltaSheetX = 0;
        let deltaSheetY = 0;

        if (x / preciseTileSelectionScale < tileSize) {
            deltaSheetX = -tileSize;
        }
        else if (x / preciseTileSelectionScale > 2 * tileSize) {
            deltaSheetX = tileSize;
        }

        if (y / preciseTileSelectionScale < tileSize) {
            deltaSheetY = -tileSize;
        }
        else if (y / preciseTileSelectionScale > 2 * tileSize) {
            deltaSheetY = tileSize;
        }

        showTileSheetTileInSheetTileSelection({ sheetNaturalX: deltaSheetX + displayPreciseTileLocation.x, sheetNaturalY: deltaSheetY + displayPreciseTileLocation.y, overrideSnap: true });
        setSelectedTileLocation({ x: deltaSheetX + displayPreciseTileLocation.x, y: deltaSheetY + displayPreciseTileLocation.y })
    }

    /**
     * @param {object} e 
     * @param {HTMLInputElement} e.target 
     */
    const onSheetXManualInputChange = (e) => {
        const x = Number(e.target.value);
        if (x < 0) return;
        showTileSheetTileInSheetTileSelection({ sheetNaturalX: x, sheetNaturalY: displayPreciseTileLocation.y, overrideSnap: true });
        setSelectedTileLocation({ x: x, y: selectedTileLocation.y })
    }

    /**
     * @param {InputEvent} e 
     */
    const onSheetYManualInputChange = (e) => {
        const y = Number(e.target.value);
        if (y < 0) return;
        showTileSheetTileInSheetTileSelection({ sheetNaturalX: displayPreciseTileLocation.x, sheetNaturalY: y, overrideSnap: true });
        setSelectedTileLocation({ x: selectedTileLocation.x, y: y })
    }


    useEffect(() => onSelectionMade && onSelectionMade(selectedTileLocation), [selectedTileLocation]);

    return (
        <>
            <h3 className="mb-1 text-xl font-bold">Tile Selection {helpVisibile || <a href="#" onClick={toggleHelp} className="text-xs font-normal text-blue-900 dark:text-blue-100 py-1 hover:underline italic">show help</a>}</h3>
            {helpVisibile && <p className="mb-2 text-sm mx-6">
                <span><span className="italic">First,</span> approximately click on location the tile sheet to load that area into the tile sheet detail selector. <span className="italic">Second,</span> precisely adjust the position or click on an adjacent tile.</span>
                &nbsp;<a href="#" onClick={toggleHelp} className="text-xs text-blue-900 dark:text-blue-100 py-1 hover:underline italic">hide help</a>
            </p>}

            <div className={`grid grid-cols-5 gap-4 mb-2`}>
                <div className="w-full col-span-2">
                    <label htmlFor="bdbf3176-cdef-4081-9cf1-e45615677954">Sheet Snap Mode</label>
                    <select className={TAILWIND_INPUT_CLASS_NAME} id="bdbf3176-cdef-4081-9cf1-e45615677954" value={snapMode} onChange={onSnapModeChange}>
                        <option value={SNAP_MODE_OPTIONS.TILE_SIZE}>Tile Size ({tileSize}px)</option>
                        {/* <option value={SNAP_MODE_OPTIONS.OTHER}>Other (Choose)</option> */} {/* Disable this option since it needs refinement. */}
                        <option value={SNAP_MODE_OPTIONS.NONE}>Do Not Snap</option>
                    </select>
                </div>
                {(snapMode == SNAP_MODE_OPTIONS.OTHER) && <div className="w-full col-span-1">
                    <label htmlFor="e25b0001-957a-4343-a98f-5a560b7e6af6">Sheet Snap Size</label>
                    <input type="number" className={TAILWIND_INPUT_CLASS_NAME} id="e25b0001-957a-4343-a98f-5a560b7e6af6" value={snapOtherSize} onChange={onSnapOtherChange} />
                </div>}
            </div>

            <div className={`grid grid-cols-4 gap-4`}>
                <div className="mb-4 w-full col-span-2">
                    <h4 className="mb-1 font-bold">Approximate Tile Selection</h4>
                    <img onMouseLeave={onSheetMouseLeave} onMouseEnter={onSheetMouseEnter} onMouseMove={onSheetMouseMove} onClick={onSheetMouseClick} alt="Tile Selection" src={tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)} ref={tileSheetImgRef} />
                </div>
                <div className="mb-4 w-full col-span-2">
                    <h4 className="mb-1 font-bold">Precise Tile Selection</h4>
                    <div ref={preciseSelectionContainerRef} style={{ '--tile-sel-size': `${preciseTileSelectionSize}px` }} className="mb-3 mx-auto tile-sheet-position-selector h-[var(--tile-sel-size)] w-[var(--tile-sel-size)]">
                        <div
                            ref={preciseSelectionZoomedRef}
                            className="w-full h-full sheet-tile-selection-mid-ground"
                            style={{
                                backgroundImage: `url(${tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)})`,
                                imageRendering: 'pixelated',
                                backgroundSize: `${tileSheetImgRef?.current?.naturalWidth * preciseTileSelectionScale}px ${tileSheetImgRef?.current?.naturalHeight * preciseTileSelectionScale}px`,
                                backgroundPositionX: preciseSelectionBackgroundPosition?.x || 0,
                                backgroundPositionY: preciseSelectionBackgroundPosition?.y || 0,
                            }}
                            onClick={onPreciseTileSelectionClick}
                        >
                            <div ref={preciseSelectionGridRef} className="w-full h-full"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="mr-2 mb-2">
                            <label htmlFor="94b7a866-c49a-4999-b167-a6f205861b59">Sheet X</label>
                            <input placeholder="x" min={0} type="Number" autoComplete="off" id="94b7a866-c49a-4999-b167-a6f205861b59" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetXManualInputChange} value={displayPreciseTileLocation?.x ?? 0} />
                        </div>
                        <div className="ml-2 mb-2">
                            <label htmlFor="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769">Sheet Y</label>
                            <input placeholder="x" min={0} type="Number" autoComplete="off" id="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetYManualInputChange} value={displayPreciseTileLocation?.y ?? 0} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PreciseTileSelector;