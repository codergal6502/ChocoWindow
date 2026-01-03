import React, { useRef, useEffect, useState } from 'react';
import { ChocoStudioLayout, ChocoStudioWorkspace } from '../ChocoStudio';
import interact from 'interactjs';
import { ChocoWinWindow } from '../ChocoWindow';
import './ChocoWinCanvas.css'
import { text } from '@fortawesome/fontawesome-svg-core';

const ChocoWinCanvas = ({ workspace, onWorkspaceChange, canvasLayoutId }) => {
    const mainCanvasDivRef = useRef(null);
    const styleRef = useRef(null);
    const SNAP_SIZE = 10;
    let uiScale = 1.0;

    const makeNoWindowActive = () => Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); });

    const updateCoordinates = (dd) => {
        let /** @type {HTMLElement} */ textDiv;
        let /** @type {HTMLElement} */ boundingBoxDiv;

        if (dd.classList && (dd.classList.contains("dimensions") || dd.classList.contains("window-name"))) {
            // The text was clicked directly, not the parent.
            const clickedDiv = dd;
            boundingBoxDiv = clickedDiv.parentNode;
            textDiv = Array.from(boundingBoxDiv.childNodes).filter((c) => c.classList.contains("dimensions"))[0];
        }
        else {
            boundingBoxDiv = dd;
            textDiv = Array.from(boundingBoxDiv.childNodes).filter((c) => c.classList.contains("dimensions"))[0];
        }
        const width = Math.floor(boundingBoxDiv.style.width.replace("px", ""));
        const height = Math.floor(boundingBoxDiv.style.height.replace("px", ""));
        const x = Math.floor(boundingBoxDiv.style.left.replace("px", ""))
        const y = Math.floor(boundingBoxDiv.style.top.replace("px", ""))
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
        let div = e.target.classList && e.target.classList.contains("dimensions") ? e.target.parentNode : e.target;
        Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); })
        div.classList.add('active');
        updateCoordinates(div);
    }

    const resizeCanvas = () => {
        /** @type { ChocoStudioWorkspace } */ const ws = workspace;

        const menuBarHeight = 0;
        const clientWidth = window.innerWidth;
        const clientHeight = window.innerHeight;

        const widthRatio = 1.0 * clientWidth / ws.width;
        const heightRatio = 1.0 * (clientHeight - menuBarHeight) / ws.height;

        uiScale = Math.min(widthRatio, heightRatio);

        if (uiScale < 1) {
            const /** @type {HTMLElement} */ chocoStudioCanvasDiv = document.getElementById("choco-studio-canvas-div");
            chocoStudioCanvasDiv.style.scale = `${100.0 * uiScale}%`;
            chocoStudioCanvasDiv.style.width = Math.floor(1.0 * ws.width * uiScale);
            chocoStudioCanvasDiv.style.height = Math.floor(1.0 * ws.height * uiScale);
            chocoStudioCanvasDiv.style.left = `${-0.25 * ws.width * uiScale}px`;
            chocoStudioCanvasDiv.style.top = `${-0.25 * ws.height * uiScale + menuBarHeight}px`;
        }
    }

    let lastKeydownTimeStamp = 0;

    useEffect(() => { // empty-dependency useEffect for on load
        if (mainCanvasDivRef.current) { mainCanvasDivRef.current.onclick = (e) => { if (e.target == mainCanvasDivRef.current) { makeNoWindowActive(); } } }

        resizeCanvas();

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
                            e.target.style.left = chocoWinDiv.style.left;

                            /** @type { ChocoStudioWorkspace } */ const ws = workspace;

                            if (ws) {
                                const studioWindow = ws.windows.filter((w) => chocoWinDiv.dataset.studioWindowId == w.id)[0];

                                studioWindow.x = Math.round(newLeft);
                                studioWindow.y = Math.round(newTop);
                                onWorkspaceChange(workspace);
                            }
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
                            const doResizeLeft = e.interaction.prepared.edges.left;
                            const doResizeRight = e.interaction.prepared.edges.right;
                            const doResizeTop = e.interaction.prepared.edges.top;
                            const doResizeBottom = e.interaction.prepared.edges.bottom;

                            if (isGridSnapModifierHeld(e) && doResizeTop) {
                                const newTop = snapCoordinate(e.rect.top / uiScale)
                                const deltaTop = (e.rect.top - newTop) / uiScale;
                                const newHeight = (e.rect.height + deltaTop) / uiScale;
                                e.target.style.top = `${Math.floor(newTop)}px`;
                                e.target.style.height = `${Math.floor(newHeight)}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeBottom) {
                                const newTop = e.rect.top;
                                const newBottom = snapCoordinate(newTop + e.rect.height);
                                const newHeight = newBottom - e.rect.top;
                                e.target.style.top = `${Math.floor(newTop)}px`;
                                e.target.style.height = `${Math.floor(newHeight)}px`;
                            }
                            else {
                                e.target.style.top = `${Math.floor(e.rect.top / uiScale)}px`;
                                e.target.style.height = `${Math.floor(e.rect.height / uiScale)}px`;
                            }

                            if (isGridSnapModifierHeld(e) && doResizeLeft) {
                                const newLeft = snapCoordinate(e.rect.left)
                                const deltaLeft = e.rect.left - newLeft;
                                const newWidth = e.rect.width + deltaLeft;
                                e.target.style.left = `${Math.floor(newLeft)}px`;
                                e.target.style.width = `${Math.floor(newWidth)}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeRight) {
                                const newLeft = e.rect.left;
                                const newBottom = snapCoordinate(newLeft + e.rect.width);
                                const newWidth = newBottom - e.rect.left;
                                e.target.style.left = `${Math.floor(newLeft)}px`;
                                e.target.style.width = `${Math.floor(newWidth)}px`;
                            }
                            else {
                                e.target.style.left = `${Math.floor(e.rect.left / uiScale)}px`;
                                e.target.style.width = `${Math.floor(e.rect.width / uiScale)}px`;
                            }

                            updateCoordinates(e.target);
                        },
                        end(e) {
                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));
                            chocoWinDiv.style.top = e.target.style.top;
                            chocoWinDiv.style.height = e.target.style.height;
                            chocoWinDiv.style.left = e.target.style.left;
                            chocoWinDiv.style.width = e.target.style.width;

                            const /** @type { ChocoStudio } */ ws = workspace;
                            const studioWindow = ws.windows.find((w) => `win-${w.id}` == e.target.dataset.chocoWinId);
                            const chocoWindowDivId = `win-${studioWindow.id}`;

                            studioWindow.w = Number(chocoWinDiv.style.width.replace("px", ""));
                            studioWindow.h = Number(chocoWinDiv.style.height.replace("px", ""))

                            if (onWorkspaceChange) onWorkspaceChange(ws);

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

                                    /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.cssRules);
                                    const oldRuleInx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                                    if (oldRuleInx >= 0) {
                                        styleSheet.deleteRule(oldRuleInx);
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
            const /** @type { ChocoStudioLayout } */ layout = ws.layouts.filter((l) => canvasLayoutId == l.id)[0] || ws.layouts[0];

            if (mainCanvasDivRef.current && styleRef.current && layout) {
                document.querySelectorAll("[data-studio-window-id], [data-choco-win-id]").forEach((el) => el.remove());
                const /** @type {CSSStyleSheet} */ styleSheet = styleRef.current.sheet;
                let rules = new Array(styleSheet.cssRules);

                layout.windowIds.forEach((windowId) => {
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

                    const nameDiv = document.createElement("div");
                    nameDiv.classList.add("window-name");
                    nameDiv.textContent = studioWindow.name;
                    boundingBoxDiv.appendChild(nameDiv);

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

                                /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.cssRules);
                                const oldRuleInx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                                if (oldRuleInx >= 0) {
                                    styleSheet.deleteRule(oldRuleInx);
                                }

                                styleSheet.insertRule(newRule);

                                makeDraggable(boundingBoxDiv);
                            });
                        }
                    }
                })
            }
        }
    }, [workspace, canvasLayoutId]);

    return (
        <div id='choco-studio-canvas-div' ref={mainCanvasDivRef}>
            <style ref={styleRef}></style>
        </div>
    );
};
export default ChocoWinCanvas;