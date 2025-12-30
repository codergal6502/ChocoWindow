import React, { useRef, useEffect } from 'react';
import interact from 'interactjs';

const ChocoWinCanvas = () => {
    useEffect(() => { // empty-dependency useEffect for on load
        const positions = {
            "40dd32d2-2b15-45f9-bc91-10e3516397d8": { x: 0, y: 0 },
            "17fbf734-92d8-4170-b40b-0b6669bb8709": { x: 0, y: 0 },
        };
        interact(".choco-win-draggable")
            .draggable({
                listeners: {
                    move(event) {
                        const id = event.target.id;

                        positions[id].x += event.dx
                        positions[id].y += event.dy

                        event.target.style.transform =
                            `translate(${positions[id].x}px, ${positions[id].y}px)`;
                    },
                }
            })
            .resizable({
                edges: { top: true, left: true, bottom: true, right: true },
                listeners: {
                    move: function (event) {
                        const id = event.target.id;
                        let { x, y } = event.target.dataset;

                        positions[id].x += (parseFloat(x) || 0) + event.deltaRect.left
                        positions[id].y += (parseFloat(y) || 0) + event.deltaRect.top

                        Object.assign(event.target.style, {
                            width: `${event.rect.width}px`,
                            height: `${event.rect.height}px`,
                            transform: `translate(${positions[id].x}px, ${positions[id].y}px)`
                        })

                        Object.assign(event.target.dataset, { x, y })
                    }
                }
            })
    }, []);

    return (
        <>
            <div id="40dd32d2-2b15-45f9-bc91-10e3516397d8" className='choco-win-draggable' data-x="0" data-y="0" style={{ position: "absolute", width: "120px", borderRadius: "8px", padding: "20px", margin: "1rem", backgroundColor: "#29e", color: "white", fontSize: "20px", fontFamily: "sans-serif", touchAction: "none", boxSizing: "border-box" }}>Drag & Resize 1</div>
            <div id="17fbf734-92d8-4170-b40b-0b6669bb8709" className='choco-win-draggable' data-x="0" data-y="0" style={{ position: "absolute", width: "120px", borderRadius: "8px", padding: "20px", margin: "1rem", backgroundColor: "#29e", color: "white", fontSize: "20px", fontFamily: "sans-serif", touchAction: "none", boxSizing: "border-box" }}>Drag & Resize 2</div>
        </>
    );
};
export default ChocoWinCanvas;