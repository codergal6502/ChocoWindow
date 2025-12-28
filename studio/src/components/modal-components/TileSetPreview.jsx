import { useEffect, useState } from "react";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants"
import { ChocoWin, ChocoWinColor } from "../../ChocoWindow";

const TileSetPreview = ({ /** @type { ChocoWinTileSet } */ tileSet }) => {
    const [substituteColors, settileSetPreviewThing] = useState([]);
    const [substituteColorsDelayed, setSubstituteColorsDelayed] = useState([]);
    const [previewSrc, setPreviewSrc] = useState(null);

    const [name, setName] = useState(tileSet.name);

    let subColsTimedTimeout = null;

    useEffect(() => {
        if (substituteColorsDelayed && substituteColorsDelayed.length) {
            if (subColsTimedTimeout) {
                clearTimeout(subColsTimedTimeout);
            }

            setTimeout(() => { settileSetPreviewThing(substituteColorsDelayed); }, 50)
        }

    }, [substituteColorsDelayed])

    useEffect(() => {
        if (tileSet) {
            let chocoWin = new ChocoWin(tileSet, 3, 0, 0, 450, 180);

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

                setPreviewSrc(dataUrl);
            });
        }
    }, [tileSet, substituteColors])

    const subColorOnChange = ((e, colorIndex) => {
        let newSubCols = substituteColors.slice();
        newSubCols[colorIndex] = ChocoWinColor.fromHexString(e.target.value);
        setSubstituteColorsDelayed(newSubCols);
    })

    return <>
        <h2 className="bg-white text-2xl font-bold sticky top-0 dark:bg-gray-600 mb-2">Tile Set Settings</h2>
        <div className="mb-4 w-full">
            <label htmlFor="e4486061-7422-490d-be92-533ff31711a1">Name: </label>
            <input placeholder="Tile Set Name" type="text" id="e4486061-7422-490d-be92-533ff31711a1" className={TAILWIND_INPUT_CLASS_NAME} value={tileSet.name} />
        </div>

        <div className="mb-4 w-full">
            <label htmlFor="29752862-9fd3-49f7-8945-da2c76b31356">ID (Read Only)</label>
            <input placeholder="Tile Set ID" readOnly={true} type="text" id="29752862-9fd3-49f7-8945-da2c76b31356" className={TAILWIND_INPUT_CLASS_NAME} value={tileSet.id} />
        </div>

        <h3>Preview</h3>
        <div id="tileSetPreviewDiv" ><img alt="Window Preview" src={previewSrc} /></div>

        <h3>Substitutable Colors</h3>
        {tileSet.substitutableColors && tileSet.substitutableColors.map((color, index) =>
            <div className="mb-4 w-full" key={index}>
                <label htmlFor={`color-sub-${index}`}>Color {index}: </label>
                <input type="color" id={`color-sub-${index}`} value={`${color.toHexString()}`} onChange={(e) => subColorOnChange(e, index)} />
            </div>
        )}
    </>
}

export default TileSetPreview