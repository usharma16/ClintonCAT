import {ContentScannerPluginInterface, ScannerParameters} from "../contentscanner";
import {PageResults} from "../database";

export class DefaultScanner implements ContentScannerPluginInterface {

    metaInfo() : string {
        return "default scanner";
    }

    canHandleScan(params: ScannerParameters) : boolean {
        // explicitly called if no other plugins can handle the params
        return false;
    }

    scan(params: ScannerParameters)  {
        console.log(`Default Scanner: ${params.domain} - ${params.mainDomain}`);

        let pageResults : PageResults = {numPages: 0, pageUrls: []};

        const pageText : string = params.domHelper.queryDOM("span");
        console.log("Page text", pageText);
        params.pagesDb.fuzzySearch(pageText, params.pagesDbCachedList);

        return pageResults;
    }
}