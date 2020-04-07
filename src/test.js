// new Function('name', '"Hello World" + name');

// textParse('Hello World {name + 1 + 2}')
function textParse(text) {
    // 匹配{ }里面内容
    const reg = /\{\s*([\(\)\w\.:\?\+\-\*\/\s'"=!]+)\s*\}/g;
    const originText = text;
    let result;

    while ((result = reg.exec(originText)) !== null) {
        text = text.replace(result[0], `" + ${result[1]} + "`);
    }

    // 拼接成："字符串" + name + "字符串";
    return '"' + text + '"';
}

class VuiComponent {
    constructor(config) {
        const { ast, data } = config;
        this.data = data();
        this.$el = this.createDom(ast);
    }
    createDom(ast) {
        // type 1为节点标签，2为文本标签
        let Dom = null;
        if (ast.type === 1) {
            Dom = document.createElement(ast.tagName);
        } else {
            // 'name' 为参数
            const code = 'return ' + textParse(ast.content);
            const fun = new Function('name', code);
            Dom = document.createTextNode(fun(this.data.name));
        }

        // 如果是标签节点，则将子节点依次加入
        if (ast.type === 1) {
            ast.children.forEach(item => {
                Dom.appendChild(this.createDom(item));
            });
        }
        return Dom;
    }
}

// ast 对象
const ast = {
    "type": 1,
    "tagName": "div",
    "attr": {},
    "children": [{
        "type": 2,
        "content": "Hello World {name}"
    }]
}

// 转成如下格式， createEl生成标签方法
"createEl(1, 'div', {}, [" +
    "createEl(2, null, null, 'Hello World {name}')," +
    "])";

const renderFun = new Function('__option__', 'with(this){return ' + code + '}');


function createCode(ast) {
    const { type, content, tagName, attr = {}, children } = ast;
    const childCode = [];

    // 构造子节点代码
    (children || []).forEach(item => {
        childCode.push(createCode(item));
    });


    if (type === 1) {
        // 普通节点
        return 'createElement("' + tagName + '", ' + _objStr + ',[' + childCode.join(',') + '])';
    } else if (type === 2) {
        // 文本节点
        return 'createElement(undefined, null, ' + textParse(content.replace(/\r\n|\r|\n/g, '')) + ')';
    } else if (type === 3) {
        // 组件
        return 'createComponent("' + tagName + '", ' + _attrStr + ',[' + childCode.join(',') + '], __option__)';
    } else if (type === 4) {
        // 子定义标签，如v-for, v-if标签
        // ....
        return code;
    }
}
