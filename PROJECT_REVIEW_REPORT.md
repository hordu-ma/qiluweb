# 项目全面 Review 报告（qiluweb）

> 生成时间：2026-01-09  
> 目标：对仓库内**全部代码与配置文件**做一次整体审视，输出可执行的改进建议，并同步更新 `README.md`（另见）。

## 1. 结论摘要

### 1.1 项目现状（我看到的真实形态）

- 这是一个 **Vue 2.7 + Vite 4** 的前端项目，UI 同时使用 `view-design` 与 `element-ui`。
- 项目包含两条主线能力：
  - **门户/公开页面**：`/welcome`、`/center-intro`、`/platforms`、`/contact`、`/news`、`/news/:id`。
  - **管理/业务功能页面**：`/index/*`（智能体、知识库、历史记录等）。
- 生产部署以 **Nginx 静态站点**为主，同时通过 Nginx 反代：
  - `/api` → 内网服务（K8s 域名）
  - `/pb` → PocketBase（CMS）
- 当前路由守卫（`src/main.js`）只放行公开路由，管理后台路由实际不可达（若这是刻意“只做门户”，需要在文档里明确；若需要后台，则需要补齐鉴权/放行策略）。

### 1.2 需要优先处理的风险（按优先级）

1. **泄露凭证/敏感信息（P0）**：`README.md` 存在明文账号/密码/仓库登录信息，应立即移除并按安全方式管理。
2. **XSS 风险（P0/P1，取决于数据来源）**：多处 `v-html` + `marked` 且 `sanitize: false`，如果内容来自服务端或用户输入，存在脚本注入风险。
3. **依赖老旧且存在已知漏洞风险（P1）**：`axios@0.19.1`、`highlight.js@9.18.5` 等版本较老，建议评估升级。
4. **环境/域名硬编码较多（P1/P2）**：多处 `http://47.236.254.2`、内网域名、企业 SSO URL，导致可移植性差、环境切换容易出错。
5. **仓库卫生（P2）**：仓库里存在 `dist/`、`node_modules/`、`pocketbase/CHANGELOG.md`（超大文件）等应避免入库/应标注来源的内容。

## 2. 仓库与代码清单（覆盖范围说明）

### 2.1 代码规模（粗粒度）

- `src/` 共 **133** 个文件（其中 `*.vue` 约 **44**，`*.js` 约 **29**，样式文件约 **4**）。
- Review 覆盖：
  - `src/**` 全目录（通过结构浏览 + 关键文件逐一阅读 + 全局模式搜索）
  - 根目录构建/部署相关：`vite.config.js`、`Dockerfile`、`nginx.conf`、`.env*`、`deploy-pocketbase.sh`、`docker-compose.yml`
  - 文档与运维说明：`DEV_PLAN_CENTER_NEWS_2026-01-03.md`、`README.md`
- 未逐行审计但已纳入风险评估：
  - `node_modules/`（第三方依赖，属于外部供应链）
  - `dist/`（构建产物，属于生成文件）

## 3. 架构与关键实现点评

### 3.1 路由与页面组织

- 路由定义：`src/router.js`
  - 新增新闻页：`/news`（列表）、`/news/:id`（详情）。
- 路由守卫：`src/main.js`
  - 只放行 `login/reset/welcome/centerIntro/contact/platforms/newsList/newsDetail`，其余全部重定向 `/welcome`。
  - 建议在 README/报告里明确“这是门户站点（无后台入口）”或补充“后台鉴权 + 放行策略”。

### 3.2 PocketBase（CMS）集成

- 前端调用实现：`src/libs/pb.js`
  - 通过 `fetch` 访问 `/pb/api/...`（不使用 PocketBase 官方 SDK）。
  - `listCenterNews()` 默认过滤 `status="published"`；`getCenterNews()` 不带过滤，依赖 PocketBase 权限规则防止读取草稿。
- Dev 代理：`vite.config.js`
  - 新增 `/pb` 反代，默认目标 `VITE_PB_DEV_PROXY_TARGET || http://127.0.0.1:8090`。
- 生产反代：`nginx.conf`
  - `location ^~ /pb/` 与 `location ^~ /pb/_/` 转发到 `http://pocketbase:8090`。

### 3.3 API 与鉴权

- Axios 封装：`src/libs/axios/request.js`
  - 生产 `baseUrl` 固定为 `window.location.origin + "/platform/chat-platform-api"`，而 Nginx/Vite 代理又是 `/api -> /chat-platform-api/api`，整体路径体系较绕、需要统一。
  - 多个方法固定 `Content-Type: application/json`，若传 `FormData`（例如 `src/libs/axios/ningbo.js` 里的 Excel 上传）可能导致上传失败或兼容性问题。
- SSE：`src/views/chatBot/components/chatMarkdown.vue`
  - 使用 `Authorization: Bearer ...`，而 axios 其它接口使用 `Authentication`，建议统一 header 约定。

## 4. 安全性审视（重点）

### 4.1 明文凭证泄露（需要立即处理）

