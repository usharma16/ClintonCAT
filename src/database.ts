
export interface DomainResults {
    numPages: number;
    pageUrls: string[];
}

export class PagesDB {

    static readonly WIKI_URL = "https://wiki.rossmanngroup.com/wiki";
    static readonly PAGES_DB_JSON_URL = "https://raw.githubusercontent.com/WayneKeenan/ClintonCAT/refs/heads/main/pages_db.json";
    static readonly UPDATE_ALARM_NAME = "updatePagesDB";
    static readonly CACHE_KEY = "cachedPagesDB";
    static readonly CACHE_TIMESTAMP_KEY = "cachedPagesDBTimestamp";
    static readonly FETCH_INTERVAL_MINUTES = 30; // Fetch every 30 minutes
    static readonly FETCH_INTERVAL_MS = PagesDB.FETCH_INTERVAL_MINUTES * 60 * 1000;

    constructor() {

        // Alarm to trigger periodic updates
        chrome.alarms.create(PagesDB.UPDATE_ALARM_NAME, {periodInMinutes: PagesDB.FETCH_INTERVAL_MINUTES});
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === PagesDB.UPDATE_ALARM_NAME) {
                this.updatePagesDB();
            }
        });
        this.updatePagesDB();
    }


    async isCacheStale(epoch = Date.now()) {
        // Get the last update timestamp
        const {[PagesDB.CACHE_TIMESTAMP_KEY]: lastUpdated} = await chrome.storage.local.get(PagesDB.CACHE_TIMESTAMP_KEY);

        if (!lastUpdated) {
            return true;
        }
        return epoch - lastUpdated >= PagesDB.FETCH_INTERVAL_MS
    }

    async saveCache(data: string, timestamp: number = Date.now()) {
        await chrome.storage.local.set({[PagesDB.CACHE_KEY]: data, [PagesDB.CACHE_TIMESTAMP_KEY]: timestamp});
    }

// Function to fetch and cache the pages database
    async updatePagesDB(force = false) {
        try {
            const now = Date.now();
            const needsUpdate = force || await this.isCacheStale(now);
            if (!needsUpdate) {
                console.log("Skipping update: Cache TTL not reached.");
            }

            console.log("Fetching updated pages database...");
            const jsonData = await this.fetchJson(PagesDB.PAGES_DB_JSON_URL);
            await this.saveCache(jsonData, now);

            console.log("Pages database updated successfully.");
        } catch (error: any) {
            console.error(`Failed to update pages database: ${error.message}`);
        }
    }

// Function to get the cached pages database
    async getCachedPagesDB() {
        const {[PagesDB.CACHE_KEY]: pagesDb} = await chrome.storage.local.get(PagesDB.CACHE_KEY);
        return pagesDb || [];
    }



    async getPagesForDomain(domain: string): Promise<DomainResults> {

        const pagesDB: string[] = await this.getCachedPagesDB();
        let pages: string[] = this.fuzzySearch(domain, pagesDB);

        console.log("Pages fuzzy search result: ", pages);

        let result: DomainResults = {
            numPages: 0,
            pageUrls: [],
        };

        if (pages && pages.length > 0) {
            const pageUrl: string = `${PagesDB.WIKI_URL}/${encodeURIComponent(pages[0])}`;
            result.numPages = pages.length;
            result.pageUrls = [pageUrl];
        }

        return result;
    }


    fuzzySearch(query: string, arr: string[]) {
        const lowerQuery = query.toLowerCase();
        return arr.filter((item: string) => item.toLowerCase().includes(lowerQuery));
    }

    async fetchJson(url: string) {
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

}