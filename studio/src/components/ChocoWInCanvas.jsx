import React, { useRef, useEffect, useState } from 'react';
import { ChocoStudioLayout, ChocoStudioWorkspace } from '../ChocoStudio';
import interact from 'interactjs';
import { ChocoWinWindow } from '../ChocoWindow';
import './ChocoWinCanvas.css'

const ChocoWinCanvas = ({ /** @type { ChocoStudioWorkspace } */ workspace }) => {
    const mainCanvasDivRef = useRef(null);
    const styleRef = useRef(null);

    const makeNoWindowActive = () => Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); });

    useEffect(() => { // empty-dependency useEffect for on load
        /** @type {Object<string, { x: number, y: number }>} */ const positions = {} // associative array from element IDs to 

        if (mainCanvasDivRef.current) { mainCanvasDivRef.current.onclick = (e) => { if (e.target == mainCanvasDivRef.current) { makeNoWindowActive(); } } }

        document.addEventListener("keydown", (evt) => {
            if (evt.key == 'Escape') {
                makeNoWindowActive();
            }
        })
        
        const makeDraggable = (selector) => {
            interact(selector)
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

                            const deltaX = e.pageX - startX;
                            const deltaY = e.pageY - startY;

                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));

                            const windowX = Number(chocoWinDiv.style.left.replace("px", ""))
                            const windowY = Number(chocoWinDiv.style.top.replace("px", ""))

                            chocoWinDiv.style.left = `${Math.round(windowX + deltaX)}px`;
                            chocoWinDiv.style.top = `${Math.round(windowY + deltaY)}px`;
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

                            const deltaX = e.pageX - startX;
                            const deltaY = e.pageY - startY;

                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));

                            const windowX = Number(chocoWinDiv.style.left.replace("px", ""))
                            const windowY = Number(chocoWinDiv.style.top.replace("px", ""))
                            const windowW = Number(chocoWinDiv.style.width.replace("px", ""))
                            const windowH = Number(chocoWinDiv.style.height.replace("px", ""))

                            if (right) {
                                chocoWinDiv.style.width = `${Math.round(windowW + deltaX)}px`;
                            }
                            else if (left) {
                                chocoWinDiv.style.left = `${Math.round(windowX + deltaX)}px`;
                                chocoWinDiv.style.width = `${Math.round(windowW - deltaX)}px`;
                            }

                            if (bottom) {
                                chocoWinDiv.style.height = `${Math.round(windowH + deltaY)}px`;
                            }
                            else if (top) {
                                chocoWinDiv.style.top = `${Math.round(windowY + deltaY)}px`;
                                chocoWinDiv.style.height = `${Math.round(windowH - deltaY)}px`;
                            }

                            const /** @type { ChocoStudioWorkspace } */ ws = workspace;
                            const studioWindow = ws.windows.find((w) => `win-${w.id}` == e.target.dataset.chocoWinId);
                            const chocoWindowDivId = `win-${studioWindow.id}`;

                            studioWindow.w = Number(chocoWinDiv.style.width.replace("px", ""));
                            studioWindow.h = Number(chocoWinDiv.style.height.replace("px", ""))

                            const preset = studioWindow.singularPreset || ws.presets.find((ps) => ps.id == studioWindow.presetId);
                            if (preset) {
                                const tileSet = ws.tileSets.find((ts) => ts.id == preset.tileSetId);
                                const renderWindow = new ChocoWinWindow(tileSet, preset.tileScale, 0, 0, studioWindow.w, studioWindow.h);

                                renderWindow.isReady().then(() => {
                                    // creating these windows should be moved to ouside this area and they should be pre-filled with a loading thing
                                    // that way, the logic for drawing into the divs can be isoalted and reused
                                    // also rename window to ChocoWindowRenderer, since it's not a window
                                    const canvas = document.createElement("canvas");
                                    const ctx = canvas.getContext("2d", { willReadFrequently: true });
                                    canvas.width = studioWindow.w;
                                    canvas.height = studioWindow.h;

                                    const styleSheet = styleRef.current.sheet;
                                    renderWindow.drawTo(ctx);
                                    const imageData = canvas.toDataURL();
                                    const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                                    /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.rules);
                                    const ruleIdx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                                    if (ruleIdx >= 0) {
                                        styleSheet.removeRule(ruleIdx);
                                    }

                                    styleSheet.insertRule(newRule);
                                });
                            }
                        },
                    }
                })
        }

        if (workspace) {
            const /** @type { ChocoStudioWorkspace } */ ws = workspace;
            const /** @type { ChocoStudioLayout } */ initialLayout = ws.layouts[0];
            if (mainCanvasDivRef.current && styleRef.current && initialLayout) {
                initialLayout.windowIds.forEach((windowId) => {
                    const studioWindow = ws.windows.find((w) => w.id == windowId);
                    const chocoWindowDivId = `win-${studioWindow.id}`;

                    if (document.getElementById(chocoWindowDivId)) {
                        return; // logically 'continue' in a forEach lambda
                    }

                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d", { willReadFrequently: true });
                    canvas.width = studioWindow.w;
                    canvas.height = studioWindow.h;

                    const chocoWinDiv = document.createElement("div");
                    chocoWinDiv.setAttribute("id", chocoWindowDivId);
                    chocoWinDiv.setAttribute("data-studio-window-id", studioWindow.id);
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
                    boundingBoxDiv.setAttribute("data-choco-win-id", chocoWindowDivId);
                    boundingBoxDiv.setAttribute("data-studio-window-id", studioWindow.id);
                    boundingBoxDiv.classList.add("chocoWinBoundingBox");
                    boundingBoxDiv.style.position = "absolute";
                    boundingBoxDiv.style.top = `${studioWindow.y}px`;
                    boundingBoxDiv.style.left = `${studioWindow.x}px`;
                    boundingBoxDiv.style.width = `${studioWindow.w}px`;
                    boundingBoxDiv.style.height = `${studioWindow.h}px`;
                    mainCanvasDivRef.current.append(boundingBoxDiv);

                    boundingBoxDiv.onclick = (e) => {
                        Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); })
                        e.target.classList.add('active');
                    }

                    if (studioWindow) {
                        const preset = studioWindow.singularPreset || ws.presets.find((ps) => ps.id == studioWindow.presetId);
                        if (preset) {
                            const tileSet = ws.tileSets.find((ts) => ts.id == preset.tileSetId);
                            const renderWindow = new ChocoWinWindow(tileSet, preset.tileScale, 0, 0, studioWindow.w, studioWindow.h);

                            renderWindow.isReady().then(() => {
                                // creating these windows should be moved to ouside this area and they should be pre-filled with a loading thing
                                // that way, the logic for drawing into the divs can be isoalted and reused
                                // also rename window to ChocoWindowRenderer, since it's not a window

                                const styleSheet = styleRef.current.sheet;
                                renderWindow.drawTo(ctx);
                                const imageData = canvas.toDataURL();
                                const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                                /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.rules);
                                const ruleIdx = ruleArray.find((r) => r.selectorText == `#${chocoWindowDivId}`);

                                if (ruleIdx >= 0) {
                                    styleSheet.removeRule(ruleIdx);
                                }

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
        <div ref={mainCanvasDivRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
            <style ref={styleRef}>
                .chocoWinBoundingBox {

                }
            </style>
        </div>
    );
};
export default ChocoWinCanvas;