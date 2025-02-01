import { Preferences } from './storage';
import { PageResults, PagesDB } from './database';
import { DomainTools } from './domaintools';
import { ContentScanner } from './contentscanner';

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
        chrome.action.setBadgeText({
            text: Preferences.isEnabled ? 'on' : 'off',
        });
    }

    async indicateCATPages(pages: PageResults): Promise<void> {
        chrome.action.setBadgeText({ text: `${pages.numPages}` });
        // TODO: in page popup
    }

    onBadgeTextUpdate(text: string): void {
        chrome.action.setBadgeText({ text: text });
    }

    checkDomainIsExcluded(domain: string): boolean {
        return this.domainTools.isDomainExcluded(
            Preferences.domainExclusions,
            domain,
        );
    }

    async onPageLoaded(domain: string, url: string): Promise<void> {
        const mainDomain = this.domainTools.extractMainDomain(domain);
        console.log('Main domain: ' + mainDomain);

        if (this.checkDomainIsExcluded(mainDomain)) {
            console.log('Excluded domain: ' + mainDomain);
            return;
        }

        let wikiPageResults: PageResults = { numPages: 0, pageUrls: [] };

        let domainResults =
            await this.pagesDatabase.getPagesForDomain(mainDomain);
        wikiPageResults.numPages += domainResults.numPages;
        wikiPageResults.pageUrls.push(...domainResults.pageUrls);

        const pagesDBCache: string[] =
            await this.pagesDatabase.getCachedPagesDB();

        let inPageResults = await this.contentScanner.checkPageContents(
            domain,
            mainDomain,
            url,
            this.pagesDatabase,
            pagesDBCache,
        );
        wikiPageResults.numPages += inPageResults.numPages;
        wikiPageResults.pageUrls.push(...inPageResults.pageUrls);

        this.indicateCATPages(wikiPageResults);
    }

    onBrowserExtensionInstalled(): void {
        console.log('ClintonCAT Extension Installed');
        Preferences.initDefaults().then(() => {
            Preferences.dump();
            this.indicateStatus();
        });
    }

    onBrowserExtensionMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: any,
    ): void {
        (async () => {
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
