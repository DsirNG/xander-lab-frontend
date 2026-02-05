# Xander Lab Frontend

一个现代化的 React 组件库和交互系统展示平台，采用企业级架构标准构建。

## 📋 项目简介

Xander Lab 是一个知识分享与学习平台，专注于记录和分享在项目开发过程中积累的实践经验。这里包含了：

- **UI 组件** - 在项目中遇到或自己开发的组件，提供完整源码可直接复用
- **自定义 Hooks** - 封装好的业务逻辑和通用功能，减少重复开发
- **学习笔记** - 第一次学习到的新知识、技术点和解决方案
- **交互模式** - 各种 UI 交互模式的实现和最佳实践
- **基础设施** - 底层工具函数、服务封装等可复用代码

项目采用模块化设计，所有代码都提供完整源码，可以直接在下次项目中使用，减少重复开发的工作量。同时，这也是一个知识管理平台，帮助自己复习和巩固知识，也为新手开发者提供学习资源，让他们能够找到想要学习的、能够学习的各种实践案例。

## 💡 项目价值

- **减少重复开发** - 提供可直接复用的组件和 Hooks，提高开发效率
- **知识沉淀** - 记录项目中的实践经验，形成个人知识库
- **学习资源** - 为新手开发者提供真实项目案例和学习材料
- **持续改进** - 通过实践不断优化和完善代码质量

## 🙏 欢迎指正

本项目旨在分享和学习，如有错误、不足或改进建议，欢迎指出！您的反馈将帮助我们共同进步。

可以通过以下方式反馈：
- 提交 Issue
- 发起 Pull Request
- 直接联系维护者

## ✨ 特性

- 🎨 **现代化 UI** - 基于 TailwindCSS 和 CSS Modules 的样式系统
- 🌍 **国际化支持** - 内置 i18next 多语言支持
- 🏗️ **企业级架构** - 清晰的分层和模块化设计
- ⚡ **高性能** - Vite 构建，快速开发体验
- 📱 **响应式设计** - 完美适配各种设备
- 🎭 **动画效果** - 基于 Framer Motion 的流畅动画
- 🔧 **类型安全** - TypeScript 类型定义支持

## 🛠️ 技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **样式**: TailwindCSS 4.1.18 + CSS Modules
- **路由**: React Router DOM 7.12.0
- **国际化**: i18next 25.7.4
- **动画**: Framer Motion 12.26.2
- **图标**: Lucide React 0.562.0

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd xander-lab-frontend

# 安装依赖
npm install
# 或使用 pnpm
pnpm install
```

### 开发

启动开发服务器：

```bash
npm run dev
```

打开浏览器访问 [http://localhost:5173](http://localhost:5173)

### 构建

构建生产版本：

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览

预览构建结果：

```bash
npm run preview
```

### 代码检查

运行 ESLint 检查：

```bash
npm run lint
```

## 📁 项目结构

```
xander-lab-frontend/
├── src/
│   ├── api/              # API 接口层
│   ├── assets/          # 静态资源
│   ├── components/      # 通用组件
│   │   ├── common/      # 基础组件
│   │   └── layouts/     # 布局组件
│   ├── config/          # 配置文件
│   ├── constants/       # 常量定义
│   ├── features/        # 功能模块（按业务领域划分）
│   │   ├── home/        # 首页模块
│   │   ├── infra/       # 基础设施模块
│   │   ├── modules/     # 功能模块展示
│   │   └── components/  # 组件展示模块
│   ├── hooks/           # 自定义 Hooks
│   ├── locales/         # 国际化资源
│   ├── router/          # 路由配置
│   ├── services/        # 业务服务层
│   ├── styles/          # 全局样式
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── App.jsx          # 应用根组件
│   └── main.jsx         # 应用入口
├── public/              # 公共静态资源
├── .editorconfig        # 编辑器配置
├── jsconfig.json        # JavaScript 配置（路径别名）
├── tailwind.config.js   # TailwindCSS 配置
├── vite.config.js       # Vite 配置
└── package.json         # 项目依赖配置
```

## 📚 文档

- [项目架构文档](./PROJECT_ARCHITECTURE.md) - 详细的架构说明和设计原则
- [编码规范](./CODING_STANDARDS.md) - 代码风格和开发规范
- [快速开始指南](./QUICK_START.md) - 快速上手指南

## 🔧 路径别名

项目配置了路径别名，简化导入路径：

```javascript
import MainLayout from '@components/layouts/MainLayout'
import HomePage from '@features/home/pages/HomePage'
import { storage, debounce } from '@utils'
import { APP_CONFIG } from '@config'
import '@styles/index.css'
```

支持的别名：
- `@` → `src/`
- `@components` → `src/components/`
- `@features` → `src/features/`
- `@hooks` → `src/hooks/`
- `@utils` → `src/utils/`
- `@services` → `src/services/`
- `@config` → `src/config/`
- `@constants` → `src/constants/`
- `@api` → `src/api/`
- `@locales` → `src/locales/`
- `@styles` → `src/styles/`
- `@types` → `src/types/`

## 🎯 核心功能

### 基础设施模块
- **Anchored Overlay** - 锚定浮层定位系统
- **Focus Trap** - 焦点管理
- **Scroll Management** - 滚动管理

### 功能模块
- **Popover** - 气泡浮层
- **Dropdown Menu** - 下拉菜单
- **Tooltip** - 文字提示
- **Drag & Drop** - 拖拽系统
- **Context Menu** - 右键菜单

## 🧩 使用示例

### 使用工具函数

```javascript
import { debounce, throttle, storage, cn } from '@utils'

// 防抖
const debouncedFn = debounce(() => {
  console.log('防抖执行')
}, 300)

// 节流
const throttledFn = throttle(() => {
  console.log('节流执行')
}, 300)

// 本地存储
storage.set('key', { data: 'value' })
const data = storage.get('key')

// 类名合并
const className = cn('base-class', isActive && 'active-class')
```

### 使用服务

```javascript
import { themeService, languageService } from '@services'

// 主题切换
themeService.toggleTheme()

// 语言切换
languageService.setLanguage('zh')
```

### 使用国际化

```javascript
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button onClick={() => i18n.changeLanguage('zh')}>
        切换语言
      </button>
    </div>
  )
}
```

## 🌍 环境变量

创建 `.env` 文件配置环境变量：

```bash
# API 基础地址
VITE_API_BASE_URL=https://api.example.com

# 应用版本
VITE_APP_VERSION=1.0.0
```

在代码中使用：

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## 📦 构建和部署

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

构建产物位于 `dist/` 目录，可以直接部署到静态服务器。

### Docker 部署

项目包含 Docker 配置文件，可以使用 Docker 进行部署：

```bash
# 构建镜像
docker build -t xander-lab-frontend .

# 运行容器
docker run -p 80:80 xander-lab-frontend
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 开发规范

请遵循项目的编码规范，详见 [CODING_STANDARDS.md](./CODING_STANDARDS.md)

主要规范包括：
- 代码风格和命名约定
- React 组件开发规范
- CSS 样式规范
- Git 提交规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👥 作者

Xander Lab Team

## 🔗 相关链接

- [项目架构文档](./PROJECT_ARCHITECTURE.md)
- [编码规范](./CODING_STANDARDS.md)
- [快速开始指南](./QUICK_START.md)

---

**最后更新**: 2026-02-05
