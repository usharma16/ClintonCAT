import { Preferences } from './storage';
import { CATWikiPageSearchResults, PagesDB } from './database';
import { StorageCache } from './storagecache';
import { DomainTools } from './domaintools';
import { ContentScanner } from './contentscanner';

export interface IMainMessage {
    badgeText: string;
    domain: string;
    url: string;
}

export class Main {
    storageCache: StorageCache;
    pagesDatabase: PagesDB;
    domainTools: DomainTools;
    contentScanner: ContentScanner;

    constructor() {
        this.pagesDatabase = new PagesDB();
        this.storageCache = new StorageCache(this.pagesDatabase);
        this.domainTools = new DomainTools();
        this.contentScanner = new ContentScanner();
    }

    indicateStatus() {
        void chrome.action.setBadgeText({
            text: Preferences.isEnabled ? 'on' : 'off',
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async indicateCATPages(pages: CATWikiPageSearchResults): Promise<void> {
        void chrome.action.setBadgeText({ text: pages.totalPagesFound.toString() });
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

        // TODO: remove specialised step for domain as it can be handled by plugins (e.g. th    e default)
        const domainResults = await this.pagesDatabase.getPagesForDomain(mainDomain);
        const inPageResults = await this.contentScanner.checkPageContents(domain, mainDomain, url, this.pagesDatabase);
        // combine the results
        domainResults.addResults(inPageResults);

        void this.indicateCATPages(domainResults);
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
