import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChocoStudioWorkspace } from "../../ChocoStudio";
import { faFloppyDisk, faFolderOpen, faImages } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import downloadZip from "../../ZipDownloader";
import { useContext } from "react";
import { ReaderFactoryForStudio, WriterFactoryForStudio } from "../../App";
import { ChocoStudioUpgrader } from "../../ChocoStudioUpgrader";
import { ChocoWinSettings } from "../../ChocoWindow";

/**
 * @param {Object} props
 * @param {ChocoStudioWorkspace} props.workspace
 * @param {function(ChocoStudioWorkspace)} props.onWorkspaceChange
 * @param {function()} props.onCloseClick
 */
const WorkspaceSettings = ({ workspace, onWorkspaceChange, onCloseClick }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               CONSTANTS                              //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const readerFactory = useContext(ReaderFactoryForStudio);
    const writerFactory = useContext(WriterFactoryForStudio);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          STATE AND REF HOOKS                         //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const [name, setName] = useState(workspace?.workspaceName ?? "New Workspace");
    const [width, setWidth] = useState(workspace?.width ?? 1920);
    const [height, setHeight] = useState(workspace?.height ?? 1080);
    const [hasChanges, setHasChanges] = useState(false);
    const [workspaceChangeTimeout, setWorkspaceChangeTimeout] = useState(null);

    const importFileInputRef = useRef(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                               EFFECTS                                //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    useEffect(() => {
        if (hasChanges) {
            // Why not use lodash's _.debounce?
            // See https://www.developerway.com/posts/debouncing-in-react
            // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
            // See https://stackoverflow.com/a/59184678
            clearTimeout(workspaceChangeTimeout);
            const timeout = setTimeout(() => uponWorkspaceChange(), 500);
            setWorkspaceChangeTimeout(timeout);
        }
    }, [name, width, height, hasChanges])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                          UTILITY FUNCTIONS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    const uponWorkspaceChange = () => {
        const newWorkspace = new ChocoStudioWorkspace(workspace);
        newWorkspace.workspaceName = name;
        newWorkspace.width = width;
        newWorkspace.height = height;
        onWorkspaceChange(newWorkspace);
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    
    /**
     * 
     */
    const onExportWorkspaceButtonClick = () => {
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

    /**
     * 
     */
    const onDownloadAssetButtonClick = () => {
        downloadZip(workspace, readerFactory, writerFactory);
    }

    /**
     * 
     */
    const onLoadWorkspaceButtonClick = () => {
        if (importFileInputRef.current) {
            importFileInputRef.current.click();
        }
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onImportFileInputChange = (inputEvent) => {
        const file = inputEvent.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                try {
                    let loadedObject = JSON.parse(readerEvent.target.result)

                    if (loadedObject.version != ChocoWinSettings.CURRENT_VERSION) {
                        loadedObject = ChocoStudioUpgrader.AttemptUpgrade(loadedObject);
                    }
                    const newWorkspace = new ChocoStudioWorkspace(loadedObject);
                    importFileInputRef.current.value = null;
                    onWorkspaceChange(newWorkspace)
                }
                catch (e) {
                    console.error(e);
                    alert('An unexpected error occurred; check the console log for details.')
                }
            }

            reader.readAsText(file);
        }
    }

    /**
     * @param {object} e 
     * @param {HTMLElement} e.target
     */
    const workspaceNameChange = (e) => {
        const newWorkspaceName = e.target.value;
        setName(newWorkspaceName);
        setHasChanges(true);
    }

    /**
     * @param {object} e 
     * @param {HTMLElement} e.target
     */
    const widthChange = (e) => {
        const newWidth = Number(e.target.value);
        setWidth(newWidth);
        setHasChanges(true);
    }

    /**
     * @param {object} e 
     * @param {HTMLElement} e.target
     */
    const heightChange = (e) => {
        const newHeight = Number(e.target.value);
        setHeight(newHeight);
        setHasChanges(true);
    }

    return (<>
        <h2 className="mb-3 text-2xl font-bold sticky top-0 bg-white dark:bg-gray-600">Export/Load Workspace</h2>
        <div className="flex justify-around items-center w-full">
            <button className="flex flex-col items-center" onClick={onLoadWorkspaceButtonClick}>
                <FontAwesomeIcon className="text-6xl" icon={faFolderOpen} />
                <div>Load Workspace...</div>
            </button>
            <button className="flex flex-col items-center" onClick={onExportWorkspaceButtonClick}>
                <FontAwesomeIcon className="text-6xl" icon={faFloppyDisk} />
                <div>Export Workspace...</div>
            </button>
            <button className="flex flex-col items-center" onClick={onDownloadAssetButtonClick}>
                <FontAwesomeIcon className="text-6xl" icon={faImages} />
                <div>Download Assets...</div>
            </button>
            <input className="hidden" accept="application/json" type="file" onChange={onImportFileInputChange} ref={importFileInputRef} />
        </div>
        <h2 className="mt-3 mb-3 text-2xl font-bold sticky top-0">Workspace Settings</h2>
        <div className="mb-4 w-full">
            <label htmlFor="ccd163fa-8b14-4f68-9b0d-753b093c28ff">Name: </label>
            <input placeholder="Workspace Name" type="text" autoComplete="off" id="ccd163fa-8b14-4f68-9b0d-753b093c28ff" className={TAILWIND_INPUT_CLASS_NAME} onChange={workspaceNameChange} value={name} />
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
            <button onClick={onCloseClick} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
        </div>
    </>);

}

export default WorkspaceSettings;