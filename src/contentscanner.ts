// The 'require.context' feature depends on WebPack (@types/webpack)
const context = require.context("./contentscanners", false, /\.ts$/, "sync");
import {PageResults, PagesDB} from "./database";
import {DefaultScanner} from "./contentscanners/default";


export interface IContentScannerPlugin {
    metaInfo() : string;
    canHandleScan(params: IScanParameters) : boolean;
    scan(params: IScanParameters) : Promise<PageResults>;
}

export interface IScanParameters {
    domain : string,
    mainDomain : string,
    url : string,
    pagesDb: PagesDB,
    pagesDbCachedList : string[],     // TODO: should be removed and only pass pagesDb to the plugins
    domHelper: DOMHelper
}

export class ContentScanner {

    private scannerPlugins: IContentScannerPlugin[] = [];
    private defaultScannerPlugin: DefaultScanner = new DefaultScanner();
    private domHelper: DOMHelper = new DOMHelper();

    constructor() {
        this.findScannerPlugins();
        this.domHelper = new DOMHelper();
    }

    // Must be called from content.js
    public static init() {
        // Required for accessing the DOM via service worker
        this.registerContentListener();
    }

    public async checkPageContents(domain:string, mainDomain:string, url: string, pagesDb: PagesDB, pagesDBCachedList : string[]): Promise<PageResults> {

        const scannerParameters : IScanParameters = {
            domain: domain.toLowerCase(),
            mainDomain: mainDomain.toLowerCase(),
            url: url,
            pagesDb: pagesDb,
            pagesDbCachedList: pagesDBCachedList,
            domHelper: this.domHelper
        };

        for (let plugin of this.scannerPlugins) {
            // TODO: memoize the result ?
            if (plugin.canHandleScan(scannerParameters)) {
                console.log(`Found a plugin that can handle request: ${scannerParameters.domain}`);
                // TODO: allow multiple handlers
                return await plugin.scan(scannerParameters);
            }
        }
        console.log("Using default content scanner");
        return await this.defaultScannerPlugin.scan(scannerParameters);

    }

    private findScannerPlugins() : void {
        context.keys().map((key) => {
            const module = context(key);
            const className = Object.keys(module)[0];
            const Class = module[className];
            const obj : IContentScannerPlugin = new Class();
            this.scannerPlugins.push(obj);
            console.log("Added content scanner plugin: ", className, " metainfo: ", obj.metaInfo());
        });

    }

    private static registerContentListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === DOMQueryType.DOM_QUERY_SELECTOR_ALL) {
                const nodes : NodeListOf<any> = document.querySelectorAll(message.selector);
                sendResponse( nodes );
            } else if (message.action === DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT) {
                const nodes: NodeListOf<any> = document.querySelectorAll(message.selector);
                const text = Array.from(nodes).map(node => node.textContent + node.innerText + node.innerHTML).join("\n");
                sendResponse( text );
            }else {
                // TODO: any other query types as required
            }
            // return false;
        });
    }

}




export interface DOMHelperInterface {
    queryDOM(selector: string): Promise<any>;
    // TODO: ? updateDOM(...) : void;
}

enum DOMQueryType {
    DOM_QUERY_SELECTOR_ALL = "DOM_QUERY_SELECTOR_ALL",
    DOM_QUERY_SELECTOR_ALL_AS_TEXT = "DOM_QUERY_SELECTOR_ALL_AS_TEXT",
}

class DOMHelper implements DOMHelperInterface {

    // TODO: not working...
    async queryDOM(selector: string): Promise<Node[]> {
        let nodes :NodeListOf<any> = await this.sendMessageToCurrentTab( {action: DOMQueryType.DOM_QUERY_SELECTOR_ALL, selector: selector});
        console.dir(nodes);
        let copy =  Array.from(nodes).map(node => node.cloneNode(true));
        console.dir(copy);
        return copy;
    }

    // crude hack...
    async queryDOMAsText(selector: string): Promise<string> {
        return await this.sendMessageToCurrentTab( {action: DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT, selector: selector});
    }

    async sendMessageToCurrentTab(message: any): Promise<any> {
        const tab = await this.getCurrentTab();

        if (!tab?.id) {
            throw new Error("No active tab found");
        }

        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id!, message, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    async getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

}

