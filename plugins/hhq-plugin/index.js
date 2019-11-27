class BasicPlugin{
    // 在构造函数中获取用户为该插件传入的配置
    constructor(options) {

    }

    // Webpack 会调用 BasicPlugin 实例的 apply 方法为插件实例传入 compile 对象
    apply(compiler) {
        compiler.plugin ('done', (compilation) => {
            console.log('123456789')
        })
    }
}

//导出 Plug in
module.exports = BasicPlugin; 