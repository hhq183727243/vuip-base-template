const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ParallelUglifyPlugin =require('webpack-parallel-uglify-plugin');

module.exports = {
    mode: 'production',
    plugins: [
        new DefinePlugin({
            //设置打包环境，在业务代码中可以通过 process.env.NODE_ENV === 'production' 去判断是否为生产环境还是开发环境
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new CleanWebpackPlugin({
            root: path.resolve(__dirname, '../'), //根目录
            verbose: true, //是否启用控制台输出信息
            dry: false //设置为false,启用删除文件
        }),
        new ParallelUglifyPlugin({
            // 传递给UglifyJS 的参数
            uglifyJS: {
                output: {
                    // 最紧凑输出
                    beautify: false,
                    // 删除注释
                    comments: false
                },
                compress: {
                    // warnings: false,
                    // 删除console语句
                    drop_console: true,
                    collapse_vars: true,
                    reduce_vars: true
                }
            }
        })
    ],
    optimization: {
        // 将node_mudules包独立打包一个vendors.js文件
        splitChunks: {
            chunks: 'all'
        }
    }
};