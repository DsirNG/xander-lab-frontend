#!/bin/bash
# 前端专用：一键构建、推送并在本地部署脚本
# 运行环境：已拉取代码的阿里云服务器 (Linux)

# --- 1. 配置信息 ---
REGISTRY="${ALIYUN_REGISTRY_URL:-}"
REGISTRY_VPC="${ALIYUN_REGISTRY_VPC_URL:-$REGISTRY}"
NAMESPACE="${ALIYUN_REGISTRY_NAMESPACE:-}"
IMAGE_NAME="${IMAGE_NAME:-xander}"
CONTAINER_NAME="${CONTAINER_NAME:-xander-lab-frontend}"
TAG="${IMAGE_TAG:-latest}"
USERNAME="${ALIYUN_REGISTRY_USERNAME:-}"

echo "=========================================="
echo "   阿里云服务器：前端 构建 + 推送 + 部署"
echo "=========================================="

# --- 2. 检查部署配置 ---
if [ -z "$REGISTRY" ] || [ -z "$NAMESPACE" ] || [ -z "$USERNAME" ] || [ -z "$ALIYUN_REGISTRY_PASSWORD" ]; then
    echo "错误: 请通过环境变量设置 ALIYUN_REGISTRY_URL、ALIYUN_REGISTRY_NAMESPACE、ALIYUN_REGISTRY_USERNAME 和 ALIYUN_REGISTRY_PASSWORD。"
    exit 1
fi

# Vite 的生产配置也只从环境变量读取，不依赖仓库内的本地 env 文件。
export VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://api.dinqor.cn}"
export VITE_REQUEST_TIMEOUT="${VITE_REQUEST_TIMEOUT:-30000}"
export VITE_OSS_DOMAIN="${VITE_OSS_DOMAIN:-https://food-cinder.oss-cn-beijing.aliyuncs.com}"
export SEO_API_BASE="${SEO_API_BASE:-http://host.docker.internal:30002/api}"
export SEO_PRERENDER_REQUIRED="${SEO_PRERENDER_REQUIRED:-true}"

# 优先使用 VPC 推送
REGISTRY_TO_USE="$REGISTRY_VPC"

# --- 3. 登录阿里云镜像仓库 ---
echo "正在登录阿里云镜像仓库..."
echo "$ALIYUN_REGISTRY_PASSWORD" | docker login "$REGISTRY_TO_USE" -u "$USERNAME" --password-stdin

# --- 4. 构建 Docker 镜像 ---
echo "正在本地构建前端镜像: $IMAGE_NAME:$TAG ..."
if ! docker build \
    --build-arg SEO_API_BASE="$SEO_API_BASE" \
    --build-arg SEO_PRERENDER_REQUIRED="$SEO_PRERENDER_REQUIRED" \
    --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
    --build-arg VITE_REQUEST_TIMEOUT="$VITE_REQUEST_TIMEOUT" \
    --build-arg VITE_OSS_DOMAIN="$VITE_OSS_DOMAIN" \
    -t "$IMAGE_NAME:$TAG" .; then
    echo "=========================================="
    echo "错误: 镜像构建失败！"
    echo "=========================================="
    exit 1
fi

# --- 5. 标记镜像并推送至仓库 ---
FULL_IMAGE="$REGISTRY_TO_USE/$NAMESPACE/$IMAGE_NAME:$TAG"
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
