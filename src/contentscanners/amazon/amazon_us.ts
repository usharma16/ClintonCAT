import { IContentScannerPlugin, IScanParameters } from '../../contentscanner';
import { PageResults } from '../../database';

export class AmazonUSPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.com';
    }

    canHandleScan(params: IScanParameters): boolean {
        return params.mainDomain === 'amazon' && params.domain.endsWith('com');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<PageResults> {
        console.log(`Amazon US Scanner: ${params.domain} - ${params.mainDomain}`);
        const pageResults: PageResults = { numPages: 0, pageUrls: [] };
        return pageResults;
    }
}
