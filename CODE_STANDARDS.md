# 项目代码规范 (Code Standards)

## 一、通用代码规范
1.  **命名语义清晰、风格统一**
    *   变量使用 `camelCase`，常量使用 `UPPER_SNAKE_CASE`，组件使用 `PascalCase`。
    *   命名应准确描述变量含义，避免使用 `a`, `b`, `tmp` 等无意义命名。
2.  **使用自动格式化工具**
    *   项目强制启用 Prettier 与 EditorConfig，保存时自动格式化。
3.  **控制单文件、单函数长度**
    *   单个文件建议不超过 300 行。
    *   单个函数建议不超过 50 行，复杂逻辑应拆分。
4.  **注释说明“为什么”，避免无意义注释**
    *   不要注释“做什么”（代码已经体现），而要注释“为什么这么做”（业务背景、特殊处理）。

## 二、JavaScript / TypeScript
1.  **优先使用 `const`，避免 `var`**
    *   尽量使用 `const` 声明变量，需要修改时使用 `let`。
2.  **函数保持单一职责**
    *   一个函数只做一件事，便于测试和复用。
3.  **避免深层嵌套逻辑**
    *   使用提前返回 (Early Return) 减少 `if/else` 嵌套层级。
4.  **避免魔法数字和硬编码**
    *   将从 API 获取的状态码、配置常量提取到单独的常量文件中。
5.  **TS 项目中避免使用 `any`**
    *   尽量定义具体的 Interface 或 Type，无法确定时使用 `unknown`。
6.  **公共函数和模块必须声明类型**
    *   导出函数的入参和返回值必须有明确的类型定义。

## 三、项目结构
1.  **按业务而非技术维度拆分目录**
    *   推荐 Feature-based 结构，相关的文件（组件、逻辑、样式、测试）放在一起。
2.  **UI、业务逻辑、数据请求职责分离**
    *   UI 组件只负责渲染。
    *   业务逻辑放入 Hooks。
    *   API 请求放入 Service 层。
3.  **禁止组件直接处理复杂业务**
    *   组件应当是纯粹的视图层。
4.  **公共代码集中管理**
    *   通用的 Utils、Hooks、Components 放入 `src/shared` 或根目录对应的文件夹。

## 四、组件规范 (React)
1.  **组件保持单一职责**
    *   一个组件只负责一个 UI 模块的渲染。
2.  **避免在模板中写复杂逻辑**
    *   JSX/TSX 中避免编写复杂的计算逻辑，应提取 hook 或 helper 函数。
3.  **Props / 入参必须定义类型**
    *   所有组件的 Props 必须通过 TypeScript Interface 定义。
4.  **生命周期 / Hooks 使用规范**
    *   遵循 React Hooks 规则（只能在顶层调用）。
    *   `useEffect` 依赖项必须完整。

## 五、样式规范 (CSS)
1.  **样式作用域隔离**
    *   使用 Tailwind CSS 或 CSS Modules 避免全局样式冲突。
2.  **统一命名规范**
    *   如不使用 Tailwind，推荐 BEM (Block Element Modifier) 命名法。
3.  **禁止使用 `!important`**
    *   除非覆盖第三方库样式且无法通过权重解决，否则严禁使用。
4.  **公共颜色、间距使用变量**
    *   使用 Tailwind theme 配置或 CSS Variables 定义主题变量。

## 六、性能与质量
1.  **合理拆分组件和模块**
    *   利用 Code Splitting (React.lazy) 拆分页面级组件。
2.  **避免不必要的重复渲染**
    *   合理使用 `React.memo`, `useMemo`, `useCallback`。
3.  **合理使用缓存和懒加载**
    *   图片懒加载，API 数据缓存（如 React Query）。
4.  **代码必须通过 Lint 检查**
    *   提交前必须修复所有 ESLint 警告和错误。

## 七、协作与工程化
1.  **统一 ESLint 规则**
    *   全员使用相同的 ESLint 和 Prettier 配置。
2.  **提交前必须格式化和校验**
    *   配置 Husky + lint-staged，在 git commit 时自动运行 lint。
3.  **提交信息规范**
    *   遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。
    *   例如：`feat: add user login`, `fix: button style issue`.
4.  **代码必须经过 Review**
    *   主要功能合入主分支前必须经过 Code Review。
