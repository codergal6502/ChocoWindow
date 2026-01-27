import { createContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, ChocoStudioTileSheetBlobUrlManager } from "../ChocoStudio.js";
import TileSetDefinitionEditor from "./modal-components/TileSetDefinitionEditor.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";
import TileSheetEditor from "./modal-components/TileSheetEditor.jsx";
import HowToUseThisTool from "./modal-components/HowToUseThisTool.jsx";
import WorkspaceSettings from "./modal-components/WorkspaceSettings.jsx";

export const TileSheetBlobUrlDictionary = createContext(new ChocoStudioTileSheetBlobUrlManager())

/**
 * @param {Object} props
 * @param {Boolean} props.isModalHidden
 * @param {function(ChocoStudioWorkspace):void} props.onReturnToEditor
 * @param {function(ChocoStudioWorkspace):void} props.onWorkspaceChange
 * @param {ChocoStudioWorkspace} props.workspace
 * @param {Number} props.lastResizeTimestamp
 */
const SettingsModal = ({ isModalHidden, onReturnToEditor, onWorkspaceChange, workspace, lastResizeTimestamp }) => {
    const FormStates = Object.freeze({
        HELP: 'HELP',
        SETTINGS: 'SETTINGS',
        TILE_SHEET: 'TILE_SHEET',
        TILE_SET_DEFINITION: 'TILE_SET_DEFINITION',
        TILE_SET: 'TILE_SET',
        PRESET: 'PRESET',
        LAYOUT: 'LAYOUT',
        WINDOW: 'WINDOW',
        VARIABLE: 'VARIABLE',
    });

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [formState, setFormState] = useState(workspace?.tileSheets?.length ? FormStates.SETTINGS : FormStates.HELP);

    // navigation tree
    // // // // // // // // // // // // // // // // // // // // // // // // //

    const [tileSetDefinitionsNavOpen, setTileSetDefinitionsNavOpen] = useState(true);
    const [tileSheetsNavOpen, setTileSheetsNavOpen] = useState(true);
    const [presetsNavOpen, setPresetsNavOpen] = useState(true);
    const [layoutsNavOpen, setLayoutsNavOpen] = useState(true);
    const [windowsNavOpen, setWindowsNavOpen] = useState(true);

    // active editors
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /** @type {ReturnType<typeof useState<ChocoStudioTileSheet>>} */ 
    const [activeTileSheet, setActiveTileSheet] = useState(null);
    /** @type {ReturnType<typeof useState<ChocoWinTileSet>>} */ 
    const [activeTileSet, setActiveTileSet] = useState(null);
    /** @type {ReturnType<typeof useState<ChocoStudioTileSetDefinition>>} */ 
    const [activeTileSetDefinition, setActiveTileSetDefinition] = useState(null);
    /** @type {ReturnType<typeof useState<ChocoStudioPreset>>} */ 
    const [activePreset, setActivePreset] = useState(null);
    /** @type {ReturnType<typeof useState<ChocoStudioLayout>>} */ 
    const [activeLayout, setActiveLayout] = useState(null);
    /** @type {ReturnType<typeof useState<ChocoStudioWindow>>} */ 
    const [activeWindow, setActiveWindow] = useState(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    
    // tile sheet CRUD events
    // // // // // // // // // // // // // // // // // // // // // // // // // 
    
    /**
     * 
     */
    const onNewTileSheetClick = () => {
        setFormState(FormStates.TILE_SHEET);
        setActiveTileSheet(new ChocoStudioTileSheet());
    }

    /**
     * @param {ChocoStudioTileSheet} tileSheet 
     */
    const onLoadTileSheetClick = (tileSheet) => {
        setFormState(FormStates.TILE_SHEET);
        setActiveTileSheet(new ChocoStudioTileSheet(tileSheet));
    }

    /**
     * @param {ChocoStudioTileSheet} updatedTileSheet
     */
    const onTileSheetChange = (updatedTileSheet) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.tileSheets.findIndex((ts) => ts.id == updatedTileSheet.id);

        if (idx < 0) idx = modifiedWorkspace.tileSheets.length;
        modifiedWorkspace.tileSheets[idx] = updatedTileSheet;

        onWorkspaceChange(modifiedWorkspace);
        setActiveTileSheet(updatedTileSheet);
    }

    /**
     * @param {String} id 
     */
    const onTileSheetDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSheets.findIndex((ts) => ts.id == id);

        if (idx >= 0) {
            modifiedWorkspace.tileSheets.splice(idx, 1);
        }

        onWorkspaceChange(modifiedWorkspace);
        setActiveTileSheet(null);
    }

    // tile set definition CRUD events
    // // // // // // // // // // // // // // // // // // // // // // // // // 
    
    /**
     * 
     */
    const onNewTileSetDefinitionClick = () => {
        setFormState(FormStates.TILE_SET_DEFINITION);
        setActiveTileSetDefinition(new ChocoStudioTileSetDefinition());
    }

    /**
     * @param {ChocoStudioTileSetDefinition} tileSetDefinition 
     */
    const onLoadTileSetDefinitionClick = (tileSetDefinition) => {
        setFormState(FormStates.TILE_SET_DEFINITION);
        setActiveTileSetDefinition(new ChocoStudioTileSetDefinition(tileSetDefinition));
    }

    /**
     * @param {ChocoStudioTileSetDefinition} updatedTileSetDefinition
     */
    const onTileSetDefinitionChange = (updatedTileSetDefinition) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.tileSetDefinitions.findIndex((tsd) => tsd.id == updatedTileSetDefinition.id);

        if (idx < 0) idx = modifiedWorkspace.tileSetDefinitions.length;
        modifiedWorkspace.tileSetDefinitions[idx] = updatedTileSetDefinition;

        onWorkspaceChange(modifiedWorkspace);
        setActiveTileSetDefinition(updatedTileSetDefinition);
    }

    /**
     * @param {String} id 
     */
    const onTileSetDefinitionDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSetDefinitions.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.tileSetDefinitions.splice(idx, 1);
        }

        onWorkspaceChange(modifiedWorkspace);
        setActiveTileSet(null);
    }

    // preset CRUD events
    // // // // // // // // // // // // // // // // // // // // // // // // // 

    /**
     * 
     */
    const onNewPresetClick = () => {
        setFormState(FormStates.PRESET);
        setActivePreset(new ChocoStudioPreset());
    }

    /**
     * @param {ChocoStudioPreset} preset 
     */
    const onLoadPresetClick = (preset) => {
        setFormState(FormStates.PRESET);
        setActivePreset(new ChocoStudioPreset(preset));
    }

    /**
     * @param {ChocoStudioPreset} updatedPreset 
     */
    const onPresetChange = (/** @type {ChocoStudioPreset} */ updatedPreset) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.presets.findIndex((p) => p.id == updatedPreset.id);

        if (idx < 0) idx = modifiedWorkspace.presets.length;

        modifiedWorkspace.presets[idx] = updatedPreset;

        onWorkspaceChange(modifiedWorkspace);
        setActivePreset(updatedPreset);
    }

    /**
     * @param {String} id 
     */
    const onPresetDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.presets.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.presets.splice(idx, 1);
        }

        onWorkspaceChange(modifiedWorkspace);
        setActivePreset(null);
    }

    // layout CRUD events
    // // // // // // // // // // // // // // // // // // // // // // // // // 

    /**
     * 
     */
    const onNewLayoutClick = () => {
        setFormState(FormStates.LAYOUT);
        setActiveLayout(new ChocoStudioLayout());
    }

    /**
     * @param {ChocoStudioLayout} layout 
     */
    const onLoadLayoutClick = (layout) => {
        setFormState(FormStates.LAYOUT);
        setActiveLayout(new ChocoStudioLayout(layout));
    }

    /**
     * @param {ChocoStudioLayout} updatedLayout 
     */
    const onLayoutChange = (updatedLayout) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.layouts.findIndex((p) => p.id == updatedLayout.id);

        if (idx < 0) idx = modifiedWorkspace.layouts.length;

        modifiedWorkspace.layouts[idx] = updatedLayout;

        onWorkspaceChange(modifiedWorkspace);
        setActiveLayout(updatedLayout);
    }

    /**
     * @param {String} id 
     */
    const onLayoutDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.layouts.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.layouts.splice(idx, 1);
        }

        onWorkspaceChange(modifiedWorkspace);
        // todo: why was this commented out? // setActivelayout(null);
    }

    // window CRUD events
    // // // // // // // // // // // // // // // // // // // // // // // // // 

    /**
     * 
     */
    const onNewWindowClick = () => {
        setFormState(FormStates.WINDOW);
        setActiveWindow(new ChocoStudioWindow());
    }

    /**
     * @param {ChocoStudioWindow} window 
     */
    const onLoadWindowClick = (window) => {
        setFormState(FormStates.WINDOW);
        setActiveWindow(new ChocoStudioWindow(window));
    }

    /**
     * @param {ChocoStudioWindow} updatedWindow 
     */
    const onWindowChange = (updatedWindow) => {
        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        let idx = modifiedWorkspace.windows.findIndex((p) => p.id == updatedWindow.id);

        if (idx < 0) idx = modifiedWorkspace.windows.length;

        modifiedWorkspace.windows[idx] = updatedWindow;

        onWorkspaceChange(modifiedWorkspace);
        setActiveWindow(updatedWindow);
    }

    /**
     * @param {String} id 
     */
    const onWindowDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.windows.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.windows.splice(idx, 1);
        }

        onWorkspaceChange(modifiedWorkspace);
        setActiveWindow(null);
    }

    return (
        <div id="modal" className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="rounded-lg shadow-lg w-5/6 h-5/6 flex relative bg-white dark:bg-gray-600 dark:text-gray-100 ">
                    <div className="bg-gray-300 dark:bg-gray-800 text-gray-700 dark:text-white p-4 pr-6 rounded-l-lg flex-none">
                        <nav className="h-full overflow-y-auto">
                            <h2 className="font-bold text-lg sticky top-0 bg-gray-300 dark:bg-gray-800">Workspace</h2>
                            <ul>
                                <li>
                                    <button onClick={() => setFormState(FormStates.HELP)} className="block py-1 hover:underline">How to Use This Tool</button>
                                </li>
                                <li>
                                    <button onClick={() => setFormState(FormStates.SETTINGS)} className="block py-1 hover:underline">Workspace Settings</button>
                                </li>
                                <li>
                                    <button onClick={() => setTileSheetsNavOpen(!tileSheetsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={tileSheetsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Sheets
                                    </button>
                                    <ul className={`ml-8 ${tileSheetsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={onNewTileSheetClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.tileSheets.map((tileSheet) => <li key={tileSheet.id}>
                                            <button onClick={() => onLoadTileSheetClick(tileSheet)} className="block py-1 hover:underline">{String(tileSheet.name).trim() || <span className="italic">no name</span>}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setTileSetDefinitionsNavOpen(!tileSetDefinitionsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={tileSetDefinitionsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Set Definitions
                                    </button>
                                    <ul className={`ml-8 ${tileSetDefinitionsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={onNewTileSetDefinitionClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.tileSetDefinitions.map((tileSetDefinition) => <li key={tileSetDefinition.id}>
                                            <button onClick={() => onLoadTileSetDefinitionClick(tileSetDefinition)} className="block py-1 hover:underline">{String(tileSetDefinition.name).trim() || <span className="italic">no name</span>}</button>
                                        </li>)
                                        }
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setPresetsNavOpen(!presetsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={presetsNavOpen ? faAngleDown : faAngleRight} />
                                        Presets
                                    </button>
                                    <ul className={`ml-8 ${presetsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={onNewPresetClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.presets.map((preset) => {
                                            return (<li key={preset.id}>
                                                <button onClick={() => onLoadPresetClick(preset)} className="block py-1 hover:underline">{String(preset.name).trim() || <span className="italic">no name</span>}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setWindowsNavOpen(!windowsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={windowsNavOpen ? faAngleDown : faAngleRight} />
                                        Windows
                                    </button>
                                    <ul className={`ml-8 ${windowsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={onNewWindowClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.windows.map((window) => {
                                            return (<li key={window.id}>
                                                <button onClick={() => onLoadWindowClick(window)} className="block py-1 hover:underline">{String(window.name).trim() || <span className="italic">no name</span>}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                <li>
                                    <button onClick={() => setLayoutsNavOpen(!layoutsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={layoutsNavOpen ? faAngleDown : faAngleRight} />
                                        Layouts
                                    </button>
                                    <ul className={`ml-8 ${layoutsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={onNewLayoutClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.layouts.map((layout) => {
                                            return (<li key={layout.id}>
                                                <button onClick={() => onLoadLayoutClick(layout)} className="block py-1 hover:underline">{String(layout.name).trim() || <span className="italic">no name</span>}</button>
                                            </li>)
                                        })}
                                    </ul>
                                </li>
                                {/* <li>
                                    <button onClick={() => setVariablesNavOpen(!variablesNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={variablesNavOpen ? faAngleDown : faAngleRight} />
                                        Variables
                                    </button>
                                    <ul className={`ml-8 ${variablesNavOpen ? '' : 'hidden'}`}>
                                        <a href="#" className="block py-1 hover:underline">Add New...</a>
                                        {workspace.variables.map((variable) => {
                                            return (<li key={variable.id}>
                                                <a href="#" className="block py-1 hover:underline">{variable.name}</a>
                                            </li>)
                                        })}
                                    </ul>
                                </li> */}
                            </ul>
                        </nav>
                    </div>

                    <div className="flex-grow p-6 rounded-lg">
                        <div className="h-full overflow-y-auto">
                            {
                                (() => {
                                    switch (formState) {
                                        case FormStates.HELP:
                                            return <HowToUseThisTool workspace={workspace} onCloseClick={onReturnToEditor} />
                                        case FormStates.SETTINGS:
                                        default:
                                            return <WorkspaceSettings workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
                                        case FormStates.TILE_SHEET:
                                            return (!activeTileSheet) ? "" : (
                                                <TileSheetEditor key={activeTileSheet.id} tileSheet={activeTileSheet} onTileSheetChange={onTileSheetChange} onTileSheetDelete={onTileSheetDelete} onReturnToEditor={() => onReturnToEditor(workspace)} />
                                            );
                                        case FormStates.TILE_SET_DEFINITION:
                                            return (!activeTileSetDefinition) ? "" : (
                                                <TileSetDefinitionEditor key={activeTileSetDefinition.id} tileSetDefinition={activeTileSetDefinition} tileSheets={workspace.tileSheets} onTileSetDefinitionChange={onTileSetDefinitionChange} onTileSetDefinitionDelete={onTileSetDefinitionDelete} onReturnToEditor={() => onReturnToEditor(workspace)} lastResizeTimestamp={lastResizeTimestamp} />
                                            );
                                        case FormStates.PRESET:
                                            return (!activePreset) ? "" : (
                                                <PresetEditor key={activePreset.id} preset={activePreset} tileSheets={workspace.tileSheets} tileSetDefinitions={workspace.tileSetDefinitions} onPresetChange={onPresetChange} onPresetDelete={onPresetDelete} onReturnToEditor={() => onReturnToEditor(workspace)} />
                                            );
                                        case FormStates.WINDOW:
                                            return (!activeWindow) ? "" : (
                                                <WindowEditor key={activeWindow.id} window={activeWindow} presets={workspace.presets} tileSetDefinitions={workspace.tileSetDefinitions} tileSheets={workspace.tileSheets} onWindowChange={onWindowChange} onWindowDelete={onWindowDelete} onReturnToEditor={() => onReturnToEditor(workspace)} />
                                            )
                                        case FormStates.LAYOUT:
                                            return (!activeLayout) ? "" : (
                                                <LayoutEditor key={activeLayout.id} layout={activeLayout} windows={workspace.windows} onLayoutChange={onLayoutChange} onLayoutDelete={onLayoutDelete} onReturnToEditor={() => onReturnToEditor(workspace)} onEditThisLayout={(layoutId) => { onReturnToEditor(workspace, layoutId) }} />
                                            )
                                        case FormStates.VARIABLE:
                                            return <h2 className="text-2xl font-bold sticky top-0">variable</h2>;
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