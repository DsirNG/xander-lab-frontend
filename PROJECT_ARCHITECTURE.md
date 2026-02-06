# 项目架构文档

## 概述

本项目采用前端架构标准，将代码按照功能和职责进行清晰的分层和模块化组织。

## 技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **样式**: TailwindCSS 4.1.18 + CSS Modules
- **路由**: React Router DOM 7.12.0
- **国际化**: i18next 25.7.4
- **动画**: Framer Motion 12.26.2
- **图标**: Lucide React 0.562.0

## 目录结构

```
src/
├── api/                  # API 接口层
│   └── index.js          # API 请求封装和配置
│
├── assets/               # 静态资源
│   ├── images/           # 图片资源
│   ├── icons/            # 图标资源
│   └── react.svg         # React Logo
│
├── components/           # 通用组件
│   ├── common/           # 基础通用组件
│   │   └── BrowserWindow/  # 浏览器窗口组件
│   │       ├── BrowserWindow.jsx
│   │       ├── BrowserWindow.module.css
│   │       └── index.js
│   └── layouts/          # 布局组件
│       └── MainLayout/   # 主布局
│           ├── MainLayout.jsx
│           ├── MainLayout.module.css
│           └── index.js
│
├── config/               # 配置文件
│   └── index.js          # 应用配置（名称、版本、主题等）
│
├── constants/            # 常量定义
│   └── index.js          # 路由路径、存储键名、事件名称等
│
├── features/             # 功能模块（按业务领域划分）
│   ├── home/             # 首页模块
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── HomePage.module.css
│   │       └── index.js
│   ├── infra/            # 基础设施模块
│   │   └── pages/
│   │       ├── InfraList.jsx
│   │       ├── InfraContent.jsx
│   │       └── AnchoredOverlay.jsx
│   ├── modules/          # 功能模块展示
│   │   └── pages/
│   │       ├── ModuleList.jsx
│   │       ├── ModuleContent.jsx
│   │       ├── DragDropSystem.jsx
│   │       └── demos/    # 演示组件
│   └── components/       # 组件展示模块
│       └── pages/
│           └── ComponentsPage.jsx
│
├── hooks/                # 自定义 Hooks
│   └── useDragDrop.ts    # 拖拽功能 Hook
│
├── locales/              # 国际化
│   ├── index.js          # i18n 配置
│   ├── en.js             # 英语翻译
│   └── zh.js             # 中文翻译
│
├── router/               # 路由配置
│   └── index.jsx         # 路由配置和实例
│
├── services/             # 业务服务层
│   └── index.js          # 主题服务、语言服务等
│
├── styles/               # 全局样式
│   └── index.css         # 全局样式和 TailwindCSS 配置
│
├── types/                # TypeScript 类型定义
│   └── index.d.ts        # 通用类型定义
│
├── utils/                # 工具函数
│   └── index.js          # 通用工具函数（类名合并、防抖、节流、存储等）
│
├── App.jsx               # 应用根组件
└── main.jsx              # 应用入口文件
```

## 架构设计原则

### 1. 分层架构

- **表现层 (Presentation Layer)**: `components/` 和 `features/*/pages/`
- **业务逻辑层 (Business Logic Layer)**: `services/` 和 `hooks/`
- **数据访问层 (Data Access Layer)**: `api/`
- **配置层 (Configuration Layer)**: `config/` 和 `constants/`

### 2. 模块化设计

#### Features 目录组织
每个 feature 模块都是独立的业务领域，包含：
- `pages/`: 页面组件
- `components/`: 功能专属组件（可选）
- `hooks/`: 功能专属 Hooks（可选）
- `utils/`: 功能专属工具（可选）

#### Components 目录组织
- `common/`: 通用基础组件（Button, Input, Modal 等）
- `business/`: 业务组件（BrowserWindow 等）
- `layouts/`: 布局组件（MainLayout 等）

每个组件都采用文件夹组织方式：
```
ComponentName/
├── ComponentName.jsx        # 组件逻辑
├── ComponentName.module.css # 组件样式
└── index.js                 # 导出文件
```

### 3. 路径别名

使用 `@` 前缀的路径别名提高代码可维护性：

```javascript
import MainLayout from '@components/layouts/MainLayout';
import HomePage from '@features/home/pages/HomePage';
import { storage } from '@utils';
import { APP_CONFIG } from '@config';
```

