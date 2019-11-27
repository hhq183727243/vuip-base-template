import Watcher from './Watcher';
import Dep from './Dep';

let uid = 0;

function VNode(tag, children, text, $el) {
    this.uid = uid++;
    this.tag = tag;
    //this.data = data;
    this.children = children;
    this.originText = text;
    this.$el = $el;
}

function createTagVNode(children, $el) {
    return new VNode($el.tagName, children, null, $el);
}

function createTextVNode(text, $el) {
    return new VNode(undefined, undefined, String(text), $el)
}

function observe(obj) {
    // 判断类型
    if (!obj || typeof obj !== 'object') {
        return
    }

    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    });
}

function defineReactive(obj, key, value) {
    observe(value) // 递归子属性

    let dep = new Dep();

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            // 为观察者注册订阅
            if (Dep.target && !dep.watcherId.includes(Dep.target.obj.uid)) {
                dep.watcherId.push(Dep.target.obj.uid);
                dep.addSub(Dep.target);
                Dep.target = null;
            }
            return obj[`__${key}`];
        },
        set: function (newVal) {
            // 新值如果是对象也进行劫持
            observe(newVal);

            // 设置不可枚举属性保存更新值
            Object.defineProperty(obj, `__${key}`, {
                value: newVal,
                writable: true
            });

            // 发布订阅
            dep.notify()
        }
    });

    // 初始值赋值
    obj[key] = value;
}

function handelInputEvent(cb) {
    cb();
}

class SzVue {
    constructor(props) {
        const options = Object.assign({
            id: null,
            data: {},
            methods: {},
            created() { }
        }, props);

        /* Object.keys(options).forEach(key => {
            this[key] = options[key]
        }); */

        Object.keys((options.data || {})).forEach(key => {
            this[key] = options.data[key]
        });

        this._init(options);
    }

    _init(options) {
        // 将data对象挂载到this上，并做数据劫持（监听）
        observe(this);

        this.$el = document.querySelector(`#${options.id}`);

        // 将methods挂载到this上
        this.eachMethods(options);

        // 虚拟dom生成
        this.vdom = this.templateParse(this.$el);
        this.bindData(this.vdom);
        console.log(this.vdom);
        this.created();
    }

    // methods 引用提升
    eachMethods(options) {
        Object.keys(options.methods).forEach(key => {
            this[key] = options.methods[key]
        });

        this.created = options.created;
    }

    // 模板解析
    templateParse($el) {
        const vdom = createTagVNode([], $el);

        $el.childNodes.forEach((_$el) => {
            if (_$el.nodeType === 3 && !!(_$el.data.trim())) {
                vdom.children.push(createTextVNode(_$el.data, _$el));
            } else if (_$el.nodeType === 1) {
                vdom.children.push(this.templateParse(_$el));
            }
        });

        return vdom;
    }

    // 通过key 获取data数据
    getVal(_keyStr, vdom, cb) {
        let keyStr = _keyStr.trim();
        let _val = '';
        let vm = this;

        (keyStr.trim()).split('.').forEach((key, index) => {
            // 获取值的时候添加订阅，如果后果该值有更新的时候就可以发布订阅
            new Watcher(vm, vdom, cb);

            if (index === 0) {
                _val = this[key];
            } else {
                _val = _val[key];
            }
        });

        return _val;
    }
    // 设置data值
    setVal(_keyStr, val) {
        let keyStr = _keyStr.trim();
        let obj = '';
        let len = keyStr.split('.').length;

        if (len === 1) {
            this[keyStr] = val;
        } else {
            (keyStr).split('.').forEach((key, index) => {
                if (0 === index) {
                    obj = this[key];
                } else if (index < len - 1) {
                    obj = obj[key];
                } else {
                    obj[key] = val;
                }
            });
        }
    }
    // 文本解析
    textParse(vdom) {
        // {{}}匹配
        const reg = /\{\{\s*([\w\.]+)\s*\}\}/g;
        const str = vdom.originText;
        let text = vdom.originText;
        let result;

        while ((result = reg.exec(str)) != null) {
            const val = this.getVal(result[1], vdom, this.textParse);

            text = text.replace(result[0], val);
        }

        vdom.$el.textContent = text;
    }

    // 表单v-model处理
    inputParse(vdom) {
        const vm = this;
        const vModel = vdom.$el.getAttribute('v-model');

        if (vModel) {
            const val = this.getVal(vModel, vdom, this.inputParse);

            vdom.$el.value = val;

            var blocker = function (e) {
                // 如果有多个相同类型事件的事件监听函数绑定到同一个元素，当该类型的事件触发时，它们会按照被添加的顺序执行。
                // 如果其中某个监听函数执行了 event.stopImmediatePropagation() 方法，
                // 则当前元素剩下的监听函数将不会被执行
                e.stopImmediatePropagation();
                vdom.$el.removeEventListener('input', blocker);
                vm.setVal(vModel, this.value);
            };

            vdom.$el.addEventListener('input', blocker);
        }
    }

    // 数据绑定
    bindData(vdom) {
        if (vdom.children === undefined) {
            this.textParse(vdom);
        } else {
            this.inputParse(vdom);

            vdom.children.forEach(item => {
                this.bindData(item);
            });
        }
    }

    nodeParse() {

    }

    render() {

    }
}

const hasSolvedList = {};

function f(n) {
    deep++;
    if (n === 1) return 1;
    if (n === 2) return 2;

    if(hasSolvedList[n]) return hasSolvedList[n];

    var res = f(n - 1) + f(n - 2);
    hasSolvedList[n] = res;
    return res
}

var deep = 0;

var testArr = Array.apply(null,{length: 20000}).map(item => {
    return Math.floor(Math.random() * 50000);
});

function sort1(arr){
    let len = arr.length;
    let flag = true;

    if(len === 0 || len === 1) return arr;
    
    for(let i = 0;i < len; i++){
        flag = false;
        
        for(let j = 0;j < len - i - 1; j++){
            if(arr[j] > arr[j + 1]){
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                // 数据有对换说明还需要继续遍历
                flag = true;
            }
        }

        if(!flag) break;
    }

    return arr;
}


function sort2(arr){
    let len = arr.length;
    let flag = true;

    if(len === 0 || len === 1) return arr;

    for(let i = 1;i < len; i++){
        let temp = arr[i];
        let k = i -1;

        for(; k >= 0; k--){
            if(arr[k] > temp){
                arr[k + 1] = arr[k];
            }else{
                break;
            }
        }

        arr[k + 1] = temp;
    }

    return arr;
}

export default SzVue;