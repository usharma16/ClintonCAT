export interface PageResults {
    pagesFound: number; // will reflect multiple occurances
    pageUrls: string[]; // should not contain duplicate urls
}

export class PagesDB {
    static readonly WIKI_URL: string = 'https://wiki.rossmanngroup.com/wiki';
    static readonly PAGES_DB_JSON_URL: string =
        'https://raw.githubusercontent.com/WayneKeenan/ClintonCAT/refs/heads/main/data/pages_db.json';
    static readonly UPDATE_ALARM_NAME: string = 'updatePagesDB';
    static readonly CACHE_KEY: string = 'cachedPagesDB';
    static readonly CACHE_TIMESTAMP_KEY: string = 'cachedPagesDBTimestamp';
    static readonly FETCH_INTERVAL_MINUTES: number = 30; // Fetch every 30 minutes
    static readonly FETCH_INTERVAL_MS: number = PagesDB.FETCH_INTERVAL_MINUTES * 60 * 1000;

    static pagesList: string[] = []; // keep another local copy.

    constructor() {
        // Alarm to trigger periodic updates
        void chrome.alarms.create(PagesDB.UPDATE_ALARM_NAME, {
            periodInMinutes: PagesDB.FETCH_INTERVAL_MINUTES,
        });
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === PagesDB.UPDATE_ALARM_NAME) {
                void this.updatePagesDB();
            }
        });
        void this.updatePagesDB();
    }

    async isCacheStale(epoch = Date.now()) {
        // Get the last update timestamp
        const { [PagesDB.CACHE_TIMESTAMP_KEY]: lastUpdated } = await chrome.storage.local.get(
            PagesDB.CACHE_TIMESTAMP_KEY
        );

        if (!lastUpdated) {
            return true;
        }
        return epoch - lastUpdated >= PagesDB.FETCH_INTERVAL_MS;
    }

    async saveCache(data: string, timestamp: number = Date.now()) {
        await chrome.storage.local.set({
            [PagesDB.CACHE_KEY]: data,
            [PagesDB.CACHE_TIMESTAMP_KEY]: timestamp,
        });
    }

    // Function to fetch and cache the pages database
    async updatePagesDB(force = false) {
        try {
            const now = Date.now();
            const needsUpdate = force || (await this.isCacheStale(now));
            if (!needsUpdate) {
                console.log('Skipping update: Cache TTL not reached.');
            }

            console.log('Fetching updated pages database...');
            const jsonData: string = await this.fetchJson(PagesDB.PAGES_DB_JSON_URL);
            await this.saveCache(jsonData, now);

            console.log('Pages database updated successfully.');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Failed to update pages database: ${error.message}`);
                throw error;
            }
        }
    }

    // Function to get the cached pages database
    async getCachedPagesDB(): Promise<string[]> {
        const { [PagesDB.CACHE_KEY]: pagesDb } = await chrome.storage.local.get(PagesDB.CACHE_KEY);
        return (pagesDb as string[] | undefined) ?? [];
    }

    async getPagesForDomain(domain: string): Promise<PageResults> {
        const pages: string[] = await this.fuzzySearch(domain);

        console.log('Pages fuzzy search result: ', pages);

        const result: PageResults = {
            pagesFound: 0,
            pageUrls: [],
        };

        if (pages.length > 0) {
            const pageUrl = `${PagesDB.WIKI_URL}/${encodeURIComponent(pages[0])}`;
            result.pagesFound = pages.length;
            result.pageUrls = [pageUrl];
        }

        return result;
    }

    public async simpleSearch(query: string): Promise<string[]> {
        const pagesDB: string[] = await this.getCachedPagesDB();
        const lowerQuery = query.toLowerCase();
        return pagesDB.filter((item: string) => item.toLowerCase().includes(lowerQuery));
    }

    // TODO: fix producing some false positives in results
    public async fuzzySearch(query: string, matchAllWords: boolean = false): Promise<string[]> {
        const pagesDB: string[] = await this.getCachedPagesDB();
        const lowerQuery = query.toLowerCase().split(/\s+/);

        return pagesDB.filter((pageTitle) => {
            const lowerPageTitle = pageTitle.toLowerCase();
            return matchAllWords
                ? lowerQuery.every((word) => lowerPageTitle.includes(word))
                : lowerQuery.some((word) => lowerPageTitle.includes(word));
        });
    }

    async fetchJson(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status.toString()}`);
            }
            return (await response.json()) as string;
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Failed to fetch JSON: ${error.message}`);
                throw error;
            }
        }
        return '';
    }
}
