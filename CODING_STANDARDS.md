# 编码规范

## 目录
1. [代码风格](#代码风格)
2. [命名约定](#命名约定)
3. [文件组织](#文件组织)
4. [React 规范](#react-规范)
5. [CSS 规范](#css-规范)
6. [Git 提交规范](#git-提交规范)

---

## 代码风格

### 基本规则

- **缩进**: 使用 2 个空格
- **引号**: 使用单引号 `'`（JSX 属性使用双引号）
- **分号**: 语句末尾不使用分号（遵循项目 ESLint 配置）
- **尾随逗号**: 多行对象/数组使用尾随逗号
- **行宽**: 建议不超过 100 字符

```javascript
// ✅ 好的
const obj = {
  name: 'John',
  age: 30,
}

// ❌ 不好的
const obj = {name: "John", age: 30};
```

### 空格和换行

```javascript
// ✅ 函数参数之间添加空格
function example(param1, param2) {
  // ...
}

// ✅ 运算符两侧添加空格
const sum = a + b

// ✅ 对象属性冒号后添加空格
const obj = { key: 'value' }

// ✅ 逻辑块之间添加空行
const Component = () => {
  const [state, setState] = useState()
  
  useEffect(() => {
    // ...
  }, [])
  
  return <div>Content</div>
}
```

---

## 命名约定

### 文件命名

```
✅ 组件文件: PascalCase
HomePage.jsx
BrowserWindow.jsx

✅ 工具文件: camelCase
utils.js
helpers.js

✅ 配置文件: kebab-case
vite.config.js
tailwind.config.js

✅ 样式文件: 与组件同名
HomePage.module.css
BrowserWindow.module.css
```

### 变量命名

```javascript
// ✅ 变量和函数: camelCase
const userName = 'John'
const handleClick = () => {}

// ✅ 常量: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// ✅ 组件: PascalCase
const HomePage = () => {}
const BrowserWindow = () => {}

// ✅ 私有变量/函数: 前缀下划线
const _internalHelper = () => {}

// ✅ 布尔值: is/has/should 前缀
const isLoading = true
const hasError = false
const shouldRender = true
```

### CSS 类命名

```css
/* ✅ CSS Modules: camelCase */
.heroSection { }
.navLink { }
.btnPrimary { }

/* ✅ BEM (如果不使用 CSS Modules): kebab-case */
.hero-section { }
.nav-link { }
.btn--primary { }
```

---

## 文件组织

### 目录结构规则

```
1. 功能优先分组
   features/home/
   features/infra/

2. 类型次要分组
   features/home/pages/
   features/home/components/

3. 每个组件独立文件夹
   BrowserWindow/
   ├── BrowserWindow.jsx
   ├── BrowserWindow.module.css
   └── index.js
```

### 导入顺序

```javascript
// 1. React 核心
import React from 'react'
import { useState, useEffect } from 'react'

// 2. 第三方库
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

// 3. 路径别名导入（按字母顺序）
import { API_CONFIG } from '@config'
import MainLayout from '@components/layouts/MainLayout'
import HomePage from '@features/home/pages/HomePage'
import { storage } from '@utils'

// 4. 相对路径导入
import { localHelper } from './helpers'

// 5. 类型导入（TypeScript）
import type { User } from '@types'

// 6. 样式文件（最后）
import styles from './Component.module.css'
```

---

## React 规范

### 组件结构

```javascript
/**
 * 组件描述
 * @param {Object} props - 组件属性
 * @param {string} props.title - 标题
 */
const Component = ({ title, children }) => {
  // 1. Hooks 声明
  const [state, setState] = useState(initialState)
  const { t } = useTranslation()
  
  // 2. 派生状态
  const derivedValue = useMemo(() => {
    return computeValue(state)
  }, [state])
  
  // 3. 副作用
  useEffect(() => {
    // 副作用逻辑
    return () => {
      // 清理函数
    }
  }, [])
  
  // 4. 事件处理器
  const handleClick = useCallback(() => {
    // 处理逻辑
  }, [])
  
  // 5. 条件渲染辅助
  if (loading) return <Loading />
  if (error) return <Error />
  
  // 6. 主渲染
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      {children}
    </div>
  )
}

export default Component
```

### Props 规范

```javascript
// ✅ 使用解构
const Component = ({ title, onClick }) => { }

// ✅ 提供默认值
const Component = ({ 
  title = 'Default Title',
  showIcon = true,
}) => { }

// ✅ 使用 PropTypes 或 TypeScript
Component.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
}

// ✅ JSDoc 注释
/**
 * @param {Object} props
 * @param {string} props.title - 标题文本
 * @param {() => void} [props.onClick] - 点击回调
 */
```

### Hooks 使用

```javascript
// ✅ 自定义 Hook 以 use 开头
const useUserData = (userId) => {
  const [data, setData] = useState(null)
  // ...
  return { data, loading, error }
}

// ✅ 依赖数组完整
useEffect(() => {
  fetchData(id)
}, [id]) // 包含所有使用的外部变量

// ✅ 使用 useCallback 优化函数
const handleSubmit = useCallback((data) => {
  // 处理逻辑
}, [dependency])
```

### 条件渲染

```javascript
// ✅ 简单条件使用 &&
{isLoggedIn && <UserProfile />}

// ✅ 二选一使用三元运算符
{isLoading ? <Spinner /> : <Content />}

// ✅ 复杂条件提取为变量或函数
const content = () => {
  if (isLoading) return <Spinner />
  if (error) return <Error />
  return <Content />
}

return <div>{content()}</div>
```

### 列表渲染

```javascript
// ✅ 使用稳定的 key
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ 避免使用 index 作为 key（当列表会变化时）
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

---

## CSS 规范

### CSS Modules

```css
/* ✅ 使用语义化的类名 */
.heroSection { }
.navLink { }
.btnPrimary { }

/* ✅ 使用嵌套（如果使用预处理器） */
.card {
  padding: 1rem;
  
  &:hover {
    transform: scale(1.05);
  }
}

/* ✅ 使用 CSS 变量 */
.button {
  background-color: var(--color-primary);
  color: var(--color-text);
}
```

### TailwindCSS

```javascript
// ✅ 优先使用 Tailwind 工具类
<div className="flex items-center gap-4 p-4">

// ✅ 复杂样式使用 @apply
.customButton {
  @apply px-4 py-2 rounded-lg bg-primary text-white;
  @apply hover:bg-primary-dark transition-colors;
}

// ✅ 使用 clsx 或 cn 处理条件类名
import { cn } from '@utils'

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />
```

### 响应式设计

```javascript
// ✅ 移动优先
<div className="w-full md:w-1/2 lg:w-1/3">

// ✅ 使用断点一致性
<div className="text-sm md:text-base lg:text-lg">
```

---

## Git 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具链相关
```

### 示例

```bash
# ✅ 好的提交信息
feat(home): 添加英雄区动画效果
fix(api): 修复用户登录超时问题
docs(readme): 更新安装说明
refactor(utils): 重构防抖函数实现

# ✅ 包含详细说明
feat(drag-drop): 实现拖拽预览功能

- 添加自定义预览元素支持
- 实现透明 ghost image 技术
- 添加拖拽提示文本

Closes #123
```

### 分支命名

```bash
# 功能分支
feature/user-authentication
feature/drag-drop-system

# 修复分支
fix/login-timeout
fix/navigation-bug

# 重构分支
refactor/components-structure
refactor/api-layer
```

---

## 注释规范

### 文件头注释

```javascript
/**
 * 文件描述
 * @module ComponentName
 * @author Your Name
 * @created 2026-02-05
 */
```

### 函数注释

```javascript
/**
 * 函数功能描述
 * @param {string} param1 - 参数1说明
 * @param {Object} options - 选项对象
 * @param {boolean} [options.flag] - 可选标志
 * @returns {Promise<Data>} 返回值说明
 * @throws {Error} 错误说明
 */
const functionName = (param1, options = {}) => {
  // 实现
}
```

### 组件注释

```javascript
/**
 * BrowserWindow 组件
 * 提供浏览器窗口样式的容器
 * 
 * @example
 * <BrowserWindow showDots={true}>
 *   <YourContent />
 * </BrowserWindow>
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子元素
 * @param {boolean} [props.showDots=true] - 是否显示控制点
 */
```

### TODO 注释

```javascript
// TODO: 添加错误处理
// FIXME: 修复性能问题
// NOTE: 这里需要特别注意
// HACK: 临时解决方案
// OPTIMIZE: 可以优化的地方
```

---

## 错误处理

### Try-Catch

```javascript
// ✅ 明确的错误处理
try {
  const data = await fetchData()
  return data
} catch (error) {
  console.error('Failed to fetch data:', error)
  // 显示用户友好的错误信息
  showErrorToast(t('errors.fetchFailed'))
  return null
}
```

### 错误边界

```javascript
// ✅ 使用错误边界捕获组件错误
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## 性能优化

### React 性能

```javascript
// ✅ 使用 React.memo 避免不必要的重渲染
const ExpensiveComponent = React.memo(({ data }) => {
  // 渲染逻辑
})

// ✅ 使用 useMemo 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

// ✅ 使用 useCallback 缓存函数
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])

// ✅ 代码分割
const LazyComponent = React.lazy(() => import('./Component'))
```

### 图片优化

```javascript
// ✅ 使用适当的图片格式
- WebP 用于现代浏览器
- 提供 fallback 格式

// ✅ 懒加载图片
<img loading="lazy" src="image.jpg" alt="Description" />

// ✅ 使用 srcset 响应式图片
<img
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  src="medium.jpg"
  alt="Description"
/>
```

---

## 安全规范

```javascript
// ✅ 避免 XSS 攻击
- 使用 React（自动转义）
- 谨慎使用 dangerouslySetInnerHTML

// ✅ 环境变量不包含敏感信息
- API keys 放在服务器端
- 使用环境变量但不提交 .env 文件

// ✅ 验证用户输入
const sanitizeInput = (input) => {
  return input.replace(/<script>/g, '')
}
```

---

## 测试规范

```javascript
// ✅ 测试文件命名
Component.test.jsx
utils.test.js

// ✅ 测试结构
describe('Component', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' }
    
    // Act
    render(<Component {...props} />)
    
    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## 工具配置

### VSCode 推荐设置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 推荐扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

---

**保持代码整洁，遵循规范，提升代码质量！**

**最后更新**: 2026-02-05

