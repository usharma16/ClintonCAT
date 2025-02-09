const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TouchManifestPlugin = require('./webpack-plugins/TouchManifestPlugin');
const PostBuildManifestPlugin = require('./webpack-plugins/PostBuildManifestPlugin');
const ReloadExtensionPlugin = require('./webpack-plugins/ReloadExtensionPlugin');

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === 'development';

    const browserTarget = env.browser || 'chromium';
    const manifestPath = `engines/${browserTarget}/manifest.json`;

    return {
        mode: isDevelopment ? 'development' : 'production',
        entry: {
            background: './src/background.ts',
            content: './src/content.ts',
            popup: './src/popup.tsx',
            options: './src/options.tsx',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
            clean: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.module\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                esModule: true,
                                modules: {
                                    namedExport: true,
                                    localIdentName: '[name]__[local]__[hash:base64:5]',
                                },
                            },
                        },
                    ],
                },

                {
                    test: /\.css$/,
                    exclude: /\.module\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: 'public/options.html',
                filename: 'options.html',
                chunks: ['options'],
            }),
            new HtmlWebpackPlugin({
                template: 'public/popup.html',
                filename: 'popup.html',
                chunks: ['popup'],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: manifestPath, to: 'manifest.json' },
                    { from: 'public/icons/clinton16.png', to: 'icon16.png' },
                    { from: 'public/icons/clinton32.png', to: 'icon32.png' },
                    { from: 'public/icons/clinton48.png', to: 'icon48.png' },
                    { from: 'public/icons/clinton128.png', to: 'icon128.png' },
                    { from: 'public/images/alert.png', to: 'alert.png' },
                ],
            }),
            new MiniCssExtractPlugin(),
            new TouchManifestPlugin(),
            new PostBuildManifestPlugin(),
            new ReloadExtensionPlugin(),
        ],
        devtool: isDevelopment ? 'cheap-module-source-map' : 'source-map',
    };
};
