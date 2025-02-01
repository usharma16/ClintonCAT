import React from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

const Popup: React.FC = () => {
    const toggleEnabled = () => {
        // TODO
    };

    const openCATPage = () => {
        // TODO:
    };

    const allowThisSite = () => {
        // TODO:
    };

    const excludeThisSite = () => {
        // TODO:
    };

    const openOptionsPage = () => {
        void chrome.runtime.openOptionsPage();
    };

    return (
        <div className="popup-container">
            <h2>ClintonCAT</h2>
            <button
                className="popup-button"
                onClick={() => {
                    toggleEnabled();
                }}>
                Toggle On/Off
            </button>
            <button
                className="popup-button"
                onClick={() => {
                    openCATPage();
                }}>
                Open CAT page
            </button>
            <button
                className="popup-button"
                onClick={() => {
                    allowThisSite();
                }}>
                Allow this site
            </button>
            <button
                className="popup-button"
                onClick={() => {
                    excludeThisSite();
                }}>
                Exclude this site
            </button>
            <button
                className="popup-button"
                onClick={() => {
                    openOptionsPage();
                }}>
                Go to Options
            </button>
        </div>
    );
};

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement instanceof HTMLElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <Popup />
        </React.StrictMode>
    );
} else {
    throw Error('No root element was found');
}
