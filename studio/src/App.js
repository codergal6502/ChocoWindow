import { useState } from 'react';
import './App.css';
import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';
import ChocoWinCanvas from './components/ChocoWInCanvas';
import { ChocoStudioWorkspace } from './ChocoStudio';
import { ChocoWinSettings } from './ChocoWindow';
import LayoutPickerModal from './components/LayoutPickerModal';
import { ChocoWorkspaceRenderer } from './ChocoRender';
import LayoutRenderResult from './components/LayoutRenderResult';

const App = () => {
  ChocoWinSettings.ignoreScaleMisalignmentErrors = true;

  const WORKSPACE_COOKIE_NAME = 'workspace';

  const initialWorkspace = () => {
    try {
      const b64 = window.localStorage.getItem(WORKSPACE_COOKIE_NAME);
      if (b64) {
        const json = window.atob(b64);
        const obj = JSON.parse(json)
        const ws = new ChocoStudioWorkspace(obj)
        return ws;
      }
    }
    catch (e) {
      console.error(e);
      // alert('An unexpected error occurred; check the console log for details.')
    }

    return new ChocoStudioWorkspace();
  }

  const storeWorkspaceToCookie = (workspace) => {
    const json = JSON.stringify(workspace);
    const b64 = btoa(json);
    window.localStorage.setItem(WORKSPACE_COOKIE_NAME, b64);
  }

  const [isConfigModalHidden, setIsConfigModalHidden] = useState(true);
  const [isLayoutPickerModalHidden, setIsLayoutPickerModalHidden] = useState(true);
  const [canvasLayoutId, setCanvasLayoutId] = useState(null);
  const [modalWorkspace, setModalWorkspace] = useState(initialWorkspace());
  const [canvasWorkspace, setCanvasWorkspace] = useState(initialWorkspace());

  const [hasRenderResult, setHasRenderResult] = useState(false);
  const [renderResultDataUrl, setRenderResultDataUrl] = useState(null);
  const [renderDownloadName, setRenderDownloadName] = useState(null);

  const openModalOnClick = () => {
    setIsConfigModalHidden(false);
  }

  const onSelectLayoutClick = () => {
    setIsLayoutPickerModalHidden(false);
  }

  const onModalWorkspaceChange = (modifiedWorkspace) => {
    setModalWorkspace(modifiedWorkspace)
    storeWorkspaceToCookie(modifiedWorkspace);
  }

  const onModalReturn = (workspace, layoutId) => {
    setIsConfigModalHidden(true);
    setCanvasWorkspace(new ChocoStudioWorkspace(workspace));
    if (layoutId) setCanvasLayoutId(layoutId);
  }

  const onLayoutPickerReturn = (layoutId) => {
    if (layoutId) {
      setCanvasLayoutId(layoutId);
    }
    setIsLayoutPickerModalHidden(true);
  }

  const onCanvasWorkspaceChange = (modifiedWorkspace) => {
    setModalWorkspace(new ChocoStudioWorkspace(modifiedWorkspace));
    storeWorkspaceToCookie(modalWorkspace);
  }

  const onDownloadPngClick = () => {
    const /** @type {ChocoWorkspaceRenderer} */ renderer = new ChocoWorkspaceRenderer(canvasWorkspace);
    const layoutId = canvasLayoutId || canvasWorkspace.layouts[0].id;
    const downloadName = (canvasWorkspace.layouts.find((l) => l.id == layoutId)?.name || "window") + ".png";
    setRenderDownloadName(downloadName);
    renderer.generateLayoutImageDataUrl(layoutId, (dataUrl) => {
      setRenderResultDataUrl(dataUrl);
      setHasRenderResult(true);
    });
  }

  const onRenderResultReturn = () => {
    setHasRenderResult(false);
    setRenderResultDataUrl(null);
    setRenderDownloadName("");
  }

  return (
    <div id="app-div">
      <SettingsFloater onGearClick={openModalOnClick} onSelectLayoutClick={onSelectLayoutClick} onDownloadPngClick={onDownloadPngClick} />
      {isConfigModalHidden || <SettingsModal isModalHidden={isConfigModalHidden} onReturnToCanvas={onModalReturn} onWorkspaceChange={onModalWorkspaceChange} workspace={modalWorkspace} />}
      {isLayoutPickerModalHidden || <LayoutPickerModal workspace={canvasWorkspace} currentLayoutId={canvasLayoutId} isModalHidden={isLayoutPickerModalHidden} onReturnToCanvas={onLayoutPickerReturn} />}
      {hasRenderResult && <LayoutRenderResult isModalHidden={! hasRenderResult} dataUrl={renderResultDataUrl} downloadName={renderDownloadName} onReturnToCanvas={onRenderResultReturn} />}
      <ChocoWinCanvas workspace={canvasWorkspace} onWorkspaceChange={onCanvasWorkspaceChange} canvasLayoutId={canvasLayoutId} />
    </div>
  );
};

export default App;
