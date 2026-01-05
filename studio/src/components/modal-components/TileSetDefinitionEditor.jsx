import { useEffect, useRef, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoWinWindow, ChocoWinColor, ChocoWinTileSet } from "../../ChocoWindow";
import { ChocoStudioWindowDefinition, ChocoStudioTileSheet, CHOCO_WINDOW_REGIONS } from "../../ChocoStudio";

// See https://bikeshedd.ing/posts/use_state_should_require_a_dependency_array/.

/**
 * @param {object} props
 * @param {ChocoStudioWindowDefinition} props.tileSetDefinition
 * @param {Array<ChocoStudioTileSheet>} props.tileSheets
 * @param {Function} props.onTileSetDefinitionChange
 * @param {Function} props.onTileSetDefinitionDelete
 * @returns {JSX.Element}
 */
const TileSetDefinitionEditor = ({ tileSetDefinition, tileSheets, onTileSetDefinitionChange, onTileSetDefinitionDelete }) => {




    const hasChangeHandler = onTileSetDefinitionChange && typeof onTileSetDefinitionChange == "function";
    const hasDeleteHandler = onTileSetDefinitionDelete && typeof onTileSetDefinitionDelete == "function";

    const [substituteColors, setSubstituteColors] = useState([]);
    const [substituteColorsDelayed, setSubstituteColorsDelayed] = useState([]);

    const imageRef = useRef(null);

    const [name, setName] = useState(tileSetDefinition.name);
    const [tileSheetId, setTileSheetId] = useState(tileSetDefinition.tileSheetId);
    const [isTileSheetImageValid, setIsTileSheetImageValid] = useState(false);
    const [tileSize, setTileSize] = useState(tileSetDefinition.tileSize);
    const [windowRegion, setWindowRegion] = useState(CHOCO_WINDOW_REGIONS.TOP_LEFT);
    const [regionSizes, setRegionSizes] = useState(structuredClone(tileSetDefinition.regionSizes));

    useEffect(() => {
        if (imageRef && imageRef.current) {
            const tileSheet = tileSheets.find((ts) => ts.id == tileSheetId);
            if (tileSheet && tileSheet.imageDataUrl) {
                imageRef.current.src = tileSheet.imageDataUrl;

                setIsTileSheetImageValid(true);
                return;
            }
        }

        setIsTileSheetImageValid(false);
    }, [imageRef, tileSheetId])

    let subColsTimedTimeout = null;

    useEffect(() => {
        if (substituteColorsDelayed && substituteColorsDelayed.length) {
            if (subColsTimedTimeout) {
                clearTimeout(subColsTimedTimeout);
            }

            setTimeout(() => { setSubstituteColors(substituteColorsDelayed); }, 50)
        }

    }, [substituteColorsDelayed])

    useEffect(() => {
        if (!imageRef.current) { return; }
        let chocoWin = new ChocoWinWindow(tileSetDefinition, 3, 0, 0, 450, 180);

        if (substituteColors && substituteColors.length) {
            substituteColors.forEach((col, idx) => {
                chocoWin.substituteColor(idx, col);
            });
        }

        chocoWin.isReady().then(() => {
            const canvas = document.createElement("canvas");
            canvas.width = 450;
            canvas.height = 180;
            canvas.style.imageRendering = "pixelated";

            const /** @type {CanvasRenderingContext2D} */ ctx = canvas.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" });
            ctx.imageSmoothingEnabled = false;

            chocoWin.drawTo(ctx);

            let dataUrl = canvas.toDataURL("image/png", 1);
            imageRef.current.src = dataUrl;
        });
    }, [tileSetDefinition, substituteColors, imageRef])

    const subColorOnChange = ((e, colorIndex) => {
        let newSubCols = substituteColors.slice();
        newSubCols[colorIndex] = new ChocoWinColor(e.target.value);
        setSubstituteColorsDelayed(newSubCols);
    });

    /**
     * @param {function(ChocoStudioWindowDefinition): void} propModCallback
     */
    const doOnTileSetDefinitionChange = (propModCallback) => {
        const newTileSetDefinition = new ChocoStudioWindowDefinition(tileSetDefinition);
        if (hasChangeHandler) {
            if (propModCallback && typeof propModCallback == "function") {
                propModCallback(newTileSetDefinition);
            }

            onTileSetDefinitionChange(newTileSetDefinition);
        }
    }

    /**
     * @param {InputEvent} e
     */
    const onNameChange = (e) => {
        setName(e.target.value);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.name = e.target.value);
    };

    let lastTileSizeTimeStamp = 0; // sometimes using the spin wheel built into the number picker repeats this.

    /**
     * @param {InputEvent} e
     */
    const onTileSizeChange = (e) => {
        setTileSize(e.target.value);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.tileSize = Number(e.target.value))
    }

    /**
     * @param {InputEvent} e
     */
    const onTileSheetIdChange = (e) => {
        setTileSheetId(e.target.value);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.tileSheetId = e.target.value);
    };

    /**
     * @param {InputEvent} e
     */
    const windowHeightOnChange = (e) => {
        const newRegionSizes = structuredClone(regionSizes);
        newRegionSizes[windowRegion].height = e.target.value;
        setRegionSizes(newRegionSizes);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regionSizes = newRegionSizes);
    };

    /**
     * @param {InputEvent} e
     */
    const windowWidthOnChange = (e) => {
        const newRegionSizes = structuredClone(regionSizes);
        newRegionSizes[windowRegion].width = e.target.value;
        setRegionSizes(newRegionSizes);
        doOnTileSetDefinitionChange((newTileSetDefinition) => newTileSetDefinition.regionSizes = newRegionSizes);
    };

    const doOnTileSetDefinitionDelete = (id) => {
        if (onTileSetDefinitionDelete && typeof onTileSetDefinitionDelete == 'function') {
            onTileSetDefinitionDelete(tileSetDefinition.id);
        }
    }

    const deleteTileSetDefinitionOnClick = () => {
        doOnTileSetDefinitionDelete(tileSetDefinition.id);
    };

    return <>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600 mb-2">Tile Set Definition <span className="text-sm">({tileSetDefinition.id})</span></h2>
        <p className="mb-2 text-sm italic">A tile set definition identifies locations in the sprite sheet for a window's corner tiles, repeating edge tiles, and repeating center tiles.</p>

        <div className={`grid grid-cols-4 gap-4`}>
            <div className="mb-4 w-full">
                <label htmlFor="e4486061-7422-490d-be92-533ff31711a1">Name:</label>
                <input placeholder="Tile Set Name" type="text" autoComplete="off" id="e4486061-7422-490d-be92-533ff31711a1" className={TAILWIND_INPUT_CLASS_NAME} value={name} onChange={onNameChange} />
            </div>
            <div className="mb-4 w-full">
                <label htmlFor="170eb33f-6cf9-453e-aad0-eaff6db6bb65">Tile Sheet:</label>
                <select id="170eb33f-6cf9-453e-aad0-eaff6db6bb65" className={TAILWIND_INPUT_CLASS_NAME} onChange={onTileSheetIdChange} value={tileSheetId}>
                    {(tileSheets.findIndex((ts) => ts.id == tileSheetId) < 0) && <option key="none" value=""></option>}
                    {tileSheets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <div className="mb-4 w-full">
                <label htmlFor="443fd77f-4bfc-489d-aad7-10948ef9a77d">Tile Size:</label>
                <input placeholder="Tile Size" type="Number" autoComplete="off" id="443fd77f-4bfc-489d-aad7-10948ef9a77d" className={TAILWIND_INPUT_CLASS_NAME} value={tileSize} onChange={onTileSizeChange} />
            </div>
        </div>

        <h3 className="mb-2 mt-4 text-xl">Window Regions</h3>
        <p className="mb-2 text-sm italic">There are nine window regions: four corners, four edges, and the center. Top and bottom edges will repeat horizontally. Left and right edges will repeat vertically. The center will repeat in both directions.</p>
        <div className={`grid grid-cols-10 gap-4`}>
            <div className="col-span-6 mb-1 w-full">
                <label htmlFor="fca684ea-2f2e-459a-ae5c-99e602f3d57e">Window Region</label>
                <select className={TAILWIND_INPUT_CLASS_NAME} id="fca684ea-2f2e-459a-ae5c-99e602f3d57e" value={windowRegion} onChange={(e) => setWindowRegion(e.target.value)}>
                    <option value={CHOCO_WINDOW_REGIONS.TOP_LEFT}>Top-Left Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.TOP}>Top Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.TOP_RIGHT}>Top-Right Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.LEFT}>Left Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.CENTER}>Center</option>
                    <option value={CHOCO_WINDOW_REGIONS.RIGHT}>Right Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM_LEFT}>Bottom-Left Corner</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM}>Bottom Edge</option>
                    <option value={CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT}>Bottom-Right Corner</option>
                </select>
                {(windowRegion == CHOCO_WINDOW_REGIONS.TOP_LEFT || windowRegion == CHOCO_WINDOW_REGIONS.TOP_RIGHT || windowRegion == CHOCO_WINDOW_REGIONS.BOTTOM_LEFT || windowRegion == CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT) && <p className="mb-2 text-sm italic">Corners can only be 1 tile wide and 1 tile high.</p>}
                {(windowRegion == CHOCO_WINDOW_REGIONS.TOP || windowRegion == CHOCO_WINDOW_REGIONS.BOTTOM) && <p className="mb-2 text-sm italic">Top and bottom edge pattern can be any number of tiles wide.</p>}
                {(windowRegion == CHOCO_WINDOW_REGIONS.LEFT || windowRegion == CHOCO_WINDOW_REGIONS.RIGHT) && <p className="mb-2 text-sm italic">Left and right edge pattern can be any number of tiles wide.</p>}
                {(windowRegion == CHOCO_WINDOW_REGIONS.CENTER) && <p className="mb-2 text-sm italic">The center repeated pattern can be any number of tiles wide or high.</p>}
            </div>
            <div className="col-span-4 row-span-3 mb-1 w-full">
                <h4>Tile Sheet</h4>
                <img className={TAILWIND_INPUT_CLASS_NAME} alt="Window Preview" src={null} ref={imageRef} />
            </div>
            <div className="mb-4 w-full col-span-3">
                <label htmlFor="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961">Width (tiles)</label>
                {(windowRegion == CHOCO_WINDOW_REGIONS.TOP || windowRegion == CHOCO_WINDOW_REGIONS.BOTTOM || windowRegion == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionSizes[windowRegion].width || 1} onChange={windowWidthOnChange} />}
                {(windowRegion != CHOCO_WINDOW_REGIONS.TOP && windowRegion != CHOCO_WINDOW_REGIONS.BOTTOM && windowRegion != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
            </div>
            <div className="mb-4 w-full col-span-3">
                <label htmlFor="7ae42bae-9eeb-4491-be31-00161a3af632">Height (tiles)</label>
                {(windowRegion == CHOCO_WINDOW_REGIONS.LEFT || windowRegion == CHOCO_WINDOW_REGIONS.RIGHT || windowRegion == CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={regionSizes[windowRegion].height || 1} onChange={windowHeightOnChange} />}
                {(windowRegion != CHOCO_WINDOW_REGIONS.LEFT && windowRegion != CHOCO_WINDOW_REGIONS.RIGHT && windowRegion != CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
            </div>
            
            <div className="mb-4 w-full col-span-3">
                <h4>Position Selection</h4>
                <p className="mb-2 text-sm italic">Select on a region position to modify, then find the tile in the tile sheet.</p>
                <div className={`grid grid-cols-${regionSizes[windowRegion].width || 1} grid-rows-${regionSizes[windowRegion].height || 1} gap-4`}>
                    {Array.from({length: regionSizes[windowRegion].width || 1}).map((_, x) => 
                        Array.from({length: regionSizes[windowRegion].height || 1}).map((_, y) =>                   
                            <button className="size mb-4 w-full bg-red-400">{x+1}, {y+1}</button>)
                    )}

                </div>
            </div>
            <div className="mb-4 w-full col-span-3">
                <h4>Tile Selection</h4>
                <p className="mb-2 text-sm italic">Approximately click on the tile in the tile sheet, then pick a precise location below.</p>
                <div className={`grid grid-cols-${regionSizes[windowRegion].width || 1} grid-rows-${regionSizes[windowRegion].height || 1} gap-4`}>

                </div>
            </div>
        </div>

        <h3>Window Preview</h3>
        <p className="mb-2 text-sm italic">This is a preview of what a window with this tile set definition will look like.</p>

        <h3 className="mb-2 mt-4 text-xl">Actions</h3>
        <div className="flex justify-between">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-500">Return to Canvas</button>
            <button onClick={deleteTileSetDefinitionOnClick} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-500">Delete Tile Set</button>
        </div>
    </>
}

export default TileSetDefinitionEditor