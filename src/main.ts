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


    indicateStatus() {
        chrome.action.setBadgeText( {text: Preferences.isEnabled ? "on" : "off"} );
    }

    async indicateCATPages(pages: PageResults) :Promise<void> {
        chrome.action.setBadgeText( {text: `${pages.numPages}`} );
        // TODO: in page popup
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
            this.indicateCATPages(results);
        });
    }


    onBrowserExtensionInstalled() : void {
        console.log("ClintonCAT Extension Installed");
        Preferences.initDefaults().then(() => {
            Preferences.dump();
            this.indicateStatus();
        });
    }

    onBrowserExtensionMessage(message : any, sender: chrome.runtime.MessageSender, sendResponse : any): void  {
        (async () => {
            await Preferences.refresh();
            Preferences.dump();

            if (message.badgeText) {
                this.onBadgeTextUpdate(message.badgeText);
            } else if (!Preferences.isEnabled) {
                this.indicateStatus();
            } else if (message.domain) {
                this.onPageLoaded(message.domain);
            }
        })();
    }
}