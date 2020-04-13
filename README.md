# vuip-cli 脚手架初始化项目结构

安装vuip-cli脚手架，通过vuip命令来初初始化基础项目目录

### 使用说明
安装vuip-cli
``` bash
npm install -g vuip-cli
```
安装完成后即可以使用vuip命令

### 检测安装是否成功
``` bash
vuip -V
```
输入版本号说明安装成功

### 通过vuip迁出工程模板
``` bash
vuip init
```
选择工程模板，目前只有一个base模板，输入
``` bash
base
```
输入你的工程名
``` bash
<project-name>
```
等待迁出

### 依赖包下载
推荐使用yarn来管理依赖包
``` bash
yarn
```
### 项目启动
``` bash
yarn start
```

### 项目打包
``` bash
yarn build
```

### 目录结构
```
├── dist                     # 构建后生成文件目录
├── config                   # webpack 配置
├── public
│   └── favicon.png          # Favicon
├── src
│   ├── assets               # 本地静态资源
│   ├── components           # 业务通用组件
│   ├── layouts              # 通用布局
│   ├── models               # 全局 dva model
│   ├── pages                # 业务页面入口和常用模板
│   ├── router               # 路由配置
│   ├── store                # 全局状态管理
│   ├── utils                # 工具库
│   ├── locales              # 国际化资源
│   ├── main.less            # 全局样式
│   └── app.js               # 主入口 JS
├── README.md
└── package.json
```
