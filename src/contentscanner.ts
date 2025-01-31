// This handy feature requires the use of WebPack (@types/webpack)
const context = require.context("./contentscanners", true, /\.ts$/, "sync");
import {DefaultScanner} from "./contentscanners/default";
import {PageResults, PagesDB} from "./database";

export interface DOMHelperInterface {
    queryDOM(selector: string): string;
    // TODO: ? updateDOM(...) : void;
}

class DOMHelper implements DOMHelperInterface {

    queryDOM(selector: string): string {
        let results : string = "";

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "queryDom", selector: selector}, (response) => {
                    console.log(response);
                    results = response?.text;
                });
            }
        });
        console.log("selector returned:", results);
        return results;
    }
}

export interface ScannerParameters {
    domain : string,
    mainDomain : string,
    url : string,
    pagesDb: PagesDB,
    pagesDbCachedList : string[],     // TODO: should be removed and only use pagesDb in the plugins
    domHelper: DOMHelper

}

export interface ContentScannerPluginInterface {
    metaInfo() : string;
    canHandleScan(params: ScannerParameters) : boolean;
    scan(params: ScannerParameters) : PageResults;
}



export class ContentScanner {

    private scannerPlugins: ContentScannerPluginInterface[] = [];
    private domHelper: DOMHelper = new DOMHelper();
    private defaultScannerPlugin: DefaultScanner = new DefaultScanner();

    constructor() {
        this.findScannerPlugins();
        this.domHelper = new DOMHelper();
    }

    public static init() {
        // Required for accessing the DOM via method 1 below;
        this.registerContentListener();
    }

    private findScannerPlugins() : void {
        console.log("Scanner classes:");

        context.keys().map((key) => {
            const module = context(key);
            const className = Object.keys(module)[0];
            const Class = module[className];
            const obj : ContentScannerPluginInterface = new Class();
            this.scannerPlugins.push(obj);
            console.log("Added content scanner plugin: ", className, " metainfo", obj.metaInfo());
        });

    }


    // Accessing the DOM from service worker, method 1
    public async checkPageContents(domain:string, mainDomain:string, url: string, pagesDb: PagesDB, pagesDBCachedList : string[]): Promise<PageResults> {

        const scannerParameters : ScannerParameters = {
            domain: domain.toLowerCase(),
            mainDomain: mainDomain.toLowerCase(),
            url: url,
            pagesDb: pagesDb,
            pagesDbCachedList: pagesDBCachedList,
            domHelper: this.domHelper
        };

        // this.scannerPlugins.forEach(plugin => {
        //     // TODO: memoize the result
        //     if (plugin.canHandleScan(scannerParameters)) {
        //         console.log(`Plugin for ${plugin.metaInfo()} can handle domain: ${scannerParameters.domain}`);
        //         return plugin.scan(scannerParameters);
        //     }
        // });

        return this.defaultScannerPlugin.scan(scannerParameters);

    }

    private static registerContentListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "queryDom") {
                const nodes = document.querySelectorAll(message.selector);
                sendResponse({text: Array.from(nodes).map(node => node.textContent)});
                return false; // make syncronous
            }
        });
    }



    // Accessing the DOM from service worker, method 2
    // checkPageContents(): PageResults {
    //
    //     let pageResults : PageResults = {numPages: 0, pageUrls: []};
    //     let selector = "p";
    //
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         if (tabs[0]?.id) {
    //             chrome.scripting.executeScript({
    //                 target: { tabId: tabs[0].id },
    //                 func: function () {                                  // Cant use a TypeScript function here
    //                     const paragraphs = document.querySelectorAll(selector);
    //                     return Array.from(paragraphs).map(p => p.textContent);
    //                 }
    //             }).then((results) => {
    //                 console.log("Extracted Text:", results[0].result);
    //             }).catch((error) => {
    //                 console.error("Error accessing DOM:", error);
    //             });
    //         }
    //
    //     });
    //
    //     return pageResults;
    // }

}