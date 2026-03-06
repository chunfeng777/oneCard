<div align="center">
    <img src="https://img.shields.io/badge/Vue-3.4.26-brightgreen.svg"/>
    <img src="https://img.shields.io/badge/Vite-5.2.11-green.svg"/>
    <img src="https://img.shields.io/badge/Element Plus-2.7.0-blue.svg"/>
    <img src="https://img.shields.io/badge/license-MIT-green.svg"/>
    <a href="https://gitee.com/youlaiorg" target="_blank">
        <img src="https://img.shields.io/badge/Author-有来开源组织-orange.svg"/>
    </a>
    <div align="center"> 中文 | <a href="./README.en-US.md">English</div>
</div>

![](https://foruda.gitee.com/images/1708618984641188532/a7cca095_716974.png "rainbow.png")

<div align="center">
  <a target="_blank" href="http://vue3.youlai.tech">👀 在线预览</a> |  <a target="_blank" href="https://juejin.cn/post/7228990409909108793">📖 阅读文档</a>
</div>

## 项目简介

[vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) 是基于 Vue3 + Vite5+ TypeScript5 + Element-Plus + Pinia 等主流技术栈构建的免费开源的后台管理前端模板（配套[后端源码](https://gitee.com/youlaiorg/youlai-boot)）。


## 项目特色

- **简洁易用**：基于 [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) 升级的 Vue3 版本，无过渡封装 ，易上手。

- **数据交互**：同时支持本地 `Mock` 和线上接口，配套 [Java 后端源码](https://gitee.com/youlaiorg/youlai-boot)和[在线接口文档](https://www.apifox.cn/apidoc/shared-195e783f-4d85-4235-a038-eec696de4ea5)。

- **权限管理**：用户、角色、菜单、字典、部门等完善的权限系统功能。

- **基础设施**：动态路由、按钮权限、国际化、代码规范、Git 提交规范、常用组件封装。

- **持续更新**：2021年至今持续更新3年，及时跟进最新的技术和工具。



## 项目预览

![明亮模式](https://foruda.gitee.com/images/1709651876583793739/0ba1ee1c_716974.png)

![暗黑模式](https://foruda.gitee.com/images/1709651875494206224/2a2b0b53_716974.png)

![接口文档](https://foruda.gitee.com/images/1687755822857820115/96054330_716974.png)

## 项目地址

| 项目 | Gitee                                                        | Github                                                       | GitCode                                                      |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 前端 | [vue3-element-admin](https://gitee.com/youlaiorg/vue3-element-admin) | [vue3-element-admin](https://github.com/youlaitech/vue3-element-admin) | [vue3-element-admin](https://gitcode.net/youlai/vue3-element-admin) |
| 后端 | [youlai-boot](https://gitee.com/youlaiorg/youlai-boot)       | [youlai-boot](https://github.com/haoxianrui/youlai-boot.git) | [youlai-boot](https://gitcode.net/youlai/youlai-boot)        |

## 环境准备

| 环境                 | 名称版本                                                     | 下载地址                                                     |
| -------------------- | :----------------------------------------------------------- | ------------------------------------------------------------ |
| **开发工具**         | VSCode                                                       | [下载](https://code.visualstudio.com/Download)           |
| **运行环境**         | Node ≥18                                                    | [下载](http://nodejs.cn/download)                        |


## 项目启动

```bash
# 克隆代码
git clone https://gitee.com/x111555/BCYC.git

# 切换目录
cd vue3-element-admin

# 安装 pnpm
npm install pnpm -g

# 安装依赖
pnpm install

# 启动运行
pnpm run dev
```



## 项目部署

```bash
# 项目打包
pnpm run build:prod

# 上传文件至远程服务器
将打包生成在 `dist` 目录下的文件拷贝至 `/usr/share/nginx/html` 目录

# nginx.cofig 配置
server {
	listen     80;
	server_name  localhost;
	location / {
			root /usr/share/nginx/html;
			index index.html index.htm;
	}
	# 反向代理配置
	location /prod-api/ {
			proxy_pass http://vapi.youlai.tech/; # vapi.youlai.tech替换成你的后端API地址
	}
}
```

## 本地Mock

项目同时支持在线和本地 Mock 接口，默认使用线上接口，如需替换为 Mock 接口，修改文件 `.env.development` 的 `VITE_MOCK_DEV_SERVER` 为  `true` **即可**。

## 后端接口

> 如果您具备Java开发基础，按照以下步骤将在线接口转为本地后端接口，创建企业级前后端分离开发环境，助您走向全栈之路。

1. 获取基于 `Java` 和 `SpringBoot` 开发的后端 [youlai-boot](https://gitee.com/youlaiorg/youlai-boot.git) 源码。
2. 根据后端工程的说明文档 [README.md](https://gitee.com/youlaiorg/youlai-boot#%E9%A1%B9%E7%9B%AE%E8%BF%90%E8%A1%8C) 完成本地启动。
3. 修改 `.env.development` 文件中的 `VITE_APP_API_URL` 的值，将其从 http://vapi.youlai.tech 更改为 http://localhost:8989。


## 注意事项

- **自动导入插件自动生成默认关闭**

  模板项目的组件类型声明已自动生成。如果添加和使用新的组件，请按照图示方法开启自动生成。在自动生成完成后，记得将其设置为 `false`，避免重复执行引发冲突。

  ![](https://foruda.gitee.com/images/1687755823137387608/412ea803_716974.png)

- **项目启动浏览器访问空白**

  请升级浏览器尝试，低版本浏览器内核可能不支持某些新的 JavaScript 语法，比如可选链操作符 `?.`。

- **项目同步仓库更新升级**

  项目同步仓库更新升级之后，建议 `pnpm install` 安装更新依赖之后启动 。

- **项目组件、函数和引用爆红**

	重启 VSCode 尝试

- **其他问题**

  如果有其他问题或者建议，建议 [ISSUE](https://gitee.com/youlaiorg/vue3-element-admin/issues/new)



## 项目文档

- [基于 Vue3 + Vite + TypeScript + Element-Plus 从0到1搭建后台管理系统](https://blog.csdn.net/u013737132/article/details/130191394)

- [ESLint+Prettier+Stylelint+EditorConfig 约束和统一前端代码规范](https://blog.csdn.net/u013737132/article/details/130190788)
- [Husky + Lint-staged + Commitlint + Commitizen + cz-git 配置 Git 提交规范](https://blog.csdn.net/u013737132/article/details/130191363)




## 提交规范

执行 `pnpm run commit` 唤起 git commit 交互，根据提示完成信息的输入和选择。

![](https://foruda.gitee.com/images/1687755823165218215/c1705416_716974.png)




## 项目目录

```bash
-src                     # 根目录
  -api                   # 接口请求封装
  -assets                # 静态资源
  -components            # 组件
  -directive             # 自定义指令
  -enums                 # 枚举
  -hooks                 # 自定义hooks
  -lang                  # 多语言包
  -layout                # 布局
  -plugins               # 插件
  -router                # 路由
  -store                 # 状态管理
  -styles                # 全局样式
  -typings               # 类型定义
  -utils                 # 工具类
  -views                 # 页面
    -administrative      # 文档管理
    -customer            # 客户管理
    -dashboard           # 首页
    -development         # 开发管理
    -error               # 错误页
    -finance             # 财务管理
    -findAllNotice       # 公告详情页
    -login               # 登录页
    -netdist             # 网盘
    -personnel           # 人事管理
    -profile             # 个人中心
    -redirect            # 重定向页
    -reporting           # 报表管理
    -system              # 系统管理
    -websocket           # socket
    -wflow               # 工作流
    -workoeder           # 工单管理
  App.vue                # 根组件
  main.ts                # 入口文件
  settings.ts            # 配置文件
```

