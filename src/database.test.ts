import { PagesDB, PageEntry } from './database';

describe('PagesDB', () => {
    describe('PagesDB page entries', () => {
        test('should find page entries', () => {
            const pagesDb = new PagesDB();

            pagesDb.setPages([
                {
                    pageTitle: 'something1',
                    popupText: '(Placeholder text for article in Test1)',
                    category: 'Test1',
                } as PageEntry,
                {
                    pageTitle: 'something2',
                    popupText: '(Placeholder text for article in Test2)',
                    category: 'Test2',
                } as PageEntry,
                {
                    pageTitle: 'something3',
                    popupText: '(Placeholder text for article in Test3)',
                    category: 'Test3',
                } as PageEntry,
            ]);

            const results1 = pagesDb.fuzzySearch('The something1');
            expect(results1.totalPagesFound).toBe(1);

            const results2 = pagesDb.fuzzySearch('The something1 product and the something2');
            expect(results2.totalPagesFound).toBe(2);
        });
    });

    describe('PagesDB fuzzySearch', () => {
        let pagesDb: PagesDB;

        beforeEach(() => {
            pagesDb = new PagesDB();

            pagesDb.setPages([
                { pageTitle: 'Laptop Repair Info', popupText: 'Laptop info', category: 'Hardware' },
                { pageTitle: 'Laptop Repairs Q&A', popupText: 'Laptop Q&A', category: 'Hardware' },
                { pageTitle: 'Laptop is repairable', popupText: 'Laptop instructions', category: 'Hardware' },
                { pageTitle: 'Phone Repair Shop', popupText: 'Phones are complex', category: 'Hardware' },
                { pageTitle: 'Laptop Keyboard tips', popupText: 'Laptop hardware tips', category: 'Hardware' },
                { pageTitle: 'Laptop Repaired Success', popupText: 'Laptop fix success', category: 'Hardware' },
            ]);
        });

        test('should match the single word "repair" only in whole-word contexts', () => {
            const results = pagesDb.fuzzySearch('repair');
            const matchedTitles = results.pageEntries.map((entry) => entry.pageTitle);

            expect(matchedTitles).toEqual(['Laptop Repair Info', 'Phone Repair Shop']);
        });

        test('should match any of the words: "laptop repair" when matchAllWords = false', () => {
            const results = pagesDb.fuzzySearch('laptop repair', false);
            const matchedTitles = results.pageEntries.map((entry) => entry.pageTitle);

            expect(matchedTitles).toEqual([
                'Laptop Repair Info', // matches "laptop" & "repair"
                'Laptop Repairs Q&A', // matches "laptop" but NOT "repair"
                'Laptop is repairable', // matches "laptop" but NOT "repair"
                'Phone Repair Shop', // matches "repair"
                'Laptop Keyboard tips', // matches "laptop"
                'Laptop Repaired Success', // matches "laptop" but NOT "repair"
            ]);
        });

        test('should require ALL words ("laptop" and "repair") when matchAllWords = true', () => {
            const results = pagesDb.fuzzySearch('laptop repair', true);
            const matchedTitles = results.pageEntries.map((entry) => entry.pageTitle);

            expect(matchedTitles).toEqual(['Laptop Repair Info']);
        });

        test('should sort by descending number of matched words', () => {
            const results = pagesDb.fuzzySearch('laptop info repair');
            const matchedTitles = results.pageEntries.map((entry) => entry.pageTitle);

            expect(matchedTitles[0]).toBe('Laptop Repair Info');
        });
    });

    describe('PagesDB findConsecutiveWords search', () => {
        let pagesDb: PagesDB;

        beforeEach(() => {
            pagesDb = new PagesDB();
            pagesDb.setPages([
                {
                    pageTitle: 'LG G4 Fiasco',
                    popupText: '(Placeholder text for article in LG)',
                    category: 'LG',
                },
                {
                    pageTitle: 'LG',
                    popupText: '(Placeholder text for article in Electronics companies)',
                    category: 'Electronics companies',
                },
                {
                    pageTitle: 'LG refrigerator warranty scandal',
                    popupText: '(Placeholder text for article in LG)',
                    category: 'LG',
                },
                {
                    pageTitle: 'LG Television sale of personal data',
                    popupText: '(Placeholder text for article in LG)',
                    category: 'LG',
                },
                {
                    pageTitle: 'Xiaomi Phone unlock requirements and procedure',
                    popupText: '(Placeholder text for article in Xiaomi)',
                    category: 'Xiaomi',
                },
            ]);
        });

        test('find only LG G4 phone Fiasco article', () => {
            const results1 = pagesDb.findConsecutiveWords('LG G4 Phone');
            expect(results1.totalPagesFound).toBe(1); // To find the product only
        });
    });

    describe('PagesDB how do you like them apples', () => {
        let pagesDb: PagesDB;

        beforeEach(() => {
            pagesDb = new PagesDB();
            pagesDb.setPages([{ pageTitle: 'Apple', popupText: 'shiny stuff alert', category: 'Hardware' }]);
        });

        test('should match the single word "Apple" only in whole-word contexts', () => {
            const results = pagesDb.fuzzySearch('apple');
            const matchedTitles = results.pageEntries.map((entry) => entry.pageTitle);

            expect(matchedTitles).toEqual(['Apple']);
        });
    });
});
