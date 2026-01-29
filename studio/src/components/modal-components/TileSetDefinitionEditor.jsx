import './TileSetDefinitionEditor.css';

import { useContext, useEffect, useRef, useState } from "react";
import { PNG } from 'pngjs/browser'

import { ChocoWinAbstractPixelReader, ChocoWinColor, ChocoWinRegionPixelReader, ChocoWinSettings, ChocoWinWindow, TileTransformationTypes, WrapReaderForTileTransformation } from "../../ChocoWindow";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioWindowRegionDefinition, CHOCO_WINDOW_REGIONS, ChocoStudioWindowRegionTileAssignment } from "../../ChocoStudio";
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from '../../ChocoWinPngJsReaderWriter';

import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { TileSheetBlobUrlDictionary } from '../SettingsModal';

import PreciseTileSelector from './tile-selector-components/PreciseTileSelector';
import TileTransformationSelector from './tile-selector-components/TileTransformationSelector'
import PixelTransparencyOverideSelector from './tile-selector-components/PixelTransparencyOverideSelector';
import WindowRegionDefinition from './tile-selector-components/WindowRegionDefinition';

export class AssignableTileInfo {
    /** @type {number} */ xSheetCoordinate;
    /** @type {number} */ ySheetCoordinate;
    /** @type {TileTransformationTypes} */ geometricTransformation;
    /** @type {{x: number, y: number}[]} */ transparencyOverrides;
    /** @type {ChocoWinAbstractPixelReader} */ baseReader;
    /** @type {ChocoWinAbstractPixelReader} */ transformedReader;
}

/**
 * 
 * @param {ChocoWinColor[]} colors 
 * @returns {ChocoWinColor[]}
 */
const cloneColors = (colors) => colors?.map(c => new ChocoWinColor(c));

/**
 * @param {Object<string, ChocoStudioWindowRegionDefinition>} region 
 * @returns {Object<string, ChocoStudioWindowRegionDefinition>}
 */
