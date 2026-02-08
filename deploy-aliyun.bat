@echo off
REM Xander Lab Frontend - 阿里云镜像仓库部署脚本 (Windows版本)
REM 功能：
REM   1. 打包镜像
REM   2. 上传到阿里云个人镜像仓库
REM   3. 从阿里云拉取镜像并部署服务
REM
REM 使用方法:
REM   deploy-aliyun.bat [options]
REM
REM 选项:
REM   -t TAG           镜像版本标签 (默认: latest)
REM   -e ENV           部署环境 (默认: production)
REM   -r URL           阿里云镜像仓库地址
REM   -n NS            命名空间
REM   -i IMAGE         镜像名称 (默认: xander-lab-frontend)
REM   -s STEP          执行步骤: build|push|deploy|all (默认: all)
REM   -h               显示帮助信息
REM
REM 环境变量:
REM   ALIYUN_REGISTRY_URL      阿里云镜像仓库地址
REM   ALIYUN_REGISTRY_NAMESPACE 命名空间
REM   ALIYUN_REGISTRY_USERNAME  登录用户名
REM   ALIYUN_REGISTRY_PASSWORD  登录密码或访问令牌

setlocal enabledelayedexpansion

REM 默认配置
set TAG=latest
set ENVIRONMENT=production
set STEP=all
set REGISTRY_URL=
set REGISTRY_NAMESPACE=
set IMAGE_NAME=xander-lab-frontend
set CONTAINER_NAME=xander-lab-frontend
set PORT=30001
set NETWORK_NAME=xander-network

