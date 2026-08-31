# 阿里云镜像仓库部署指南

本指南介绍如何使用阿里云容器镜像服务进行镜像构建、推送和部署。

## 📋 前置要求

1. **Docker** 已安装并运行
2. **阿里云容器镜像服务** 账号
3. 已创建命名空间和镜像仓库

## 🔧 配置说明

### 1. 环境变量配置

在运行脚本前，需要设置以下环境变量：

```bash
# Linux/Mac
export ALIYUN_REGISTRY_URL="registry.cn-hangzhou.aliyuncs.com"
export ALIYUN_REGISTRY_NAMESPACE="your-namespace"
export ALIYUN_REGISTRY_USERNAME="your-username"
export ALIYUN_REGISTRY_PASSWORD="your-password"

# Windows PowerShell
$env:ALIYUN_REGISTRY_URL="registry.cn-hangzhou.aliyuncs.com"
$env:ALIYUN_REGISTRY_NAMESPACE="your-namespace"
$env:ALIYUN_REGISTRY_USERNAME="your-username"
$env:ALIYUN_REGISTRY_PASSWORD="your-password"

# Windows CMD
set ALIYUN_REGISTRY_URL=registry.cn-hangzhou.aliyuncs.com
set ALIYUN_REGISTRY_NAMESPACE=your-namespace
set ALIYUN_REGISTRY_USERNAME=your-username
set ALIYUN_REGISTRY_PASSWORD=your-password
```

### 2. 配置文件说明

`docker-registry-config.yml` 文件包含默认配置，可以通过环境变量覆盖。

## 🚀 使用方法

### Linux/Mac

```bash
# 给脚本添加执行权限（首次使用）
chmod +x deploy-aliyun.sh

# 完整流程（构建 + 推送 + 部署）
./deploy-aliyun.sh -t v1.0.0 -e production

# 仅构建镜像
./deploy-aliyun.sh --tag v1.0.0 --step build

# 仅推送镜像
./deploy-aliyun.sh --tag v1.0.0 --step push

# 仅部署服务
./deploy-aliyun.sh --tag v1.0.0 --step deploy
```

### Windows

```cmd
REM 完整流程（构建 + 推送 + 部署）
deploy-aliyun.bat -t v1.0.0 -e production

REM 仅构建镜像
deploy-aliyun.bat --tag v1.0.0 --step build

REM 仅推送镜像
deploy-aliyun.bat --tag v1.0.0 --step push

REM 仅部署服务
deploy-aliyun.bat --tag v1.0.0 --step deploy
```

## 📝 参数说明

| 参数          | 简写 | 说明               | 默认值                |
| ------------- | ---- | ------------------ | --------------------- |
| `--tag`       | `-t` | 镜像版本标签       | `latest`              |
| `--env`       | `-e` | 部署环境           | `production`          |
| `--registry`  | `-r` | 阿里云镜像仓库地址 | 从环境变量读取        |
| `--namespace` | `-n` | 命名空间           | 从环境变量读取        |
| `--image`     | `-i` | 镜像名称           | `xander-lab-frontend` |
| `--step`      | `-s` | 执行步骤           | `all`                 |
| `--help`      | `-h` | 显示帮助信息       | -                     |

### 执行步骤说明

- `build`: 仅构建镜像
- `push`: 仅推送镜像到阿里云
- `deploy`: 仅从阿里云拉取镜像并部署
- `all`: 执行完整流程（构建 → 推送 → 部署）

## 🔄 部署流程

### 完整流程（`--step all`）

1. **构建镜像**
    - 使用 `Dockerfile` 构建本地镜像
    - 标记镜像为阿里云镜像仓库地址格式

2. **推送镜像**
    - 登录阿里云镜像仓库
    - 推送镜像到远程仓库

3. **部署服务**
    - 从阿里云拉取镜像
    - 停止并删除现有容器
    - 启动新容器

### 分步执行

如果需要分步执行，可以使用 `--step` 参数：

