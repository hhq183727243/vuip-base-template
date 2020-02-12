import diff, { updateDom } from './VuiDiff.js';
import VuiFunc from './VuiFunc.js';

const UNCREATED = 'UNCREATED';
const CREATED = 'CREATED';
const componentCache = {};
const EVENTS = ['onclick', 'onchange', 'onscroll'];

let cid = 0;

function parseFun(value) {
    if (!value) {
        throw new Error('事件绑定错误');
    }

    const reg = /^(\w+)\s*\(?\s*([\w,\s]*)\s*\)?$/;
    const regRes = value.match(reg);
    const name = regRes[1];
    const params = regRes[2];

    return {
        name,
        params
    }
}

// 构建创建dom代码
function createCode(option) {
    const { type, content, tagName, attr = {}, children } = option;
    const childCode = [];

    (children || []).forEach(item => {
        childCode.push(createCode(item));
    });

    let _attrStr = '{';
    let _eventStr = '';
    Object.keys(attr).forEach((key, index) => {
        if (EVENTS.includes(key)) {
            const { name, params } = parseFun(attr[key]);
            _eventStr += `"${key.replace('on', '')}": function($event){ return this.${name}(${/\w/.test(params) ? (params + ',') : ''}$event)},`;
        } else if (key.indexOf('v-on:') === 0 && type === 3) {
            // 父子组件通信
            const { name, params } = parseFun(attr[key]);
            _attrStr += `"${key.replace(/^v-on:?/, '')}": function(a,b,c,d,e,f){ return $vui.${name}(${/\w/.test(params) ? (params + ',') : ''}a,b,c,d,e,f)},`; // :开头说明是表达式
        } else {
            if (key.indexOf(':') === 0) {
                _attrStr += `"${key.replace(/^:?/, '')}": ${attr[key]},`; // :开头说明是表达式
            } else {
                _attrStr += `"${key}": "${attr[key]}",`; // 否则是字符串
            }
        }
    });
    _attrStr += '}';
    _eventStr = _eventStr !== '' ? ('{' + _eventStr + '}') : '';
    let _objStr = '{"attrs": ' + _attrStr + (_eventStr !== '' ? (', "on": ' + _eventStr) : '') + '}';

    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots()';
        } else {
            return 'createElement("' + tagName + '", ' + _objStr + ',[' + childCode.join(',') + '])';
        }
    } else if (type === 2) {
        // 文本节点
        return 'createElement(undefined, null, ' + textParse(content.replace(/\r\n/g, '')) + ')';
    } else if (type === 3) {
        // 组件
        return 'createComponent("' + tagName + '", ' + _attrStr + ',[' + childCode.join(',') + '], __option__)';
    } else if (type === 4) {
        // 指令
        let code = '';
        switch (tagName) {
            case 'v-for':
                // v-for 标签下只能有一个标签节点
                const { data = [], item = 'item', index = 'index' } = attr;

                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return ' + childCode[0] + '; }, __option__)';
                } else {
                    throw new Error('v-for 标签下只能有一个标签节点');
                }
                break;
            case 'v-if':
                // v-if 标签下只能有一个标签节点
                const { test } = attr;
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = 'getIf(' + test + ', function(){ return ' + childCode[0] + ';})';
                } else {
                    throw new Error('v-if 标签下只能有一个标签节点');
                }
                break;
            default: code = ''; break;
        }
        return code;
    }
}

// 文本解析
function textParse(text, data) {
    // {{}}匹配
    const reg = /\{\s*([\w\.:\?\+\-\*\/\s'"=]+)\s*\}/g;
    const originText = text;
    let result;

    while ((result = reg.exec(originText)) !== null) {
        text = text.replace(result[0], `" + ${result[1]} + "`);
    }

    // 拼接成："字符串" + name + "字符串";
    return '"' + text + '"';
}

function createFunction(code) {
    return new Function('__option__', 'with(this){return ' + code + '}');
}

const Lifecycle = {
    // 装载结束
    mounted() {
        console.log('mounted');
    },
    // 将要更新
    willUpdate() {
        console.log('willUpdate');
    },
    // 更新结束
    updated() {
        console.log('updated');
    },
    // 将要卸载
    willUnmount() {
        console.log('willUnmount');
    },
    // 卸载结束
    unmounted() {
        console.log('unmounted');
    }
}

export default class VuiComponent {
    constructor({ $parent, config, props = {}, $slots }) {
        this.cid = cid++;
        this.$el = null;
        this.componentName = config.name;
        this.$parent = $parent;
        this.$slots = $slots;
        if (typeof config.data === 'function') {
            this.data = config.data();
        } else {
            this.data = {};
        }
        this.config = Object.assign({
            methods: {},
            data() { return {} }
        }, Lifecycle, config);
        this.props = props;
        this.$children = [];
        this.componentState = UNCREATED; // 组件状态
        this.init(this.config);

        for (let funName in this.config.methods) {
            this[funName] = this.config.methods[funName];
        }
    }
    _reRender() {
        const $newVNode = this.renderVnode({
            update: true
        });

        const patches = diff(this.$vNode, $newVNode);

        if (patches.length) {
            console.log(patches);
            updateDom(patches);

            if (typeof this.config.updated === 'function') {
                this.config.updated.call(this);
            }
        }
    }
    // 更新数据
    setData(data, callback) {
        this.renderEnd = false;
        this.data = {
            ...this.data,
            ...data
        };

        // renderEnd 防止在一个事件循环中多次调用setData导致重复渲染
        new Promise((resolve) => {
            resolve();
        }).then(() => {
            if (!this.renderEnd) {
                this._reRender();
                this.renderEnd = true;
                callback && callback();
            }
        });
    }

    init() {
        const code = createCode(this.config.ast);
        this.$render = createFunction(code);
        this.$vNode = this.renderVnode();

        // 将组件dom缓存起来
        componentCache[this.cid] = this;

        // 自定义组件
        new Promise((resolve, reject) => {
            resolve();
        }).then(() => {
            if (typeof this.config.mounted === 'function' && this.componentState === UNCREATED) {
                this.componentState = CREATED;
                this.config.mounted.call(this);
            }
        });
    }

    renderVnode(option = {}) {
        return this.$render.call({
            ...VuiFunc,
            props: this.props,
            $vui: this,
            ...this.data,
        }, {
            update: false,
            ...option
        });
    }
}
