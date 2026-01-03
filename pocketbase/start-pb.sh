#!/bin/bash
# PocketBase 启动脚本（开发环境）
# 使用方式: ./start-pb.sh 或 bash start-pb.sh

cd "$(dirname "$0")"

echo "================================"
echo "启动 PocketBase (开发环境)"
echo "================================"
echo "监听地址: http://127.0.0.1:8090"
echo "Admin UI: http://127.0.0.1:8090/_/"
echo ""
echo "首次启动会提示创建管理员账号"
echo "按 Ctrl+C 停止服务"
echo "================================"
echo ""

./pocketbase serve \
  --http=127.0.0.1:8090 \
  --dir=./pb_data
