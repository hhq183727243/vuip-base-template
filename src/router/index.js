import Vuip from 'vuip';
import VuipRouter from '@/router/vuip-router';
import index from '@/page/index.html';
import noFind from '@/page/404.html';
import todo from '@/page/todo.html';
import hello from '@/page/hello.html';

Vuip.use(VuipRouter);

const routerConfig = {
    '/': index,
    '/404': noFind,
    '/todo': todo,
    '/hello': hello,
}

const router = new VuipRouter(routerConfig);

export default router