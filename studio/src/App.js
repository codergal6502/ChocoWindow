import './App.css';

import { useEffect, useState } from 'react';

import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';
import GraphicalEditor from './components/GraphicalEditor';
import LayoutPickerModal from './components/LayoutPickerModal';
import LayoutRenderResult from './components/LayoutRenderResult';

import { ChocoStudioWorkspace } from './ChocoStudio';
import { ChocoWinSettings } from './ChocoWindow';
import { ChocoWorkspaceRenderer } from './ChocoRender';
import { ChocoStudioUpgrader } from './ChocoStudioUpgrader';
import { ChocoWinPngJsPixelReaderFactory, ChocoWinPngJSPixelWriterFactory } from './ChocoWinPngJsReaderWriter';

const App = () => {
  ChocoWinSettings.ignoreScaleMisalignmentErrors = true;

  const WORKSPACE_COOKIE_NAME = 'workspace';

  const [isConfigModalHidden, setIsConfigModalHidden] = useState(true);
  const [isLayoutPickerModalHidden, setIsLayoutPickerModalHidden] = useState(true);
  const [editorLayoutId, setEditorLayoutId] = useState(null);
  const [modalWorkspace, setModalWorkspace] = useState(null);
  const [editorWorkspace, setEditorWorkspace] = useState(null);
  const [editorIgnoreKeyInputs, setEditorIgnoreKeyInputs] = useState(false);

  const [renderResultDataUrl, setRenderResultDataUrl] = useState(null);
  const [renderDownloadName, setRenderDownloadName] = useState(null);

  const [lastResizeTimestamp, setLastResizeTimestamp] = useState(null);

  const initialWorkspace = () => {
    try {
      const b64 = window.localStorage.getItem(WORKSPACE_COOKIE_NAME);
      if (b64) {
        const json = window.atob(b64);
        let obj = JSON.parse(json)

        if (obj.version != ChocoWinSettings.CURRENT_VERSION) {
          const upgraded = ChocoStudioUpgrader.AttemptUpgrade(obj);
          if (!upgraded) {
            alert("Could not upgrade the previous workspace. Please download your previous workspace, after which an empty workspace will be used.");

            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `${obj?.workspaceName ?? "workspace"}.choco.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            throw "Not continuing.";
          }
          obj = upgraded;
        }

        const ws = new ChocoStudioWorkspace(obj)

        return ws;
      }
      else {
        return null;
      }
    }
    catch (e) {
      console.error(e);
      alert('An unexpected error occurred; check the console log for details.')
    }

    return new ChocoStudioWorkspace();
  }

  useEffect(() => {
    const ws = initialWorkspace();
    if (ws) {
      setModalWorkspace(new ChocoStudioWorkspace(ws));
      setEditorWorkspace(new ChocoStudioWorkspace(ws));
    }
    else {
      setModalWorkspace(new ChocoStudioWorkspace(null));
      setEditorWorkspace(new ChocoStudioWorkspace(null));
      setIsConfigModalHidden(false);
    }
  }, [])

  const storeWorkspaceToCookie = (workspace) => {
    const json = JSON.stringify(workspace);
    const b64 = btoa(json);
    window.localStorage.setItem(WORKSPACE_COOKIE_NAME, b64);
  }

  const openModalOnClick = () => {
    setIsConfigModalHidden(false);
    setEditorIgnoreKeyInputs(true);
  }

  const onSelectLayoutClick = () => {
    setIsLayoutPickerModalHidden(false);
    setEditorIgnoreKeyInputs(true);
  }

  const onModalWorkspaceChange = (modifiedWorkspace) => {
    setModalWorkspace(modifiedWorkspace)
    storeWorkspaceToCookie(modifiedWorkspace);
  }

  const onModalReturn = (workspace, layoutId) => {
    setEditorIgnoreKeyInputs(false);
    setIsConfigModalHidden(true);
    setEditorWorkspace(new ChocoStudioWorkspace(workspace));
    if (layoutId) setEditorLayoutId(layoutId);
  }

  const onLayoutPickerReturn = (layoutId) => {
    setEditorIgnoreKeyInputs(false);
    if (layoutId) {
      setEditorLayoutId(layoutId);
    }
    setIsLayoutPickerModalHidden(true);
  }

  const onEditorWorkspaceChange = (modifiedWorkspace) => {
    modifiedWorkspace = new ChocoStudioWorkspace(modifiedWorkspace);
    setModalWorkspace(modifiedWorkspace);
    storeWorkspaceToCookie(modifiedWorkspace);
  }

  const onDownloadPngClick = () => {
    const /** @type {ChocoWorkspaceRenderer} */ renderer = new ChocoWorkspaceRenderer(editorWorkspace, new ChocoWinPngJSPixelWriterFactory(), new ChocoWinPngJsPixelReaderFactory());
    const layoutId = editorLayoutId || editorWorkspace.layouts[0].id;
    const downloadName = (editorWorkspace.layouts.find((l) => l.id == layoutId)?.name || "window") + ".png";
    setRenderDownloadName(downloadName);
    renderer.generateLayoutImageBlob(layoutId).then(blob => {
      if (renderResultDataUrl) {
        URL.revokeObjectURL(renderResultDataUrl);
      }
      const url = URL.createObjectURL(blob);
      setRenderResultDataUrl(url);
    });
  }

  const onRenderResultReturn = () => {
    if (renderResultDataUrl) {
      URL.revokeObjectURL(renderResultDataUrl);
    }
    setRenderResultDataUrl(null);
    setRenderDownloadName("");
  }

  let resizeTimeout;
  const onResize = () => {
    // This forces any components that need to resize to "get the message" as it were.
    // See https://stackoverflow.com/a/69136763/1102726.

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      setLastResizeTimestamp(Date.now());
    }, 125);
  }

  useEffect(() => {
    window.removeEventListener("resize", onResize);
    window.addEventListener("resize", onResize);
  }, []);

  return (
    modalWorkspace && editorWorkspace && <div id="app-div">
      <SettingsFloater onGearClick={openModalOnClick} onSelectLayoutClick={onSelectLayoutClick} onDownloadPngClick={onDownloadPngClick} />
      {isConfigModalHidden || <SettingsModal isModalHidden={isConfigModalHidden} onReturnToEditor={onModalReturn} onWorkspaceChange={onModalWorkspaceChange} workspace={modalWorkspace} lastResizeTimestamp={lastResizeTimestamp} />}
      {isLayoutPickerModalHidden || <LayoutPickerModal workspace={editorWorkspace} currentLayoutId={editorLayoutId} isModalHidden={isLayoutPickerModalHidden} onReturnToEditor={onLayoutPickerReturn} />}
      {renderResultDataUrl && <LayoutRenderResult isModalHidden={!renderResultDataUrl} dataUrl={renderResultDataUrl} downloadName={renderDownloadName} onReturnToEditor={onRenderResultReturn} />}
      <GraphicalEditor ignoreKeyInputs={editorIgnoreKeyInputs} workspace={editorWorkspace} onWorkspaceChange={onEditorWorkspaceChange} editorLayoutId={editorLayoutId} lastResizeTimestamp={lastResizeTimestamp} />
    </div>
  );
};

export default App;
