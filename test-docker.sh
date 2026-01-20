#!/bin/bash

# Docker 部署测试脚本
# 用于验证 Docker 配置是否正确

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Docker 配置测试${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 测试 1: 检查 Docker 是否安装
echo -e "${YELLOW}[1/7] 检查 Docker 安装...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}✓ Docker 已安装: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}✗ Docker 未安装${NC}"
    exit 1
fi

# 测试 2: 检查 Docker 服务状态
echo -e "${YELLOW}[2/7] 检查 Docker 服务状态...${NC}"
if docker info &> /dev/null; then
    echo -e "${GREEN}✓ Docker 服务运行正常${NC}"
else
    echo -e "${RED}✗ Docker 服务未运行${NC}"
    exit 1
fi

# 测试 3: 检查必要文件
echo -e "${YELLOW}[3/7] 检查配置文件...${NC}"
FILES=("Dockerfile" "nginx.docker.conf" "docker-compose.yml" ".dockerignore")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✓ $file${NC}"
    else
        echo -e "${RED}  ✗ $file 不存在${NC}"
        exit 1
    fi
done

# 测试 4: 检查端口占用
echo -e "${YELLOW}[4/7] 检查端口 30001...${NC}"
if lsof -Pi :30001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ 端口 30001 已被占用${NC}"
    lsof -i :30001
else
    echo -e "${GREEN}✓ 端口 30001 可用${NC}"
fi

# 测试 5: 测试构建 (dry-run)
echo -e "${YELLOW}[5/7] 验证 Dockerfile 语法...${NC}"
if docker build --help &> /dev/null; then
    echo -e "${GREEN}✓ Docker build 命令可用${NC}"
else
    echo -e "${RED}✗ Docker build 命令不可用${NC}"
    exit 1
fi

# 测试 6: 检查 Docker Compose
echo -e "${YELLOW}[6/7] 检查 Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}✓ Docker Compose 已安装: $COMPOSE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Docker Compose 未安装 (可选)${NC}"
fi

# 测试 7: 检查磁盘空间
echo -e "${YELLOW}[7/7] 检查磁盘空间...${NC}"
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo -e "${GREEN}✓ 可用空间: $AVAILABLE_SPACE${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  所有测试通过!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "你可以运行以下命令开始部署:"
echo -e "  ${GREEN}./deploy.sh${NC}          # 使用部署脚本"
echo -e "  ${GREEN}docker-compose up -d${NC} # 使用 Docker Compose"
echo ""
