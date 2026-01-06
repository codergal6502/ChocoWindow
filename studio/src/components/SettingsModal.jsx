import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen, faImages } from "@fortawesome/free-solid-svg-icons";
import { ChocoWinTileSet } from '../ChocoWindow.js';
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace, ChocoStudioTileSheet, ChocoStudioTileSetDefinition } from "../ChocoStudio.js";
import TileSetDefinitionEditor from "./modal-components/TileSetDefinitionEditor.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";
import TileSheetEditor from "./modal-components/TileSheetEditor.jsx";

/**
 * @param {Object} props
 * @param {Boolean} props.isModalHidden
 * @param {function(ChocoStudioWorkspace):void} props.onReturnToCanvas
 * @param {function(ChocoStudioWorkspace):void} props.onWorkspaceChange
 * @param {ChocoStudioWorkspace} props.workspace
 */
const SettingsModal = ({ isModalHidden, onReturnToCanvas, onWorkspaceChange, workspace }) => {
    const FormStates = Object.freeze({
        SETTINGS: 'SETTINGS',
        TILE_SHEET: 'TILE_SHEET',
        TILE_SET_DEFINITION: 'TILE_SET_DEFINITION',
        TILE_SET: 'TILE_SET',
        PRESET: 'PRESET',
        LAYOUT: 'LAYOUT',
        WINDOW: 'WINDOW',
        VARIABLE: 'VARIABLE',
    });

    // Total state of the form; default to Settings with the entire nav tree open. 
    const [formState, setFormState] = useState(FormStates.SETTINGS);
    const [tileSetDefinitionsNavOpen, setTileSetDefinitionsNavOpen] = useState(true);
    const [tileSetsNavOpen, setTileSetsNavOpen] = useState(true);
    const [presetsNavOpen, setPresetsNavOpen] = useState(true);
    const [layoutsNavOpen, setLayoutsNavOpen] = useState(true);
    const [windowsNavOpen, setWindowsNavOpen] = useState(true);
    const [variablesNavOpen, setVariablesNavOpen] = useState(true);

    // For each section, what is active (if anything).
    const [/** @type {ChocoStudioTileSheet} */ activeTileSheet, setActiveTileSheet] = useState(null);
    const [/** @type {ChocoWinTileSet} */ activeTileSet, setActiveTileSet] = useState(null);
    const [/** @type {ChocoStudioTileSetDefinition} */ activeTileSetDefinition, setActiveTileSetDefinition] = useState(null);
    const [/** @type {ChocoStudioPreset} */ activePreset, setActivePreset] = useState(null);
    const [/** @type {ChocoStudioLayout} */ activeLayout, setActiveLayout] = useState(null);
    const [/** @type {ChocoStudioWindow} */ activeWindow, setActiveWindow] = useState(null);

    const fileInputRef = useRef(null);
    const [workspaceName, setWorkspaceName] = useState("");
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);

    const exportButtonClick = () => {
        const json = JSON.stringify(workspace);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `${workspace.workspaceName}.choco.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const downloadButtonClick = () => {

    }

    const importButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    const doSetWorkspace = (workspace) => {
        onWorkspaceChange(workspace)
    }

    const onTileSheetChange = (/** @type {ChocoStudioTileSheet} */ modifiedTileSheet) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.tileSheets.findIndex((ts) => ts.id == modifiedTileSheet.id);

        if (idx < 0) idx = modifiedWorkspace.tileSheets.length;
        modifiedWorkspace.tileSheets[idx] = modifiedTileSheet;

        doSetWorkspace(modifiedWorkspace);
        setActiveTileSheet(modifiedTileSheet);
    }

    /**
     * @param {ChocoStudioTileSetDefinition} modifiedTileSetDefinition
     */
    const onTileSetDefinitionChange = (modifiedTileSetDefinition) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.tileSetDefinitions.findIndex((tsd) => tsd.id == modifiedTileSetDefinition.id);

        if (idx < 0) idx = modifiedWorkspace.tileSetDefinitions.length;
        modifiedWorkspace.tileSetDefinitions[idx] = modifiedTileSetDefinition;

        doSetWorkspace(modifiedWorkspace);
        setActiveTileSetDefinition(modifiedTileSetDefinition);
    }

    const onTileSheetDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSheets.findIndex((ts) => ts.id == id);

        if (idx >= 0) {
            modifiedWorkspace.tileSheets.splice(idx, 1);
        }

        doSetWorkspace(modifiedWorkspace);
        setActiveTileSheet(null);
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
        doSetWorkspace(workspace);
    }

    const widthChange = (e) => {
        const newWidth = e.target.value;
        workspace.width = newWidth;
        setWidth(newWidth);
        doSetWorkspace(workspace);
    }

    const heightChange = (e) => {
        const newHeight = e.target.value;
        workspace.height = newHeight;
        setHeight(newHeight);
        doSetWorkspace(workspace);
    }

    const tileSheetNavOnClick = (/** @type {ChocoStudioTileSheet} */ tileSheet) => {
        if (FormStates.TILE_SHEET != formState) {
            setFormState(FormStates.TILE_SHEET);
        }
        setActiveTileSheet(tileSheet);
    }

    const tileSetNavOnClick = (/** @type {ChocoWinTileSet} */ tileSet) => {
        if (FormStates.TILE_SET != formState) {
            setFormState(FormStates.TILE_SET);
        }
        setActiveTileSet(tileSet);
    }

    const newTileSheetOnClick = () => {
        if (FormStates.TILE_SHEET != formState) {
            setFormState(FormStates.TILE_SHEET);
        }

        const newTileSheet = new ChocoStudioTileSheet();

        setActiveTileSheet(newTileSheet);
    }

    const newTileSetDefinitionOnClick = () => {
        if (FormStates.TILE_SET_DEFINITION != formState) {
            setFormState(FormStates.TILE_SET_DEFINITION);
        }

        const newTileSetDefinition = new ChocoStudioTileSetDefinition();

        setActiveTileSetDefinition(newTileSetDefinition);
    }

    const tileSetDefinitionNavOnClick = (/** @type {ChocoStudioTileSetDefinition} */ tileSetDefinition) => {
        if (FormStates.TILE_SET_DEFINITION != formState) {
            setFormState(FormStates.TILE_SET_DEFINITION);
        }
        setActiveTileSetDefinition(tileSetDefinition);
    }

    const newPresetNavOnClick = () => {
        if (FormStates.PRESET != formState) {
            setFormState(FormStates.PRESET);
        }

        const newPreset = new ChocoStudioPreset();

        setActivePreset(newPreset);
    }

    const presetNavOnClick = (/** @type {ChocoStudioPreset} */ preset) => {
        if (FormStates.PRESET != formState) {
            setFormState(FormStates.PRESET);
        }
        setActivePreset(preset);
    }

    const newLayoutOnClick = () => {
        if (FormStates.LAYOUT != formState) {
            setFormState(FormStates.LAYOUT);
        }

        const newLayout = new ChocoStudioLayout();

        setActiveLayout(newLayout);
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

        setActiveWindow(newWindow);
    }

    const windowNavOnClick = (window) => {
        if (FormStates.WINDOW != formState) {
            setFormState(FormStates.WINDOW);
        }
        setActiveWindow(window);
    }

    return (
        <div id="modal" className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
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
                                        Tile Sheets
                                    </button>
                                    <ul className={`ml-8 ${tileSetsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newTileSheetOnClick} className="block py-1 hover:bg-gray-600">Add New...</button>
                                        {workspace.tileSheets.map((tileSheet) => <li key={tileSheet.id}>
                                            <button onClick={() => tileSheetNavOnClick(tileSheet)} className="block py-1 hover:bg-gray-600">{String(tileSheet.name).trim() || <span className="italic">no name</span>}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li>
                                {/* <li>
                                    <button onClick={() => setTileSetsNavOpen(!tileSetsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={tileSetsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Sets (depr)
                                    </button>
                                    <ul className={`ml-8 ${tileSetsNavOpen ? '' : 'hidden'}`}>
                                        <a href="#" className="block py-1 hover:bg-gray-600">Add New...</a>
                                        {workspace.tileSets.map((tileSet) => <li key={tileSet.id}>
                                            <button onClick={() => tileSetNavOnClick(tileSet)} className="block py-1 hover:bg-gray-600">{String(tileSet.name).trim() || <span className="italic">no name</span>}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li> */}
                                <li>
                                    <button onClick={() => setTileSetDefinitionsNavOpen(!tileSetDefinitionsNavOpen)} className="block py-1 hover:bg-gray-700">
                                        <FontAwesomeIcon icon={tileSetDefinitionsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Set Definitions
                                    </button>
                                    <ul className={`ml-8 ${tileSetDefinitionsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newTileSetDefinitionOnClick} className="block py-1 hover:bg-gray-600">Add New...</button>
                                        {workspace.tileSetDefinitions.map((tileSetDefinition) => <li key={tileSetDefinition.id}>
                                            <button onClick={() => tileSetDefinitionNavOnClick(tileSetDefinition)} className="block py-1 hover:bg-gray-600">{String(tileSetDefinition.name).trim() || <span className="italic">no name</span>}</button>
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
                                                <button onClick={() => layoutNavOnClick(layout)} className="block py-1 hover:bg-gray-600">{String(layout.name).trim() || <span className="italic">no name</span>}</button>
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
                                                    <button className="flex flex-col items-center" onClick={importButtonClick}>
                                                        <FontAwesomeIcon className="text-6xl" icon={faFolderOpen} />
                                                        <div>Load Workspace...</div>
                                                    </button>
                                                    <button className="flex flex-col items-center" onClick={exportButtonClick}>
                                                        <FontAwesomeIcon className="text-6xl" icon={faFloppyDisk} />
                                                        <div>Export Workspace...</div>
                                                    </button>
                                                    <button className="flex flex-col items-center" onClick={downloadButtonClick}>
                                                        <FontAwesomeIcon className="text-6xl" icon={faImages} />
                                                        <div>Download Assets...</div>
                                                    </button>
                                                    <input className="hidden" accept="application/json" type="file" onChange={importInputChange} ref={fileInputRef} />
                                                </div>
                                                <h2 className="mt-3 mb-3 bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600">Workspace Settings</h2>
                                                <div className="mb-4 w-full">
                                                    <label htmlFor="ccd163fa-8b14-4f68-9b0d-753b093c28ff">Name: </label>
                                                    <input placeholder="Workspace Name" type="text" autoComplete="off" id="ccd163fa-8b14-4f68-9b0d-753b093c28ff" className={TAILWIND_INPUT_CLASS_NAME} onChange={workspaceNameChange} value={workspace.workspaceName} />
                                                </div>
                                                <div className={`grid grid-cols-2 gap-4`}>
                                                    <div className="mb-4 w-full">
                                                        <label htmlFor="063ce7b6-c327-4ab2-b343-0556f0e7158d">Width: </label>
                                                        <input placeholder="Preset Name" type="number" id="063ce7b6-c327-4ab2-b343-0556f0e7158d" className={TAILWIND_INPUT_CLASS_NAME} value={width} onChange={widthChange} />
                                                    </div>

                                                    <div className="mb-4 w-full">
                                                        <label htmlFor="c3efc55a-36cd-4f12-b546-308893448ade">Y Position: </label>
                                                        <input placeholder="Preset Name" type="number" id="c3efc55a-36cd-4f12-b546-308893448ade" className={TAILWIND_INPUT_CLASS_NAME} value={height} onChange={heightChange} />
                                                    </div>
                                                </div>
                                                <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                                                <div className="flex justify-between">
                                                    <button onClick={() => onReturnToCanvas(workspace)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
                                                </div>
                                            </>);

                                        case FormStates.TILE_SHEET:
                                            return (!activeTileSheet) ? "" : (
                                                <TileSheetEditor key={activeTileSheet.id} tileSheet={activeTileSheet} onTileSheetChange={onTileSheetChange} onTileSheetDelete={onTileSheetDelete} onReturnToCanvas={() => onReturnToCanvas(workspace)} />
                                            );
                                        case FormStates.TILE_SET_DEFINITION:
                                            return (!activeTileSetDefinition) ? "" : (
                                                <TileSetDefinitionEditor key={activeTileSetDefinition.id} tileSetDefinition={activeTileSetDefinition} tileSheets={workspace.tileSheets} onTileSetDefinitionChange={onTileSetDefinitionChange} onTileSetDefinitionDelete={onTileSetDelete} onReturnToCanvas={() => onReturnToCanvas(workspace)} />
                                            );
                                        case FormStates.PRESET:
                                            if (!workspace.tileSetDefinitions) debugger;
                                            return (!activePreset) ? "" : (
                                                <PresetEditor key={activePreset.id} preset={activePreset} tileSetDefinitions={workspace.tileSetDefinitions} onPresetChange={onPresetChange} onPresetDelete={onPresetDelete} onReturnToCanvas={() => onReturnToCanvas(workspace)} />
                                            );
                                        case FormStates.WINDOW:
                                            return (!activeWindow) ? "" : (
                                                <WindowEditor key={activeWindow.id} window={activeWindow} presets={workspace.presets} tileSets={workspace.tileSets} onWindowChange={onWindowChange} onWindowDelete={onWindowDelete} onReturnToCanvas={() => onReturnToCanvas(workspace)} />
                                            )
                                        case FormStates.LAYOUT:
                                            return (!activeLayout) ? "" : (
                                                <LayoutEditor key={activeLayout.id} layout={activeLayout} windows={workspace.windows} onLayoutChange={onLayoutChange} onLayoutDelete={onLayoutDelete} onReturnToCanvas={() => onReturnToCanvas(workspace)} onEditThisLayout={(layoutId) => { onReturnToCanvas(workspace, layoutId) }} />
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