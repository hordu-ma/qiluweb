#!/bin/bash
# PocketBase 生产部署脚本（适配现有 nginx 容器环境）
# 使用方式：bash deploy-pocketbase.sh

set -e  # 遇到错误立即退出

echo "================================"
echo "PocketBase 生产部署脚本"
echo "================================"

# 1. 创建数据目录
echo "[1/5] 创建 PocketBase 数据目录..."
mkdir -p /data/pocketbase/pb_data
echo "✓ 目录已创建: /data/pocketbase/pb_data"

# 2. 检测现有 nginx 容器的网络
echo "[2/5] 检测现有 nginx 容器网络..."
NGINX_NETWORK=$(docker inspect nginx --format='{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}' | head -n1)

if [ -z "$NGINX_NETWORK" ]; then
    echo "✗ 错误：无法检测到 nginx 容器的网络，请手动检查"
    exit 1
fi
echo "✓ 检测到 nginx 网络: $NGINX_NETWORK"

# 3. 拉取 PocketBase 镜像
echo "[3/5] 拉取 PocketBase 镜像..."
docker pull ghcr.io/muchobien/pocketbase:latest
echo "✓ 镜像拉取成功"

# 4. 停止并删除旧容器（如果存在）
echo "[4/5] 清理旧容器（如果存在）..."
docker stop pocketbase 2>/dev/null || true
docker rm pocketbase 2>/dev/null || true
echo "✓ 清理完成"

# 5. 启动 PocketBase 容器并加入 nginx 网络
echo "[5/5] 启动 PocketBase 容器..."
docker run -d \
  --name pocketbase \
  --restart unless-stopped \
  --network "$NGINX_NETWORK" \
  -p 127.0.0.1:8090:8090 \
  -v /data/pocketbase/pb_data:/pb/pb_data \
  -e PB_PUBLIC_URL=https://education.qiluhospital.com/pb \
  ghcr.io/muchobien/pocketbase:latest

echo "✓ PocketBase 容器已启动"
echo ""
echo "================================"
echo "部署完成！"
echo "================================"
echo "容器名称: pocketbase"
echo "网络: $NGINX_NETWORK (与 nginx 共享)"
echo "数据目录: /data/pocketbase/pb_data"
echo ""
echo "下一步："
echo "1. 更新 nginx 配置文件，添加 /pb/ 反代规则"
echo "2. 重载 nginx: docker exec nginx nginx -s reload"
echo "3. 访问 https://education.qiluhospital.com/pb/_/ 初始化管理员"
echo "================================"
