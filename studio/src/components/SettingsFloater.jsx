import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faAnglesUp, faCircleLeft, faCircleRight, faDownload, faGear, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';

const SettingsFloater = ({ onGearClick, onSelectLayoutClick }) => {
    const Positions = Object.freeze({
        LEFT: 'LEFT',
        RIGHT: 'RIGHT',
        CENTER: 'CENTER',
        OPEN: 'OPEN'
    });

    const [currentPosition, setCurrentPosition] = useState(Positions.CENTER);
    const [lastClosedPosition, setLastClosedPosition] = useState(Positions.CENTER);

    const onSettingLeftClick = () => {
        if (currentPosition == Positions.LEFT) {
            // No-op; can't go further left.
        }
        else if (currentPosition == Positions.CENTER) {
            setCurrentPosition(Positions.LEFT);
        }
        else if (currentPosition == Positions.RIGHT) {
            setCurrentPosition(Positions.CENTER);
        }
        else {
            setCurrentPosition(Positions.CENTER);
        }
    }

    const onSettingRightClick = () => {
        if (currentPosition == Positions.LEFT) {
            setCurrentPosition(Positions.CENTER);
        }
        else if (currentPosition == Positions.CENTER) {
            setCurrentPosition(Positions.RIGHT);
        }
        else if (currentPosition == Positions.RIGHT) {
            // No-op; can't go further right.
        }
        else {
            setCurrentPosition(Positions.CENTER);
        }
    }

    const onSettingsOpenClick = () => {
        setLastClosedPosition(currentPosition);
        setCurrentPosition(Positions.OPEN);
    }

    const onCloseMenuClick = () => {
        setCurrentPosition(lastClosedPosition);
    }

    return (
        <>
            <div id="center-settings-container" className={`${(currentPosition == Positions.CENTER) || "hidden"} top-0 ml-auto mr-auto w-[5em] bg-gray-500 opacity-50 rounded-b-lg relative z-20 text-black dark:text-white hover:opacity-75`}>
                <button onClick={onSettingLeftClick} className="m-1 absolute left-0 text-xl opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faCircleLeft} /></button>
                <button onClick={onSettingRightClick} className="m-1 absolute right-0 text-xl opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faCircleRight} /></button>
                <div className='text-center'>
                    <button onClick={onSettingsOpenClick} className="text-xl m-1 opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faAnglesDown} /></button>
                </div>
            </div>
            <div id="left-settings-container" className={`${(currentPosition == Positions.LEFT) || "hidden"} top-0 left-0 w-[4em] bg-gray-500 opacity-25 rounded-b-lg absolute z-20 text-black dark:text-white hover:opacity-75`}>
                <button onClick={onSettingRightClick} className="m-1 absolute right-0 text-xl opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faCircleRight} /></button>
                <div className='text-left'>
                    <button onClick={onSettingsOpenClick} className="text-xl m-1 opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faAnglesDown} /></button>
                </div>
            </div>
            <div id="right-settings-container" className={`${(currentPosition == Positions.RIGHT) || "hidden"} top-0 right-0 w-[4em] bg-gray-500 opacity-25 rounded-b-lg absolute z-20 text-black dark:text-white hover:opacity-75`}>
                <button onClick={onSettingLeftClick} className="m-1 absolute left-0 text-xl opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faCircleLeft} /></button>
                <div className='text-right'>
                    <button onClick={onSettingsOpenClick} className="text-xl m-1 opacity-75 hover:opacity-100"><FontAwesomeIcon icon={faAnglesDown} /></button>
                </div>
            </div>
            <div id="settings-tray" className={`${(currentPosition == Positions.OPEN) || "hidden"} text-center top-0 ml-auto mr-auto w-[45em] bg-gray-500 opacity-75 rounded-b-lg relative z-20 text-black dark:text-white`}>
                <div className="flex justify-around items-center w-full p-2">
                    <button className="flex flex-col items-center ml-2 w-[12em]" onClick={onGearClick}>
                        <FontAwesomeIcon className="text-3xl" icon={faGear} />
                        <div>Configuration</div>
                    </button>
                    <button className="flex flex-col items-center w-[12em]" onClick={onSelectLayoutClick}>
                        <FontAwesomeIcon className="text-3xl" icon={faPenToSquare} />
                        <div>Select Layout</div>
                    </button>
                    <button className="flex flex-col items-center mr-2 w-[12em]">
                        <FontAwesomeIcon className="text-3xl" icon={faDownload} />
                        <div>Download Layout PNG</div>
                    </button>
                    <button className="flex flex-col items-center mr-2 w-[12em]" onClick={onCloseMenuClick}>
                        <FontAwesomeIcon className="text-3xl" icon={faAnglesUp} />
                        <div>Close Menu</div>
                    </button>
                </div>
            </div>
        </>
    );
}

export default SettingsFloater;
