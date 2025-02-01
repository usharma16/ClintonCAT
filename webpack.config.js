const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.ts",
    content: "./src/content.ts",
    popup: "./src/popup.tsx",
    options: "./src/options.tsx",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "public/options.html",
      filename: "options.html",
      chunks: ["options"],
    }),
    new HtmlWebpackPlugin({
      template: "public/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/manifest.json", to: "manifest.json" },
        // { from: "public/icon.png", to: "icon.png" } // Copy other assets if needed
      ],
    }),
    new MiniCssExtractPlugin(),
  ],
};
