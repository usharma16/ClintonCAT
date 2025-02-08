import { PagesDB, PageEntry } from './database';

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
