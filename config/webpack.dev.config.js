const path = require('path');
const DefinePlugin = require('webpack/lib/DefinePlugin');

module.exports = {
    devtool: 'cheap-module-eval-source-map',
    mode: 'development',
    plugins: [
        new DefinePlugin({
            //设置打包环境，在业务代码中可以通过 process.env.NODE_ENV === 'production' 去判断是否为生产环境还是开发环境
            'process.env': {
                NODE_ENV: JSON.stringify('develop')
            }
        }),
    ],
    devServer: {
        contentBase: [path.join(__dirname, "../dist"), path.join(__dirname, "../public")],//告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
        publicPath: '/', // 设置项目目录，localhost:8080/目录/路由
        historyApiFallback: true, //不跳转
        inline: true, //实时刷新,
        port: 8080,
        host: "0.0.0.0", // 默认是 localhost。如果你希望服务器外部可访问，指定如下：host: "0.0.0.0"
        proxy: {
            '/api': {
                target: 'http://localhost:3080',
                pathRewrite: { '^/api': '/api' },
                changeOrigin: true,     // target是域名的话，需要这个参数，
                secure: false,          // 设置支持https协议的代理
            }
        }
    },
};