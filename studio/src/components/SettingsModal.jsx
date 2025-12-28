import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { ChocoWin, ChocoWinColor, ChocoWinCoordinates, ChocoWinOption as ChocoWinTileSet, ChocoWinTilesetCorners, ChocoWinOptionEdges, ChocoWinSettings } from '../ChocoWindow.js';
import ChocoStudioWorkspace from "../ChocoStudio.js";
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import TileSetPreview from "./modal-components/TileSetPreview.jsx";

const WORKSPACE_COOKIE_NAME = 'workspace';

const SettingsModal = ({ isModalHidden }) => {
    const initialWorkspace = () => {
        try {
            const b64 = window.localStorage.getItem(WORKSPACE_COOKIE_NAME);
            if (b64) {
                const json = window.atob(b64);
                const obj = JSON.parse(json)
                const ws = new ChocoStudioWorkspace(obj)
                console.log(`loaded from ${WORKSPACE_COOKIE_NAME}`, b64, json, obj, ws);
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
        WINDOW_PRESET: 'WINDOW_PRESET',
        LAYOUT: 'LAYOUT',
        WINDOW: 'WINDOW',
        VARIABLE: 'VARIABLE',
    });

    const [formState, setFormState] = useState(FormStates.SETTINGS);

    const [tileSetsNavOpen, setTileSetsNavOpen] = useState(true);
    const [windowPresetsNavOpen, setWindowPresetsNavOpen] = useState(true);
    const [layoutsNavOpen, setLayoutsNavOpen] = useState(true);
    const [windowsNavOpen, setWindowsNavOpen] = useState(true);
    const [variablesNavOpen, setVariablesNavOpen] = useState(true);

    const [/** @type {ChocoWinTileSet} */ activeTileSet, setActiveTileSet] = useState(null);



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
        setFormState(FormStates.TILE_SET);
        setActiveTileSet(tileSet);
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
                                            <button onClick={() => tileSetNavOnClick(tileSet)} className="block py-1 hover:bg-gray-600">{tileSet.name}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setWindowPresetsNavOpen(!windowPresetsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={windowPresetsNavOpen ? faAngleDown : faAngleRight} />
                                        Window Presets
                                    </button>
                                    <ul className={`ml-8 ${windowPresetsNavOpen ? '' : 'hidden'}`}>
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.presets.map((preset) => {
                                            return (<li key={preset.id}>
                                                <a href="#" className="block py-1 hover:bg-gray-600">{preset.name}</a>
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
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.layouts.map((layout) => {
                                            return (<li key={layout.id}>
                                                <a href="#" className="block py-1 hover:bg-gray-600">{layout.name}</a>
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
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.windows.map((window) => {
                                            return (<li key={window.id}>
                                                <a href="#" className="block py-1 hover:bg-gray-600">{window.name}</a>
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
                                                <TileSetPreview tileSet={activeTileSet} />
                                            );
                                        case FormStates.WINDOW_PRESET:
                                            return <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">window preset</h2>;
                                        case FormStates.WINDOW:
                                            return <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">WINDOWS!!!</h2>
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