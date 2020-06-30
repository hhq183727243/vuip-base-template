
// 单实例
let $store = null;

class Store {
    constructor(options) {
        const { state, mutations, actions, aliasName = '_g' } = options;
        if ($store) {
            return $store;
        }

        this.mutations = mutations;
        this.actions = actions;
        this.state = state;
        this.aliasName = aliasName;

        $store = this;
    }


    // 接收一个对象{type: '', payload: ''}，描述触发reducers类型和附带参数
    dispatch(action = { type: '', payload: {} }, data) {
        let type = '';
        let payload = '';

        if (typeof (action) === 'object') {
            type = action['type'];
            payload = action['payload'];
        } else if (typeof (action) === 'string') {
            type = action;
            payload = data;
        } else {
            throw new Error(`dispatch 参数错误，参考文献...`);
        }

        if (type && typeof ($store.mutations[type]) === 'function') {
            // 通过修改_state映射代理state的修改
            $store.mutations[type]($store.state, payload);

            // 这边需要做下依赖收集，判断数据是否有被引用，不然当更新没有被引用的数据是也会触发虚拟dom的对比
            if ($store.$app) {
                $store.$app.setData();
            }
        }

        if (type && typeof ($store.actions[type]) === 'function') {
            $store.actions[type]($store, payload);
        }
    }

}

export default {
    install(_Vuip) {

    },
    Store
};