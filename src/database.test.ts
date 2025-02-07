import { PagesDB } from './database';

test('should create pages db', () => {
    const pagesDb = new PagesDB();

    pagesDb.setPages(['something1', 'something2', 'something3']);

    const results1 = pagesDb.fuzzySearch('The something1');
    expect(results1.totalPagesFound).toBe(1);

    const results2 = pagesDb.fuzzySearch('The something1 product and the something2');
    expect(results2.totalPagesFound).toBe(2);
});
