import { IContentScannerPlugin, IScanParameters } from '@/contentscanner';

export class AmazonUKPageScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'amazon.co.uk';
    }

    canScanContent(_params: IScanParameters): boolean {
        return false; // just aa skeleton placeholder, as an example, for now
        //return params.mainDomain === 'amazon' && params.domain.endsWith('co.uk');
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async scan(params: IScanParameters): Promise<boolean> {
        console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
        return false;
    }
}
