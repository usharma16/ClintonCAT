import {Preferences} from './storage'
import {PageResults, PagesDB} from "./database";
import {DomainTools} from "./domaintools";


export class Main {

    pagesDatabase : PagesDB;
    domainTools : DomainTools;

    constructor() {
        this.pagesDatabase = new PagesDB();
        this.domainTools = new DomainTools();
    }


    indicateDisabled() {
        console.log("CAT is loafing (disabled)");
        this.indicateCATEntries(0);
    }


    processFoundPages(pages: PageResults) {
        if (pages.numPages > 0) {
            this.indicateCATEntries(pages.numPages);
        }
        // TODO update popup, e.g. pages.pageUrls[0];
    }


    async indicateCATEntries(num: number) :Promise<void> {
        let badgeText: string = Preferences.isEnabled ? "on" : "off";

        if (num > 0) {
            badgeText = `${num}`;
        }
        chrome.action.setBadgeText( {text: badgeText} );
    }


    onBadgeTextUpdate(text: string) : void {
        chrome.action.setBadgeText({ text: text });
    }


    onPageLoaded(domain: string) : void {

        const mainDomain = this.domainTools.extractMainDomain(domain);
        console.log("Main domain: " + mainDomain);

        if (this.domainTools.isDomainExcluded(Preferences.domainExclusions, domain)) {
            console.log("Excluded domain: " + mainDomain);
            return;
        }

        this.pagesDatabase.getPagesForDomain(mainDomain).then((results) => {
            this.processFoundPages(results);
        });
    }


    onBrowserExtensionInstalled() : void {
        console.log("ClintonCAT Extension Installed");
        Preferences.initDefaults().then(() => {console.log(Preferences.toString())});
    }

    onBrowserExtensionMessage(message : any, sender: chrome.runtime.MessageSender, sendResponse : any): void  {

        if (message.badgeText) {
            this.onBadgeTextUpdate(message.badgeText);
        } else if (!Preferences.isEnabled) {
            this.indicateDisabled();
        } else if (message.domain) {
            this.onPageLoaded(message.domain);
        }
    }
}