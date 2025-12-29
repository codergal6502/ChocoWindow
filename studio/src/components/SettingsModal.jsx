import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { ChocoWinSettings, ChocoWinTileSet } from '../ChocoWindow.js';
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import { ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace } from "../ChocoStudio.js";
import TileSetPreview from "./modal-components/TileSetPreview.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";

const WORKSPACE_COOKIE_NAME = 'workspace';
ChocoWinSettings.ignoreScaleMisalignmentErrors = true;

const SettingsModal = ({ isModalHidden }) => {

    const initialWorkspace = () => {
        try {
            const b64 = window.localStorage.getItem(WORKSPACE_COOKIE_NAME);
            if (b64) {
                const json = window.atob(b64);
                const obj = JSON.parse(json)
                const ws = new ChocoStudioWorkspace(obj)
                return ws;
            }
        }
        catch (e) {
            console.error(e);
            alert('An unexpected error occurred; check the console log for details.')
        }

        return new ChocoStudioWorkspace();
    }

    const [workspace, setWorkspace] = useState(initialWorkspace());

    const FormStates = Object.freeze({
        SETTINGS: 'SETTINGS',
        TILE_SET: 'TILE_SET',
        PRESET: 'PRESET',
        LAYOUT: 'LAYOUT',
        WINDOW: 'WINDOW',
        VARIABLE: 'VARIABLE',
    });

    // Total state of the form; default to Settings with the entire nav tree open. 
    const [formState, setFormState] = useState(FormStates.SETTINGS);
    const [tileSetsNavOpen, setTileSetsNavOpen] = useState(true);
    const [presetsNavOpen, setPresetsNavOpen] = useState(true);
    const [layoutsNavOpen, setLayoutsNavOpen] = useState(true);
    const [windowsNavOpen, setWindowsNavOpen] = useState(true);
    const [variablesNavOpen, setVariablesNavOpen] = useState(true);

    // For each section, what is active (if anything).
    const [/** @type {ChocoWinTileSet}   */ activeTileSet, setActiveTileSet] = useState(null);
    const [/** @type {ChocoStudioPreset} */ activePreset, setActivePreset] = useState(null);
    const [/** @type {ChocoStudioLayout} */ activeLayout, setActiveLayout] = useState(null);
    const [/** @type {ChocoStudioWindow} */ activeWindow, setActiveWindow] = useState(null);

    const fileInputRef = useRef(null);
    const [workspaceName, setWorkspaceName] = useState("");

    const importButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const storeWorkspaceToCookie = (workspace) => {
        const json = JSON.stringify(workspace);
        const b64 = btoa(json);
        window.localStorage.setItem(WORKSPACE_COOKIE_NAME, b64);
    }

    const doSetWorkspace = (workspace) => {
        setWorkspace(workspace);
        storeWorkspaceToCookie(workspace);
    }

    const onTileSetChange = (/** @type {ChocoWinTileSet} */ modifiedTileSet) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSets.findIndex((ts) => ts.id == modifiedTileSet.id);

        if (idx >= 0) {
            modifiedWorkspace.tileSets[idx] = modifiedTileSet
        }

        doSetWorkspace(modifiedWorkspace);
        setActiveTileSet(modifiedTileSet);
    }

    const onTileSetDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSets.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.tileSets.splice(idx, 1);
        }

        doSetWorkspace(modifiedWorkspace);
        setActiveTileSet(null);
    }

    const onPresetChange = (/** @type {ChocoStudioPreset} */ modifiedPreset) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.presets.findIndex((p) => p.id == modifiedPreset.id);

        if (idx < 0) idx = modifiedWorkspace.presets.length;

        modifiedWorkspace.presets[idx] = modifiedPreset;

        doSetWorkspace(modifiedWorkspace);
        setActivePreset(modifiedPreset);
    }

    const onPresetDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.presets.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.presets.splice(idx, 1);
        }

        doSetWorkspace(modifiedWorkspace);
        setActivePreset(null);
    }

    const onLayoutChange = (/** @type {ChocoStudioLayout} */ modifiedLayout) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.layouts.findIndex((p) => p.id == modifiedLayout.id);

        if (idx < 0) idx = modifiedWorkspace.layouts.length;

        modifiedWorkspace.layouts[idx] = modifiedLayout;

        doSetWorkspace(modifiedWorkspace);
        setActiveLayout(modifiedLayout);
    }

    const onLayoutDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.layouts.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.layouts.splice(idx, 1);
        }

        doSetWorkspace(modifiedWorkspace);
        // setActivelayout(null);
    }

    const onWindowChange = (/** @type {ChocoStudioWindow} */ modifiedWindow) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.windows.findIndex((p) => p.id == modifiedWindow.id);

        if (idx < 0) idx = modifiedWorkspace.windows.length;

        modifiedWorkspace.windows[idx] = modifiedWindow;

        doSetWorkspace(modifiedWorkspace);
        setActiveWindow(modifiedWindow);
    }

    const onWindowDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.windows.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.windows.splice(idx, 1);
        }

        doSetWorkspace(modifiedWorkspace);
        setActiveWindow(null);
    }

    const importInputChange = (e1) => {
        const file = e1.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e2) => {
                try {
                    const parsedJson = JSON.parse(e2.target.result)
                    const newWorkspace = new ChocoStudioWorkspace(parsedJson);
                    doSetWorkspace(newWorkspace);
                    fileInputRef.current.value = null;
                }
                catch (e) {
                    console.error(e);
                    alert('An unexpected error occurred; check the console log for details.')
                }
            }

            reader.readAsText(file);
        }
    }

    const workspaceNameChange = (e) => {
        const newWorkspaceName = e.target.value;
        workspace.workspaceName = newWorkspaceName;
        setWorkspaceName(newWorkspaceName);
    }

    const tileSetNavOnClick = (/** @type {ChocoWinTileSet} */ tileSet) => {
        if (FormStates.TILE_SET != formState) {
            setFormState(FormStates.TILE_SET);
        }
        setActiveTileSet(tileSet);
    }

    const newPresetNavOnClick = () => {
        if (FormStates.PRESET != formState) {
            setFormState(FormStates.PRESET);
        }

        const newPreset = new ChocoStudioPreset();
        newPreset.id = crypto.randomUUID();

        setActivePreset(newPreset);
    }

    const presetNavOnClick = (/** @type {ChocoStudioPreset} */ preset) => {
        if (FormStates.PRESET != formState) {
            setFormState(FormStates.PRESET);
        }
        setActivePreset(preset);
    }

    const newLayoutOnClick = () => {

    }

    const layoutNavOnClick = (layout) => {
        if (FormStates.LAYOUT != formState) {
            setFormState(FormStates.LAYOUT);
        }
        setActiveLayout(layout);
    }

    const newWindowOnClick = () => {
        if (FormStates.WINDOW != formState) {
            setFormState(FormStates.WINDOW);
        }

        const newWindow = new ChocoStudioWindow();
        newWindow.id = crypto.randomUUID();

        setActiveWindow(newWindow);
    }

    const windowNavOnClick = (window) => {
        if (FormStates.WINDOW != formState) {
            setFormState(FormStates.WINDOW);
        }
        setActiveWindow(window);
    }

    return (
        <div id="modal" className={`fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="bg-white rounded-lg shadow-lg w-5/6 h-5/6 flex relative dark:bg-gray-600">
                    <button id="closeModal" className="mt-2 mr-2 text-red-300 text-xl absolute top-0 right-0"><i className="fa-solid fa-square-xmark"></i></button>
                    <div className="bg-gray-800 text-white p-4 pr-6 rounded-l-lg flex-none">
                        <nav className="h-full overflow-y-auto">
                            <h2 className="bg-gray-800 font-bold text-lg sticky top-0">Workspace</h2>
                            <ul>
                                <li>
                                    <button onClick={() => setFormState(FormStates.SETTINGS)} className="block py-1 hover:bg-gray-600">Workspace Settings</button>
                                </li>
                                <li>
                                    <button onClick={() => setTileSetsNavOpen(!tileSetsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={tileSetsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Sets
                                    </button>
                                    <ul className={`ml-8 ${tileSetsNavOpen ? '' : 'hidden'}`}>
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.tileSets.map((tileSet) => <li key={tileSet.id}>
                                            <button onClick={() => tileSetNavOnClick(tileSet)} className="block py-1 hover:bg-gray-600">{String(tileSet.name).trim() || <span className="italic">no name</span>}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setPresetsNavOpen(!presetsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={presetsNavOpen ? faAngleDown : faAngleRight} />
                                        Presets
                                    </button>
                                    <ul className={`ml-8 ${presetsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newPresetNavOnClick} className="block py-1 hover:bg-gray-600">Add New...</button>
                                        {workspace.presets.map((preset) => {
                                            return (<li key={preset.id}>
                                                <button onClick={() => presetNavOnClick(preset)} className="block py-1 hover:bg-gray-600">{String(preset.name).trim() || <span className="italic">no name</span>}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setWindowsNavOpen(!windowsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={windowsNavOpen ? faAngleDown : faAngleRight} />
                                        Windows
                                    </button>
                                    <ul className={`ml-8 ${windowsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newWindowOnClick} className="block py-1 hover:bg-gray-600">Add New...</button>
                                        {workspace.windows.map((window) => {
                                            return (<li key={window.id}>
                                                <button onClick={() => windowNavOnClick(window)} className="block py-1 hover:bg-gray-600">{String(window.name).trim() || <span className="italic">no name</span>}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setLayoutsNavOpen(!layoutsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={layoutsNavOpen ? faAngleDown : faAngleRight} />
                                        Layouts
                                    </button>
                                    <ul className={`ml-8 ${layoutsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newLayoutOnClick} className="block py-1 hover:bg-gray-600">Add New...</button>
                                        {workspace.layouts.map((layout) => {
                                            return (<li key={layout.id}>
                                                <button onClick={() => layoutNavOnClick(layout)} className="block py-1 hover:bg-gray-600">{layout.name}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setVariablesNavOpen(!variablesNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={variablesNavOpen ? faAngleDown : faAngleRight} />
                                        Variables
                                    </button>
                                    <ul className={`ml-8 ${variablesNavOpen ? '' : 'hidden'}`}>
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.variables.map((variable) => {
                                            return (<li key={variable.id}>
                                                <a href="#" className="block py-1 hover:bg-gray-600">{variable.name}</a>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div className="flex-grow p-6 bg-white rounded-lg dark:bg-gray-600 dark:text-gray-300">
                        <div className="h-full overflow-y-auto">
                            {
                                (() => {
                                    switch (formState) {
                                        case FormStates.SETTINGS:
                                        default:
                                            return (<>
                                                <h2 className="mb-3 bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Export/Load Workspace</h2>
                                                <div className="flex justify-around items-center w-full">
                                                    <button className="flex flex-col items-center">
                                                        <FontAwesomeIcon className="text-6xl" icon={faFloppyDisk} />
                                                        <div>Export Workspace...</div>
                                                    </button>
                                                    <button className="flex flex-col items-center" onClick={importButtonClick}>
                                                        <FontAwesomeIcon className="text-6xl" icon={faFolderOpen} />
                                                        <div>Load Workspace...</div>
                                                    </button>
                                                    <input className="hidden" accept="application/json" type="file" onChange={importInputChange} ref={fileInputRef} />
                                                </div>
                                                <h2 className="mt-3 mb-3 bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Workspace Settings</h2>
                                                <div className="mb-4 w-full">
                                                    <label htmlFor="ccd163fa-8b14-4f68-9b0d-753b093c28ff">Name: </label>
                                                    <input placeholder="Workspace Name" type="text" id="ccd163fa-8b14-4f68-9b0d-753b093c28ff" className={TAILWIND_INPUT_CLASS_NAME} onChange={workspaceNameChange} value={workspace.workspaceName} />
                                                </div>
                                            </>);

                                        case FormStates.TILE_SET:
                                            return (!activeTileSet) ? "" : (
                                                <TileSetPreview key={activeTileSet.id} tileSet={activeTileSet} onTileSetChange={onTileSetChange} onTileSetDelete={onTileSetDelete} />
                                            );
                                        case FormStates.PRESET:
                                            return (!activePreset) ? "" : (
                                                <PresetEditor key={activePreset.id} preset={activePreset} tileSets={workspace.tileSets} onPresetChange={onPresetChange} onPresetDelete={onPresetDelete} />
                                            );
                                        case FormStates.WINDOW:
                                            return (!activeWindow) ? "" : (
                                                <WindowEditor key={activeWindow.id} window={activeWindow} presets={workspace.presets} tileSets={workspace.tileSets} onWindowChange={onWindowChange} onWindowDelete={onWindowDelete} />
                                            )
                                        case FormStates.LAYOUT:
                                            return (!activeLayout) ? "" : (
                                                <LayoutEditor key={activeLayout.id} layout={activeLayout} windows={workspace.windows} onLayoutChange={onLayoutChange} onLayoutDelete={onLayoutDelete} />
                                            )
                                        case FormStates.VARIABLE:
                                            return <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">variable</h2>;
                                    }
                                })()
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;