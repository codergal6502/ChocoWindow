import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleDown, faCircleLeft, faCircleRight, faCircleUp, faGear } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';

const SettingsFloater = ({ onGearClick }) => {
    const Positions = Object.freeze({
        TOP_LEFT:     'TOP_LEFT',
        TOP_RIGHT:    'TOP_RIGHT',
        BOTTOM_LEFT:  'BOTTOM_LEFT',
        BOTTOM_RIGHT: 'BOTTOM_RIGHT',
    });

    const Directions = Object.freeze({
        UP:    'UP',
        RIGHT: 'RIGHT',
        DOWN:  'DOWN',
        LEFT:  'LEFT',
    });

    const PositionClassNames = Object.freeze({
        TOP_LEFT:     'left-0 top-0 -ml-8 -mt-8',
        TOP_RIGHT:    'right-0 top-0 -mr-8 -mt-8',
        BOTTOM_LEFT:  'left-0 bottom-0 -ml-8 -mb-8',
        BOTTOM_RIGHT: 'right-0 bottom-0 -mr-8 -mb-8',
    });

    const MovementMap = Object.freeze({
        TOP_LEFT: Object.freeze({
            RIGHT: Positions.TOP_RIGHT,
            DOWN: Positions.BOTTOM_LEFT
        }),
        TOP_RIGHT: Object.freeze({
            LEFT: Positions.TOP_LEFT,
            DOWN: Positions.BOTTOM_RIGHT
        }),
        BOTTOM_LEFT: Object.freeze({
            RIGHT: Positions.BOTTOM_RIGHT,
            UP: Positions.TOP_LEFT
        }),
        BOTTOM_RIGHT: Object.freeze({
            LEFT: Positions.BOTTOM_LEFT,
            UP: Positions.TOP_RIGHT
        }),
    })

    let [position, setPosition] = useState(Positions.TOP_LEFT);
    let [positionClassNames, setPositionClassNames] = useState(PositionClassNames.TOP_LEFT);

    const onArrowClick = (direction) => {
        let newPosition = MovementMap[position][direction];
        let newPositionClassNames = PositionClassNames[newPosition];

        setPosition(newPosition);
        setPositionClassNames(newPositionClassNames);
    }

    const onLeftArrowClick  = () => { onArrowClick(Directions.LEFT);  }
    const onRightArrowClick = () => { onArrowClick(Directions.RIGHT); }
    const onUpArrowClick    = () => { onArrowClick(Directions.UP);    }
    const onDownArrowClick  = () => { onArrowClick(Directions.DOWN);  }

    return (
        <div id="settingsGearContainer" className={`absolute ${positionClassNames} w-32 h-32 rounded-lg flex flex-col items-center justify-center z-20 dark:text-white`}>
            <button id="settingsSlideUp"   onClick={onUpArrowClick} className="mb-auto text-3xl opacity-25 hover:opacity-75"><FontAwesomeIcon icon={faCircleUp} /></button>
            <button id="settingsButton"    onClick={onGearClick} className="text-6xl opacity-25 hover:opacity-75"><FontAwesomeIcon icon={faGear} /></button>
            <button id="settingsSlideDown" onClick={onDownArrowClick} className="mt-auto text-3xl opacity-25 hover:opacity-75"><FontAwesomeIcon icon={faCircleDown} /></button>

            <div className="absolute left-0 right-0 flex justify-between w-full">
                <button id="settingsSlideLeft" onClick={onLeftArrowClick} className="text-3xl opacity-25 hover:opacity-75"><FontAwesomeIcon icon={faCircleLeft} /></button>
                <button id="settingsSlideRight" onClick={onRightArrowClick} className="text-3xl opacity-25 hover:opacity-75"><FontAwesomeIcon icon={faCircleRight} /></button>
            </div>
        </div>
    );
}

export default SettingsFloater;