const cloneRegions = (regions) => Object.fromEntries(
    Array.from(Object.entries(regions)).map(
        arr => [
            arr[0], new ChocoStudioWindowRegionDefinition(arr[1])
        ]
    )
)

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
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const MAX_COLOR_COUNT = ChocoWinSettings.suggestedMaximumTileSheetColorCount;

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                         STATE AND REF HOOKS                          //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const readerFactoryRef = useRef(new ChocoWinPngJsPixelReaderFactory());

    const [name, setName] = useState(tileSetDefinition.name);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    const [tileSheet, setTileSheet] = useState(tileSheets?.find(ts => ts?.id == tileSetDefinition?.tileSheetId));
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);

    const [hasChanges, setHasChanges] = useState(false);
    /** @type {ReturnType<typeof useState<number>>} */
    const [lastTileSetDefinitionChangeTimeout, setLastTileSetDefinitionChangeTimeout] = useState(null);

    const [previewImageUrl, setPreviewImageUrl] = useState("");


    const [regions, setRegions] = useState(cloneRegions(tileSetDefinition.regions));




    // tile sheet
    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);

    // colors
    const [defaultColors, setDefaultColors] = useState(cloneColors(tileSetDefinition.defaultColors));

    // preview
    const [previewTileScale, setPreviewTileScale] = useState(3);
    /** @type {ReturnType<typeof useState<ChocoWinAbstractPixelReader>>} */
    const [tileSheetReader, setTileSheetReader] = useState(null);
    /** @type {ReturnType<typeof useState<EditorTileAssignment>>} */
    const [assignableTileInfo, setAssignableTileInfo] = useState(null)
    const previewState = useRef({ url: "", drawInterval: null, stopTimeout: null });
    const [tileSheetReady, setTileSheetReady] = useState(false);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // revoke the preview blob URL
    useEffect(() => {
        return () => {
            if (previewState?.current) {
                URL.revokeObjectURL(previewState.current.url);
            }
        }
    }, [previewState])

    // prepare the selected tile sheet
    useEffect(() => {
        if (!tileSheetBlobUrlDictionary.has(tileSheetId)) {
            const dataUrl = tileSheets.find((ts) => ts.id == tileSheetId)?.imageDataUrl;
            if (!dataUrl) { return; }

            setTileSheetReady(false);
            // If the tile sheet PNG isn't in the blob dictionary, we should assume we're loading this tile sheet for the first time.
            tileSheetBlobUrlDictionary.
                setDataUrl(tileSheetId, dataUrl).
                then(() => setTileSheetReady(true));
        }
    }, [tileSheetId])

    // debounce text input; for simplicity, all changes are routed through here
    useEffect(() => {
        if (hasChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(lastTileSetDefinitionChangeTimeout);
            const timeout = setTimeout(() => {
                setHasChanges(false);
                uponTileSetDefinitionChange();
            }, 100);
            setLastTileSetDefinitionChangeTimeout(timeout);
        }
    }, [name, tileSheets, tileSheetId, tileSize, hasChanges])

    useEffect(() => {
        if (tileSetDefinition) {
            updatePreviewImageBlob();
        }
    }, [tileSetDefinition, previewTileScale])

    // // periodically redraw the preview while the user is repeatedly updating
    // // the state (e.g., dragging the down mouse over a color field) and stop
    // // when the user has stopped updating the state.
    // useEffect(() => {
    //     const updatePeriod = 1000;
    //     const state = previewState?.current;
    //     if (state) {
    //         if (!state.drawInterval) {
    //             updatePreviewImageBlob();

    //             state.drawInterval = setInterval(() => {
    //                 updatePreviewImageBlob();
    //             }, updatePeriod);
    //         }

    //         clearTimeout(state.stopTimeout);
    //         state.stopTimeout = setTimeout(() => {
    //             clearInterval(state.drawInterval);
    //             state.drawInterval = null;
    //             updatePreviewImageBlob();
    //         }, updatePeriod / 4);
    //     }
    // }, [tileSize, regions])

    // tile sheet reader
    useEffect(() => {
        setTileSheetReader(null);
        const tileSheetData = tileSheetBlobUrlDictionary.get(tileSetDefinition.tileSheetId);
        if (tileSheetData?.blob) {
            const tileSheetReader = readerFactoryRef.current.build({ blob: tileSheetData.blob });
            tileSheetReader.isReady().then(r => setTileSheetReader(r));
        }
    }, [tileSetDefinition, tileSheetBlobUrlDictionary]);

    // revoke the preview blob URL
    useEffect(() => {
        return () => {
            if (previewState?.current) {
                URL.revokeObjectURL(previewState.current.url);
            }
        }
    }, [previewState])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * 
     */
    const uponTileSetDefinitionChange = () => {
        const newTileSetDefinition = new ChocoStudioTileSetDefinition(tileSetDefinition);
        newTileSetDefinition.name = name;
        newTileSetDefinition.regions = cloneRegions(regions);
        newTileSetDefinition.tileSheetId = tileSheetId;
        newTileSetDefinition.tileSize = tileSize;
        newTileSetDefinition.defaultColors = cloneColors(defaultColors);
        onTileSetDefinitionChange(newTileSetDefinition);
        updatePreviewImageBlob();
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // domain object field event and action handlers
    // // // // // // // // // // // // // // // // //

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onNameChange = (inputEvent) => {
        setName(inputEvent.target.value);
        setHasChanges(true);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTileSheetIdChange = (inputEvent) => {
        const newTileSheetId = inputEvent.target.value;
        const selectedTileSheet = tileSheets.find(ts => ts.id == newTileSheetId);

        setTileSheetId(newTileSheetId);
        setTileSheet(selectedTileSheet);
        setHasChanges(true);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTileSizeChange = (inputEvent) => {
        setTileSize(Number(inputEvent.target.value));
        setHasChanges(true);
    }

    // tile component event handlers
    // // // // // // // // // // // // // // 

    /**
     * @param {Object} args 
     * @param {String} args.regionIdentifier
     * @param {number} args.colCount
     * @param {number} args.rowCount
     */
    const onRegionResized = ({ regionIdentifier, colCount, rowCount }) => {
        const newRegions = cloneRegions(regions);
        newRegions[regionIdentifier].colCount = colCount;
        newRegions[regionIdentifier].rowCount = rowCount;
        setRegions(newRegions);
        setHasChanges(true);
    }

    /**
     * @param {Object} args 
     * @param {String} args.regionIdentifier
     * @param {number} args.colIndex
     * @param {number} args.rowIndex
     */
    const onAssignmentMade = ({ regionIdentifier, colIndex, rowIndex }) => {
        const newRegions = cloneRegions(regions);
        newRegions[regionIdentifier].set(rowIndex, colIndex, assignableTileInfo);
        setRegions(newRegions);
        setHasChanges(true);
    };







    /**
     * 
     */
    const onGenerateColorPaletteButtonClick = () => {
        const png = new PNG();


        tileSheetBlobUrlDictionary.
            get(tileSheetId).
            blob.
            arrayBuffer().
            then(buffer => png.parse(buffer));

        png.on("parsed", () => {
            const /** @type {Array<ChocoWinColor>} */ colors = [];
            const /** @type {Set<String>} */ colorStrings = new Set();

            Object.keys(CHOCO_WINDOW_REGIONS).forEach((whichRegion) => {
                const /** @type {ChocoStudioWindowRegionDefinition} */ region = tileSetDefinition.regions[whichRegion];

                for (let rowIdx = 0; rowIdx < region.colCount; rowIdx++) {
                    for (let colIdx = 0; colIdx < region.rowCount; colIdx++) {
                        const tsp = region.get(rowIdx, colIdx);
                        if (!tsp) continue;
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
                setDefaultColors(colors);
                setHasChanges(true);
            }
        })
    }














    /**
     * @param {AssignableTileInfo} retrievedAssignment 
     */
    const onTileAssignmentRetrieved = (retrievedAssignment) => {
        if (tileSheetReader) {
            // Uncertain what the circumstances are under which there would be
            // no tile sheet reader.
            // todo: assess that comment
            const baseReader = new ChocoWinRegionPixelReader(
                tileSheetReader,
                {
                    x: retrievedAssignment.xSheetCoordinate,
                    y: retrievedAssignment.ySheetCoordinate,
                    height: tileSize,
                    width: tileSize,
                }
            )
            const transformedReader = WrapReaderForTileTransformation(baseReader, retrievedAssignment.geometricTransformation);

            setAssignableTileInfo({
                xSheetCoordinate: retrievedAssignment.xSheetCoordinate,
                ySheetCoordinate: retrievedAssignment.ySheetCoordinate,
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
                setAssignableTileInfo({
                    xSheetCoordinate: coordinates.x,
                    ySheetCoordinate: coordinates.y,
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
        setAssignableTileInfo({
            xSheetCoordinate: assignableTileInfo.xSheetCoordinate,
            ySheetCoordinate: assignableTileInfo.ySheetCoordinate,
            geometricTransformation: transformationType,
            baseReader: assignableTileInfo.baseReader,
            transformedReader: reader,
            transparencyOverrides: assignableTileInfo.transparencyOverrides,
        });
        onTileSetDefinitionChange(tileSetDefinition);
    }

    /**
     * @param {{x: number, y: number}[]} pixels 
     */
    const onTransparencyOverrideSelectionMade = (pixels) => {
        setAssignableTileInfo({
            xSheetCoordinate: assignableTileInfo.xSheetCoordinate,
            ySheetCoordinate: assignableTileInfo.ySheetCoordinate,
            geometricTransformation: assignableTileInfo.transformationType,
            baseReader: assignableTileInfo.baseReader,
            transformedReader: assignableTileInfo.transformedReader,
            transparencyOverrides: pixels,
        });
    }

    /**
     * @param {ChocoStudioTileSetDefinition} newTileSetDefinition 
     */
    const updatePreviewImageBlob = () => {
        console.log('update the preview');

        if (previewTileScale < 1) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
        if (!tileSheet) return;
        const tileSet = tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl);

        let chocoWin = new ChocoWinWindow({
            x: 0,
            y: 0,
            w: 450,
            h: 180,
            tileScale: previewTileScale,
            winTileSet: tileSet,
            readerFactory: readerFactoryRef.current
        });

        chocoWin.isReady().then(() => {
            const writer = new ChocoWinPngJsPixelWriter(450, 180);
            chocoWin.drawTo(writer);

            let blob = writer.makeBlob();
            URL.revokeObjectURL(previewState.current.url);

            const newUrl = URL.createObjectURL(blob);
            previewState.current.url = newUrl;
            setPreviewImageUrl(newUrl);
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



    // domain object UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //


    // color palette UI element event handlers
    // // // // // // // // // // // // // // // // // // // // // // // // //



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
                tileSheetReader={tileSheetReader}
                assignableTileInfo={assignableTileInfo}
                onRegionResized={onRegionResized}
                onAssignmentMade={onAssignmentMade}
                onTileAssignmentRetrieved={onTileAssignmentRetrieved}
            />
            <PreciseTileSelector
                tileSetDefinition={tileSetDefinition}
                tileSize={tileSize}
                defaultHelpVisible={true}
                assignableTileInfo={assignableTileInfo}
                onSelectionMade={onTileSelectionMade}
            />

            {
                assignableTileInfo ?
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='w-full'>
                            <TileTransformationSelector assignableTileInfo={assignableTileInfo} onSelectionMade={onTransformationSelectionMade} />
                        </div>
                        <div className='w-full'>
                            <PixelTransparencyOverideSelector assignableTileInfo={assignableTileInfo} onSelectionMade={onTransparencyOverrideSelectionMade} />
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

            <div className='mx-6' id="tileSetPreviewDiv" ><img alt="Window Preview" src={previewImageUrl} /></div>

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
            <button onClick={() => onTileSetDefinitionDelete(tileSetDefinition.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Set Definition</button>
        </div>
    </>
}

export default TileSetDefinitionEditor