配置文件：
- `vite.config.js`: Vite 路径别名配置
- `jsconfig.json`: IDE 智能提示配置

### 4. 样式管理

#### CSS Modules
- 局部作用域，避免样式冲突
- 文件命名：`*.module.css`
- 导入方式：`import styles from './Component.module.css'`

#### TailwindCSS
- 全局配置：`tailwind.config.js`
- 主题变量：`src/styles/index.css` 中的 `@theme`
- 工具类优先，模块化样式补充

#### 全局样式
```css
/* 全局盒模型配置 */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### 5. 代码规范

#### 命名约定
- **组件**: PascalCase (例如: `HomePage`, `BrowserWindow`)
- **文件**: PascalCase 或 camelCase (组件用 PascalCase，工具用 camelCase)
- **CSS 类**: camelCase (CSS Modules)
- **常量**: UPPER_SNAKE_CASE (例如: `API_BASE_URL`)

#### 导入顺序
```javascript
// 1. React 相关
import React from 'react';
import { useState, useEffect } from 'react';

// 2. 第三方库
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// 3. 内部模块（使用路径别名）
import MainLayout from '@components/layouts/MainLayout';
import { storage } from '@utils';

// 4. 样式文件
import styles from './Component.module.css';
```

#### 组件组织
```javascript
// 1. Props 接口定义（TypeScript）
// 2. 子组件定义
// 3. 主组件定义
// 4. 导出

const SubComponent = () => { ... };

const MainComponent = ({ prop1, prop2 }) => {
  // hooks
  // handlers
  // render
};

export default MainComponent;
```

### 6. 状态管理

当前项目使用：
- **本地状态**: React `useState`, `useReducer`
- **全局状态**: React Context (未来可扩展 Redux/Zustand)
- **服务端状态**: 自定义 API 层（未来可扩展 React Query）

### 7. 国际化 (i18n)

#### 配置
- 配置文件: `src/locales/index.js`
- 语言文件: `src/locales/en.js`, `src/locales/zh.js`

#### 使用
```javascript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.home')}</h1>
      <button onClick={() => i18n.changeLanguage('zh')}>
        切换语言
      </button>
    </div>
  );
};
```

### 8. 类型安全

#### TypeScript 类型定义
- 通用类型: `src/types/index.d.ts`
- 组件 Props 使用 JSDoc 或 TypeScript 定义

```javascript
/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
const Component = ({ children, className }) => { ... };
```

## 最佳实践

### 1. 组件设计
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 通用组件放在 `components/common/`
- **组合优于继承**: 使用组合模式构建复杂组件

### 2. 性能优化
- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 优化计算和回调
- 懒加载路由和组件 (`React.lazy`)

### 3. 代码质量
- 使用 ESLint 进行代码检查
- 遵循项目 ESLint 规则配置
- 代码审查确保质量

### 4. 文件组织
- 每个文件不超过 300 行（推荐）
- 复杂组件拆分为多个子组件
- 相关文件放在同一目录下

## 迁移指南

### 从旧架构迁移

1. **更新导入路径**
   ```javascript
   // 旧
   import MainLayout from './layouts/MainLayout';
   
   // 新
   import MainLayout from '@components/layouts/MainLayout';
   ```

2. **移动文件到对应目录**
   - 页面组件 → `features/*/pages/`
   - 通用组件 → `components/common/`
   - 布局组件 → `components/layouts/`

3. **更新样式导入**
   ```javascript
   // 旧
   import './index.css';
   
   // 新
   import '@styles/index.css';
   ```

## 开发流程

### 添加新功能

1. 在 `features/` 下创建新的功能模块目录
2. 创建页面组件和样式
3. 在路由配置中添加路由
4. 更新导航链接

### 添加新组件

1. 确定组件类型（common/business/layout）
2. 在对应目录创建组件文件夹
3. 创建组件文件、样式文件和导出文件
4. 编写组件逻辑和样式
5. 导出组件供其他模块使用

## 构建和部署

```bash
# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview

# Lint
npm run lint
```

## 环境变量

创建 `.env` 文件：
```bash
VITE_API_BASE_URL=https://api.example.com
VITE_APP_VERSION=1.0.0
```

使用：
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## 维护和更新

- 定期更新依赖包
- 保持代码风格一致
- 及时更新文档
- Code Review 确保质量

---

**最后更新**: 2026-02-05
**维护者**: Xander Lab Team