- `README.md` 包含 `docker login` 用户名/密码等敏感信息：应从仓库中移除，并改为“从安全渠道获取/用环境变量注入”的方式。

### 4.2 XSS 风险：`v-html` + Markdown 渲染未消毒

以下文件存在类似模式（示例，不是全部）：

- `src/views/login.vue`（免责声明/条款渲染）
- `src/views/system/index/index.vue`
- `src/views/chatBot/components/chatMarkdown.vue`
- `src/views/chatHistory/DrawerModal.vue`

风险取决于内容来源：

- 如果 Markdown/HTML 来自服务端返回或用户输入，则需要对 HTML 做白名单消毒（推荐 `DOMPurify` 或服务端净化），并谨慎允许内联 HTML。

### 4.3 依赖供应链风险（版本老旧）

- `axios@0.19.1`、`highlight.js@9.18.5` 等版本较老，历史上存在公开 CVE/安全问题记录的可能性很高；建议在升级窗口里做一次依赖体检与升级计划。

## 5. 可维护性与工程化

### 5.1 “历史遗留/重复文件”较多

- `src/views/**` 下存在多个 `* copy*.vue` 之类文件，且 `src/template/index.ejs` 仍保留 webpack 模板语法（项目已使用 Vite）。
- 建议：
  - 明确哪些是“历史备份”并移动到 `archive/`（或删除并依赖 git 历史）
  - 删除未被引用的页面/组件，降低阅读与维护成本

### 5.2 配置与环境变量建议

当前环境变量与硬编码并存：

- `.env`：`VITE_IMAGE_BASE_URL=http://47.236.254.2`（开发/默认）
- `.env.production`：`VITE_IMAGE_BASE_URL=https://education.qiluhospital.com`
- 代码中也有硬编码：例如 `src/main.js`、`src/views/chatBot/index.vue` 等。

建议把所有“域名/IP/路径前缀”统一收敛到 `.env*`，并在 README 写清楚每个变量的含义与示例。

### 5.3 构建与性能

本地构建会出现一些警告（非阻塞，但建议逐步治理）：

- Vite/Rollup：`manualChunks` 用法提示过时（可迁移到 `build.rollupOptions.output.manualChunks`）。
- Sass：`@import` 未来弃用警告（来自 element-ui 主题链路）。
- 产物体积：`dist/static/main.*.js` 非常大（MB 级），建议逐步拆分大依赖、按路由懒加载、排查不必要的全量引入。
- `vue-flow-editor/docs/lib/g6.umd.min.js` 在构建时触发 `eval` 警告（安全/可审核性较差）。

## 6. 部署与运维建议

### 6.1 Nginx 配置

- `nginx.conf` 同时包含：
  - SPA history fallback（`try_files ... /index.html`）
  - `/api` 反代到 K8s 域名
  - `/pb` 反代到 PocketBase
- 建议补充：
  - `proxy_http_version 1.1`、`proxy_set_header Upgrade`/`Connection`（若未来需要 WebSocket）
  - 更明确的访问控制策略（例如 PocketBase Admin `/pb/_/` 的访问限制：IP allowlist / Basic Auth / WAF）

### 6.2 PocketBase 部署资产

仓库包含：

- `deploy-pocketbase.sh`：适配“已存在 nginx 容器”的部署脚本（强依赖容器名 `nginx`）。
- `docker-compose.yml`：PocketBase 单服务 compose（healthcheck 依赖 `wget`，需确认镜像内是否提供）。
- `Dockerfile.pocketbase`：从 GitHub 下载 release 包构建镜像（生产环境若禁网/需内网镜像仓库，需要调整）。

建议将“生产部署路径”收敛为一种权威方式，并在 README 指向详细文档 `DEV_PLAN_CENTER_NEWS_2026-01-03.md`。

---

## 7. 下一步开发与优化建议（建议按顺序推进）

1. **安全清理（立刻）**：移除仓库中的明文密码/令牌/内网地址；补充 `.env.example`；建立“敏感信息不得入库”的检查流程（pre-commit/CI）。
2. **统一配置入口**：把后端 API base、图片域名、PocketBase base 都收敛为环境变量；前端不再硬编码 IP。
3. **修复 Markdown 渲染 XSS 面**：引入/启用 HTML 消毒（前端 `DOMPurify` 或服务端白名单）；评估是否允许 Markdown 内嵌 HTML。
4. **依赖升级计划**：优先升级 `axios`、`highlight.js`，并做回归（尤其是拦截器/错误处理/高亮样式）。
5. **路由与鉴权策略定稿**：确认是否需要 `/index/*` 后台；若需要，补齐 token 校验、401 处理、路由放行与菜单权限。
6. **产物瘦身与加载体验**：按路由拆包、延迟加载重型库、移除未用的“copy 文件/模板/资源”，降低首屏 JS。
7. **补齐基础工程能力**：引入 lint/format（ESLint/Prettier）、最小化单元测试/组件测试、CI 中执行 `npm run build` 作为门禁。

