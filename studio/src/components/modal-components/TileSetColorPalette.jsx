import { useContext, useEffect, useState } from "react";
import { ChocoStudioComputedColorPalette, ChocoStudioTileSetDefinition, ChocoStudioWindowRegionDefinition } from "../../ChocoStudio";
import { ReaderFactoryForStudio, TileSheetBlobUrlDictionary } from "../../App";
import { ChocoColor, ChocoWinAbstractPixelReader } from "../../ChocoWindow";
import { isNumber } from "../../Utilities";

/**
 * @param {object} props
 * @param {ChocoWinAbstractPixelReader} props.tileSheetReader
 * @param {object.<string, ChocoStudioWindowRegionDefinition>} props.regions
 * @param {number} props.tileSize
 * @param {Boolean} props.allowModifications
 */
const TileSetColorPalette = ({ tileSheetReader, regions, tileSize, allowModifications = false }) => {
    /** @type {ReturnType<typeof useState<ChocoColor[]>>} */
    const [paletteColors, setPaletteColors] = useState([]);

    useEffect(() => {
        new ChocoStudioComputedColorPalette({
            tileSheetReader: tileSheetReader,
            regions: regions,
            tileSize: tileSize,
        }).isReady().then(newColorPalette => {
            setPaletteColors(newColorPalette)
        })
    }, [regions, tileSize]);

    return (<>
        <h3 className="mb-2 mt-4 text-xl">Color Palette</h3>
        <h4 className="mb-1 mt-2 font-bold">Default Colors</h4>
        <div className={`grid grid-cols-4 gap-4`}>
            {paletteColors.map((color, i) =>
                <div key={i}>
                    <div className="text-sm w-full text-center">Color {i + 1}: <span className="text-sm italic font-mono">{color.toHexString({ includeAlpha: true })}</span></div>
                    <div>
                        <input
                            style={{ "--my-opacity": isNumber(color.a) ? color.a / 255.0 : 1 }}
                            className={`w-full rounded opacity-[var(--my-opacity)]`}
                            type="color"
                            value={color.toHexString({ includeAlpha: false })}
                            readOnly={!allowModifications}
                        />
                    </div>
                </div>
            )}
        </div>
    </>)
}

export default TileSetColorPalette;