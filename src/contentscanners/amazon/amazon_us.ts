import { IContentScannerPlugin, IScanParameters } from "../../contentscanner";
import { PageResults } from "../../database";

export class AmazonUSPageScanner implements IContentScannerPlugin {
  metaInfo(): string {
    return "amazon.com";
  }

  canHandleScan(params: IScanParameters): boolean {
    return params.mainDomain === "amazon" && params.domain.endsWith("com");
  }

  async scan(params: IScanParameters) {
    console.log(`Amazon US Scanner: ${params.domain} - ${params.mainDomain}`);
    let pageResults: PageResults = { numPages: 0, pageUrls: [] };
    return pageResults;
  }
}
