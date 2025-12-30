import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { ChocoStudioPreset, ChocoStudioWindow } from "../../ChocoStudio"
import { ChocoWin } from "../../ChocoWindow";
import PresetEditor from "./PresetEditor";

const WindowEditor = ({ /** @type { ChocoStudioWindow } */ window, /** @type { Array<ChocoStudioPreset> } */ presets, /** @type { Array<ChocoWinTileSet } */ tileSets, onWindowChange, onWindowDelete }) => {
    const imageRef = useRef(null);

    const [name, setName] = useState(window.name)
    const [geometryX, setGeometryX] = useState(window.x);
    const [geometryY, setGeometryY] = useState(window.y);
    const [geometryW, setGeometryW] = useState(window.w);
    const [geometryH, setGeometryH] = useState(window.h);
    const [presetId, setPresetId] = useState(window.presetId);

    const doOnWindowChange = (newWindow) => {
        if (onWindowChange && typeof onWindowChange === 'function') {
            onWindowChange(newWindow);
        }
    }

    const onNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.name = value;
        doOnWindowChange(newWindow);
    }

    const onGeometryXChange = (e) => {
        const value = e.target.value;
        setGeometryX(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.x = value;
        doOnWindowChange(newWindow);
    }

    const onGeometryYChange = (e) => {
        const value = e.target.value;
        setGeometryY(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.y = value;
        doOnWindowChange(newWindow);
    }

    const onGeometryWChange = (e) => {
        const value = e.target.value;
        setGeometryW(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.w = value;
        doOnWindowChange(newWindow);
    }

    const onGeometryHChange = (e) => {
        const value = e.target.value;
        setGeometryH(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.h = value;
        doOnWindowChange(newWindow);
    }

    const onPresetIdChange = (e) => {
        const value = e.target.value;
        setPresetId(value);
        const newWindow = new ChocoStudioWindow(window);
        newWindow.presetId = value;
        doOnWindowChange(newWindow);
    }

    const onSingularPresetChange = (singularPreset) => {
        const modifiedPreset = new ChocoStudioPreset(singularPreset);
        // No "setting" necessary since the React state is in the sub-component.
        const newWindow = new ChocoStudioWindow(window);
        newWindow.singularPreset = modifiedPreset;
        doOnWindowChange(newWindow)
    }

    useEffect(() => {
        if (!imageRef.current) { return; }
        if (!presetId) { alert('err'); return; }

        let preset = presets.find((p) => p.id == presetId);
        if (!preset) { return; }
        let tileSet = tileSets.find((ts) => ts.id == preset.tileSetId);

        let chocoWin = new ChocoWin(tileSet, preset.tileScale, 0, 0, 450, 180);

        if (preset.substituteColors && preset.substituteColors.length) {
            preset.substituteColors.forEach((col, idx) => {
                chocoWin.substituteColor(idx, col);
            });
        }

        chocoWin.isReady().then(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 450;
            canvas.height = 180;
            canvas.style.imageRendering = "pixelated";

            const /** @type {CanvasRenderingContext2D} */ ctx = canvas.getContext("2d", { willReadFrequently: true, colorSpace: "srgb", colorType: "unorm8", });
            ctx.imageSmoothingEnabled = false;

            chocoWin.drawTo(ctx);

            let dataUrl = canvas.toDataURL("image/png", 1);
            imageRef.current.src = dataUrl;
        });
    }, [presetId, imageRef])

    const doDeleteWindowOnClick = () => {
        if (onWindowDelete && typeof onWindowDelete === 'function') {
            onWindowDelete(window.id);
        }
    }

    const deleteWindowOnClick = () => {
        doDeleteWindowOnClick(window.id);
    }

    return <>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Window Settings <span className="text-sm">({window.id})</span></h2>
        <p className="mb-2 text-sm italic"></p>
        <div className="mb-4 w-full">
            <label htmlFor="c2c6dc82-1188-41ae-a8ba-24b3c3748b95">Name: </label>
            <input placeholder="Preset Name" type="text" autocomplete="off" id="c2c6dc82-1188-41ae-a8ba-24b3c3748b95" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
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

        {(!presetId) && <PresetEditor isSubordinate={true} preset={window.singularPreset || new ChocoStudioPreset()} tileSets={tileSets} onPresetChange={onSingularPresetChange} />}
        {(presetId) && <><h3 className="mb-2 mt-4 text-xl">Preview</h3><div id="tileSetPreviewDiv" ><img alt="Window Preview" src={null} ref={imageRef} /></div></>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div><button onClick={deleteWindowOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Window</button></div>
    </>
}

export default WindowEditor;