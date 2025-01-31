import {ContentScannerPluginInterface, ScannerParameters} from "../../contentscanner";
import {PageResults} from "../../database";

export class AmazonUSPageScanner implements ContentScannerPluginInterface {

    metaInfo() : string {
        return "amazon.com";
    }

    canHandleScan(params: ScannerParameters) : boolean {
        return (params.mainDomain === "amazon" && params.domain.endsWith("com"));
    }

    scan(params: ScannerParameters) {
        console.log(`Amazon US Scanner: ${params.domain} - ${params.mainDomain}`);
        let pageResults : PageResults = {numPages: 0, pageUrls: []};

        return pageResults
    }
}