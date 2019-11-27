import SzVue from './lib/szVue';


export function show(content) {
    // window.document.getElementById('app').innerText = 'Hello,' + content;
    /* window.myvue = new SzVue({
        id: 'app',
        data: {
            name: '老王',
            age: 123,
            obj: {
                name: '小米',
                age: 10,
                peason: {}
            },
            //list: []
        },
        methods: {
            init() {
                console.log(this.name);

                this.add();
            },
            add() {
                //this.list.push(1);

                //console.log(this.list);
            }
        },
        created() {
            this.init()
        }
    }); */
}

// 通过 CommonJS 规范导出 show 函数
//module.exports = show;