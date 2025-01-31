import {Preferences} from './storage'
import {PageResults, PagesDB} from "./database";
import {DomainTools} from "./domaintools";

const pagesDatabase = new PagesDB();
const domainTools = new DomainTools();


function onInstalled() : void {
  console.log("ClintonCAT Extension Installed");
  Preferences.initDefaults().then(() => {console.log(Preferences.toString())});
}

function indicateDisabled() {
  console.log("CAT is loafing (disabled)");
  indicateCATEntries(0);
}


function processFoundPages(pages: PageResults) {
  if (pages.numPages > 0) {
    indicateCATEntries(pages.numPages);
  }
  // TODO update popup, e.g. pages.pageUrls[0];
}


async function indicateCATEntries(num: number) :Promise<void> {
  let badgeText: string = Preferences.isEnabled ? "on" : "off";

  if (num > 0) {
    badgeText = `${num}`;
  }
  chrome.action.setBadgeText( {text: badgeText} );
}


function onBadgeTextUpdate(text: string) : void {
  chrome.action.setBadgeText({ text: text });
}


function onPageLoaded(domain: string) : void {

  const mainDomain = domainTools.extractMainDomain(domain);
  console.log("Main domain: " + mainDomain);

  if (domainTools.isDomainExcluded(Preferences.domainExclusions, domain)) {
    console.log("Excluded domain: " + mainDomain);
    return;
  }

  pagesDatabase.getPagesForDomain(mainDomain).then((results) => {
      processFoundPages(results);
  });
}



function onMessage(message : any, sender: chrome.runtime.MessageSender, sendResponse : any): void  {

  if (message.badgeText) {
    onBadgeTextUpdate(message.badgeText);
  } else if (!Preferences.isEnabled) {
    indicateDisabled();
  } else if (message.domain) {
    onPageLoaded(message.domain);
  }
}


// Register with Chrome event handlers
chrome.runtime.onInstalled.addListener(onInstalled);
chrome.runtime.onMessage.addListener(onMessage);
