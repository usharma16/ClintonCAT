// export interface IPagesDB {
//     void updatePages();
// }
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

    constructor(pageTitle: string = '', popupText: string = '', category: string = '') {
        this._pageTitle = pageTitle;
        this._popupText = popupText;
        this._category = category;
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

    public pageUrl(): string {
        return `${PageEntry.WIKI_URL}/${encodeURIComponent(this.pageTitle)}`;
    }
}

export class CATWikiPageSearchResults {
    private _pageUrls: IPageEntry[] = [];
    private _foundCount: number = 0;

    constructor(pageUrls: IPageEntry[] = []) {
        this.addPageUrls(pageUrls);
    }

    public addPageUrls(pageUrls: readonly IPageEntry[]): void {
        this._foundCount += pageUrls.length;
        this._pageUrls = [...new Set([...this.pageUrls, ...pageUrls])];
    }

    get pageUrls(): readonly IPageEntry[] {
        return this._pageUrls;
    }

    get totalPagesFound(): number {
        return this._foundCount;
    }
}

export class PagesDB {
    private pagesList: IPageEntry[] = []; // keep another local copy.

    public setPages(pages: IPageEntry[]) {
        console.log('setPages', pages);
        this.pagesList = pages;
    }
    public getPagesForDomain(domain: string): CATWikiPageSearchResults {
        return this.fuzzySearch(domain);
    }

    public simpleSearch(query: string): CATWikiPageSearchResults {
        // const lowerQuery = query.toLowerCase();
        // const pageTitles = this.pagesList.filter((item: string) => item.toLowerCase().includes(lowerQuery));
        // const pageUrls = this.urlsForPages(pageTitles);
        return new CATWikiPageSearchResults();
    }

    // TODO: fix producing some false positives in results
    public fuzzySearch(query: string, matchAllWords: boolean = false): CATWikiPageSearchResults {
        // const lowerQuery = query.toLowerCase().split(/\s+/);
        //
        // const pageTitles = this.pagesList.filter((pageTitle: string) => {
        //     const lowerPageTitle = pageTitle.toLowerCase();
        //     return matchAllWords
        //         ? lowerQuery.every((word) => lowerPageTitle.includes(word))
        //         : lowerQuery.some((word) => lowerPageTitle.includes(word));
        // });
        // const pageUrls = this.urlsForPages(pageTitles);
        return new CATWikiPageSearchResults();
    }

    // public urlsForPages(pageTitles: readonly string[]): string[] {
    //     return pageTitles.map((pageTitle) => this.urlForPage(pageTitle));
    // }
}
