# 中心动态模块上线指北（PocketBase + 子路径）

> 生产此前仅有静态站点，PocketBase 为新引入组件。本文压缩关键信息，便于首发与后续维护。

## 1. 目标与范围

- 目标：提供“中心动态”列表/详情与首页摘要；内容由 PocketBase 管理，发布后前端无需重构。
- 范围：前端路由 `/news`、`/news/:id`；首页“更多”跳转；PocketBase `center_news` 集合及只读 API；Nginx `/pb/` 反代与 `/pb/_/` 内网限制。
- 不做：富文本编辑器、复杂审核流、搜索/标签等扩展。

## 2. 方案概要

- 同域子路径：`/` 前端、`/api/*` 现有后端、`/pb/*` PocketBase（去前缀反代）。
- 集合字段：`title`(必填)、`summary`、`body`(纯文本+占位符)、`status`(draft/published)、`publish_at`(date)、`images`(多图，可扩展 `cover`/`sort`)。
- 权限：匿名仅读已发布；写仅 Admin；Admin UI 仅内网。
- 正文占位符：`{{img:n}}` 对应 `images[n-1]`，正文渲染不使用 `v-html`。

## 3. 必要配置

- 前端环境：`VITE_PB_BASE_URL=/pb`。
- PocketBase：`PB_PUBLIC_URL=https://<域名>/pb`（推荐）；持久化目录 `pb_data/`（含 data.db、logs.db、storage/）。
- Nginx 关键：
  - `/pb/_/`：allow 内网，deny 外网，`proxy_pass http://127.0.0.1:8090/_/`（如用容器则改为容器名）。
  - `/pb/`：`proxy_pass http://127.0.0.1:8090/`；保留 `X-Forwarded-*` 头，支持 WebSocket。

## 4. 首次上线步骤（生产原无 PocketBase）

1. 部署 PocketBase：Systemd 或容器任选；监听 127.0.0.1:8090，`pb_data` 挂载持久目录。
2. 初始化：内网或 SSH 转发访问 `/pb/_/`，创建管理员；导入 `pocketbase/pb_schema.json`；规则设为“已发布匿名读，写仅 Admin”。
3. 配置 Nginx 并 reload：确认 `/pb/`、`/pb/_/` 反代和白名单；HTTPS 与主站一致。
4. 前端构建/部署：`npm install && npm run build`，将 `dist/` 部署到 Nginx root（默认 `/usr/share/nginx/html`）。
5. 验证：`curl https://<域名>/pb/api/health` 为 200；外网 `/pb/_/` 返回 403；前端 `/news`、`/news/:id`、首页“更多”可读取发布数据。

## 5. 内容发布与更新

- Admin UI：内网或 SSH 转发访问 `/pb/_/`；创建/编辑记录，`status=published` 即对前端可见；上传多图按 `{{img:n}}` 插入。
- API（可选，需管理员 token，仅内网）：使用 PocketBase SDK 批量导入或迁移。

## 6. 备份与运维

- 备份：每日备份 `pb_data`（SQLite + storage），示例：`sqlite3 pb_data/data.db ".backup /backup/pb/data_$(date +%Y%m%d).db" && cp -r pb_data/storage /backup/pb/storage_$(date +%Y%m%d)`，保留 7 天。
- 守护：Systemd 设 `Restart=always` 或容器 `restart: unless-stopped`；监控 8090 端口。

## 7. 部署检查清单

- [ ] PocketBase 进程启动且监听 8090（本机或容器）
- [ ] `/pb/` 反代健康；`/pb/_/` 外网 403、内网可访问
- [ ] 前端按 `VITE_PB_BASE_URL=/pb` 构建并部署到 Nginx root
- [ ] 已创建管理员并导入 schema，`center_news` 权限为“已发布匿名读”
- [ ] 至少一条 `published` 数据前端可见
- [ ] `pb_data` 持久化并有备份计划

## 8. 生产信息收集清单（堡垒机询问项）

- 基础环境：生产 OS/版本、CPU 架构；PocketBase 运行方式与版本；端口（默认 8090）
- 数据与存储：生产 `pb_data` 路径，是否已有数据；存储介质；备份策略与保留周期
- 域名与协议：PocketBase 对外域名/子路径（`/pb/`）、HTTPS 及证书来源
- 反代与网络：nginx 是否同机；LB/WAF 要求；WebSocket 支持；上游为 `127.0.0.1:8090` 还是容器名
- 访问控制：`/pb/_/` 内网白名单；防火墙/安全组开放情况；是否需要 CORS 域名列表
- 环境变量：`PB_PUBLIC_URL` 期望值；SMTP/对象存储/鉴权配置；日志路径与切割
- 前端指向：API 前缀（`/api`、`/pb`）与部署根目录是否一致；生产 nginx.conf 实际路径
- 守护与监控：进程守护/重启策略；是否需健康检查端点给上游
