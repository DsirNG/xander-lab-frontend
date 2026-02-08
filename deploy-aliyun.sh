#!/bin/bash

# Xander Lab Frontend - 阿里云镜像仓库部署脚本
# 功能：
#   1. 打包镜像
#   2. 上传到阿里云个人镜像仓库
#   3. 从阿里云拉取镜像并部署服务
#
# 使用方法:
#   ./deploy-aliyun.sh [options]
#
# 选项:
#   -t, --tag TAG           镜像版本标签 (默认: latest)
#   -e, --env ENV           部署环境 (默认: production)
#   -r, --registry URL      阿里云镜像仓库地址
#   -n, --namespace NS      命名空间
#   -i, --image IMAGE       镜像名称 (默认: xander-lab-frontend)
#   -s, --step STEP         执行步骤: build|push|deploy|all (默认: all)
#   -h, --help              显示帮助信息
#
# 环境变量:
#   ALIYUN_REGISTRY_URL      阿里云镜像仓库地址
#   ALIYUN_REGISTRY_NAMESPACE 命名空间
#   ALIYUN_REGISTRY_USERNAME  登录用户名
#   ALIYUN_REGISTRY_PASSWORD  登录密码或访问令牌
#
# 示例:
#   ./deploy-aliyun.sh -t v1.0.0 -e production
#   ./deploy-aliyun.sh --tag v1.0.0 --step build
#   ./deploy-aliyun.sh --tag v1.0.0 --step push
#   ./deploy-aliyun.sh --tag v1.0.0 --step deploy

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
CONFIG_FILE="docker-registry-config.yml"
TAG="latest"
ENVIRONMENT="production"
STEP="all"
REGISTRY_URL=""
REGISTRY_NAMESPACE=""
IMAGE_NAME="xander-lab-frontend"
CONTAINER_NAME="xander-lab-frontend"
PORT=30001
NETWORK_NAME="xander-network"

# 解析命令行参数
parse_args() {
  while [[ $# -gt 0 ]]; do
    case $1 in
      -t|--tag)
        TAG="$2"
        shift 2
        ;;
      -e|--env)
        ENVIRONMENT="$2"
        shift 2
        ;;
      -r|--registry)
        REGISTRY_URL="$2"
        shift 2
        ;;
      -n|--namespace)
        REGISTRY_NAMESPACE="$2"
        shift 2
        ;;
      -i|--image)
        IMAGE_NAME="$2"
        shift 2
        ;;
      -s|--step)
        STEP="$2"
        shift 2
        ;;
      -h|--help)
        show_help
        exit 0
        ;;
      *)
        echo -e "${RED}未知参数: $1${NC}"
        show_help
        exit 1
        ;;
    esac
  done
}

# 显示帮助信息
show_help() {
  cat << EOF
${GREEN}Xander Lab Frontend - 阿里云镜像仓库部署脚本${NC}

${YELLOW}使用方法:${NC}
  ./deploy-aliyun.sh [options]

${YELLOW}选项:${NC}
  -t, --tag TAG           镜像版本标签 (默认: latest)
  -e, --env ENV           部署环境 (默认: production)
  -r, --registry URL      阿里云镜像仓库地址
  -n, --namespace NS      命名空间
  -i, --image IMAGE       镜像名称 (默认: xander-lab-frontend)
  -s, --step STEP         执行步骤: build|push|deploy|all (默认: all)
  -h, --help              显示帮助信息

${YELLOW}环境变量:${NC}
  ALIYUN_REGISTRY_URL      阿里云镜像仓库地址
  ALIYUN_REGISTRY_NAMESPACE 命名空间
  ALIYUN_REGISTRY_USERNAME  登录用户名
  ALIYUN_REGISTRY_PASSWORD  登录密码或访问令牌

${YELLOW}示例:${NC}
  ./deploy-aliyun.sh -t v1.0.0 -e production
  ./deploy-aliyun.sh --tag v1.0.0 --step build
  ./deploy-aliyun.sh --tag v1.0.0 --step push
  ./deploy-aliyun.sh --tag v1.0.0 --step deploy
EOF
}

