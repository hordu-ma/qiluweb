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

## 13. 生产环境部署指南

### 13.1 PocketBase 部署

#### 方式 1：Docker 容器（推荐）

创建 `Dockerfile.pocketbase`：

```dockerfile
FROM alpine:latest
ARG PB_VERSION=0.22.0

RUN apk add --no-cache ca-certificates wget unzip && \
    wget https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip && \
    unzip pocketbase_${PB_VERSION}_linux_amd64.zip -d /pb/ && \
    chmod +x /pb/pocketbase && \
    rm pocketbase_${PB_VERSION}_linux_amd64.zip

EXPOSE 8090
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data"]
```

docker-compose 配置片段：

```yaml
services:
  pocketbase:
    build:
      context: ./pocketbase
      dockerfile: Dockerfile.pocketbase
    container_name: qiluweb-pocketbase
    restart: unless-stopped
    ports:
      - "127.0.0.1:8090:8090" # 仅暴露给本机，通过 nginx 反代
    volumes:
      - ./pocketbase/pb_data:/pb/pb_data # 持久化数据
    networks:
      - qiluweb-network
```

#### 方式 2：Systemd 服务（宿主机直接运行）

创建 `/etc/systemd/system/pocketbase.service`：

```ini
[Unit]
Description=PocketBase (qiluweb CMS)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/qiluweb/pocketbase
ExecStart=/opt/qiluweb/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

启动命令：

```bash
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
```

### 13.2 Nginx 配置调整

**如果使用 Docker**：`nginx.conf` 中的 upstream 保持为 `http://pocketbase:8090`（服务名）。

**如果使用 Systemd**：修改为 `http://127.0.0.1:8090`：

```nginx
location ^~ /pb/_/ {
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    allow 172.16.0.0/12;
    allow 192.168.0.0/16;
    deny all;

    proxy_pass http://127.0.0.1:8090/_/;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host              $http_host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
}

location ^~ /pb/ {
    proxy_pass http://127.0.0.1:8090/;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host              $http_host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

**调整内网 IP 白名单**：根据实际内网 IP 段修改 `allow` 规则。

### 13.3 前端构建

创建 `.env.production`（如果还没有）：

```bash
VITE_PB_BASE_URL=/pb
```

执行构建：

```bash
npm run build
```

将 `dist/` 目录部署到 Nginx 的 root 路径。

### 13.4 数据持久化与备份

**必须持久化的目录**：

```
pocketbase/pb_data/
├── data.db          # SQLite 主库
├── logs.db          # 日志库
└── storage/         # 上传的文件（图片等）
```

**定时备份脚本**（`/opt/backup/pocketbase-backup.sh`）：

```bash
#!/bin/bash
# 每日备份脚本（cron 每日执行）
BACKUP_DIR="/backup/pocketbase"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cd /opt/qiluweb/pocketbase  # 或容器挂载路径

# 方案 1：停服快照（最安全，但会短暂中断服务）
# systemctl stop pocketbase
# tar -czf $BACKUP_DIR/pb_data_$DATE.tar.gz pb_data/
# systemctl start pocketbase

# 方案 2：SQLite 在线备份（不停服，推荐）
sqlite3 pb_data/data.db ".backup $BACKUP_DIR/data_$DATE.db"
cp -r pb_data/storage $BACKUP_DIR/storage_$DATE

# 保留最近 7 天
find $BACKUP_DIR -type f -mtime +7 -delete
```

配置 cron（每天凌晨 2 点）：

```bash
crontab -e
# 添加：
0 2 * * * /opt/backup/pocketbase-backup.sh >> /var/log/pb-backup.log 2>&1
```

### 13.5 首次部署初始化

1. 启动 PocketBase（容器或 systemd）
2. 从内网机器访问 `http://<生产IP>/_/`（或通过 SSH 端口转发）：
   ```bash
   ssh -L 8090:127.0.0.1:8090 user@生产服务器IP
   # 本地浏览器访问 http://localhost:8090/_/
   ```
3. 创建管理员账号（使用强密码）
4. 导入 `pocketbase/pb_schema.json`（Settings → Import collections）
5. 验证 API Rules：
   - List/View: `status = 'published'`
   - Create/Update/Delete: `null`（留空）

### 13.6 部署检查清单

