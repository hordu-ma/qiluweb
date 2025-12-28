# 代码审查报告

- 路由访问被彻底拦截：`src/main.js:74-90` 只放行公开页，其余一律重定向 `/welcome`，登录后跳转 `/main` 也会被拦截，后台 `/index/*` 全部不可达。应基于 token/角色做真实校验并放行后台路由。
- 登录页 XSS 风险：`src/views/login.vue:167-192` 渲染免责声明时 `sanitize: false` 且使用 `v-html`，若后端返回恶意 HTML 可执行脚本。应启用 HTML 消毒或限定允许标签。
- 接口域名/路径混乱且泄露：axios 基址 `window.location.origin + "/platform/chat-platform-api"`（`src/libs/axios/request.js:4-8`），Vite 代理指向 `/chat-platform-api`，Nginx 代理 `/api` 到内网服务（`nginx.conf:24-28`），并在 `src/main.js:153` 硬编码 `http://47.236.254.2`。不同环境将导致请求失败并暴露内部地址，需统一通过环境变量配置。
- 上传接口头设置错误：`requestPost` 强制 `Content-Type: application/json`（`src/libs/axios/request.js:49-68`），但 `uploadExcel` 传入 `FormData`（`src/libs/axios/ningbo.js:4-18`），浏览器不会自动带 multipart 边界，上传会失败。应去掉强制头或为上传单独配置 multipart。
- 依赖存在已知漏洞且过旧：`axios@0.19.1`、`highlight.js@9.18.5`（`package.json`）有公开 CVE（SSRF/DoS/XSS）。建议升级至受支持版本（如 axios 1.x、highlight.js 11.x）并回归测试。
- 鉴权缺少有效期处理：token 存于 sessionStorage，但无 axios 响应拦截处理 401/过期（`src/libs/axios/request.js`），路由守卫也未校验 token。应在请求拦截/路由守卫中统一处理未登录与过期态，跳转登录或刷新 token。

**优先修复建议**

1. 修正路由守卫与鉴权逻辑，确保后台可达且安全。
2. 修复免责声明渲染与上传请求的安全/兼容问题。
3. 统一接口域配置并升级存在漏洞的依赖。
