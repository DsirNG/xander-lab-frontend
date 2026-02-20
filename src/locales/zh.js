/**
 * Chinese translations
 * 中文翻译资源
 */

export default {
  nav: {
    infra: '基础模块',
    modules: '功能模块',
    components: '组件',
    blog: '博客',
    about: '关于',
    home: '首页'
  },
  blog: {
    description: '记录学习历程，分享技术见解，探讨最佳实践。',
    search: '搜索',
    searchPlaceholder: '搜索文章...',
    categories: '文章分类',
    allCategories: '全部文章',
    recentPosts: '最新发布',
    latestPosts: '最新文章',
    categoryLabel: '分类',
    searchLabel: '搜索结果',
    loading: '加载中...',
    foundArticles: '共 {{count}} 篇文章',
    clearFilters: '清除筛选',
    gridView: '网格视图',
    listView: '列表视图',
    noArticles: '暂无相关文章',
    noArticlesHint: '试试调整搜索关键词或选择其他分类',
    viewAll: '查看全部文章',
    articleNotFound: '文章不存在或已被删除',
    backToBlog: '返回博客',
    tagLabel: '标签',
    popularTags: '热门标签',
    viewAllTags: '全部标签',
    allTags: '全部标签',
    tagsCount: '共 {{count}} 个标签',
    tagArticles: '「{{tag}}」相关文章',
    noMoreArticles: '没有更多文章了'
  },
  common: {
    backToInfra: '返回基础模块',
    backToComponents: '返回组件库',
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
    selectModuleToExplore: '选择一个模块以查看其交互模式',
    componentSource: '组件源码',
    coreFeatures: '核心功能',
    logicLayer: '逻辑层',
    logicLayerDesc: '处理状态和交互的主组件实现。',
    styleLayer: '样式层',
    styleLayerDesc: '用于作用域样式和动画的CSS Modules。'
  },
  hero: {
    badge: 'v1.0.0 研发中',
    title: '分享',
    gradient: '学习与成长',
    desc: '记录项目中的实践经验，分享自己开发的组件、Hooks 和学习笔记。所有代码提供完整源码，可直接复用，减少重复开发。同时帮助自己复习，也为新手提供学习资源。',
    performance: '性能'
  },
  features: {
    title: '为什么要做 Xander Lab？',
    desc: '在项目开发中，经常会遇到重复的问题和需求。通过记录和整理这些实践经验，既能帮助自己复习和沉淀知识，也能为其他开发者提供参考。所有内容都来自真实项目，包含完整的源码和实现思路。',
    composable: {
      title: '开箱即用',
      desc: '所有组件和 Hooks 都提供完整源码，可直接复制到项目中使用，减少重复开发的工作量。'
    },
    themable: {
      title: '学习资源',
      desc: '记录第一次学习到的新知识和技术点，包含实现思路和代码注释，适合新手学习和复习。'
    },
    performant: {
      title: '实践导向',
      desc: '所有内容都来自真实项目实践，不是纸上谈兵，而是经过验证的解决方案。'
    }
  },
  infra: {
    title: '基础模块',
    subtitle: '核心系统',
    anchored: {
      title: 'Anchored Overlay',
      tag: '定位与物理学',
      desc: '锚定浮层的底层定位系统，解决"在哪里出现"与"如何稳定"的基本命题。',
      phases: {
        theory: {
          title: '一、 理论层 (定位物理学)',
          desc: '解决"它在哪里"的数学基础。',
          points: ['主轴与交叉轴定义', 'Placement 语义化 (top/start/...)', 'Absolute vs Fixed 的抉择']
        },
        hook: {
          title: '二、 引擎层 (useAnchorPosition)',
          desc: '处理最"脏"的活：ResizeObserver、滚动监听、以及双 RAF 处理，彻底告别布局抖动。',
          points: ['滚动与尺寸实时追踪', '双 RAF 的同步技巧', '基于 Transform 的极致性能']
        },
        container: {
          title: '三、 抽象层 (行为逻辑容器)',
          desc: '一个无样式的行为容器，封装了"交互模型"：点击外部关闭、ESC 响应、以及视口约束下的生存策略（翻转/平移）。',
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
      tag: '基础交互',
      desc: '通用包装容器，内置默认 Placement 与 Offset 逻辑。'
    },
    dropdown: {
      title: 'Dropdown Menu (下拉菜单)',
      tag: '菜单交互',
      desc: 'Menu 语义、键盘交互支持（简版）。'
    },
    tooltip: {
      title: 'Tooltip (文字提示)',
      tag: '提示反馈',
      desc: 'Hover/Focus 触发、延迟策略、交互约束。'
    },
    context: {
      title: 'Context Menu (右键菜单)',
      tag: '右键交互',
      desc: '基于 Pointer 位置或 Anchor 目标定位。'
    },
    dragdrop: {
      title: 'Drag & Drop (拖拽系统)',
      tag: '拖拽交互',
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
  components: {
    customSelect: {
      title: 'customSelect',
      desc: '一个支持边界检测和滚动跟随的自定义下拉选择组件。常规的下拉框往往无法很好地处理视口边界问题,该组件能够自动调整位置以保持可见性,并且在滚动时持续跟随触发元素,确保下拉框始终对齐。',
      guideTitle: '实现指南',
      tag: '智能定位',
      phases: {
        boundary: {
          title: '一、 边界检测',
          desc: '自动检测视口边界并调整下拉框方向以确保可见性。',
          points: ['向上/向下定位逻辑', '实时视口空间计算', '双RAF确保精确测量']
        },
        scroll: {
          title: '二、 滚动跟随',
          desc: '持续监听滚动事件以保持与触发元素的对齐。',
          points: ['窗口和容器滚动监听', '滚动时重新计算位置', '窗口大小变化处理']
        },
        interaction: {
          title: '三、 用户交互',
          desc: '提供直观的交互模式和完善的状态管理。',
          points: ['点击外部关闭', '键盘导航支持', '错误状态可视化']
        }
      },
      files: [
        { name: 'CustomSelect/index.jsx', role: '主组件' },
        { name: 'CustomSelect/index.module.css', role: '组件样式' },
        { name: 'demo/demo.jsx', role: '使用示例' }
      ],
      featureList: ['边界检测', '滚动感知', '键盘导航', '对齐控制'],
      scenarios: {
        basic: {
          title: '基础用法',
          desc: '标准单选模式，支持自定义样式。'
        },
        alignment: {
          title: '文本对齐',
          desc: '支持左对齐、居中和右对齐，适应不同业务场景。'
        },
        states: {
          title: '交互状态',
          desc: '包括错误状态在内的多种交互反馈。'
        },
        demo: {
          status: {
            required: '必填字段',
            requiredDesc: '点击提交以触发错误',
            requiredPlaceholder: '请选择...',
            simulateSubmit: '模拟提交',
            errorMsg: '请选择一个选项',
            optional: '可选字段',
            optionalDesc: '提交验证已禁用',
            optionalPlaceholder: '请选择(可选)...'
          }
        }
      }
    },
    toast: {
      title: 'Toast 消息通知',
      desc: '基于物理学交互的高级反馈系统，提供流畅的状态提醒。',
      tag: '交互反馈',
      scenarios: {
        basic: {
          title: '基础用法 (极简)',
          desc: '不含进度条或关闭按钮的纯净状态，适合非干扰性 UI。',
          success: '状态：核心逻辑已就绪',
          error: '异常：请求频率超限',
          info: '更新：版本 v2.4.0 已加入',
          warning: '警告：系统正在维护中',
          custom: '触发自定义样式',
          customMsg: '自定义紫色幻彩样式',
          success_btn: '成功反馈 (简约)',
          error_btn: '异常告警 (简约)',
          info_btn: '信息更新 (简约)',
          warning_btn: '警告提示 (简约)'
        },
        physics: {
          title: '物理交互 (悬停暂停)',
          desc: '实时时间锁定：鼠标悬停将冻结倒计时，为用户提供无限阅读时间。',
          hint: '此模式下，鼠标悬停将冻结计时器，移开后恢复执行。',
          msg: '实验观测：由于设置了 pauseOnHover: true，悬停可无限延展阅读时间。',
          btn: '启动物理暂停实验室'
        },
        manual: {
          title: '手动关闭',
          desc: '明确的交互模型，展示关闭按钮，适用于需要确认的告警。',
          hint: '强制展示关闭按钮，允许用户主动清理通知轨道。',
          msg: '检测到非法指令注入，安全协议已强制执行清理。',
          btn: '弹出带叉叉的告警'
        },
        action: {
          title: 'JSX & 丰富动作',
          desc: '不仅是字符串：直接在反馈流中嵌入链接、按钮和自定义布局逻辑。',
          hint: '支持嵌入交互式链接，点击链接时自动触发业务跳转。',
          msg: '文档编译成功',
          btn: '弹出交互链接'
        },
        comparison: {
          title: '系统对比 (强制不暂停)',
          desc: '禁用 pauseOnHover 的基准演示，无论是否对焦，通知都会消失。',
          hint: '对比项：即便悬停，倒计时依然会强行流逝。',
          msg: '强制流逝测试：无论怎么悬停，我都会在 3s 后消失。',
          btn: '触发不可暂停提示'
        },
        stack: {
          btn: '触发脉冲堆叠'
        }
      },
      guide: {
        back: '返回列表',
        title: 'Toast // 源码实现',
        subtitle: '“专为现代 C 端体验设计的高级物理基准通知系统。精准的时间控制与硬件加速的流体动画完美融合。”',
        architecture: {
          engine: '实验性引擎',
          physics: '动力学与运动学',
          logic: '核心逻辑概览',
          logicDesc: '解耦的状态管理确保通知在页面导航中持久存在，同时保持像素级的定时精度。'
        },
        sections: {
          physics: {
            title: '01. 物理项逻辑',
            desc: '处理悬停状态、毫秒级倒计时以及 CSS 动画同步。'
          },
          orchestration: {
            title: '02. 状态编排',
            desc: '全局 Context 提供者，管理通知队列的生命周期和属性映射。'
          },
          portal: {
            title: '03. Portal 基础设施',
            desc: '在主 DOM 树之外渲染通知堆栈，确保一致的深度和布局。'
          },
          entry: {
            title: '04. 入口终端',
            desc: '统一导出，便于在各个功能模块中集成。'
          }
        }
      }
    }
  },
  footer: {
    desc: '知识分享与学习平台，记录项目实践经验，提供可复用的组件、Hooks 和学习资源。欢迎指出错误和不足，共同进步！',
    resources: '资源',
    Infrastructure: '基础设施',
    Modules: '模块',
    docs: '文档',
    connect: '链接',
    rights: '保留所有权利。',
    feedback: '如有错误或建议，欢迎指正！'
  }
};
