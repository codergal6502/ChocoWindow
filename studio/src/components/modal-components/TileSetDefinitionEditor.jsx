import './TileSetDefinitionEditor.css';

import { useContext, useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoWinColor, ChocoWinSettings, ChocoWinWindow, TileTransformationTypes } from "../../ChocoWindow";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioWindowRegionDefinition, CHOCO_WINDOW_REGIONS } from "../../ChocoStudio";
import { Polyline, Rect, Canvas, FabricImage } from 'fabric'
import { PNG } from 'pngjs/browser'
import { TileSheetBlobUrlDictionary } from '../SettingsModal';
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from '../../ChocoWinPngJsReaderWriter';
import { TransformationImages } from '../../TransformationImages';
import PreciseTileSelector from './tile-selector-components/precise-tile-selector';

// Tiles in the sheet tile selection.
const TILES_IN_PTS = 3;
const DEFAULT_PTS_SCALE = 3
const DEFAULT_TA_SCALE = 3
const BIGGEST_ZOOM_FACTOR = 6;
const MAX_COLOR_COUNT = ChocoWinSettings.suggestedMaximumTileSheetColorCount;

// See https://bikeshedd.ing/posts/use_state_should_require_a_dependency_array/.

/**
 * @param {object} props
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Function} props.onTileSetDefinitionChange
 * @param {Function} props.onTileSetDefinitionDelete
 * @param {Function} props.onReturnToEditor
 * @param {Number} props.lastResizeTimestamp
 * @returns {JSX.Element}
 */
