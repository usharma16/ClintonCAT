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

        const alertImgUrl = chrome.runtime.getURL('alert.png');

        for (let i = 0; i < divElements.length; i++) {
            const divId = divElements[i].id;
            console.log('element', divId);

            const productTitleSelector = `#${divId} h2`;
            const imgSelector = `#${divId} h2`;
            console.log('productTitleSelector:', productTitleSelector);
            const h2: IElementData | undefined | null = await _params.dom.querySelector(productTitleSelector);
            // const h2: IElementData | undefined | null = await _params.dom.querySelectorByParentId(divId, 'h2');
            // const h2: IElementData | undefined | null = await _params.dom.querySelectorByParentId(divId, ':scope > h2');

            const h2Text = h2?.innerText;
            console.log('h2 id: ', h2?.id);
            console.log('h2 text: ', h2Text);

            if (h2Text) {
                const pagesFound = await _params.pagesDb.fuzzySearch(h2Text);
                console.log('pagesFound', pagesFound);
                if (pagesFound.totalPagesFound) {
                    console.log('Adding the CAT html: ', alertImgUrl);
                    await _params.dom.createElement(
                        divId,
                        'p',
                        `<a href="${pagesFound.pageUrls[0]}"><img id="alertIcon"  src="${alertImgUrl}" alt=""/></a>`
                        // `<a href="${pagesFound.pageUrls[0]}" target="_blank" \n` +
                        //     `   style="position: fixed; top: 10px; right: 10px; z-index: 1000;">\n` +
                        //     `  <img src="${alertImgUrl}" alt="Clinton is not pleased" \n` +
                        //     `       style="width: 128px; height: 128px; transition: transform 1.3s ease;">\n` +
                        //     '</a>'

                        // Note: adding a <script/> doesn't trigger execution
                    );

                    break; // Only add the first found page alert
                }
                pageResults.addResults(pagesFound);
            }
        }

        return pageResults;
    }
}
