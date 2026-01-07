import { useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { ChocoStudioTileSheet } from "../../ChocoStudio";

const TileSheetEditor = ({ tileSheet, onTileSheetChange, onTileSheetDelete, onReturnToCanvas }) => {
    const canPropogateDelete = (onTileSheetDelete && typeof onTileSheetDelete == 'function');

    const fileInputRef = useRef(null);
    const tileSheetRef = useRef(null);

    const [name, setName] = useState(tileSheet.name);
    const [hasTileSheet, setHasTileSheet] = useState(null != tileSheet.imageDataUrl);
    const [tileSheetDataUrl, setTileSheetDataUrl] = useState(tileSheet.imageDataUrl);
    const [attribution, setAttribution] = useState(tileSheet.attribution);

    const doOnTileSheetChange = (propModCallback) => {
        const newTileSheet = new ChocoStudioTileSheet(tileSheet);
        if (onTileSheetChange && typeof onTileSheetChange == "function") {
            if (propModCallback && typeof propModCallback == "function") {
                propModCallback(newTileSheet);
            }

            onTileSheetChange(newTileSheet);
        }
    }

    const onNameChange = (e) => {
        setName(e.target.value);
        doOnTileSheetChange((newTileSheet) => newTileSheet.name = e.target.value);
    }

    const onAttributionChange = (e) => {
        setAttribution(e.target.value);
        doOnTileSheetChange((newTileSheet) => newTileSheet.attribution = e.target.value);
    }

    const onUploadClick = (e) => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const onPngUploadChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            const reader = new FileReader();
            setHasTileSheet(true);

            reader.onload = (ev) => {
                const b64 = reader.result;
                tileSheetRef.current.src = b64;
                setTileSheetDataUrl(b64);
                doOnTileSheetChange((newTileSheet) => newTileSheet.imageDataUrl = b64);
            }

            reader.readAsDataURL(file);
        }
    }

    return (<>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600 mb-2">Tile Sheet Editor <span className="text-sm">({tileSheet.id})</span></h2>
        <p className="mb-2 text-sm italic">A tile sheet is an image file that contains the tiles used to create windows.</p>

        <div className={`grid grid-cols-4 gap-4`}>
            <div className="mb-4 w-full">
                <label htmlFor="3ccab645-9aaa-4bfb-b12d-625bc18b6fd9">Name: </label>
                <input placeholder="Tile Set Name" type="text" autoComplete="off" id="3ccab645-9aaa-4bfb-b12d-625bc18b6fd9" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
            </div>
            <div className="wb-4 w-full">
                <input className="hidden" accept="image/png" type="file" onChange={onPngUploadChange} ref={fileInputRef} />
                <label htmlFor="b06ffc48-9ef6-47b7-b8a2-daf2fdc8e2cf">Upload Tile Sheet</label>
                <button id="b06ffc48-9ef6-47b7-b8a2-daf2fdc8e2cf" className={`${TAILWIND_INPUT_CLASS_NAME} hover:bg-gray-500`} onClick={onUploadClick}>Upload</button>
            </div>
        </div>

        <div className="mb-4 w-full">
            <label htmlFor="4d8736a5-51a6-4fd3-88a1-2a907b755718">Atrribution: </label>
            <textarea placeholder="Attribution" type="text" autoComplete="off" id="4d8736a5-51a6-4fd3-88a1-2a907b755718" className={TAILWIND_INPUT_CLASS_NAME} value={attribution} onChange={onAttributionChange} />
        </div>

        {hasTileSheet || <p className="mb-2 text-sm italic">Please upload a tile sheet image file.</p>}
        {hasTileSheet && <div className="mb-4 w-full">
            <h3 className="mb-2 mt-4 text-xl">Tile Sheet Quick View</h3>
            <div className="mb-4 w-full">
                <img className="block rounded-lg border dark:border-none dark:bg-gray-800 py-[9px] px-3 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none" ref={tileSheetRef} src={tileSheetDataUrl} />
            </div>
        </div>}

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToCanvas} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
            {canPropogateDelete && <button onClick={() => onTileSheetDelete(tileSheet.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Sheet</button>}
        </div>
    </>)
}

export default TileSheetEditor;