```bash
# 1. 构建镜像
./deploy-aliyun.sh -t v1.0.0 --step build

# 2. 推送镜像
./deploy-aliyun.sh -t v1.0.0 --step push

# 3. 部署服务（在服务器上执行）
./deploy-aliyun.sh -t v1.0.0 --step deploy
```

## 🌍 阿里云镜像仓库地址

根据你的地域选择对应的地址：

- 华东1（杭州）: `registry.cn-hangzhou.aliyuncs.com`
- 华东2（上海）: `registry.cn-shanghai.aliyuncs.com`
- 华北1（青岛）: `registry.cn-qingdao.aliyuncs.com`
- 华北2（北京）: `registry.cn-beijing.aliyuncs.com`
- 华南1（深圳）: `registry.cn-shenzhen.aliyuncs.com`
- 更多地域请查看 [阿里云文档](https://help.aliyun.com/document_detail/60750.html)

## 🔐 获取登录凭证

### 方式1: 使用阿里云账号密码

```bash
export ALIYUN_REGISTRY_USERNAME="your-aliyun-username"
export ALIYUN_REGISTRY_PASSWORD="your-aliyun-password"
```

### 方式2: 使用访问令牌（推荐）

1. 登录阿里云容器镜像服务控制台
2. 进入「访问凭证」页面
3. 设置固定密码或创建访问令牌
4. 使用访问令牌作为密码

```bash
export ALIYUN_REGISTRY_USERNAME="your-aliyun-username"
export ALIYUN_REGISTRY_PASSWORD="your-access-token"
```

## 📊 示例场景

### 场景1: 本地开发后部署到服务器

```bash
# 在本地构建并推送
./deploy-aliyun.sh -t v1.0.0 --step build
./deploy-aliyun.sh -t v1.0.0 --step push

# 在服务器上拉取并部署
./deploy-aliyun.sh -t v1.0.0 --step deploy
```

### 场景2: CI/CD 自动化部署

```bash
# 在 CI/CD 脚本中
export ALIYUN_REGISTRY_USERNAME="$CI_REGISTRY_USER"
export ALIYUN_REGISTRY_PASSWORD="$CI_REGISTRY_PASSWORD"
./deploy-aliyun.sh -t $CI_COMMIT_TAG --step all
```

### 场景3: 多环境部署

```bash
# 生产环境
./deploy-aliyun.sh -t v1.0.0 -e production

# 测试环境
./deploy-aliyun.sh -t v1.0.0-test -e testing
```

## 🐛 故障排查

### 问题1: 登录失败

```
错误: 登录失败
```

**解决方案:**

- 检查用户名和密码是否正确
- 确认镜像仓库地址是否正确
- 检查网络连接

### 问题2: 推送失败

```
错误: 推送失败
```

**解决方案:**

- 确认命名空间和镜像名称是否正确
- 检查是否有推送权限
- 确认镜像是否已构建成功

### 问题3: 拉取失败

```
错误: 拉取镜像失败
```

**解决方案:**

- 确认镜像已成功推送到仓库
- 检查镜像地址是否正确
- 确认登录凭证是否有效

### 问题4: 容器启动失败

```
✗ 容器启动失败
```

**解决方案:**

```bash
# 查看容器日志
docker logs xander-lab-frontend

# 检查端口是否被占用
netstat -ano | findstr :30001  # Windows
lsof -i :30001                 # Linux/Mac
```

## 📚 相关文档

- [Docker 部署文档](./DOCKER_README.md)
- [项目架构文档](./PROJECT_ARCHITECTURE.md)
- [阿里云容器镜像服务文档](https://help.aliyun.com/product/60716.html)

## 🔗 相关命令

```bash
# 查看镜像
docker images | grep xander-lab-frontend

# 查看容器状态
docker ps | grep xander-lab-frontend

# 查看容器日志
docker logs -f xander-lab-frontend

# 停止容器
docker stop xander-lab-frontend

# 删除容器
docker rm -f xander-lab-frontend

# 删除镜像
docker rmi registry.cn-hangzhou.aliyuncs.com/your-namespace/xander-lab-frontend:v1.0.0
```

---

**最后更新**: 2026-02-05
