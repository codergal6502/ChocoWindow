import './GraphicalEditor.css'

import { useRef, useEffect } from 'react';

import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJsPixelWriter } from '../ChocoWinPngJsReaderWriter';
import { ChocoWinTileSet, ChocoWinWindow } from '../ChocoWindow';
import { ChocoStudioLayout, ChocoStudioPreset, ChocoStudioWindow, ChocoStudioWorkspace } from '../ChocoStudio';

import interact from 'interactjs';

/**
 * @param {Object} props
 * @param {ChocoStudioWorkspace} props.workspace
 * @param {Function} props.onWorkspaceChange
 * @param {String} props.editorLayoutId
 * @returns 
 */
const GraphicalEditor = ({ workspace, onWorkspaceChange, editorLayoutId, ignoreKeyInputs, lastResizeTimestamp }) => {
    const readerFactory = new ChocoWinPngJsPixelReaderFactory()
    const graphicalEditorDivRef = useRef(null);
    const styleRef = useRef(null);
    const SNAP_SIZE = 10;

    const ignoreKeyInputsRef = useRef(ignoreKeyInputs);
    useEffect(() => {
        ignoreKeyInputsRef.current = ignoreKeyInputs;
    }, [ignoreKeyInputs]);

    const makeNoWindowActive = () => Array.from(document.getElementsByClassName("chocoWinBoundingBox")).forEach((eachBoundingBox) => { eachBoundingBox.classList.remove("active"); });

    /**
     * @param {HTMLElement} dd 
     * @param {String} debugMessage
     */
    const updateBoundingBoxDisplayCoordinates = (dd, debugMessage) => {
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

        if (debugMessage) {
            const nameDiv = Array.from(boundingBoxDiv.childNodes).find(c => c.classList.contains('window-name'));
            if (nameDiv) {
                nameDiv.innerText = debugMessage;
            }
        }
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
        updateBoundingBoxDisplayCoordinates(div);
    }

    const resizeEditorDiv = () => {
        const clientWidth = window.innerWidth;
        const clientHeight = window.innerHeight;

        const widthRatio = 1.0 * clientWidth / workspace.width;
        const heightRatio = 1.0 * (clientHeight) / workspace.height;

        const uiScale = Math.min(widthRatio, heightRatio, 1);

        if (uiScale < 1) {
            const /** @type {HTMLElement} */ graphicalEditorDiv = document.getElementById("graphical-editor-div");

            const editorDivOffsetX = (graphicalEditorDiv.parentNode.clientWidth - (graphicalEditorDiv.clientWidth * uiScale)) / 2;
            const editorDivOffsetY = (graphicalEditorDiv.parentNode.clientHeight - (graphicalEditorDiv.clientHeight * uiScale)) / 2;

            graphicalEditorDiv.setAttribute("data-editor-div-offset-x", editorDivOffsetX);
            graphicalEditorDiv.setAttribute("data-editor-div-offset-y", editorDivOffsetY);
            graphicalEditorDiv.setAttribute("data-ui-scale", uiScale);

            graphicalEditorDiv.style.scale = `${100.0 * uiScale}%`;
            graphicalEditorDiv.style.left = `-${(workspace.width - clientWidth) / 2}px`
            graphicalEditorDiv.style.top = `-${(workspace.height - clientHeight) / 2}px`
        }
    }

    let lastKeydownTimeStamp = 0;

    const checkIgnore = () => ignoreKeyInputsRef?.current;

    useEffect(() => { // empty-dependency useEffect for on load
        if (graphicalEditorDivRef.current) { graphicalEditorDivRef.current.onclick = (e) => { if (e.target == graphicalEditorDivRef.current) { makeNoWindowActive(); } } }

        resizeEditorDiv();

        const keydownListener = (/** @type {KeyboardEvent} */ e) => {
            if (checkIgnore()) { return; }
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
                        updateBoundingBoxDisplayCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowDown': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.top = `${Number(activeDiv.style.top.replace("px", "")) + 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.top = activeDiv.style.top;
                        updateBoundingBoxDisplayCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowLeft': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.left = `${Number(activeDiv.style.left.replace("px", "")) - 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.left = activeDiv.style.left;
                        updateBoundingBoxDisplayCoordinates(activeDiv);
                    }
                    break;
                }
                case 'ArrowRight': {
                    const activeDiv = document.querySelector("div.chocoWinBoundingBox.active");
                    if (activeDiv) {
                        activeDiv.style.left = `${Number(activeDiv.style.left.replace("px", "")) + 1}px`;
                        const chocoWinDiv = document.getElementById(activeDiv.getAttribute('data-choco-win-id'));
                        chocoWinDiv.style.left = activeDiv.style.left;
                        updateBoundingBoxDisplayCoordinates(activeDiv);
                    }
                    break;
                }
            }
        };

        document.addEventListener("keydown", keydownListener);

        /**
         * @param {Object} args
         * @param {ChocoStudioPreset} args.preset
         * @param {ChocoStudioWindow} args.studioWindow
         * @param {ChocoWinTileSet} args.tileSet
         * @param {String} args.chocoWindowDivId
         * @return {Promise<void>} Called once the created window is rendered into the HTML.
         */
        const drawSingleWindow = ({ preset, studioWindow, tileSet, chocoWindowDivId }) => {
            const renderWindow = new ChocoWinWindow({
                colorSubstitutions: preset.substituteColors,
                readerFactory: readerFactory,
                w: studioWindow.w,
                h: studioWindow.h,
                x: studioWindow.x,
                y: studioWindow.y,
                tileScale: preset.tileScale,
                winTileSet: tileSet
            });

            return new Promise(resolve => {
                renderWindow.isReady().then(() => {
                    // also rename window to ChocoWindowRenderer, since it's not a window
                    // const canvas = document.createElement("canvas");
                    // const ctx = canvas.getContext("2d", { willReadFrequently: true });
                    // canvas.width = studioWindow.w;
                    // canvas.height = studioWindow.h;
                    const writer = new ChocoWinPngJsPixelWriter(studioWindow.w, studioWindow.h);

                    const styleSheet = styleRef.current.sheet;
                    renderWindow.drawTo(writer);
                    const imageData = writer.makeDataUrl();

                    const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                    /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.cssRules);
                    const oldRuleInx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                    if (oldRuleInx >= 0) {
                        styleSheet.deleteRule(oldRuleInx);
                    }

                    styleSheet.insertRule(newRule);

                    resolve();
                })
            })
        };


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
                        move(/** @type {InteractEvent} */ e) {
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

                            updateBoundingBoxDisplayCoordinates(e.target);
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

                            if (workspace) {
                                const studioWindow = workspace.windows.filter((w) => chocoWinDiv.dataset.studioWindowId == w.id)[0];

                                studioWindow.x = Math.round(newLeft);
                                studioWindow.y = Math.round(newTop);
                                onWorkspaceChange(workspace);
                            }
                        },
                    }
                })
                .resizable({
                    edges: { top: true, left: true, bottom: true, right: true },
                    // "Logical" dimensions are relative to the upper-left corner of the layout and unscaled.
                    listeners: {
                        start(e) {
                            const /** @type {HTMLElement} */ targetElement = e.target;

                            makeChocoWinBoundingBoxActive(e);
                            const edges = e.interaction.prepared.edges;

                            targetElement.setAttribute("data-resize-logical-start-x", targetElement.offsetLeft);
                            targetElement.setAttribute("data-resize-logical-start-y", targetElement.offsetTop);
                            targetElement.setAttribute("data-resize-logical-start-width", targetElement.offsetWidth);
                            targetElement.setAttribute("data-resize-logical-start-height", targetElement.offsetHeight);
                            targetElement.setAttribute("data-resize-left", edges.left);
                            targetElement.setAttribute("data-resize-right", edges.right);
                            targetElement.setAttribute("data-resize-top", edges.top);
                            targetElement.setAttribute("data-resize-bottom", edges.bottom);
                            targetElement.setAttribute("data-drag-delta-x", 0);
                            targetElement.setAttribute("data-drag-delta-y", 0);
                        },
                        move: function (e) {
                            const /** @type {HTMLElement} */ graphicalEditorDiv = document.getElementById("graphical-editor-div");
                            const editorDivOffsetX = Number(graphicalEditorDiv.getAttribute("data-editor-div-offset-x"));
                            const editorDivOffsetY = Number(graphicalEditorDiv.getAttribute("data-editor-div-offset-y"));
                            const uiScale = Number(graphicalEditorDiv.getAttribute("data-ui-scale"));

                            const doResizeLeft = e.interaction.prepared.edges.left;
                            const doResizeRight = e.interaction.prepared.edges.right;
                            const doResizeTop = e.interaction.prepared.edges.top;
                            const doResizeBottom = e.interaction.prepared.edges.bottom;

                            if (isGridSnapModifierHeld(e) && doResizeLeft) {
                                const nonSnappedLeft = (e.rect.left - editorDivOffsetX) / uiScale;
                                const snappedLeft = snapCoordinate(nonSnappedLeft);
                                const snapDelta = snappedLeft - nonSnappedLeft;
                                e.target.style.left = `${(snappedLeft)}px`;
                                e.target.style.width = `${snapCoordinate((e.rect.width - snapDelta) / uiScale)}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeRight) {
                                e.target.style.width = `${snapCoordinate(e.rect.width / uiScale)}px`;
                            }
                            else {
                                e.target.style.left = `${(e.rect.left - editorDivOffsetX) / uiScale}px`;
                                e.target.style.width = `${e.rect.width / uiScale}px`;
                            }

                            if (isGridSnapModifierHeld(e) && doResizeTop) {
                                const nonSnappedTop = (e.rect.top - editorDivOffsetY) / uiScale;
                                const snappedTop = snapCoordinate(nonSnappedTop);
                                const snapDelta = snappedTop - nonSnappedTop;
                                e.target.style.top = `${(snappedTop)}px`;
                                e.target.style.height = `${snapCoordinate((e.rect.height - snapDelta) / uiScale)}px`;
                            }
                            else if (isGridSnapModifierHeld(e) && doResizeBottom) {
                                e.target.style.height = `${snapCoordinate(e.rect.height / uiScale)}px`;
                            }
                            else {
                                e.target.style.top = `${(e.rect.top - editorDivOffsetY) / uiScale}px`;
                                e.target.style.height = `${e.rect.height / uiScale}px`;
                            }

                            updateBoundingBoxDisplayCoordinates(e.target);
                        },
                        end(e) {
                            const chocoWinDiv = document.getElementById(e.target.getAttribute('data-choco-win-id'));
                            chocoWinDiv.style.top = e.target.style.top;
                            chocoWinDiv.style.height = e.target.style.height;
                            chocoWinDiv.style.left = e.target.style.left;
                            chocoWinDiv.style.width = e.target.style.width;

                            const studioWindow = workspace.windows.find((w) => `win-${w.id}` == e.target.dataset.chocoWinId);
                            const chocoWindowDivId = `win-${studioWindow.id}`;

                            studioWindow.w = Math.round(chocoWinDiv.style.width.replace("px", ""));
                            studioWindow.h = Math.round(chocoWinDiv.style.height.replace("px", ""))

                            studioWindow.x = Math.round(chocoWinDiv.style.left.replace("px", ""));
                            studioWindow.y = Math.round(chocoWinDiv.style.top.replace("px", ""))

                            if (onWorkspaceChange) onWorkspaceChange(workspace);

                            const preset = studioWindow.singularPreset || workspace.presets.find((ps) => ps.id == studioWindow.presetId);
                            if (!preset) return;

                            const tileSetDefintiion = workspace.tileSetDefinitions.find((tsd) => tsd.id == preset.tileSetDefinitionId);
                            if (!tileSetDefintiion) return;

                            const tileSheet = workspace.tileSheets.find((ts) => ts.id == tileSetDefintiion.tileSheetId);
                            if (!tileSheet) return;

                            const tileSet = tileSetDefintiion.toChocoWinTileSet(tileSheet.imageDataUrl);
                            if (!tileSet) return;

                            drawSingleWindow({
                                chocoWindowDivId: chocoWindowDivId,
                                preset: preset,
                                studioWindow: studioWindow,
                                tileSet: tileSet,
                            });

                            // // this will cause an error! Wheeeee! So this now takes a reader factory. there's probably more optimization that can be done, but here's where at least that change needs to happen
                            // // const renderWindow = new ChocoWinWindow(tileSetDefinition, preset.tileScale, 0, 0, studioWindow.w, studioWindow.h, preset.substituteColors);
                            // const renderWindow = new ChocoWinWindow({
                            //     colorSubstitutions: preset.colorSubstitutions,
                            //     readerFactory: readerFactory,
                            //     w: studioWindow.w,
                            //     h: studioWindow.h,
                            //     x: studioWindow.x,
                            //     y: studioWindow.y,
                            //     tileScale: preset.tileScale,
                            //     winTileSet: tileSet
                            // });
                            // renderWindow.isReady().then(() => {
                            //     // creating these windows should be moved to ouside this area and they should be pre-filled with a loading thing
                            //     // that way, the logic for drawing into the divs can be isoalted and reused
                            //     // also rename window to ChocoWindowRenderer, since it's not a window
                            //     const canvas = document.createElement("canvas");
                            //     const ctx = canvas.getContext("2d", { willReadFrequently: true });
                            //     canvas.width = studioWindow.w;
                            //     canvas.height = studioWindow.h;

                            //     const styleSheet = styleRef.current.sheet;
                            //     renderWindow.drawTo(ctx);
                            //     const imageData = canvas.toDataURL();
                            //     const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                            //         /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.cssRules);
                            //     const oldRuleInx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                            //     if (oldRuleInx >= 0) {
                            //         styleSheet.deleteRule(oldRuleInx);
                            //     }

                            //     styleSheet.insertRule(newRule);
                            // });
                        },
                    }
                })
        }

        if (workspace) {
            const /** @type { ChocoStudioWorkspace } */ ws = workspace;
            graphicalEditorDivRef.current.style.width = `${ws.width}px`;
            graphicalEditorDivRef.current.style.height = `${ws.height}px`;
            const /** @type { ChocoStudioLayout } */ layout = ws.layouts.filter((l) => editorLayoutId == l.id)[0] || ws.layouts[0];

            if (graphicalEditorDivRef.current && styleRef.current && layout) {
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

                    graphicalEditorDivRef.current.appendChild(chocoWinDiv);

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

                    graphicalEditorDivRef.current.append(boundingBoxDiv);

                    boundingBoxDiv.onclick = makeChocoWinBoundingBoxActive;

                    if (studioWindow) {
                        const preset = studioWindow.singularPreset || ws.presets.find((ps) => ps.id == studioWindow.presetId);
                        if (!preset) return;

                        const tileSetDefintiion = ws.tileSetDefinitions.find((tsd) => tsd.id == preset.tileSetDefinitionId);
                        if (!tileSetDefintiion) return;

                        const tileSheet = ws.tileSheets.find((ts) => ts.id == tileSetDefintiion.tileSheetId);
                        if (!tileSheet) return;

                        const tileSet = tileSetDefintiion.toChocoWinTileSet(tileSheet.imageDataUrl);
                        if (!tileSet) return;

                        drawSingleWindow({
                            chocoWindowDivId: chocoWindowDivId,
                            preset: preset,
                            studioWindow: studioWindow,
                            tileSet: tileSet,
                        }).then(() => {
                            makeDraggable(boundingBoxDiv);
                        });

                        // const renderWindow = new ChocoWinWindow(tileSetDefinition, preset.tileScale, 0, 0, studioWindow.w, studioWindow.h, preset.substituteColors);
                        // renderWindow.isReady().then(() => {
                        //     // creating these windows should be moved to ouside this area and they should be pre-filled with a loading thing
                        //     // that way, the logic for drawing into the divs can be isoalted and reused
                        //     // also rename window to ChocoWindowRenderer, since it's not a window

                        //     const styleSheet = styleRef.current.sheet;
                        //     renderWindow.drawTo(ctx);
                        //     const imageData = canvas.toDataURL();
                        //     const newRule = `#${chocoWindowDivId} { background-image: url(${imageData}) }`;

                        //         /** @type {Array<CSSStyleRule>} */ const ruleArray = Array.from(styleSheet.cssRules);
                        //     const oldRuleInx = ruleArray.findIndex((r) => r.selectorText == `#${chocoWindowDivId}`);

                        //     if (oldRuleInx >= 0) {
                        //         styleSheet.deleteRule(oldRuleInx);
                        //     }

                        //     styleSheet.insertRule(newRule);

                        //     makeDraggable(boundingBoxDiv);
                        // });
                    }
                })
            }
        }

        return () => {
            document.removeEventListener("keydown", keydownListener);
        }

    }, [workspace, editorLayoutId]);

    useEffect(() => {
        if (lastResizeTimestamp) {
            resizeEditorDiv();
        }
    }, [lastResizeTimestamp])

    return (
        <div id='graphical-editor-div' ref={graphicalEditorDivRef}>
            <style ref={styleRef}></style>
        </div>
    );
};
export default GraphicalEditor;