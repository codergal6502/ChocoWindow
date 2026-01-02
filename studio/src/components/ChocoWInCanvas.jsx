import React, { useRef, useEffect, useState } from 'react';
import { ChocoStudioLayout, ChocoStudioWorkspace } from '../ChocoStudio';
import interact from 'interactjs';
import { ChocoWinWindow } from '../ChocoWindow';
import './ChocoWinCanvas.css'
import { text } from '@fortawesome/fontawesome-svg-core';

const ChocoWinCanvas = ({ /** @type { ChocoStudioWorkspace } */ workspace }) => {
    const mainCanvasDivRef = useRef(null);
    const styleRef = useRef(null);
    const SNAP_SIZE = 10;

    const makeNoWindowActive = () => Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); });

    const updateCoordinates = (boundingBoxDiv) => {
        const /** @type {HTMLElement} */ div = boundingBoxDiv;
        const /** @type {HTMLElement} */ textDiv = Array.from(div.childNodes).filter((c) => c.classList && c.classList.contains("dimensions"))[0];
        const width = Math.floor(div.style.width.replace("px", ""));
        const height = Math.floor(div.style.height.replace("px", ""));
        const x = Math.floor(div.style.left.replace("px", ""))
        const y = Math.floor(div.style.top.replace("px", ""))
        textDiv.innerText = `${width} x ${height} @ (${x}, ${y})`;
    }

    const isGridSnapModifierHeld = (event) => {
        // See https://www.xjavascript.com/blog/detect-macos-ios-windows-android-and-linux-os-with-js/#detecting-specific-operating-systems.
        function isMacOS() {
            const userAgent = navigator.userAgent;
            // Check for "Macintosh" (excludes iOS)
            return /Macintosh/.test(userAgent);
        }

        function isWindows() {
            const userAgent = navigator.userAgent;
            return /Windows/.test(userAgent);
        }

        function isLinux() {
            const userAgent = navigator.userAgent;
            // Check for Linux, but exclude Android and Chrome OS
            return /Linux/.test(userAgent) && !/Android|CrOS/.test(userAgent);
        }

        return (isMacOS() && event.metaKey) || (isLinux() && event.controlKey) || (isWindows() && event.controlKey);
    }

    const snapCoordinate = (x) => Math.floor(1.0 * x / SNAP_SIZE) * SNAP_SIZE;

    const toGridSnap = ({ x, y }, event) => {
        if (isGridSnapModifierHeld(event)) {
            return { x: snapCoordinate(x), y: snapCoordinate(y) };
        }
        else {
            return { x: x, y: y };
        }
    }

    const makeChocoWinBoundingBoxActive = (e) => {
        Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); })
        e.target.classList.add('active');
        updateCoordinates(e.target);
    }

    let lastKeydownTimeStamp = 0;

    useEffect(() => { // empty-dependency useEffect for on load
        if (mainCanvasDivRef.current) { mainCanvasDivRef.current.onclick = (e) => { if (e.target == mainCanvasDivRef.current) { makeNoWindowActive(); } } }

        document.addEventListener("keydown", (e) => {
            if (e.timeStamp == lastKeydownTimeStamp) { return; }
            lastKeydownTimeStamp = e.timeStamp;

            switch (e.key) {
                case 'Escape': {
                    makeNoWindowActive();
                    break;
                }
                case 'ArrowUp': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.top = `${Number(activeDiv.style.top.replace("px", "")) - 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.top = activeDiv.style.top;
                        updateCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowDown': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.top = `${Number(activeDiv.style.top.replace("px", "")) + 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.top = activeDiv.style.top;
                        updateCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowLeft': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.left = `${Number(activeDiv.style.left.replace("px", "")) - 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.left = activeDiv.style.left;
                        updateCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowRight': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.left = `${Number(activeDiv.style.left.replace("px", "")) + 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.left = activeDiv.style.left;
                        updateCoordinates(activeDiv);
                    }
                    break;
                }
            }
        })

        const makeDraggable = (selector) => {
            interact(selector)
                .draggable({
                    listeners: {
                        start(e) {
                            e.target.setAttribute("data-drag-start-x", e.pageX);
                            e.target.setAttribute("data-drag-start-y", e.pageY);
                            e.target.setAttribute("data-drag-delta-x", 0);
                            e.target.setAttribute("data-drag-delta-y", 0);
                            e.target.setAttribute("data-window-start-x", e.target.style.left.replace("px", ""));
                            e.target.setAttribute("data-window-start-y", e.target.style.top.replace("px", ""));
                        },
                        move(e) {
                            makeChocoWinBoundingBoxActive(e);

                            const windowStartX = Number(e.target.getAttribute("data-window-start-x").replace("px", ""));
                            const windowStartY = Number(e.target.getAttribute("data-window-start-y").replace("px", ""));

                            const deltaX = Number(e.target.getAttribute("data-drag-delta-x")) + e.dx;
                            const deltaY = Number(e.target.getAttribute("data-drag-delta-y")) + e.dy;

                            e.target.setAttribute("data-drag-delta-x", deltaX);
                            e.target.setAttribute("data-drag-delta-y", deltaY);

                            const { x: endX, y: endY } = toGridSnap({ x: windowStartX + deltaX, y: windowStartY + deltaY }, e);

                            e.target.style.left = `${Math.round(endX)}px`;
                            e.target.style.top = `${Math.round(endY)}px`;

                            updateCoordinates(e.target);
                        },
                        end(e) {
                            const dragStartX = e.target.getAttribute("data-drag-start-x");
                            const dragStartY = e.target.getAttribute("data-drag-start-y");

                            e.target.removeAttribute("data-drag-start-x");
                            e.target.removeAttribute("data-drag-start-y");
                            e.target.removeAttribute("data-window-start-x");
                            e.target.removeAttribute("data-window-start-y");

                            const deltaX = e.pageX - dragStartX;
                            const deltaY = e.pageY - dragStartY;

                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));

                            const windowX = Number(chocoWinDiv.style.left.replace("px", ""))
                            const windowY = Number(chocoWinDiv.style.top.replace("px", ""))

                            const { x: newLeft, y: newTop } = toGridSnap({ x: windowX + deltaX, y: windowY + deltaY }, e)

                            chocoWinDiv.style.left = `${Math.round(newLeft)}px`;
                            chocoWinDiv.style.top = `${Math.round(newTop)}px`;

                            e.target.style.transform = "";
                            e.target.style.top = chocoWinDiv.style.top;
                            e.target.style.left = chocoWinDiv.style.left
                        },
                    }
                })
                .resizable({
                    edges: { top: true, left: true, bottom: true, right: true },
                    listeners: {
                        start(e) {
                            makeChocoWinBoundingBoxActive(e);
                            const edges = e.interaction.prepared.edges;

                            e.target.setAttribute("data-resize-start-x", e.pageX);
                            e.target.setAttribute("data-resize-start-y", e.pageY);
                            e.target.setAttribute("data-resize-left", edges.left);
                            e.target.setAttribute("data-resize-right", edges.right);
                            e.target.setAttribute("data-resize-top", edges.top);
                            e.target.setAttribute("data-resize-bottom", edges.bottom);
                            e.target.setAttribute("data-drag-delta-x", 0);
                            e.target.setAttribute("data-drag-delta-y", 0);
                        },
                        move: function (e) {
                            // console.log(e.interaction.prepared.edges);
                            const doResizeLeft = e.interaction.prepared.edges.left;
                            const doResizeRight = e.interaction.prepared.edges.right;
                            const doResizeTop = e.interaction.prepared.edges.top;
                            const doResizeBottom = e.interaction.prepared.edges.bottom;

                            if (isGridSnapModifierHeld(e) && doResizeTop) {
                                const newTop = snapCoordinate(e.rect.top)
                                const deltaTop = e.rect.top - newTop;
                                const newHeight = e.rect.height + deltaTop;
                                e.target.style.top = `${newTop}px`;
                                e.target.style.height = `${newHeight}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeBottom) {
                                const newTop = e.rect.top;
                                const newBottom = snapCoordinate(newTop + e.rect.height);
                                const newHeight = newBottom - e.rect.top;
                                e.target.style.top = `${newTop}px`;
                                e.target.style.height = `${newHeight}px`;
                            }
                            else {
                                e.target.style.top = `${e.rect.top}px`;
                                e.target.style.height = `${e.rect.height}px`;
                            }

                            if (isGridSnapModifierHeld(e) && doResizeLeft) {
                                const newLeft = snapCoordinate(e.rect.left)
                                const deltaLeft = e.rect.left - newLeft;
                                const newWidth = e.rect.width + deltaLeft;
                                e.target.style.left = `${newLeft}px`;
                                e.target.style.width = `${newWidth}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeRight) {
                                const newLeft = e.rect.left;
                                const newBottom = snapCoordinate(newLeft + e.rect.width);
                                const newWidth = newBottom - e.rect.left;
                                e.target.style.left = `${newLeft}px`;
                                e.target.style.width = `${newWidth}px`;
                            }
                            else {
                                e.target.style.left = `${e.rect.left}px`;
                                e.target.style.width = `${e.rect.width}px`;
                            }

                            updateCoordinates(e.target);
                        },
                        end(e) {
                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));
                            chocoWinDiv.style.top = e.target.style.top;
                            chocoWinDiv.style.height = e.target.style.height;
                            chocoWinDiv.style.left = e.target.style.left;
                            chocoWinDiv.style.width = e.target.style.width;

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
            mainCanvasDivRef.current.style.width = `${ws.width}px`;
            mainCanvasDivRef.current.style.height = `${ws.height}px`;
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

                    const dimensionsDiv = document.createElement("div");
                    dimensionsDiv.classList.add("dimensions");

                    boundingBoxDiv.appendChild(dimensionsDiv);

                    mainCanvasDivRef.current.append(boundingBoxDiv);

                    boundingBoxDiv.onclick = makeChocoWinBoundingBoxActive;

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