const UNCREATED = 'UNCREATED';
const CREATED = 'CREATED';

const componentCache = {};

// 创建节点函数
function createFragment(children) {
    const fragment = document.createDocumentFragment();

    (children || []).forEach(item => {
        fragment.appendChild(item);
    });

    return fragment;
}
function createElement(tagName, attr, children) {
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
}
function createText(content) {
    const dom = document.createTextNode(content.replace(/\s/g, ''));
    return dom;
}
function createComponent(cid, slotNodes) {
    const $dom = componentCache[cid].$el ? componentCache[cid].$el.cloneNode(true) : componentCache[cid].render();
    const fragment = document.createDocumentFragment();

    (slotNodes || []).forEach(item => {
        fragment.appendChild(item);
    });

    const $slot = $dom.getElementsByTagName('slot');
    // slot 插槽替换
    if ($slot.length > 0) {
        $dom.replaceChild(fragment, $slot[0]);
    }

    return $dom;
}
function getFor(data, callback) {
    const fragment = document.createDocumentFragment();

    (data || []).forEach((item, i) => {
        fragment.appendChild(callback(item, i));
    });

    return fragment;
}
function getIf(condition, fragment) {
    return !!(condition) ? fragment : document.createDocumentFragment();
}

// 构建创建dom代码
function createCode(option) {
    const { type, content, tagName, attr, children } = option;
    const childCode = [];

    (children || []).forEach(item => {
        childCode.push(createCode.call(this, item));
    });

    if (type === -1) {
        // 节点碎片
        return 'createFragment([' + childCode.join(',') + '])';
    } else if (type === 1) {
        // 普通节点
        return 'createElement("' + tagName + '", ' + JSON.stringify(attr) + ',[' + childCode.join(',') + '])';
    } else if (type === 2) {
        // 文本节点
        return 'createText(' + textParse(content) + ')';
    } else if (type === 3) {
        // 组件
        let componentConfig = this.config.component[tagName];
        // 父组件传参处理
        const props = {};
        Object.keys(attr).forEach(key => {
            if (key.indexOf(':') === 0) {
                props[key.replace(/^:?/, '')] = createFunction(attr[key]).call(this.data); // attr[key];
            } else {
                props[key] = attr[key];
            }
        });

        const $vuiComponent = new VuiComponent({
            $parent: this,
            config: componentConfig,
            props
        });

        $vuiComponent.$attrs = attr;

        this.$children.push($vuiComponent);
        $vuiComponent.slotCodeReader = createFunction('createFragment([' + childCode.join(',') + '])');

        return 'createComponent("' + $vuiComponent.cid + '", [' + childCode.join(',') + '])';
    } else if (type === 4) {
        // 指令
        let code = '';
        switch (tagName) {
            case 'v-for':
                const { data, item, index } = attr;
                code = 'getFor(' + data + ', function(' + item + ',' + index + '){ return ' + createCode.call(this, { type: -1, children }) + '})'
                break;
            case 'v-if':
                const { test } = attr;
                code = 'getIf(' + test + ', ' + createCode.call(this, { type: -1, children }) + ')';
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
    return new Function('with(this){return ' + code + '}');
}

class VuiComponent {
    constructor({ $parent, config, props }) {
        this.cid = config.name + Math.random();
        this.$el = null;
        this.componentName = config.name;
        this.$parent = $parent;
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
        const newDom = this.render();
        const fragment = document.createDocumentFragment();
        this.$el.innerHTML = '';
        let slotFragment = null;
        // 当组件内有solt时候需要保留solt内容
        if (this.slotCodeReader) {
            slotFragment = this.slotCodeReader.call({
                createFragment,
                createElement,
                createText,
                createComponent,
                getFor,
                getIf,
                ...this.$parent.data
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

        this.$el.appendChild(fragment);

        /* if (this.$slot && this.$slot.length) {
            const $slot = this.$el.getElementsByTagName('slot');
            const fragment = document.createDocumentFragment();
            // this.$el.replaceChild(this.$parent.createChildrenFragment(this.slot), $slot[0]);
            this.$slot.forEach(_dom => {
                fragment.appendChild(_dom);
            });
            this.$el.replaceChild(fragment, $slot[0]);
        } */
    }
    // 更新数据
    setData(data) {
        this.renderEnd = false;
        this.data = {
            ...this.data,
            ...data
        };

        // 传给子组件的值也要更新
        this.$children.forEach(item => {
            Object.keys(item.$attrs).forEach(key => {
                if (key.indexOf(':') === 0) {
                    item.props[key.replace(/^:?/, '')] = createFunction(item.$attrs[key]).call(this.data);
                } else {
                    item.props[key] = item.$attrs[key];
                }
            });
        });

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
        // this.$el = this.render();

        // 将组件dom缓存起来
        componentCache[this.cid] = this;
    }

    render() {
        const $el = this.$render.call({
            createFragment,
            createElement,
            createText,
            createComponent,
            getFor,
            getIf,
            props: this.props,
            ...this.data
        });

        if (!this.$el) {
            this.$el = $el;
        }

        return $el;
    }
}

class Vui extends VuiComponent {
    constructor({ id, config }) {
        super({ config });
        this.$app = document.querySelector(id);
        // this.init(config);
        const $el = this.render();
        this.$app.appendChild($el);
    }

    /* init(config) {
        const $vuiComponent = new VuiComponent({
            config: config
        });

        this.$app = $vuiComponent;
        this.$el.appendChild(this.$app.$el);
    } */
}

export default Vui; 