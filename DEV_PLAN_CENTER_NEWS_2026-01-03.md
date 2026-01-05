# PocketBase CMS 部署与使用指南

> 本文档记录了 PocketBase 在生产环境（education.qiluhospital.com）的完整部署过程和使用方法。

## 部署概览

**已完成部署内容：**

- ✅ PocketBase 容器运行在 Docker (internal_network)
- ✅ Nginx 反向代理配置（/pb/ 路径）
- ✅ 前端代码集成 PocketBase SDK
- ✅ center_news 集合配置与权限设置
- ✅ 管理员账号创建

**访问地址：**

- 管理后台：`https://education.qiluhospital.com/pb/_/`
- API 端点：`https://education.qiluhospital.com/pb/api/`
- 前端页面：`https://education.qiluhospital.com/news`

---

## 1. 架构说明

### 1.1 技术栈

- **后端 CMS**：PocketBase v0.22.20 (Go + SQLite)
- **前端框架**：Vue.js 2 + Element UI
- **反向代理**：Nginx (Docker)
- **数据存储**：SQLite + 文件存储

### 1.2 路由设计

- `/` - 前端静态站点
- `/pb/` - PocketBase API（公开只读）
- `/pb/_/` - PocketBase 管理后台（需登录）
- `/news` - 新闻列表页
- `/news/:id` - 新闻详情页

### 1.3 数据模型

**center_news 集合字段：**

- `title` (文本，必填) - 新闻标题
- `summary` (文本) - 摘要
- `body` (文本) - 正文内容
- `status` (单选) - draft/published
- `publish_at` (日期) - 发布时间
- `images` (文件，多个) - 新闻图片

---

## 2. 生产环境部署记录

### 2.1 服务器信息

- **操作系统**：Ubuntu 24.04.2 LTS (Linux 6.8.0-56-generic x86_64)
- **域名**：education.qiluhospital.com
- **Docker 网络**：internal_network
- **数据目录**：/data/pocketbase/pb_data
- **Nginx 配置**：/data/nginx/conf/default.conf

### 2.2 PocketBase 容器配置

```bash
docker run -d \
  --name pocketbase \
  --restart unless-stopped \
  --network internal_network \
  -p 127.0.0.1:8090:8090 \
  -v /data/pocketbase/pb_data:/pb/pb_data \
  -e PB_PUBLIC_URL=https://education.qiluhospital.com/pb \
  pocketbase:latest
```

### 2.3 Nginx 反向代理配置

在 `/data/nginx/conf/default.conf` 的第一个 server 块中添加：

```nginx
# PocketBase CMS 反向代理
location ^~ /pb/_/ {
    proxy_pass http://pocketbase:8090/_/;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host              $http_host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
}

location ^~ /pb/ {
    proxy_pass http://pocketbase:8090/;
    proxy_set_header   X-Forwarded-Proto $scheme;
    proxy_set_header   Host              $http_host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
}
```

### 2.4 前端环境变量

`.env` 文件配置：

```
VITE_PB_BASE_URL=/pb
```

---

## 3. 日常使用指南

### 3.1 发布新闻

**步骤：**

1. 访问管理后台：`https://education.qiluhospital.com/pb/_/`
2. 使用管理员账号登录
3. 进入 **center_news** 集合
4. 点击 **New record** 创建新闻：
   - **title**：输入新闻标题
   - **summary**：输入摘要（可选）
   - **body**：输入正文内容
   - **images**：上传新闻图片（可多张）
   - **status**：选择 `published`（发布）或 `draft`（草稿）
   - **publish_at**：选择发布日期
5. 点击 **Create** 保存

**注意事项：**

- 只有 `status=published` 的新闻会在前端显示
- 图片会自动存储在 `/data/pocketbase/pb_data/storage/`
- 正文支持换行，前端会自动渲染

### 3.2 编辑/删除新闻

1. 进入 **center_news** 集合
2. 点击要编辑的记录
3. 修改后点击 **Save** 或点击 **Delete** 删除

### 3.3 查看前端效果

- **新闻列表**：`https://education.qiluhospital.com/news`
- **新闻详情**：点击列表中的新闻标题
- **首页摘要**：首页右侧"中心动态"区域显示最新 4 条

---

## 4. 前端更新部署流程

### 4.1 本地构建

```bash
# 1. 确保环境变量正确
echo "VITE_PB_BASE_URL=/pb" > .env

# 2. 安装依赖并构建
npm install
npm run build

# 3. 打包构建产物
tar -czf qiluweb-dist.tar.gz dist/

# 4. 复制到 Windows 临时目录（WSL环境）
cp qiluweb-dist.tar.gz /mnt/c/tmp/
```

### 4.2 上传到服务器

通过堡垒机 Web 界面上传 `C:\tmp\qiluweb-dist.tar.gz` 到服务器 `/tmp/` 目录

### 4.3 服务器部署

```bash
# 1. 解压到部署目录
cd /data/nginx/up
sudo rm -rf *
sudo tar -xzf /tmp/qiluweb-dist.tar.gz

# 2. 执行部署脚本
sudo bash /data/nginx/script/bot-web-deploy-backup.sh

# 3. 验证部署
ls -lh /data/nginx/html/
```

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

## 8. 生产信息收集清单（待确认部分）

- [x] 基础环境：Ubuntu (Linux 6.8.0-56-generic x86_64)；Docker 部署
- [x] 域名与协议：`https://education.qiluhospital.com/pb/`
- [x] 数据与存储：宿主机 `/data/pocketbase/pb_data`
- [x] 访问控制：移除 IP 限制，依赖 PocketBase 鉴权
- [x] 前端部署：上传至 `/data/nginx/up`，脚本部署至 `/data/nginx/html`
- [ ] **待确认**：现有 Nginx 容器名称与运行方式
- [ ] **待确认**：是否已有其他服务使用 Docker Compose（避免冲突）
- [ ] **待确认**：生产环境是否允许拉取 `ghcr.io` 镜像（或需提前推送到内部镜像仓库）

### 8.1 需在堡垒机执行的确认命令

```bash
# 1. 查看现有 Docker 容器（确认 Nginx 容器名与网络模式）
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# 2. 检查现有 Nginx 容器的网络配置
docker inspect <nginx容器名> | grep -A 10 Networks

# 3. 确认 /data/nginx 目录结构
ls -lh /data/nginx/

# 4. 检查是否已有 docker-compose 部署
find /data -name docker-compose.yml 2>/dev/null

# 5. 测试镜像拉取（可选）
docker pull ghcr.io/muchobien/pocketbase:latest
```
