import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { ChocoStudioTileSheet } from "../../ChocoStudio";

/**
 * @param {Object} props
 * @param {ChocoStudioTileSheet} props.tileSheet
 * @param {function(ChocoStudioTileSheet)} props.onTileSheetChange
 * @param {function(String)} props.onTileSheetDelete
 * @param {function(ChocoStudioTileSheet)} props.onReturnToEditor
 */
const TileSheetEditor = ({ tileSheet, onTileSheetChange, onTileSheetDelete, onReturnToEditor }) => {

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const [name, setName] = useState(tileSheet.name);
    const [hasTileSheet, setHasTileSheet] = useState(null != tileSheet.imageDataUrl);
    const [imageDataUrl, setImageDataUrl] = useState(tileSheet.imageDataUrl);
    const [attribution, setAttribution] = useState(tileSheet.attribution);
    const [hasChanges, setHasChanges] = useState(false);
    const [tileSheetChangeTimeout, setTileSheetChangeTimeout] = useState(null);

    /** @type {ReturnType<typeof useRef<HTMLInputElement>>} */
    const uploadTileSheetInputRef = useRef(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // debounce text input; for simplicity, all changes are routed through here
    useEffect(() => {
        if (hasChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(tileSheetChangeTimeout);
            const timeout = setTimeout(() => uponTileSheetChange(), 500);
            setTileSheetChangeTimeout(timeout);
        }
    }, [name, attribution, imageDataUrl, hasChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const uponTileSheetChange = () => {
        const newTileSheet = new ChocoStudioTileSheet(tileSheet);
        newTileSheet.name = name;
        newTileSheet.attribution = attribution;
        newTileSheet.imageDataUrl = imageDataUrl;
        onTileSheetChange(newTileSheet);
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
    }

    const onAttributionChange = (e) => {
        setAttribution(e.target.value);
        setHasChanges(true);
    }

    /**
     * 
     */
    const onLoadImageClick = () => {
        if (uploadTileSheetInputRef.current) {
            uploadTileSheetInputRef.current.click();
        }
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onPngUploadChange = (inputEvent) => {
        const file = inputEvent.target.files[0];

        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (readerEvent) => {
                const b64 = readerEvent.target.result;
                setHasTileSheet(true);
                setImageDataUrl(b64);
                setHasChanges(true);
            }

            reader.readAsDataURL(file);
        }
    }

    return (<>
        <h2 className="text-2xl font-bold sticky top-0 mb-2 bg-white dark:bg-gray-600">Tile Sheet Editor <span className="text-sm">({tileSheet.id})</span></h2>
        <p className="mb-2 text-sm italic">A tile sheet is an image file that contains the tiles used to create windows.</p>

        <div className={`grid grid-cols-4 gap-4`}>
            <div className="mb-4 w-full">
                <label htmlFor="3ccab645-9aaa-4bfb-b12d-625bc18b6fd9">Name: </label>
                <input placeholder="Tile Set Name" type="text" autoComplete="off" id="3ccab645-9aaa-4bfb-b12d-625bc18b6fd9" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
            </div>
            <div className="wb-4 w-full">
                <input className="hidden" accept="image/png" type="file" onChange={onPngUploadChange} ref={uploadTileSheetInputRef} />
                <label htmlFor="b06ffc48-9ef6-47b7-b8a2-daf2fdc8e2cf">Upload Tile Sheet</label>
                <button id="b06ffc48-9ef6-47b7-b8a2-daf2fdc8e2cf" className={`${TAILWIND_INPUT_CLASS_NAME} hover:bg-gray-500`} onClick={onLoadImageClick}>Upload</button>
            </div>
        </div>

        <div className="mb-4 w-full">
            <label htmlFor="4d8736a5-51a6-4fd3-88a1-2a907b755718">Atrribution: </label>
            <textarea placeholder="Attribution" type="text" autoComplete="off" id="4d8736a5-51a6-4fd3-88a1-2a907b755718" className={`h-24 ${TAILWIND_INPUT_CLASS_NAME}`} value={attribution} onChange={onAttributionChange} />
        </div>

        <div className="mb-4 w-full">
            <h3 className="mb-2 mt-4 text-xl">Tile Sheet Quick View</h3>
            <div className="mb-4 w-full">
                {hasTileSheet ? null : <p className="mb-2 text-sm italic">Please upload a tile sheet image file.</p>}
                <img className={`${!hasTileSheet ? 'hidden' : ''} block rounded-lg border dark:border-none dark:bg-gray-800 py-[9px] px-3 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none`} src={imageDataUrl} />
            </div>
        </div>

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
            <button onClick={() => onTileSheetDelete(tileSheet.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Sheet</button>
        </div>
    </>)
}

export default TileSheetEditor;