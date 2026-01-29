import { ChocoStudioWorkspace } from "./ChocoStudio"
import { ChocoWinAbstractPixelReader, ChocoWinAbstractPixelWriterFactory, ChocoWinWindow, ChocoWinAbstractPixelWriter, ChocoWinAbstractPixelReaderFactory } from "./ChocoWindow";

class ChocoWorkspaceRenderer {
    /** @type {ChocoWinAbstractPixelWriterFactory} */ #writerFactory;
    /** @type {ChocoWinAbstractPixelReaderFactory} */ #readerFactory;
    /** @type {ChocoStudioWorkspace} */ #workspace;
    /**
     * Copy constructor.
     * @param {ChocoStudioWorkspace} workspace
     * @param {ChocoWinAbstractPixelWriterFactory} writerFactory
     * @param {ChocoWinAbstractPixelReaderFactory} readerFactory
     */
    constructor(workspace, writerFactory, readerFactory) {
        this.#workspace = new ChocoStudioWorkspace(workspace);
        this.#writerFactory = writerFactory;
        this.#readerFactory = readerFactory;
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

            const studioPreset = this.#workspace.presets.find((ps) => ps.id == studioWindow.presetId) || studioWindow.singularPreset;
            if (!studioPreset) { console.error(`No singular preset or preset with ID ${studioWindow.presetId}.`); return; }

            const tileSetDefinition = this.#workspace.tileSetDefinitions.find((tsd) => tsd.id == studioPreset.tileSetDefinitionId);
            if (!tileSetDefinition) { console.error(`No tile set definition with ID ${studioPreset.tileSetDefinitionId}.`); return; }

            const tileSheet = this.#workspace.tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
            if (!tileSheet) { console.error(`No tile sheet with ID ${tileSetDefinition.tileSheetId}.`); return; }

            if (!this.#readerFactory) { console.error('No reader factory was provided.'); return; }

            const chocoWindow = new ChocoWinWindow({
                winTileSet: tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl),
                tileScale: studioPreset.tileScale,
                x: studioWindow.x,
                y: studioWindow.y,
                w: studioWindow.w,
                h: studioWindow.h,
                readerFactory: this.#readerFactory,
                backgroundColor: studioWindow.backgroundColor,
                colorSubstitutions: studioPreset.substituteColors,
            });

            return chocoWindow;
        }).filter(win => win);

        const result =
            Promise
                .all(wins.map((w) => w.isReady()))
                .then(() => 
                    this.#writerFactory.build(this.#workspace.width, this.#workspace.height).isReady()
                )
                .then(writer => 
                    new Promise(resolve => {
                        wins.forEach(w => w.drawTo(writer));
                        resolve(writer.makeBlob());
                    })
                );
        return result;
    }

    /**
     * @param {String} layoutId The UUID of the layout to render.
     * @return {Promise<Blob>} Promise to yield a data URL containing a PNG rendering of the layout.
     */
    generateLayoutImageBlob = (layoutId) => {
        return new Promise((resolve) => {
            this.#generateCanvas(layoutId).then((blob) => {
                resolve(blob)
            });
        })
    }
}

export { ChocoWorkspaceRenderer };