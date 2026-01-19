import { ChocoStudioWorkspace } from "./ChocoStudio"
import { ChocoWinAbstractPixelReader, ChocoWinAbstractPixelWriterFactory, ChocoWinWindow, ChocoWinAbstractPixelWriter } from "./ChocoWindow";

class ChocoWorkspaceRenderer {
    /** @type {ChocoWinAbstractPixelWriterFactory} */ #writerFactory;
    /** @type {ChocoStudioWorkspace} */ #workspace;
    /**
     * Copy constructor.
     * @param {ChocoStudioWorkspace} workspace
     * @param {ChocoWinAbstractPixelWriterFactory} writerFactory
     */
    constructor(workspace, writerFactory) {
        this.workspace = new ChocoStudioWorkspace(workspace);
        this.#writerFactory = writerFactory;
    }

    /**
     * @param {String} layoutId The UUID of the layout to render.
     * @return {Promise<Blob>} A promise to resolve to a bolb.
     */
    #generateCanvas = (layoutId) => {
        const layout = this.#workspace.layouts.find((l) => layoutId == l.id);
        if (!layout) {
            console.error(`No layout with ID ${layoutId}`);
            return;
        }

        const wins = layout.windowIds.map((wId) => {
            const studioWindow = this.#workspace.windows.find((w) => wId == w.id);
            if (!studioWindow) { console.error(`No window with ID ${wId}.`); return; };

            const studioPreset = studioWindow.singularPreset || this.#workspace.presets.find((ps) => ps.id == studioWindow.presetId);
            if (!studioPreset) { console.error(`No singular preset or preset with ID ${studioWindow.presetId}.`); return; }

            const tileSetDefinition = this.#workspace.tileSetDefinitions.find((tsd) => tsd.id == studioPreset.tileSetDefinitionId);
            if (!tileSetDefinition) { console.error(`No tile set definition with ID ${studioPreset.tileSetDefinitionId}.`); return; }

            const tileSheet = this.#workspace.tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
            if (!tileSheet) { console.error(`No tile sheet with ID ${tileSetDefinition.tileSheetId}.`); return; }

            const chocoWindow = new ChocoWinWindow(
                tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl),
                studioPreset.tileScale,
                studioWindow.x,
                studioWindow.y,
                studioWindow.w,
                studioWindow.h,
                studioPreset.substituteColors
            );

            return chocoWindow;
        });

        const bigPromise = Promise.all(wins.map((w) => w.isReady()));

        return new Promise((resolve) => {
            bigPromise.then(() => {

                const writer =
                    this.#writerFactory.build(this.#workspace.width, this.#workspace.height);

                writer.isReady().then(() => wins.forEach((w) => w.drawTo(writer)));
                resolve(writer.makeBlob());
            });
        });
    }

    /**
     * @param {String} layoutId The UUID of the layout to render.
     * @return {Promise<Blob>} Promise to yield a data URL containing a PNG rendering of the layout.
     */
    generateLayoutImageBlob = (layoutId) => {
        return new Promise((resolve) => {
            this.#generateCanvas(layoutId).then((blob) => { resolve(blob) });
        })
    }

    /**
     * @param {String} layoutId The UUID of the layout to render.
     * @return {Promise<String>} Promise to yield a data URL containing a PNG rendering of the layout.
     */
    generateLayoutImageDataUrl = (layoutId) => {
        return new Promise((resolve) => {
            this.#generateCanvas(layoutId).then((canvas) => {
                const dataUrl = canvas.toDataURL("image/png", 10);
                resolve(dataUrl);
            })
        })
    };
}

export { ChocoWorkspaceRenderer };