import { IContentScanMessage, IElementData } from './contentscanner';

export interface IDOMHelperInterface {
    querySelectorAll(selector: string): Promise<IElementData[]>;
    querySelector(selector: string): Promise<IElementData | undefined | null>;
    querySelectorByParentId(id: string, selector: string): Promise<IElementData | undefined | null>;
    querySelectorAllAsText(selector: string): Promise<string>;
    // updateDOM(parentId: string, html: string): Promise<void>;
}

export enum DOMQueryType {
    DOM_QUERY_SELECTOR_ALL = 'DOM_QUERY_SELECTOR_ALL',
    DOM_QUERY_SELECTOR_ALL_AS_TEXT = 'DOM_QUERY_SELECTOR_ALL_AS_TEXT',
    DOM_QUERY_SELECTOR = 'DOM_QUERY_SELECTOR',
    DOM_QUERY_SELECTOR_BY_PARENT_ID = 'DOM_QUERY_SELECTOR_BY_PARENT_ID',
}

export class DOMHelper implements IDOMHelperInterface {
    public async querySelectorAll(selector: string): Promise<IElementData[]> {
        console.log('querySelectorAll: ', selector);
        return (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR_ALL,
            selector: selector,
        })) as IElementData[];
    }

    // TODO: fix case when using id, e.g. '#product1 .h2' becomes ''# .h2' in the browser
    public async querySelector(selector: string): Promise<IElementData | null> {
        console.log('querySelector: ', selector);
        return (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR,
            selector: selector,
        })) as IElementData;
    }

    public async querySelectorByParentId(id: string, selector: string): Promise<IElementData | undefined | null> {
        console.log('querySelectorById: ', id, selector);
        return (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR_BY_PARENT_ID,
            id: id,
            selector: selector,
        })) as IElementData;
    }

    public async querySelectorAllAsText(selector: string): Promise<string> {
        console.log('querySelectorAll (as text): ', selector);
        return (await this.sendMessageToCurrentTab({
            action: DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT,
            selector: selector,
        })) as string;
    }

    private async sendMessageToCurrentTab(message: IContentScanMessage): Promise<unknown> {
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

    private async getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0]);
            });
        });
    }

    public static elementDataFromNode(element: HTMLElement | null | undefined): IElementData | undefined {
        if (!element) {
            return undefined;
        } else {
            return {
                tag: element.tagName,
                id: element.id,
                className: element.className,
                innerText: element.innerText,
            } as IElementData;
        }
    }
    public static elementDataFromNodes(nodes: NodeListOf<HTMLElement>): (IElementData | undefined | null)[] {
        return Array.from(nodes).map((node) => DOMHelper.elementDataFromNode(node));
    }

    public static registerContentListener() {
        chrome.runtime.onMessage.addListener((message: IContentScanMessage, _sender, sendResponse) => {
            switch (message.action) {
                case DOMQueryType.DOM_QUERY_SELECTOR_ALL: {
                    const nodes: NodeListOf<HTMLElement> = document.querySelectorAll(message.selector);
                    const elementData = DOMHelper.elementDataFromNodes(nodes);
                    // It doesn't seem possible to send a NodeList (as-is, cloned or deep copied) via `sendResponse`
                    sendResponse(elementData);
                    break;
                }

                case DOMQueryType.DOM_QUERY_SELECTOR: {
                    const element: HTMLElement | null = document.querySelector(message.selector);
                    sendResponse(DOMHelper.elementDataFromNode(element));
                    break;
                }

                case DOMQueryType.DOM_QUERY_SELECTOR_BY_PARENT_ID: {
                    const parent = document.getElementById('container');
                    const element: HTMLElement | null | undefined = parent?.querySelector(message.selector);
                    sendResponse(DOMHelper.elementDataFromNode(element));
                    break;
                }

                case DOMQueryType.DOM_QUERY_SELECTOR_ALL_AS_TEXT: {
                    const nodes: NodeListOf<HTMLElement> = document.querySelectorAll(message.selector);
                    const text = Array.from(nodes)
                        .map((node) => (node.textContent ?? '') + node.innerText)
                        .join('\n');
                    sendResponse(text);
                    break;
                }

                default:
                    break;
            }
        });
    }
}
