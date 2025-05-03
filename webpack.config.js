const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const webpack = require('webpack');
const fs = require('fs');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.js',
    output: {
      // filename: 'bundle.[contenthash].js',
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
    },
    // mode: isProduction ? 'production' : 'development',
    mode: 'development',
    // devtool: isProduction ? 'source-map' : 'inline-source-map', // Включение source maps
    devtool: false,
    resolve: {
      alias: {
        'phaser': path.resolve(__dirname, 'node_modules/phaser/dist/phaser.min.js')
      }
    },
    module: {
      rules: [
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'babel-loader',
        //   },
        // },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.(png|jpg|gif|mp3|ogg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
                context: 'assets',
                outputPath: 'assets',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        inject: 'body',
      }),
      new MiniCssExtractPlugin({
        // filename: '[name].[contenthash].css',
        filename: '[name].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'assets'), to: 'assets' },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode)
      })
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin(),
        new CssMinimizerPlugin(), // Минификация CSS
      ],
      minimize: false,
    },
    devServer: {
      static: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      open: true, // Открытие браузера при запуске сервера
      // server: {
      //   type: 'https',
      //   options: {
      //     key: fs.readFileSync(path.resolve(__dirname, 'key.pem')),
      //     cert: fs.readFileSync(path.resolve(__dirname, 'cert.pem')),
      //   },
      // },
      server: {
        type: 'http',
      },
      
    },
    ignoreWarnings: [
      {
        module: /node_modules/,
        message: /source map/,
      },
    ],
  };
};
