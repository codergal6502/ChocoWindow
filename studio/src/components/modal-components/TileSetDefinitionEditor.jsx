import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoWinWindow } from "../../ChocoWindow";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet, CHOCO_WINDOW_REGIONS } from "../../ChocoStudio";
import './TileSetDefinitionEditor.css';
import { Polyline, Rect, Canvas, FabricImage } from 'fabric'

// Tiles in the sheet tile selection.
const TILES_IN_STS = 3;
const BIGGEST_ZOOM_FACTOR = 6;

// See https://bikeshedd.ing/posts/use_state_should_require_a_dependency_array/.

/**
 * @param {object} props
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Function} props.onTileSetDefinitionChange
 * @param {Function} props.onTileSetDefinitionDelete
 * @param {Function} props.onReturnToCanvas
 * @returns {JSX.Element}
 */
const TileSetDefinitionEditor = ({ tileSetDefinition, tileSheets, onTileSetDefinitionChange, onTileSetDefinitionDelete, onReturnToCanvas }) => {
    const hasChangeHandler = onTileSetDefinitionChange && typeof onTileSetDefinitionChange == "function";
    const hasDeleteHandler = onTileSetDefinitionDelete && typeof onTileSetDefinitionDelete == "function";

    // const [substituteColors, setSubstituteColors] = useState([]);
    // const [substituteColorsDelayed, setSubstituteColorsDelayed] = useState([]);

    const wholeTileSheetContainerRef = useRef(null);
    const preciseSelectionContainerRef = useRef(null);
    const preciseSelectionZoomedRef = useRef(null);
    const preciseSelectionGridRef = useRef(null);
    const tileAssignmentContainerRef = useRef(null);
    const previewRef = useRef(null);

    // Domain Object Field States
    const [name, setName] = useState(tileSetDefinition.name);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);
    const [regions, setRegions] = useState(structuredClone(tileSetDefinition.regions));

    // Editor-Only Field States
    const [windowRegionIdentifier, setWindowRegionIdentifier] = useState(CHOCO_WINDOW_REGIONS.TOP_LEFT);
    const [tileSheetSnapSelectionMode, setTileSheetSnapSelectionMode] = useState(true);

    // Other Editor State
    const [showLowerUi, setShowLowerUi] = useState(tileSetDefinition.tileSheetId ? true : false);
    const [wholeTileSheetUrl, setWholeTileSheetUrl] = useState(tileSheets.find((ts) => ts.id == tileSetDefinition?.tileSheetId)?.imageDataUrl);
    const [wholeTileSheetImage, setWholeTileSheetImage] = useState(null);

    useEffect(() => {
        if (!showLowerUi) return;
        const image = FabricImage.fromURL(wholeTileSheetUrl);
        image.then((i) => setWholeTileSheetImage(i));
    }, [showLowerUi, wholeTileSheetUrl, tileSheetId])

    const [sheetTileLocation, setSheetTileLocation] = useState(null);
    const [sheetTileSelectionRenderPos, setSheetTileSelectionRenderPos] = useState(null);

    const [sheetTileSelectionSemiLocked, setSheetTileSelectionSemiLocked] = useState(false);

    // Tile assignment for position select buttons
    const [tileAssignmentTileSize, setTileAssignmentTileSize] = useState(tileSize || 24);

    // Scale and size (width and height) for the tile selection
    const [sheetTileSelectionUiScale, setsheetTileSelectionUiScale] = useState(3);
    const [sheetTileSelectionUiSize, setSheetTileSelectionUiSize] = useState(tileSize * 3 || 72);

    // Initial load drawing.
    useEffect(() => {
        if (showLowerUi && previewRef && previewRef.current && tileSheets && tileSetDefinition && tileSetDefinition.tileSize) {
            updatePreviewRef(tileSetDefinition)
        }
    }, [showLowerUi, previewRef, tileSheets, tileSetDefinition])

    // draw grid over precise selection grid.
    useEffect(() => {
        if (showLowerUi && preciseSelectionGridRef && preciseSelectionGridRef.current) {
            const canvas = new Canvas('canvasId');
            const lineWidth = 1;
            const gridTileLength = sheetTileSelectionUiSize / TILES_IN_STS;
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
                { x: gridTileLength, y: sheetTileSelectionUiSize }
            ], true);

            drawPolyline([
                { x: gridTileLength * 2, y: 0 },
                { x: gridTileLength * 2, y: sheetTileSelectionUiSize }
            ]);

            drawPolyline([
                { x: 0, y: gridTileLength },
                { x: sheetTileSelectionUiSize, y: gridTileLength }
            ]);

            drawPolyline([
                { x: 0, y: gridTileLength * 2 },
                { x: sheetTileSelectionUiSize, y: gridTileLength * 2 }
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
    }, [showLowerUi, preciseSelectionGridRef, sheetTileSelectionUiScale, sheetTileSelectionUiSize])

    useEffect(() => {
        if (!showLowerUi) return;
        // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.

        const regionTileWidth = regions[windowRegionIdentifier].width || 1;
        if (!tileAssignmentContainerRef.current || !regions[windowRegionIdentifier]) {
            setTileAssignmentTileSize(tileSize);
        }
        else {
            // Similar to the tile selection size, but this changes dynamically with how many tiles the region is.
            const possibleScale = Math.floor((tileAssignmentContainerRef.current.offsetWidth / regionTileWidth - 4 * regionTileWidth) / tileSize);
            setTileAssignmentTileSize(tileSize * Math.min(BIGGEST_ZOOM_FACTOR, possibleScale));
        }

    }, [showLowerUi, tileAssignmentContainerRef, tileSize, regions, windowRegionIdentifier])

    useEffect(() => {
        if (!showLowerUi) return;
        // See https://www.w3tutorials.net/blog/problem-with-arbitrary-values-on-tailwind-with-react/.
        if (!preciseSelectionContainerRef.current) {
            setSheetTileSelectionUiSize(TILES_IN_STS * tileSize);
        }
        else {
            // Similar to the region tile selection width, but this is always three tiles square.
            const possibleScale = Math.floor((preciseSelectionContainerRef.current.parentElement.offsetWidth / 3 - 12) / tileSize);
            const actualScale = Math.min(BIGGEST_ZOOM_FACTOR, possibleScale);
            setsheetTileSelectionUiScale(actualScale);
            setSheetTileSelectionUiSize(TILES_IN_STS * tileSize * actualScale);
        }
    }, [showLowerUi, tileSize, preciseSelectionContainerRef])

    useEffect(() => {
        if (!showLowerUi) return;
        if (wholeTileSheetContainerRef && wholeTileSheetContainerRef.current) {
            const tileSheet = tileSheets.find((ts) => ts.id == tileSheetId);
            if (tileSheet && tileSheet.imageDataUrl) {
                wholeTileSheetContainerRef.current.src = tileSheet.imageDataUrl;

                setWholeTileSheetUrl(tileSheet.imageDataUrl);
                return;
            }
        }
    }, [showLowerUi, wholeTileSheetContainerRef, tileSheetId])

    /**
     * @param {function(ChocoStudioTileSetDefinition): void} propModCallback
     */
    const doOnTileSetDefinitionChange = (propModCallback) => {
        const newTileSetDefinition = new ChocoStudioTileSetDefinition(tileSetDefinition);
        if (hasChangeHandler) {
            if (propModCallback && typeof propModCallback == "function") {
                propModCallback(newTileSetDefinition);
            }

            onTileSetDefinitionChange(newTileSetDefinition);
            updatePreviewRef(newTileSetDefinition);
        }
    }

    /**
     * @param {InputEvent} e
     */
    const onNameChange = (e) => {
        setName(e.target.value);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.name = e.target.value);
    };

    /**
     * @param {InputEvent} e
     */
    const onTileSheetIdChange = (e) => {
        setTileSheetId(e.target.value);
        if (!showLowerUi) setShowLowerUi(true);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.tileSheetId = e.target.value);
    };

    /**
     * @param {InputEvent} e
     */
    const onTileSizeChange = (e) => {
        setTileSize(Number(e.target.value));
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.tileSize = Number(e.target.value))
    }

    /**
     * @param {InputEvent} e 
     */
    const onWindowRegionIdentifierChange = (e) => {
        setWindowRegionIdentifier(e.target.value);
    }

    /**
     * @param {InputEvent} e
     */
    const onRegionWidthChange = (e) => {
        const newRegions = structuredClone(regions);
        newRegions[windowRegionIdentifier].width = e.target.value;
        setRegions(newRegions);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegions);
    };

    /**
     * @param {InputEvent} e
     */
    const onRegionHeightChange = (e) => {
        const newRegionSizes = structuredClone(regions);
        newRegionSizes[windowRegionIdentifier].height = e.target.value;
        setRegions(newRegionSizes);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegionSizes);
    };

    const showTileSheetTileInSheetTileSelection = (clientX, clientY) => {
        if (!showLowerUi || !wholeTileSheetContainerRef || !wholeTileSheetContainerRef.current) return;

        /** @type {DOMRect} */ const rect = wholeTileSheetContainerRef.current.getBoundingClientRect();

        const imageWidth = wholeTileSheetContainerRef.current.naturalWidth;
        const imageHeight = wholeTileSheetContainerRef.current.naturalHeight;
        const x = Math.max(0, Math.min(Math.round(clientX - rect.left + 1), imageWidth));
        const y = Math.max(0, Math.min(Math.round(clientY - rect.top + 1), imageHeight));

        // At sx = 0,          dx = tileSize * sheetTileSelectionUiScale
        // At sx = imageWidth, dx = -imageWidth * sheetTileSelectionUiScale + 2 * tileSize * sheetTileSelectionUiScale
        // The slope of dx relative to sx is:
        // (dx1 - dx0) / (sx1 - sx0)
        // (-imageWidth * sheetTileSelectionUiScale + 2 * tileSize * sheetTileSelectionUiScale - )
        //
        // And analogously for y.
        const pos = {
            x: tileSize * sheetTileSelectionUiScale + x * (-imageWidth * sheetTileSelectionUiScale + tileSize * sheetTileSelectionUiScale) / imageWidth,
            y: tileSize * sheetTileSelectionUiScale + y * (-imageHeight * sheetTileSelectionUiScale + tileSize * sheetTileSelectionUiScale) / imageHeight,
        };

        if (tileSheetSnapSelectionMode) {
            pos.x = tileSize * sheetTileSelectionUiScale * Math.round(pos.x / (tileSize * sheetTileSelectionUiScale));
            pos.y = tileSize * sheetTileSelectionUiScale * Math.round(pos.y / (tileSize * sheetTileSelectionUiScale));
        }

        setSheetTileLocation({ x: Math.floor(tileSize - pos.x / sheetTileSelectionUiScale), y: Math.floor(tileSize - pos.y / sheetTileSelectionUiScale) });
        setSheetTileSelectionRenderPos(pos);
    }

    const onPreviewMouseEnter = () => {
        setSheetTileSelectionSemiLocked(false);
    }

    /**
     * @param {MouseEvent} e 
     */
    const onPreviewMouseMove = (e) => {
        if (!sheetTileSelectionSemiLocked) {
            showTileSheetTileInSheetTileSelection(e.clientX, e.clientY);
        }
    }

    /**
     * @param {MouseEvent} e 
     */
    const onPreviewMouseClick = (e) => {
        setSheetTileSelectionSemiLocked(true);
        showTileSheetTileInSheetTileSelection(e.clientX, e.clientY);
    }

    const onPreviewMouseLeave = () => {
        // setSheetTileSelectionRenderPos(null);
    }

    const getTileAssignmentButtonBackgroundForRegion = (region) => {
        const result = getTileAssignmentButtonBackground(region?.x, region?.y)
        return result;
    };

    const getTileAssignmentButtonBackground = (tileSheetX, tileSheetY) => {
        if (!wholeTileSheetImage || Number(tileSheetX) != tileSheetX || Number(tileSheetY) != tileSheetY) {
            return;
        }

        const canvas = new Canvas('c');

        wholeTileSheetImage.set({
            clipPath: new Rect({
                left: 0,
                top: 0,
                width: wholeTileSheetImage.width,
                height: wholeTileSheetImage.height,
                absolutePositioned: true,
                originX: "left",
                originY: "top",
            }),
            left: -tileSheetX,
            top: -tileSheetY,
        })

        wholeTileSheetImage.originX = 'left';
        wholeTileSheetImage.originY = 'top';

        canvas.width = tileSize;
        canvas.height = tileSize;
        canvas.add(wholeTileSheetImage);
        const result = canvas.toDataURL();
        canvas.renderAll();
        canvas.remove(wholeTileSheetImage);
        return result;
    }

    const setTileAssignmentButtonBackground = (button, tileSheetX, tileSheetY) => {
        const specificTileDataUrl = getTileAssignmentButtonBackground(tileSheetX, tileSheetY);

        button.style.backgroundImage = `url(${specificTileDataUrl})`;
        button.style.backgroundSize = "100%";
    }

    /**
     * @param {ChocoStudioTileSetDefinition} newTileSetDefinition
     */
    const updatePreviewRef = (newTileSetDefinition) => {

        if (!previewRef.current) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == newTileSetDefinition.tileSheetId);
        if (!tileSheet) return;
        const tileSet = newTileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl);

        let chocoWin = new ChocoWinWindow(tileSet, 3, 0, 0, 450, 180);
        chocoWin.isReady().then(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 450;
            canvas.height = 180;
            canvas.style.imageRendering = "pixelated";

            const /** @type {CanvasRenderingContext2D} */ ctx = canvas.getContext("2d", { willReadFrequently: true, colorSpace: "srgb", colorType: "unorm8", });
            ctx.imageSmoothingEnabled = false;

            chocoWin.drawTo(ctx);

            let dataUrl = canvas.toDataURL("image/png", 1);
            previewRef.current.src = dataUrl;
        });
    }

    /**
     * @param {PointerEvent} e 
     * @param {Number} tileIndexX 
     * @param {Number} tileIndexY 
     */
    const tileAssignmentButtonOnClick = (e, tileIndexX, tileIndexY) => {
        // Update the UI.
        if (!wholeTileSheetImage) {
            console.error("wholeTileSheetImage isn't loaded by the user tile assignment happeend.");
            return;
        }
        setTileAssignmentButtonBackground(e.target, sheetTileLocation?.x ?? 0, sheetTileLocation?.y ?? 0);

        // Store the selection.
        const newRegions = structuredClone(regions);
        if (!newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY]) {
            newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY] = []
        }
        newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY][tileIndexX] = { x: sheetTileLocation?.x, y: sheetTileLocation?.y };
        setRegions(newRegions);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegions);
    }

    const doOnTileSetDefinitionDelete = (id) => {
        if (hasDeleteHandler) {
            onTileSetDefinitionDelete(tileSetDefinition.id);
        }
    }

    const deleteTileSetDefinitionOnClick = () => {
        doOnTileSetDefinitionDelete(tileSetDefinition.id);
    };

    return <>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600 mb-2">Tile Set Definition <span className="text-sm">({tileSetDefinition.id})</span></h2>
        <p className="mb-2 mx-6 text-sm italic">A tile set definition identifies locations in the sprite sheet for a window's corner tiles, repeating edge tiles, and repeating center tiles.</p>

        <div className={`grid grid-cols-4 gap-4`}>
            <div className="mb-4 w-full">
                <label htmlFor="e4486061-7422-490d-be92-533ff31711a1">Name:</label>
                <input placeholder="Tile Set Name" type="text" autoComplete="off" id="e4486061-7422-490d-be92-533ff31711a1" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
            </div>
            <div className="mb-4 w-full">
                <label htmlFor="170eb33f-6cf9-453e-aad0-eaff6db6bb65">Tile Sheet:</label>
                <select id="170eb33f-6cf9-453e-aad0-eaff6db6bb65" className={TAILWIND_INPUT_CLASS_NAME} onChange={onTileSheetIdChange} value={tileSheetId}>
                    {(tileSheets.findIndex((ts) => ts.id == tileSheetId) < 0) && <option key="none" value=""></option>}
                    {tileSheets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="mb-4 w-full">
                <label htmlFor="443fd77f-4bfc-489d-aad7-10948ef9a77d">Tile Size:</label>
                <input placeholder="Tile Size" type="Number" autoComplete="off" id="443fd77f-4bfc-489d-aad7-10948ef9a77d" className={TAILWIND_INPUT_CLASS_NAME} value={tileSize} onChange={onTileSizeChange} />
            </div>
        </div>

        {showLowerUi && <>
            <h3 className="mb-1 font-bold text-xl">Window Regions</h3>
            <p className="mb-2 text-sm italic mx-6">There are nine window regions: four corners, four edges, and the center. Top and bottom edges will repeat horizontally. Left and right edges will repeat vertically. The center will repeat in both directions.</p>
            <div className={`grid grid-cols-10 gap-4`}>
                <div className="col-span-4 w-full">
                    <label htmlFor="fca684ea-2f2e-459a-ae5c-99e602f3d57e">Window Region:</label>
                    <select className={TAILWIND_INPUT_CLASS_NAME} id="fca684ea-2f2e-459a-ae5c-99e602f3d57e" value={windowRegionIdentifier} onChange={onWindowRegionIdentifierChange}>
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
                    <label htmlFor="cbeb0e41-1266-432d-a3d4-0fbccc65b3e3">Sheet Snap Mode</label>
                    <select className={TAILWIND_INPUT_CLASS_NAME} id="cbeb0e41-1266-432d-a3d4-0fbccc65b3e3" value={tileSheetSnapSelectionMode} onChange={(e) => setTileSheetSnapSelectionMode(String(true) == e.target.value)}>
                        <option value={true}>Tile Size ({tileSize}px)</option>
                        <option value={false}>Do Not Snap</option>
                    </select>
                </div>
                <div className="w-full col-span-2">
                    <label htmlFor="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961">Width (tiles)</label>
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.TOP || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regions[windowRegionIdentifier].width || 1} onChange={onRegionWidthChange} />}
                    {(windowRegionIdentifier != CHOCO_WINDOW_REGIONS.TOP && windowRegionIdentifier != CHOCO_WINDOW_REGIONS.BOTTOM && windowRegionIdentifier != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
                </div>
                <div className="w-full col-span-2">
                    <label htmlFor="7ae42bae-9eeb-4491-be31-00161a3af632">Height (tiles)</label>
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.LEFT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.RIGHT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regions[windowRegionIdentifier].height || 1} onChange={onRegionHeightChange} />}
                    {(windowRegionIdentifier != CHOCO_WINDOW_REGIONS.LEFT && windowRegionIdentifier != CHOCO_WINDOW_REGIONS.RIGHT && windowRegionIdentifier != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
                </div>
                <div className="col-span-10 -mt-4">
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.TOP_LEFT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.TOP_RIGHT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM_LEFT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT) && <p className="mb-2 text-sm italic">Corners can only be 1 tile wide and 1 tile high.</p>}
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.TOP || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.BOTTOM) && <p className="mb-2 text-sm italic">Top and bottom edge pattern can be any number of tiles wide.</p>}
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.LEFT || windowRegionIdentifier == CHOCO_WINDOW_REGIONS.RIGHT) && <p className="mb-2 text-sm italic">Left and right edge pattern can be any number of tiles wide.</p>}
                    {(windowRegionIdentifier == CHOCO_WINDOW_REGIONS.CENTER) && <p className="mb-2 text-sm italic">The center repeated pattern can be any number of tiles wide or high.</p>}
                </div>
            </div>

            <h3 className="mb-1 text-xl font-bold">Tile Selection</h3>
            <p className="mb-2 text-sm mx-6"><span className="italic">First,</span> approximately click on location the tile sheet to load that area into the tile sheet detail selector. <span className="italic">Second,</span> precisely adjust the position or click on an adjacent tile. <span className="italic">Third,</span> click on the tile location to assign that part of the tile sheet to that tile in the regioon. If <span className="italic"> other tiles </span> to be assigned are <span className="italic">adjacent</span> in the tile sheet, use can use the precise tile selection without using the approximate tile selection.</p>
            <div className={`grid grid-cols-3 gap-4`}>
                <div className="mb-4 w-full">
                    <h4 className="mb-1 font-bold">Approximate Tile Selection</h4>
                    <img onMouseEnter={onPreviewMouseEnter} onMouseMove={onPreviewMouseMove} onClick={onPreviewMouseClick} onMouseLeave={onPreviewMouseLeave} className="" alt="Window Preview" src={null} ref={wholeTileSheetContainerRef} />
                </div>

                <div className="mb-4 w-full">
                    <h4 className="mb-1 font-bold">Precise Tile Selection</h4>
                    <div ref={preciseSelectionContainerRef} style={{ '--tile-sel-size': `${sheetTileSelectionUiSize}px` }} className="mb-3 mx-auto tile-sheet-position-selector h-[var(--tile-sel-size)] w-[var(--tile-sel-size)]">
                        <div
                            ref={preciseSelectionZoomedRef}
                            className="w-full h-full sheet-tile-selection-mid-ground"
                            style={{ backgroundImage: `url(${wholeTileSheetUrl})`, backgroundSize: `${wholeTileSheetContainerRef?.current?.naturalWidth * sheetTileSelectionUiScale}px ${wholeTileSheetContainerRef?.current?.naturalHeight * sheetTileSelectionUiScale}px`, backgroundPositionX: sheetTileSelectionRenderPos?.x || 0, backgroundPositionY: sheetTileSelectionRenderPos?.y || 0 }}
                        >
                            <div ref={preciseSelectionGridRef} className="w-full h-full"></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="mr-2 mb-2">
                            <label htmlFor="94b7a866-c49a-4999-b167-a6f205861b59">Sheet X</label>
                            <input placeholder="x" type="Number" autoComplete="off" id="94b7a866-c49a-4999-b167-a6f205861b59" className={TAILWIND_INPUT_CLASS_NAME} value={sheetTileLocation?.x} />
                        </div>
                        <div className="ml-2 mb-2">
                            <label htmlFor="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769">Sheet Y</label>
                            <input placeholder="x" type="Number" autoComplete="off" id="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769" className={TAILWIND_INPUT_CLASS_NAME} value={sheetTileLocation?.y} />
                        </div>
                    </div>
                </div>

                <div ref={tileAssignmentContainerRef} className="mb-4 w-full">
                    <h4 className="mb-1 font-bold">Tile Assignment</h4>
                    <div
                        style={{ '--flex-width': `${regions[windowRegionIdentifier].width * tileAssignmentTileSize}px`, '--col-count': `${regions[windowRegionIdentifier].width}px`, '--tile-size': `${tileAssignmentTileSize}px` }}
                        className="flex flex-wrap w-[var(--flex-width)] mx-auto"
                    >
                        {
                            Array.from({ length: regions[windowRegionIdentifier].height || 1 }).map((_, tileIndexY) =>
                                Array.from({ length: regions[windowRegionIdentifier].width || 1 }).map((_, tileIndexX) =>
                                    <button
                                        onClick={(e) => tileAssignmentButtonOnClick(e, tileIndexX, tileIndexY)}
                                        key={`tile-selector-${tileIndexX}-${tileIndexY}`}
                                        style={{
                                            backgroundImage: `url("${getTileAssignmentButtonBackgroundForRegion(regions?.[windowRegionIdentifier]?.tileSheetPositions?.[tileIndexY]?.[tileIndexX])}")`,
                                            backgroundSize: "100%"
                                        }}
                                        className={`border-t-2 border-l-2 ${(tileIndexY == regions[windowRegionIdentifier].height - 1) && 'border-b-2'} ${(tileIndexX == regions[windowRegionIdentifier].width - 1) && 'border-r-2'} w-[var(--tile-size)] h-[var(--tile-size)] text-xs`}>({tileIndexX + 1}, {tileIndexY + 1})</button>)
                            )
                        }
                    </div>
                </div>

            </div>

            <h3 className="mb-2 mt-4 text-xl">Window Preview</h3>
            <p className="mb-2 text-sm italic">This is a preview of what a window with this tile set definition will look like.</p>
            <div id="tileSetPreviewDiv" ><img alt="Window Preview" src={null} ref={previewRef} /></div>

            <h3 className="mb-2 mt-4 text-xl">Color Palette</h3>
        </>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToCanvas} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
            <button onClick={deleteTileSetDefinitionOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Set Definition</button>
        </div>
    </>
}

export default TileSetDefinitionEditor