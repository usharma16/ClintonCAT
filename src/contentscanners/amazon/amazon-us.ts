import { IContentScannerPlugin, IScanParameters } from '../../contentscanner';
import { CATWikiPageSearchResults } from '../../database';

export class AmazonUSPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.com';
    }

    canScanContent(params: IScanParameters): boolean {
        return params.mainDomain === 'amazon' && params.domain.endsWith('com');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<CATWikiPageSearchResults> {
        console.log(`Amazon US Scanner: ${params.domain} - ${params.mainDomain}`);
        return new CATWikiPageSearchResults();
    }
}
