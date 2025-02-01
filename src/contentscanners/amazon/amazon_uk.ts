import { IContentScannerPlugin, IScanParameters } from "../../contentscanner";
import { PageResults } from "../../database";

export class AmazonUKPageScanner implements IContentScannerPlugin {
  metaInfo(): string {
    return "amazon.co.uk";
  }

  canHandleScan(params: IScanParameters): boolean {
    return params.mainDomain === "amazon" && params.domain.endsWith("co.uk");
  }

  async scan(params: IScanParameters) {
    console.log(`Amazon UK Scanner: ${params.domain} - ${params.mainDomain}`);
    let pageResults: PageResults = { numPages: 0, pageUrls: [] };
    return pageResults;
  }
}
