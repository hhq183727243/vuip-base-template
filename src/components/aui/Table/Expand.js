export default {
    name: 'TableExpand',
    data() {
        return {}
    },
    created() {
        if (this.props.context) {
            // 保存原来$proxyRender
            this._$proxyRender = this.$proxyRender;
            // render 函数使用父级上下文代理
            this.$proxyRender = this.props.context.$proxyRender;
        }
    },
    render(c, vm) {
        const { column, value, data, index, context } = vm._$proxyRender.props;

        const html = column.render.call(context.$proxyInstance, value, data, index) || '';

        return c(html);
    }
}