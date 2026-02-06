import { useState } from "react";
import { CHOCO_WINDOW_REGIONS } from "../../../ChocoStudio";
import { makeCountingNumber } from "../../../Utilities";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";

export class BasicEdgeRegionSize {
    /** @type {number} */ topSharedRowCount;
    /** @type {number} */ bottomSharedRowCount;

    /** @type {number} */ leftSharedColCount;
    /** @type {number} */ rightSharedColCount;

    /** @type {number} */ topEdgeColCount;
    /** @type {number} */ bottomEdgeColCount;

    /** @type {number} */ leftEdgeRowCount;
    /** @type {number} */ rightEdgeRowCount;

    /** @type {number} */ centerColCount;
    /** @type {number} */ centerRowCount;

    /**
     * @param {BasicEdgeRegionSize} arg1 
     */
    constructor(arg1) {
        this.topSharedRowCount = arg1?.topSharedRowCount ?? 1;
        this.bottomSharedRowCount = arg1?.bottomSharedRowCount ?? 1;

        this.leftSharedColCount = arg1?.leftSharedColCount ?? 1;
        this.rightSharedColCount = arg1?.rightSharedColCount ?? 1;

        this.topEdgeColCount = arg1?.topEdgeColCount ?? 1;
        this.bottomEdgeColCount = arg1?.bottomEdgeColCount ?? 1;

        this.leftEdgeRowCount = arg1?.leftEdgeRowCount ?? 1;
        this.rightEdgeRowCount = arg1?.rightEdgeRowCount ?? 1;

        this.centerColCount = arg1?.centerColCount ?? 1;
        this.centerRowCount = arg1?.centerRowCount ?? 1;
    }
}

/**
 * 
 * @param {object} props
 * @param {string} props.regionIdentifier
 * @param {BasicEdgeRegionSize} props.sizes
 * @param {function(BasicEdgeRegionSize):void} props.onSizeChange
 * @returns 
 */
