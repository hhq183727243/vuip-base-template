const merge = require('webpack-merge');
const base = require('./webpack.base.config');
const devConfig = require('./webpack.dev.config');
const prodConfig = require('./webpack.prod.config');

module.exports = function (mode = {}, argv) {
    const isProduction = !!mode.production;
    console.log('====================' + isProduction + '====================');

    return isProduction ? merge(base, prodConfig) : merge(base, devConfig);
};