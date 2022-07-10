const { resolve, join } = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: "./src/js/index.js",
  output: {
    path: resolve(__dirname, "dist"),
    filename: "scripts/bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(glb|fbx|jpg|png)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "assets/files",
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new CssMinimizerPlugin(), new UglifyJsPlugin()],
    usedExports: true,
  },
  devServer: {
    static: {
      directory: join(__dirname, "public"),
    },
    headers: { "Content-Encoding": "none" },
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Three app",
      template: "./src/index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
};
