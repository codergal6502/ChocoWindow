import { useContext, useEffect, useState } from "react";
import { ChocoStudioTileSetDefinition, ChocoStudioWindowRegionDefinition } from "../../ChocoStudio";
import { ReaderFactoryForStudio, WriterFactoryForStudio } from "../../App";
import { ChocoWinWindow } from "../../ChocoWindow";
import { TAILWIND_INPUT_CLASS_NAME } from "../KitchenSinkConstants";
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * @param {object} props
 * @param {ChocoStudioTileSetDefinition} props.tileSetDefinition
 * @param {object.<string, ChocoStudioWindowRegionDefinition>} props.tileSheets
 */
const WindowPreview = ({ tileSetDefinition, tileSheets }) => {
    const readerFactory = useContext(ReaderFactoryForStudio);
    const writerFactory = useContext(WriterFactoryForStudio);

    const [tileScale, setTileScale] = useState(3);
    const [width, setWidth] = useState(tileSetDefinition.tileSize * 3 * 10);
    const [height, setHeight] = useState(tileSetDefinition.tileSize * 3 * 4);
    const [previewImageUrl, setPreviewImageUrl] = useState("");

    /**
     * @param {ChocoStudioTileSetDefinition} newTileSetDefinition 
     */
    const updatePreviewImageBlob = () => {
        if (tileScale < 1) { return; }
        const tileSheet = tileSheets.find((ts) => ts.id == tileSetDefinition.tileSheetId);
        if (!tileSheet) return;
        const tileSet = tileSetDefinition.toChocoWinTileSet(tileSheet.imageDataUrl);

        let chocoWin = new ChocoWinWindow({
            x: 0,
            y: 0,
            w: width,
            h: height,
            tileScale: tileScale,
            winTileSet: tileSet,
            readerFactory: readerFactory
        });

        chocoWin.isReady().then(() => {
            const writer = writerFactory.build(width, height);
            chocoWin.drawTo(writer);

            let blob = writer.makeBlob();
            URL.revokeObjectURL(previewImageUrl);

            const newUrl = URL.createObjectURL(blob);
            setPreviewImageUrl(newUrl);
        });
    }

    const onWidthDecrement = () => {
        if (width > 0) {
            setWidth((Math.round(width / tileSetDefinition.tileSize / tileScale) - 1) * tileSetDefinition.tileSize * tileScale)
        }
    }

    const onWidthIncrement = () => {
        setWidth((Math.round(width / tileSetDefinition.tileSize / tileScale) + 1) * tileSetDefinition.tileSize * tileScale)
    }

    const onHeightDecrement = () => {
        if (height > 0) {
            setHeight((Math.round(height / tileSetDefinition.tileSize / tileScale) - 1) * tileSetDefinition.tileSize * tileScale)
        }
    }

    const onHeightIncrement = () => {
        setHeight((Math.round(height / tileSetDefinition.tileSize / tileScale) + 1) * tileSetDefinition.tileSize * tileScale)
    }

    useEffect(() => {
        if (tileSetDefinition) {
            updatePreviewImageBlob();
        }
    }, [tileSetDefinition, tileScale, width, height])

    return (<>
        <h3 className="mb-2 mt-4 text-xl">Window Preview</h3>

        <div className={`grid grid-cols-3 gap-4 mb-2 mx-6 text-sm`}>
            <div>
                <label htmlFor="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1">Tile Scale:</label>
                <input min={1} placeholder="Tile Scale" type="Number" autoComplete="off" id="a33f0024-8c0d-4ab8-9ac2-0c72ce5f2eb1" className={`${TAILWIND_INPUT_CLASS_NAME} w-20 inline`} value={tileScale} onChange={(e) => setTileScale(Number(e.target.value))} />
            </div>
            <div>
                <label htmlFor="aff69a2f-79d7-4f0f-b0a5-826e015fe72c">Width:</label>
                <input min={1} placeholder="Width" type="Number" autoComplete="off" id="aff69a2f-79d7-4f0f-b0a5-826e015fe72c" className={`${TAILWIND_INPUT_CLASS_NAME} w-20 inline`} value={width} onChange={(e) => setWidth(Number(e.target.value))} />
                <button onClick={onWidthDecrement}>
                    <FontAwesomeIcon icon={faCircleMinus} className="text-3xl" />
                    <span className="sr-only">Decrease Size</span>
                </button>
                <button onClick={onWidthIncrement}>
                    <FontAwesomeIcon icon={faCirclePlus} flip="horizontal" className="text-3xl" />
                    <span className="sr-only">Increase Size</span>
                </button>
            </div>
            <div>
                <label htmlFor="d171ff12-7a26-469d-bacd-cb339b01140b">Height:</label>
                <input min={1} placeholder="Height" type="Number" autoComplete="off" id="d171ff12-7a26-469d-bacd-cb339b01140b" className={`${TAILWIND_INPUT_CLASS_NAME} w-20 inline`} value={height} onChange={(e) => setHeight(Number(e.target.value))} />
                <button onClick={onHeightDecrement}>
                    <FontAwesomeIcon icon={faCircleMinus} className="text-3xl" />
                    <span className="sr-only">Decrease Size</span>
                </button>
                <button onClick={onHeightIncrement}>
                    <FontAwesomeIcon icon={faCirclePlus} flip="horizontal" className="text-3xl" />
                    <span className="sr-only">Increase Size</span>
                </button>
            </div>
        </div>

        <p className="mb-2 text-sm mx-6">This is a preview of what a window with this tile set definition will look like.</p>

        <div className='mx-6' id="tileSetPreviewDiv" ><img alt="Window Preview" src={previewImageUrl} /></div>
    </>)
}

export default WindowPreview;