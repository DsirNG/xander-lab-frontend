# 快速开始指南

## 项目重构完成 ✅

本项目已完成企业级架构重构，现在拥有更清晰的结构和更好的可维护性。

---

## 主要变更

### 1. ✅ 全局 box-sizing 配置
所有元素现在使用 `border-box` 盒模型：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

### 2. ✅ 新的目录结构

```
src/
├── api/           # API 接口
├── components/    # 通用组件
├── config/        # 配置
├── constants/     # 常量
├── features/      # 功能模块
├── hooks/         # 自定义 Hooks
├── locales/       # 国际化
├── router/        # 路由
├── services/      # 服务层
├── styles/        # 全局样式
├── types/         # 类型定义
└── utils/         # 工具函数
```

### 3. ✅ 路径别名

现在可以使用简洁的路径别名：

```javascript
// 旧方式
import MainLayout from './layouts/MainLayout'

// 新方式
import MainLayout from '@components/layouts/MainLayout'
import HomePage from '@features/home/pages/HomePage'
import { storage } from '@utils'
```

---

## 快速命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

---

## 开发指南

### 创建新页面

1. 在 `src/features/{模块名}/pages/` 创建页面组件
2. 使用组件文件夹结构：
   ```
   PageName/
   ├── PageName.jsx
   ├── PageName.module.css
   └── index.js
   ```

### 创建新组件

1. 在 `src/components/common/` 创建组件
2. 使用相同的文件夹结构
3. 通过路径别名导入：`@components/common/ComponentName`

### 使用工具函数

```javascript
import { debounce, throttle, storage, cn } from '@utils'

// 防抖
const debouncedFn = debounce(() => console.log('debounced'), 300)

// 节流
const throttledFn = throttle(() => console.log('throttled'), 300)

// 本地存储
storage.set('key', { data: 'value' })
const data = storage.get('key')

// 类名合并
const className = cn('base', isActive && 'active')
```

---

## 文档参考

- **PROJECT_ARCHITECTURE.md** - 详细的架构说明
- **CODING_STANDARDS.md** - 编码规范
- **REFACTORING_SUMMARY.md** - 重构总结

---

## 下一步

项目基础架构已经搭建完成，可以：

1. 继续开发新功能
2. 迁移剩余的页面组件到新架构（可选）
3. 根据需要添加更多通用组件
4. 完善测试覆盖率

---

## 需要帮助？

查看以下文档：
- 架构问题 → `PROJECT_ARCHITECTURE.md`
- 编码规范 → `CODING_STANDARDS.md`
- 重构记录 → `REFACTORING_SUMMARY.md`

---

**Happy Coding! 🚀**



