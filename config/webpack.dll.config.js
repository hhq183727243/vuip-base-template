const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');

module.exports = {
    // JavaScript 执行入口文件
    mode: 'production',
    entry: {
        // 将 React 相关的模块放到一个单独的动态链接库中
        vuip: ['vuip'],
    },
    output: {
        // 输出的动态链接库的文件名称，［name］代表当前动态链接库的名称，
        // 也就是entry中配置的 vuip
        filename: '[name].dll.js',
        // 将输出的文件都放到 dist 目录下
        path: path.resolve(__dirname, '../public/dll'),
        //  存放动态链接库的全局变量名称，例如对于 react 来说就是 _dll_react
        // 之所以在前面加上_dll_ ，是为了防止全局变量冲突
        library: '_dll_[name]',
    },
    plugins: [
        // 接入 DllPlugin
        new DllPlugin({
            // 动态链接库的全局变量名称，需要和 output.library 中的保持一致
            // 该字段的值也就是输出的 manifest.json 文件中 name 字段的值
            // 例如在 react.manifest.json 中就有 "name"："_dll_react"
            name: '_dll_[name]',
            // 描述动态链接库的 manifest.json 文件输出时的文件名称
            path: path.join(__dirname, '../public/dll', '[name].manifest.json'),
        })
    ]
};