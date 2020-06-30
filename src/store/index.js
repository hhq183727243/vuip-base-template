import vuipx from './vuipx';
import { request } from '@/utils/request';


const store = new vuipx.Store({
    aliasName: '_g', // 全局状态别名
    state: {
        loginStatus: false,
        times: 1,
        user: {
            naame: 'vuip'
        },
        todoList: [],
        /* userName(state) {
            return state.user.name + state.times
        } */
    },
    mutations: {
        // @state 原state，@payload 携带参数
        updateState(state, payload) {
            state.loginStatus = payload.loginStatus
        },
        increment(state, payload) {
            state.times = state.times + payload.step
        },
        updateTodoList(state, payload) {
            state.todoList = payload.todoList
        },
    },
    actions: {
        asyncIncrement({ dispatch, state }, payload) {
            setTimeout(() => {
                dispatch('increment', {
                    step: 1
                });
            }, 1000);
        },

        getTodoList({ dispatch, state }, payload) {
            request.get('/api/get_banner_list').then(res => {
                dispatch('updateTodoList', {
                    todoList: res.data.list
                });
            });
        }
    }
});

export default store