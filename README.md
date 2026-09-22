# DinQorAI Frontend

一个现代化的 React 组件库和交互系统展示平台，采用企业级架构标准构建。

## 项目简介

DinQorAI 是一个知识分享与学习平台，专注于记录和分享在项目开发过程中积累的实践经验。这里包含了：

- **UI 组件** - 在项目中遇到或自己开发的组件，提供完整源码可直接复用
- **自定义 Hooks** - 封装好的业务逻辑和通用功能，减少重复开发
- **学习笔记** - 第一次学习到的新知识、技术点和解决方案
- **交互模式** - 各种 UI 交互模式的实现和最佳实践
- **基础设施** - 底层工具函数、服务封装等可复用代码

项目采用模块化设计，所有代码都提供完整源码，可以直接在下次项目中使用，减少重复开发的工作量。同时，这也是一个知识管理平台，帮助自己复习和巩固知识，也为新手开发者提供学习资源，让他们能够找到想要学习的、能够学习的各种实践案例。

## 项目价值

- **减少重复开发** - 提供可直接复用的组件和 Hooks，提高开发效率
- **知识沉淀** - 记录项目中的实践经验，形成个人知识库
- **学习资源** - 为新手开发者提供真实项目案例和学习材料
- **持续改进** - 通过实践不断优化和完善代码质量

## 欢迎指正

本项目旨在分享和学习，如有错误、不足或改进建议，欢迎指出！您的反馈将帮助我们共同进步。

可以通过以下方式反馈：

- 提交 Issue
- 发起 Pull Request
- 直接联系维护者
-

## 特性

- **现代化 UI** - 基于 TailwindCSS 和 CSS Modules 的样式系统
- **国际化支持** - 内置 i18next 多语言支持
- **企业级架构** - 清晰的分层和模块化设计
- **高性能** - Vite 构建，快速开发体验
- **响应式设计** - 完美适配各种设备
- **动画效果** - 基于 Framer Motion 的流畅动画
- **类型安全** - TypeScript 类型定义支持

## ️ 技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **样式**: TailwindCSS 4.1.18 + CSS Modules
- **路由**: React Router DOM 7.12.0
- **国际化**: i18next 25.7.4
- **动画**: Framer Motion 12.26.2
- **图标**: Lucide React 0.562.0

## 快速开始

### 环境要求

- Node.js >= 22.13.0
- pnpm >= 10.0.0

### 安装

```bash
# 克隆项目
git clone <repository-url>

# 进入项目目录
cd xander-lab-frontend

# 安装依赖
pnpm install
```

### 开发

启动开发服务器：

```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 构建

构建生产版本：

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

### 预览

预览构建结果：

```bash
pnpm preview
```

### 代码检查

运行 ESLint 检查：

```bash
pnpm lint
```

检查架构边界：

````bash
pnpm run check:architecture

检查六种语言资源的 key 完整性：

```bash
pnpm run check:i18n
````

```

## 项目结构

```

xander-lab-frontend/
├── src/
│ ├── app/ # 应用组装、路由、Provider、布局和运行时边界
│ ├── api/ # HTTP / 鉴权恢复 / SSE / 上传下载等 Transport Infrastructure
│ ├── assets/ # 静态资源
│ ├── components/ # 仅保留 Demo 沙箱用户代码的 CustomSelect 历史字符串别名
│ ├── config/ # 配置文件
│ ├── features/ # 功能模块（按业务领域划分）
│ │ ├── auth/ # 鉴权与会话
│ │ ├── account/ # 账户能力
│ │ ├── agent/ # 智能体
│ │ ├── knowledge/ # 知识库
│ │ ├── platformIntegrations/ # 外部发布平台集成
│ │ ├── workspace/ # 工作台
│ │ └── ... # 其他业务 Feature
│ ├── shared/ # 业务无关的 UI、Hook 和技术能力
│ │ ├── ui/ # primitives / overlays / forms / data-display 等
│ │ ├── hooks/ # 无业务语义的通用 Hook
│ │ └── lib/ # 无业务语义的通用库
│ ├── locales/ # 国际化资源
│ ├── styles/ # 全局样式
│ ├── App.jsx # 应用根组件
│ └── main.jsx # 应用入口
├── public/ # 公共静态资源
├── .editorconfig # 编辑器配置
├── jsconfig.json # JavaScript 配置（路径别名）
├── tailwind.config.js # TailwindCSS 配置
├── vite.config.js # Vite 配置
└── package.json # 项目依赖配置