# 加载配置
load_config() {
  # 从环境变量或配置文件读取配置
  if [ -z "$REGISTRY_URL" ]; then
    REGISTRY_URL=${ALIYUN_REGISTRY_URL:-registry.cn-hangzhou.aliyuncs.com}
  fi
  
  if [ -z "$REGISTRY_NAMESPACE" ]; then
    REGISTRY_NAMESPACE=${ALIYUN_REGISTRY_NAMESPACE:-}
  fi
  
  if [ -z "$REGISTRY_NAMESPACE" ]; then
    echo -e "${RED}错误: 未指定命名空间，请通过 -n/--namespace 参数或 ALIYUN_REGISTRY_NAMESPACE 环境变量设置${NC}"
    exit 1
  fi
}

# 检查依赖
check_dependencies() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
  fi
  
  if [ -z "$ALIYUN_REGISTRY_USERNAME" ] || [ -z "$ALIYUN_REGISTRY_PASSWORD" ]; then
    echo -e "${YELLOW}警告: 未设置 ALIYUN_REGISTRY_USERNAME 或 ALIYUN_REGISTRY_PASSWORD 环境变量${NC}"
    echo -e "${YELLOW}推送和拉取镜像时需要登录凭证${NC}"
  fi
}

# 构建完整镜像地址
get_full_image_name() {
  echo "${REGISTRY_URL}/${REGISTRY_NAMESPACE}/${IMAGE_NAME}:${TAG}"
}

# 步骤1: 构建镜像
build_image() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  步骤 1: 构建 Docker 镜像${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  
  FULL_IMAGE_NAME=$(get_full_image_name)
  LOCAL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"
  
  echo -e "${YELLOW}构建本地镜像: ${LOCAL_IMAGE_NAME}${NC}"
  docker build -t "$LOCAL_IMAGE_NAME" .
  
  echo -e "${YELLOW}标记镜像: ${LOCAL_IMAGE_NAME} -> ${FULL_IMAGE_NAME}${NC}"
  docker tag "$LOCAL_IMAGE_NAME" "$FULL_IMAGE_NAME"
  
  echo -e "${GREEN}✓ 镜像构建完成${NC}"
  echo ""
}

# 步骤2: 推送镜像到阿里云
push_image() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  步骤 2: 推送镜像到阿里云${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  
  FULL_IMAGE_NAME=$(get_full_image_name)
  
  # 登录阿里云镜像仓库
  echo -e "${YELLOW}登录阿里云镜像仓库...${NC}"
  if [ -z "$ALIYUN_REGISTRY_USERNAME" ] || [ -z "$ALIYUN_REGISTRY_PASSWORD" ]; then
    echo -e "${RED}错误: 需要设置 ALIYUN_REGISTRY_USERNAME 和 ALIYUN_REGISTRY_PASSWORD 环境变量${NC}"
    exit 1
  fi
  
  echo "$ALIYUN_REGISTRY_PASSWORD" | docker login "$REGISTRY_URL" \
    -u "$ALIYUN_REGISTRY_USERNAME" \
    --password-stdin
  
  # 推送镜像
  echo -e "${YELLOW}推送镜像: ${FULL_IMAGE_NAME}${NC}"
  docker push "$FULL_IMAGE_NAME"
  
  echo -e "${GREEN}✓ 镜像推送完成${NC}"
  echo ""
}

