import { IContentScannerPlugin, IScanParameters } from '../../contentscanner';
import { PageResults } from '../../database';

export class AmazonUKPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.co.uk';
    }

    canHandleScan(params: IScanParameters): boolean {
        return params.mainDomain === 'amazon' && params.domain.endsWith('co.uk');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<PageResults> {
        console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
        const pageResults: PageResults = { numPages: 0, pageUrls: [] };
        return pageResults;
    }
}
