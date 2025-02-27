// The 'require.context' feature depends on WebPack (@types/webpack)
const context: __WebpackModuleApi.RequireContext = require.context('./content-scanners', true, /\.ts$/, 'sync');
import { CATWikiPageSearchResults, PagesDB } from './database';
import DefaultScanner from '@/content-scanners/default-scanner';
import { IDOMHelperInterface, DOMHelperMessageType } from './domhelper';

export interface IContentScannerPlugin {
    metaInfo(): string;

    canScanContent(params: IScanParameters): boolean;

    scan(params: IScanParameters): Promise<boolean>;
}

export interface IScanParameters {
    domain: string;
    mainDomain: string;
    url: string;
    pagesDb: PagesDB;
    dom: IDOMHelperInterface;
    notify: (result: CATWikiPageSearchResults) => void;
}

// TODO: break this up into per DOMQuery types?
export interface IContentScanMessage {
    action: DOMHelperMessageType;
    id?: string;
    selector?: string;
    element?: string;
    html?: string;
}

export interface IElementData {
    tag: string;
    id: string;
    className: string;
    innerText: string;
    // innerHtml: string;  // can be a bit weighty
}

class ContentScanner {
    private scannerPlugins: IContentScannerPlugin[] = [];
    private defaultScannerPlugin: IContentScannerPlugin = new DefaultScanner();

    constructor() {
        this.findScannerPlugins();
    }

    public async checkPageContents(scannerParameters: IScanParameters): Promise<void> {
        for (const plugin of this.scannerPlugins) {
            // TODO: memoize the result ?
            if (plugin.canScanContent(scannerParameters)) {
                console.log(`Found a plugin that can handle request: ${scannerParameters.domain}`);
                // TODO: allow multiple handlers ?
                const didFindPages = await plugin.scan(scannerParameters);
                if (didFindPages) {
                    return;
                }
            }
        }
        console.log('Using default content scanner');
        await this.defaultScannerPlugin.scan(scannerParameters);
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

export default ContentScanner;
