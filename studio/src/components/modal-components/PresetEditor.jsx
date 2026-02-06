import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoStudioPreset, ChocoStudioTileSetDefinition, ChocoStudioTileSheet, TEMP_stringifyColorSubstitutions } from "../../ChocoStudio"
import { ChocoColor, ChocoWinAbstractPixelReader } from "../../ChocoWindow";
import { useContext } from "react";
import { ReaderFactoryForStudio, TileSheetBlobUrlDictionary } from "../../App";
import TileSetColorPalette from "./TileSetColorPalette";
import WindowPreview from "./WindowPreview";

/**
 * @param {Object} props
 * @param {Boolean} props.isSubordinate
 * @param {ChocoStudioPreset} props.preset
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Array<ChocoStudioTileSetDefinition>} props.tileSetDefinitions
 * @param {Boolean} props.isSubordinate
 * @param {ChocoColor} props.backgroundColor
 * @param {function(ChocoStudioPreset):void} props.onPresetChange
 * @param {function(String):void} props.onPresetDelete
 * @param {function():void} props.onReturnToEditor
 */
const PresetEditor = ({ preset, tileSheets, tileSetDefinitions, isSubordinate = false, onPresetChange, onPresetDelete, onReturnToEditor }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const DEFAULT_TILE_SCALE = 3;
    const readerFactory = useContext(ReaderFactoryForStudio);
    const tileSheetBlobUrlDictionary = useContext(TileSheetBlobUrlDictionary);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [name, setName] = useState(preset.name);
    const [tileSetDefinitionId, setTileSetDefinitionId] = useState(preset.tileSetDefinitionId ?? null);
    const [tileScale, setTileScale] = useState(preset.tileScale || DEFAULT_TILE_SCALE);
    const [substituteColors, setSubstituteColors] = useState(preset.substituteColors);
    const [hasChanges, setHasChanges] = useState(false);
    const lastPresetChangeTimeoutRef = useRef(0);

    /** @type {ReturnType<typeof useState<ChocoWinAbstractPixelReader>>} */
    const [tileSheetReader, setTileSheetReader] = useState(null);
    const [tileSetDefinition, setTileSetDefinition] = useState(tileSetDefinitions.find((ts) => ts.id == preset.tileSetDefinitionId))

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // debounce text input; for simplicity, all changes are routed through here
    useEffect(() => {
        if (hasChanges && lastPresetChangeTimeoutRef) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(lastPresetChangeTimeoutRef.current);
            lastPresetChangeTimeoutRef.current = setTimeout(() => uponPresetChange(), 125);
        }
    }, [name, tileSetDefinitionId, tileScale, hasChanges, lastPresetChangeTimeoutRef])

    // get the tile sheet reader for the selected tile sheet.
    useEffect(() => {
        if (tileSetDefinition?.tileSheetId && tileSheetBlobUrlDictionary) {
            setTileSheetReader(null);
            let tileSheetData = tileSheetBlobUrlDictionary.ensureTileSheetBlob(tileSetDefinition.tileSheetId, tileSheets);
            const tileSheetReader = readerFactory.build({ blob: tileSheetData.blob });
            tileSheetReader.isReady().then(r => setTileSheetReader(r));
        }
    }, [tileSetDefinition?.tileSheetId, tileSheetBlobUrlDictionary]);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * 
     */
    const uponPresetChange = () => {
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.name = name;
        newPreset.tileSetDefinitionId = tileSetDefinitionId;
        newPreset.tileScale = tileScale;
        onPresetChange(newPreset);
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

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
    const onTileSetDefinitionIdChange = (inputEvent) => {
        const newTileSetDefinitionId = inputEvent.target.value;
        const selectedTileSetDefinition = tileSetDefinitions.find(tsd => tsd.id == newTileSetDefinitionId);

        setTileSetDefinitionId(newTileSetDefinitionId);
        setTileSetDefinition(selectedTileSetDefinition);
        setSubstituteColors([]);
        setHasChanges(true);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTileScaleChange = (inputEvent) => {
        setTileScale(Number(inputEvent.target.value));
        setHasChanges(true);
    };

    /**
     * @param {{defaultColor: ChocoColor, substituteColor: ChocoColor}[]} newColorSubstitutions
     */
    const onColorPaletteChange = (newColorSubstitutions) => {
        setSubstituteColors(newColorSubstitutions);
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.substituteColors = newColorSubstitutions.map(cs => ({ defaultColor: cs.defaultColor, substituteColor: cs.substituteColor }));
        onPresetChange(newPreset);
    }

    return <>
        {
            isSubordinate || <>
                <h2 className="text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">Preset Settings <span className="text-sm">({preset.id})</span></h2>
                <p className="mb-2 text-sm italic">You can use presets to reuse the same settings on multiple windows.</p>

                <div className="mb-4 w-full">
                    <label htmlFor="e4486061-7422-490d-be92-533ff31711a1">Name: </label>
                    <input placeholder="Preset Name" type="text" autoComplete="off" id="e4486061-7422-490d-be92-533ff31711a1" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
                </div>
            </>
        }

        <div className="mb-4 w-full">
            <label htmlFor="7ed0e6ee-47bf-48ff-b54b-d919c60faad5">Tile Set Definition: </label>
            <select id="7ed0e6ee-47bf-48ff-b54b-d919c60faad5" className={TAILWIND_INPUT_CLASS_NAME} onChange={onTileSetDefinitionIdChange} value={tileSetDefinitionId}>
                {preset.tileSetDefinitionId || <option key={""} value={""}>-</option>}
                {tileSetDefinitions.map((ts) => <option key={ts.id} value={ts.id}>{ts.name}</option>)}
            </select>
        </div>

        <div className="w-full">
            <label htmlFor="59731ce7-1ab4-4ea1-a08e-1bf5a43d1f4e">Tile Scale: </label>
            <input placeholder="Tile Scale" type="number" min={1} max={10} id="59731ce7-1ab4-4ea1-a08e-1bf5a43d1f4e" className={TAILWIND_INPUT_CLASS_NAME} value={tileScale} onChange={onTileScaleChange} />
        </div>

        <TileSetColorPalette colorSubstitutions={substituteColors} allowModifications={true} regions={tileSetDefinition.regions} tileSize={tileSetDefinition.tileSize} tileSheetReader={tileSheetReader} onChange={onColorPaletteChange} />

        <WindowPreview tileSetDefinition={tileSetDefinition} tileSheets={tileSheets} preset={preset} colorSubstitutions={substituteColors} fixedTileScale={tileScale} />
        {
            isSubordinate || <>
                <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                <div className="flex justify-between">
                    <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
                    <button onClick={() => onPresetDelete(preset.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Preset</button>
                </div>
            </>
        }
    </>
}

export default PresetEditor;