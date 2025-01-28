
document.addEventListener("DOMContentLoaded", () => {
    const exclusionInput = document.getElementById("domainExclusions");
    const addButton = document.getElementById("addButton");
    const exclusionList = document.getElementById("exclusionList");

    if (!exclusionInput || !addButton || !exclusionList) {
        console.error("One or more elements not found in DOM.");
        return;
    }

    // Load saved exclusions
    chrome.storage.sync.get(["domain_exclusions"], (result) => {
        console.log("Loaded domain_exclusions:", result.domain_exclusions);
        const exclusions = result.domain_exclusions || [];
        exclusions.forEach(addExclusionToUI);
    });

    // Add a site to the exclusion list
    addButton.addEventListener("click", () => {
        const url = exclusionInput.value.trim();
        console.log("Button clicked, input:", url);
        if (url) {
            chrome.storage.sync.get(["domain_exclusions"], (result) => {
                console.log("Retrieved exclusions:", result.domain_exclusions);
                const domain_exclusions = result.domain_exclusions || [];
                if (!domain_exclusions.includes(url)) {
                    domain_exclusions.push(url);
                    chrome.storage.sync.set({ domain_exclusions }, () => {
                        console.log("Exclusions updated:", domain_exclusions);
                        addExclusionToUI(url);
                    });
                } else {
                    console.log("URL already in exclusions list:", url);
                }
            });
        } else {
            console.log("No input provided.");
        }
        exclusionInput.value = "";
    });

    // Add exclusion to UI and allow removal
    function addExclusionToUI(url) {
        const li = document.createElement("li");
        li.textContent = url;
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.style.marginLeft = "10px";
        removeButton.addEventListener("click", () => {
            chrome.storage.sync.get(["domain_exclusions"], (result) => {
                console.log("Before removal exclusions:", result.domain_exclusions);
                const exclusions = result.domain_exclusions || [];
                const updatedExclusions = exclusions.filter((item) => item !== url);
                chrome.storage.sync.set({ domain_exclusions: updatedExclusions }, () => {
                    console.log("Removed exclusion:", url);
                    li.remove();
                });
            });
        });
        li.appendChild(removeButton);
        exclusionList.appendChild(li);
    }
});
