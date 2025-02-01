import { ContentScanner } from './contentscanner';

chrome.runtime.sendMessage({
    domain: window.location.hostname,
    url: window.location.href,
});
ContentScanner.init();
