import index from '@/page/index.html';
import noFind from '@/page/404.html';

export const router = {
    '/': index
}

export function getRouter(pathname) {
    return router[pathname] || noFind;
}