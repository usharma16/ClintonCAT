import { IContentScannerPlugin, IScanParameters } from '../contentscanner';
import { PageResults } from '../database';

export class DefaultScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'default scanner';
    }

    canScanContent(_params: IScanParameters): boolean {
        // skipped in plugin search, explicitly called if no other plugins can handle the params
        return false;
    }

    async scan(params: IScanParameters): Promise<PageResults> {
        console.log(`Default Scanner: ${params.domain} - ${params.mainDomain}`);

        const pageResults: PageResults = { pagesFound: 0, pageUrls: [] };
        const pText = await params.dom.querySelectorAllAsText('p');
        pageResults.pageUrls = params.pagesDb.simpleSearch(pText, params.pagesDbCachedList);
        pageResults.pagesFound = pageResults.pageUrls.length;
        return pageResults;
    }
}
