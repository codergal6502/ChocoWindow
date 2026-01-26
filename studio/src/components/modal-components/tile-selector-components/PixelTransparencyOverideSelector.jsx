import { useEffect, useRef, useState } from 'react';
import { ChocoWinAbstractPixelReader, ChocoWinColor } from '../../../ChocoWindow'
import "./PixelTransparencyOverideSelector.css"

/**
 * @param {object} props
 * @param {ChocoWinAbstractPixelReader} props.reader
 * @param {function({x: number, y: number}[])} props.onSelectionMade
 */
const PixelTransparencyOverideSelector = ({ reader, onSelectionMade }) => {

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                         STATE AND REF HOOKS                          //
    // // // // // // // // // // // // // // // // // // // // // // // // //
    /** @type {ReturnType<typeof useRef<HTMLElement>>} */ const gridDivRef = useRef(null);

    const [readerIsReady, setReaderIsReady] = useState(false);
    const [pixelSize, setPixelSize] = useState(0);
    /** @type {ReturnType<typeof useState<{x: Number, y: Number}[]>} */
    const [transparentPixels, setTransparentPixels] = useState([])
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // detect when the reader is ready
    useEffect(() => {
        reader.isReady().then(() => setReaderIsReady(true))
    }, [reader]);

    // size the pixel grid
    useEffect(() => {
        if (reader && gridDivRef && gridDivRef.current) {
            const smallestSize = .75*Math.min(gridDivRef.current.offsetWidth, gridDivRef.current.offsetHeight);
            const tileSize = Math.max(reader.width, reader.height); // should always be identical
            const pixelSize = Math.floor(smallestSize / tileSize); // round to nearest tile size multiple
            setPixelSize(pixelSize);
        }
    }, [gridDivRef, reader, readerIsReady, lastResizeTimestamp])


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
     * @param {Object} e 
     * @param {HTMLElement} e.target
     */
    const checkboxOnChange = (e) => {
        const coordinates = { x: e.target.dataset.x, y: e.target.dataset.y}
        const label = e.target.parentElement;

        if (true == e.target.checked) {
            label.classList.add("pixel-is-transparent");

            const newTransparentPixels = transparentPixels.slice();
            newTransparentPixels[newTransparentPixels.length] = coordinates;
            newTransparentPixels.sort((c1, c2) => c1.y < c2.y && c1.x < c2.x);
            onSelectionMade(newTransparentPixels.slice());
        }
        else if (false == e.target.checked) {
            label.classList.remove("pixel-is-transparent");

            const newTransparentPixels = transparentPixels.slice();
            const idx = newTransparentPixels.findIndex(c => c.x == coordinates.x && c.y == coordinates.y)
            newTransparentPixels.splice(idx, 1);
            setTransparentPixels(newTransparentPixels);
            onSelectionMade(newTransparentPixels.slice());
        }
        else {
            console.warn("unexpected checkbox state", e.target.checked, JSON.stringify(coordinates));
            label.classList.remove("pixel-is-transparent");
        }
    }

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            UTILITY METHODS                           //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * 
     * @param {ChocoWinColor} color 
     */
    const chocoWinColorToRgba = (color) => {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255.0})`
    }

    return (reader && readerIsReady && <>
        <div className='w-full h-full' ref={gridDivRef} >
            <h4 className="my-3 font-bold">Pixel Transparency Override</h4>
            <div className='transparency-container' style={{ '--tile-size': reader.width }}>
                {
                    Array.from(Array(reader.height), (_, y) =>
                        Array.from(Array(reader.width), (_, x) =>
                            <label className='pixel-transparency-checkbox' key={`transparency-pixel-${x}-${y}`} style={{ width: pixelSize, height: pixelSize, backgroundColor: chocoWinColorToRgba(reader.getPixel({ x, y })) }}>
                                <input className='sr-only' type="checkbox" onChange={checkboxOnChange} data-x={x} data-y={y} />
                            </label>
                        )
                    )
                }
            </div>
        </div>
    </>)
}

export default PixelTransparencyOverideSelector;