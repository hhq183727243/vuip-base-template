import AButton from './aui/Button.html';
import Card from './aui/Card.html';
import ATable from './aui/Table/Table.html';
import ARow from './aui/Row.html';
import ACol from './aui/Col.html';
import ATip from './aui/Tip.html';
import AAlert from './aui/Alert.html';
import AConfirm from './aui/Confirm.html';
import AModal from './aui/Modal.html';
import ASpin from './aui/Spin.html';
import AInput from './aui/Input.html';
import APage from './aui/Page.html';
import ASelect from './aui/Select.html';
import ARadio from './aui/Radio.html';
import ACheckbox from './aui/Checkbox.html';

const compts = {
    AButton,
    Card,
    ATable,
    ARow,
    ACol,
    ATip,
    AInput,
    ASelect,
    ARadio,
    ACheckbox,
    APage,
    ASpin
}

export default {
    install(_Vuip) {
        for (let key in compts) {
            _Vuip.component(key, compts[key]);
        }
        let alertInstace = null;

        function _alert(type, content = '', delay) {
            if (alertInstace && alertInstace._componentState !== 'uninstall') {
                return alertInstace.$proxyInstance;
            }

            alertInstace = _Vuip.mountComponent(AAlert, {
                type,
                content,
                delay: type !== 'loading' ? (delay || 1500) : delay
            }, document.body);

            if (type !== 'loading') {
                setTimeout(() => {
                    alertInstace = null;
                }, (delay || 1500) + 300);
            }

            return alertInstace.$proxyInstance;
        }

        _Vuip.prototype.alert = {
            info(content, delay) {
                return _alert('info', content, delay);
            },
            warn(content, delay) {
                return _alert('warn', content, delay);
            },
            error(content, delay) {
                return _alert('error', content, delay);
            },
            loading(content, delay) {
                return _alert('loading', content, delay);
            }
        };

        _Vuip.prototype.confirm = function (content, option) {
            _Vuip.mountComponent(AConfirm, {
                content,
                ...option
            }, document.body);
        };

        _Vuip.prototype.modal = function (content, option) {
            _Vuip.mountComponent(AModal, {
                content,
                ...option
            }, document.body);
        };
    }
}