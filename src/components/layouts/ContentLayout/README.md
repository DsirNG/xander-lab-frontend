# ContentLayout 通用内容布局组件

## 📖 概述

`ContentLayout` 是一个高度可复用的内容展示布局组件，用于统一基础设施、功能模块、组件库等页面的展示样式。

## ✨ 特性

- 🎯 **统一的布局结构**：标题、描述、操作按钮、场景演示
- 🔄 **高度可配置**：支持自定义按钮、主题色、渲染函数
- 🎨 **两种演示风格**：简单版和增强版（带代码展示）
- 📦 **开箱即用**：包含完整的动画和样式

## 📦 组件结构

```
ContentLayout/
├── ContentLayout.jsx          # 主布局组件
├── EnhancedDemoSection.jsx    # 增强演示区域（带代码）
└── index.js                    # 导出文件
```

## 🚀 使用方法

### 1. 基础用法（简单演示）

适用于基础设施等简单场景展示：

```jsx
import { ContentLayout, SimpleDemoSection } from '@components/layouts/ContentLayout';
import { ScrollText } from 'lucide-react';

const InfraContent = ({ system }) => {
    const { t } = useTranslation();

    const renderDemoSection = (scenario, index) => (
        <SimpleDemoSection
            key={index}
            title={scenario.title}
            desc={scenario.desc}
        >
            {scenario.demo}
        </SimpleDemoSection>
    );

    return (
        <ContentLayout
            item={system}
            scenarios={system.scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/infra"
            detailButtonText={t('common.viewTheory')}
            detailButtonIcon={ScrollText}
            themeColor="primary"
        />
    );
};
```

### 2. 高级用法（增强演示）

适用于功能模块等需要代码展示的场景：

```jsx
import { ContentLayout, EnhancedDemoSection } from '@components/layouts/ContentLayout';
import { ExternalLink, Zap } from 'lucide-react';

const ModuleContent = ({ module }) => {
    const { t } = useTranslation();

    const renderDemoSection = (scenario, index) => (
        <EnhancedDemoSection
            key={index}
            title={scenario.title}
            desc={scenario.desc}
            code={scenario.code}  // 传入代码字符串
        >
            {scenario.demo}
        </EnhancedDemoSection>
    );

    // 额外的头部按钮
    const extraButtons = (
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl">
            <Zap className="w-4 h-4 text-blue-600 mr-2" />
            <span>{t('common.implementationDetails')}</span>
        </div>
    );

    return (
        <ContentLayout
            item={module}
            scenarios={scenarios}
            renderDemoSection={renderDemoSection}
            basePath="/modules"
            detailButtonText={t('common.viewDeepDive')}
            detailButtonIcon={ExternalLink}
            extraHeaderButtons={extraButtons}
            themeColor="blue-600"
        />
    );
};
```

## 📋 API 文档

### ContentLayout Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `item` | Object | ✅ | - | 当前展示的项目（必须包含 id, title, desc） |
| `scenarios` | Array | ❌ | - | 场景列表 |
| `renderDemoSection` | Function | ✅ | - | 渲染单个演示区域的函数 |
| `basePath` | String | ❌ | `''` | 详情链接的基础路径 |
| `detailButtonText` | String | ❌ | `'查看详情'` | 详情按钮文本 |
| `detailButtonIcon` | Component | ❌ | - | 详情按钮图标组件 |
| `extraHeaderButtons` | Node | ❌ | - | 额外的头部按钮 |
| `themeColor` | String | ❌ | `'primary'` | 主题色（Tailwind 类名） |
| `children` | Node | ❌ | - | 自定义子内容 |

### SimpleDemoSection Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 演示标题 |
| `desc` | String | ✅ | 演示描述 |
| `children` | Node | ❌ | 演示内容 |

### EnhancedDemoSection Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | String | ✅ | 演示标题 |
| `desc` | String | ✅ | 演示描述 |
| `children` | Node | ❌ | 演示内容 |
| `code` | String | ❌ | 代码字符串（用于展示） |

## 📊 重构效果

### 代码量对比

| 文件 | 重构前 | 重构后 | 减少 |
|------|--------|--------|------|
| `InfraContent.jsx` | 90 行 | 37 行 | ↓ 59% |
| `ModuleContent.jsx` | 268 行 | 130 行 | ↓ 51% |

### 优势

1. ✅ **消除重复代码**：将相似的布局逻辑提取为通用组件
2. ✅ **易于维护**：修改一处，所有地方生效
3. ✅ **易于扩展**：新增模块类型只需配置，无需重写布局
4. ✅ **类型安全**：完整的 PropTypes 定义
5. ✅ **灵活性强**：支持自定义渲染、按钮、主题等

## 🎯 适用场景

- ✅ 基础设施系统展示
- ✅ 功能模块展示
- ✅ 组件库展示
- ✅ 任何需要"标题+描述+场景演示"布局的页面

## 🔧 扩展建议

如果未来需要新增其他类型的内容展示，可以：

1. 创建新的 DemoSection 变体（如 `VideoDemoSection`）
2. 通过 `extraHeaderButtons` 添加自定义按钮
3. 使用 `children` prop 添加自定义底部内容
4. 通过 `themeColor` 自定义主题色

## 📝 注意事项

- `item` 对象必须包含 `id` 和 `title` 字段
- `desc` 或 `description` 字段二选一即可
- `renderDemoSection` 函数接收 `(scenario, index)` 两个参数
- 如果有 `detailPages`，会自动显示详情按钮

