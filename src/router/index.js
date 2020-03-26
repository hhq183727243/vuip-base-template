import helloWorld from '@/page/helloWorld.html';

export const router = {
    '/helloWorld': helloWorld,
}

export function getRouter(pathname) {
    return router[pathname] || noFind;
}