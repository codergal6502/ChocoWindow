import React, { useRef, useEffect, useState } from 'react';
import { ChocoStudioLayout, ChocoStudioWorkspace } from '../ChocoStudio';
import interact from 'interactjs';
import { ChocoWinWindow } from '../ChocoWindow';
import './ChocoWinCanvas.css'

const ChocoWinCanvas = ({ /** @type { ChocoStudioWorkspace } */ workspace }) => {
    const mainCanvasDivRef = useRef(null);
    const styleRef = useRef(null);

    const [readyToDrag, setReadyToDrag] = useState(false);


    useEffect(() => { // empty-dependency useEffect for on load
        const positions = {
            "40dd32d2-2b15-45f9-bc91-10e3516397d8": { x: 0, y: 0 },
            "17fbf734-92d8-4170-b40b-0b6669bb8709": { x: 0, y: 0 },
        };

        const makeDraggable = (selector) => {
            interact(selector).on(['resizeend'], (e) => console.log('resizeend', e))

                .draggable({
                    listeners: {
                        move(event) {
                            const id = event.target.id;

                            positions[id].x += event.dx
                            positions[id].y += event.dy

                            event.target.style.transform =
                                `translate(${positions[id].x}px, ${positions[id].y}px)`;
                        },
                        start(e) {
                            e.target.setAttribute("data-drag-start-x", e.pageX);
                            e.target.setAttribute("data-drag-start-y", e.pageY);
                        },
                        end(e) {
                            const startX = e.target.getAttribute("data-drag-start-x");
                            const startY = e.target.getAttribute("data-drag-start-y");

                            e.target.removeAttribute("data-drag-start-x");
                            e.target.removeAttribute("data-drag-start-y");

                            console.log('drag delta', { x: e.pageX - startX, y: e.pageY - startY });
                        },
                    }
                })
                .resizable({
                    edges: { top: true, left: true, bottom: true, right: true },
                    listeners: {
                        move: function (event) {
                            const id = event.target.id;
                            let { x, y } = event.target.dataset;

                            positions[id].x += (parseFloat(x) || 0) + event.deltaRect.left
                            positions[id].y += (parseFloat(y) || 0) + event.deltaRect.top

                            Object.assign(event.target.style, {
                                width: `${event.rect.width}px`,
                                height: `${event.rect.height}px`,
                                transform: `translate(${positions[id].x}px, ${positions[id].y}px)`
                            })
                        },
                        start(e) {
                            const edges = e.interaction.prepared.edges;

                            e.target.setAttribute("data-resize-start-x", e.pageX);
                            e.target.setAttribute("data-resize-start-y", e.pageY);
                            e.target.setAttribute("data-resize-left", edges.left);
                            e.target.setAttribute("data-resize-right", edges.right);
                            e.target.setAttribute("data-resize-top", edges.top);
                            e.target.setAttribute("data-resize-bottom", edges.bottom);
                        },
                        end(e) {
                            const startX = Number(e.target.getAttribute("data-resize-start-x"));
                            const startY = Number(e.target.getAttribute("data-resize-start-y"));
                            const left = "true" == e.target.getAttribute("data-resize-left");
                            const right = "true" == e.target.getAttribute("data-resize-right");
                            const top = "true" == e.target.getAttribute("data-resize-top");
                            const bottom = "true" == e.target.getAttribute("data-resize-bottom");

                            if (right) console.log("right", e.pageX - startX);
                            if (left) console.log("left", e.pageX - startX);
                            if (top) console.log("top", e.pageY - startY);
                            if (bottom) console.log("bottom", e.pageY - startY);
                        },
                    }
                })
        }

        makeDraggable(".choco-win-draggable");

        if (workspace) {
            const /** @type { ChocoStudioWorkspace } */ ws = workspace;
            const /** @type { ChocoStudioLayout } */ initialLayout = ws.layouts[0];
            if (mainCanvasDivRef.current && styleRef.current && initialLayout) {
                initialLayout.windowIds.forEach((windowId) => {
                    const studioWindow = ws.windows.find((w) => w.id == windowId);
                    if (studioWindow) {
                        const preset = studioWindow.singularPreset || ws.presets.find((ps) => ps.id == studioWindow.presetId);
                        if (preset) {
                            const tileSet = ws.tileSets.find((ts) => ts.id == preset.tileSetId);
                            const renderWindow = new ChocoWinWindow(tileSet, preset.tileScale, 0, 0, studioWindow.w, studioWindow.h);

                            renderWindow.isReady().then(() => {
                                const canvas = document.createElement("canvas");
                                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                                canvas.width = studioWindow.w;
                                canvas.height = studioWindow.h;
                                renderWindow.drawTo(ctx);
                                const imageData = canvas.toDataURL();

                                const chocoWindowDivId = `win-${studioWindow.id}`;
                                const chocoWinDiv = document.createElement("div");
                                chocoWinDiv.setAttribute("id", chocoWindowDivId);
                                chocoWinDiv.style.position = "absolute";
                                chocoWinDiv.style.top = `${studioWindow.y}px`;
                                chocoWinDiv.style.left = `${studioWindow.x}px`;
                                chocoWinDiv.style.width = `${studioWindow.w}px`;
                                chocoWinDiv.style.height = `${studioWindow.h}px`;
                                chocoWinDiv.style.color = "white";
                                chocoWinDiv.style.fontSize = "20px";
                                chocoWinDiv.style.fontFamily = "sans-serif";
                                chocoWinDiv.style.touchAction = "none";
                                chocoWinDiv.style.boxSizing = "border-box";
                                chocoWinDiv.style.backgroundSize = "100%";

                                mainCanvasDivRef.current.appendChild(chocoWinDiv);

                                const boundingBoxDivId = `bnd-${studioWindow.id}`;
                                const boundingBoxDiv = document.createElement("div");
                                boundingBoxDiv.setAttribute("id", boundingBoxDivId);
                                boundingBoxDiv.classList.add("chocoWinBoundingBox");
                                boundingBoxDiv.style.position = "absolute";
                                boundingBoxDiv.style.top = `${studioWindow.y}px`;
                                boundingBoxDiv.style.left = `${studioWindow.x}px`;
                                boundingBoxDiv.style.width = `${studioWindow.w}px`;
                                boundingBoxDiv.style.height = `${studioWindow.h}px`;
                                mainCanvasDivRef.current.append(boundingBoxDiv);

                                const styleSheet = styleRef.current.sheet;
                                const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                                styleSheet.insertRule(newRule);

                                positions[boundingBoxDivId] = { x: 0, y: 0 };

                                makeDraggable(boundingBoxDiv);
                            });
                        }
                    }
                })
            }
        }
    }, []);

    return (
        <div ref={mainCanvasDivRef} style={{ transform: "", border: "1px dashed white" }}>
            <style ref={styleRef}>
                .chocoWinBoundingBox {

                }
            </style>
            <div id="40dd32d2-2b15-45f9-bc91-10e3516397d8" className='choco-win-draggable' style={{ position: "absolute", width: "120px", borderRadius: "8px", padding: "20px", margin: "1rem", backgroundColor: "#29e", color: "white", fontSize: "20px", fontFamily: "sans-serif", touchAction: "none", boxSizing: "border-box" }}>Drag & Resize 1</div>
            <div id="17fbf734-92d8-4170-b40b-0b6669bb8709" className='choco-win-draggable' style={{ position: "absolute", width: "120px", borderRadius: "8px", padding: "20px", margin: "1rem", backgroundColor: "#29e", color: "white", fontSize: "20px", fontFamily: "sans-serif", touchAction: "none", boxSizing: "border-box" }}>Drag & Resize 2</div>
        </div>
    );
};
export default ChocoWinCanvas;