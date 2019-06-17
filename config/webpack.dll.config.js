const path = require('path');
const webpack = require('webpack');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const dllPath = path.join(__dirname, '..', 'dll');

module.exports = {
    mode: 'production',
    entry: {
        vendor: [
            'react',
            'react-dom',
            'antd'
        ]
    },
    output: {
        path: dllPath,
        filename: '[name].dll.js',
        library: '[name]_dll_[hash]',
        libraryTarget: 'this'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DllPlugin({
            context: process.cwd(),
            name: '[name]_dll_[hash]',
            path: path.join(__dirname, '..', 'dll/[name].manifest.json')
        })
    ],
    performance: false
};
