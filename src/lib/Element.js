// 节点构造函数
export default class Element {
    constructor(tagName, attr, children, context) {
        this.tagName = tagName;
        this.attr = attr;
        this.context = context;
        this.text = undefined;
        this.children = undefined;

        if (tagName === undefined) {
            this.text = children;
        } else if (tagName === 'comment') {
            this.text = children;
        } else if (tagName.indexOf('component-') === 0) {
            this.child = children;
        } else {
            this.children = children;
        }

        if (this.children && this.children.length > 0) {
            let count = 0;
            this.children.forEach(item => {
                count += item.count;
            });

            this.count = count + this.children.length;
        } else {
            this.count = 0;
        }
    }

    render() {
        let el = null;
        if (this.tagName === undefined) {
            el = document.createTextNode(this.text);
        } else if (this.tagName === 'comment') {
            el = document.createComment(this.text);
        } else if (this.tagName.indexOf('component-') === 0) {
            el = this.child.$vNode.render();
        } else {
            el = (this.tagName === 'fragment' || this.tagName === 'slot') ? document.createDocumentFragment() : document.createElement(this.tagName);
        }

        if (!this.context.$el) {
            this.context.$el = el;
        }

        this.elm = el;

        // 节点属性设置
        if (this.attr) {
            Object.keys(this.attr).forEach(key => {
                el.setAttribute(key, this.attr[key]);
            });
        }

        // 处理子元素，如果是虚拟dom，继续渲染，如果不是，继续徐然
        (this.children || []).forEach(child => {
            child = child.render();
            // 添加子元素到当前元素
            el.appendChild(child)
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
}

export function createElement(tagName, attr, children) {
    return new Element(tagName, attr, children, this.$vui);
};