import {ScannerParameters, ContentScannerPluginInterface} from "../../contentscanner";
import {PageResults} from "../../database";

export class AmazonUKPageScanner implements ContentScannerPluginInterface {

    metaInfo() : string {
        return "amazon.co.uk";
    }

    canHandleScan(params: ScannerParameters) : boolean {
        return (params.mainDomain === "amazon" && params.domain.endsWith("co.uk"));
    }

    scan(params: ScannerParameters) {
        console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
        let pageResults : PageResults = {numPages: 0, pageUrls: []};

        return pageResults
    }
}