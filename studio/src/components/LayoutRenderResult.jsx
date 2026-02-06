import { useEffect, useRef } from "react";

const LayoutRenderResult = ({ isModalHidden, dataUrl, downloadName, onReturnToEditor }) => {
    const imgRef = useRef(null);

    useEffect(() => { imgRef.current.src = dataUrl; }, [imgRef, dataUrl])

    const onDownloadPngClick = () => {
        const link = document.createElement("a");
        link.download = downloadName;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div id="modal" className={`settings-modal fixed inset-0 ${isModalHidden ? 'hidden' : ''} bg-black bg-opacity-50 z-40`}>
            <div className="flex items-center justify-center w-full h-full">
                <div className="rounded-lg shadow-lg flex relative bg-white dark:bg-gray-600 dark:text-gray-100">
                    <div className="flex-grow p-6 rounded-lg dark:text-gray-300">
                        <div className="h-full overflow-y-auto">
                            <h3 className="mb-2 text-xl">Preview</h3>
                            <div className="flex-grow p-6 rounded-lg dark:text-gray-300">
                                <img alt="Rendered Window" style={{ width: "400px" }} ref={imgRef} />
                            </div>
                            <h3 className="mb-2 mt-4 text-xl">Actions</h3>
                            <div className="flex justify-between">
                                <button onClick={onDownloadPngClick} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Download Layout PNG</button>
                                <button onClick={onReturnToEditor} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-500">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default LayoutRenderResult;