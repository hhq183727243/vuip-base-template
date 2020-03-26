# vuip-cli 脚手架初始化项目结构

### 介绍
vuip-cli脚手架生成基础项目

### 目录结构
```
├── dist                     # 构建后生成文件目录
├── mock                     # 本地模拟数据
├── public
│   └── favicon.png          # Favicon
├── src
│   ├── assets               # 本地静态资源
│   ├── components           # 业务通用组件
│   ├── layouts              # 通用布局
│   ├── models               # 全局 dva model
│   ├── pages                # 业务页面入口和常用模板
│   ├── services             # 后台接口服务
│   ├── utils                # 工具库
│   ├── locales              # 国际化资源
│   ├── main.less            # 全局样式
│   └── app.js               # 主入口 JS
├── README.md
└── package.json
```

### 安装依赖
$ yarn 

### 本地开发 开启服务
$ yarn start

### 构建应用
$ yarn build
