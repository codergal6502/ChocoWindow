import { useEffect, useRef, useState } from 'react';
import { ChocoWinAbstractPixelReader, ChocoWinColor, ChocoWinCoordinates } from '../../../ChocoWindow'
import "./PixelTransparencyOverideSelector.css"
import { AssignableTileInfo } from '../TileSetDefinitionEditor';

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
    /** @type {ReturnType<typeof useState<{x: Number, y: Number}[]>} */
    const [transparentPixels, setTransparentPixels] = useState(assignableTileInfo.transparencyOverrides.map(c => new ChocoWinCoordinates(c)));
    const [lastResizeTimestamp, setLastResizeTimestamp] = useState(Date.now());
    const [doNotInvokeCallback, setDoNotInvokeCallback] = useState(false);
    const [clickTimeout, setClickTimeout] = useState(null);

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                             EFFECT HOOKS                             //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    // detect when the reader is ready
    useEffect(() => {
        if (assignableTileInfo?.transformedReader) {
            assignableTileInfo.transformedReader.isReady().then(() => setReaderIsReady(true));
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

    // when a selection is made, call the parent component's callback
    useEffect(() => {
        if (!doNotInvokeCallback) {
            if (clickTimeout) {
                clearTimeout(clickTimeout)
            };

            setClickTimeout(
                setTimeout(() => {
                    onSelectionMade(transparentPixels)
                }, 250)
            )
        }
        setDoNotInvokeCallback(false);
    }, [transparentPixels]);

    // update the selected and display locations when a new assignable tile info comes in
    useEffect(() => {
        setDoNotInvokeCallback(true);
        setTransparentPixels(assignableTileInfo.transparencyOverrides.map(c => new ChocoWinCoordinates(c)));
    }, [assignableTileInfo])

    // // // // // // // // // // // // // // // // // // // // // // // // //
    //                            EVENT HANDLERS                            //
    // // // // // // // // // // // // // // // // // // // // // // // // //

    /**
     * @param {Object} e 
     * @param {HTMLElement} e.target
     */
    const checkboxOnChange = (e) => {
        const coordinates = { x: e.target.dataset.x, y: e.target.dataset.y }

        const newTransparentPixels = transparentPixels.map(c => new ChocoWinCoordinates(c));
        if (true == e.target.checked) {
            newTransparentPixels[newTransparentPixels.length] = coordinates;
        }
        else if (false == e.target.checked) {
            const idx = newTransparentPixels.findIndex(c => c.x == coordinates.x && c.y == coordinates.y)
            newTransparentPixels.splice(idx, 1);
        }

        const maxY = 1 + Math.max(...newTransparentPixels.map(c => c.y));
        newTransparentPixels.sort((c1, c2) => c1.x * maxY + c1.y - c2.x * maxY - c2.y);
        setTransparentPixels(newTransparentPixels);
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

    return (assignableTileInfo?.transformedReader && readerIsReady && <>
        <div className='w-full h-full' ref={gridDivRef} >
            <h4 className="my-3 font-bold">Pixel Transparency Override</h4>
            <div className='transparency-container' style={{ '--tile-size': assignableTileInfo.transformedReader.width }}>
                {
                    Array.from(Array(assignableTileInfo.transformedReader.height), (_, y) =>
                        Array.from(Array(assignableTileInfo.transformedReader.width), (_, x) =>
                            <label className={`pixel-transparency-checkbox ${transparentPixels.find(c => c.x == x && c.y == y) ? "pixel-is-transparent" : ""}`} key={`transparency-pixel-${x}-${y}`} style={{ width: pixelSize, height: pixelSize, backgroundColor: chocoWinColorToRgba(assignableTileInfo.transformedReader.getPixel({ x, y })) }}>
                                <input className='sr-only' type="checkbox" checked={transparentPixels.find(c => c.x == x && c.y == y) ? "pixel-is-transparent" : ""} onChange={checkboxOnChange} data-x={x} data-y={y} />
                            </label>
                        )
                    )
                }
            </div>
        </div>
    </>)
}

export default PixelTransparencyOverideSelector;