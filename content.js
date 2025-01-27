const currentDomain = window.location.hostname;
chrome.runtime.sendMessage({ domain: currentDomain });
