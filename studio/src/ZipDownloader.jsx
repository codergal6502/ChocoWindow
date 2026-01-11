import { ChocoWorkspaceRenderer } from "./ChocoRender";
import { ChocoStudioWorkspace } from "./ChocoStudio";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";

/**
 * @param {ChocoStudioWorkspace} workspace
 * @return {Promise}
 */
const downloadZip = (workspace) => {
    const renderer = new ChocoWorkspaceRenderer(workspace);

    const /** @type {Array.<Promise.<{name:String, reader:FileReader}>>} */ pngPromises = [];

    for (const layout of workspace.layouts) {
        pngPromises.push(
            new Promise(resolve =>
                renderer.generateLayoutImageBlob(layout.id).then((blob) => {
                    const reader = new BlobReader(blob);
                    resolve({ name: `${layout.name.replaceAll(/[<>:""\\\/|?*]/g, '-')}.png`, reader: reader });
                })
            )
        )
    };

    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);

    Promise.all(pngPromises).then((pngNamePairs) => {
        return Promise.all(pngNamePairs.map(pngNamePair => new Promise(resolve => {
            zipWriter.add(pngNamePair.name, pngNamePair.reader).then(() => resolve())
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