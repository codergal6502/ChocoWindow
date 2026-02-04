import { useEffect, useRef, useState } from 'react';
import { ChocoColor, ChocoCoordinates } from '../../../ChocoWindow'
import "./PixelTransparencyOverideSelector.css"
import { AssignableTileInfo } from '../TileSetDefinitionEditor';
import { isNumber, makeNaturalNumber } from '../../../Utilities';

class BooleanMatrix {
    /** @type {Boolean[]} */ #internalArray;
    /** @type {Number} */ #tileSize;

    /**
     * @param {number} tileSize 
     */
    /**
     * @param {BooleanMatrix} matrix 
     */
    constructor(arg1) {
        if (arg1 instanceof BooleanMatrix) {
            this.#internalArray = arg1.#internalArray.slice();
            this.#tileSize = arg1.#tileSize;
        }
        else if (isNumber(arg1)) {
            const /** @type {Number} */ tileSize = arg1;
            this.#tileSize = tileSize;
            this.#internalArray = new Array(tileSize * tileSize);
        }
    }

    #xyToIndex(x, y) {
        return y * this.#tileSize + x;
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} value 
     */
    set(x, y, value) {
        if (isNumber(x) && isNumber(y)) {
            x = makeNaturalNumber(x);
            y = makeNaturalNumber(y);
            if (0 <= x && x < this.#tileSize && 0 <= y && y < this.#tileSize) {
                const idx = this.#xyToIndex(x, y);
                this.#internalArray[idx] = (value == true);
            }
        }
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     */
    get(x, y) {
        if (0 <= x && x < this.#tileSize && 0 <= y && y < this.#tileSize) {
            const idx = this.#xyToIndex(x, y);
            return this.#internalArray[idx] ?? false;
        }
        else {
            return null;
        }
    }
}

/**
 * @param {object} props
 * @param {AssignableTileInfo} props.assignableTileInfo
 * @param {function({x: number, y: number}[])} props.onSelectionMade
 */