REM 解析命令行参数
:parse_args
if "%~1"=="" goto :args_done
if /i "%~1"=="-t" (
    set TAG=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--tag" (
    set TAG=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--env" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-r" (
    set REGISTRY_URL=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--registry" (
    set REGISTRY_URL=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-n" (
    set REGISTRY_NAMESPACE=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--namespace" (
    set REGISTRY_NAMESPACE=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-i" (
    set IMAGE_NAME=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--image" (
    set IMAGE_NAME=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-s" (
    set STEP=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="--step" (
    set STEP=%~2
    shift
    shift
    goto :parse_args
)
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="--help" goto :show_help
echo 未知参数: %~1
goto :show_help

:args_done

REM 加载配置
if "!REGISTRY_URL!"=="" (
    if not "!ALIYUN_REGISTRY_URL!"=="" (
        set REGISTRY_URL=!ALIYUN_REGISTRY_URL!
    ) else (
        set REGISTRY_URL=registry.cn-hangzhou.aliyuncs.com
    )
)

if "!REGISTRY_NAMESPACE!"=="" (
    if not "!ALIYUN_REGISTRY_NAMESPACE!"=="" (
        set REGISTRY_NAMESPACE=!ALIYUN_REGISTRY_NAMESPACE!
    ) else (
        echo 错误: 未指定命名空间，请通过 -n 参数或 ALIYUN_REGISTRY_NAMESPACE 环境变量设置
        exit /b 1
    )
)

REM 检查依赖
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker 未安装
    exit /b 1
)

REM 构建完整镜像地址
set FULL_IMAGE_NAME=!REGISTRY_URL!/!REGISTRY_NAMESPACE!/!IMAGE_NAME!:!TAG!
set LOCAL_IMAGE_NAME=!IMAGE_NAME!:!TAG!

echo ========================================
echo   Xander Lab Frontend - 阿里云部署
echo ========================================
echo.
echo 配置信息:
echo   镜像地址: !FULL_IMAGE_NAME!
echo   执行步骤: !STEP!
echo   环境: !ENVIRONMENT!
echo.

REM 根据步骤执行
if /i "!STEP!"=="build" goto :build
if /i "!STEP!"=="push" goto :push
if /i "!STEP!"=="deploy" goto :deploy
if /i "!STEP!"=="all" goto :all
echo 错误: 无效的步骤: !STEP!
echo 有效步骤: build, push, deploy, all
exit /b 1

:build
echo ========================================
echo   步骤 1: 构建 Docker 镜像
echo ========================================
echo.
echo 构建本地镜像: !LOCAL_IMAGE_NAME!
docker build -t !LOCAL_IMAGE_NAME! .
if errorlevel 1 (
    echo 错误: Docker 构建失败
    exit /b 1
)

echo 标记镜像: !LOCAL_IMAGE_NAME! -^> !FULL_IMAGE_NAME!
docker tag !LOCAL_IMAGE_NAME! !FULL_IMAGE_NAME!
echo ✓ 镜像构建完成
echo.
goto :end

:push
echo ========================================
echo   步骤 2: 推送镜像到阿里云
echo ========================================
echo.
if "!ALIYUN_REGISTRY_USERNAME!"=="" (
    echo 错误: 需要设置 ALIYUN_REGISTRY_USERNAME 环境变量
    exit /b 1
)
if "!ALIYUN_REGISTRY_PASSWORD!"=="" (
    echo 错误: 需要设置 ALIYUN_REGISTRY_PASSWORD 环境变量
    exit /b 1
)

echo 登录阿里云镜像仓库...
echo !ALIYUN_REGISTRY_PASSWORD! | docker login !REGISTRY_URL! -u !ALIYUN_REGISTRY_USERNAME! --password-stdin
if errorlevel 1 (
    echo 错误: 登录失败
    exit /b 1
)

echo 推送镜像: !FULL_IMAGE_NAME!
docker push !FULL_IMAGE_NAME!
if errorlevel 1 (
    echo 错误: 推送失败
    exit /b 1
)

echo ✓ 镜像推送完成
echo.
goto :end

:deploy
echo ========================================
echo   步骤 3: 部署服务
echo ========================================
echo.

if not "!ALIYUN_REGISTRY_USERNAME!"=="" (
    if not "!ALIYUN_REGISTRY_PASSWORD!"=="" (
        echo 登录阿里云镜像仓库...
        echo !ALIYUN_REGISTRY_PASSWORD! | docker login !REGISTRY_URL! -u !ALIYUN_REGISTRY_USERNAME! --password-stdin
    )
)

echo 停止现有容器...
docker stop !CONTAINER_NAME! 2>nul
docker rm !CONTAINER_NAME! 2>nul

echo 拉取镜像: !FULL_IMAGE_NAME!
docker pull !FULL_IMAGE_NAME!
if errorlevel 1 (
    echo 错误: 拉取镜像失败
    exit /b 1
)

echo 创建网络（如果不存在）...
docker network create !NETWORK_NAME! 2>nul

echo 启动容器...
docker run -d ^
    --name !CONTAINER_NAME! ^
    --restart unless-stopped ^
    -p !PORT!:!PORT! ^
    -e NODE_ENV=!ENVIRONMENT! ^
    --network !NETWORK_NAME! ^
    !FULL_IMAGE_NAME!
if errorlevel 1 (
    echo 错误: 容器启动失败
    exit /b 1
)

echo ✓ 服务部署完成
echo.

echo 等待容器启动...
timeout /t 5 /nobreak >nul

docker ps | findstr !CONTAINER_NAME! >nul
if errorlevel 1 (
    echo ✗ 容器启动失败
    echo 查看日志: docker logs !CONTAINER_NAME!
    exit /b 1
) else (
    echo ✓ 容器运行中
)

echo.
echo ========================================
echo   部署信息
echo ========================================
echo.
echo 镜像地址: !FULL_IMAGE_NAME!
echo 容器名称: !CONTAINER_NAME!
echo 端口: !PORT!
echo 环境: !ENVIRONMENT!
echo 版本标签: !TAG!
echo.
echo 访问地址: http://localhost:!PORT!
echo.
echo 常用命令:
echo   查看日志:        docker logs -f !CONTAINER_NAME!
echo   停止容器:        docker stop !CONTAINER_NAME!
echo   重启容器:        docker restart !CONTAINER_NAME!
echo   删除容器:        docker rm -f !CONTAINER_NAME!
echo.
goto :end

:all
call :build
call :push
call :deploy
goto :end

:show_help
echo Xander Lab Frontend - 阿里云镜像仓库部署脚本 (Windows版本)
echo.
echo 使用方法:
echo   deploy-aliyun.bat [options]
echo.
echo 选项:
echo   -t TAG           镜像版本标签 (默认: latest)
echo   -e ENV           部署环境 (默认: production)
echo   -r URL           阿里云镜像仓库地址
echo   -n NS            命名空间
echo   -i IMAGE         镜像名称 (默认: xander-lab-frontend)
echo   -s STEP          执行步骤: build^|push^|deploy^|all (默认: all)
echo   -h               显示帮助信息
echo.
echo 环境变量:
echo   ALIYUN_REGISTRY_URL      阿里云镜像仓库地址
echo   ALIYUN_REGISTRY_NAMESPACE 命名空间
echo   ALIYUN_REGISTRY_USERNAME  登录用户名
echo   ALIYUN_REGISTRY_PASSWORD  登录密码或访问令牌
echo.
echo 示例:
echo   deploy-aliyun.bat -t v1.0.0 -e production
echo   deploy-aliyun.bat --tag v1.0.0 --step build
echo   deploy-aliyun.bat --tag v1.0.0 --step push
echo   deploy-aliyun.bat --tag v1.0.0 --step deploy
exit /b 0

:end
echo 部署流程完成!
endlocal


