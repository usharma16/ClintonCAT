// The 'require.context' feature depends on WebPack (@types/webpack)
const context: __WebpackModuleApi.RequireContext = require.context('./contentscanners', true, /\.ts$/, 'sync');
import { PageResults, PagesDB } from './database';
import { DefaultScanner } from './contentscanners/default';
import { IDOMHelperInterface, DOMHelper, DOMQueryType } from './domhelper';

export interface IContentScannerPlugin {
    metaInfo(): string;

    canScanContent(params: IScanParameters): boolean;

    scan(params: IScanParameters): Promise<PageResults>;
}

export interface IScanParameters {
    domain: string;
    mainDomain: string;
    url: string;
    pagesDb: PagesDB;
    dom: IDOMHelperInterface;
}

export interface IContentScanMessage {
    action: DOMQueryType;
    id?: string;
    selector: string;
}

export interface IElementData {
    tag: string;
    id: string;
    className: string;
    innerText: string;
    // innerHtml: string;  // can be a bit weighty
}

export class ContentScanner {
    private scannerPlugins: IContentScannerPlugin[] = [];
    private defaultScannerPlugin: IContentScannerPlugin = new DefaultScanner();
    private domHelper: IDOMHelperInterface = new DOMHelper();

    constructor() {
        this.findScannerPlugins();
    }

    public async checkPageContents(
        domain: string,
        mainDomain: string,
        url: string,
        pagesDb: PagesDB
    ): Promise<PageResults> {
        const scannerParameters: IScanParameters = {
            domain: domain.toLowerCase(),
            mainDomain: mainDomain.toLowerCase(),
            url: url,
            pagesDb: pagesDb,
            dom: this.domHelper,
        };

        for (const plugin of this.scannerPlugins) {
            // TODO: memoize the result ?
            if (plugin.canScanContent(scannerParameters)) {
                console.log(`Found a plugin that can handle request: ${scannerParameters.domain}`);
                // TODO: allow multiple handlers ?
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