const BasicEdgeSizeEditor = ({ regionIdentifier, sizes, onSizeChange }) => {
    const [helpVisibile, setHelpVisible] = useState(true);

    /**
     * @param {BasicEdgeSizeEditor} newRegionSizeProps 
     */
    const uponChange = (newRegionSizeProps) => {
        const newSizes = { ...sizes, ...newRegionSizeProps };
        onSizeChange(newSizes);
    }

    const toggleHelp = () => setHelpVisible(!helpVisibile);

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTopChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ topSharedRowCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onLeftChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ leftSharedColCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onRightChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ rightSharedColCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onBottomChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ bottomSharedRowCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onCenterColCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ centerColCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onCenterRowCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        uponChange({ centerRowCount: newValue });
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onEdgeRowCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        if (CHOCO_WINDOW_REGIONS.LEFT === regionIdentifier) {
            uponChange({ leftEdgeRowCount: newValue });
        }
        else if (CHOCO_WINDOW_REGIONS.RIGHT === regionIdentifier) {
            uponChange({ rightEdgeRowCount: newValue });
        }
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onEdgeColCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        if (CHOCO_WINDOW_REGIONS.TOP === regionIdentifier) {
            uponChange({ topEdgeColCount: newValue });
        }
        else if (CHOCO_WINDOW_REGIONS.BOTTOM === regionIdentifier) {
            uponChange({ bottomEdgeColCount: newValue });
        }
    }

    return <>
        {[CHOCO_WINDOW_REGIONS.TOP_LEFT, CHOCO_WINDOW_REGIONS.TOP, CHOCO_WINDOW_REGIONS.TOP_RIGHT].includes(regionIdentifier) && <div className="w-full col-span-2">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Top Height:</label>
            <input placeholder="Tile Count" min={1} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={sizes.topSharedRowCount} onChange={onTopChange} />
        </div>}
        {[CHOCO_WINDOW_REGIONS.TOP_LEFT, CHOCO_WINDOW_REGIONS.LEFT, CHOCO_WINDOW_REGIONS.BOTTOM_LEFT].includes(regionIdentifier) && <div className="w-full col-span-2">
            <label htmlFor="e54afa87-1d68-49a3-aa61-ffdea21b7e32">Left Width:</label>
            <input placeholder="Tile Count" min={1} type="Number" autoComplete="off" id="e54afa87-1d68-49a3-aa61-ffdea21b7e32" className={TAILWIND_INPUT_CLASS_NAME} value={sizes.leftSharedColCount} onChange={onLeftChange} />
        </div>}
        {[CHOCO_WINDOW_REGIONS.TOP_RIGHT, CHOCO_WINDOW_REGIONS.RIGHT, CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].includes(regionIdentifier) && <div className="w-full col-span-2">
            <label htmlFor="935b0b3e-ea51-4927-8530-e86e06029505">Right Width:</label>
            <input placeholder="Tile Count" min={1} type="Number" autoComplete="off" id="935b0b3e-ea51-4927-8530-e86e06029505" className={TAILWIND_INPUT_CLASS_NAME} value={sizes.rightSharedColCount} onChange={onRightChange} />
        </div>}
        {[CHOCO_WINDOW_REGIONS.BOTTOM_LEFT, CHOCO_WINDOW_REGIONS.BOTTOM, CHOCO_WINDOW_REGIONS.BOTTOM_RIGHT].includes(regionIdentifier) && <div className="w-full col-span-2">
            <label htmlFor="5c57b383-e614-4e5a-875d-1594f3717390">Bottom Height:</label>
            <input placeholder="Tile Count" min={1} type="Number" autoComplete="off" id="5c57b383-e614-4e5a-875d-1594f3717390" className={TAILWIND_INPUT_CLASS_NAME} value={sizes.bottomSharedRowCount} onChange={onBottomChange} />
        </div>}

        {CHOCO_WINDOW_REGIONS.CENTER === regionIdentifier && <>
            <div className="w-full col-span-2">
                <label htmlFor="15d7ca4c-0c49-4bd5-836c-b9b70ce26d94">Width (tiles)</label>
                <input
                    id="15d7ca4c-0c49-4bd5-836c-b9b70ce26d94"
                    placeholder="Tile Count"
                    type="Number"
                    autoComplete="off"
                    className={TAILWIND_INPUT_CLASS_NAME}
                    value={sizes.centerColCount}
                    onChange={onCenterColCountChange}
                />
            </div>
            <div className="w-full col-span-2">
                <label htmlFor="3b784ada-eadd-4780-8983-586805fc4b31">Height (tiles)</label>
                <input
                    id="3b784ada-eadd-4780-8983-586805fc4b31"
                    placeholder="Tile Count"
                    type="Number"
                    autoComplete="off"
                    className={TAILWIND_INPUT_CLASS_NAME}
                    value={sizes.centerRowCount}
                    onChange={onCenterRowCountChange}
                />
            </div>
        </>}

        {[CHOCO_WINDOW_REGIONS.LEFT, CHOCO_WINDOW_REGIONS.RIGHT].includes(regionIdentifier) && <>
            <div className="w-full col-span-2">
                <label htmlFor="3f54c408-25bc-43a3-b4c7-127511baf3a5">Pattern Height:</label>
                <input
                    id="3f54c408-25bc-43a3-b4c7-127511baf3a5"
                    placeholder="Tile Count"
                    type="Number"
                    autoComplete="off"
                    className={TAILWIND_INPUT_CLASS_NAME}
                    value={CHOCO_WINDOW_REGIONS.LEFT === regionIdentifier ? sizes.leftEdgeRowCount : CHOCO_WINDOW_REGIONS.RIGHT === regionIdentifier ? sizes.rightEdgeRowCount : 1}
                    onChange={onEdgeRowCountChange}
                />
            </div>
        </>}

        {[CHOCO_WINDOW_REGIONS.TOP, CHOCO_WINDOW_REGIONS.BOTTOM].includes(regionIdentifier) && <>
            <div className="w-full col-span-2">
                <label htmlFor="3f54c408-25bc-43a3-b4c7-127511baf3a5">Pattern Width:</label>
                <input
                    id="3f54c408-25bc-43a3-b4c7-127511baf3a5"
                    placeholder="Tile Count"
                    type="Number"
                    autoComplete="off"
                    className={TAILWIND_INPUT_CLASS_NAME}
                    value={CHOCO_WINDOW_REGIONS.TOP === regionIdentifier ? sizes.topEdgeColCount : CHOCO_WINDOW_REGIONS.BOTTOM === regionIdentifier ? sizes.bottomEdgeColCount : 1}
                    onChange={onEdgeColCountChange}
                />
            </div>
        </>}

        {(!helpVisibile) && <button onClick={toggleHelp} className="w-full col-span-2 text-xs font-normal text-blue-900 dark:text-blue-100 py-1 hover:underline italic">show help</button>}

        {helpVisibile && <p className="col-span-11 mb-2 text-sm mx-6">
            All left regions share a common width. All right regions share a common width. All top regions share a common height. All bottom regions share a common height. Top and bottom edges can be arbitrarily wide. Left and right edges can be arbitrarily tall. The center can be of any size.
            &nbsp;<button href="#" onClick={toggleHelp} className="text-xs text-blue-900 dark:text-blue-100 py-1 hover:underline italic">hide help</button>
        </p>}
    </>
}

export default BasicEdgeSizeEditor;