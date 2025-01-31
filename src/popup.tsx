import React from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";

const Popup: React.FC = () => {

    const toggleEnabled = () => {
        // TODO
    };

    const openCATPage = () => {
        // TODO:
    };
    const openOpenOptionsPage = () => {
        chrome.runtime.openOptionsPage();
    };

    return (
        <div className="popup-container">
            <h2>ClintonCAT</h2>
            <button className="popup-button" onClick={() => toggleEnabled()}>
                Toggle On/Off
            </button>
            <button className="popup-button" onClick={() => openCATPage()}>
                Open CAT page
            </button>
            <button className="popup-button" onClick={() => openOpenOptionsPage()}>
                Go to Options
            </button>
        </div>
    );
};


const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup/>
    </React.StrictMode>
);