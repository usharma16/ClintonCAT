import escapeRegex from './escape-regex';

describe(escapeRegex.name, () => {
    it('should escape special regex characters', () => {
        const input = '[.*+?^${}()|\\]';
        const expectedOutput = '\\[\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\\\\\]';
        expect(escapeRegex(input)).toBe(expectedOutput);
    });

    it('should return the same string if no special characters are present', () => {
        expect(escapeRegex('hello world')).toBe('hello world');
    });

    it('should handle an empty string', () => {
        expect(escapeRegex('')).toBe('');
    });

    it('should escape mixed alphanumeric and special characters', () => {
        const input = 'Hello$World?';
        const expectedOutput = 'Hello\\$World\\?';
        expect(escapeRegex(input)).toBe(expectedOutput);
    });

    it('should escape multiple occurrences of the same special character', () => {
        const input = '***';
        const expectedOutput = '\\*\\*\\*';
        expect(escapeRegex(input)).toBe(expectedOutput);
    });
});
