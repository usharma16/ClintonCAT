import { Preferences } from './storage';
import { PageResults, PagesDB } from './database';
import { DomainTools } from './domaintools';
import { ContentScanner } from './contentscanner';

export interface IMainMessage {
    badgeText: string;
    domain: string;
    url: string;
}

export class Main {
    pagesDatabase: PagesDB;
    domainTools: DomainTools;
    contentScanner: ContentScanner;

    constructor() {
        this.pagesDatabase = new PagesDB();
        this.domainTools = new DomainTools();
        this.contentScanner = new ContentScanner();
    }

    indicateStatus() {
        void chrome.action.setBadgeText({
            text: Preferences.isEnabled ? 'on' : 'off',
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async indicateCATPages(pages: PageResults): Promise<void> {
        void chrome.action.setBadgeText({ text: pages.pagesFound.toString() });
        console.log(pages);
        // TODO: in page popup
    }

    onBadgeTextUpdate(text: string): void {
        void chrome.action.setBadgeText({ text: text });
    }

    checkDomainIsExcluded(domain: string): boolean {
        return this.domainTools.isDomainExcluded(Preferences.domainExclusions, domain);
    }

    async onPageLoaded(domain: string, url: string): Promise<void> {
        const mainDomain = this.domainTools.extractMainDomain(domain);
        console.log('Main domain: ' + mainDomain);

        if (this.checkDomainIsExcluded(mainDomain)) {
            console.log('Excluded domain: ' + mainDomain);
            return;
        }

        const wikiPageResults: PageResults = { pagesFound: 0, pageUrls: [] };

        const domainResults = await this.pagesDatabase.getPagesForDomain(mainDomain);
        wikiPageResults.pagesFound += domainResults.pagesFound;
        wikiPageResults.pageUrls.push(...domainResults.pageUrls);

        const pagesDBCache: string[] = await this.pagesDatabase.getCachedPagesDB();

        const inPageResults = await this.contentScanner.checkPageContents(
            domain,
            mainDomain,
            url,
            this.pagesDatabase,
            pagesDBCache
        );
        wikiPageResults.pagesFound += inPageResults.pagesFound;
        wikiPageResults.pageUrls.push(...inPageResults.pageUrls);

        void this.indicateCATPages(wikiPageResults);
    }

    onBrowserExtensionInstalled(): void {
        console.log('ClintonCAT Extension Installed');
        void Preferences.initDefaults().then(() => {
            Preferences.dump();
            this.indicateStatus();
        });
    }

    onBrowserExtensionMessage(
        message: IMainMessage,
        _sender: chrome.runtime.MessageSender,
        _sendResponse: VoidFunction
    ): void {
        void (async () => {
            await Preferences.refresh();
            Preferences.dump();

            if (message.badgeText) {
                this.onBadgeTextUpdate(message.badgeText);
            } else if (!Preferences.isEnabled) {
                this.indicateStatus();
            } else if (message.domain) {
                await this.onPageLoaded(message.domain, message.url);
            }
        })();
    }
}
