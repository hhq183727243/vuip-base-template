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

const vui = new Vui({
    id: '#app',
    config: getRouter(location.pathname)
});

console.log(vui);
console.log(new Date().getTime() - startTime);

// window.document.getElementById('app').appendChild(render(home));

console.log(process.env.NODE_ENV);

// 00011001100110011001100110011001100110011001100110011001
// 00011001100110011001100110011001100110011001100110011001
//0.00110011001100110011001100110011001100110011001100110011