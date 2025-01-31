import { OPTIONS_DOMAIN_EXCLUSIONS, STATE_OPEN_DOMAINS } from "./constants.js";

const WIKI_URL="https://wiki.rossmanngroup.com/wiki";

const PAGES_DB_JSON_URL = "https://raw.githubusercontent.com/WayneKeenan/ClintonCAT/refs/heads/main/pages_db.json";
const UPDATE_ALARM_NAME = "updatePagesDB";
const CACHE_KEY = "cachedPagesDB";
const CACHE_TIMESTAMP_KEY = "cachedPagesDBTimestamp";
const FETCH_INTERVAL_MINUTES = 30; // Fetch every 30 minutes
const FETCH_INTERVAL_MS = FETCH_INTERVAL_MINUTES * 60 * 1000;

console.log("initial load");
chrome.storage.local.set({ [STATE_OPEN_DOMAINS]: []});
chrome.storage.local.set({ appDisable: false});

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
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

async function saveCache(data, timestamp = Date.now()) {
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
  } catch (error) {
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

function fuzzySearch(query, arr) {
  const lowerQuery = query.toLowerCase();
  return arr.filter(item => item.toLowerCase().includes(lowerQuery));
}


async function getPagesForDomain(domain) {

  const pagesDB = await getCachedPagesDB();
  const pages =  fuzzySearch(domain, pagesDB);

  console.log("Pages fuzzy search result: ", pages);

  let result = {
    numPages: 0,
    pageUrls: [],
  };

  if (pages && pages.length > 0) {
      const pageUrl = `${WIKI_URL}/${encodeURIComponent(pages[0])}`;
      result.numPages = pages.length;
      result.pageUrls = [pageUrl];
  }

  return result;
}




function extractMainDomain(hostname) {
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




function openBackgroundTab(url) {
  chrome.tabs.create({ url: url, active: false }, (tab) => {
  });
}

function openTabIfNotExists(url) {
  // Query all tabs to find if the URL is already open
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find((tab) => tab.url === url);
    if (!existingTab) {
      openBackgroundTab(url);
    }
  });
}


function foundCATEntry(url) {
  openTabIfNotExists(url);
}

function getOptions(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (result) => {
      console.log("Options: ", JSON.stringify(result));
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}


function isDomainExcluded(exclusions, domain)  {
  if (exclusions == null) {
    return false;
  }
  return exclusions.some((excludedDomain) => domain.includes(excludedDomain));
}

async function getOpenDomains() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STATE_OPEN_DOMAINS, (result) => {
      console.log("Open domains: ", result[STATE_OPEN_DOMAINS] );
      resolve(result[STATE_OPEN_DOMAINS] || []);
    });
  });
}

async function saveOpenDomains(domainName) {
  const openDomains = await getOpenDomains();
  if (!openDomains.includes(domainName)) {
    openDomains.push(domainName);
    chrome.storage.local.set({ [STATE_OPEN_DOMAINS]: openDomains});
  }
}

async function indicateCATEntries(num) {
  if (num > 0) {
    chrome.action.setBadgeText({text: `${num}`});
  } else {
    chrome.storage.sync.get(
        null,
        (items) => {
          if (typeof items?.appDisabled === "boolean") {
            let appDisabled = items.appDisabled;
            chrome.action.setBadgeText( { text: appDisabled ? "off" : "on" });
          }
        },
    );
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {

    const options = await getOptions([OPTIONS_DOMAIN_EXCLUSIONS, "appDisabled"]);
    console.log("CAT options: ", JSON.stringify(options));

    if (message.badgeText) {
      chrome.action.setBadgeText({ text: message.badgeText });
    } else {
      await indicateCATEntries(0);
    }

    console.log("CAT is loafing?", options["appDisabled"]);
    if (options["appDisabled"]) {
      await indicateCATEntries(0);
      return;
    }


    const currentDomain = message.domain;
    if (currentDomain) {
      // ignore excluded domains
      if ( isDomainExcluded(options.domain_exclusions, currentDomain) ){
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

