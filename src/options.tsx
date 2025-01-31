import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const Options = () => {
  const [color, setColor] = useState<string>("");

  useEffect(() => {
    chrome.storage.sync.get("color", (data) => {
      setColor(data.color || "blue");
    });
  }, []);

  const saveColor = () => {
    chrome.storage.sync.set({ color }, () => {
      alert("Color saved!");
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Options Page</h2>
      <label>Favorite Color:</label>
      <input type="text" value={color} onChange={(e) => setColor(e.target.value)} />
      <button onClick={saveColor}>Save</button>
    </div>
  );
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Options />);

