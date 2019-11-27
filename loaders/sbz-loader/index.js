const loaderUtils = require('loader-utils');
const createVirtualDomTree = require('./parse');

const htmlReg = /<template>([\s\S]*)<\/template>/;
const jsReg = /<script>([\s\S]*)<\/script>/;

function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

module.exports = function (content) {
    const html = content.match(htmlReg)[1];
    const js = content.match(jsReg)[1];

    const vDomTree = createVirtualDomTree(html);
    const _jsStr = trim(js).replace(/export default {/, 'export default { ast: ' + JSON.stringify(vDomTree) + ',');

    return _jsStr;
};