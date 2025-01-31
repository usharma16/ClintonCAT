import {Preferences} from './storage'
import {DomainResults, PagesDB} from "./database";

chrome.runtime.onInstalled.addListener(() => {
  console.log("ClintonCAT Extension Installed");
  Preferences.initDefaults().then(() => {console.log(Preferences.toString())});
});

const pagesDatabase = new PagesDB();

function extractMainDomain(hostname: string) {
  // TODO: https://publicsuffix.org
  const twoLevelTLDs = ['co.uk', 'gov.uk', 'com.au', 'org.uk', 'ac.uk'];

  const cleanHostname = hostname.replace(/^www\./, "");
  const parts = cleanHostname.split(".");

  for (let tld of twoLevelTLDs) {
    const tldParts = tld.split('.');
    if (
        parts.length > tldParts.length &&
        parts.slice(-tldParts.length).join('.') === tld
    ) {
      return parts.slice(-(tldParts.length + 1), -tldParts.length).join('.');
    }
  }

  // Default case for regular TLDs like .com, .net, etc.
  if (parts.length > 2) {
    return parts.slice(-2, -1)[0];
  } else {
    return parts[0];
  }
}


function isDomainExcluded(exclusions : string[], domain : string) :boolean  {
  if (exclusions == null) {
    return false;
  }
  return exclusions.some((excludedDomain: string) => domain.includes(excludedDomain));
}

function foundCATPages(pages: DomainResults) {
  indicateCATEntries(pages.numPages);
  // TODO indicate: pages.pageUrls[0];
}


async function indicateCATEntries(num: number) :Promise<void> {
  let badgeText: string = Preferences.isEnabled ? "on" : "off";

  if (num > 0) {
    badgeText = `${num}`;
  }
  chrome.action.setBadgeText( {text: badgeText} );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {

    if (message.badgeText) {
      chrome.action.setBadgeText({ text: message.badgeText });
    } else {
      await indicateCATEntries(0);
    }

    console.log("CAT is loafing?", Preferences.isEnabled);
    if (!Preferences.isEnabled) {
      await indicateCATEntries(0);
      return;
    }


    const currentDomain = message.domain;
    if (currentDomain) {
      // ignore excluded domains
      if ( isDomainExcluded(Preferences.domainExclusions, currentDomain) ){
        return;
      }

      const mainDomain = extractMainDomain(currentDomain);
      console.log("Main domain: " + mainDomain);

      pagesDatabase.getPagesForDomain(mainDomain).then((results) => {
        if (results.numPages > 0) {
          foundCATPages(results);
        }
      });
    }
  })();
});

