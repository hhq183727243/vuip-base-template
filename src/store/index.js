import vuip from 'vuip';
import vuipx from './vuipx';

vuip.use(vuipx);

const store = new vuipx.Store({
    state: {
        loginStatus: false,
        times: 1,
        user: {
            name: 'vuip'
        },
        todoList: [{
            id: 1,
            title: 'todo_1'
        }, {
            id: 2,
            title: 'todo_2'
        }],
        userName(state) {
            return state.user.name + state.times
        }
    },
    reducers: {
        // @state 原state，@action 携带参数
        updateState(state, payload) {
            state.loginStatus = payload.loginStatus
        },
        increment(state, payload) {
            state.times = state.times + payload.step
        }
    },
    actions: {
        asyncIncrement({ dispatch, state }, payload) {
            setTimeout(() => {
                dispatch('increment', {
                    step: 1
                });
            }, 1000);
        }
    }
});

export default store;