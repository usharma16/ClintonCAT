import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parse } from 'tldts';
import classNames from 'classnames';
import Preferences from '@/common/services/preferences';
import ChromeLocalStorage from '@/storage/chrome/chrome-local-storage';
import ChromeSyncStorage from '@/storage/chrome/chrome-sync-storage';
import * as styles from './Options.module.css';

Preferences.initDefaults(new ChromeSyncStorage(), new ChromeLocalStorage()).catch((error: unknown) =>
    console.error('Failed to initialize preferences:', error)
);

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
        const value = domainInput.trim();
        if (value === '') return;
        const parsedDomain = parse(value, { allowPrivateDomains: true });
        if (parsedDomain.domain !== null) {
            Preferences.domainExclusions.add(parsedDomain.domain.toLowerCase());
            setDomainInput('');
        }
    };

    const removeItem = (index: number) => {
        Preferences.domainExclusions.deleteAt(index);
    };

    const clearList = () => {
        Preferences.domainExclusions.value = [];
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key == 'Enter') {
            addItem();
        }
    };

    return (
        <div className={styles.optionsPage}>
            <h1 className={styles.pageTitle}>Extension Options</h1>
            <div className={styles.optionsContainer}>
                <div className={styles.settingsColumn}>
                    <h2 className={styles.columnTitle}>Excluded Domains</h2>
                    <div className={styles.settingsContainer}>
                        <div className={styles.inputGroup}>
                            <input
                                type="text"
                                value={domainInput}
                                onChange={(e) => setDomainInput(e.target.value)}
                                onKeyDown={(event) => onKeyDown(event)}
                                placeholder="Enter a domain"
                                className={styles.inputField}
                            />
                            <button onClick={addItem} className={classNames(styles.btn, styles.addBtn)}>
                                Add
                            </button>
                            <button onClick={clearList} className={classNames(styles.btn, styles.clearBtn)}>
                                Clear
                            </button>
                        </div>
                    </div>
                    <ul className={styles.excludedList}>
                        {items.map((item, index) => (
                            <li key={index} className={styles.excludedItem}>
                                <span>{item}</span>
                                <button onClick={() => removeItem(index)} className={styles.removeBtn}>
                                    &times;
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.settingsColumn}>
                    <h2 className={styles.columnTitle}>Other Settings</h2>
                    <div className={styles.settingsContainer}>
                        <p>TODO</p>
                        <label className={styles.toggleLabel}>
                            <span>Enable Feature XYZ</span>
                            <input type="checkbox" />
                            <span className={styles.toggleSlider} />
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