const TileSetDefinitionEditor = ({ tileSetDefinition, tileSheets, onTileSetDefinitionChange, onTileSetDefinitionDelete, onReturnToEditor, lastResizeTimestamp }) => {
    const hasChangeHandler = onTileSetDefinitionChange && typeof onTileSetDefinitionChange == "function";
    const hasDeleteHandler = onTileSetDefinitionDelete && typeof onTileSetDefinitionDelete == "function";
    const readerFactory = new ChocoWinPngJsPixelReaderFactory();

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //            STATE, REFERENCE OBJECTS, AND UTILITY METHODS             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);
    const transformationImages = useContext(TransformationImages);

    
    /**
     * @overload
     * @param {ChocoStudioTileSheet} tileSheet
     */
    /**
     * @overload
     * @param {Number} tileSheetId
     */
    const ensureBlobDictionaryHasWholeTileSheet = (arg1) => {
        let /** @type {ChocoStudioTileSheet} */ tileSheet;
        if (String(arg1) === arg1) {
            tileSheet = tileSheets.find((ts) => ts.id == arg1)
        }
        else if (arg1 instanceof ChocoStudioTileSheet) {
            tileSheet = arg1;
        }

        if (!tileSheetBlobUrlDictionary.has(tileSetDefinition.tileSheetId)) {
            // If the tile sheet PNG isn't in the blob dictionary, we should assume we're loading this tile sheet for the first time.
            tileSheetBlobUrlDictionary.setDataUrl(tileSheet.id, tileSheets.find((ts) => ts.id == tileSheet.id)?.imageDataUrl);
        }
    }

    /**
     * @param {ChocoStudioTileSetDefinition} newTileSetDefinition
     */
    const updatePreviewRef = (newTileSetDefinition) => {

        if (!previewRef?.current) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == newTileSetDefinition.tileSheetId);
        if (!tileSheet) return;
        const tileSet = newTileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl);

        let chocoWin = new ChocoWinWindow({
            x: 0,
            y: 0,
            w: 450,
            h: 180,
            tileScale: previewTileScale,
            winTileSet: tileSet,
            readerFactory: readerFactory
        });
        chocoWin.isReady().then(() => {
            if (!previewRef?.current) {
                console.warn("previewRef.current falsy after it was truthy");
                return;
            }

            const writer = new ChocoWinPngJsPixelWriter(450, 180);
            chocoWin.drawTo(writer);

            let dataUrl = writer.makeDataUrl();
            previewRef.current.src = dataUrl;
        });
    }

    // domain object state and reference objects
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [name, setName] = useState(tileSetDefinition.name);
    const [selectedTileSheet, setSelectedTileSheet] = useState(null);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);
    const [regions, setRegions] = useState(structuredClone(tileSetDefinition.regions));
    const [defaultColors, setDefaultColors] = useState(tileSetDefinition.defaultColors);

    // tile selection and assignment state and reference objects
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const wholeTileSheetContainerRef = useRef(null);
    const preciseSelectionContainerRef = useRef(null);
    const preciseSelectionZoomedRef = useRef(null);
    const preciseSelectionGridRef = useRef(null);
    const tileAssignmentContainerRef = useRef(null);
    const styleRef = useRef(null);

    const [selectedTileLocation, setSelectedTileLocation] = useState(null);
    const [sheetTileSelectionSemiLocked, setSheetTileSelectionSemiLocked] = useState(false);

    const [preciseSelectionBackgroundPosition, setPreciseSelectionBackgroundPosition] = useState(null);
    const [preciseTileSelectionScale, setPreciseTileSelectionScale] = useState(DEFAULT_PTS_SCALE);
    const [preciseTileSelectionSize, setPreciseTileSelectionSize] = useState(tileSetDefinition.tileSize * TILES_IN_PTS * DEFAULT_PTS_SCALE ?? 72);
    const [tileAssignmentTileSize, setTileAssignmentTileSize] = useState(tileSetDefinition.tileSize * DEFAULT_TA_SCALE ?? 24);
    const [preciseTileSelectionTransformationImages, setPreciseTileSelectionTransformationImages] = useState([]);

    const [selectedTileTransformation, setSelectedTileTransformation] = useState(TileTransformationTypes.BASE);

    // workflow state and reference objects
    const [windowRegionIdentifier, setWindowRegionIdentifier] = useState(CHOCO_WINDOW_REGIONS.TOP_LEFT);
    const [tileSheetSnapSelectionMode, setTileSheetSnapSelectionMode] = useState(true);
    const [colorCount, setColorCount] = useState(0);
    const [tooManyColors, setTooManyColors] = useState(false);
    const [showLowerUi, setShowLowerUi] = useState(tileSetDefinition.tileSheetId ? true : false);
    const [wholeTileSheetImage, setWholeTileSheetImage] = useState(null);
    const [previewTileScale, setPreviewTileScale] = useState(3);

    // preview state and reference objects
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const previewRef = useRef(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               HOOKS                                  //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // tile selection and assignment hooks
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // store a Fabric image for the selected tile sheet once one is selected.
    useEffect(() => {
        if (!showLowerUi) return;

        ensureBlobDictionaryHasWholeTileSheet(tileSheetId)
        FabricImage
            .fromURL(tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId))
            .then((i) => setWholeTileSheetImage(i));

    }, [showLowerUi, tileSheetId])

    // set approximate selection image source to the whole tile sheet image 
    useEffect(() => {
        if (!showLowerUi || !wholeTileSheetContainerRef?.current || !tileSheetId) {
            return;
        }

        ensureBlobDictionaryHasWholeTileSheet(tileSheetId);
        wholeTileSheetContainerRef.current.src = tileSheetBlobUrlDictionary.get(tileSheetId);

    }, [showLowerUi, tileSheetId, wholeTileSheetContainerRef])

    // set the precise tile selection scale and total size
    useEffect(() => {
        if (!showLowerUi) return;
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
    }, [showLowerUi, tileSize, preciseSelectionContainerRef, lastResizeTimestamp])

    // draw grid over precise tile selection
    useEffect(() => {
        if (showLowerUi && preciseSelectionGridRef && preciseSelectionGridRef.current) {
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
    }, [showLowerUi, preciseSelectionGridRef, preciseTileSelectionScale, preciseTileSelectionSize, lastResizeTimestamp])

    const transformationNameLabels = {
        [TileTransformationTypes.BASE]: "No Transformation",
        [TileTransformationTypes.ROTATE_90]: "Rotate 90º",
        [TileTransformationTypes.ROTATE_180]: "Rotate 180º",
        [TileTransformationTypes.ROTATE_270]: "Rotate 270º",
        [TileTransformationTypes.REFLECT_HORIZONTAL]: "Horizontal",
        [TileTransformationTypes.REFLECT_VERTICAL]: "Vertical",
        [TileTransformationTypes.REFLECT_ASCENDING]: "Ascending Diag.",
        [TileTransformationTypes.REFLECT_DESCENDING]: "Descending Diag.",
    }

    // precise tile image button styles
    useEffect(() => {
        if (transformationImages && styleRef && styleRef.current) {
            transformationImages.isReady().then(tiArray => {
                const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;
                tiArray.forEach(ti => {
                    const isDarkPart = ti.isDark ? "dark-" : "light-";
                    const newRule = `.${isDarkPart}${ti.transformationName} { background-image: url(${ti.url}); background-size: 100%; width: 48px; height: 48px; display: block; }`;
                    styleSheet.insertRule(newRule);
                })
                setPreciseTileSelectionTransformationImages(tiArray);
            })
        }
    }, [transformationImages, styleRef])

    // set up the tile assignment grid
    useEffect(() => {
        if (!showLowerUi || !tileAssignmentContainerRef) return;
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

    }, [showLowerUi, tileAssignmentContainerRef, tileSize, regions, windowRegionIdentifier, lastResizeTimestamp])

    // preview hooks
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // draw the preview
    useEffect(() => {
        if (showLowerUi && previewRef && previewRef.current && tileSheets && tileSetDefinition && tileSetDefinition.tileSize) {
            updatePreviewRef(tileSetDefinition)
        }
    }, [showLowerUi, previewRef, tileSheets, tileSetDefinition, previewTileScale])

    /**
     * Updates state refrenced by the precile tile selection CSS.
     * @param {Object} args
     * @param {MouseEvent} args.mouseEvent The mouse event if triggered by a mouse event
     * @param {Number} naturalX The "natural" X coordinate to use; will be overriden by mouse event.
     * @param {Number} naturalY The "natural" Y coordinate to use; will be overriden by mouse event.
     * @param {Booealn} overrideSnap Whether or not to ignore the snap-to-grid settings.
     */
    const showTileSheetTileInSheetTileSelection = ({ mouseEvent, naturalX, naturalY, overrideSnap = false }) => {
        if (!showLowerUi || !wholeTileSheetContainerRef || !wholeTileSheetContainerRef.current) return;

        const imageWidth = wholeTileSheetContainerRef.current.naturalWidth;
        const imageHeight = wholeTileSheetContainerRef.current.naturalHeight;

        if (mouseEvent) {
            /** @type {DOMRect} */ const rect = wholeTileSheetContainerRef.current.getBoundingClientRect();
            const ratio = imageWidth / rect.width;

            naturalX = Math.max(0, Math.min(Math.floor(ratio * (mouseEvent.clientX - rect.left)), imageWidth));
            naturalY = Math.max(0, Math.min(Math.floor(ratio * (mouseEvent.clientY - rect.top)), imageHeight));
        }

        if (!overrideSnap && tileSheetSnapSelectionMode) {
            naturalX = tileSize * Math.floor(naturalX / tileSize);
            naturalY = tileSize * Math.floor(naturalY / tileSize);
        }

        const preciseTilePosition = {
            x: preciseTileSelectionScale * (tileSize - naturalX),
            y: preciseTileSelectionScale * (tileSize - naturalY),
        };

        setSelectedTileLocation({ x: naturalX, y: naturalY });
        setPreciseSelectionBackgroundPosition(preciseTilePosition);
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          EVENT HANDLERS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {String} id 
     */
    const doOnTileSetDefinitionDelete = (id) => {
        if (hasDeleteHandler) {
            onTileSetDefinitionDelete(tileSetDefinition.id);
        }
    }

    const deleteTileSetDefinitionOnClick = () => {
        doOnTileSetDefinitionDelete(tileSetDefinition.id);
    };

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

    // domain object UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //
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
        setSelectedTileSheet(tileSheets.find(ts => ts.id == e.target.value));
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

    // workflow UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //

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
        newRegions[windowRegionIdentifier].width = Number(e.target.value);
        newRegions[windowRegionIdentifier].tileSheetPositions.length = Math.max(newRegions[windowRegionIdentifier].tileSheetPositions.length, e.target.value);
        setRegions(newRegions);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegions);
    };

    /**
     * @param {InputEvent} e
     */
    const onRegionHeightChange = (e) => {
        const newRegions = structuredClone(regions);
        newRegions[windowRegionIdentifier].height = Number(e.target.value);
        newRegions[windowRegionIdentifier].tileSheetPositions.forEach((col, rowNum) => {
            if (!col) col = [];
            col.length = Math.max(col.length, e.target.value);
            newRegions[windowRegionIdentifier].tileSheetPositions[rowNum] = col;
        });
        setRegions(newRegions);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegions);
    };

    // tile assignment UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //

    useEffect(() => {

    })

    const onWholeTileSheetMouseEnter = () => {
        setSheetTileSelectionSemiLocked(false);
    }

    /**
     * @param {MouseEvent} e 
     */
    const onWholeTileSheetMouseMove = (e) => {
        if (!sheetTileSelectionSemiLocked) {
            showTileSheetTileInSheetTileSelection({ mouseEvent: e });
        }
    }

    /**
     * @param {MouseEvent} e 
     */
    const onWholeTileSeetMouseClick = (e) => {
        setSheetTileSelectionSemiLocked(true);
        showTileSheetTileInSheetTileSelection({ mouseEvent: e });
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

        showTileSheetTileInSheetTileSelection({ naturalX: deltaSheetX + selectedTileLocation.x, naturalY: deltaSheetY + selectedTileLocation.y, overrideSnap: true });
    }

    /**
     * @param {InputEvent} e 
     */
    const onSheetXManualInputChange = (e) => {
        showTileSheetTileInSheetTileSelection({ naturalX: Number(e.target.value), naturalY: selectedTileLocation.y, overrideSnap: true });
    }

    /**
     * @param {InputEvent} e 
     */
    const onSheetYManualInputChange = (e) => {
        showTileSheetTileInSheetTileSelection({ naturalX: selectedTileLocation.x, naturalY: Number(e.target.value), overrideSnap: true });
    }

    /**
     * 
     * @param {InputEvent} e 
     */
    const onSelectTileTransformationChange = (e) => {
        setSelectedTileTransformation(e.target.value);
    }

    /**
     * @param {PointerEvent} e 
     * @param {Number} tileIndexX 
     * @param {Number} tileIndexY 
     */
    const tileAssignmentButtonOnClick = (tileIndexX, tileIndexY) => {
        if (!wholeTileSheetImage) {
            console.error("wholeTileSheetImage isn't loaded when the user tile assignment happeend.");
            return;
        }

        // Store the selection.
        const newRegions = structuredClone(regions);
        if (!newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY]) {
            newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY] = []
        }
        newRegions[windowRegionIdentifier].tileSheetPositions[tileIndexY][tileIndexX] = { x: selectedTileLocation?.x, y: selectedTileLocation?.y, geometricTransformation: selectedTileTransformation };
        setRegions(newRegions);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regions = newRegions);
    }

    // color palette UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {Array.<ChocoWinColor> } newDefaultColors 
     */
    const onDefaultColorsChange = (newDefaultColors) => {
        setDefaultColors(newDefaultColors);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.defaultColors = newDefaultColors);
    };

    const onGenerateColorPaletteButtonClick = () => {
        fetch(tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)).then((response) => response.body).then((body) => {
            const png = new PNG();
            const reader = body.getReader();
            reader
                .read()
                .then((v) => png.write(v.value))
                .finally(() => { });

            png.on("parsed", () => {
                const /** @type {Array<ChocoWinColor>} */ colors = [];
                const /** @type {Set<String>} */ colorStrings = new Set();
                const y = 192;

                Object.keys(CHOCO_WINDOW_REGIONS).forEach((whichRegion) => {
                    const /** @type {ChocoStudioWindowRegionDefinition} */ r = regions[whichRegion];
                    r.tileSheetPositions.filter((_, cn) => cn < r.width).forEach((tspRow) => {
                        tspRow.filter((_, rn) => rn < r.height).forEach((tsp) => {
                            for (let x = tsp.x; x < tsp.x + tileSize; x++) {
                                for (let y = tsp.y; y < tsp.y + tileSize; y++) {
                                    const idx = (png.width * y + x) << 2;

                                    const r = png.data[idx];
                                    const g = png.data[idx + 1];
                                    const b = png.data[idx + 2];
                                    const a = png.data[idx + 3];

                                    const rgbaString = `(${r}, ${g}, ${b}, ${a})`;
                                    if (!colorStrings.has(rgbaString)) {
                                        colorStrings.add(rgbaString);
                                        colors[colors.length] = new ChocoWinColor({ r, g, b, a });
                                    }
                                }
                            }
                        })
                    })
                })

                setTooManyColors(colors.length > MAX_COLOR_COUNT);
                setColorCount(colors.length);

                if (colors.length <= MAX_COLOR_COUNT) {
                    onDefaultColorsChange(colors);
                }
            })
        });
    }

    return <>
        <style ref={styleRef}></style>
        <h2 className="text-2xl font-bold sticky top-0 mb-2 bg-white dark:bg-gray-600">Tile Set Definition <span className="text-sm">({tileSetDefinition.id})</span></h2>
        <p className="mb-2 mx-6 text-sm italic">A tile set definition identifies locations in the sprite sheet for a window's tiles.</p>

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
            <PreciseTileSelector tileSetDefinition={tileSetDefinition} tileSheet={selectedTileSheet} tileSize={tileSize} defaultHelpVisible={true} />











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

            <div className={`grid grid-cols-10 gap-4 mb-2`}>
                <div className="w-full col-span-2">
                    <label htmlFor="cbeb0e41-1266-432d-a3d4-0fbccc65b3e3">Sheet Snap Mode</label>
                    <select className={TAILWIND_INPUT_CLASS_NAME} id="cbeb0e41-1266-432d-a3d4-0fbccc65b3e3" value={tileSheetSnapSelectionMode} onChange={(e) => setTileSheetSnapSelectionMode(String(true) == e.target.value)}>
                        <option value={true}>Tile Size ({tileSize}px)</option>
                        <option value={false}>Do Not Snap</option>
                    </select>
                </div>
            </div>
            <div className={`grid grid-cols-3 gap-4`}>
                <div className="mb-4 w-full">
                    <h4 className="mb-1 font-bold">Approximate Tile Selection</h4>
                    <img onMouseEnter={onWholeTileSheetMouseEnter} onMouseMove={onWholeTileSheetMouseMove} onClick={onWholeTileSeetMouseClick} alt="Tile Selection" src={null} ref={wholeTileSheetContainerRef} />
                </div>

                <div className="mb-4 w-full">
                    <h4 className="mb-1 font-bold">Precise Tile Selection</h4>
                    <div ref={preciseSelectionContainerRef} style={{ '--tile-sel-size': `${preciseTileSelectionSize}px` }} className="mb-3 mx-auto tile-sheet-position-selector h-[var(--tile-sel-size)] w-[var(--tile-sel-size)]">
                        <div
                            ref={preciseSelectionZoomedRef}
                            className="w-full h-full sheet-tile-selection-mid-ground"
                            style={{
                                backgroundImage: `url(${tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)})`,
                                imageRendering: 'pixelated',
                                backgroundSize: `${wholeTileSheetContainerRef?.current?.naturalWidth * preciseTileSelectionScale}px ${wholeTileSheetContainerRef?.current?.naturalHeight * preciseTileSelectionScale}px`,
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
                            <input placeholder="x" type="Number" autoComplete="off" id="94b7a866-c49a-4999-b167-a6f205861b59" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetXManualInputChange} value={selectedTileLocation?.x ?? 0} />
                        </div>
                        <div className="ml-2 mb-2">
                            <label htmlFor="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769">Sheet Y</label>
                            <input placeholder="x" type="Number" autoComplete="off" id="e4be39b9-9af0-4de5-8fa5-64ebc9a6f769" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSheetYManualInputChange} value={selectedTileLocation?.y ?? 0} />
                        </div>
                    </div>

                    <h4 className="my-3 font-bold">Tile Transformation</h4>
                    <div className="grid grid-cols-2">
                        {Object.values(TileTransformationTypes).map((transformationName, idx) =>
                            <label className="flex items-center">
                                <input type="radio" name="tile-transformation" className="" key={idx} value={transformationName} checked={selectedTileTransformation == transformationName} onChange={onSelectTileTransformationChange} />
                                <span className={`light-${transformationName} dark:dark-${transformationName}`} />
                                <span>{transformationNameLabels[transformationName]}</span>
                            </label>
                        )}
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
                                        onClick={() => tileAssignmentButtonOnClick(tileIndexX, tileIndexY)}
                                        key={`tile-selector-${tileIndexX}-${tileIndexY}`}
                                        style={{
                                            backgroundImage: `url(${tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId)})`,
                                            backgroundRepeat: "no-repeat",
                                            imageRendering: "pixelated",
                                            backgroundSize: (() => {
                                                return `${wholeTileSheetContainerRef?.current?.naturalWidth * (tileAssignmentTileSize / tileSize)}px ${wholeTileSheetContainerRef?.current?.naturalHeight * (tileAssignmentTileSize / tileSize)}px`;
                                            })(),
                                            backgroundPositionX: (() => {
                                                return (tileAssignmentTileSize / tileSize) * (-tileSetDefinition.regions[windowRegionIdentifier].tileSheetPositions?.[tileIndexY]?.[tileIndexX]?.x ?? 0);
                                            })(),
                                            backgroundPositionY: (() => {
                                                return (tileAssignmentTileSize / tileSize) * (-tileSetDefinition.regions[windowRegionIdentifier].tileSheetPositions?.[tileIndexY]?.[tileIndexX]?.y ?? 0);
                                            })(),
                                        }}
                                        className={`border-t-2 border-l-2 ${(tileIndexY == regions[windowRegionIdentifier].height - 1) && 'border-b-2'} ${(tileIndexX == regions[windowRegionIdentifier].width - 1) && 'border-r-2'} w-[var(--tile-size)] h-[var(--tile-size)] text-xs`}>({tileIndexX + 1}, {tileIndexY + 1})</button>)
                            )
                        }
                    </div>
                </div>
            </div>

            <h3 className="mb-2 mt-4 text-xl">Window Preview</h3>

            <div className={`grid grid-cols-4 gap-4 mb-2 mx-6 text-sm`}>
                <div>
                    <label htmlFor="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1">Preview Tile Scale</label>
                    <input min={1} placeholder="Preview Tile Scale" type="Number" autoComplete="off" id="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1" className={TAILWIND_INPUT_CLASS_NAME} value={previewTileScale} onChange={(e) => setPreviewTileScale(e.target.value)} />
                </div>
            </div>

            <p className="mb-2 text-sm mx-6">This is a preview of what a window with this tile set definition will look like.</p>

            <div className='mx-6' id="tileSetPreviewDiv" ><img alt="Window Preview" src={null} ref={previewRef} /></div>

            <h3 className="mb-2 mt-4 text-xl">Color Palette</h3>
            <button onClick={onGenerateColorPaletteButtonClick} className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Generate Color Palette</button>
            {tooManyColors && <p className="my-2 text-sm mx-6">The selected tiles contain {colorCount} colors but only {MAX_COLOR_COUNT} colors are supported. Please reduce the colors in an external tool or select different tiles.</p>}
            {!tooManyColors && defaultColors && <>
                <h4 className="mb-1 mt-2 font-bold">Default Colors</h4>
                <div className={`grid grid-cols-4 gap-4`}>
                    {defaultColors.map((color, i) =>
                        <div key={i}>
                            <div className="text-sm w-full text-center">Color {i + 1}</div>
                            <div><input className="w-full rounded" type="color" value={defaultColors[i]?.toHexString?.() || color.toHexString()} readOnly /></div>
                        </div>
                    )}
                </div>
            </>}
        </>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
            <button onClick={deleteTileSetDefinitionOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Set Definition</button>
        </div>
    </>
}

export default TileSetDefinitionEditor