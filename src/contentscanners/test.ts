import { IContentScannerPlugin, IScanParameters, IElementData } from '../contentscanner';
import { CATWikiPageSearchResults } from '../database';

// Simple test for simple test page, e.g.
// https://waynekeenan.github.io/ClintonCAT/tests/www/3products_1cat.html

// TODO: fix: accidentally reusing classnames will silently override other classes
export class TestScanner implements IContentScannerPlugin {
    metaInfo(): string {
        return 'test scanner';
    }

    canScanContent(_params: IScanParameters): boolean {
        return _params.domain.endsWith('waynekeenan.github.io') || _params.domain === 'localhost';
    }

    async scan(_params: IScanParameters): Promise<CATWikiPageSearchResults> {
        console.log(`Test Scanner: ${_params.domain} - ${_params.mainDomain}`);

        const divElements: IElementData[] = await _params.dom.querySelectorAll('div');
        console.dir(divElements);

        let pageResults = new CATWikiPageSearchResults();

        for (let i = 0; i < divElements.length; i++) {
            const divId = divElements[i].id;
            console.log('element', divId);

            const productTitleSelector = `#${divId} h2`;
            console.log('productTitleSelector:', productTitleSelector);
            const h2: IElementData | undefined | null = await _params.dom.querySelector(productTitleSelector);
            // const h2: IElementData | undefined | null = await _params.dom.querySelectorByParentId(divId, 'h2');
            // const h2: IElementData | undefined | null = await _params.dom.querySelectorByParentId(divId, ':scope > h2');

            const h2Text = h2?.innerText;
            console.log('h2 ', h2Text);

            if (h2Text) {
                const pagesFound = await _params.pagesDb.fuzzySearch(h2Text);
                console.log('pagesFound', pagesFound);
                pageResults.addPageUrls(pagesFound.pageUrls);
            }
        }

        return pageResults;
    }
}
