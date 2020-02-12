import VuiComponent from "./VuiComponent";

function createFnInvoker(fns, vm) {
    function invoker() {
        var arguments$1 = arguments;

        var fns = invoker.fns;
        if (Array.isArray(fns)) {
            var cloned = fns.slice();
            for (var i = 0; i < cloned.length; i++) {
                invokeWithErrorHandling(cloned[i], arguments$1, vm);
            }
        } else {
            // return handler return value for single handlers
            return invokeWithErrorHandling(fns, arguments, vm)
        }
    }
    invoker.fns = fns;
    return invoker
}

function invokeWithErrorHandling(
    handler,
    args,
    vm,
) {
    var res;
    try {
        res = args ? handler.apply(vm, args) : handler.call(vm);
    } catch (e) {
        console.error(e);
    }
    return res
}

// 节点构造函数
export default class Element {
    constructor(tagName, option, children, context) {
        const { attrs, on } = option || {};
        this.tagName = tagName;
        this.context = context;
        this.text = undefined;
        this.children = undefined;
        this.on = on;
        this.attrs = attrs;

        if (tagName === undefined) {
            this.text = children;
        } else if (tagName === 'comment') {
            this.text = children;
        } else if (tagName.indexOf('component-') === 0) {
            this.child = children;
        } else {
            this.children = children;
        }

        /* if (this.children && this.children.length > 0) {
            let count = 0;
            this.children.forEach(item => {
                count += item.count;
            });

            this.count = count + this.children.length;
        } else {
            this.count = 0;
        } */
    }

    render() {
        let el = null;
        if (this.tagName === undefined) {
            el = document.createTextNode(this.text);
        } else if (this.tagName === 'comment') {
            el = document.createComment(this.text);
        } else if (this.tagName.indexOf('component-') === 0) {
            if (!(this.child instanceof VuiComponent)) {
                this.child = new VuiComponent(this.child);
                this.child.$parent.$children.push(this.child);
            }
            el = this.child.$vNode.render();
        } else {
            el = (this.tagName === 'fragment' || this.tagName === 'slot') ? document.createDocumentFragment() : document.createElement(this.tagName);
        }

        if (!this.context.$el) {
            this.context.$el = el;
        }

        this.elm = el;

        this.setAttrs();

        // 事件绑定
        if (this.on) {
            Object.keys(this.on).forEach(eventName => {
                const cut = createFnInvoker(this.on[eventName], this.context);
                el.addEventListener(eventName, cut, false);
            })
        }

        // 处理子元素
        (this.children || []).forEach(child => {
            if (Array.isArray(child)) {
                // v-for、slot为数组
                child.forEach(_c => {
                    // 添加子元素到当前元素
                    el.appendChild(_c.render())
                });
            } else {
                // 添加子元素到当前元素
                el.appendChild(child.render());
            }
        });

        if (this.tagName === 'slot') {
            this.context.$slots.forEach(child => {
                child = (child instanceof Element) ? child.render() : document.createTextNode(child)
                // 添加子元素到当前元素
                el.appendChild(child)
            });
        }

        return el;
    }
    // 更新节点属性
    updateAttrs(attrs) {
        this.attrs = attrs;
        this.setAttrs();
    }
    // 设置节点属性
    setAttrs() {
        // 节点属性设置
        if (this.attrs) {
            Object.keys(this.attrs).forEach(key => {
                let val = undefined;
                if (this.tagName === 'input' && key === 'value') {
                    this.elm.value = this.attrs[key];
                    return;
                } else if (this.tagName === 'img' && key === 'src' && this.attrs[key] && typeof this.attrs[key] === 'object') {
                    val = this.attrs[key].default;
                } else {
                    val = this.attrs[key];
                }

                this.elm.setAttribute(key, val);
            });
        }
    }
}


function normalizeChildren(children) {
    var arr = [];

    children.forEach(item => {
        if (Array.isArray(item)) {
            if (item._isVlist) {
                item.forEach((vn, i) => {
                    vn.key = '__vlist_' + item._index + '_' + i
                });
            }
            arr.push.apply(arr, item);
        } else {
            arr.push(item);
        }
    });

    return arr;
}

export function createElement(tagName, attr, children) {
    // 序列号节点，单遇到v-for、slot时需要序列号
    /* if (Array.isArray(children)) {
        children = normalizeChildren(children);
    } */

    return new Element(tagName, attr, children, this.$vui);
};