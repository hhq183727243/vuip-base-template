import home from '@/page/home.html';
import list from '@/page/list.html';
import order from '@/page/order.html';
import shop from '@/page/shop.html';
import noFind from '@/page/404.html';

export const router = {
    '/list': list,
    '/order': order,
    '/shop': shop,
    '/': home,
    '/home': home,
}

export function getRouter(pathname) {
    return router[pathname] || noFind;
}