import { ChocoWorkspaceRenderer } from "./ChocoRender";
import { ChocoStudioWorkspace } from "./ChocoStudio";
import { BlobReader, BlobWriter, Data64URIReader, TextReader, ZipWriter } from "@zip.js/zip.js";

/**
 * @param {ChocoStudioWorkspace} workspace
 * @return {Promise}
 */
const downloadZip = (workspace) => {
    const invalidCharRegEx = /[<>:""\\\/|?*]/g;
    const renderer = new ChocoWorkspaceRenderer(workspace);

    const /** @type {Array.<Promise.<{name:String, reader:FileReader}>>} */ readerPromises = [];

    for (const layout of workspace.layouts) {
        readerPromises.push(
            new Promise(resolve =>
                renderer.generateLayoutImageBlob(layout.id).then((blob) => {
                    const reader = new BlobReader(blob);
                    resolve({ name: `Layouts/${layout.name.replaceAll(invalidCharRegEx, '_')}.png`, reader: reader });
                })
            )
        )
    };

    readerPromises.push(
        new Promise(resolve =>
            resolve({ name: `${workspace.workspaceName.replace(invalidCharRegEx, '_')}.json`, reader: new TextReader(JSON.stringify(workspace)) })
        )
    );

    for (const tileSheet of workspace.tileSheets) {
        readerPromises.push(
            new Promise(resolve =>
                resolve({ name: `Tile Sheets/${tileSheet.name.replace(invalidCharRegEx, '_')}.png`, reader: new Data64URIReader(tileSheet.imageDataUrl) })
            )
        )
    }

    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    Promise.all(readerPromises).then((filePairs) => {
        return Promise.all(filePairs.map(filePair => new Promise(resolve => {
            zipWriter.add(`${filePair.name}`, filePair.reader).then(() => resolve())
        })))
    }).then(() => {
        zipWriter.close();
        return zipFileWriter.getData();
    }).then((zipBlob) => {
        const link = document.createElement("a");
        link.download = `${workspace.workspaceName.replaceAll(/[<>:""\\\/|?*]/g, '-')}.zip`;
        link.href = URL.createObjectURL(zipBlob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    })
}

export default downloadZip;