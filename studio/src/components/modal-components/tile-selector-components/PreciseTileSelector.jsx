import { useContext, useEffect, useRef, useState } from "react";
import { ChocoStudioTileSetDefinition } from "../../../ChocoStudio";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { TileSheetBlobUrlDictionary } from "../../SettingsModal";
import { AssignableTileInfo } from "../TileSetDefinitionEditor";
import './PreciseTileSelector.css'

/**
 * @param {object} props 
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {number} props.tileSize
 * @param {AssignableTileInfo} props.assignableTileInfo
 * @param {boolean} props.defaultHelpVisible
 * @param {function({x: number, y: number})} props.onSelectionMade
 * @returns 
 */
const PreciseTileSelector = ({ tileSetDefinition, defaultHelpVisible, tileSize, assignableTileInfo, onSelectionMade }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const DEFAULT_PTS_SCALE = 3;
    const MAX_PTS_SCALE = 5;

    /** @typedef {String} SnapModeOptions */
    /** @enum {SnapModeOptions} */
    const SNAP_MODE_OPTIONS = Object.freeze({
        TILE_SIZE: "TILE_SIZE",
        OTHER: "OTHER",
        NONE: "NONE"
    })

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [helpVisibile, setHelpVisible] = useState(defaultHelpVisible ?? true);
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());

    /** @type {ReturnType<typeof useState<SnapModeOptions>>} */
    const [snapMode, setSnapMode] = useState(SNAP_MODE_OPTIONS.TILE_SIZE);
    const [sheetSnapOtherSize, setSheetSnapOtherSize] = useState(tileSize);
    const [precisionSnapOtherSize, setPrecisionSnapOtherSize] = useState(tileSize);

    /** @type {ReturnType<typeof useRef<HTMLStyleElement>>} */
    const precisionTileSelectionStyleRef = useRef(null);
    /** @type {ReturnType<typeof useRef<HTMLStyleElement>>} */
    const preciseSelectorContainerRef = useRef(null);

    const [doNotInvokeCallback, setDoNotInvokeCallback] = useState(false);
    /** @type {ReturnType<typeof useState<{x: Number, y: Number}>>} */
    const [selectedLocation, setSelectedLocation] = useState({ x: assignableTileInfo?.xSheetCoordinate ?? 0, y: assignableTileInfo?.ySheetCoordinate ?? 0 });
    /** @type {ReturnType<typeof useState<{x: Number, y: Number}>>} */
    const [displayLocation, setDisplayLocation] = useState({ x: assignableTileInfo?.xSheetCoordinate ?? 0, y: assignableTileInfo?.ySheetCoordinate ?? 0 });

    const [sheetTileSelectionSemiLocked, setSheetTileSelectionSemiLocked] = useState(false);
    const [preciseSelectorScale, setPreciseSelectorScale] = useState(DEFAULT_PTS_SCALE);

    // Approximate Tile Selection
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);
    const tileSheetImgRef = useRef(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // browser resize wrapper
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

    // change the precise selector size
    useEffect(() => {
        if (preciseSelectorContainerRef?.current) {
            const maxWidth = .75 * preciseSelectorContainerRef.current.clientWidth;
            setPreciseSelectorScale(
                Math.max(1,
                    Math.min(MAX_PTS_SCALE,
                        Math.round(maxWidth / tileSize / 3)
                    )
                )
            );
        }
    }, [lastResizeTimestamp, preciseSelectorContainerRef])

    // when a selection is made, call the parent component's callback
    useEffect(() => {
        if (!doNotInvokeCallback) {
            onSelectionMade(selectedLocation)
        }
        setDoNotInvokeCallback(false);
    }, [selectedLocation]);

    // update the selected and display locations when a new assignable tile info comes in
    useEffect(() => {
        setDoNotInvokeCallback(true);
        setSelectedLocation({ x: assignableTileInfo?.xSheetCoordinate ?? 0, y: assignableTileInfo?.ySheetCoordinate ?? 0 });
        setDisplayLocation({ x: assignableTileInfo?.xSheetCoordinate ?? 0, y: assignableTileInfo?.ySheetCoordinate ?? 0 });
    }, [assignableTileInfo])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * 
     */
    const toggleHelp = () => setHelpVisible(!helpVisibile);

    /**
     * @param {InputEvent} e 
     */
    const onSnapModeChange = (e) => {
        setSnapMode(e.target.value);
    }

    /**
     * @param {InputEvent} e
     */
    const onSheetSnapOtherSizeChange = (e) => {
        setSheetSnapOtherSize(Number(e.target.value));
    }

    /**
     * @param {InputEvent} e
     */
    const onPrecisionSnapOtherSizeChange = (e) => {
        setPrecisionSnapOtherSize(Number(e.target.value));
    }

    /**
     * @param {MouseEvent}
     */
    const onSheetMouseEnter = () => {
        setSheetTileSelectionSemiLocked(false);
    }

    /**
     * @param {MouseEvent} mouseEvent
     * @param {HTMLIFrameElement} mouseEvent.target
     */
    const onSheetMouseMove = (mouseEvent) => {
        if (!sheetTileSelectionSemiLocked) {
            const xTileSheetCoordScaled = mouseEvent.clientX - mouseEvent.target.x;
            const yTileSheetCoordScaled = mouseEvent.clientY - mouseEvent.target.y;
            const sheetWidth = mouseEvent.target.naturalWidth;
            const sheetHeight = mouseEvent.target.naturalHeight;

            const scale = 1.0 * sheetWidth / mouseEvent.target.width;

            let xTileSheetCoordUnscaled = Math.max(0, Math.min(sheetWidth, Math.round(scale * xTileSheetCoordScaled)));
            let yTileSheetCoordUnscaled = Math.max(0, Math.min(sheetHeight, Math.round(scale * yTileSheetCoordScaled)));

            switch (snapMode) {
                case SNAP_MODE_OPTIONS.TILE_SIZE: {
                    xTileSheetCoordUnscaled = tileSize * Math.floor(xTileSheetCoordUnscaled / tileSize);
                    yTileSheetCoordUnscaled = tileSize * Math.floor(yTileSheetCoordUnscaled / tileSize);
                    break;
                }
                case SNAP_MODE_OPTIONS.OTHER: {
                    const snapSize = sheetSnapOtherSize == Number(sheetSnapOtherSize) ? sheetSnapOtherSize : tileSize ?? tileSize;
                    xTileSheetCoordUnscaled = snapSize * Math.floor(xTileSheetCoordUnscaled / snapSize);
                    yTileSheetCoordUnscaled = snapSize * Math.floor(yTileSheetCoordUnscaled / snapSize);
                    break;
                }
            }

            setDisplayLocation({
                x: xTileSheetCoordUnscaled,
                y: yTileSheetCoordUnscaled,
            })
        }
    }

    /**
     * @param {MouseEvent}
     */
    const onSheetMouseLeave = (e) => {
        setDisplayLocation(selectedLocation);
    }

    /**
     * @param {MouseEvent} e 
     */
    const onSheetMouseClick = (e) => {
        if (sheetTileSelectionSemiLocked) {
            setSheetTileSelectionSemiLocked(false);
        }
        else {
            setSheetTileSelectionSemiLocked(true);
            setSelectedLocation(displayLocation);
        }
    }

    /**
     * @param {MouseEvent} mouseEvent 
     * @param {HTMLElement} mouseEvent.target
     */
    const onPreciseTileSelectionClick = (mouseEvent) => {
        const x = mouseEvent.clientX - mouseEvent.currentTarget.getBoundingClientRect().x;
        const y = mouseEvent.clientY - mouseEvent.currentTarget.getBoundingClientRect().y;

        const width = mouseEvent.target.clientWidth;
        const height = mouseEvent.target.clientHeight;

        const xPercent = 1.0 * x / width;
        const yPercent = 1.0 * y / height;

        const newSelectedLocation = { ...selectedLocation };

        const thisSnapSize =
            snapMode == SNAP_MODE_OPTIONS.OTHER
                ? precisionSnapOtherSize
                : tileSize;

        if (xPercent <= 0.3333) {
            newSelectedLocation.x -= thisSnapSize;
        }
        else if (xPercent >= 0.6667) {
            newSelectedLocation.x += thisSnapSize;
        }

        if (yPercent <= 0.3333) {
            newSelectedLocation.y -= thisSnapSize;
        }
        else if (yPercent >= 0.6667) {
            newSelectedLocation.y += thisSnapSize;
        }

        setDisplayLocation(newSelectedLocation);
        setSelectedLocation(newSelectedLocation);
    }

    /**
     * @param {object} tileSheetMouseCoordinates 
     * @param {HTMLInputElement} tileSheetMouseCoordinates.target 
     */
    const onSheetXManualInputChange = (e) => {
        const x = Number(e.target.value);
        if (x != e.target.value) return;
        if (x < 0) return;
        const newLocation = { x: x, y: selectedLocation.y };
        setDisplayLocation(newLocation);
        setSelectedLocation(newLocation);
    }

    /**
     * @param {InputEvent} e 
    */
    const onSheetYManualInputChange = (e) => {
        const y = Number(e.target.value);
        if (y != e.target.value) return;
        if (y < 0) return;
        const newLocation = { x: selectedLocation.x, y: y };
        setDisplayLocation(newLocation);
        setSelectedLocation(newLocation);
    }

    return (
        <>
            <h3 className="mb-1 text-xl font-bold">Tile Selection {helpVisibile || <a href="#" onClick={toggleHelp} className="text-xs font-normal text-blue-900 dark:text-blue-100 py-1 hover:underline italic">show help</a>}</h3>
            {helpVisibile && <p className="mb-2 text-sm mx-6">
                <span><span className="italic">First,</span> approximately click on location the tile sheet to load that area into the tile sheet detail selector. <span className="italic">Second,</span> precisely adjust the position or click on an adjacent tile.</span>
                &nbsp;<a href="#" onClick={toggleHelp} className="text-xs text-blue-900 dark:text-blue-100 py-1 hover:underline italic">hide help</a>
            </p>}

            <div className={`grid grid-cols-4 gap-4 mb-2`}>
                <div className="w-full col-span-2">
                    <label htmlFor="bdbf3176-cdef-4081-9cf1-e45615677954">Sheet Snap Mode</label>
                    <select className={TAILWIND_INPUT_CLASS_NAME} id="bdbf3176-cdef-4081-9cf1-e45615677954" value={snapMode} onChange={onSnapModeChange}>
                        <option value={SNAP_MODE_OPTIONS.TILE_SIZE}>Tile Size ({tileSize}px)</option>
                        <option value={SNAP_MODE_OPTIONS.OTHER}>Other (Choose)</option> {/* Disable this option since it needs refinement. */}
                        <option value={SNAP_MODE_OPTIONS.NONE}>Do Not Snap</option>
                    </select>
                </div>
                {(snapMode == SNAP_MODE_OPTIONS.OTHER) && <div className="w-full col-span-1">
                    <label htmlFor="e25b0001-957a-4343-a98f-5a560b7e6af6">Approx. Sel. Snap</label>
                    <input type="number" className={TAILWIND_INPUT_CLASS_NAME} id="e25b0001-957a-4343-a98f-5a560b7e6af6" value={sheetSnapOtherSize} onChange={onSheetSnapOtherSizeChange} />
                </div>}
                {(snapMode == SNAP_MODE_OPTIONS.OTHER) && <div className="w-full col-span-1">
                    <label htmlFor="ae73a344-0c94-40d1-b7f9-56516099c813">Precise Sel. Snap</label>
                    <input type="number" className={TAILWIND_INPUT_CLASS_NAME} id="ae73a344-0c94-40d1-b7f9-56516099c813" value={precisionSnapOtherSize} onChange={onPrecisionSnapOtherSizeChange} />
                </div>}
            </div>

            <div className={`grid grid-cols-4 gap-4`}>
                <div className="mb-4 w-full col-span-2">
                    <h4 className="mb-1 font-bold">Approximate Selector</h4>
                    <img onMouseLeave={onSheetMouseLeave} onMouseEnter={onSheetMouseEnter} onMouseMove={onSheetMouseMove} onClick={onSheetMouseClick} alt="Tile Selection" src={tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)?.url} ref={tileSheetImgRef} />
                </div>
                <div className="mb-4 w-full col-span-2" ref={preciseSelectorContainerRef}>
                    <h4 className="mb-1 font-bold">Precise Selector</h4>

                    <style ref={precisionTileSelectionStyleRef}>
                    </style>
                    <div
                        className="precise-tile-selection-container"
                        style={{
                            "--scale": preciseSelectorScale,
                            "--tile-size": tileSize,
                            "--tile-sheet-height-unitless": tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)?.height,
                            "--tile-sheet-width-unitless": tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)?.width,
                            "--selected-x-unitless": displayLocation.x,
                            "--selected-y-unitless": displayLocation.y,
                            "--url": `url("${tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)?.url}")`
                        }}
                    >
                        <div className="precise-tile-selection-tilesheet" onClick={onPreciseTileSelectionClick}>
                            <svg className="precise-tile-selection-grid" xmlns="http://www.w3.org/2000/svg">
                                <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" />
                                <line x1="66.67%" y1="0" x2="66.67%" y2="100%" stroke="white" strokeWidth="1" />
                                <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" />
                                <line x1="0" y1="66.67%" x2="100%" y2="66.67%" stroke="white" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>


                    <div className="grid grid-cols-2">
                        <div className="mr-2 my-2">
                            <label htmlFor="94b7a866-c49a-4999-b167-a6f205861b59">Sheet X</label>
                            <input placeholder="x" min={0} type="Number" autoComplete="off" id="94b7a866-c49a-4999-b167-a6f205861b59" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetXManualInputChange} value={selectedLocation?.x ?? 0} />
                        </div>
                        <div className="ml-2 my-2">
                            <label htmlFor="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769">Sheet Y</label>
                            <input placeholder="x" min={0} type="Number" autoComplete="off" id="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetYManualInputChange} value={selectedLocation?.y ?? 0} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PreciseTileSelector;