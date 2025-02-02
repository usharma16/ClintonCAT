import { IContentScannerPlugin, IScanParameters } from '../contentscanner';
import { CATWikiPageSearchResults } from '../database';

export class DefaultScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'default scanner';
    }

    canScanContent(_params: IScanParameters): boolean {
        // skipped in plugin search, explicitly called if no other plugins can handle the params
        return false;
    }

    async scan(params: IScanParameters): Promise<CATWikiPageSearchResults> {
        console.log(`Default Scanner: ${params.domain} - ${params.mainDomain}`);
        const pText = await params.dom.querySelectorAllAsText('p');
        return await params.pagesDb.simpleSearch(pText);
    }
}
``;
