import Vuip from 'vuip';
import App from '@/layouts/index.html';
import VuipRouter from '@/router/vuip-router';
import routes from '@/router';
import store from '@/store';
import GlobalCompt from '@/components';
import '@/main.less';

const axios = window['axios'];

Vuip.use(GlobalCompt);
Vuip.use(VuipRouter);

Vuip.prototype.request = {
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

const router = new VuipRouter(routes);

new Vuip({
    id: '#app',
    render: h => h(App),
    router,
    store
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
