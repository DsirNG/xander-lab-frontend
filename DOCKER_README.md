# 🐳 Docker 快速部署参考

## 🚀 一键部署

### Windows
```cmd
deploy.bat
```

### Linux/Mac
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📦 手动部署

### 构建镜像
```bash
docker build -t xander-lab-frontend:latest .
```

### 运行容器
```bash
docker run -d \
  --name xander-lab-frontend \
  --restart unless-stopped \
  -p 30001:30001 \
  xander-lab-frontend:latest
```

### 使用 Docker Compose
```bash
docker-compose up -d
```

## 🌐 访问
```
http://localhost:30001
```

## 🔧 常用命令

| 操作 | 命令 |
|------|------|
| 查看日志 | `docker logs -f xander-lab-frontend` |
| 重启容器 | `docker restart xander-lab-frontend` |
| 停止容器 | `docker stop xander-lab-frontend` |
| 删除容器 | `docker rm -f xander-lab-frontend` |
| 查看状态 | `docker ps` |
| 进入容器 | `docker exec -it xander-lab-frontend sh` |

## 📊 监控

### 查看资源使用
```bash
docker stats xander-lab-frontend
```

### 健康检查
```bash
docker inspect --format='{{.State.Health.Status}}' xander-lab-frontend
```

## 🔄 更新

```bash
# 停止并删除旧容器
docker stop xander-lab-frontend
docker rm xander-lab-frontend

# 重新构建
docker build -t xander-lab-frontend:latest .

# 启动新容器
docker run -d --name xander-lab-frontend --restart unless-stopped -p 30001:30001 xander-lab-frontend:latest
```

## 🐛 故障排查

### 容器无法启动
```bash
docker logs xander-lab-frontend
```

### 端口被占用
```bash
# Linux/Mac
lsof -i :30001

# Windows
netstat -ano | findstr :30001
```

### 清理资源
```bash
docker system prune -a
```

---

**详细文档**: 查看 `DOCKER_DEPLOYMENT.md`
