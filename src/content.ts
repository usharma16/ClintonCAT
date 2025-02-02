import { DOMHelper } from './domhelper';

void chrome.runtime.sendMessage({
    domain: window.location.hostname,
    url: window.location.href,
});
DOMHelper.registerContentListener();
