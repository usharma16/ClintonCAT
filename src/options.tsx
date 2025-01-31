import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import {Preferences} from "./storage";
import "./options.css";

const Options: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        setItems(Preferences.domainExclusions);
    }, []);

    const addItem = () => {
        if (input.trim() !== "") {
            setItems([...items, input]);
            Preferences.domainExclusions = items;
            setInput("");
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
        Preferences.domainExclusions = items;
    };

    const clearList = () => {
        Preferences.domainExclusions = [];
        setItems([]);
    };

    return (
        <div className="container">
            <h2>Excluded Domains</h2>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a string"
                className="input-field"
            />
            <button onClick={clearList} className="btn clear-btn">Clear All</button>
            <button onClick={addItem} className="btn">Add</button>

            <ul className="list">
                {items.map((item, index) => (
                    <li key={index} className="list-item">
                        {item}
                        <button onClick={() => removeItem(index)} className="remove-btn">
                            ❌
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Options/>
    </React.StrictMode>
);