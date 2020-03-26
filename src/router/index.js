import _layout from '@/layouts/index.html';
import home from '@/page/home.html';
import helloWorld from '@/page/helloWorld.html';
import list from '@/page/list.html';
// import order from '@/page/order.html';
// import shop from '@/page/shop.html';
import noFind from '@/page/404.html';
import homeDB from '@/page/homeDB.html';
import orderDB from '@/page/orderDB.html';

export const router = {
    '/list': list,
    // '/order': order,
    // '/shop': shop,
    '/': home,
    '/home': home,
    '/homeDB': homeDB,
    '/orderDB': orderDB,
    '/helloWorld': helloWorld,
}

export const layout = _layout;

export function getRouter(pathname) {
    return router[pathname] || noFind;
}