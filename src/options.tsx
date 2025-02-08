import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Preferences } from './storage';
import './options.css';

const Options: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [input, setInput] = useState('');
    Preferences.init();
    Preferences.domainExclusions.addListener('exclude-options', (result: string[]) => {
        setItems([...result]); // Forces UI update: https://stackoverflow.com/questions/69836737/react-state-is-not-updating-the-ui
    });

    useEffect(() => {
        setItems(Preferences.domainExclusions.value);
    }, []);

    const addItem = () => {
        if (input.trim() !== '') {
            Preferences.domainExclusions.add(input.trim());
            setInput('');
        }
    };

    const removeItem = (index: number) => {
        Preferences.domainExclusions.deleteAt(index);
    };

    const clearList = () => {
        Preferences.domainExclusions.value = [];
    };

    return (
        <div className="container">
            <h2>Excluded Domains</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                }}
                placeholder="Enter a string"
                className="input-field"
            />
            <button onClick={clearList} className="btn clear-btn">
                Clear All
            </button>
            <button onClick={addItem} className="btn">
                Add
            </button>

            <ul className="list">
                {items.map((item, index) => (
                    <li key={index} className="list-item">
                        {item}
                        <button
                            onClick={() => {
                                removeItem(index);
                            }}
                            className="remove-btn">
                            ❌
                        </button>
                    </li>
                ))}
            </ul>
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
