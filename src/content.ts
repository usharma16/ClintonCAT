import { ContentScanner } from './contentscanner';

void chrome.runtime.sendMessage({
    domain: window.location.hostname,
    url: window.location.href,
});
ContentScanner.init();
