#!/bin/bash
# 前端专用：一键构建、推送并在本地部署脚本
# 运行环境：已拉取代码的阿里云服务器 (Linux)

# --- 1. 配置信息 ---
REGISTRY="crpi-v3gvy8meoymt6a59.cn-shenzhen.personal.cr.aliyuncs.com"
REGISTRY_VPC="crpi-v3gvy8meoymt6a59-vpc.cn-shenzhen.personal.cr.aliyuncs.com"
NAMESPACE="test_xander"
IMAGE_NAME="xander"
CONTAINER_NAME="xander-lab-frontend"
TAG="1.0.1"
USERNAME="aliyun6938781443"

echo "=========================================="
echo "   阿里云服务器：前端 构建 + 推送 + 部署"
echo "=========================================="

# --- 2. 检查 .env.production 是否存在 ---
if [ ! -f ".env.production" ]; then
    echo "错误: 未找到 .env.production 文件！"
    exit 1
fi

# 加载环境变量
export $(grep -v '^#' .env.production | xargs)

# 优先使用 VPC 推送
REGISTRY_TO_USE=$REGISTRY_VPC

# --- 3. 登录阿里云镜像仓库 ---
echo "正在登录阿里云镜像仓库..."
echo "$ALIYUN_REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$USERNAME" --password-stdin

# --- 4. 构建 Docker 镜像 ---
echo "正在本地构建前端镜像: $IMAGE_NAME:$TAG ..."
if ! docker build -t "$IMAGE_NAME:$TAG" .; then
    echo "=========================================="
    echo "错误: 镜像构建失败！"
    echo "=========================================="
    exit 1
fi

# --- 5. 标记镜像并推送至仓库 ---
FULL_IMAGE="$REGISTRY/$NAMESPACE/$IMAGE_NAME:$TAG"
echo "正在推送镜像至阿里云仓库: $FULL_IMAGE ..."
docker tag "$IMAGE_NAME:$TAG" "$FULL_IMAGE"
docker push "$FULL_IMAGE"


# --- 6. 停止并删除旧容器 ---
echo "正在清理旧容器..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# --- 7. 启动新容器 ---
echo "正在启动新容器..."
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p 30001:30001 \
  "$FULL_IMAGE"

echo "=========================================="
echo "✓ 前端部署解析完成！"
echo "访问地址: http://您的服务器IP:30001"
echo "=========================================="
