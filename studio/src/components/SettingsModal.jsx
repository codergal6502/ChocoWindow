import { createContext, useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight, faFloppyDisk, faFolderOpen, faImages } from "@fortawesome/free-solid-svg-icons";
import { TAILWIND_INPUT_CLASS_NAME } from "./KitchenSinkConstants.jsx";
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace, ChocoStudioTileSheet, ChocoStudioTileSetDefinition, ChocoStudioTileSheetBlobUrlManager } from "../ChocoStudio.js";
import TileSetDefinitionEditor from "./modal-components/TileSetDefinitionEditor.jsx";
import PresetEditor from "./modal-components/PresetEditor.jsx";
import LayoutEditor from "./modal-components/LayoutEditor.jsx";
import WindowEditor from "./modal-components/WindowEditor.jsx";
import TileSheetEditor from "./modal-components/TileSheetEditor.jsx";
import downloadZip from "../ZipDownloader.jsx";
import { ChocoWinSettings } from "../ChocoWindow.js";

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

    // Total state of the form; default to Settings with the entire nav tree open. 
    const [formState, setFormState] = useState(workspace?.tileSheets?.length ? FormStates.SETTINGS : FormStates.HELP);
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
    const [workspaceName, setWorkspaceName] = useState(workspace?.workspaceName);
    const [width, setWidth] = useState(workspace?.width ?? 1920);
    const [height, setHeight] = useState(workspace?.height ?? 1080);

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
        downloadZip(workspace);
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

    const onTileSetDefinitionDelete = (id) => {
        setFormState(FormStates.SETTINGS);

        const modifiedWorkspace = new ChocoStudioWorkspace(workspace);
        const idx = modifiedWorkspace.tileSetDefinitions.findIndex((p) => p.id == id);

        if (idx >= 0) {
            modifiedWorkspace.tileSetDefinitions.splice(idx, 1);
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
                                    <button onClick={() => setTileSetsNavOpen(!tileSetsNavOpen)} className="block py-1 hover:underline">
                                        <FontAwesomeIcon icon={tileSetsNavOpen ? faAngleDown : faAngleRight} />
                                        Tile Sheets
                                    </button>
                                    <ul className={`ml-8 ${tileSetsNavOpen ? '' : 'hidden'}`}>
                                        <button onClick={newTileSheetOnClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.tileSheets.map((tileSheet) => <li key={tileSheet.id}>
                                            <button onClick={() => tileSheetNavOnClick(tileSheet)} className="block py-1 hover:underline">{String(tileSheet.name).trim() || <span className="italic">no name</span>}</button>
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
                                        <button onClick={newTileSetDefinitionOnClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.tileSetDefinitions.map((tileSetDefinition) => <li key={tileSetDefinition.id}>
                                            <button onClick={() => tileSetDefinitionNavOnClick(tileSetDefinition)} className="block py-1 hover:underline">{String(tileSetDefinition.name).trim() || <span className="italic">no name</span>}</button>
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
                                        <button onClick={newPresetNavOnClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.presets.map((preset) => {
                                            return (<li key={preset.id}>
                                                <button onClick={() => presetNavOnClick(preset)} className="block py-1 hover:underline">{String(preset.name).trim() || <span className="italic">no name</span>}</button>
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
                                        <button onClick={newWindowOnClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.windows.map((window) => {
                                            return (<li key={window.id}>
                                                <button onClick={() => windowNavOnClick(window)} className="block py-1 hover:underline">{String(window.name).trim() || <span className="italic">no name</span>}</button>
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
                                        <button onClick={newLayoutOnClick} className="block py-1 hover:underline">Add New...</button>
                                        {workspace.layouts.map((layout) => {
                                            return (<li key={layout.id}>
                                                <button onClick={() => layoutNavOnClick(layout)} className="block py-1 hover:underline">{String(layout.name).trim() || <span className="italic">no name</span>}</button>
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
                                            return (<>
                                                <h2 className="mb-3 text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">How to Use This Tool</h2>
                                                <p className="mb-2 text-sm italic">Studio Version {ChocoWinSettings.CURRENT_VERSION}</p>
                                                <p className="mb-2 text-sm">This tool lets you take tile sheets containing tiles for window backgrounds and create layouts using windows derived from those tiles.</p>
                                                <h3 className="mb-2 text-xl">Using Configuration Mode</h3>
                                                <p className="mb-2 text-sm">In general, navigating the settings on the left side of this dialog box from top to bottom will result in creating usable layouts. Each layout can also be edited graphically once windows have been added to the layouts.</p>
                                                <h3 className="mb-2 text-xl">Using Graphical Mode</h3>
                                                <p className="mb-2 text-sm">Graphical mode lets you edit the position and dimensions of each window within a layout. If you hold down the <span className="italic">Control</span> or <span className="italic">Command</span> key, changes will snap to the nearest 10 pixels.</p>
                                                <h3 className="mb-2 text-xl">Concepts</h3>
                                                <ul className="list-disc pl-10">
                                                    <li className="mb-2"><span className="font-bold">Layout: </span> A collection of windows that can be exported as a PNG image for use as backgrounds.</li>
                                                    <li className="mb-2"><span className="font-bold">Workspace: </span> A group of definitions for those layouts. The width and height of all layouts are defined as part of the workspace.</li>
                                                    <li className="mb-2"><span className="font-bold">Tile Sheet: </span> A tile sheet is a single PNG image containing the tiles to use. Color substitution currently only works if the selected tiles for a window contain {ChocoWinSettings.suggestedMaximumTileSheetColorCount} or fewer colors.</li>
                                                    <li className="mb-2">
                                                        <p><span className="font-bold">Tile Set Definition: </span> A tile-by-tile definition of the set of tiles that makes up a window. This is the most complicated part of this tool.</p>
                                                        <ul className="list-[square] pl-10">
                                                            <li className="mb-2"><span className="font-bold">Tile Size: </span> The size (in pixels) of each tile. Tiles must be square, and all tiles must be the same size.</li>
                                                            <li className="mb-2">
                                                                <p><span className="font-bold">Window Region: </span> When editing the tile set definition, this selects which region of the window you're editing.</p>
                                                                <ul className="list-[square] pl-10">
                                                                    <li className="mb-2"><span className="italic">Corners: </span> Select the tiles for the chosen corner. Corners do not repeat.</li>
                                                                    <li className="mb-2"><span className="italic">Edges: </span> Select the tiles for the chosen edge. Edges repeat in only one direction and can be multiple tiles wide (for top and bottom edges) or tall (for left and right edges).</li>
                                                                    <li className="mb-2"><span className="italic">Center: </span> Select the tiles for the center. The center will repeat in both directions and can be any number of tiles wide or tall.</li>
                                                                </ul>
                                                            </li>
                                                            <li className="mb-2">
                                                                <p><span className="font-bold">Tile Selection: </span>Select the position in the window region for each tile from the tile sheet.</p>
                                                                <ul className="list-[square] pl-10">
                                                                    <li className="mb-2"><span className="font-bold">Sheet Snap Mode: </span>When selecting a tile from the tile sheet PNG, the selection can be made in increments of one tile size at a time or in increments of one pixel.</li>
                                                                    <li className="mb-2"><span className="font-bold">Approximate Tile Selection: </span>Click on the approximate location of a tile in the tile sheet to assign it to a location in the window region.</li>
                                                                    <li className="mb-2"><span className="font-bold">Precise Tile Selection: </span>Optionally make the selection more precise by clicking on an adjacent tile or adjusting the position numerically.</li>
                                                                    <li className="mb-2"><span className="font-bold">Tile Assignment: </span>Click on one of the positions to assign the selected tile to that position.</li>
                                                                </ul>
                                                            </li>
                                                            <li className="mb-2">
                                                                <p><span className="font-bold">Window Preview: </span>A quick preview of how the selected window will look.</p>
                                                                <ul className="list-[square] pl-10">
                                                                    <li className="mb-2"><span className="font-bold">Preview Tile Scale: </span>How "zoomed in" the tiles should be in the window preview.</li>
                                                                </ul>
                                                            </li>
                                                            <li className="mb-2">
                                                                <p><span className="font-bold">Color Palette: </span>If the selected tiles between them have {ChocoWinSettings.suggestedMaximumTileSheetColorCount} or fewer colors, you can generate a list of substitutable colors.</p>
                                                                <ul className="list-[square] pl-10">
                                                                    <li className="mb-2"><span className="font-bold">Preview Tile Scale: </span>How "zoomed in" the tiles should be in the window preview.</li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                    <li className="mb-2">
                                                        <p><span className="font-bold">Preset: </span> A preset is a reusable configuration of tile set definition, tile scale, and color substitutions that can optionally be used in multiple windows.</p>
                                                        <ul className="list-[square] pl-10">
                                                            <li className="mb-2"><span className="font-bold">Tile Set Definition: </span> The tile set windows using this preset should use.</li>
                                                            <li className="mb-2"><span className="font-bold">Tile Scale: </span> How "zoomed in" the tiles should be in windows that use this preset.</li>
                                                            <li className="mb-2"><span className="font-bold">Color Substitutions: </span> For each color in the chosen tile set definition, substitute that color with a chosen color.</li>
                                                        </ul>
                                                    </li>
                                                    <li className="mb-2">
                                                        <p><span className="font-bold">Window: </span> A window to be drawn as part of the background layout. Each window has a position in pixels and dimensions in pixels. The pixels are relative to the workspace dimensions. If a preset is not used, those settings will have to be defined on a per-window basis.</p>
                                                    </li>
                                                    <li className="mb-2">
                                                        <p><span className="font-bold">Layout: </span> A collection of windows that can be used to generate a PNG image for use as a background. The windows are layered one atop the other.</p>
                                                    </li>
                                                </ul>
                                                <h3 className="mb-2 text-xl">Known Issues</h3>
                                                <ul className="list-disc pl-10">
                                                    <li className="mb-2"><span className="italic">Better Corners: </span>Currently corners can only be a single tile.</li>
                                                    <li className="mb-2"><span className="italic">Preferences for Numerical Limitations: </span>Maximum substitutable color counts and graphical editor snap size should be user settings.</li>
                                                    <li className="mb-2"><span className="italic">Deleting Components Causes Crashes: </span>Deleting components that are used lower in the workspace configuration, for example presets that are used in windows, can cause crashes.</li>
                                                    <li className="mb-2"><span className="italic">New Workspace: </span>There is no way to start an entirely new workspace.</li>
                                                    <li className="mb-2"><span className="italic">User Interface Feedback: </span>Asynchronous operations should provide an indication that an asynchronous operation is happening until it's done.</li>
                                                    <li className="mb-2"><span className="italic">Color Inconsistencies: </span>There are some color inconsistencies that arise from using built-in HTML canvas objects. This seems to be limited to exported PNGs.</li>
                                                </ul>
                                                <h3 className="mb-2 text-xl">Where is My Data Stored?</h3>
                                                <p className="mb-2 text-sm">This application runs entirely within your browser. All of your data is stored on your computer within your browser's <a className="underline text-blue-700 dark:text-blue-300" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" target="_blank">local storage</a>. It persists across sessions, which means if you use a different computer or a different browser or user account on the same computer, or use a private browsing session, you won't have access to your data. Reseting your browser will delete all the data stored in the application. Export your workspace often to back up your workspace.</p>
                                                <h3 className="mb-2 text-xl">Source Code Repository</h3>
                                                <p className="mb-2 text-sm italic">The code for this tool and related tools is available on <a className="underline text-blue-700 dark:text-blue-300" href="https://github.com/codergal6502/ChocoWindow" target="_blank">Git Hub</a> and is released under the <a className="underline text-blue-700 dark:text-blue-300" href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GPL 3.0 License</a></p>
                                                <div className="flex justify-between">
                                                    <button onClick={() => onReturnToEditor(workspace)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
                                                </div>
                                            </>)
                                        case FormStates.SETTINGS:
                                        default:
                                            return (<>
                                                <h2 className="mb-3 text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">Export/Load Workspace</h2>
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
                                                <h2 className="mt-3 mb-3 text-2xl font-bold sticky top-0">Workspace Settings</h2>
                                                <div className="mb-4 w-full">
                                                    <label htmlFor="ccd163fa-8b14-4f68-9b0d-753b093c28ff">Name: </label>
                                                    <input placeholder="Workspace Name" type="text" autoComplete="off" id="ccd163fa-8b14-4f68-9b0d-753b093c28ff" className={TAILWIND_INPUT_CLASS_NAME} onChange={workspaceNameChange} value={workspaceName} />
                                                </div>
                                                <div className={`grid grid-cols-2 gap-4`}>
                                                    <div className="mb-4 w-full">
                                                        <label htmlFor="063ce7b6-c327-4ab2-b343-0556f0e7158d">Width: </label>
                                                        <input placeholder="Width" type="number" id="063ce7b6-c327-4ab2-b343-0556f0e7158d" className={TAILWIND_INPUT_CLASS_NAME} value={width} onChange={widthChange} />
                                                    </div>

                                                    <div className="mb-4 w-full">
                                                        <label htmlFor="c3efc55a-36cd-4f12-b546-308893448ade">Height: </label>
                                                        <input placeholder="Height" type="number" id="c3efc55a-36cd-4f12-b546-308893448ade" className={TAILWIND_INPUT_CLASS_NAME} value={height} onChange={heightChange} />
                                                    </div>
                                                </div>
                                                <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                                                <div className="flex justify-between">
                                                    <button onClick={() => onReturnToEditor(workspace)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
                                                </div>
                                            </>);

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