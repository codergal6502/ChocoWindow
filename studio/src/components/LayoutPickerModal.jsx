import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen, faImages } from "@fortawesome/free-solid-svg-icons";
import { ChocoWinTileSet } from '../ChocoWindow.js';
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace } from "../ChocoStudio.js";
import TileSetPreview from "./modal-components/TileSetPreview.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";

const LayoutPickerModal = ({ workspace, currentLayoutId, isModalHidden, onReturnToCanvas }) => {
    const [selection, setSelection] = useState(null);

    const onSelectChange = (e) => {
        const value = e.target.value;
        setSelection(value);
    }

    return (
        <div className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="bg-white rounded-lg shadow-lg  flex relative dark:bg-gray-600">
                    <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
                        <label>
                            <span>Select Layout:</span>
                            <select name="name" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSelectChange} value={selection || currentLayoutId} autoComplete="false">
                                {workspace.layouts.map((l) => <option value={l.id}>{l.name}</option>)}
                            </select>
                        </label>
                        <div className="flex justify-between">
                            <button onClick={() => { onReturnToCanvas(selection) }} className="m-2 w-[12em] bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
                            <button onClick={() => { onReturnToCanvas(null); }} className="m-2 w-[12em] bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LayoutPickerModal;