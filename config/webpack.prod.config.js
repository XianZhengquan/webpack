'use strict';

process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const paths = require('./paths');
const isWsl = require('is-wsl');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackConfig = require('./webpack.base.config');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
// smp
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(merge((webpackConfig('production')), {
    mode: 'production',
    devtool: false,
    output: {
        path: paths.appBuild,
        pathinfo: false,
        // 文件名称
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
        futureEmitAssets: true,
        publicPath: paths.servedPath,
        devtoolModuleFilenameTemplate: info =>
            path
                .relative(paths.appSrc, info.absoluteResourcePath)
                .replace(/\\/g, '/')
    },
    optimization: {
        minimize: true,
        minimizer: [
            // This is only used in production mode
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        comparisons: false,
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        ascii_only: true
                    }
                },
                parallel: !isWsl,
                // Enable file caching
                cache: true,
                sourceMap: false
            }),
            // This is only used in production mode
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    parser: safePostCssParser,
                    map: false
                }
            })
        ],
        splitChunks: {
            chunks: 'all',
            // name: true
        },
        runtimeChunk: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            favicon:path.resolve(__dirname,'../public/favicon.ico'),
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            inject: true,
            template: paths.appHtml
        }),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[contenthash:8].css',
            chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
        }),
        new WorkboxWebpackPlugin.GenerateSW({
            clientsClaim: true,
            exclude: [/\.map$/, /asset-manifest\.json$/],
            importWorkboxFrom: 'cdn',
            navigateFallback: paths.servedPath + '/index.html',
            navigateFallbackBlacklist: [
                new RegExp('^/_'),
                new RegExp('/[^/]+\\.[^/]+$')
            ],
            skipWaiting: true
        })
        /* new AddAssetHtmlWebpackPlugin({
             filepath: path.resolve(__dirname, '../dll/vendor.dll.js') // 对应的 dll 文件路径
         }),
         new webpack.DllReferencePlugin({
             manifest: path.resolve(__dirname, '../dll/vendor.manifest.json')
         })*/
    ]
}));
