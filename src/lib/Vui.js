import VuiComponent from './VuiComponent.js';


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


class Vui extends VuiComponent {
    constructor({ id, config }) {
        super({ config });
        this.$app = document.querySelector(id);
        this.$el = this.$vNode.render();
        this.$app.innerHTML = '';
        this.$app.appendChild(this.$el);
    }
}

export default Vui; 