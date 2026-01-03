import { ChocoStudioWorkspace } from "./ChocoStudio"
import { ChocoWinWindow } from "./ChocoWindow";

class ChocoWorkspaceRenderer {
    /**
     * Copy constructor.
     * @param {ChocoStudioWorkspace} workspace
     */
    constructor(workspace) {
        this.workspace = new ChocoStudioWorkspace(workspace);
    }

    /**
     * @param {String} layoutId The UUID of the layout to render.
     * @returns A ata URL containing a PNG rendering of the layout.
     */
    generateLayoutImageDataUrl = (layoutId, onComplete) => {
        const layout = this.workspace.layouts.find((l) => layoutId == l.id);
        if (!layout) {
            console.error(`No layout with ID ${layoutId}`);
            return;
        }

        const wins = layout.windowIds.map((wId) => {
            const studioWindow = this.workspace.windows.find((w) => wId == w.id);
            if (!studioWindow) { console.error(`No window with ID ${wId}.`); return; };

            const studoPreset = studioWindow.singularPreset || this.workspace.presets.find((ps) => ps.id == studioWindow.presetId);
            if (!studoPreset) { console.error(`No singular preset or preset with ID ${studioWindow.presetId}.`); return; }

            const tileset = this.workspace.tileSets.find((ts) => ts.id == studoPreset.tileSetId);
            if (!tileset) { console.error(`No tileset with ID ${studoPreset.tileSetId}.`); return; }

            const chocoWindow = new ChocoWinWindow(
                tileset
              , studoPreset.tileScale
              , studioWindow.x
              , studioWindow.y
              , studioWindow.w
              , studioWindow.h
            );

            return chocoWindow;
        });

        Promise.all(wins.map((w) => w.isReady())).then(() => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = this.workspace.width;
            canvas.height = this.workspace.height;

            wins.forEach((w) => w.drawTo(ctx));

            const dataUrl = canvas.toDataURL("image/png", 10);
            if (onComplete) onComplete(dataUrl);
        });
    }

    // All of this will be done in the native application.
    // URLs: l = layout, i = instance
    // chat  streamer  obs html             firebot        ChocoServer          Workspace  Server Mutex Mem  ChocoRenderLayout
    // ----  --------  -------------------  -------        -----------          ---------  ----------------  -----------------
    //   |     |           |                    |                |                    |            |                 |
    //   |     |--------------- load JSON file ----------------> |                    |            |                 |
    //   |     | <-----------------------------------------------|                    |            |                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |-----GET /l/<uuid>/i text/html-----> |                    |            |                 |
    //   |     |           | <----------text/html----------------|                    |            |                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |-----GET /l/<uuid>/i image/png-----> |                    |            |                 |
    //   |     |           |                    |                |--get layout uuid-> |            |                 |
    //   |     |           |                    |                | <-----layout-------|            |                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |                    |                |---------get variables---------> |                 |
    //   |     |           |                    |                | <------------variables----------+                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |                    |                |----------layout, variables----------------------> |
    //   |     |           |                    |                | <-------------------PNG---------------------------|
    //   |     |           | <----------image/png----------------|                    |            |                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |-----------chat event --------------> |                |                    |            |                 |
    //   |     |           |                    |-set variables->|                    |            |                 |
    //   |     |           |                    |                |---------set variables---------> |                 |
    //   |     |           |                    |                | <-------------------------------+                 |
    //   |     |           | <--------web socket message---------|                    |            |                 |
    //   |     |           |-----GET /l/<uuid>/i image/png-----> |                    |            |                 |
    //   |     |           |                    |                |--get layout uuid-> |            |                 |
    //   |     |           |                    |                | <-----layout-------|            |                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |                    |                |---------get variables---------> |                 |
    //   |     |           |                    |                | <------------variables----------+                 |
    //   |     |           |                    |                |                    |            |                 |
    //   |     |           |                    |                |----------layout, variables----------------------> |
    //   |     |           |                    |                | <-------------------------------------------------|
    //   |     |           | <----------image/png----------------|                    |            |                 |
}

export { ChocoWorkspaceRenderer };