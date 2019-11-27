// 通过 CommonJS 规范导入 show 函数
// const show = require('./show.js');
//import show from '../show.js'
import home from '@/page/home.html';
import list from '@/page/list.html';
import noFind from '@/page/404.html';
import Vui from '@/lib/Vui';
import { VuiRouter } from '@/lib/VuiRouter';

import '@/main.css'
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

const router = {
    '/list': list,
    '/': home,
    '/home': home,
};

const vui = new Vui({
    id: '#app',
    config: router[location.pathname] || noFind
});

console.log(vui);
console.log(new Date().getTime() - startTime);

// window.document.getElementById('app').appendChild(render(home));

console.log(process.env.NODE_ENV);