// The 'require.context' feature depends on WebPack (@types/webpack)
const context: __WebpackModuleApi.RequireContext = require.context('./contentscanners', false, /\.ts$/, 'sync');
import { PageResults, PagesDB } from './database';
import { DefaultScanner } from './contentscanners/default';

export interface IContentScannerPlugin {
    metaInfo(): string;

    canHandleScan(params: IScanParameters): boolean;

    scan(params: IScanParameters): Promise<PageResults>;
}

export interface IScanParameters {
    domain: string;
    mainDomain: string;
    url: string;
    pagesDb: PagesDB;
    pagesDbCachedList: string[]; // TODO: should be removed and only pass pagesDb to the plugins
    domHelper: DOMHelper;
}

export interface IContentScanMessage {
    action: DOMQueryType;
    selector: string;
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

    private static registerContentListener() {
        chrome.runtime.onMessage.addListener((message: IContentScanMessage, _sender, sendResponse) => {
            switch (message.action) {
                case DOMQueryType.DOM_QUERY_SELECTOR_ALL: {
                    const nodes: NodeListOf<HTMLElement> = document.querySelectorAll(message.selector);
                    sendResponse(nodes);
                    break;
                }

                case DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT: {
                    const nodes: NodeListOf<HTMLElement> = document.querySelectorAll(message.selector);
                    const text = Array.from(nodes)
                        .map((node) => (node.textContent ?? '') + node.innerText + node.innerHTML)
                        .join('\n');
                    sendResponse(text);
                    break;
                }

                // TODO: any other query types as required
                default:
                    break;
            }
        });
    }

    public async checkPageContents(
        domain: string,
        mainDomain: string,
        url: string,
        pagesDb: PagesDB,
        pagesDBCachedList: string[]
    ): Promise<PageResults> {
        const scannerParameters: IScanParameters = {
            domain: domain.toLowerCase(),
            mainDomain: mainDomain.toLowerCase(),
            url: url,
            pagesDb: pagesDb,
            pagesDbCachedList: pagesDBCachedList,
            domHelper: this.domHelper,
        };

        for (const plugin of this.scannerPlugins) {
            // TODO: memoize the result ?
            if (plugin.canHandleScan(scannerParameters)) {
                console.log(`Found a plugin that can handle request: ${scannerParameters.domain}`);
                // TODO: allow multiple handlers
                return await plugin.scan(scannerParameters);
            }
        }
        console.log('Using default content scanner');
        return await this.defaultScannerPlugin.scan(scannerParameters);
    }

    private findScannerPlugins(): void {
        context.keys().map((key) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const module = context(key);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const className = Object.keys(module)[0];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const Class = module[className];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const obj: IContentScannerPlugin = new Class();
            this.scannerPlugins.push(obj);
            console.log('Added content scanner plugin: ', className, ' metainfo: ', obj.metaInfo());
        });
    }
}

export interface DOMHelperInterface {
    queryDOM(selector: string): Promise<unknown>;

    // TODO: ? updateDOM(...) : void;
}

enum DOMQueryType {
    DOM_QUERY_SELECTOR_ALL = 'DOM_QUERY_SELECTOR_ALL',
    DOM_QUERY_SELECTOR_ALL_AS_TEXT = 'DOM_QUERY_SELECTOR_ALL_AS_TEXT',
}

class DOMHelper implements DOMHelperInterface {
    // TODO: not working...
    async queryDOM(selector: string): Promise<Node[]> {
        const nodes: NodeListOf<HTMLElement> = (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR_ALL,
            selector: selector,
        })) as NodeListOf<HTMLElement>;
        console.dir(nodes);
        const copy = Array.from(nodes).map((node) => node.cloneNode(true));
        console.dir(copy);
        return copy;
    }

    // crude hack...
    async queryDOMAsText(selector: string): Promise<string> {
        return (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT,
            selector: selector,
        })) as string;
    }

    async sendMessageToCurrentTab(message: IContentScanMessage): Promise<unknown> {
        const tab = await this.getCurrentTab();

        if (!tab?.id) {
            throw new Error('No active tab found');
        }

        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tab.id ?? -1, message, (response) => {
                if (chrome.runtime.lastError instanceof Error) {
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
