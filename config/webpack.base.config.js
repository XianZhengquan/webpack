'use strict';

const paths = require('./paths');
const path = require('path');
const webpack = require('webpack');
const ModuleScopePlugin = require('./utils/ModuleScopePlugin');
const modules = require('./modules');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// happypack
const HappyPack = require('happypack');
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({size: os.cpus().length});
const postcssNormalize = require('postcss-normalize');
const eslintFormatter = require('./utils/eslintFormatter');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const resolvePath = dir => path.join(__dirname, '..', dir);

module.exports = (mode = 'development') => ({
    entry: [
        paths.appIndexJs
    ],
    resolve: {
        modules: ['node_modules', paths.appNodeModules].concat(
            modules.additionalModulePaths || []
        ),
        extensions: paths.moduleFileExtensions
            .map(ext => `.${ext}`)
            .filter(ext => !ext.includes('ts')),
        alias: {
            '@': resolvePath('src')
        },
        plugins: [
            new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
        ]
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx)$/,
                enforce: 'pre',
                include: paths.appSrc,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            formatter: eslintFormatter,
                            eslintPath: require.resolve('eslint')
                        }
                    }
                ]
            },
            {
                // oneOf 的规则，只执行匹配到的第一个规则
                oneOf: [
                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                        use: [
                            {
                                loader: require.resolve('url-loader'),
                                options: {
                                    limit: 10000,
                                    name: 'static/media/[name].[hash:8].[ext]'
                                }
                            }
                        ]
                    },
                    {
                        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                        use: [
                            {
                                loader: require.resolve('@svgr/webpack'),
                                options: {
                                    icon: true
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(js|jsx)$/,
                        include: paths.appSrc,
                        exclude: /node_modules/,
                        use: [
                            {
                                loader: 'happypack/loader?id=happyBabel'
                            }
                        ]
                    },
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        use: [
                            {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    babelrc: false,
                                    configFile: false,
                                    compact: false,
                                    presets: [
                                        [
                                            require.resolve('babel-preset-react-app/dependencies'),
                                            {helpers: true}
                                        ]
                                    ],
                                    cacheDirectory: true,
                                    cacheCompression: mode === 'production',
                                    sourceMaps: false
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(css|less)$/,
                        // include: [paths.appSrc, path.join(__dirname, '../node_modules/antd')],
                        exclude: /\.module\.(css|less)$/,
                        use: [
                            {
                                loader: require.resolve('style-loader')
                            },
                            mode === 'production' && {
                                loader: MiniCssExtractPlugin.loader,
                                options: {publicPath: '../../'}
                            },
                            {
                                loader: require.resolve('css-loader'),
                                options: {
                                    importLoaders: 1,
                                    sourceMap: false
                                }
                            },
                            {
                                loader: require.resolve('postcss-loader'),
                                options: {
                                    ident: 'postcss',
                                    plugins: () => [
                                        require('postcss-flexbugs-fixes'),
                                        require('postcss-preset-env')({
                                            autoprefixer: {
                                                flexbox: 'no-2009'
                                            },
                                            stage: 3
                                        }),
                                        postcssNormalize()
                                    ],
                                    sourceMap: false
                                }
                            },
                            {
                                loader: require.resolve('less-loader'),
                                options: {
                                    modifyVars: {
                                        '@primary-color': '#3A549D',// 主题色
                                        '@layout-sider-background': '#212348',// 左边sider的bg
                                        '@layout-body-background': '#F2F4FA',// 右边content的bg
                                        '@input-border-color': '#AEB7D1',// input的border-color
                                        '@select-border-color': '#AEB7D1',// select的border-color
                                        '@table-header-bg': '#EEF2FC'// table header的bg
                                    },
                                    javascriptEnabled: true
                                }
                            }
                        ].filter(Boolean),
                        sideEffects: true
                    },
                    {
                        loader: require.resolve('file-loader'),
                        exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'static/media/[name].[hash:8].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HappyPack({
            id: 'happyBabel',
            threadPool: happyThreadPool,
            use: [
                {
                    loader: require.resolve('babel-loader'),
                    options: {
                        customize: require.resolve('babel-preset-react-app/webpack-overrides'),
                        plugins: [
                            [
                                'import',
                                {
                                    libraryName: 'antd',
                                    libraryDirectory: 'es',
                                    style: true
                                }
                            ]
                        ],
                        cacheDirectory: true,
                        cacheCompression: false,
                        compact: false
                    }
                }
            ]
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ],
    // 性能提示
    performance: false
});