````

## 文档

- [项目架构文档](./PROJECT_ARCHITECTURE.md) - 详细的架构说明和设计原则
- [编码规范](./CODING_STANDARDS.md) - 代码风格和开发规范

## 路径别名

项目配置了路径别名，简化导入路径：

```javascript
import MainLayout from "@app/layouts/MainLayout";
import HomePage from "@features/home/pages/HomePage";
import Button from "@shared/ui/primitives/Button";
import { APP_CONFIG } from "@config";
import "@styles/index.css";
````

支持的别名：

- `@` → `src/`
- `@app` → `src/app/`
- `@shared` → `src/shared/`
- `@components` → `src/components/`（仅保留 Demo 沙箱的历史 CustomSelect 兼容出口，业务代码不得新增）
- `@features` → `src/features/`
- `@config` → `src/config/`
- `@api` → `src/api/`
- `@locales` → `src/locales/`
- `@styles` → `src/styles/`

新增代码应优先使用 `@app`、`@shared` 和 Feature 的 public API；业务接口放在对应
`features/<feature>/api/`，不要继续扩张根级业务 `src/api/`。

## 核心功能

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

## 使用示例

### 使用工具函数

```javascript
import { debounce, throttle, storage, cn } from "@shared/lib";

// 防抖
const debouncedFn = debounce(() => {
    console.log("防抖执行");
}, 300);

// 节流
const throttledFn = throttle(() => {
    console.log("节流执行");
}, 300);

// 本地存储
storage.set("key", { data: "value" });
const data = storage.get("key");

// 类名合并
const className = cn("base-class", isActive && "active-class");
```

### 使用服务

```javascript
// 业务 Service 归属于对应 Feature，不再集中到根级 services。
import { useAuthSession } from "@features/auth";

const { isAuthenticated } = useAuthSession();
```

跨 Feature 使用能力时，应从对应 Feature 的 public API 导入；Feature 内部
实现（Service、Store、Repository）不要被其他 Feature 直接引用。

### 使用国际化

```javascript
import { useTranslation } from "react-i18next";

const Component = () => {
    const { t, i18n } = useTranslation();

    return (
        <div>
            <h1>{t("nav.home")}</h1>
            <button onClick={() => i18n.changeLanguage("zh")}>切换语言</button>
        </div>
    );
};
```

## 环境变量

复制 `.env.example` 为本地环境文件后再按需修改。`.env.development`、`.env.production`
和包含部署凭据的文件均不提交 Git：

```bash
cp .env.example .env.development
```

在代码中使用：

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 构建和部署

### 开发环境

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
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

Docker 构建会生成静态 SEO 页面。默认的 `Dockerfile` 允许在没有后端 API 的本地环境中保留输入的 `public/sitemap.xml` 并完成构建；`deploy.sh`、`deploy-aliyun.sh` 和 Compose 部署默认将 `SEO_PRERENDER_REQUIRED=true`，后端不可用时会阻止生产镜像发布。只有在明确接受暂时不更新博客 SEO 页面时，才设置 `SEO_PRERENDER_REQUIRED=false`。

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 开发规范

请遵循项目的编码规范，详见 [CODING_STANDARDS.md](./CODING_STANDARDS.md)

主要规范包括：

- 代码风格和命名约定
- React 组件开发规范
- CSS 样式规范
- Git 提交规范

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 作者

DinQorAI Team

## 相关链接

- [项目架构文档](./PROJECT_ARCHITECTURE.md)
- [编码规范](./CODING_STANDARDS.md)

---

**最后更新**: 2026-09-22
