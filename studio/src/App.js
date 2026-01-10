import './App.css';

import { useEffect, useState } from 'react';

import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';
import Editor from './components/Editor';
import LayoutPickerModal from './components/LayoutPickerModal';
import LayoutRenderResult from './components/LayoutRenderResult';

import { ChocoStudioWorkspace } from './ChocoStudio';
import { ChocoWinSettings } from './ChocoWindow';
import { ChocoWorkspaceRenderer } from './ChocoRender';

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
      alert('An unexpected error occurred; check the console log for details.')
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
  const [editorLayoutId, setEditorLayoutId] = useState(null);
  const [modalWorkspace, setModalWorkspace] = useState(initialWorkspace());
  const [editorWorkspace, setEditorWorkspace] = useState(initialWorkspace());
  const [editorIgnoreKeyInputs, setEditorIgnoreKeyInputs] = useState(false);

  const [hasRenderResult, setHasRenderResult] = useState(false);
  const [renderResultDataUrl, setRenderResultDataUrl] = useState(null);
  const [renderDownloadName, setRenderDownloadName] = useState(null);

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
    setModalWorkspace(new ChocoStudioWorkspace(modifiedWorkspace));
    storeWorkspaceToCookie(modalWorkspace);
  }

  const onDownloadPngClick = () => {
    const /** @type {ChocoWorkspaceRenderer} */ renderer = new ChocoWorkspaceRenderer(editorWorkspace);
    const layoutId = editorLayoutId || editorWorkspace.layouts[0].id;
    const downloadName = (editorWorkspace.layouts.find((l) => l.id == layoutId)?.name || "window") + ".png";
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

  useEffect(() => {

  }, []);

  return (
    <div id="app-div">
      <SettingsFloater onGearClick={openModalOnClick} onSelectLayoutClick={onSelectLayoutClick} onDownloadPngClick={onDownloadPngClick} />
      {isConfigModalHidden || <SettingsModal isModalHidden={isConfigModalHidden} onReturnToEditor={onModalReturn} onWorkspaceChange={onModalWorkspaceChange} workspace={modalWorkspace} />}
      {isLayoutPickerModalHidden || <LayoutPickerModal workspace={editorWorkspace} currentLayoutId={editorLayoutId} isModalHidden={isLayoutPickerModalHidden} onReturnToEditor={onLayoutPickerReturn} />}
      {hasRenderResult && <LayoutRenderResult isModalHidden={!hasRenderResult} dataUrl={renderResultDataUrl} downloadName={renderDownloadName} onReturnToEditor={onRenderResultReturn} />}
      <Editor ignoreKeyInputs={editorIgnoreKeyInputs} workspace={editorWorkspace} onWorkspaceChange={onEditorWorkspaceChange} editorLayoutId={editorLayoutId} />
    </div>
  );
};

export default App;
