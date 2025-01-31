const STATE_OPEN_DOMAINS = "open_domains";
import {Preferences} from './storage'
import {PagesDB} from "./database";

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




function openBackgroundTab(url: string) {
  chrome.tabs.create({ url: url, active: false }, (tab) => {
  });
}

function openTabIfNotExists(url: string) {
  // Query all tabs to find if the URL is already open
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url === url);
    if (!existingTab) {
      openBackgroundTab(url);
    }
  });
}


function foundCATEntry(url: string) {
  openTabIfNotExists(url);
}



function isDomainExcluded(exclusions : string[], domain : string) :boolean  {
  if (exclusions == null) {
    return false;
  }
  return exclusions.some((excludedDomain: string) => domain.includes(excludedDomain));
}

async function getOpenDomains(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STATE_OPEN_DOMAINS, (result) => {
      console.log("Open domains: ", result[STATE_OPEN_DOMAINS] );
      resolve(result[STATE_OPEN_DOMAINS] || []);
    });
  });
}

async function saveOpenDomains(domainName: string) :Promise<void> {
  let openDomains: string[] = await getOpenDomains();

  if (!openDomains.includes(domainName)) {
    openDomains.push(domainName);
    chrome.storage.local.set({ [STATE_OPEN_DOMAINS]: openDomains});
  }
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

      // Block multiple tab openings due to multiple windows and potentially multiple async 'onMessage' invocations
      // TODO: need to remove domains when tabs/windows close.
      //       or somehow add state to the tabs we open and search that instead for supressing dupes
      const openDomains = await getOpenDomains();
      if (openDomains.includes(mainDomain)) {
        return;
      } else {
        saveOpenDomains(currentDomain);
      }

      pagesDatabase.getPagesForDomain(mainDomain).then((results) => {
        if (results.numPages > 0) {
          indicateCATEntries(results.numPages);
          foundCATEntry(results.pageUrls[0]);
        }
      });
    }
  })();
});

