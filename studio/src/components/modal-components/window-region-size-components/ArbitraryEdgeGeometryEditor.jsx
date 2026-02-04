import { useEffect, useState } from "react";
import { CHOCO_WINDOW_REGIONS, ChocoStudioWindowRegionDefinition } from "../../../ChocoStudio";
import { isNumber, makeCountingNumber, makeNaturalNumber } from "../../../Utilities";
import { TAILWIND_INPUT_CLASS_NAME } from "../../KitchenSinkConstants";
import { ChocoSideTuple } from "../../../ChocoWindow";

const CWR = CHOCO_WINDOW_REGIONS;

/**
 * @param {object} props
 * @param {String} props.regionIdentifer}
 * @param {ChocoStudioWindowRegionDefinition} props.regionDefinition}
 * @param {function(ChocoStudioWindowRegionDefinition):void} props.onGeometryChange
 */
const ArbitraryEdgeGeometryEditor = ({ regionIdentifier, regionDefinition, onGeometryChange }) => {
    const [colCount, setColCount] = useState(regionDefinition.colCount);
    const [rowCount, setRowCount] = useState(regionDefinition.rowCount);

    // for each of these, the margin each side's own side is 0, along the opposite side is null, and defaults to 1 otherwise.
    const [leftBuffer, setLeftBuffer] = useState([CWR.TOP_LEFT, CWR.LEFT, CWR.BOTTOM_LEFT].includes(regionIdentifier) ? 0 : [CWR.TOP_RIGHT, CWR.RIGHT, CWR.BOTTOM_RIGHT].includes(regionIdentifier) ? 0 : regionDefinition.margin?.left ?? 0);
    const [rightBuffer, setRightBuffer] = useState([CWR.TOP_RIGHT, CWR.RIGHT, CWR.BOTTOM_RIGHT].includes(regionIdentifier) ? 0 : [CWR.TOP_LEFT, CWR.LEFT, CWR.BOTTOM_LEFT].includes(regionIdentifier) ? 0 : regionDefinition.margin?.right ?? 0);
    const [topBuffer, setTopBuffer] = useState([CWR.TOP_LEFT, CWR.TOP, CWR.TOP_RIGHT].includes(regionIdentifier) ? 0 : [CWR.TOP_LEFT, CWR.TOP, CWR.TOP_RIGHT, CWR.CENTER].includes(regionIdentifier) ? 0 : regionDefinition.margin?.top ?? 0);
    const [bottomBuffer, setBottomBuffer] = useState([CWR.BOTTOM_LEFT, CWR.BOTTOM, CWR.BOTTOM_RIGHT].includes(regionIdentifier) ? 0 : [CWR.BOTTOM_LEFT, CWR.BOTTOM, CWR.BOTTOM_RIGHT, CWR.CENTER].includes(regionIdentifier) ? 0 : regionDefinition.margin?.bottom ?? 0);
    /** @type {ReturnType<typeof useState<number>>} */
    const [lastManualLocationEntry, setLastManualLocationEntry] = useState(null);
    const [helpVisibile, setHelpVisible] = useState(true);

    useEffect(() => { setColCount(makeCountingNumber(regionDefinition.colCount)); }, [regionDefinition.colCount])
    useEffect(() => { setRowCount(makeCountingNumber(regionDefinition.rowCount)); }, [regionDefinition.rowCount])
    useEffect(() => { setLeftBuffer(regionDefinition.margin?.left ?? 0); }, [regionDefinition.margin?.left])
    useEffect(() => { setRightBuffer(regionDefinition.margin?.right ?? 0); }, [regionDefinition.margin?.right])
    useEffect(() => { setTopBuffer(regionDefinition.margin?.top ?? 0); }, [regionDefinition.margin?.top])
    useEffect(() => { setBottomBuffer(regionDefinition.margin?.bottom ?? 0); }, [regionDefinition.margin?.bottom])

    const toggleHelp = () => setHelpVisible(!helpVisibile);

    /**
     * @param {ChocoCoordinates} newRegionDefinition 
     */
    const debounceNumberInputs = (newRegionDefinition) => {
        // Why not use lodash's _.debounce?
        // See https://www.developerway.com/posts/debouncing-in-react
        // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
        // See https://stackoverflow.com/a/59184678
        // Yes, strictly speaking, the approach where the local non-debounced version exists violates
        // the single-source-of-truth principle, but the data is always synced in this use case since
        // it is only ever edited here.
        clearTimeout(lastManualLocationEntry);
        const timeout = setTimeout(() => {
            onGeometryChange(newRegionDefinition);
        }, 125);
        setLastManualLocationEntry(timeout);
    };

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onColumnCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        newRegionDefinition.colCount = newValue;
        setColCount(newValue);
        debounceNumberInputs(newRegionDefinition);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onRowCountChange = (inputEvent) => {
        const newValue = makeCountingNumber(inputEvent.target.value);
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        newRegionDefinition.rowCount = newValue;
        setRowCount(newValue);
        debounceNumberInputs(newRegionDefinition);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onLeftBufferChange = (inputEvent) => {
        const newValue = isNumber(inputEvent.target.value) ? makeNaturalNumber(inputEvent.target.value) : null;
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        if (!newRegionDefinition.margin) { newRegionDefinition.margin = new ChocoSideTuple(); }
        newRegionDefinition.margin.left = newValue;
        setLeftBuffer(newValue);
        debounceNumberInputs(newRegionDefinition);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onRightBufferChange = (inputEvent) => {
        const newValue = isNumber(inputEvent.target.value) ? makeNaturalNumber(inputEvent.target.value) : null;
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        if (!newRegionDefinition.margin) { newRegionDefinition.margin = new ChocoSideTuple(); }
        newRegionDefinition.margin.right = newValue ?? 0;
        setRightBuffer(newValue ?? "");
        debounceNumberInputs(newRegionDefinition);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onTopBufferChange = (inputEvent) => {
        const newValue = isNumber(inputEvent.target.value) ? makeNaturalNumber(inputEvent.target.value) : null;
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        if (!newRegionDefinition.margin) { newRegionDefinition.margin = new ChocoSideTuple(); }
        newRegionDefinition.margin.top = newValue;
        setTopBuffer(newValue);
        debounceNumberInputs(newRegionDefinition);
    }

    /**
     * @param {object} inputEvent
     * @param {HTMLInputElement} inputEvent.target
     */
    const onBottomBufferChange = (inputEvent) => {
        const newValue = isNumber(inputEvent.target.value) ? makeNaturalNumber(inputEvent.target.value) : null;
        const newRegionDefinition = new ChocoStudioWindowRegionDefinition(regionDefinition);
        if (!newRegionDefinition.margin) { newRegionDefinition.margin = new ChocoSideTuple(); }
        newRegionDefinition.margin.bottom = newValue;
        setBottomBuffer(newValue);
        debounceNumberInputs(newRegionDefinition);
    }

    return (<>
        <div className="w-full col-span-2">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Column Count:</label>
            <input placeholder="Pixel Count" min={1} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={colCount} onChange={onColumnCountChange} />
        </div>
        <div className="w-full col-span-2">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Row Count:</label>
            <input placeholder="Pixel Count" min={1} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={rowCount} onChange={onRowCountChange} />
        </div>
        <div className="mb-4 w-full row-start-2 col-span-3">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Left Buffer (px):</label>
            {[CWR.TOP, CWR.CENTER, CWR.BOTTOM].includes(regionIdentifier) ?
                <input placeholder="Pixel Count" min={0} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={leftBuffer} onChange={onLeftBufferChange} /> :
                <div id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className="w-full block rounded-lg border py-[9px] px-3 text-sm h-9">
                    {[CWR.TOP_LEFT, CWR.LEFT, CWR.BOTTOM_LEFT].includes(regionIdentifier) ? 0 : 'max'}
                </div>
            }
        </div>
        <div className="mb-4 w-full row-start-2 col-span-3">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Right Buffer (px):</label>
            {[CWR.TOP, CWR.CENTER, CWR.BOTTOM].includes(regionIdentifier) ?
                <input placeholder="Pixel Count" min={0} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={rightBuffer} onChange={onRightBufferChange} /> :
                <div id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className="w-full block rounded-lg border py-[9px] px-3 text-sm h-9">
                    {[CWR.TOP_RIGHT, CWR.RIGHT, CWR.BOTTOM_RIGHT].includes(regionIdentifier) ? 0 : 'max'}
                </div>
            }
        </div>
        <div className="mb-4 w-full row-start-2 col-span-3">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Top Buffer (px):</label>
            {[CWR.LEFT, CWR.CENTER, CWR.RIGHT].includes(regionIdentifier) ?
                <input placeholder="Pixel Count" min={0} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={topBuffer} onChange={onTopBufferChange} /> :
                <div id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className="w-full block rounded-lg border py-[9px] px-3 text-sm h-9">
                    {[CWR.TOP_LEFT, CWR.TOP, CWR.TOP_RIGHT].includes(regionIdentifier) ? 0 : 'max'}
                </div>
            }
        </div>
        <div className="mb-4 w-full row-start-2 col-span-3">
            <label htmlFor="27d7b590-cafb-40cf-8bcc-336b94c36aa3">Bottom Buffer (px):</label>
            {[CWR.LEFT, CWR.CENTER, CWR.RIGHT].includes(regionIdentifier) ?
                <input placeholder="Pixel Count" min={0} type="Number" autoComplete="off" id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className={TAILWIND_INPUT_CLASS_NAME} value={bottomBuffer} onChange={onBottomBufferChange} /> :
                <div id="27d7b590-cafb-40cf-8bcc-336b94c36aa3" className="w-full block rounded-lg border py-[9px] px-3 text-sm h-9">
                    {[CWR.BOTTOM_LEFT, CWR.BOTTOM, CWR.BOTTOM_RIGHT].includes(regionIdentifier) ? 0 : 'max'}
                </div>
            }
        </div>
    </>)
}

export default ArbitraryEdgeGeometryEditor;