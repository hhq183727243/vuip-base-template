import Vuip from 'vuip';
import App from '@/layouts/index.html';
import router from '@/_router';
import store from '@/store';
import request from '@/utils/request';
import GlobalCompt from '@/components';
import '@/main.less';

Vuip.use(GlobalCompt);
Vuip.use(request);
console.time()
new Vuip({
    id: '#app',
    render: h => h(App),
    router,
    store
});
console.timeEnd()

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
