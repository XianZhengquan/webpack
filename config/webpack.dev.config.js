'use strict';

process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const paths = require('./paths');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackConfig = require('./webpack.base.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// smp
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();

module.exports = smp.wrap(merge((webpackConfig()), {
    mode: 'development',
    devtool: 'cheap-eval-source-map',
    output: {
        pathinfo: true,
        // 文件名称
        filename: 'static/js/bundle.js',
        chunkFilename: 'static/js/[name].chunk.js',
        devtoolModuleFilenameTemplate: (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))
    },
    devServer: {
        // 启用webpack的热模块替换功能
        hot: true,
        // 告诉服务器从哪里提供内容
        contentBase: paths.appBuild,
        host: 'localhost',
        port: 3000,
        historyApiFallback: {
            disableDotRule: true
        },
        proxy: {
            // 代理到后端的服务地址
        },
        // 告诉dev-server在服务器启动后打开浏览器。将其设置true为打开默认浏览器。
        open: true,
        // 当存在编译器错误或警告时，在浏览器中显示全屏覆盖
        overlay: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html', // 最终创建的文件名
            minify: {
                collapseWhitespace: true // 去除空白
            },
            inject: true,
            template: paths.appHtml
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
}));
