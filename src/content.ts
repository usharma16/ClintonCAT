import {Preferences} from './storage'
const currentDomain = window.location.hostname;
chrome.runtime.sendMessage({ domain: currentDomain });
Preferences.refresh().then(r => { console.log(Preferences.toString())});