import { useRef, useState } from "react";
import { ChocoStudioLayout, ChocoStudioWindow } from "../../ChocoStudio"
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faCircleMinus, faTrash } from "@fortawesome/free-solid-svg-icons";

const LayoutEditor = ({ /** @type { ChocoStudioLayout } */ layout, /** @type { Array<ChocoStudioWindow> } */ windows, onLayoutChange, onLayoutDelete }) => {
    const windowSelectRef = useRef();

    const [name, setName] = useState(layout.name || "")
    const [windowIds, setWindowIds] = useState(layout.windowIds || []);

    const onNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        const newLayout = new ChocoStudioLayout(layout);
        newLayout.name = value;
        doOnLayoutChange(newLayout);
    }

    const doOnLayoutChange = (newLayout) => {
        if (onLayoutChange && typeof onLayoutChange === 'function') {
            onLayoutChange(newLayout)
        }
    }

    const addWindowOnClick = () => {
        if (windowSelectRef.current) {
            const value = windowSelectRef.current.value;
            const window = windows.find((w) => value == w.id);

            if (window) {
                /** @type {Array<String>} */ let newWindowIds = windowIds.slice();
                newWindowIds.push(value);
                setWindowIds(newWindowIds);

                const newLayout = new ChocoStudioLayout(layout);
                newLayout.windowIds = newWindowIds.slice();
                doOnLayoutChange(newLayout);
            }
        }
    }

    const moveWindowUpClicked = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx == 0) return;

        let newWindowIds = windowIds.slice();
        newWindowIds[idx] = newWindowIds[idx-1];
        newWindowIds[idx-1] = windowId;
        setWindowIds(newWindowIds);

        const newLayout = new ChocoStudioLayout(layout);
        newLayout.windowIds = newWindowIds.slice();
        doOnLayoutChange(newLayout);
    }

    const moveWindowDownClicked = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx == windowIds.length - 1) return;

        let newWindowIds = windowIds.slice();
        newWindowIds[idx] = newWindowIds[idx+1];
        newWindowIds[idx+1] = windowId;
        setWindowIds(newWindowIds);

        const newLayout = new ChocoStudioLayout(layout);
        newLayout.windowIds = newWindowIds.slice();
        doOnLayoutChange(newLayout);
    }
    
    const removeWindowClicked = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx < 0) return;

        let newWindowIds = windowIds.slice();
        newWindowIds.splice(idx, 1);
        setWindowIds(newWindowIds);

        const newLayout = new ChocoStudioLayout(layout);
        newLayout.windowIds = newWindowIds.slice();
        doOnLayoutChange(newLayout);
    }

    const doDeleteLayoutOnClick = () => {
        if (onLayoutDelete && typeof onLayoutDelete === 'function') {
            onLayoutDelete(layout.id);
        }
    }

    const deleteLayoutOnClick = () => {
        doDeleteLayoutOnClick(layout.id);
    }

    return (<>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Layout Settings <span className="text-sm">({layout.id})</span></h2>
        <p className="mb-2 text-sm italic">A layout is a collection of windows, analogous to a scene.</p>
        <div className="mb-4 w-full">
            <label htmlFor="c2c6dc82-1188-41ae-a8ba-24b3c3748b95">Name: </label>
            <input placeholder="Layout Name" type="text" autocomplete="off" id="c2c6dc82-1188-41ae-a8ba-24b3c3748b95" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
        </div>

        <h3 className="mb-2 mt-4 text-xl">Window List</h3>
        <p className="mb-2 text-sm italic">Windows lower in the list will rendered later and therefore appear above windows higher in the list.</p>
        <table className="min-w-full">
            <thead>
                <tr>
                    <th className="p-1 border-b border-b-gray-900 text-left">Render Order</th>
                    <th className="p-1 border-b border-b-gray-900 text-left">Window Name</th>
                    <th className="p-1 border-b border-b-gray-900 text-left">Actions</th>
                </tr>
            </thead>
            <tbody>
                {
                    windowIds.map((windowId) => {                        
                        const window = windows.find((w) => w.id == windowId);
                        return (
                            <tr className="even:bg-gray-600 odd:bg-gray-700">
                                <td className="p-1">
                                    <button className="hover:text-yellow-400" key={`u-${window.id}`} onClick={() => moveWindowUpClicked(window.id)} aria-label="Delete"><FontAwesomeIcon icon={faArrowUp} /></button>
                                    <button className="hover:text-yellow-400" key={`d-${window.id}`} onClick={() => moveWindowDownClicked(window.id)} aria-label="Delete"><FontAwesomeIcon icon={faArrowDown} /></button>
                                </td>
                                <td className="p-1">{window.name}</td>
                                <td className="p-1">
                                    <button className="hover:text-red-200" key={`r-${window.id}`} onClick={() => removeWindowClicked(window.id)} aria-label="Delete"><FontAwesomeIcon icon={faCircleMinus} /></button>
                                </td>
                            </tr>
                        );
                    })
                }
            </tbody>
        </table>
        <div className="mb-4 mt-4 w-full">
            <label htmlFor="c4698df8-c46f-4736-96c0-a20777e7eb7e" className="block">Add Window: </label>
            <div className="mb-4 w-full">
                <div className="flex items-center space-x-2">
                    <select
                        id="c4698df8-c46f-4736-96c0-a20777e7eb7e"
                        className={TAILWIND_INPUT_CLASS_NAME}
                        defaultValue={null}
                        ref={windowSelectRef}
                    >
                        <option value={null}></option>
                        {windows.filter((w) => false == windowIds.includes(w.id)).map((w) =>
                            <option key={w.id} value={w.id}>{w.name}</option>
                        )}
                    </select>
                    <button onClick={addWindowOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-gray-700 dark:hover:bg-gray-500">Add</button>
                </div>
            </div>
        </div>

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div><button onClick={deleteLayoutOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Layout</button></div>
    </>)
}

export default LayoutEditor;