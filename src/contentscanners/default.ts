import { IContentScannerPlugin, IScanParameters } from '../contentscanner';
import { PageResults } from '../database';

export class DefaultScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'default scanner';
    }

    canHandleScan(_params: IScanParameters): boolean {
        // skipped in plugin search, explicitly called if no other plugins can handle the params
        return false;
    }

    async scan(params: IScanParameters): Promise<PageResults> {
        console.log(`Default Scanner: ${params.domain} - ${params.mainDomain}`);

        const pageResults: PageResults = { numPages: 0, pageUrls: [] };

        // const pNodes = await params.domHelper.queryDOM("p");
        // let pText : string = Array.from(pNodes).map(node => node.textContent?.trim() || "").join("\n");
        // console.log("p count", pNodes.length);
        // console.dir(pNodes);
        // console.log("p text", pText);
        //
        // const divNodes =  await params.domHelper.queryDOM("div");
        // const divHTML = Array.from(divNodes).map(div => div.textContent).join("\n");
        // console.log("div count", divNodes.length);
        // console.dir(divNodes);
        // console.log("div HTML", divHTML);
        // pageResults.pageUrls = params.pagesDb.fuzzySearch(pText + divHTML, params.pagesDbCachedList);

        const pText = await params.domHelper.queryDOMAsText('p');
        const divText = await params.domHelper.queryDOMAsText('div');
        console.log('p text', pText);
        console.log('div text', divText);

        pageResults.pageUrls = params.pagesDb.fuzzySearch(pText + divText, params.pagesDbCachedList);

        pageResults.numPages = pageResults.pageUrls.length;

        return pageResults;
    }
}
