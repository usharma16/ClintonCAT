import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './options.css';
import Preferences from './Preferences';

Preferences.init();

const Options = () => {
    const [items, setItems] = useState<string[]>([]);
    const [domainInput, setDomainInput] = useState('');

    Preferences.domainExclusions.addListener('exclude-options', (result: string[]) => {
        setItems([...result]); // Forces UI update: https://stackoverflow.com/questions/69836737/react-state-is-not-updating-the-ui
    });

    useEffect(() => {
        setItems(Preferences.domainExclusions.value);
    }, []);

    const addItem = () => {
        if (domainInput.trim() === '') return;
        // TODO: update the StorageBackend or PreferenceStore
        Preferences.domainExclusions.add(domainInput.trim());
        setDomainInput('');
    };

    const removeItem = (index: number) => {
        // TODO: update the StorageBackend or PreferenceStore
        Preferences.domainExclusions.deleteAt(index);
    };

    const clearList = () => {
        // TODO: update the StorageBackend or PreferenceStore
        Preferences.domainExclusions.value = [];
    };

    return (
        <div className="options-page">
            <h1 className="page-title">Extension Options</h1>
            <div className="options-container">
                <div className="settings-column">
                    <h2 className="column-title">Excluded Domains</h2>
                    <div className="settings-container">
                        <div className="input-group">
                            <input
                                type="text"
                                value={domainInput}
                                onChange={(e) => setDomainInput(e.target.value)}
                                placeholder="Enter a domain"
                                className="input-field"
                            />
                            <button onClick={addItem} className="btn add-btn">
                                Add
                            </button>
                            <button onClick={clearList} className="btn clear-btn">
                                Clear
                            </button>
                        </div>
                    </div>
                    <ul className="excluded-list">
                        {items.map((item, index) => (
                            <li key={index} className="excluded-item">
                                <span>{item}</span>
                                <button onClick={() => removeItem(index)} className="remove-btn">
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="settings-column">
                    <h2 className="column-title">Other Settings</h2>
                    <div className="settings-container">
                        <p>TODO</p>
                        <label className="toggle-label">
                            <span>Enable Feature XYZ</span>
                            <input type="checkbox" />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

const rootElement: HTMLElement | null = document.getElementById('root');
if (rootElement instanceof HTMLElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <Options />
        </React.StrictMode>
    );
} else {
    throw Error('No root element was found');
}
