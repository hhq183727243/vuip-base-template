const loaderUtils = require('loader-utils');

module.exports = function (content) {
    // console.log(loaderUtils.getOptions(this)); // 获取配置
    //return content.replace('我是变量', '哈哈哈，被我替换了');

    return content;
};