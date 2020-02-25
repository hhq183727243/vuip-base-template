// 通过 CommonJS 规范导入 show 函数
// const show = require('./show.js');
//import show from '../show.js'
import Vui from '@/lib/Vui.js';
import { getRouter } from '@/router';

// import { VuiRouter } from '@/lib/VuiRouter';

import '@/main.less'
// 通过new DefinePlugin设置process.env.NODE_ENV 值，见webpack.config.plugins.js配置

/* //异步加载
import('../show.js').then(({show}) => {
    // 执行 show 函数
    if(process.env.NODE_ENV === 'production'){
        show('Webpack production');
    }else{
        show('Webpack develop');
    }
}); */
const startTime = new Date().getTime();
const axios = window['axios'];

Vui.prototype.request = {
    'post': function (url, data, option) {
        return axios.post(url, data).then(res => {
            return res.data;
        })
    },
    'get': function (url, option) {
        return axios.get(url).then(res => {
            return res.data;
        });
    }
};

let vui = new Vui({
    id: '#app',
    config: getRouter(location.pathname)
});

function findAtag(node) {
    if (node.nodeName === 'A') {
        return node;
    }
    if (!node.parentNode) {
        return false;
    }
    return findAtag(node.parentNode)
}

// 点击a标签阻止默认事件
window.addEventListener('click', function (e) {
    const a = findAtag(e.target);
    if (a && a.pathname !== 'void(0);') {
        e.preventDefault();

        vui.uninstall();

        vui = new Vui({
            id: '#app',
            config: getRouter(a.pathname)
        });

        history.pushState(null, null, a.pathname)
    }
});

function onUpdateSize() {
    const _screenX = document.documentElement.offsetWidth;
    const fontSize = 20 / 375 * _screenX + 'px';

    document.documentElement.style.fontSize = fontSize;
    document.documentElement.setAttribute('data-scale', '');
}

window.onresize = () => {
    onUpdateSize();
};

onUpdateSize();

console.log(vui);
console.log(new Date().getTime() - startTime);
console.log(process.env.NODE_ENV);