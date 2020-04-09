
// 单实例
let $store = null;

class Store {
    constructor(options) {
        const { state, mutations, actions } = options;
        if ($store) {
            return $store;
        }

        this.mutations = mutations;
        this.actions = actions;
        this._state = state;
        this._proxyState(state);

        $store = this;
    }

    _proxyState(state) {
        // 代理state，保证state 不能直接被赋值
        this.state = new Proxy(state, {
            get: (target, key, proxy) => {
                // console.log(this);
                if (typeof (target[key]) === 'function') {
                    return target[key].bind(this)(proxy);
                }

                return target[key];
            },
            set: () => {
                throw new Error(`VUIPX 不允许直接对state赋值，请通过reducers方式更新`);
            }
        });
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
            $store.mutations[type]($store._state, payload);

            // 这边需要做下依赖收集，判断数据是否有被引用，不然当更新没有被引用的数据是也会触发虚拟dom的对比
            $store.$app.setData();
        }

        if (type && typeof ($store.actions[type]) === 'function') {
            $store.actions[type]($store, payload);
        }
    }

}

export default {
    install() {

    },
    Store
};