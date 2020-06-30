const fs = require('fs');
const path = require('path');
const watch = require('./watch');
const merge = require('webpack-merge');
const base = require('./webpack.base.config');
const devConfig = require('./webpack.dev.config');
const prodConfig = require('./webpack.prod.config');


module.exports = function (mode = {}, argv) {
    const isProduction = !!mode.production;

    if (!isProduction) {
        watch();

        fs.watch(path.join(__dirname, '../src/page/'), {
            recursive: true
        }, (eventType, filename) => {
            // 每当文件名在目录中出现或消失时，就会触发 'rename' 事件
            if (filename && eventType === 'rename') {
                watch();
                console.log(`${filename} 更新...`);
            }
        });
    }

    return isProduction ? merge(base, prodConfig) : merge(base, devConfig);
};