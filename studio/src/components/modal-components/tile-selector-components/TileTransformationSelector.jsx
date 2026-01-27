import { useEffect, useRef, useState } from 'react';
import { ChocoWinAbstractPixelReader, ChocoWinReflectionPixelReader, ChocoWinReflectionTypes, ChocoWinRotatePixelReader, TileTransformationTypes } from '../../../ChocoWindow'
import { ChocoWinPngJsPixelWriter } from '../../../ChocoWinPngJsReaderWriter';
import "./TileTransformationSelector.css"
import { ERR_LOCAL_FILE_HEADER_NOT_FOUND } from '@zip.js/zip.js';
import { TileAssignment } from '../TileSetDefinitionEditor';

/**
 * @param {Object} props
 * @param {TileAssignment} props.activeTileSheetAssignment
 * @param {function({transformationType: string, reader: ChocoWinAbstractPixelReader, blobUrl: String})} props.onSelectionMade
 */
const TileTransformationSelector = ({ activeTileSheetAssignment, onSelectionMade }) => {
    const unique = useRef(crypto.randomUUID());
    const styleRef = useRef(null);
    const tileBlobUrlMap = useRef(new Map());
    const readerMap = useRef(new Map());

    /** @type {ReturnType<typeof useState<Map<String, String>>>} */

    const transformationNameLabels = {
        [TileTransformationTypes.BASE]: "None",
        [TileTransformationTypes.ROTATE_90]: "Rot. 90º",
        [TileTransformationTypes.ROTATE_180]: "Rot. 180º",
        [TileTransformationTypes.ROTATE_270]: "Rot. 270º",
        [TileTransformationTypes.REFLECT_HORIZONTAL]: "Flip Horiz.",
        [TileTransformationTypes.REFLECT_VERTICAL]: "Flip Vert.",
        [TileTransformationTypes.REFLECT_ASCENDING]: "Flip Asc.",
        [TileTransformationTypes.REFLECT_DESCENDING]: "Flip Desc.",
    }

    const [selectedTileTransformation, setSelectedTileTransformation] = useState(TileTransformationTypes.BASE);

    // revoke all the transformed tile URLs
    useEffect(() => {
        return () => {
            if (tileBlobUrlMap?.current) {
                tileBlobUrlMap.current.forEach((value) => {
                    URL.revokeObjectURL(value);
                });
            }
        }
    }, [])

    /**
     * @param {Object} e 
     * @param {HTMLInputElement} e.target
     */
    const onSelectTileTransformationChange = (e) => {
        setSelectedTileTransformation(e.target.value)

        if (onSelectionMade && tileBlobUrlMap?.current && tileBlobUrlMap.current.has(e.target.value) && readerMap?.current && readerMap.current.has(e.target.value)) {
            onSelectionMade({
                transformationType: e.target.value,
                reader: readerMap.current.get(e.target.value),
                blobUrl: tileBlobUrlMap.current.get(e.target.value)
            })
        }
    }

    useEffect(() => {
        if (activeTileSheetAssignment) {
            if (activeTileSheetAssignment.geometricTransformation != selectedTileTransformation) {
                setSelectedTileTransformation(activeTileSheetAssignment.geometricTransformation);
            }
        }
    }, [activeTileSheetAssignment])

    useEffect(() => {
        if (unique && unique.current && styleRef && styleRef.current && activeTileSheetAssignment?.baseReader && tileBlobUrlMap?.current) {
            /**
             * @param {Object} args
             * @param {String} args.transformationType
             * @param {ChocoWinAbstractPixelReader} args.reader
             * @returns 
             */
            const doTheThing = ({ reader, transformationType }) => {
                const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;
                return new Promise(resolve => {
                    reader.isReady().then(r => {
                        const writer = new ChocoWinPngJsPixelWriter(r.width, r.height);
                        writer.writeAll(r);
                        const newUrl = URL.createObjectURL(writer.makeBlob());

                        if (tileBlobUrlMap.current.has(transformationType)) {
                            URL.revokeObjectURL(tileBlobUrlMap.current.get(transformationType));
                        }

                        tileBlobUrlMap.current.set(transformationType, newUrl);
                        readerMap.current.set(transformationType, r);

                        const selectorText = `.tile-transformation-${unique.current}-${transformationType}`

                        const oldRuleIndex = Array.from(styleSheet.cssRules).findIndex(r => r.selectorText == selectorText);
                        if (oldRuleIndex >= 0) { styleSheet.deleteRule(oldRuleIndex) };

                        const newRule = `${selectorText} { background-image: url(${newUrl}); }`;
                        styleSheet.insertRule(newRule);

                        resolve();
                    });
                });
            }

            const reader = activeTileSheetAssignment.baseReader;
            const promises = [];
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.BASE, reader: reader }); // a little inefficient to read and write the same tile but also super simple!
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.ROTATE_90, reader: new ChocoWinRotatePixelReader(reader, 1) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.ROTATE_180, reader: new ChocoWinRotatePixelReader(reader, 2) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.ROTATE_270, reader: new ChocoWinRotatePixelReader(reader, 3) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.REFLECT_HORIZONTAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.HORIZONTAL) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.REFLECT_VERTICAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.VERTICAL) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.REFLECT_ASCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.ASCENDING) });
            promises[promises.length] = doTheThing({ transformationType: TileTransformationTypes.REFLECT_DESCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.DESCENDING) });

            // todo: assess this
            // Promise.all(promises).then(() => {
            //     // This is needed so that when a new reader is passed in, callback is called with the transformation of that reader.
            //     onSelectionMade({transformationType: selectedTileTransformation, reader: readerMap.current.get(selectedTileTransformation), blobUrl: tileBlobUrlMap.current.get(selectedTileTransformation)})
            // });
        }
    }, [styleRef, activeTileSheetAssignment])

    return ((unique && unique.current) && <>
        <style ref={styleRef} />
        <h4 className="my-3 font-bold">Tile Transformation</h4>
        <div className="grid grid-cols-2">
            {Object.values(TileTransformationTypes).map((transformationType, idx) =>
                <label key={idx} className={`flex items-center tile-transformation ${selectedTileTransformation == transformationType ? 'selected' : 'not-selected'}`}>
                    <input type="radio" name={`tile-transformation-${unique.current}`} className="sr-only" key={idx} value={transformationType} checked={selectedTileTransformation == transformationType} onChange={onSelectTileTransformationChange} />
                    <span className={`label-image tile-transformation-${unique.current}-${transformationType}`} />
                    <span className='label-text'>{transformationNameLabels[transformationType]}</span>
                </label>
            )}
        </div>
    </>)
}

export default TileTransformationSelector;