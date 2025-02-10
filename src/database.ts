// export interface IPagesDB {
//     void updatePages();
// }
import escapeRegex from './utils/escape-regex';

export interface IPageEntry {
    pageTitle: string;
    popupText: string;
    category: string;
}

export class PageEntry implements IPageEntry {
    static readonly WIKI_URL: string = 'https://wiki.rossmanngroup.com/wiki';

    private _pageTitle: string;
    private _popupText: string;
    private _category: string;

    constructor(pageEntry: IPageEntry) {
        this._pageTitle = pageEntry.pageTitle;
        this._popupText = pageEntry.popupText;
        this._category = pageEntry.category;
    }

    get pageTitle(): string {
        return this._pageTitle;
    }

    set pageTitle(value: string) {
        this._pageTitle = value;
    }

    get popupText(): string {
        return this._popupText;
    }

    set popupText(value: string) {
        this._popupText = value;
    }

    get category(): string {
        return this._category;
    }

    set category(value: string) {
        this._category = value;
    }

    public url(): string {
        return `${PageEntry.WIKI_URL}/${encodeURIComponent(this.pageTitle)}`;
    }
}

export class CATWikiPageSearchResults {
    private _pageEntries: IPageEntry[] = [];

    constructor(pageEntries: IPageEntry[] = []) {
        this.addPageEntries(pageEntries);
    }

    public addPageEntry(pageEntry: IPageEntry): void {
        this._pageEntries = [...this._pageEntries, new PageEntry(pageEntry)];
    }

    public addPageEntries(pageEntries: readonly IPageEntry[]): void {
        for (const pageEntry of pageEntries) {
            this.addPageEntry(pageEntry);
        }
    }

    get totalPagesFound(): number {
        return this._pageEntries.length;
    }

    get pageEntries(): readonly IPageEntry[] {
        return this._pageEntries;
    }
}

export class PagesDB {
    private pagesList: IPageEntry[] = []; // keep another local copy.

    public setPages(pages: IPageEntry[]) {
        // console.log('setPages', pages);
        this.pagesList = pages;
    }
    public getPagesForDomain(domain: string): CATWikiPageSearchResults {
        return this.fuzzySearch(domain);
    }

    public simpleSearch(query: string): CATWikiPageSearchResults {
        const lowerQuery = query.toLowerCase();
        const results = new CATWikiPageSearchResults();
        for (const pageEntry of this.pagesList) {
            if (pageEntry.pageTitle.toLowerCase().includes(lowerQuery)) {
                results.addPageEntry(pageEntry);
            }
        }
        return results;
    }

    public fuzzySearch(query: string, matchAllWords: boolean = false): CATWikiPageSearchResults {
        const lowerQueryWords = query.toLowerCase().split(/\s+/);
        const results = new CATWikiPageSearchResults();

        const pageEntries = this.pagesList
            .map((pageEntry) => {
                const lowerTitle = pageEntry.pageTitle.toLowerCase();
                let matchCount = 0;
                for (const word of lowerQueryWords) {
                    // Use word boundaries to reduce false positives
                    // and escape special regex characters to handle queries like "(test)".
                    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
                    if (regex.test(lowerTitle)) {
                        matchCount++;
                    }
                }
                return { pageEntry, matchCount };
            })
            .filter(({ matchCount }) => (matchAllWords ? matchCount === lowerQueryWords.length : matchCount > 0))
            .sort((a, b) => b.matchCount - a.matchCount)
            .map(({ pageEntry }) => pageEntry);

        results.addPageEntries(pageEntries);
        return results;
    }
}
