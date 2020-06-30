/**
 * @description 监听page文件夹下文件更新，当新增或删除时可自动生成路由映射
 * @author heqing.huang 2020-4-23
**/

const fs = require('fs');
const path = require('path');

function init() {
    const pageBasePath = path.join(__dirname, '../src/page/');
    const basePathAlias = '@/page';
    const pageMap = {};

    function eachDir(_path, base) {
        const files = fs.readdirSync(_path);

        files.forEach(item => {
            const file = fs.statSync(path.join(_path, item));

            if (file.isDirectory()) {
                eachDir(path.join(_path, item), base + item + '/')
            } else {
                pageMap[base + item] = basePathAlias + base + item;

                // 默认文件夹首页，如page/index.html 可以被映射到路由 '/'
                if (item === 'index.html') {
                    pageMap[base !== '/' ? base.substring(0, base.length - 1) : base] = basePathAlias + base + item;
                }
            }
        });
    };

    eachDir(pageBasePath, '/');
    const _router = path.join(__dirname, '../src/_router/');
    const exists = fs.existsSync(_router);
    if (!exists) {
        fs.mkdirSync(_router);
    }
    const strArr = [];
    strArr.push('import vuip from "vuip";');
    strArr.push('import VuipRouter from "vuip-router";');
    for (let key in pageMap) {
        strArr.push(`import ${key.replace(/(\/|\.)/g, '_')} from "${pageMap[key]}";`)
    }
    strArr.push('const routerConfig = {');
    for (let key in pageMap) {
        strArr.push(`"${key.replace(/\.html$/, '')}": ${key.replace(/(\/|\.)/g, '_')},`)
    }
    strArr.push('}');
    strArr.push('vuip.use(VuipRouter);');
    strArr.push('const router = new VuipRouter(routerConfig);');
    strArr.push('export default router;');

    fs.writeFileSync(path.join(_router, 'index.js'), strArr.join('\r'));
}

module.exports = init;