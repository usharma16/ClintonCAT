import { PagesDB, IPageEntry } from './database';

test('should find page entries', () => {
    const pagesDb = new PagesDB();

    pagesDb.setPages([
        {
            pageTitle: 'something1',
            popupText: '(Placeholder text for article in Test1)',
            category: 'Test1',
        },
        {
            pageTitle: 'something2',
            popupText: '(Placeholder text for article in Test2)',
            category: 'Test2',
        },
        {
            pageTitle: 'something3',
            popupText: '(Placeholder text for article in Test3)',
            category: 'Test3',
        },
    ]);

    const results1 = pagesDb.fuzzySearch('The something1');
    expect(results1.totalPagesFound).toBe(1);

    const results2 = pagesDb.fuzzySearch('The something1 product and the something2');
    expect(results2.totalPagesFound).toBe(2);
});
