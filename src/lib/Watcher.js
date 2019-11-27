import Dep from './Dep';

export default class Watcher {
    constructor(vm, obj, cb) {
        // 将 Dep.target 指向自己
        // 然后触发属性的 getter 添加监听
        // 最后将 Dep.target 置空
        Dep.target = this
        this.vm = vm;
        this.obj = obj
        this.cb = cb
        // this.value = obj[key]
        // Dep.target = null
    }
    update() {
        // 获得新值
        // this.value = this.obj[this.key]
        // 我们定义一个 cb 函数，这个函数用来模拟视图更新，调用它即代表更新视图
        // this.cb(this.value)
        // console.log(this.obj);
        this.cb.call(this.vm, this.obj);
    }
}