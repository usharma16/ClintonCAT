import eslint from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import checkFile from 'eslint-plugin-check-file';
import prettier from 'eslint-plugin-prettier/recommended';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default tseslint.config(
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        files: ['**/*.{mjs,js,jsx,mts,ts,tsx}'],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.strictTypeChecked,
            tseslint.configs.stylisticTypeChecked,
            prettier,
        ],
        plugins: {
            'check-file': checkFile,
        },
        rules: {
            '@typescript-eslint/no-confusing-void-expression': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            'check-file/filename-naming-convention': [
                'error',
                {
                    '**/*.{js,jsx,ts,tsx}': 'KEBAB_CASE',
                },
                {
                    ignoreMiddleExtensions: true,
                },
            ],
        },
    },
    includeIgnoreFile(gitignorePath),
    {
        ignores: [
            'node_modules',
            'dist',
            '**/webpack.config.js',
            '**/eslint.config.mjs',
            '**/jest.config.ts',
            '**/webpack-plugins',
            '**/scripts',
        ],
    }
);
