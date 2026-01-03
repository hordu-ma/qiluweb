# PocketBase 开发环境说明

## 快速启动

```bash
# 方式 1：使用启动脚本（推荐）
cd pocketbase
bash start-pb.sh

# 方式 2：直接命令
cd pocketbase
./pocketbase serve --http=127.0.0.1:8090
```

## 首次启动配置

1. **创建管理员账号**

   - 首次启动会自动打开浏览器到 `http://127.0.0.1:8090/_/`
   - 或手动访问该地址
   - 设置管理员邮箱和密码（仅本地使用，可随意设置）

2. **导入 Collection 结构**

   - 登录 Admin UI 后，进入 Settings → Import collections
   - 上传本目录的 `pb_schema.json`
   - 或手动创建 `center_news` collection（参考下方字段说明）

3. **添加测试数据**
   - 进入 Collections → center_news → New record
   - 填写示例：
     - title: `齐鲁医学混合现实教学平台正式启用`
     - summary: `开启沉浸式医学教育新篇章`
     - body: `平台正式启用，支持多种教学场景。{{img:1}}这是配图说明。`
     - status: `published`
     - publish_at: `2025-12-26`
     - images: 上传 1-2 张图片

## Collection 字段说明

### center_news

| 字段       | 类型   | 必填 | 说明                                |
| ---------- | ------ | ---- | ----------------------------------- |
| title      | text   | ✓    | 新闻标题（1-200 字符）              |
| summary    | text   | -    | 摘要/导语（≤500 字符，列表页展示）  |
| body       | text   | ✓    | 正文内容（支持 `{{img:n}}` 占位符） |
| status     | select | ✓    | 状态：draft/published               |
| publish_at | date   | -    | 发布日期（用于排序）                |
| images     | file   | -    | 图片附件（最多 10 张，单张 ≤5MB）   |

**正文占位符规则**：

- `{{img:1}}` 插入第 1 张图片（对应 images[0]）
- `{{img:2}}` 插入第 2 张图片（对应 images[1]）
- 以此类推

## 权限规则

- **公开读取**：`listRule/viewRule = "status = 'published'"`
- **仅后台写入**：`createRule/updateRule/deleteRule = null`

## 数据目录

- 数据库与文件存储在：`pocketbase/pb_data/`
- 备份该目录即可完整备份所有数据

## 停止服务

- 按 `Ctrl+C` 停止

## 常见问题

**Q: 启动后前端仍然 500？**
A: 确保前端 dev server 也重启了（`npm run dev`），否则代理配置不生效。

**Q: Admin UI 访问不了？**
A: 检查是否已创建管理员账号；内网限制仅在 nginx 生产环境生效，dev 环境无此限制。

**Q: 图片上传失败？**
A: 检查文件大小（≤5MB）和格式（jpg/png/gif/webp）。