# 步骤3: 从阿里云拉取镜像并部署
deploy_image() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  步骤 3: 部署服务${NC}"
  echo -e "${BLUE}========================================${NC}"
  echo ""
  
  FULL_IMAGE_NAME=$(get_full_image_name)
  
  # 登录阿里云镜像仓库（如果需要拉取私有镜像）
  if [ -n "$ALIYUN_REGISTRY_USERNAME" ] && [ -n "$ALIYUN_REGISTRY_PASSWORD" ]; then
    echo -e "${YELLOW}登录阿里云镜像仓库...${NC}"
    echo "$ALIYUN_REGISTRY_PASSWORD" | docker login "$REGISTRY_URL" \
      -u "$ALIYUN_REGISTRY_USERNAME" \
      --password-stdin
  fi
  
  # 停止并删除现有容器
  echo -e "${YELLOW}停止现有容器...${NC}"
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  
  # 拉取最新镜像
  echo -e "${YELLOW}拉取镜像: ${FULL_IMAGE_NAME}${NC}"
  docker pull "$FULL_IMAGE_NAME"
  
  # 创建网络（如果不存在）
  echo -e "${YELLOW}创建网络（如果不存在）...${NC}"
  docker network create "$NETWORK_NAME" 2>/dev/null || true
  
  # 启动容器
  echo -e "${YELLOW}启动容器...${NC}"
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$PORT:$PORT" \
    -e NODE_ENV="$ENVIRONMENT" \
    --network "$NETWORK_NAME" \
    "$FULL_IMAGE_NAME"
  
  echo -e "${GREEN}✓ 服务部署完成${NC}"
  echo ""
  
  # 等待容器启动
  echo -e "${YELLOW}等待容器启动...${NC}"
  sleep 5
  
  # 检查容器状态
  if docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}✓ 容器运行中${NC}"
    
    # 测试端点
    if curl -f "http://localhost:$PORT" > /dev/null 2>&1; then
      echo -e "${GREEN}✓ 应用响应正常${NC}"
    else
      echo -e "${YELLOW}⚠ 应用可能仍在启动中${NC}"
    fi
  else
    echo -e "${RED}✗ 容器启动失败${NC}"
    echo -e "${RED}查看日志: docker logs $CONTAINER_NAME${NC}"
    exit 1
  fi
}

# 显示部署信息
show_deployment_info() {
  FULL_IMAGE_NAME=$(get_full_image_name)
  
  echo ""
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  部署信息${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  echo -e "镜像地址: ${GREEN}${FULL_IMAGE_NAME}${NC}"
  echo -e "容器名称: ${GREEN}${CONTAINER_NAME}${NC}"
  echo -e "端口: ${GREEN}${PORT}${NC}"
  echo -e "环境: ${GREEN}${ENVIRONMENT}${NC}"
  echo -e "版本标签: ${GREEN}${TAG}${NC}"
  echo ""
  echo -e "访问地址: ${GREEN}http://localhost:${PORT}${NC}"
  echo ""
  echo -e "${YELLOW}常用命令:${NC}"
  echo -e "  查看日志:        ${GREEN}docker logs -f ${CONTAINER_NAME}${NC}"
  echo -e "  停止容器:        ${GREEN}docker stop ${CONTAINER_NAME}${NC}"
  echo -e "  重启容器:        ${GREEN}docker restart ${CONTAINER_NAME}${NC}"
  echo -e "  删除容器:        ${GREEN}docker rm -f ${CONTAINER_NAME}${NC}"
  echo ""
}

# 主函数
main() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}  Xander Lab Frontend - 阿里云部署${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
  
  parse_args "$@"
  load_config
  check_dependencies
  
  FULL_IMAGE_NAME=$(get_full_image_name)
  echo -e "${YELLOW}配置信息:${NC}"
  echo -e "  镜像地址: ${FULL_IMAGE_NAME}"
  echo -e "  执行步骤: ${STEP}"
  echo -e "  环境: ${ENVIRONMENT}"
  echo ""
  
  case "$STEP" in
    build)
      build_image
      ;;
    push)
      push_image
      ;;
    deploy)
      deploy_image
      show_deployment_info
      ;;
    all)
      build_image
      push_image
      deploy_image
      show_deployment_info
      ;;
    *)
      echo -e "${RED}错误: 无效的步骤: ${STEP}${NC}"
      echo -e "${YELLOW}有效步骤: build, push, deploy, all${NC}"
      exit 1
      ;;
  esac
  
  echo -e "${GREEN}部署流程完成!${NC}"
}

# 执行主函数
main "$@"


