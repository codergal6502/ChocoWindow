import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { ChocoStudioPreset, ChocoStudioTileSetDefinition, ChocoStudioTileSheet, ChocoStudioWindow } from "../../ChocoStudio"
import { ChocoWinWindow } from "../../ChocoWindow";
import PresetEditor from "./PresetEditor";
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from "../../ChocoWinPngJsReaderWriter";

/**
 * @param {Object} props
 * @param {ChocoStudioWindow} props.window
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Array<ChocoStudioPreset>} props.presets
 * @param {Array<ChocoStudioTileSetDefinition>} props.tileSetDefinitions
 * @param {function(ChocoStudioPreset):void} props.onWindowChange
 * @param {function(String):void} props.onWindowDelete
 * @param {function():void} props.onReturnToEditor
 */
const WindowEditor = ({ window, presets, tileSheets, tileSetDefinitions, onWindowChange, onWindowDelete, onReturnToEditor }) => {

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const readerFactoryRef = useRef(new ChocoWinPngJsPixelReaderFactory());

    const [name, setName] = useState(window.name)
    const [geometryX, setGeometryX] = useState(window.x);
    const [geometryY, setGeometryY] = useState(window.y);
    const [geometryW, setGeometryW] = useState(window.w);
    const [geometryH, setGeometryH] = useState(window.h);
    const [presetId, setPresetId] = useState(window.presetId);
    /** @type {ReturnType<typeof useState<ChocoStudioPreset>>} */
    const [singularPreset, setSingularPreset] = useState(window.singularPreset);
    const [hasChanges, setHasChanges] = useState(false);
    const [lastWindowChangeTimeout, setLastWindowChangeTimeout] = useState(null);

    /** @type {ReturnType<typeof useState<String>>} */
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const previewState = useRef({ url: "" });

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    useEffect(() => {
        if (previewState && readerFactoryRef && window && presets && tileSheets && tileSetDefinitions) {
            updatePreviewImageBlob();
        }
    }, [previewState, readerFactoryRef, window, presets, tileSheets, tileSetDefinitions])

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
            clearTimeout(lastWindowChangeTimeout);
            const timeout = setTimeout(() => uponWindowChange(), 500);
            setLastWindowChangeTimeout(timeout);
        }
    }, [name, geometryX, geometryY, geometryW, geometryH, presetId, hasChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * 
     */
    const uponWindowChange = () => {
        const newWindow = new ChocoStudioWindow(window);
        newWindow.name = name;
        newWindow.x = geometryX;
        newWindow.y = geometryY;
        newWindow.w = geometryW;
        newWindow.h = geometryH;
        newWindow.presetId = presetId;
        newWindow.singularPreset = new ChocoStudioPreset(singularPreset);
        updatePreviewImageBlob();
        onWindowChange(newWindow);
    }

    const updatePreviewImageBlob = () => {
        if (!previewState?.current) { return; }
        if (!readerFactoryRef?.current) { return; }
        const preset = presetId ? presets.find((p) => p.id == presetId) : singularPreset;
        if (!preset) { return; }
        if (!readerFactoryRef?.current) { return; }

        const tileSetDefinition = tileSetDefinitions.find((ts) => ts.id == preset.tileSetDefinitionId);
        if (!tileSetDefinition) { return; }

        const tileSheet = tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
        if (!tileSheet) { return; }

        const tileSet = tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl);
        if (!tileSet) { return; }

        let chocoWin = new ChocoWinWindow({
            x: 0,
            y: 0,
            w: geometryW,
            h: geometryH,
            tileScale: preset.tileScale,
            winTileSet: tileSet,
            readerFactory: readerFactoryRef.current,
            colorSubstitutions: preset.substituteColors,
        });

        chocoWin.isReady().then(() => {
            if (!previewState?.current) {
                console.warn("previewState.current falsy after it was truthy");
                return;
            }

            const writer = new ChocoWinPngJsPixelWriter(geometryW, geometryH);
            chocoWin.drawTo(writer);

            const blob = writer.makeBlob();
            const newUrl = URL.createObjectURL(blob);
            previewState.current.url = newUrl;
            setPreviewImageUrl(newUrl);
        });
    };

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onNameChange = (inputEvent) => {
        setName(inputEvent.target.value);
        setHasChanges(true);
    }

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onGeometryXChange = (inputEvent) => {
        setGeometryX(Number(inputEvent.target.value));
        setHasChanges(true);
    }

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onGeometryYChange = (inputEvent) => {
        setGeometryY(Number(inputEvent.target.value));
        setHasChanges(true);
    }

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onGeometryHChange = (inputEvent) => {
        setGeometryH(Number(inputEvent.target.value));
        setHasChanges(true);
    }

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onGeometryWChange = (inputEvent) => {
        setGeometryW(Number(inputEvent.target.value));
        setHasChanges(true);
    }

    /**
     * @param {Object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onPresetIdChange = (inputEvent) => {
        const uuidReg = (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        const maybeUuid = inputEvent.target.value;
        if (uuidReg.test(maybeUuid)) {
            setPresetId(maybeUuid);
        }
        else {
            setPresetId(null);
        }
        setHasChanges(true);
    }

    /**
     * @param {ChocoStudioPreset} singularPreset 
     */
    const onSingularPresetChange = (singularPreset) => {
        setSingularPreset(singularPreset);
        setHasChanges(true);
    }

    return <>
        <h2 className="text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">Window Settings <span className="text-sm">({window.id})</span></h2>
        <p className="mb-2 text-sm italic"></p>
        <div className="mb-4 w-full">
            <label htmlFor="c2c6dc82-1188-41ae-a8ba-24b3c3748b95">Name: </label>
            <input placeholder="Preset Name" type="text" autoComplete="off" id="c2c6dc82-1188-41ae-a8ba-24b3c3748b95" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
        </div>

        <div className={`grid grid-cols-4 gap-4`}>
            <div className="mb-4 w-full">
                <label htmlFor="f6242f82-7376-4e18-9248-a7a6e874d6e4">X Position: </label>
                <input placeholder="Preset Name" type="number" id="f6242f82-7376-4e18-9248-a7a6e874d6e4" className={TAILWIND_INPUT_CLASS_NAME} value={geometryX} onChange={onGeometryXChange} />
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="3da2a38e-6c32-4e9d-8ff9-cac955c3b53e">Y Position: </label>
                <input placeholder="Preset Name" type="number" id="3da2a38e-6c32-4e9d-8ff9-cac955c3b53e" className={TAILWIND_INPUT_CLASS_NAME} value={geometryY} onChange={onGeometryYChange} />
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="4a855c80-d4e1-46b4-ba47-471488280ac7">Width: </label>
                <input placeholder="Preset Name" type="number" id="4a855c80-d4e1-46b4-ba47-471488280ac7" className={TAILWIND_INPUT_CLASS_NAME} value={geometryW} onChange={onGeometryWChange} />
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="df672390-f90b-4033-b0c3-ffbdcbd4139d">Height: </label>
                <input placeholder="Preset Name" type="number" id="df672390-f90b-4033-b0c3-ffbdcbd4139d" className={TAILWIND_INPUT_CLASS_NAME} value={geometryH} onChange={onGeometryHChange} />
            </div>
        </div>

        <div className="mb-4 w-full">
            <label htmlFor="e2820c63-7187-4326-8cd7-822161700f82">Preset: </label>
            <select id="e2820c63-7187-4326-8cd7-822161700f82" className={TAILWIND_INPUT_CLASS_NAME} onChange={onPresetIdChange} value={presetId}>
                <option key="none" value="">- no preset -</option>
                {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>

        {(!presetId) && <PresetEditor isSubordinate={true} preset={window.singularPreset || new ChocoStudioPreset()} tileSheets={tileSheets} tileSetDefinitions={tileSetDefinitions} onPresetChange={onSingularPresetChange} />}
        {(presetId) && <><h3 className="mb-2 mt-4 text-xl">Preview</h3><div id="tileSetPreviewDiv" ><img className="max-w-full" alt="Window Preview" src={previewImageUrl} /></div></>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
            <button onClick={() => onWindowDelete(window.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Window</button>
        </div>
    </>
}

export default WindowEditor;