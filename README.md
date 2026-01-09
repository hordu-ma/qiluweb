# qiluweb

齐鲁相关门户与管理前端项目（Vue 2.7 + Vite 4），包含公开页面（欢迎页/中心简介/中心动态等）与管理模块页面（智能体/知识库/历史记录等，是否启用由路由守卫策略决定）。

- 公开“中心动态”数据源：PocketBase（通过 `/pb` 反向代理访问）
- 生产静态部署：Nginx（仓库内 `Dockerfile` + `nginx.conf`）

## 1. 开发环境要求

- Node.js：建议 18+
- npm：建议 9+

## 2. 本地开发

```bash
npm install
npm run dev
```

默认启动地址通常为 `http://localhost:5173/`。

## 3. 构建与预览

```bash
npm run build
npm run preview
```

## 4. 环境变量（.env）

项目通过 Vite 环境变量配置运行时行为（见 `.env` / `.env.production`）：

- `VITE_ROUTE_BASE_URL`：路由 base（通常为 `/`）
- `VITE_IMAGE_BASE_URL`：图片资源域名/前缀
- `VITE_PB_BASE_URL`：PocketBase 子路径前缀（生产推荐 `/pb`）
- `VITE_PB_DEV_PROXY_TARGET`：本地开发时 PocketBase 代理目标（默认 `http://127.0.0.1:8090`）

## 5. 本地代理说明（Vite）

开发环境下（`vite.config.js`）配置了代理：

- `/api`、`/auth`：转发到后端服务（并做路径 rewrite）
- `/pb`：转发到 PocketBase（用于本地联调中心动态）

## 6. 生产部署（Nginx 镜像）

仓库提供了基于 Nginx 的静态站点镜像构建方式：

```bash
npm run build
docker build -t qiluweb:latest .
docker run --rm -p 8080:80 -v /tmp/web:/weblog qiluweb:latest
```

如需启用 PocketBase 反代与 `/api` 反代，请根据实际环境调整 `nginx.conf` 后重新构建镜像。

## 7. PocketBase（中心动态）

- 详细部署与使用说明：`DEV_PLAN_CENTER_NEWS_2026-01-03.md`
- 前端调用封装：`src/libs/pb.js`
- 页面：
  - 列表：`/news`（`src/views/news/list.vue`）
  - 详情：`/news/:id`（`src/views/news/detail.vue`）

## 8. 项目 Review 报告

- 全量 Review 报告：`PROJECT_REVIEW_REPORT.md`

## 9. 安全提醒

请勿在仓库中提交任何明文账号、密码、Token、镜像仓库登录信息或内网敏感地址；建议使用环境变量、CI Secret 或安全的密钥管理系统注入。
