const STATE_OPEN_DOMAINS = "open_domains";
import {Preferences} from './storage'

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
  Preferences.initDefaults();
});


const WIKI_URL="https://wiki.rossmanngroup.com/wiki";

const PAGES_DB_JSON_URL = "https://raw.githubusercontent.com/WayneKeenan/ClintonCAT/refs/heads/main/pages_db.json";
const UPDATE_ALARM_NAME = "updatePagesDB";
const CACHE_KEY = "cachedPagesDB";
const CACHE_TIMESTAMP_KEY = "cachedPagesDBTimestamp";
const FETCH_INTERVAL_MINUTES = 30; // Fetch every 30 minutes
const FETCH_INTERVAL_MS = FETCH_INTERVAL_MINUTES * 60 * 1000;

interface DomainResults {
  numPages: number;
  pageUrls: string[];
}




async function fetchJson(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error(`Failed to fetch JSON: ${error.message}`);
    throw error;
  }
}

async function isCacheStale(epoch = Date.now()) {
  // Get the last update timestamp
  const { [CACHE_TIMESTAMP_KEY]: lastUpdated } = await chrome.storage.local.get(CACHE_TIMESTAMP_KEY);

  if (!lastUpdated) {
    return true;
  }
  return epoch - lastUpdated >= FETCH_INTERVAL_MS
}

async function saveCache(data: string, timestamp: number = Date.now()) {
  await chrome.storage.local.set({ [CACHE_KEY]: data, [CACHE_TIMESTAMP_KEY]: timestamp });
}

// Function to fetch and cache the pages database
async function updatePagesDB(force = false) {
  try {
    const now = Date.now();
    const needsUpdate = force || await isCacheStale(now);
    if (!needsUpdate) {
      console.log("Skipping update: Cache TTL not reached.");
    }

    console.log("Fetching updated pages database...");
    const jsonData = await fetchJson(PAGES_DB_JSON_URL);
    await saveCache(jsonData, now);

    console.log("Pages database updated successfully.");
  } catch (error: any) {
    console.error(`Failed to update pages database: ${error.message}`);
  }
}

// Function to get the cached pages database
async function getCachedPagesDB() {
  const { [CACHE_KEY]: pagesDb } = await chrome.storage.local.get(CACHE_KEY);
  return pagesDb || [];
}

// Alarm to trigger periodic updates
chrome.alarms.create(UPDATE_ALARM_NAME, { periodInMinutes: FETCH_INTERVAL_MINUTES });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === UPDATE_ALARM_NAME) {
    updatePagesDB();
  }
});

// Initial fetch on extension load
updatePagesDB();

function fuzzySearch(query: string, arr: string[]) {
  const lowerQuery = query.toLowerCase();
  return arr.filter((item: string) => item.toLowerCase().includes(lowerQuery));
}



async function getPagesForDomain(domain: string) :Promise<DomainResults> {

  const pagesDB: string[] = await getCachedPagesDB();
  let pages: string[] =  fuzzySearch(domain, pagesDB);

  console.log("Pages fuzzy search result: ", pages);

  let result: DomainResults= {
    numPages: 0,
    pageUrls: [],
  };

  if (pages && pages.length > 0) {
      const pageUrl: string = `${WIKI_URL}/${encodeURIComponent(pages[0])}`;
      result.numPages = pages.length;
      result.pageUrls = [pageUrl];
  }

  return result;
}




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

      getPagesForDomain(mainDomain).then((results) => {
        if (results.numPages > 0) {
          indicateCATEntries(results.numPages);
          foundCATEntry(results.pageUrls[0]);
        }
      });
    }
  })();
});

