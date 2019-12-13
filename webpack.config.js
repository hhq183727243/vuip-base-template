const path = require('path');
const plugins = require('./webpack.config.plugins');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");//提取css到单独文件的插件

module.exports = function (env = {}, argv) {
    const isProduction = !!env.production;
    console.log('====================' + isProduction + '====================');
    const devtool = isProduction ? '' : 'cheap-module-eval-source-map';

    return {
        // JavaScript 执行入口文件
        devtool,

        // 配合devServer使用，当文件修改时通知 webpack-dev-server模块更新页面
        /* watch: true, //文件监听，原理是根据文件最后保存时间来判断是否有更新
        watchOptions: {
            ignored: /node_modules/, // 忽略node_modules下文件
            aggregateTimeout: 500, // 文件更新后等待1000ms 后只执行更新通知
            poll: 2, // 每秒监听几次
        }, */

        entry: {
            main: path.resolve(__dirname, './src/entry/main.js'),
            // app: path.resolve(__dirname, './src/entry/app.js'),
        },
        mode: 'development',
        output: {
            // 把所有依赖的模块合并输出到一个 bundle.js 文件
            filename: '[name].js?id=[hash:8]',
            // 输出文件都放到 dist 目录下
            path: path.resolve(__dirname, './dist'),
            // publicPath: 'http://cnd.com/',
            chunkFilename: "[id].chunk.js" // 非入口文件命名规则
        },
        module: {
            rules: [
                {
                    // 用正则去匹配要用该 loader 转换的 CSS 文件
                    test: /\.less$/,
                    use: [
                        //'style-loader',
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: 'http://css.cdn.com/', // 无效
                                hmr: true
                            }
                        }, {
                            loader: 'css-loader',
                        }, {
                            loader: 'less-loader',
                        }
                    ],
                }, {
                    // 自定义loader
                    test: /\.html$/,
                    loader: 'sbz-loader',
                    exclude: /node_modules/,
                    include: [
                        path.resolve(__dirname, "src/page"),
                        path.resolve(__dirname, "src/components"),
                    ],
                    options: {
                        name: '啊啊啊'
                    }
                }, {
                    test: /\.(png|jpg)$/,
                    use: [
                        { loader: 'url-loader?limit=8192' }
                    ]
                }
            ]
        },
        resolveLoader: {
            modules: ['node_modules', './loaders/']
        },
        plugins: plugins(isProduction),
        devServer: {
            contentBase: path.join(__dirname, "public"),//告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
            historyApiFallback: true, //不跳转
            inline: true, //实时刷新,
            port: 8090,
            host: "0.0.0.0" // 默认是 localhost。如果你希望服务器外部可访问，指定如下：host: "0.0.0.0"
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src/'),
            }
        }
    }
};