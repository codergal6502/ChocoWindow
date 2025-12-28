import { useState } from 'react';
import './App.css';
import SettingsFloater from './components/SettingsFloater';
import SettingsModal from './components/SettingsModal';

const App = () => {

  const [isModalHidden, setIsModalHidden] = useState(true);

  const openModalOnClick = () => {
    setIsModalHidden(false);
  }

  return (
    <div>
      <SettingsFloater onGearClick={openModalOnClick} />
      { isModalHidden === false ? <SettingsModal isModalHidden={isModalHidden} /> : "" }
    </div>
  );
};

export default App;
