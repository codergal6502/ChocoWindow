import { ChocoStudioWorkspace } from "../../ChocoStudio";
import { ChocoWinSettings } from "../../ChocoWindow";

/**
 * @param {Object} props
 * @param {ChocoStudioWorkspace} props.workspace
 * @param {function()} props.onCloseClick 
 */
const HowToUseThisTool = ({ workspace, onCloseClick }) => {
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
                        <p><span className="font-bold">Granularity: </span> How much detail you want to specify for the each region.</p>
                        <ul className="list-[square] pl-10">
                            <li className="mb-2"><span className="italic">Single-Tile Edges: </span> Each corner is a single tile. The top and bottom edges or left and right edges are respectively any number of tiles horizontally or vertically to fill the space. The center region can be any number of tiles in size and goes from edge to edge.</li>
                            <li className="mb-2"><span className="italic">Basic Edges: </span> The top regions (the top edge and both corners) all share a common height as do the bottom regions. The bottom regions similarly share a common height, and similarly for the left and right regions. The center region can be any number of tiles in size and goes from edge to edge.</li>
                            <li className="mb-2"><span className="italic">Arbitrary Edges: </span> Each region can be any size. Edge regions can have arbitrary margins from either of the sides they span, and the center can have arbitrary margins to any side. This means regions can overlap or not touch.</li>
                        </ul>
                    </li>
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
                        <p><span className="font-bold">Tile Transformation: </span>Rotate the tile and specify pixels to be fully transparent.</p>
                        <ul className="list-[square] pl-10">
                            <li className="mb-2"><span className="font-bold">Reflection: </span>The tile can be reflected horizontally, vertically, or over either diagonal.</li>
                            <li className="mb-2"><span className="font-bold">Rotation: </span>The tile can be rotated by 90º, 180º, or 270º.</li>
                            <li className="mb-2"><span className="font-bold">Transparency: </span>Transparency can be overriden on a pixel-per-pixel basis, either one pixel at a time or by adjacent pixels of the same color.</li>
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
            <li className="mb-2"><span className="italic">Preferences for Numerical Limitations: </span>Maximum substitutable color counts and graphical editor snap size should be user settings.</li>
            <li className="mb-2"><span className="italic">New Workspace: </span>There is no way to start an entirely new workspace.</li>
            <li className="mb-2"><span className="italic">User Interface Feedback: </span>Asynchronous operations should provide an indication that an asynchronous operation is happening until it's done.</li>
            <li className="mb-2"><span className="italic">Graphical Editor: </span>The grapical editor has limited functionality. There are plans to </li>
        </ul>
        <h3 className="mb-2 text-xl">Where is My Data Stored?</h3>
        <p className="mb-2 text-sm">This application runs entirely within your browser. All of your data is stored on your computer within your browser's <a className="underline text-blue-700 dark:text-blue-300" href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" rel="noreferrer" target="_blank">local storage</a>. It persists across sessions, which means if you use a different computer or a different browser or user account on the same computer, or use a private browsing session, you won't have access to your data. Reseting your browser will delete all the data stored in the application. Export your workspace often to back up your workspace.</p>
        <h3 className="mb-2 text-xl">Source Code Repository</h3>
        <p className="mb-2 text-sm italic">The code for this tool and related tools and examples is available on <a className="underline text-blue-700 dark:text-blue-300" href="https://github.com/codergal6502/ChocoWindow" target="_blank">Git Hub</a> and is released under the <a className="underline text-blue-700 dark:text-blue-300" href="https://www.gnu.org/licenses/gpl-3.0.en.html" rel="noreferrer" target="_blank">GPL 3.0 License</a></p>
        <div className="flex justify-between">
            <button onClick={() => onCloseClick(workspace)} className="bg-teal-500 text-white font-bold py-2 px-4 rounded hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-500">Close</button>
        </div>
    </>)
}

export default HowToUseThisTool;