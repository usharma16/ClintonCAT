import { IContentScannerPlugin, IScanParameters } from '../../contentscanner';
import { CATWikiPageSearchResults } from '../../database';

export class AmazonUKPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.co.uk';
    }

    canScanContent(params: IScanParameters): boolean {
        return params.mainDomain === 'amazon' && params.domain.endsWith('co.uk');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<CATWikiPageSearchResults> {
        console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
        return new CATWikiPageSearchResults();
    }
}
