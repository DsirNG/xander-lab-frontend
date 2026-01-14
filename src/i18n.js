import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
const resources = {
    en: {
        translation: {
            nav: {
                infra: 'Infrastructure',
                modules: 'Modules',
                about: 'About',
                home: 'Home'
            },
            common: {
                backToInfra: 'Back to Infrastructure',
                technicalNarrative: 'Technical Narrative',
                codeImplementation: 'Code Implementation',
                involvedFiles: 'Involved Files',
                implementationDetails: 'Implementation Details',
                viewSource: 'View Source',
                viewDeepDive: 'View Deep Dive',
                comingSoon: 'Coming Soon',
                notFound: '404 - Not Found',
                detailComingSoon: 'Detail (Coming Soon)',
                exploreInfra: 'Infrastructure Explorer',
                selectModule: 'Select a system to explore its capabilities',
                liveScenarios: 'Live Scenarios',
                viewTheory: 'View Implementation',
                exploreModules: 'Feature Explorer',
                selectModuleToExplore: 'Select a module to view its patterns and interactions'
            },
            hero: {
                badge: 'v1.0.0 Now Available',
                title: 'Crafted for',
                gradient: 'Excellence',
                desc: 'A premium collection of UI patterns and infrastructure, designed to elevate your development workflow. From positioning systems to interaction models.',
                performance: 'Performance'
            },
            features: {
                title: 'Why Xander Lab?',
                desc: 'We prioritize developer experience and performance, giving you the tools you need to build better products faster.',
                composable: {
                    title: 'Composable',
                    desc: 'Built with composability in mind. Mix and match components to build complex UIs with ease.'
                },
                themable: {
                    title: 'Themable',
                    desc: 'Fully customizable via Tailwind CSS. Easily adapt components to match your brand identity.'
                },
                performant: {
                    title: 'Performant',
                    desc: 'Optimized for speed. Zero bloating, ensuring your application remains fast and responsive.'
                }
            },
            infra: {
                title: 'Infrastructure',
                subtitle: 'Core Systems',
                anchored: {
                    title: 'Anchored Overlay',
                    tag: 'Positioning & Physics',
                    desc: 'The foundational system for positioning floating elements relative to anchors.',
                    phases: {
                        theory: {
                            title: 'I. The Theory (Positioning Physics)',
                            desc: 'The mathematical foundation of where things "are".',
                            points: ['Main & Cross Axis definitions', 'Placement semantics (top/start/...)', 'Absolute vs Fixed strategy']
                        },
                        hook: {
                            title: 'II. The Engine (useAnchorPosition)',
                            desc: 'The low-level hook that manages the dirty work: ResizeObserver, scroll events, and dual-RAF throttling to prevent layout thrashing.',
                            points: ['Scroll & Resize tracking', 'Dual-RAF synchronization', 'Transform-based performance']
                        },
                        container: {
                            title: 'III. The Abstraction (OverlayContainer)',
                            desc: 'A headless behavioral container that encapsulates the "Interaction Model": outside clicks, ESC keys, and boundary detection survival strategies (flip/shift).',
                            points: ['Flip / Shift / Padding strategies', 'Focus trap & Backdrop management', 'ARIA-compliant semantics']
                        }
                    },
                    files: [
                        { name: 'useAnchorPosition.ts', role: 'Calculation Engine' },
                        { name: 'OverlayContainer.tsx', role: 'Behavioral Wrapper' },
                        { name: 'PositioningUtils.ts', role: 'Math Helpers' },
                        { name: 'types.ts', role: 'Interface Definitions' }
                    ]
                }
            },
            modules: {
                title: 'Feature Modules',
                subtitle: 'UI Patterns',
                popover: {
                    title: 'Popover',
                    desc: 'General floating container with default placements and offsets.'
                },
                dropdown: {
                    title: 'Dropdown Menu',
                    desc: 'Menu semantics with keyboard navigation.'
                },
                tooltip: {
                    title: 'Tooltip',
                    desc: 'Hover/focus triggered informational overlays.'
                },
                context: {
                    title: 'Context Menu',
                    desc: 'Pointer-based relative positioning.'
                },
                dragdrop: {
                    title: 'Drag & Drop',
                    desc: 'Customizable drag and drop with advanced preview and hint systems.',
                    phases: {
                        theory: {
                            title: 'I. The Engine (useDragDrop)',
                            desc: 'The technical foundation of the drag and drop interaction model.',
                            points: ['HTML5 Drag & Drop API integration', 'Custom preview element management', 'Drag state and validity control']
                        },
                        hook: {
                            title: 'II. The Preview (DragPreview)',
                            desc: 'Handling the visual feedback during drag operations.',
                            points: ['Transparent ghost image technique', 'Floating DOM element tracking', 'Controller-driven hint system']
                        },
                        container: {
                            title: 'III. The Interaction (Drop Zones)',
                            desc: 'Defining how items are accepted and processed.',
                            points: ['Flexible validation logic', 'Drop hint text generation', 'Optimistic UI updates']
                        }
                    },
                    files: [
                        { name: 'useDragDrop.ts', role: 'Core Interaction Hook' },
                        { name: 'DragDropSystem.jsx', role: 'Feature Showcase' },
                        { name: 'DraggableItem.tsx', role: 'Reusable Component' }
                    ]
                }
            },
            footer: {
                desc: 'A comprehensive collection of React components and hooks for modern web development.',
                resources: 'Resources',
                components: 'Components',
                hooks: 'Hooks',
                docs: 'Documentation',
                connect: 'Connect',
                rights: 'All rights reserved.'
            }
        }
    },
    zh: {
        translation: {
            nav: {
                infra: '基础模块',
                modules: '功能模块',
                about: '关于',
                home: '首页'
            },
            common: {
                backToInfra: '返回基础模块',
                technicalNarrative: '技术叙述',
                codeImplementation: '代码实现',
                involvedFiles: '涉及文件',
                implementationDetails: '实现细节',
                viewSource: '查看源码',
                viewDeepDive: '查看深度分析',
                comingSoon: '敬请期待',
                notFound: '404 - 页面未找到',
                detailComingSoon: '详情说明（敬请期待）',
                exploreInfra: '基础设施探索器',
                selectModule: '选择一个系统以探索其核心能力',
                liveScenarios: '实时场景演示',
                viewTheory: '查看实现原理',
                exploreModules: '功能探索器',
                selectModuleToExplore: '选择一个模块以查看其交互模式'
            },
            hero: {
                badge: 'v1.0.0 正式发布',
                title: '致敬',
                gradient: '卓越开发',
                desc: '从底层基础设施到上层功能模块，深度复盘复杂的 UI 交互实践。',
                performance: '性能'
            },
            features: {
                title: '为什么选择 Xander Lab？',
                desc: '我们优先考虑开发体验和性能，为您提供更快速构建更佳产品所需的工具。',
                composable: {
                    title: '可组合性',
                    desc: '以模块化为核心构建。自由排列组合组件，轻松打造复杂的 UI 界面。'
                },
                themable: {
                    title: '主题化',
                    desc: '通过 Tailwind CSS 全面定制。灵活调整样式，完美契合品牌调性。'
                },
                performant: {
                    title: '极致性能',
                    desc: '为速度而优化。零冗余代码，确保您的应用始终保持丝滑顺畅。'
                }
            },
            infra: {
                title: '基础模块',
                subtitle: '核心系统',
                anchored: {
                    title: 'Anchored Overlay',
                    tag: '定位与物理学',
                    desc: '锚定浮层的底层定位系统，解决“在哪里出现”与“如何稳定”的基本命题。',
                    phases: {
                        theory: {
                            title: '一、 理论层 (定位物理学)',
                            desc: '解决“它在哪里”的数学基础。',
                            points: ['主轴与交叉轴定义', 'Placement 语义化 (top/start/...)', 'Absolute vs Fixed 的抉择']
                        },
                        hook: {
                            title: '二、 引擎层 (useAnchorPosition)',
                            desc: '处理最“脏”的活：ResizeObserver、滚动监听、以及双 RAF 处理，彻底告别布局抖动。',
                            points: ['滚动与尺寸实时追踪', '双 RAF 的同步技巧', '基于 Transform 的极致性能']
                        },
                        container: {
                            title: '三、 抽象层 (行为逻辑容器)',
                            desc: '一个无样式的行为容器，封装了“交互模型”：点击外部关闭、ESC 响应、以及视口约束下的生存策略（翻转/平移）。',
                            points: ['Flip / Shift / Padding 生存策略', 'Focus Trap 与 Backdrop 管理', 'ARIA 职责边界界定']
                        }
                    },
                    files: [
                        { name: 'useAnchorPosition.ts', role: '核心位置计算引擎' },
                        { name: 'OverlayContainer.tsx', role: '无样式行为包装器' },
                        { name: 'PositioningUtils.ts', role: '几何与数学工具函数' },
                        { name: 'types.ts', role: '类型与接口定义' }
                    ]
                }
            },
            modules: {
                title: '功能模块',
                subtitle: 'UI 设计模式',
                popover: {
                    title: 'Popover (气泡浮层)',
                    desc: '通用包装容器，内置默认 Placement 与 Offset 逻辑。'
                },
                dropdown: {
                    title: 'Dropdown Menu (下拉菜单)',
                    desc: 'Menu 语义、键盘交互支持（简版）。'
                },
                tooltip: {
                    title: 'Tooltip (文字提示)',
                    desc: 'Hover/Focus 触发、延迟策略、交互约束。'
                },
                context: {
                    title: 'Context Menu (右键菜单)',
                    desc: '基于 Pointer 位置或 Anchor 目标定位。'
                },
                dragdrop: {
                    title: 'Drag & Drop (拖拽系统)',
                    desc: '高度可定制的拖拽交互，支持自定义预览与实时提示。',
                    phases: {
                        theory: {
                            title: '一、 引擎层 (useDragDrop)',
                            desc: '处理拖拽交互的核心逻辑与状态管理。',
                            points: ['HTML5 Drag & Drop API 封装', '自定义预览元素声明周期管理', '拖拽状态与合法性校验']
                        },
                        hook: {
                            title: '二、 预览层 (DragPreview)',
                            desc: '解决拖拽过程中的视觉反馈与交互提示。',
                            points: ['透明 Ghost Image 技巧', '浮动 DOM 元素实时追踪', 'Controller 驱动的提示系统']
                        },
                        container: {
                            title: '三、 交互层 (Drop Zones)',
                            desc: '定义元素如何被接收与处理。',
                            points: ['灵活的放置校验逻辑', '动态 Drop Hint 文本生成', '乐观 UI 更新支持']
                        }
                    },
                    files: [
                        { name: 'useDragDrop.ts', role: '核心交互 Hook' },
                        { name: 'DragDropSystem.jsx', role: '功能演示页面' },
                        { name: 'DraggableItem.tsx', role: '可复用拖拽组件' }
                    ]
                }
            },
            footer: {
                desc: '为现代 Web 开发打造的 React 组件与 Hooks 深度集合。',
                resources: '资源',
                components: '组件',
                hooks: 'Hooks',
                docs: '文档',
                connect: '链接',
                rights: '保留所有权利。'
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        }
    });

export default i18n;

