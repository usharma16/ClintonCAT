import { DOMHelper } from './domhelper';

DOMHelper.registerMessageListener();

void chrome.runtime.sendMessage({
    domain: window.location.hostname,
    url: window.location.href,
});
