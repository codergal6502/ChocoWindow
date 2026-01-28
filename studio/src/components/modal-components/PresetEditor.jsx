import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoStudioPreset, ChocoStudioTileSetDefinition, ChocoStudioTileSheet } from "../../ChocoStudio"
import { ChocoWinWindow, ChocoWinColor } from "../../ChocoWindow";
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from "../../ChocoWinPngJsReaderWriter";

/**
 * @param {Object} props
 * @param {Boolean} props.isSubordinate
 * @param {ChocoStudioPreset} props.preset
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Array<ChocoStudioTileSetDefinition>} props.tileSetDefinitions
 * @param {function(ChocoStudioPreset):void} props.onPresetChange
 * @param {function(String):void} props.onPresetDelete
 * @param {function():void} props.onReturnToEditor
 */
const PresetEditor = ({ preset, tileSheets, tileSetDefinitions, isSubordinate = false, onPresetChange, onPresetDelete, onReturnToEditor }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const DEFAULT_TILE_SCALE = 3;

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const readerFactoryRef = useRef(new ChocoWinPngJsPixelReaderFactory());

    const [name, setName] = useState(preset.name);
    const [tileSetDefinitionId, setTileSetDefinitionId] = useState(preset.tileSetDefinitionId ?? null);
    const [tileScale, setTileScale] = useState(preset.tileScale || DEFAULT_TILE_SCALE);
    const [substituteColors, setSubstituteColors] = useState(preset.substituteColors || []);
    const [hasChanges, setHasChanges] = useState(false);
    const [lastPresetChangeTimeout, setLastPresetChangeTimeout] = useState(null);

    /** @type {ReturnType<typeof useState<String>>} */
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [tileSetDefinition, setTileSetDefinition] = useState(tileSetDefinitions.find((ts) => ts.id == preset.tileSetDefinitionId))
    const previewState = useRef({ url: "", drawInterval: null, stopTimeout: null });

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

    // debounce text input; for simplicity, all changes are routed through here
    useEffect(() => {
        if (hasChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(lastPresetChangeTimeout);
            const timeout = setTimeout(() => uponPresetChange(), 500);
            setLastPresetChangeTimeout(timeout);
        }
    }, [name, tileSetDefinitionId, tileScale, substituteColors, hasChanges])

    // periodically redraw the preview while the user is repeatedly updating
    // the state (e.g., dragging the down mouse over a color field) and stop
    // when the user has stopped updating the state.
    useEffect(() => {
        const updatePeriod = 1000;
        const state = previewState?.current;
        if (state) {
            if (!state.drawInterval) {
                updatePreviewImageBlob();

                state.drawInterval = setInterval(() => {
                    updatePreviewImageBlob();
                }, updatePeriod);
            }

            clearTimeout(state.stopTimeout);
            state.stopTimeout = setTimeout(() => {
                clearInterval(state.drawInterval);
                state.drawInterval = null;
                updatePreviewImageBlob();
            }, updatePeriod / 4);
        }
    }, [tileScale, substituteColors])

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
        newPreset.substituteColors = substituteColors;
        onPresetChange(newPreset);
    }

    /**
     * 
     */
    const updatePreviewImageBlob = () => {
        if (!previewState?.current) { return; }
        if (!readerFactoryRef?.current) { return; }
        if (!tileSetDefinition) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
        if (!tileSheet) { return; }

        let chocoWin = new ChocoWinWindow({
            x: 0,
            y: 0,
            w: 450,
            h: 180,
            tileScale: tileScale ?? 1,
            winTileSet: tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl),
            readerFactory: readerFactoryRef.current,
            colorSubstitutions: substituteColors,
        });

        chocoWin.isReady().then(() => {
            if (!previewState?.current) {
                console.warn("previewState.current falsy after it was truthy");
                return;
            }

            console.log(`1 update blob ${new Date().toLocaleTimeString()}`)
            const writer = new ChocoWinPngJsPixelWriter(450, 180);
            chocoWin.drawTo(writer);

            let blob = writer.makeBlob();
            URL.revokeObjectURL(previewState.current.url);

            const newUrl = URL.createObjectURL(blob);
            previewState.current.url = newUrl;
            setPreviewImageUrl(newUrl);
        });
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
     * @param {object} inputEvent 
     * @param {HTMLInputElement} inputEvent.target
     * @param {number} colorIndex 
     */
    const onColorChange = (inputEvent, colorIndex) => {
        let newSubstituteColors = substituteColors.slice();
        newSubstituteColors[colorIndex] = new ChocoWinColor(inputEvent.target.value);
        setSubstituteColors(newSubstituteColors);
        setHasChanges(true);
    };

    /**
     * @param {number} colorIndex 
     */
    const onColorResetClick = (colorIndex) => {
        let newSubstituteColors = substituteColors.slice();
        delete newSubstituteColors[colorIndex];
        setSubstituteColors(newSubstituteColors);
        setHasChanges(true);
    };

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

        <h3 className="mb-2 mt-4 text-xl">Color Substitutions</h3>
        {(tileSetDefinition?.defaultColors?.length > 0) || <p className="mb-2 text-sm italic">No default colors were generated for the selected tile set definition.</p>}
        {(tileSetDefinition?.defaultColors?.length > 0) && <div className={`grid grid-cols-4 gap-4`}>
            {tileSetDefinition.defaultColors.map((color, i) => <div key={i}>
                <div className="text-sm w-full text-center">Color {i + 1}</div>
                <div className="text-xs w-full text-center">{(substituteColors[i]?.toHexString() ?? color.toHexString())}</div>
                <div><input className="w-full rounded" type="color" value={substituteColors[i]?.toHexString() ?? color.toHexString()} onChange={(e) => onColorChange(e, i)} /></div>
                <div><button className="w-full border mt-1 text-sm border-gray-900 bg-gray-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={(e) => onColorResetClick(i)} >Reset</button></div>
            </div>)}
        </div>}

        <h3 className="mb-2 mt-4 text-xl">Preview</h3>
        <div id="tileSetPreviewDiv" ><img alt="Window Preview" src={previewImageUrl} /></div>

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