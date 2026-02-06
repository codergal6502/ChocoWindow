import { useEffect, useRef, useState } from "react";
import { ChocoStudioLayout } from "../../ChocoStudio"
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowUp, faCircleMinus } from "@fortawesome/free-solid-svg-icons";

/**
 * 
 * @param {Object} props
 * @param {ChocoStudioLayout} props.layout,
 * @param {Array<ChocoStudioWindow>} props.windows
 * @param {function(ChocoStudioLayout)} props.onLayoutChange
 * @param {function(string)} props.onLayoutDelete
 * @param {function(ChocoStudioLayout)} props.onReturnToEditor
 * @param {function()} props.onEditThisLayout
 */
const LayoutEditor = ({ layout, windows, onLayoutChange, onLayoutDelete, onReturnToEditor, onEditThisLayout }) => {

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const windowSelectRef = useRef();

    const [name, setName] = useState(layout.name || "")
    const [windowIds, setWindowIds] = useState(layout.windowIds || []);
    const [hasChanges, setHasChanges] = useState(false);
    const [lastLayoutChangeTimeout, setLastLayoutChangeTimeout] = useState(null);

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
            clearTimeout(lastLayoutChangeTimeout);
            const timeout = setTimeout(() => uponLayoutChange(), 500);
            setLastLayoutChangeTimeout(timeout);
        }
    }, [name, windowIds, hasChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    
    /**
     * 
     */
    const uponLayoutChange = () => {
        const newLayout = new ChocoStudioLayout(layout);
        newLayout.name = name;
        newLayout.windowIds = windowIds.slice();
        onLayoutChange(newLayout);
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
     * 
     */
    const onAddWindowClick = () => {
        if (windowSelectRef.current) {
            const value = windowSelectRef.current.value;
            const window = windows.find((w) => value === w.id);

            if (window) {
                /** @type {Array<String>} */ let newWindowIds = windowIds.slice();
                newWindowIds.push(value);
                setWindowIds(newWindowIds);
                // todo: maybe use useMemo? See https://react.wiki/performance/avoid-unnecessary-rerenders/#usememo-memoizing-expensive-computations
                setHasChanges(true); 
            }
        }
    }

    /**
     * @param {String} windowId 
     */
    const onMoveWindowUpClick = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx === 0) return;

        let newWindowIds = windowIds.slice();
        newWindowIds[idx] = newWindowIds[idx - 1];
        newWindowIds[idx - 1] = windowId;
        setWindowIds(newWindowIds);
        setHasChanges(true);
    }

    /**
     * @param {String} windowId 
     */
    const moveWindowDownClicked = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx === windowIds.length - 1) return;

        let newWindowIds = windowIds.slice();
        newWindowIds[idx] = newWindowIds[idx + 1];
        newWindowIds[idx + 1] = windowId;
        setWindowIds(newWindowIds);
        setHasChanges(true);
    }

    /**
     * @param {String} windowId 
     */
    const onRemoveWindowClick = (windowId) => {
        const idx = windowIds.indexOf(windowId);

        if (idx < 0) return;

        let newWindowIds = windowIds.slice();
        newWindowIds.splice(idx, 1);
        setWindowIds(newWindowIds);
        setHasChanges(true);
    }

    return (<>
        <h2 className="text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">Layout Settings <span className="text-sm">({layout.id})</span></h2>
        <p className="mb-2 text-sm italic">A layout is a collection of windows, analogous to a scene.</p>
        <div className="mb-4 w-full">
            <label htmlFor="c2c6dc82-1188-41ae-a8ba-24b3c3748b95">Name: </label>
            <input placeholder="Layout Name" type="text" autoComplete="off" id="c2c6dc82-1188-41ae-a8ba-24b3c3748b95" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
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
                        const window = windows.find((w) => w.id === windowId);
                        return (
                            <tr key={windowId} className="even:bg-gray-200 odd:bg-gray-300 dark:even:bg-gray-600 dark:odd:bg-gray-700">
                                <td className="p-1">
                                    <button className="hover:text-yellow-400" key={`u-${windowId}`} onClick={() => onMoveWindowUpClick(windowId)} aria-label="Delete"><FontAwesomeIcon icon={faArrowUp} /></button>
                                    <button className="hover:text-yellow-400" key={`d-${windowId}`} onClick={() => moveWindowDownClicked(windowId)} aria-label="Delete"><FontAwesomeIcon icon={faArrowDown} /></button>
                                </td>
                                <td className="p-1">{window ? window.name : `Missing Window ${windowId}`}</td>
                                <td className="p-1">
                                    <button className="hover:text-red-200" key={`r-${windowId}`} onClick={() => onRemoveWindowClick(windowId)} aria-label="Delete"><FontAwesomeIcon icon={faCircleMinus} /></button>
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
                        {windows.filter((w) => false === windowIds.includes(w.id)).map((w) =>
                            <option key={w.id} value={w.id}>{w.name}</option>
                        )}
                    </select>
                    <button onClick={onAddWindowClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-gray-700 dark:hover:bg-gray-500">Add</button>
                </div>
            </div>
        </div>

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button onClick={onReturnToEditor} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
            <button onClick={() => onEditThisLayout(layout.id)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Edit this Layout</button>
            <button onClick={() => onLayoutDelete(layout.id)} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Layout</button>
        </div>
    </>)
}

export default LayoutEditor;