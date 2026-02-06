import { useEffect, useState } from "react";
import { CHOCO_WINDOW_REGIONS } from "../../../ChocoStudio";
import { JsonClone, makeCountingNumber } from "../../../Utilities";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";

export class SingleTileEdgeSize {
    /** @type {{ [key: string]: {colCount: number, rowCount: number}}} */ regions;

    /**
     * @param {SingleTileEdgeSize} arg1 
     */
    constructor(arg1) {
        if (arg1?.regions) {
            this.regions = Object.fromEntries(
                Object.keys(arg1.regions).map(key => [
                    key,
                    { colCount: arg1.regions[key].colCount, rowCount: arg1.regions[key].rowCount }
                ])
            )
        }
    }
}

/**
 * @param {object} props
 * @param {String} props.regionIdentifier
 * @param {SingleTileEdgeSize} props.singleTileEdgeSizes
 * @param {function(SingleTileEdgeSize):void} props.onSizeChange
 */
const SingleTileEdgeSizeEditor = ({ regionIdentifier, singleTileEdgeSizes, onSizeChange }) => {
    /** @type {ReturnType<typeof useState<number>>} */
    const [lastManualLocationEntry, setLastManualLocationEntry] = useState(null);

    
    const [colCount, setColCount] = useState(1);
    const [rowCount, setRowCount] = useState(1);

    useEffect(() => {
        setColCount(singleTileEdgeSizes?.regions?.[regionIdentifier]?.colCount);
        setRowCount(singleTileEdgeSizes?.regions?.[regionIdentifier]?.rowCount);
    }, [regionIdentifier, singleTileEdgeSizes?.regions])

    /**
     * @param {SingleTileEdgeSize} newSize 
     */
    const debounceRegionSizeNumberInputs = (newSize) => {
        // Why not use lodash's _.debounce?
        // See https://www.developerway.com/posts/debouncing-in-react
        // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
        // See https://stackoverflow.com/a/59184678
        clearTimeout(lastManualLocationEntry);
        const timeout = setTimeout(() => {
            onSizeChange(newSize);
        }, 125);
        setLastManualLocationEntry(timeout);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onRegionColCountChange = (inputEvent) => {
        const newColCount = makeCountingNumber(inputEvent.target.value);
        const newSizes = JsonClone(singleTileEdgeSizes);
        newSizes.regions[regionIdentifier].colCount = newColCount
        setColCount(newColCount);
        debounceRegionSizeNumberInputs(newSizes);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onRegionRowCountChange = (inputEvent) => {
        const newRowCount = makeCountingNumber(inputEvent.target.value);
        const newSizes = JsonClone(singleTileEdgeSizes);
        newSizes.regions[regionIdentifier].rowCount = newRowCount
        setRowCount(newRowCount);
        debounceRegionSizeNumberInputs(newSizes);
    }

    return <>
        <div className="w-full col-span-2">
            <label htmlFor="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961">Width (tiles)</label>
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.TOP || regionIdentifier === CHOCO_WINDOW_REGIONS.BOTTOM || regionIdentifier === CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={colCount} onChange={onRegionColCountChange} />}
            {(regionIdentifier !== CHOCO_WINDOW_REGIONS.TOP && regionIdentifier !== CHOCO_WINDOW_REGIONS.BOTTOM && regionIdentifier !== CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
        </div>
        <div className="w-full col-span-2">
            <label htmlFor="7ae42bae-9eeb-4491-be31-00161a3af632">Height (tiles)</label>
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.LEFT || regionIdentifier === CHOCO_WINDOW_REGIONS.RIGHT || regionIdentifier === CHOCO_WINDOW_REGIONS.CENTER) && <input placeholder="Tile Size" type="Number" autoComplete="off" id="4f4a4b0c-5b7b-4ef1-8355-c10c9c76c961" className={TAILWIND_INPUT_CLASS_NAME} value={rowCount} onChange={onRegionRowCountChange} />}
            {(regionIdentifier !== CHOCO_WINDOW_REGIONS.LEFT && regionIdentifier !== CHOCO_WINDOW_REGIONS.RIGHT && regionIdentifier !== CHOCO_WINDOW_REGIONS.CENTER) && <div className="w-full block rounded-lg border py-[9px] px-3 text-sm">1</div>}
        </div>
        <div className="col-span-10 -mt-4">
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.TOP_LEFT || regionIdentifier === CHOCO_WINDOW_REGIONS.TOP_RIGHT || regionIdentifier === CHOCO_WINDOW_REGIONS.BOTTOM_LEFT || regionIdentifier === CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT) && <p className="mb-2 text-sm italic">Corners can only be 1 tile wide and 1 tile high.</p>}
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.TOP || regionIdentifier === CHOCO_WINDOW_REGIONS.BOTTOM) && <p className="mb-2 text-sm italic">Top and bottom edge pattern can be any number of tiles wide.</p>}
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.LEFT || regionIdentifier === CHOCO_WINDOW_REGIONS.RIGHT) && <p className="mb-2 text-sm italic">Left and right edge pattern can be any number of tiles wide.</p>}
            {(regionIdentifier === CHOCO_WINDOW_REGIONS.CENTER) && <p className="mb-2 text-sm italic">The center repeated pattern can be any number of tiles wide or high.</p>}
        </div>
    </>
}

export default SingleTileEdgeSizeEditor;