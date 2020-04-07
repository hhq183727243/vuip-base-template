import Count from './Count.html';
import Button from './Button.html';

const compts = {
    Count,
    Button
}

export default {
    install(_Vuip) {
        for (let key in compts) {
            _Vuip.component(key, compts[key]);
        }
    }
}