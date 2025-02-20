import { DomainTools } from '@/domaintools';

describe('DomainTools', () => {
    let domainTools: DomainTools;

    beforeEach(() => {
        domainTools = new DomainTools();
    });

    test('extractMainDomain should extract main domain correctly', () => {
        expect(domainTools.extractMainDomain('www.example.com')).toBe('example');
        expect(domainTools.extractMainDomain('sub.domain.co.uk')).toBe('domain');
        expect(domainTools.extractMainDomain('example.org')).toBe('example');
        expect(domainTools.extractMainDomain('cloud.google.com')).toBe('google');
        expect(domainTools.extractMainDomain('linktr.ee')).toBe('linktr'); // This is probably fine to return to fuzzy finder?
    });

    test('isDomainExcluded should correctly check exclusions', () => {
        const exclusions: string[] = ['bad.com', 'malicious.net'];
        expect(domainTools.isDomainExcluded(exclusions, 'my.bad.com')).toBe(true);
        expect(domainTools.isDomainExcluded(exclusions, 'good.com')).toBe(false);
    });

    test('should log an error if the suffix database is missing', () => {
        // Backup the original database
        const originalDb: string[] = [...(DomainTools as { suffixDbDefault: string[] }).suffixDbDefault];

        // Force an empty suffix list
        (DomainTools as { suffixDbDefault: string[] }).suffixDbDefault = [];

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        new DomainTools();

        expect(consoleSpy).toHaveBeenCalledWith(
            "Error: Suffix database is missing or empty. Please run '../scripts/utils/tld2json.py' to generate the required JSON file."
        );

        // Restore original state
        (DomainTools as { suffixDbDefault: string[] }).suffixDbDefault = originalDb;
        consoleSpy.mockRestore();
    });
});
