import { useState } from 'react';
import './App.css';
import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';

const App = () => {

  const [isModalHidden, setIsModalHidden] = useState(true);

  const openModalOnClick = () => {
    setIsModalHidden(false);
  }

  const onModalReturn = (workspace) => {
    console.log('canvas got', workspace)
    setIsModalHidden(true);
  }

  return (
    <div>
      <SettingsFloater onGearClick={openModalOnClick} />
      { isModalHidden || <SettingsModal isModalHidden={isModalHidden} onReturnToCanvas={onModalReturn} />}
    </div>
  );
};

export default App;
