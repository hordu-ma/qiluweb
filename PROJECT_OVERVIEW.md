# 项目说明（结构化概览）

## 1. 项目定位

本项目是一个基于 **Vue 2.7** 的 Web 管理与门户型前端：

- 对外：提供 `/welcome` 欢迎页（轮播图 + 中心动态 + 顶部导航），并提供“中心简介 / 二级平台 / 联系我们”等二级页面入口。
- 对内：提供基于 `/index` 的管理后台（路由下包含机器人、知识库、系统配置等模块）。

## 2. 技术栈

- 框架：Vue 2.7 + `vue-router`（history 模式）
- UI：View UI（`view-design` / iView4）+ Element UI（同时存在）
- 构建/开发：Vite 4 + `@vitejs/plugin-vue2`
- 网络请求：`axios`（项目内二次封装见 `src/libs/axios/`）
- 富文本/高亮：`marked`、`highlight.js`
- 其他：`@microsoft/fetch-event-source`（SSE）、`uuid`

## 3. 快速开始

### 3.1 安装依赖

```bash
npm install
```

### 3.2 本地开发

```bash
npm run dev
```

- 默认 Vite 启动在 `http://localhost:5173/`

### 3.3 构建

```bash
npm run build
```

- 产物输出到 `dist/`

## 4. 运行时配置与代理

### 4.1 Vite 开发代理

Vite 在开发环境配置了代理：

- `/api` → 代理到后端，并重写为 `/chat-platform-api/api/`
- `/auth` → 代理到后端，并重写为 `/chat-platform-api/auth/`

对应配置文件：`vite.config.js`。

### 4.2 Axios 封装与 baseUrl

请求封装在：`src/libs/axios/request.js`

- 开发环境：`baseUrl` 为空字符串（依赖 Vite 代理）
- 生产环境：`baseUrl = window.location.origin + "/platform/chat-platform-api"`

鉴权信息：

- token 存储：`sessionStorage[tmp_access_token]`
- 请求头：使用 `Authentication` 传递 token

## 5. 路由与页面结构

### 5.1 路由入口

- 路由表：`src/router.js`
- Router 模式：`history`

### 5.2 公开页面

- `/welcome`：欢迎页（含顶部导航、轮播图、中心动态）
- `/center-intro`：中心简介（当前为 mock 内容页）
- `/platforms`：二级平台（当前为 mock 内容页，支持 query `module`）
- `/contact`：联系我们（当前为 mock 内容页）

### 5.3 管理后台页面

- `/index` 下挂载一组管理模块（机器人、知识库、系统配置、历史记录等）

### 5.4 路由守卫

`src/main.js` 中使用 `router.beforeEach` 做页面放行控制：

- 公开页面白名单放行
- 其他页面默认重定向到 `/welcome`

如果要启用后台（`/index` 等路由），需要在该守卫中增加登录态校验与后台路由放行逻辑。

## 6. 目录结构（关键部分）

- `src/main.js`：应用入口（Vue/Router/UI 插件注册、路由守卫）
- `src/router.js`：路由表
- `src/views/`：页面（welcome、login、system、chatBot、namespace 等）
- `src/components/`：通用组件
- `src/libs/axios/`：API 封装（按业务域拆分：login/chatbot/namespace/...）
- `src/libs/util.js`：localStorage/sessionStorage 工具等
- `vite.config.js`：Vite 配置与代理
- `nginx.conf`：生产 Nginx 配置（history 路由回退 + 反向代理）
- `Dockerfile`：Nginx 静态站点镜像构建

## 7. 部署（Nginx + Docker）

- `npm run build` 生成 `dist/`
- Docker 镜像：使用 `nginx:latest`，将 `dist/` 复制到 `/usr/share/nginx/html`
- Nginx：
  - `location /` 使用 `try_files ... /index.html` 支持 history 路由
  - `location /api` 反向代理到集群内 API 服务（见 `nginx.conf`）

## 8. 维护建议（简要）

- 不要在仓库里存放明文账号/密码/Token；推荐用 `.env` / CI Secret 注入。
- 项目同时使用 View UI 与 Element UI：如后续要统一 UI 风格，建议先明确主组件库再逐步收敛。
- Webpack 配置文件仍保留（`webpack.*.config.js`），但当前 npm scripts 走 Vite；如无历史兼容诉求可逐步清理或在文档中标注为 legacy。
