import { Main } from './main';

const main = new Main();
chrome.runtime.onInstalled.addListener(() =>
    main.onBrowserExtensionInstalled(),
);
chrome.runtime.onMessage.addListener(
    (message: any, sender: chrome.runtime.MessageSender, sendResponse: any) =>
        main.onBrowserExtensionMessage(message, sender, sendResponse),
);
