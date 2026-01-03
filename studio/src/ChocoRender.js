import { ChocoStudioLayout } from "./ChocoStudio"

class ChocoRender {
    /**
     * Copy constructor.
     * @param {Array<ChocoWinWindow} layout
     */
    constructor(layout) {
        this.layout = layout;
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
    
    generateImageDataUrl = () => {
        // const windows = this.
        // this.windows.forEach((w) => )
    }
}