- [ ] PocketBase 服务已启动且监听 8090
- [ ] Nginx `/pb/` 反代配置已生效（`curl http://生产IP/pb/api/health`）
- [ ] `/pb/_/` 仅内网可访问（外网 curl 应返回 403）
- [ ] 前端已用 `npm run build` 构建，dist 已部署到 nginx root
- [ ] 已创建 PB 管理员账号并导入 schema
- [ ] 已添加至少 1 条测试数据（status=published）验证前端列表/详情页
- [ ] pb_data 目录已配置自动备份（cron + tar/sqlite backup）

## 14. 生产环境内容更新

### 14.1 通过 Admin UI（推荐）

#### 访问方式

**方式 1：内网直连**（需在白名单 IP 段内）

```
http://<生产IP>:8090/_/
```

**方式 2：SSH 端口转发**（从外网安全访问）

```bash
ssh -L 8090:127.0.0.1:8090 user@生产服务器IP
# 本地浏览器访问 http://localhost:8090/_/
```

#### 新增新闻流程

1. 登录 Admin UI
2. Collections → **center_news** → **New record**
3. 填写字段：
   - **title**：新闻标题
   - **summary**：摘要（列表页显示，建议 ≤100 字）
   - **body**：正文（支持 `{{img:n}}` 占位符插图）
   - **status**：选择 `published`（draft 不会在前端显示）
   - **publish_at**：发布日期（用于排序）
   - **images**：上传图片（对应 `{{img:1}}`、`{{img:2}}` 等）
4. 点击 **Create**
5. 前端立即生效（无需重启/重新构建）

#### 图片插入规则

- 正文中写 `{{img:1}}` 会渲染 images 数组的第 1 张图片（索引 0）
- `{{img:2}}` 对应第 2 张图片（索引 1），以此类推
- 示例：

```
平台正式启用，支持多种教学场景。

{{img:1}}

上图为主界面展示。更多功能请访问官网。

{{img:2}}

这是配套设备图片。
```

#### 修改已发布新闻

1. Collections → center_news → 点击对应记录
2. 修改字段后点击 **Save**
3. 或临时下架：把 status 改成 `draft`

### 14.2 通过 API（适合批量/自动化）

如需程序化管理（批量导入、从其他 CMS 迁移），可使用 PocketBase SDK：

```javascript
// Node.js 示例
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

// 1. 管理员登录
await pb.admins.authWithPassword("admin@example.com", "password");

// 2. 创建新闻
await pb.collection("center_news").create({
  title: "新闻标题",
  summary: "摘要",
  body: "正文内容。{{img:1}}这是图片说明。",
  status: "published",
  publish_at: "2026-01-10",
  // images: 需先上传文件再关联
});

// 3. 批量导入示例
const newsData = [
  {
    title: "新闻1",
    summary: "摘要1",
    body: "正文1",
    status: "published",
    publish_at: "2026-01-10",
  },
  {
    title: "新闻2",
    summary: "摘要2",
    body: "正文2",
    status: "published",
    publish_at: "2026-01-09",
  },
];

for (const item of newsData) {
  await pb.collection("center_news").create(item);
}
```

**注意**：API 调用需要管理员 token，生产环境应限制访问来源（仅内网/特定 IP）。

### 14.3 内容审核流程（可选）

如需"草稿 → 审核 → 发布"流程：

1. **编辑阶段**：创建时 status 选 `draft`
2. **审核通过**：审核人员登录后将 status 改为 `published`
3. **权限扩展**（未来需求）：
   - 可增加 users collection，设置编辑/审核角色
   - 用 createRule/updateRule 实现"编辑只能创建/修改 draft，审核员可发布"
   - 当前默认方案："所有写操作仅走 Admin"，已是最简单安全的方式

### 14.4 常见问题

**Q: 更新新闻后前端没变化？**  
A: 检查浏览器缓存；PocketBase 数据变更立即生效，无需重启。可 Hard Refresh（Ctrl+Shift+R）。

**Q: 上传图片失败？**  
A: 检查文件大小（≤5MB）和格式（jpg/png/gif/webp）；超出需调整 collection 的 maxSize。

**Q: 图片 URL 404？**  
A: 确认 Nginx `/pb/` 反代正常；检查图片文件名是否与 `{{img:n}}` 索引对应。

**Q: 外网可以访问 Admin UI？**  
A: 检查 Nginx `/pb/_/` location 的 allow/deny 规则是否生效；确认防火墙规则。
