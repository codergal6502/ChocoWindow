import { useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";

const LayoutPickerModal = ({ workspace, currentLayoutId, isModalHidden, onReturnToEditor }) => {
    const [selection, setSelection] = useState(null);

    const onSelectChange = (e) => {
        const value = e.target.value;
        setSelection(value);
    }

    return (
        <div className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="rounded-lg shadow-lg flex relative bg-white dark:bg-gray-600 dark:text-gray-100">
                    <div className="flex-grow p-6 rounded-lg dark:text-gray-300">
                        <label>
                            <span>Select Layout:</span>
                            <select name="name" className={TAILWIND_INPUT_CLASS_NAME} onChange={onSelectChange} value={selection ?? currentLayoutId ?? ""} autoComplete="false">
                                {workspace.layouts.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </label>
                        <div className="flex justify-between">
                            <button onClick={() => { onReturnToEditor(selection) }} className="m-2 w-[12em] bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Select</button>
                            <button onClick={() => { onReturnToEditor(null); }} className="m-2 w-[12em] bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LayoutPickerModal;