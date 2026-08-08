# 项目架构文档

## 概述

本项目采用前端架构标准，将代码按照功能和职责进行清晰的分层和模块化组织。

## 技术栈

- **框架**: React 19.2.0
- **构建工具**: Vite 7.2.4
- **样式**: TailwindCSS 4.1.18 + CSS Modules
- **路由**: React Router DOM 7.12.0
- **国际化**: i18next 25.7.4 (+ react-i18next 16.5.2)
- **动画**: Framer Motion 12.26.2
- **图标**: Lucide React 0.562.0
- **HTTP**: axios 1.13.5（经 `src/api/http.js` 统一封装）

## 目录结构

```
src/
├── api/                  # API 请求层
│   ├── http.js           # axios 统一封装（拦截器、鉴权、错误提示）
│   ├── httpPolicy.js     # 请求排队 / 去重策略
│   └── index.js          # API 接口定义
│
├── assets/               # 静态资源
│   └── images/           # 图片资源
│
├── components/           # 通用组件（跨业务域）
│   ├── common/           # 基础通用组件
│   │   ├── BrowserWindow/
│   │   ├── Toast/
│   │   ├── Modal/
│   │   ├── LoadingSpinner/
│   │   ├── NotFoundPage/
│   │   └── ...           # ConfirmModal / Pagination / CustomSelect 等
│   ├── layouts/          # 布局组件
│   │   ├── MainLayout/   # 主布局（含 Navbar）
│   │   ├── ContentLayout/  # 内容页布局
│   │   └── SidebarLayout/  # 侧栏布局
│   └── seo/              # SEO 组件（SEOHead）
│
├── config/               # 应用配置
│   └── env.js            # 环境变量读取
│
├── context/              # 全局 Context
│   ├── PureReadingContext.jsx
│   └── pureReadingContextValue.js
│
├── features/             # 业务功能模块（按业务域划分）
│   ├── auth/             # 登录/鉴权
│   ├── blog/             # 博客（列表/详情/发布/智能体/标签）
│   ├── components/       # 组件展示
│   ├── home/             # 首页
│   ├── img2three/        # 图片转三维
│   ├── modules/          # 功能模块展示
│   ├── profile/          # 个人中心
│   └── studio/           # 工作室（上传/编译器/公共源码）
│
├── hooks/                # 通用自定义 Hooks
│   ├── useIsMobile.js
│   ├── useToast.js
│   ├── usePureReading.js
│   └── useDragDrop.ts
│
├── locales/              # 国际化翻译
│   ├── index.js          # i18n 配置
│   ├── zh.js / en.js / fr.js / ja.js / ru.js / vi.js
│
├── router/               # 路由配置
│   ├── index.jsx         # 路由实例与组件挂载
│   └── RouteElements.jsx # 路由表（按业务域分组）
│
├── styles/               # 全局样式
│   └── index.css         # 全局样式与 TailwindCSS 配置
│
├── utils/                # 通用工具函数
│   └── index.js          # 类名合并、防抖、节流、存储等
│
├── App.jsx               # 应用根组件（含 ToastBridge）
└── main.jsx              # 应用入口文件
```

## 路径别名

`vite.config.js` 与 `jsconfig.json` 中配置，均指向 `src/`：

| 别名 | 指向 |
|---|---|
| `@` | `src/` |
| `@components` | `src/components` |
| `@features` | `src/features` |
| `@hooks` | `src/hooks` |
| `@utils` | `src/utils` |
| `@config` | `src/config` |
| `@api` | `src/api` |
| `@locales` | `src/locales` |
| `@styles` | `src/styles` |
| `@router` | `src/router` |

## 架构设计原则

### 1. 分层架构

- **表现层 (Presentation Layer)**: `components/` 和 `features/*/pages/`
- **业务逻辑层 (Business Logic Layer)**: `features/*/services/`、`features/*/hooks/` 和 `hooks/`
- **数据访问层 (Data Access Layer)**: `api/`（统一基于 `http.js` 封装的 axios 实例）
- **配置层 (Configuration Layer)**: `config/`、`context/` 和 `constants/`

### 2. 模块化设计

#### Features 目录组织
每个 feature 模块都是独立的业务领域，包含：
- `pages/`: 页面组件
- `components/`: 功能专属组件（可选，如 `blog/components/agent/`）
- `hooks/`: 功能专属 Hooks（可选）
- `services/`: 功能专属 API 服务（可选）
- `utils/`: 功能专属工具（可选）

#### Components 目录组织
- `common/`: 通用基础组件（Modal, Toast, LoadingSpinner 等）
- `layouts/`: 布局组件（MainLayout, ContentLayout, SidebarLayout）
- `seo/`: SEO 相关组件

每个组件都采用文件夹组织方式：
```
ComponentName/
├── ComponentName.jsx        # 组件逻辑
├── ComponentName.module.css # 组件样式（可选）
└── index.js                 # 导出文件
```

#### 服务层说明
- 全局 API 请求统一走 `src/api/http.js` 导出的 axios 封装，禁止原生 `fetch` 或另建 axios 实例。
- 业务服务的接口方法按 feature 域组织在 `features/*/services/` 下（如 `blog/services/blogService.js`）。

### 3. 路径别名

使用 `@` 前缀的路径别名提高代码可维护性，指向 `src/` 各子目录：

```javascript
import MainLayout from '@components/layouts/MainLayout';
import HomePage from '@features/home/pages/HomePage';
import { useToast } from '@hooks/useToast';
import { APP_CONFIG } from '@config/env';
import { blogService } from '@features/blog/services/blogService';
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
- **全局状态**: React Context（`src/context/PureReadingContext.jsx` 等）
- **服务端状态**: 自定义 API 层（`src/api/`）

### 7. 国际化 (i18n)

#### 配置
- 配置文件: `src/locales/index.js`
- 语言文件: `src/locales/zh.js`, `en.js`, `fr.js`, `ja.js`, `ru.js`, `vi.js`（六种语言）

> 新增任意 i18n key 时，必须同步更新全部六种语言文件。

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

#### 类型定义
- 项目以 JavaScript 为主，类型通过 JSDoc 注释表达
- 少量 TS 文件（如 `src/hooks/useDragDrop.ts`）使用 TypeScript

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

# 构建（含 SEO 静态生成）
npm run build:seo

# 预览
npm run preview

# Lint
npm run lint

# 测试
npm run test

# SEO 提交（IndexNow）
npm run seo:indexnow
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

## Git 提交规范

- 提交标题使用中文并以 `【dxd】` 为前缀，正文以 `desc:` 开头（详见 `AGENTS.md`）
- 只 stage 当前任务相关文件，不提交凭据、环境配置或无关用户改动

---

**最后更新**: 2026-08-08
**维护者**: Xander Lab Team



