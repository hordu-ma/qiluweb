# 中心动态（新闻）模块开发计划（PocketBase + 子路径 CMS）

日期：2026-01-03

## 1. 目标

- 首页“中心动态”区域点击“更多”进入二级页面，集中展示中心相关新闻动态。
- 二级页面包含：新闻列表（含摘要）+ 新闻详情。
- 新闻内容由轻量 CMS 管理：PocketBase（单二进制、SQLite、内置文件上传与 Admin UI）。
- 发布后立即生效（无须重新构建前端）。
- 正文为“文本+图片”，支持在文本中任意位置插入不同图片（非统一放在文末）。

## 2. 范围

### 2.1 In Scope

- 前端：
  - 新增新闻列表页 `/news`（分页、摘要、点击进入详情）。
  - 新增新闻详情页 `/news/:id`（渲染正文 + 按占位符穿插图片）。
  - 首页中心动态改造：展示最新 N 条、支持跳转。
- PocketBase：
  - 建立 `center_news` collection（新闻数据 + 图片附件）。
  - Admin UI 仅内网访问，公共端只读。
- Nginx：
  - 通过子路径 `/pb/` 反代 PocketBase。
  - `/pb/_/`（Admin UI 等敏感路径）仅内网访问。

### 2.2 Out of Scope（本轮不做）

- 富文本 HTML 编辑器集成（避免体积与 XSS 风险）。
- 复杂审核流/多角色权限/工作流。
- 标签、分类、搜索、置顶等扩展能力（除非后续明确需求）。

## 3. 现状与约束

- 当前“中心动态”在欢迎页中使用静态数组渲染；“更多”无跳转逻辑。
- 路由守卫仅按 name 白名单放行，新增公开页面必须加入白名单。
- 现有后端使用 `/api/*`；PocketBase 默认也使用 `/api/*`，因此必须通过 `/pb/` 子路径“去前缀转发”隔离。

## 4. 总体架构

### 4.1 访问拓扑（同域子路径）

- 浏览器访问同一域名：
  - `/`：前端静态站点（SPA）
  - `/api/*`：现有后端（保持不变）
  - `/pb/*`：PocketBase（反代到 PB 服务）

### 4.2 关键原则

- 前端不直接依赖 PocketBase Admin；Admin 仅内网。
- 前端只使用 PocketBase 公共只读 API 拉取新闻数据。
- 正文不使用 `v-html` 渲染，避免 XSS；以“纯文本 + 占位符”方式渲染。

## 5. PocketBase 设计

### 5.1 Collection：`center_news`

字段（最小集）：

- `title`：text（必填）
- `summary`：text（可选；列表摘要）
- `body`：text/long text（必填；纯文本，允许换行，允许占位符）
- `status`：select（draft/published，默认 draft）
- `publish_at`：date（可选；用于排序展示，未填可用 created 替代）
- `images`：file（多文件；image/\*；用于正文插图）

可选扩展（后续需求再加）：

- `cover`：file（单文件；列表封面）
- `sort`：number（用于置顶/自定义排序）

### 5.2 权限（推荐）

- 公开端（匿名）：
  - list/view：允许，但仅返回 `status="published"` 的记录。
- 写入：
  - create/update/delete：关闭（仅 PocketBase Admin 在内网进行管理）。

### 5.3 数据持久化与备份

- 必须持久化：`pb_data/`（SQLite + storage 文件目录）。
- 备份建议：每日快照 + 至少保留 7 天；备份必须包含 db 与文件目录。

## 6. Nginx 反代方案（子路径）

### 6.1 路径规划

- PocketBase 对外前缀：`/pb/`
- Admin/UI 限制：`/pb/_/` 仅内网（allow/deny）

### 6.2 “去前缀转发”要点

- `location ^~ /pb/ { proxy_pass http://PB_UPSTREAM/; }`
  - 注意 `proxy_pass` 尾随 `/`，以剥离 `/pb/` 前缀。

### 6.3 内网限制

- `location ^~ /pb/_/ { allow 10.0.0.0/8; allow 172.16.0.0/12; allow 192.168.0.0/16; deny all; ... }`

## 7. 前端路由与页面

### 7.1 路由

- `/news`（name：`newsList`）：新闻列表（含摘要）
- `/news/:id`（name：`newsDetail`）：新闻详情

### 7.2 路由守卫白名单

- 由于现有守卫仅放行固定 name，需将 `newsList/newsDetail` 加入白名单，否则会重定向到欢迎页。

## 8. 数据获取（PocketBase Read API）

### 8.1 列表

- 仅拉取 `status=published`，按 `publish_at desc`（或 `created desc`）排序。
- 分页参数：page/perPage。

### 8.2 详情

- 通过 `id` 获取记录。

### 8.3 图片 URL 拼接

- PB file URL 规则（典型）：
  - `${PB_BASE_URL}/api/files/${collection}/${recordId}/${filename}`
- 由于 PB 记录返回 file 字段通常为文件名数组，前端需自行拼接 URL。

## 9. 正文渲染规则（占位符插图）

### 9.1 占位符语法

- `{{img:n}}`，其中 `n` 为 1-based 正整数。
- 映射规则：`n=1` → `images[0]`。

### 9.2 解析与输出

- 将 `body` 换行统一为 `\n`。
- 识别严格匹配的占位符，输出为“图片片段”；其余内容输出为“文本片段”。
- 文本渲染：不使用 `v-html`；使用纯文本显示并保留换行（例如 CSS `white-space: pre-wrap` 或按段落切分）。

### 9.3 异常与降级

- `n` 越界（大于图片数量）：默认跳过不渲染（最简）；必要时可显示“图片缺失”。

## 10. 验收标准（Acceptance Criteria）

- 首页“更多”可进入 `/news`。
- `/news` 列表展示：标题 + 日期 + 摘要；分页可用。
- 点击列表项进入 `/news/:id`，详情页展示正文文本；`{{img:n}}` 能在正文中对应位置展示附件图片。
- PocketBase Admin 仅内网可访问；公网无法访问 `/pb/_/`。
- 新闻发布/修改后，前端无需构建即可立即看到更新内容。

## 11. 风险与对策

- 子路径部署 Admin 静态资源路径问题：通过 Nginx 去前缀转发，尽量让 PB 认为自己部署在根路径。
- 路由守卫白名单遗漏导致页面不可达：新增路由必须添加 name 并加入白名单。
- 图片 URL 基址不一致：统一使用 `VITE_PB_BASE_URL`（例如同域情况下为 `""` 或 `window.location.origin` + `/pb`）。

## 12. 实施步骤（建议顺序）

1. 新建 git 分支 `feat/center-news-2026-01-03`。
2. Nginx 增加 `/pb/` 反代与 `/pb/_/` 内网限制。
3. PocketBase 创建 `center_news` collection 与权限。
4. 前端新增路由与白名单。
5. 前端新增新闻列表与详情页 + `{{img:n}}` 渲染。
6. 欢迎页中心动态接入（最新 N 条、跳转）。
7. 自测与验收用例回归。
