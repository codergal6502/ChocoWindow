import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoStudioPreset, ChocoStudioTileSetDefinition, ChocoStudioTileSheet } from "../../ChocoStudio"
import { ChocoWinWindow, ChocoWinColor } from "../../ChocoWindow";

/**
 * @param {Object} props
 * @param {Boolean} props.isSubordinate
 * @param {ChocoStudioPreset} props.preset
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Array<ChocoStudioTileSetDefinition>} props.tileSetDefinitions
 * @param {function(ChocoStudioPreset):void} props.onPresetChange
 * @param {function(String):void} props.onPresetDelete
 * @param {function():void} props.onReturnToCanvas
 */
const PresetEditor = ({ isSubordinate = false, preset, tileSheets, tileSetDefinitions, onPresetChange, onPresetDelete, onReturnToCanvas }) => {
    const imageRef = useRef(null);

    const [name, setName] = useState(preset.name);
    const [tileSetDefinition, setTileSetDefinition] = useState(tileSetDefinitions.find((ts) => ts.id == preset.tileSetDefinitionId) || tileSetDefinitions[0])
    const [tileSetDefinitionId, setTileSetDefinitionId] = useState(preset.tileSetDefinitionId ?? null);
    const [tileScale, setTileScale] = useState(preset.tileScale || 1);

    const [substituteColors, setSubstituteColors] = useState(preset.substituteColors || []);
    const [substituteColorsDelayed, setSubstituteColorsDelayed] = useState(preset.substituteColors || []);

    let colorsTimeout = null;

    useEffect(() => {
        setTileSetDefinition(tileSetDefinitions.find((ts) => ts.id == tileSetDefinitionId))
    }, [tileSetDefinitionId])

    useEffect(() => {
        if (substituteColorsDelayed && substituteColorsDelayed.length) {
            if (colorsTimeout) {
                clearTimeout(colorsTimeout);
            }

            setTimeout(() => { setSubstituteColors(substituteColorsDelayed); }, 50)
        }

    }, [substituteColorsDelayed])

    useEffect(() => {
        if (!imageRef.current) { return; }
        if (!tileSetDefinition) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
        if (!tileSheet) { return; }

        let chocoWin = new ChocoWinWindow(tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl), tileScale || 1, 0, 0, 450, 180);

        if (substituteColors && substituteColors.length) {
            substituteColors.forEach((col, idx) => {
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
    }, [preset, tileScale, tileSetDefinition, substituteColors, imageRef])

    const doOnPresetChange = (newPreset) => {
        if (onPresetChange && typeof onPresetChange == 'function') {
            onPresetChange(newPreset);
        }
    }

    const onNameChange = ((e) => {
        const value = e.target.value;
        setName(value);
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.name = value;
        doOnPresetChange(newPreset);
    });

    const onTileSetDefinitionIdChange = ((e) => {
        const value = e.target.value;
        setTileSetDefinitionId(value);
        setSubstituteColors([]);
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.tileSetDefinitionId = value;
        doOnPresetChange(newPreset);
    })

    const onTileScaleChange = ((e) => {
        const value = e.target.value;
        setTileScale(value);
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.tileScale = value;
        doOnPresetChange(newPreset);
    })

    const onColorChange = (e, colorIndex) => {
        let newSubCols = substituteColors.slice();
        newSubCols[colorIndex] = new ChocoWinColor(e.target.value);
        setSubstituteColorsDelayed(newSubCols);
    };

    const onColorResetClick = (colorIndex) => {
        let newSubCols = substituteColors.slice();
        delete newSubCols[colorIndex];
        setSubstituteColors(newSubCols);
    };

    useEffect(() => {
        // Groups with color change handlers to keep the preset updates in one place.
        const newPreset = new ChocoStudioPreset(preset);
        newPreset.substituteColors = substituteColors.slice();
        doOnPresetChange(newPreset);
    }, [substituteColors])

    const doOnPresetDelete = (id) => {
        if (onPresetDelete && typeof onPresetDelete == 'function') {
            onPresetDelete(preset.id);
        }
    }

    const deletePresetOnClick = () => {
        doOnPresetDelete(preset.id);
    };

    return <>
        {
            isSubordinate || <>
                <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Preset Settings <span className="text-sm">({preset.id})</span></h2>
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
                {preset.tileSetDefinitionId || <option key={""} value={null}>-</option>}
                {tileSetDefinitions.map((ts) => <option key={ts.id} value={ts.id}>{ts.name}</option>)}
            </select>
        </div>

        <div className="w-full">
            <label htmlFor="59731ce7-1ab4-4ea1-a08e-1bf5a43d1f4e">Tile Scale: </label>
            <input placeholder="Tile Scale" type="number" min={1} max={10} id="59731ce7-1ab4-4ea1-a08e-1bf5a43d1f4e" className={TAILWIND_INPUT_CLASS_NAME} value={tileScale} onChange={onTileScaleChange} />
        </div>

        {/* <h3 className="mb-2 mt-4 text-xl">Color Substitutions</h3>
        <div className={`grid grid-cols-4 gap-4`}>
            {tileSetDefinition.substitutableColors.map((color, i) =>
                <div key={i}>
                    <div className="text-sm w-full text-center">Color {i + 1}</div>
                    <div><input className="w-full rounded" type="color" value={substituteColors[i]?.toHexString?.() || color.toHexString()} onChange={(e) => onColorChange(e, i)} /></div>
                    <div><button className="w-full border mt-1 text-sm border-gray-900 bg-gray-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded" onClick={(e) => onColorResetClick(i)} >Reset</button></div>
                </div>
            )}
        </div> */}

        <h3 className="mb-2 mt-4 text-xl">Preview</h3>
        <div id="tileSetPreviewDiv" ><img alt="Window Preview" src={null} ref={imageRef} /></div>

        {
            isSubordinate || <>
                <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                <div className="flex justify-between">
                    <button onClick={onReturnToCanvas} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
                    <button onClick={deletePresetOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Preset</button>
                </div>
            </>
        }
    </>
}

export default PresetEditor;