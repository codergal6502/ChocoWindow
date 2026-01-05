import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen, faImages } from "@fortawesome/free-solid-svg-icons";
import { ChocoWinTileSet } from '../ChocoWindow.js';
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace } from "../ChocoStudio.js";
import TileSetDefinitionEditor from "./modal-components/TileSetDefinitionEditor.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";

const LayoutRenderResult = ({ isModalHidden, dataUrl, downloadName, onReturnToCanvas }) => {
    const imgRef = useRef(null);

    useEffect(() => { imgRef.current.src = dataUrl; }, [imgRef])

    const onDownloadPngClick = () => {
        const link = document.createElement("a");
        link.download = downloadName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div id="modal" className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="bg-white rounded-lg shadow-lg flex relative dark:bg-gray-600">
                    <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
                        <div className="h-full overflow-y-auto">
                            <h3 className="mb-2 mt-4 text-xl">Preview</h3>
                            <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
                                <img style={{ width: "400px" }} ref={imgRef} />
                            </div>
                            <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                            <div className="flex justify-between">
                                <button onClick={onDownloadPngClick} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Download Background</button>
                                <button onClick={onReturnToCanvas} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Return to Canvas</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );

    // return (

    //     <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
    //         <div className="h-full overflow-y-auto">


    //             <div className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
    //                 <div className="flex items-center justify-center w-full h-full">
    //                     <div className="bg-white rounded-lg shadow-lg  flex relative dark:bg-gray-600">
    //                         <h3 className="mb-2 mt-4 text-xl">Preview</h3>
    //                         <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
    //                             <img style={{ width: "400px", minHeight: "300px" }} ref={imgRef} />
    //                         </div>
    //                         <h3 className="mb-2 mt-4 text-xl">Actions</h3>
    //                         <div className="flex justify-between">
    //                             <button onClick={() => { }} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Download</button>
    //                             <button onClick={() => { }} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Close Preview</button>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
}

export default LayoutRenderResult;