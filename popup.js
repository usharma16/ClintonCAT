import { OPTIONS_DOMAIN_EXCLUSIONS, ALLOW_SITE, EXCLUDE_SITE } from "./constants.js";

let appDisabled = false;

// get initial appDisabled
chrome.storage.sync.get(
    null,
    (items) => {
        if (typeof items?.appDisabled === "boolean") {
            appDisabled = items.appDisabled;
        }
    },
);

const buttonEle = document.getElementById("on-off-toggle");

buttonEle.addEventListener("click", () => {
    const newAppDisabled = !appDisabled;
    appDisabled = newAppDisabled;

    chrome.storage.sync.set({ appDisabled: newAppDisabled });
    chrome.runtime.sendMessage({ badgeText: newAppDisabled ? "off" : "on" });
});

document.getElementById("optionsButton").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab && currentTab.url) {
            const mainDomain = getMainDomain(currentTab.url);
            if (mainDomain) {
                chrome.storage.sync.get([OPTIONS_DOMAIN_EXCLUSIONS], (result) => {
                    console.log("Loaded domain_exclusions:", result[OPTIONS_DOMAIN_EXCLUSIONS]);
                    const exclusions = result[OPTIONS_DOMAIN_EXCLUSIONS] || [];
                    showCurrentDomain(mainDomain, exclusions);
                });
            }
        } else {
            console.error("No active tab or URL available");
        }
    });
});

function showCurrentDomain(currentDomain, exclusionList) {
    const domainDisplay = document.createElement("p");
    domainDisplay.textContent = `Current Domain: ${currentDomain}`;
    document.body.appendChild(domainDisplay);
    const button = document.createElement("button");
    button.setAttribute("id", "switchStateButton");
    if (exclusionList.includes(currentDomain)) 
        button.textContent = ALLOW_SITE;
    
    else 
        button.textContent = EXCLUDE_SITE;
        
    button.addEventListener("click", () => { handleButtonClick(currentDomain, exclusionList) });
    document.body.appendChild(button);
}
  
function getMainDomain(url) {
    try {
        const hostname = new URL(url).hostname; 
        const parts = hostname.split(".");

        if (parts.length > 2) 
            return parts[parts.length - 2]; 
        
        return parts[0];
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}

function handleButtonClick(currentDomain, exclusionList) {
    const button = document.getElementById("switchStateButton");
    if (button) {
        if (button.textContent === ALLOW_SITE) {
            const updatedExclusions = exclusionList.filter((item) => item !== currentDomain);
            chrome.storage.sync.set({ [OPTIONS_DOMAIN_EXCLUSIONS]: updatedExclusions }, () => {
                console.log("Exclusions updated:", updatedExclusions);
            });
            button.textContent = EXCLUDE_SITE;
        } else {
            exclusionList.push(currentDomain);
            chrome.storage.sync.set({ [OPTIONS_DOMAIN_EXCLUSIONS]: exclusionList }, () => {
                console.log("Exclusions updated:", exclusionList);
            });
            button.textContent = ALLOW_SITE;
        }    
    }
}
