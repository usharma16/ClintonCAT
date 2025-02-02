import { IContentScannerPlugin, IScanParameters } from '../../contentscanner';
import { PageResults } from '../../database';

export class AmazonUKPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.co.uk';
    }

    canScanContent(params: IScanParameters): boolean {
        return params.mainDomain === 'amazon' && params.domain.endsWith('co.uk');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<PageResults> {
        console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
        const pageResults: PageResults = { pagesFound: 0, pageUrls: [] };
        return pageResults;
    }
}
