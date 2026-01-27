import './TileSetDefinitionEditor.css';

import { useContext, useEffect, useRef, useState } from "react";
import { PNG } from 'pngjs/browser'

import { ChocoWinAbstractPixelReader, ChocoWinColor, ChocoWinRegionPixelReader, ChocoWinSettings, ChocoWinWindow, TileTransformationTypes, WrapReaderForTileTransformation } from "../../ChocoWindow";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioWindowRegionDefinition, CHOCO_WINDOW_REGIONS } from "../../ChocoStudio";
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from '../../ChocoWinPngJsReaderWriter';

import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { TileSheetBlobUrlDictionary } from '../SettingsModal';

import PreciseTileSelector from './tile-selector-components/PreciseTileSelector';
import TileTransformationSelector from './tile-selector-components/TileTransformationSelector'
import PixelTransparencyOverideSelector from './tile-selector-components/PixelTransparencyOverideSelector';
import WindowRegionDefinition from './tile-selector-components/WindowRegionDefinition';

// Tiles in the sheet tile selection.
const MAX_COLOR_COUNT = ChocoWinSettings.suggestedMaximumTileSheetColorCount;

export class TileAssignment {
    /** @type {number} */ x;
    /** @type {number} */ y;
    /** @type {TileTransformationTypes} */ geometricTransformation;
    /** @type {{x: number, y: number}[]} */ transparencyOverrides;
    /** @type {ChocoWinAbstractPixelReader} */ baseReader;
    /** @type {ChocoWinAbstractPixelReader} */ transformedReader;
}

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
const TileSetDefinitionEditor = ({ tileSetDefinition, tileSheets, onTileSetDefinitionChange, onTileSetDefinitionDelete, onReturnToEditor }) => {
    const hasChangeHandler = onTileSetDefinitionChange && typeof onTileSetDefinitionChange == "function";
    const hasDeleteHandler = onTileSetDefinitionDelete && typeof onTileSetDefinitionDelete == "function";
    const readerFactory = new ChocoWinPngJsPixelReaderFactory();

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                         STATE AND REF HOOKS                          //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // basic fields
    const [name, setName] = useState(tileSetDefinition.name);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    /** @type {ReturnType<typeof useState<ChocoStudioTileSheet>>} */
    const [selectedTileSheet, setSelectedTileSheet] = useState(null);
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);
    const [lastRegionDefinitionChangeTime, setLastRegionDefinitionChangeTime] = useState(Date.now());

    // tile sheet
    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);

    // colors
    const [defaultColors, setDefaultColors] = useState(tileSetDefinition.defaultColors);

    // preview
    const previewImgRef = useRef(null);
    const previewBlobUrlRef = useRef({ url: "" });
    const [previewTileScale, setPreviewTileScale] = useState(3);
    /** @type {ReturnType<typeof useState<ChocoWinAbstractPixelReader>>} */
    const [tileSheetReader, setTileSheetReader] = useState(null);
    /** @type {ReturnType<typeof useState<TileAssignment>>} */
    const [activeTileSheetAssignment, setActiveTileSheetAssignment] = useState(null)

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //


    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // prepare the selected tile sheet
    useEffect(() => {
        if (tileSheetId) {
            const tileSheet = tileSheets.find((ts) => ts.id == tileSheetId)

            if (!tileSheetBlobUrlDictionary.has(tileSetDefinition.tileSheetId)) {
                // If the tile sheet PNG isn't in the blob dictionary, we should assume we're loading this tile sheet for the first time.
                tileSheetBlobUrlDictionary.setDataUrl(tileSheet.id, tileSheets.find((ts) => ts.id == tileSheet.id)?.imageDataUrl);
            }
            setSelectedTileSheet(tileSheet);
        }
    }, [tileSheetId])

    // initial render
    useEffect(() => {
        if (tileSetDefinition && lastRegionDefinitionChangeTime) {
            // Because the default state of lastRegionDefinitionChangeTime is
            // non-null, this will run as soon as there is a tile set
            // definition.

            updatePreviewRef(tileSetDefinition);
        }
    }, [tileSetDefinition, lastRegionDefinitionChangeTime, previewTileScale])

    useEffect(() => {
        setTileSheetReader(null);
        const url = tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId);
        if (url) {
            fetch(url).
                then(r => r.blob()).
                then(b => {
                    const tileSheetReader = readerFactory.build({ blob: b });
                    tileSheetReader.isReady().then(r => setTileSheetReader(r))
                })
        }
    }, [tileSetDefinition, tileSheetBlobUrlDictionary]);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // domain object field event and action handlers
    // // // // // // // // // // // // // // // // //

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

    const deleteTileSetDefinitionOnClick = () => {
        if (hasDeleteHandler) {
            onTileSetDefinitionDelete(tileSetDefinition.id);
        }
    };

    // tile component event handlers
    // // // // // // // // // // // // // // 

    /** */
    const onRegionDefinitionChange = () => {
        setLastRegionDefinitionChangeTime(Date.now());
    };

    /**
     * @param {TileAssignment} retrievedAssignment 
     */
    const onTileAssignmentRetrieved = (retrievedAssignment) => {
        if (tileSheetReader) {
            // Uncertain what the circumstances are under which there would be
            // no tile sheet reader.
            // todo: assess that comment
            const baseReader = new ChocoWinRegionPixelReader(
                tileSheetReader,
                {
                    x: retrievedAssignment.x,
                    y: retrievedAssignment.y,
                    height: tileSize,
                    width: tileSize,
                }
            )
            const transformedReader = WrapReaderForTileTransformation(baseReader, retrievedAssignment.geometricTransformation);

            setActiveTileSheetAssignment({
                x: retrievedAssignment.x,
                y: retrievedAssignment.y,
                geometricTransformation: retrievedAssignment.geometricTransformation,
                transparencyOverrides: retrievedAssignment.transparencyOverrides,
                baseReader: baseReader,
                transformedReader: transformedReader,
            });
        }
    }

    /**
     * @param {{x: Number, y: Number}} coordinates 
     */
    const onTileSelectionMade = (coordinates) => {
        if (coordinates && tileSheetBlobUrlDictionary && tileSetDefinition && tileSheetReader) {
            const tileReader = new ChocoWinRegionPixelReader(
                tileSheetReader,
                {
                    x: coordinates.x,
                    y: coordinates.y,
                    width: tileSize,
                    height: tileSize,
                }
            )
            tileReader.isReady().then(r => {
                setActiveTileSheetAssignment({
                    x: coordinates.x,
                    y: coordinates.y,
                    geometricTransformation: TileTransformationTypes.BASE,
                    baseReader: r,
                    transformedReader: r,
                    transparencyOverrides: [],
                })
            });
        }
    }

    /**
     * @param {Object} args
     * @param {String} args.transformationType
     * @param {ChocoWinAbstractPixelReader} args.reader
     * @param {String} args.blobUrl
     */
    const onTransformationSelectionMade = ({ transformationType, reader, blobUrl }) => {
        setActiveTileSheetAssignment({
            x: activeTileSheetAssignment.x,
            y: activeTileSheetAssignment.y,
            geometricTransformation: transformationType,
            baseReader: activeTileSheetAssignment.baseReader,
            transformedReader: reader,
            transparencyOverrides: activeTileSheetAssignment.transparencyOverrides,
        });
        onTileSetDefinitionChange(tileSetDefinition);
    }

    /**
     * @param {{x: number, y: number}[]} pixels 
     */
    const onTransparencyOverrideSelectionMade = (pixels) => {
        setActiveTileSheetAssignment({
            x: activeTileSheetAssignment.x,
            y: activeTileSheetAssignment.y,
            geometricTransformation: activeTileSheetAssignment.transformationType,
            baseReader: activeTileSheetAssignment.baseReader,
            transformedReader: activeTileSheetAssignment.transformedReader,
            transparencyOverrides: pixels,
        });
    }











    // todo: reorganize this



    /**
     * @param {ChocoStudioTileSetDefinition} newTileSetDefinition
     */
    const updatePreviewRef = (newTileSetDefinition) => {
        if (previewTileScale < 1) { return; }
        if (!previewImgRef?.current) { return; }
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
            if (!previewImgRef?.current) {
                console.warn("previewRef.current falsy after it was truthy");
                return;
            }

            const writer = new ChocoWinPngJsPixelWriter(450, 180);
            chocoWin.drawTo(writer);

            const blob = writer.makeBlob();
            const newUrl = URL.createObjectURL(blob);
            if (previewBlobUrlRef.current) {
                URL.revokeObjectURL(previewBlobUrlRef.current.url);
            }
            previewBlobUrlRef.current.url = newUrl;
            previewImgRef.current.src = newUrl;
        });
    }

    // tile selection and assignment state and reference objects
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const styleRef = useRef(null);


    const [colorCount, setColorCount] = useState(0);
    const [tooManyColors, setTooManyColors] = useState(false);
    const [showLowerUi, setShowLowerUi] = useState(tileSetDefinition.tileSheetId ? true : false);


    // preview state and reference objects
    // // // // // // // // // // // // // // // // // // // // // // // // //


    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               HOOKS                                  //
    // // // // // // // // // // // // // // // // // // // // // // // // //








    // preview hooks
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // draw the preview
    // useEffect(() => {
    //     if (showLowerUi && previewRef && previewRef.current && tileSheets && tileSetDefinition && tileSetDefinition.tileSize) {
    //         updatePreviewRef(tileSetDefinition)
    //     }
    // }, [showLowerUi, previewRef, tileSheets, tileSetDefinition, previewTileScale])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          EVENT HANDLERS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //


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

                Object.keys(CHOCO_WINDOW_REGIONS).forEach((whichRegion) => {
                    const /** @type {ChocoStudioWindowRegionDefinition} */ region = tileSetDefinition.regions[whichRegion];

                    for (let rowIdx = 0; rowIdx < region.colCount; rowIdx++) {
                        for (let colIdx = 0; colIdx < region.rowCount; colIdx++) {
                            const tsp = region.get(rowIdx, colIdx);

                            for (let x = tsp.xSheetCoordinate; x < tsp.xSheetCoordinate + tileSize; x++) {
                                for (let y = tsp.ySheetCoordinate; y < tsp.ySheetCoordinate + tileSize; y++) {
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
                        }
                    }
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
            <WindowRegionDefinition
                tileSetDefinition={tileSetDefinition}
                tileSize={tileSize}
                tileSheet={selectedTileSheet}
                activeTileSheetAssignment={activeTileSheetAssignment}
                onChangeMade={onRegionDefinitionChange}
                onTileAssignmentRetrieved={onTileAssignmentRetrieved}
            />
            <PreciseTileSelector
                tileSetDefinition={tileSetDefinition}
                tileSize={tileSize}
                defaultHelpVisible={true}
                activeTileSheetAssignment={activeTileSheetAssignment}
                onSelectionMade={onTileSelectionMade}
            />

            {
                activeTileSheetAssignment ?
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='w-full'>
                            <TileTransformationSelector activeTileSheetAssignment={activeTileSheetAssignment} onSelectionMade={onTransformationSelectionMade} />
                        </div>
                        <div className='w-full'>
                            <PixelTransparencyOverideSelector activeTileSheetAssignment={activeTileSheetAssignment} onSelectionMade={onTransparencyOverrideSelectionMade} />
                        </div>
                    </div> :
                    <div className="w-full">
                        <h4 className="my-3 font-bold">Tile Transformation & Transparency Override</h4>
                        <p className="mb-2 text-sm mx-6">Select a position in the tile sheet to set transformation and tranparency overrides.</p>
                    </div>
            }

            <h3 className="mb-2 mt-4 text-xl">Window Preview</h3>

            <div className={`grid grid-cols-4 gap-4 mb-2 mx-6 text-sm`}>
                <div>
                    <label htmlFor="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1">Preview Tile Scale</label>
                    <input min={1} placeholder="Preview Tile Scale" type="Number" autoComplete="off" id="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1" className={TAILWIND_INPUT_CLASS_NAME} value={previewTileScale} onChange={(e) => setPreviewTileScale(e.target.value)} />
                </div>
            </div>

            <p className="mb-2 text-sm mx-6">This is a preview of what a window with this tile set definition will look like.</p>

            <div className='mx-6' id="tileSetPreviewDiv" ><img alt="Window Preview" src={null} ref={previewImgRef} /></div>

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