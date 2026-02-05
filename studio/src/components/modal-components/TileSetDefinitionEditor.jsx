import './TileSetDefinitionEditor.css';

import { useContext, useEffect, useState } from "react";

import { ChocoWinAbstractPixelReader, ChocoColor, ChocoWinRegionPixelReader, TileTransformationTypes, WrapReaderForTileTransformation } from "../../ChocoWindow";
import { ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioWindowRegionDefinition, CHOCO_REGION_GRANULARITY } from "../../ChocoStudio";

import { ReaderFactoryForStudio, TileSheetBlobUrlDictionary } from '../../App';
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"

import PreciseTileSelector from './tile-selector-components/PreciseTileSelector';
import TileTransformationSelector from './tile-selector-components/TileTransformationSelector'
import PixelTransparencyOverideSelector from './tile-selector-components/PixelTransparencyOverideSelector';
import WindowRegionDefinition from './tile-selector-components/WindowRegionDefinition';
import TileSetColorPalette from './TileSetColorPalette';
import WindowPreview from './WindowPreview';

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
 * @param {ChocoColor[]} colors 
 * @returns {ChocoColor[]}
 */
const cloneColors = (colors) => colors?.map(c => new ChocoColor(c));

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
const TileSetDefinitionEditor = ({ tileSetDefinition, tileSheets, onTileSetDefinitionChange, onTileSetDefinitionDuplicate, onTileSetDefinitionDelete, onReturnToEditor }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const readerFactory = useContext(ReaderFactoryForStudio);
    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    
    // domain object fields
    // // // // // // // // // // // // // // // // //
    const [name, setName] = useState(tileSetDefinition.name);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);
    const [granularity, setGranularity] = useState(tileSetDefinition.granularity);
    const [hasFieldChanges, setHasFieldChanges] = useState(false);
    
    const [tileSheetReader, setTileSheetReader] = useState(null);
    const [regions, setRegions] = useState(cloneRegions(tileSetDefinition.regions));
    /** @type {ReturnType<typeof useState<number>>} */
    const [lastTileSetDefinitionChangeTimeout, setLastTileSetDefinitionChangeTimeout] = useState(null);
    /** @type {ReturnType<typeof useState<AssignableTileInfo>>} */
    const [assignableTileInfo, setAssignableTileInfo] = useState(null)

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                        NEW UTILITY FUNCTIONS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * Used by the debouncer.
     */
    const uponTileSetDefinitionChange = () => {
        const newTileSetDefinition = new ChocoStudioTileSetDefinition(tileSetDefinition);
        newTileSetDefinition.name = name;
        newTileSetDefinition.tileSheetId = tileSheetId;
        newTileSetDefinition.tileSize = tileSize;
        newTileSetDefinition.granularity = granularity;
        onTileSetDefinitionChange(newTileSetDefinition);
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                              NEW EFFECTS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // get the tile sheet reader for the selected tile sheet.
    useEffect(() => {
        if (tileSheetId && tileSheetBlobUrlDictionary) {
            setTileSheetReader(null);
            let tileSheetData = tileSheetBlobUrlDictionary.ensureTileSheetBlob(tileSheetId, tileSheets);
            const tileSheetReader = readerFactory.build({ blob: tileSheetData.blob });
            tileSheetReader.isReady().then(r => setTileSheetReader(r));
        }
    }, [tileSheetId, tileSheetBlobUrlDictionary]);

    // debounce text input; for simplicity, all changes are routed through here
    useEffect(() => {
        if (hasFieldChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(lastTileSetDefinitionChangeTimeout);
            const timeout = setTimeout(() => {
                setHasFieldChanges(false);
                uponTileSetDefinitionChange();
            }, 100);
            setLastTileSetDefinitionChangeTimeout(timeout);
        }
    }, [name, tileSheetId, tileSize, granularity, hasFieldChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // debounce text input
    useEffect(() => {
        if (hasFieldChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(lastTileSetDefinitionChangeTimeout);
            const timeout = setTimeout(() => {
                setHasFieldChanges(false);
                uponTileSetDefinitionChange();
            }, 100);
            setLastTileSetDefinitionChangeTimeout(timeout);
        }
    }, [name, tileSheetId, tileSize, granularity, hasFieldChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // domain object fields
    // // // // // // // // // // // // // // // // //

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onNameChange = (inputEvent) => {
        setName(inputEvent.target.value);
        setHasFieldChanges(true);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTileSheetIdChange = (inputEvent) => {
        const newTileSheetId = inputEvent.target.value;

        setTileSheetId(newTileSheetId);
        setHasFieldChanges(true);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTileSizeChange = (inputEvent) => {
        setTileSize(Number(inputEvent.target.value));
        setHasFieldChanges(true);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onGranularityChange = (inputEvent) => {
        const newGranularity = inputEvent.target.value;
        setGranularity(inputEvent.target.value);
        setHasFieldChanges(true);
    }

    // tile component event handlers
    // // // // // // // // // // // // // // 

    /**
     * @param {{[key: string]: ChocoStudioWindowRegionDefinition}} regionDictionary 
     */
    const onWindowRegionDefinitionChange = (regionDictionary) => {
        const newTileSetDefinition = new ChocoStudioTileSetDefinition(tileSetDefinition);
        newTileSetDefinition.regions = regionDictionary;
        setRegions(regionDictionary);
        onTileSetDefinitionChange(newTileSetDefinition);
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
            geometricTransformation: assignableTileInfo.geometricTransformation,
            baseReader: assignableTileInfo.baseReader,
            transformedReader: assignableTileInfo.transformedReader,
            transparencyOverrides: pixels,
        });
        onTileSetDefinitionChange(tileSetDefinition);
    }

    return <>
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
            <div className="mb-4 w-full">
                <label htmlFor="047920d3-aabb-4e9f-93c9-a275c9297e23">Granularity:</label>
                <select className={TAILWIND_INPUT_CLASS_NAME} id="047920d3-aabb-4e9f-93c9-a275c9297e23" value={granularity} onChange={onGranularityChange}>
                    <option value={CHOCO_REGION_GRANULARITY.SINGLE_TILE_EDGES}>Single-Tile Edges</option>
                    <option value={CHOCO_REGION_GRANULARITY.BASIC_EDGES}>Basic Edges</option>
                    <option value={CHOCO_REGION_GRANULARITY.ARBITRARY_EDGES}>Arbitrary Edges</option>
                </select>
            </div>
        </div>

        {((tileSheetReader && tileSetDefinition?.tileSheetId) ? true : false) && <>
            <WindowRegionDefinition
                regions={tileSetDefinition.regions}
                tileSize={tileSize}
                granularity={granularity}
                tileSheetReader={tileSheetReader}
                assignableTileInfo={assignableTileInfo}
                onTileAssignmentRetrieved={onTileAssignmentRetrieved}
                onChanged={onWindowRegionDefinitionChange}
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

            {tileSheetReader && <TileSetColorPalette tileSheetReader={tileSheetReader} regions={regions} tileSize={tileSize} allowModifications={false} />}

            <WindowPreview tileSetDefinition={tileSetDefinition} tileSheets={tileSheets} />
        </>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
            <button onClick={() => onTileSetDefinitionDuplicate(tileSetDefinition.id)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Duplicate Tile Set Definition</button>
            <button onClick={() => onTileSetDefinitionDelete(tileSetDefinition.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Set Definition</button>
        </div>
    </>
}

export default TileSetDefinitionEditor