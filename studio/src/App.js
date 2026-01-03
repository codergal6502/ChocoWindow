import { useState } from 'react';
import './App.css';
import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';
import ChocoWinCanvas from './components/ChocoWInCanvas';
import { ChocoStudioWorkspace } from './ChocoStudio';
import { ChocoWinSettings } from './ChocoWindow';

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

  const [isModalHidden, setIsModalHidden] = useState(true);
  const [workspace, setWorkspace] = useState(initialWorkspace());

  const doSetWorkspace = (modifiedWorkspace) => {
    setWorkspace(modifiedWorkspace)
    storeWorkspaceToCookie(modifiedWorkspace);
  }

  const openModalOnClick = () => {
    setIsModalHidden(false);
  }

  const onWorkspaceChange = (modifiedWorkspace) => {
    doSetWorkspace(new ChocoStudioWorkspace(modifiedWorkspace));
  }

  const onModalReturn = () => {
    setIsModalHidden(true);
  }

  const onWorkspaceInstanceModified = () => { }

  return (
    <div id="app-div">
      <SettingsFloater onGearClick={openModalOnClick} />
      {isModalHidden || <SettingsModal isModalHidden={isModalHidden} onReturnToCanvas={onModalReturn} onWorkspaceChange={onWorkspaceChange} workspace={workspace} />}
      <ChocoWinCanvas workspace={workspace} onWorkspaceInstanceModified={onWorkspaceInstanceModified} onWorkspaceChange={onWorkspaceChange} />
    </div>
  );
};

export default App;
