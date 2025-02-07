// export interface IPagesDB {
//     void updatePages();
// }

export class CATWikiPageSearchResults {
    private _pageUrls: string[] = [];
    private _foundCount: number = 0;

    constructor(pageUrls: string[] = []) {
        this.addPageUrls(pageUrls);
    }

    public addPageUrls(pageUrls: ReadonlyArray<string>): void {
        this._foundCount += pageUrls.length;
        this._pageUrls = [...new Set([...this.pageUrls, ...pageUrls])];
    }

    get pageUrls(): ReadonlyArray<string> {
        return this._pageUrls;
    }

    get totalPagesFound(): number {
        return this._foundCount;
    }

    addResults(other: CATWikiPageSearchResults): void {
        this.addPageUrls(other.pageUrls);
    }
}

export class PagesDB {
    static readonly WIKI_URL: string = 'https://wiki.rossmanngroup.com/wiki';

    pagesList: string[] = []; // keep another local copy.

    public setPages(pages: string[]) {
        this.pagesList = pages;
    }
    getPagesForDomain(domain: string): CATWikiPageSearchResults {
        return this.fuzzySearch(domain);
    }

    public simpleSearch(query: string): CATWikiPageSearchResults {
        const lowerQuery = query.toLowerCase();
        const pageTitles = this.pagesList.filter((item: string) => item.toLowerCase().includes(lowerQuery));
        const pageUrls = this.urlsForPages(pageTitles);
        return new CATWikiPageSearchResults(pageUrls);
    }

    // TODO: fix producing some false positives in results
    public fuzzySearch(query: string, matchAllWords: boolean = false): CATWikiPageSearchResults {
        const lowerQuery = query.toLowerCase().split(/\s+/);

        const pageTitles = this.pagesList.filter((pageTitle: string) => {
            const lowerPageTitle = pageTitle.toLowerCase();
            return matchAllWords
                ? lowerQuery.every((word) => lowerPageTitle.includes(word))
                : lowerQuery.some((word) => lowerPageTitle.includes(word));
        });
        const pageUrls = this.urlsForPages(pageTitles);
        return new CATWikiPageSearchResults(pageUrls);
    }

    public urlForPage(pageTitle: string): string {
        return `${PagesDB.WIKI_URL}/${encodeURIComponent(pageTitle)}`;
    }

    public urlsForPages(pageTitles: ReadonlyArray<string>): string[] {
        return pageTitles.map((pageTitle) => this.urlForPage(pageTitle));
    }
}