const PixelTransparencyOverideSelector = ({ assignableTileInfo, onSelectionMade }) => {
    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                         STATE AND REF HOOKS                          //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    /** @type {ReturnType<typeof useRef<HTMLElement>>} */ const gridDivRef = useRef(null);

    const [readerIsReady, setReaderIsReady] = useState(false);
    const [pixelSize, setPixelSize] = useState(0);
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());
    const [paintbucketMode, setPaintbucketMode] = useState(false);

    /** @type {ReturnType<typeof useState<number>>} */
    const [lastCheckboxChangeTimeout, setLastCheckboxChangeTimeout] = useState(null);

    /** @type {ReturnType<typeof useState<BooleanMatrix>>} */
    const [checkedLocations, setCheckedLocations] = useState();

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // detect when the reader is ready
    useEffect(() => {
        if (assignableTileInfo?.transformedReader) {
            setReaderIsReady(false);
            assignableTileInfo.transformedReader.isReady().then((r) => {
                if (r.width != r.height) {
                    return;
                }
                setReaderIsReady(true);
                const booleanMatrix = new BooleanMatrix(r.width);
                for (const t of assignableTileInfo.transparencyOverrides) {
                    booleanMatrix.set(t.x, t.y, true);
                }
                setCheckedLocations(booleanMatrix);
            });
        }
    }, [assignableTileInfo]);

    // size the pixel grid
    useEffect(() => {
        if (assignableTileInfo?.transformedReader && gridDivRef && gridDivRef.current && assignableTileInfo?.transformedReader) {
            const reader = assignableTileInfo.transformedReader;
            const smallestSize = .75 * Math.min(gridDivRef.current.offsetWidth, gridDivRef.current.offsetHeight);
            const tileSize = Math.max(reader.width, reader.height); // should always be identical
            const pixelSize = Math.floor(smallestSize / tileSize); // round to nearest tile size multiple
            setPixelSize(pixelSize);
        }
    }, [gridDivRef, assignableTileInfo, readerIsReady, lastResizeTimestamp])


    // resize event handler to force a pixel grid resize
    useEffect(() => {
        // See https://www.geeksforgeeks.org/reactjs/react-onresize-event/
        // See https://react.dev/reference/react/useEffect#parameters

        const onResize = () => {
            setLastResizeTimestamp(Date.now());
        }

        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, [])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {BooleanMatrix} newCheckedLocations
     */
    const debouncePixelCheckboxToggle = (newCheckedLocations) => {
        // Why not use lodash's _.debounce?
        // See https://www.developerway.com/posts/debouncing-in-react
        // See https://stackoverflow.com/questions/36294134/lodash-debounce-with-react-input#comment124623824_67941248
        // See https://stackoverflow.com/a/59184678
        // Yes, strictly speaking, the approach where the local non-debounced version exists violates
        // the single-source-of-truth principle, but the data is always synced in this use case since
        // it is only ever edited here.
        clearTimeout(lastCheckboxChangeTimeout);
        const timeout = setTimeout(() => {
            const pixels = [];
            for (let x = 0; x < assignableTileInfo.transformedReader.width; x++) {
                for (let y = 0; y < assignableTileInfo.transformedReader.height; y++) {
                    if (newCheckedLocations.get(x, y)) {
                        pixels.push(new ChocoCoordinates({ x, y }));
                    }
                }
            }
            onSelectionMade(pixels);
        }, 125);
        setLastCheckboxChangeTimeout(timeout);
    };

    /**
     * @param {Object} e 
     * @param {HTMLElement} e.target
     */
    const checkboxOnChange = (e) => {
        const isChecked = e.target.checked;
        const coordinates = { x: Number(e.target.dataset.x), y: Number(e.target.dataset.y) }
        const newCheckedLocations = new BooleanMatrix(checkedLocations);

        if (paintbucketMode && assignableTileInfo?.transformedReader) {
            const reader = assignableTileInfo?.transformedReader;
            const clickedColor = reader.getPixel(coordinates);

            const visitedPixels = Array.from(Array(reader.height), () => new Array(reader.height));
            const doVisitPixel = (x, y) => {
                if (x < 0 || y < 0 || x >= reader.width || y >= reader.height) return;
                if (visitedPixels[x][y]) return;
                visitedPixels[x][y] = true;

                const candidateColor = reader.getPixel({ x: x, y: y });
                if (clickedColor.r == candidateColor.r && clickedColor.g == candidateColor.g && clickedColor.b == candidateColor.b && clickedColor.a == candidateColor.a) {
                    newCheckedLocations.set(x, y, isChecked);
                    doVisitPixel(x - 1, y);
                    doVisitPixel(x + 1, y);
                    doVisitPixel(x, y - 1);
                    doVisitPixel(x, y + 1);
                }
            }
            doVisitPixel(coordinates.x, coordinates.y);
        }
        else {
            newCheckedLocations.set(coordinates.x, coordinates.y, isChecked);
        }

        setCheckedLocations(newCheckedLocations);
        debouncePixelCheckboxToggle(newCheckedLocations);
    }

    return (assignableTileInfo?.transformedReader && readerIsReady && <>
        <div className='w-full h-full' ref={gridDivRef} >
            <h4 className="my-3 font-bold">Pixel Transparency Override</h4>
            <div className='transparency-container' style={{ '--tile-size': assignableTileInfo.transformedReader.width }}>
                {
                    Array.from(Array(assignableTileInfo.transformedReader.height), (_, y) =>
                        Array.from(Array(assignableTileInfo.transformedReader.width), (_, x) =>
                            <label className={`pixel-transparency-checkbox ${checkedLocations.get(x, y) ? "pixel-is-transparent" : ""}`} key={`transparency-pixel-${x}-${y}`} style={{ width: pixelSize, height: pixelSize, backgroundColor: assignableTileInfo.transformedReader.getPixel({ x, y }).toRgba() }}>
                                <input className='sr-only' type="checkbox" checked={checkedLocations.get(x, y)} onChange={checkboxOnChange} data-x={x} data-y={y} />
                            </label>
                        )
                    )
                }
            </div>
            <label><input checked={paintbucketMode} type="checkbox" onChange={() => setPaintbucketMode(!paintbucketMode)} /> Paintbucket Mode</label>
        </div>
    </>)
}

export default PixelTransparencyOverideSelector;