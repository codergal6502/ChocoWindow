import { useEffect, useRef, useState } from 'react';
import { ChocoWinAbstractPixelReader, ChocoWinReflectionPixelReader, ChocoWinReflectionTypes, ChocoWinRotatePixelReader, TileTransformationTypes } from '../../../ChocoWindow'
import { ChocoWinPngJsPixelWriter } from '../../../ChocoWinPngJsReaderWriter';
import "./TileTransformationSelector.css"

/**
 * @param {Object} props
 * @param {ChocoWinAbstractPixelReader} props.reader
 */
const TileTransformationSelector = ({ reader }) => {
    const unique = crypto.randomUUID();
    const styleRef = useRef(null);

    /** @type {ReturnType<typeof useState<Map<String, String>>>} */
    const [tileBlobUrlMap, setTileBlobUrlMap] = useState(new Map());

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

    /**
     * @param {InputEvent} e 
     */
    const onSelectTileTransformationChange = (e) => {
        setSelectedTileTransformation(e.target.value)
    }

    useEffect(() => {
        if (styleRef && styleRef.current && reader) {
            const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;
            
            /**
             * @param {Object} args
             * @param {String} args.transformationType
             * @param {ChocoWinAbstractPixelReader} args.reader
             * @returns 
             */
            const doTheThing = ({ reader, transformationType }) => {
                reader.isReady().then(r => {
                    const writer = new ChocoWinPngJsPixelWriter(r.width, r.height);
                    writer.writeAll(r);
                    const newUrl = URL.createObjectURL(writer.makeBlob());

                    if (tileBlobUrlMap.has(transformationType)) {
                        URL.revokeObjectURL(tileBlobUrlMap.get(transformationType));
                    }

                    tileBlobUrlMap.set(transformationType, newUrl);

                    const newRule = `.tile-transformation-${unique}-${transformationType} { background-image: url(${newUrl}); mask-image: url(${newUrl}); }`;
                    styleSheet.insertRule(newRule);
                });
            }

            // Sub-optimal efficiency since an identical blob for BASE will exist in multiple places but the code is very simple.
            doTheThing({ transformationType: TileTransformationTypes.BASE, reader: reader })
            doTheThing({ transformationType: TileTransformationTypes.ROTATE_90, reader: new ChocoWinRotatePixelReader(reader, 1) });
            doTheThing({ transformationType: TileTransformationTypes.ROTATE_180, reader: new ChocoWinRotatePixelReader(reader, 2) });
            doTheThing({ transformationType: TileTransformationTypes.ROTATE_270, reader: new ChocoWinRotatePixelReader(reader, 3) });
            doTheThing({ transformationType: TileTransformationTypes.REFLECT_HORIZONTAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.HORIZONTAL) });
            doTheThing({ transformationType: TileTransformationTypes.REFLECT_VERTICAL, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.VERTICAL) });
            doTheThing({ transformationType: TileTransformationTypes.REFLECT_ASCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.ASCENDING) });
            doTheThing({ transformationType: TileTransformationTypes.REFLECT_DESCENDING, reader: new ChocoWinReflectionPixelReader(reader, ChocoWinReflectionTypes.DESCENDING) });
        }
    }, [styleRef, reader, selectedTileTransformation])

    return (<>
        <style ref={styleRef} />
        <h4 className="my-3 font-bold">Tile Transformation</h4>
        <div className="grid grid-cols-2">
            {Object.values(TileTransformationTypes).map((transformationType, idx) =>
                <label className={`flex items-center tile-transformation ${selectedTileTransformation == transformationType ? 'selected' : 'not-selected'}`}>
                    <input type="radio" name={`tile-transformation-${unique}`} className="sr-only" key={idx} value={transformationType} checked={selectedTileTransformation == transformationType} onChange={onSelectTileTransformationChange} />
                    <span className={`label-image tile-transformation-${unique}-${transformationType}`} />
                    <span className='label-text'>{transformationNameLabels[transformationType]}</span>
                </label>
            )}
        </div>
    </>)
}

export default TileTransformationSelector;