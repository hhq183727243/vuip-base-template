import { createElement } from './Element.js';
import diff, { updateDom } from './Diff.js';

const UNCREATED = 'UNCREATED';
const CREATED = 'CREATED';
const componentCache = {};

/* function createElement(tagName, attr, children) {
    const dom = document.createElement(tagName);
    const fragment = document.createDocumentFragment();

    (children || []).forEach(item => {
        fragment.appendChild(item);
    });

    if (attr) {
        Object.keys(attr).forEach(key => {
            dom.setAttribute(key, attr[key]);
        });
    }

    dom.appendChild(fragment);

    return dom;
} */

function createText(content) {
    // const dom = document.createTextNode(content.replace(/\s/g, ''));
    return content;
}
function createSlots(key) {
    return this.$vui.$slots;
}
function createComponent(componentName, attr, slotNodes) {
    let componentConfig = this.$vui.config.component[componentName];

    // 父组件传参处理
    const props = {};

    Object.keys(attr).forEach(key => {
        if (key.indexOf(':') === 0) {
            props[key.replace(/^:?/, '')] = attr[key];
        } else {
            props[key] = attr[key];
        }
    });

    const $component = new VuiComponent({
        $parent: this.$vui,
        config: componentConfig,
        props,
        $slots: slotNodes
    });

    this.$vui.$children.push($component);

    $component.$attrs = attr;

    // $component.slotCodeReader = createFunction('createFragment([' + childCode.join(',') + '])');
    /* const fragment = document.createDocumentFragment();

    (slotNodes || []).forEach(item => {
        fragment.appendChild(item);
    });

    $component.$slots = slotNodes;

    const $slot = $el.getElementsByTagName('slot');
    // slot 插槽替换
    if ($slot.length > 0) {
        $el.replaceChild(fragment, $slot[0]);
    } */
    return createElement.call(this, `component-${$component.componentName}`, null, $component);
}
function getFor(data, callback, nextIndex) {
    // const fragment = document.createDocumentFragment();
    const vNodes = [];

    (data || []).forEach((item, i) => {
        // fragment.appendChild(callback(item, i));
        vNodes.push(callback(item, i));
    });

    vNodes._isVlist = true;
    vNodes._index = nextIndex;
    // return fragment;
    return vNodes// createElement.call(this, 'fragment', null, vNodes);
}
function getIf(condition, vNode) {
    return !!(condition) ? vNode : createElement.call(this, 'comment', null, condition);
}

// 构建创建dom代码
function createCode(option) {
    const { type, content, tagName, attr, children } = option;
    const childCode = [];

    (children || []).forEach(item => {
        childCode.push(createCode.call(this, item));
    });

    if (type === 1) {
        // 普通节点
        if (tagName === 'slot') {
            return 'createSlots()';
        } else {
            return 'createElement("' + tagName + '", ' + JSON.stringify(attr) + ',[' + childCode.join(',') + '])';
        }
    } else if (type === 2) {
        // 文本节点
        return 'createElement(undefined, null, ' + textParse(content.replace(/\r\n/g, '')) + ')';
    } else if (type === 3) {
        // 组件
        let _attrStr = '{';
        Object.keys(attr).forEach((key, index) => {
            if (key.indexOf(':') === 0) {
                _attrStr += `"${key}": ${attr[key]},` // :开头说明是表达式
            } else {
                _attrStr += `"${key}": "${attr[key]}",` // 否则是字符串
            }
        });
        _attrStr += '}';

        return 'createComponent("' + tagName + '", ' + _attrStr + ',[' + childCode.join(',') + '])';
    } else if (type === 4) {
        // 指令
        let code = '';
        switch (tagName) {
            case 'v-for':
                // v-for 标签下只能有一个标签节点
                const { data, item, index } = attr;
                // code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return ' + createCode.call(this, { type: -1, children }) + '})'
                if (!children || children.length === 0) {
                    code = '';
                } else if (children.length === 1) {
                    code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return ' + childCode[0] + '; }, nextIndex++)';
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
                    code = 'getIf(' + test + ', ' + childCode[0] + ')';
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
        // const val = getVal(result[1], data);
        text = text.replace(result[0], `" + ${result[1]} + "`);
    }

    return '"' + text + '"';
}

function createFunction(code) {
    return new Function('nextIndex', 'with(this){return ' + code + '}');
}


class VuiComponent {
    constructor({ $parent, config, props, $slots }) {
        this.cid = config.name + Math.random();
        this.$el = null;
        this.componentName = config.name;
        this.$parent = $parent;
        this.$slots = $slots;
        if (typeof config.data === 'function') {
            this.data = config.data();
        } else {
            this.data = {};
        }
        this.config = config;
        this.props = props;
        this.$children = [];
        this.componentState = UNCREATED; // 组件状态
        this.init(config);
    }
    _reRender() {
        const $newVNode = this.renderVnode();
        // const $newEl = $newVNode.render();
        // console.log(this.$vNode);
        // console.log($newVNode);
        // this.$el.parentNode.replaceChild($newEl, this.$el);
        // this.$el = $newEl;
        // this.$vNode = $newVNode;


        const patches = diff(this.$vNode, $newVNode);
        console.log($newVNode);

        updateDom(patches);
        /*  const fragment = document.createDocumentFragment();
         const slotFragment = document.createDocumentFragment();
         this.$el.innerHTML = '';
 
         // 当组件内有solt时候需要保留solt内容
         if (this.$slots) {
             this.$slots.forEach(item => {
                 slotFragment.appendChild(item);
             });
         }
 
         while (newDom.hasChildNodes()) {
             if (newDom.firstChild.tagName === 'SLOT' && slotFragment) {
                 fragment.appendChild(slotFragment);
                 newDom.removeChild(newDom.firstChild);
             } else {
                 fragment.appendChild(newDom.firstChild);
             }
         }
 
         this.$el.appendChild(fragment); */
    }
    // 更新数据
    setData(data) {
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
            }
        });
    }

    init() {
        // 自定义组件
        new Promise((resolve, reject) => {
            resolve();
        }).then(() => {
            if (typeof this.config.created === 'function' && this.componentState === UNCREATED) {
                this.componentState = CREATED;

                this.config.created.bind(this)();
            }
        });

        const code = createCode.call(this, this.config.ast);
        this.$render = createFunction(code);
        this.$vNode = this.renderVnode();

        // 将组件dom缓存起来
        componentCache[this.cid] = this;
    }

    renderVnode() {
        return this.$render.call({
            createElement,
            createSlots,
            createText,
            createComponent,
            getFor,
            getIf,
            props: this.props,
            $vui: this,
            ...this.data
        }, 0);
    }
}

class Vui extends VuiComponent {
    constructor({ id, config }) {
        super({ config });
        this.$app = document.querySelector(id);
        this.$el = this.$vNode.render();
        this.$app.appendChild(this.$el);
    }
}

export default Vui; 