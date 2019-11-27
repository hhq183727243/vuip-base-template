export default class Dep {
    constructor() {
        /* 用来存放Watcher对象的数组 */
        this.subs = [];
        this.watcherId = [];
    }
    /* 在subs中添加一个Watcher对象 */
    addSub(sub) {
        this.subs.push(sub);
    }
    /* 通知所有Watcher对象更新视图 */
    notify() {
        this.subs.forEach((sub) => {
            sub.update();
        })
    }
}

