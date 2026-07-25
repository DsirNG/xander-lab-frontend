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
    studio: '工作室',
    about: '关于',
    home: '首页',
    logout: '退出登录',
    login: '登录',
    skipToMain: '跳至主要内容',
    accountLogin: '账户登录'
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
    noMoreArticles: '没有更多文章了',
    publish: '发布博客',
    publishTitle: '发布新文章',
    editTitle: '编辑文章',
    backToManage: '返回博客管理',
    publishSuccess: '博客已成功发布',
    publishError: '发布失败，请重试',
    publishStatusUnknown: '发布状态仍在确认中，草稿已保留，请勿重复提交',
    titleLabel: '文章标题',
    titlePlaceholder: '输入引人入胜的标题...',
    categoryPlaceholder: '选择分类',
    summaryLabel: '文章摘要',
    summaryPlaceholder: '简单介绍一下这篇文章...',
    contentLabel: '文章内容 (Markdown)',
    contentPlaceholder: '使用 Markdown 倾诉你的想法...',
    tagsPlaceholder: '按回车添加标签...',
    saveDraft: '保存草稿',
    saveDraftSuccess: '草稿已保存到本设备',
    saveDraftServerSuccess: '草稿已保存',
    saveDraftLocalFallback: '服务器保存失败，已暂存到本设备',
    saveDraftError: '草稿保存失败，请检查浏览器存储权限',
    publishNow: '立即发布',
    publishing: '发布中...',
    fillRequired: '请填写完整的标题、内容和分类',
    publishSettings: '文档设置',
    edit: '编辑',
    preview: '预览',
    noContent: '尚未输入内容',
    media: { insertImage: '插入图片', dropImage: '拖放或选择图片 / GIF，上传后插入到光标位置', uploadingImage: '正在上传', imageInserted: '图片已插入正文', imageUploadFailed: '图片上传失败，请重试', invalidImage: '请选择图片或 GIF 文件', imageTooLarge: '图片大小不能超过 10MB', altText: '图片说明（可访问性）', addToArticle: '插入正文', libraryTitle: '插入图片', uploadImage: '上传图片', uploadSuccess: '图片已上传到素材库', searchPlaceholder: '搜索图片名称', scopes: { recent: '最近上传', mine: '我的图片', gif: 'GIF' }, emptyTitle: '还没有可用图片', emptyHint: '上传一张图片后会保存在你的素材库中', selectHint: '选择一张图片查看详情', selectedCount: '已选择 {{count}} 张图片', cancel: '取消', insertAtCursor: '插入到当前位置' },
    editor: { toolbar: '写作工具', addBlock: '添加内容块', text: '文本', h1: 'H1', h2: 'H2', todo: '待办', list: '列表', quote: '引用', code: '代码', insertContent: '插入内容', imageGif: '图片 / GIF', video: '视频（即将支持）', divider: '分割线', table: '表格', codeBlock: '代码块', quoteBlock: '引用块' },
    agent: {
      title: '博客智能体', back: '返回博客', headline: '把想法变成可发布的知识博客',
      description: '输入一个主题或一篇日记。智能体会联网调研、写作并审校，给出带来源的完整文章。',
      inputLabel: '主题或日记', inputPlaceholder: '例如：最近我开始用 AI 写代码，效率更高了，但我担心自己理解代码的能力在下降……',
      inputType: '输入类型', audience: '目标读者', tone: '写作语气', defaultAudience: '对这个主题感兴趣的读者', defaultTone: '清晰、真诚、可操作',
      generate: '调研并写作', running: '正在调研和写作…', waiting: '等待你的输入', ready: '等待审阅', failed: '智能体未能完成这次任务', complete: '文章已生成，可开始审阅',
      workflow: '智能体工作流', guardrail: '个人经历始终标注为作者经历；外部事实必须可追溯，系统绝不会自动公开发布。',
      stages: { analyze: '确定文章角度', research: '调研与核验', write: '撰写完整文章', illustrate: '生成知识插图', review: '发布前审校' },
      stageDescriptions: { analyze: '识别读者、观点和需要补充的证据。', research: '联网核验文章中的外部事实。', write: '生成完整的 Markdown 知识博客。', illustrate: '按需生成插图并保存到你的素材库。', review: '检查证据、表达和发布状态。' },
      article: '生成的文章', toDraft: '进入编辑器', draftCreated: '已创建草稿，现在可以编辑并发布。', sources: '调研来源', noSources: '这篇文章未保留外部来源。', review: '编辑审校', reviewPending: '智能体完成后会显示审校结果。', inputRequired: '请先输入主题或日记。', contentFocus: '内容边界', mustCover: '文章主干', relatedExpansion: '直接扩展', outOfScope: '不主动扩展', knowledgeGraph: '知识关系图谱', illustrations: '知识插图', illustrationStatuses: { running: '正在生成并保存插图。', complete: '插图已生成并插入文章，同时保存到你的素材库。', partial: '部分插图已生成，其余插图可以稍后补充。', failed: '插图生成失败，文章内容仍可正常审阅。', disabled: '尚未配置图片模型，本次已跳过插图。', none: '智能体判断这篇文章不需要额外插图。' },
      processing: '处理中 {{duration}}', processed: '已处理 {{duration}}', processedDone: '已处理', processFailed: '处理失败', openPreview: '点击预览文章', previewEmpty: '选择生成的博客以预览', untitled: '未命名文章', newTask: '新任务', newConversation: '新建会话', conversations: '会话列表', noConversations: '还没有历史会话', restoring: '正在恢复智能体任务…', multiTurnHint: '继续输入修改要求，智能体会基于当前文章生成新版本。', revise: '继续修改', revisionComplete: '文章已按本轮要求更新', waitingForStage: '正在准备下一阶段…', inputLockedPlaceholder: '智能体处理中，请稍候', confirmPublish: '确认发布', viewArticle: '查看文章', showMeta: '显示调研与审校信息', hideMeta: '收起调研与审校信息'
    }
  },
  common: {
    confirm: '确认',
    cancel: '取消',
    backHome: '返回首页',
    backToInfra: '返回基础模块',
    backToComponents: '返回组件库',
    goBack: '返回',
    pageNotFound: '页面未找到',
    pageNotFoundDesc: '您访问的页面不存在或已被移动。',
    technicalNarrative: '技术叙述',
    codeImplementation: '代码实现',
    involvedFiles: '涉及文件',
    implementationDetails: '实现细节',
    viewDetails: '查看详情',
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
    styleLayerDesc: '用于作用域样式和动画的CSS Modules。',
    codeBlock: {
      showCode: '查看代码',
      showPreview: '预览效果',
      copy: '复制代码',
      copied: '已复制',
      previewFrame: '{{language}} 预览',
    },
    errorBoundary: {
      title: '页面出现了问题',
      description: '应用遇到了一个意外错误。你可以尝试重新加载页面，或者返回首页。',
      errorDetails: '错误详情',
      reload: '重新加载',
      backToHome: '返回首页'
    },
    aria: {
      mainNav: '主导航',
      openMenu: '打开菜单',
      closeMenu: '关闭菜单',
      openSidebar: '打开侧边栏',
      closeSidebar: '关闭侧边栏',
      gridView: '网格视图',
      listView: '列表视图',
      close: '关闭',
      closeNotification: '关闭通知'
    }
  },
  auth: {
    sessionExpired: '登录已过期，请重新登录',
    login: {
      invalidEmail: '请输入有效的邮箱',
      codeSent: '验证码已发送至您的邮箱',
      codeSendFailed: '验证码发送失败，请检查网络',
      authSuccess: '验证成功，欢迎进入',
      authFailed: '验证失败，请检查邮箱和验证码',
      loginAccess: '登录访问',
      loginDesc: '获取 Xander Lab 完整功能、博客管理及多维数据的访问权限。',
      emailLabel: '邮箱地址',
      emailPlaceholder: '请输入邮箱',
      codeLabel: '验证码',
      codePlaceholder: '6位数字验证码',
      sendCode: '发送验证码',
      autoRegisterHint: '新用户将自动注册，继续即表示您同意我们的条款。',
      submit: '登录 / 注册',
      accountLabel: '账号',
      accountPlaceholder: '用户名 / 邮箱',
      passwordLabel: '密码',
      passwordPlaceholder: '请输入密码',
      passwordAuth: '密码登录',
      codeAuth: '验证码登录',
      login: '登录',
      backToLobby: '返回大厅',
      techBlog: '技术博客'
    }
  },
  profile: {
    title: '个人中心',
    subtitle: '管理你的账号与自动化流程',
    open: '打开个人中心',
    account: '已登录账户',
    loading: '正在加载个人中心…',
    comingSoon: '功能即将上线',
    comingSoonHint: '该模块正在准备中，当前可先使用博客管理与定时邮箱。',
    logoutConfirmTitle: '退出登录',
    logoutConfirmMessage: '确定要退出当前账号吗？',
    nav: {
      account: '账户信息',
      security: '安全设置',
      notifications: '通知设置',
      blogManage: '博客管理',
      emailReminders: '定时邮箱',
      templates: '邮件模板',
      history: '任务记录',
      apiKeys: 'API 密钥',
      preferences: '偏好设置'
    },
    blogManage: {
      title: '博客管理',
      description: '管理你的文章：编辑、草稿、发布与回收站',
      createNew: '写新文章',
      tabs: {
        all: '全部',
        published: '已发布',
        draft: '草稿',
        trash: '回收站'
      },
      searchPlaceholder: '搜索标题或摘要',
      loading: '正在加载文章…',
      loadError: '文章加载失败',
      retry: '重新加载',
      emptyTitle: '还没有文章',
      emptyHint: '点击右上角写新文章，或从博客首页进入发布页。',
      emptyTrash: '回收站是空的',
      emptyTrashHint: '移入回收站的文章会出现在这里。',
      untitled: '未命名文章',
      status: {
        draft: '草稿',
        published: '已发布',
        trash: '回收站'
      },
      actions: {
        edit: '编辑',
        publish: '发布',
        unpublish: '转为草稿',
        trash: '移入回收站',
        restore: '恢复为草稿',
        permanentDelete: '彻底删除',
        view: '查看'
      },
      confirmTrashTitle: '移入回收站',
      confirmTrashMessage: '确定将「{{title}}」移入回收站？之后可在回收站恢复。',
      confirmPermanentTitle: '彻底删除',
      confirmPermanentMessage: '确定彻底删除「{{title}}」？此操作不可恢复。',
      trashed: '已移入回收站',
      permanentlyDeleted: '已彻底删除',
      restored: '已恢复为草稿',
      published: '已发布',
      unpublished: '已转为草稿',
      pageInfo: '第 {{from}}-{{to}} 条，共 {{total}} 条',
      pageSizeOption: '每页 {{size}} 条',
      prevPage: '上一页',
      nextPage: '下一页'
    },
    emailReminders: {
      title: '定时邮箱',
      description: '设置定时发送邮件，自动化你的消息触达',
      createNew: '新建定时邮件',
      taskList: '定时任务列表',
      taskName: '任务名称',
      statusLabel: '状态',
      actions: '操作',
      taskCount: '共 {{count}} 个任务',
      filterAll: '全部状态',
      searchPlaceholder: '搜索任务名称或收件人',
      pageInfo: '第 {{from}}-{{to}} 条，共 {{total}} 条',
      pageSizeOption: '每页 {{size}} 条',
      prevPage: '上一页',
      nextPage: '下一页',
      refresh: '刷新',
      loading: '正在加载邮件任务…',
      loadError: '任务加载失败',
      retry: '重新加载',
      emptyTitle: '还没有定时邮件',
      emptyHint: '点击右上角新建定时邮件，选择发送时间并写好内容。',
      addTitle: '新建定时邮件',
      sideIntro: '一次创建，按计划自动触达收件人。',
      senderHint: '邮件将由 Xander Lab 验证邮件账号统一发送。',
      recipientEmail: '收件邮箱',
      recipientPlaceholder: 'name@example.com',
      scheduledAt: '发送时间',
      subject: '邮件主题',
      subjectPlaceholder: '例如：别忘了今晚复盘',
      message: '想说的话',
      messagePlaceholder: '直接写正文，也可粘贴自定义 HTML…',
      messageHtmlPlaceholder: '可直接编写 HTML，例如 <p>你好</p><strong>加粗</strong>',
      previewTitle: '邮件效果预览',
      safePreview: '预览',
      previewSubject: '你的邮件主题会显示在这里',
      previewMessage: '在这里输入内容后可预览发送效果。',
      contentType: '内容格式',
      contentTypes: {
        plain: '纯文本',
        html: 'HTML'
      },
      template: '邮件模板',
      templates: {
        classic: '晨光信笺',
        minimal: '纸间留白',
        card: '落日提醒',
        notice: '青石通知'
      },
      templateSubjects: {
        classic: '给未来的一封信',
        minimal: '今日提醒',
        card: '到点提醒',
        notice: '重要通知'
      },
      selectTemplate: '选择模板',
      templatePickerTitle: '选择邮件模板',
      templatePickerHint: '选中后插入 HTML 样例并套用版式；也可跳过，直接自定义 HTML。',
      useThisTemplate: '使用',
      clearToPlain: '改回纯文本',
      applyTemplateStarter: '填入 HTML 示例',
      messageInputHint: '默认可直接输入；支持自定义 HTML 邮件。需要版式时点「选择模板」。',
      plainContentHint: '默认可直接输入；支持自定义 HTML 邮件。',
      htmlContentHint: '已套用「{{template}}」版式，正文按 HTML 发送。',
      plainPreviewBadge: '正文',
      htmlPreviewBadge: 'HTML',
      customPreviewBadge: '自定义',
      htmlSafetyHint: '支持自定义 HTML；模板可选。',
      create: '创建定时邮件',
      createAndSave: '创建并保存',
      creating: '正在创建…',
      created: '定时邮件已创建',
      statusUpdated: '任务状态已更新',
      deleted: '定时邮件已删除',
      fieldsRequired: '请完整填写收件邮箱、发送时间、主题和内容',
      invalidEmail: '请输入有效的收件邮箱',
      futureTimeRequired: '发送时间必须晚于当前时间',
      sendTimeRequired: '请设置发送时间',
      intervalDaysInvalid: '自定义间隔天数需在 1-365 之间',
      errorLabel: '失败原因',
      pause: '暂停',
      resume: '恢复',
      delete: '删除',
      confirmDelete: '确认删除',
      confirmDeleteTitle: '删除定时邮件',
      confirmDeleteMessage: '确定删除「{{name}}」吗？此操作不可恢复。',
      cancelDelete: '取消',
      tipTitle: '小贴士',
      tipBody: '定时邮件会在到达设定时间后自动发送，请确认收件人与内容无误。',
      viewHelp: '查看帮助文档',
      helpTitle: '使用帮助',
      sectionRecipient: '收件人',
      sectionContent: '邮件内容',
      sectionSchedule: '发送设置',
      timezone: '时区',
      frequency: '发送频率',
      sendTime: '发送时刻',
      weekday: '每周几',
      monthDayLabel: '每月几号',
      monthDay: '{{day}} 号',
      intervalDays: '每隔天数',
      scheduleColumn: '发送计划',
      nextRun: '下次 {{time}}',
      notSet: '未设置',
      overviewTitle: '任务概览',
      scheduleDaily: '每天 {{time}}',
      scheduleWeekly: '每周{{weekday}} {{time}}',
      scheduleMonthly: '每月 {{day}} 号 {{time}}',
      scheduleCustom: '每 {{days}} 天 {{time}}',
      frequencies: {
        once: '单次发送',
        daily: '每天',
        weekly: '每周',
        monthly: '每月',
        custom: '自定义'
      },
      weekdays: {
        1: '周一',
        2: '周二',
        3: '周三',
        4: '周四',
        5: '周五',
        6: '周六',
        7: '周日'
      },
      stats: {
        total: '定时任务',
        totalHint: '全部任务',
        active: '启用中',
        activeHint: '正在运行',
        sent: '已发送',
        sentHint: '邮件总数',
        pending: '待发送',
        pendingHint: '即将执行'
      },
      features: {
        flexibleTime: '灵活时间设置（一次 / 指定时刻）',
        templates: '支持邮件模板复用',
        variables: '智能变量预留（如 {name}、{date}）',
        stats: '发送结果实时统计'
      },
      help: {
        create: '如何创建定时邮件',
        templates: '模板设置说明',
        variables: '变量使用方法',
        faq: '常见问题'
      },
      status: {
        pending: '启用中',
        paused: '已暂停',
        sending: '发送中',
        sent: '已发送',
        failed: '发送失败'
      }
    }
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
    desc: '探索我们的原子组件库。',
    list: {
      atomDesc: '用于构建一致界面的原子组件。',
      shareMyComponents: '分享我的组件'
    },
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
    },
    detail: {
      loading: '正在加载组件详情...',
      error: '加载失败或组件不存在。',
      loadingPage: '正在加载页面...'
    },
    content: {
      architectureDeepDive: '架构深度解析',
      implementationOverview: '技术实现概览',
      implementationHint: '该组件包含自定义逻辑层，点击右上角按钮查看完整架构解析。',
      understandTitle: '深入理解此组件的运行机制',
      understandDesc: '不仅是 UI 演示。查看我们如何通过 Context API 和自定义 Hooks 构建这一交互系统。',
      viewGuide: '查看完整实现指南',
      sourceCode: '组件实现源码',
      sourceCodeDesc: '完整的文件结构与实现细节参考',
      coreLogic: '核心逻辑 (Lib)',
      stylesDef: '样式定义 (CSS)'
    },
    guide: {
      parsingArchitecture: '正在解析架构细节...',
      loadFailed: '无法加载组件源码。',
      defaultDesc: '该组件通过动态沙箱引擎实现，包含了完整的组件逻辑层与环境包裹层。'
    },
    share: {
      header: {
        title: '组件工作室',
        restartTour: '重启新手向导',
        tour: '新手向导',
        publish: '发布至组件库'
      },
      sidebar: {
        registerMeta: '注册元数据',
        titleZh: '中文标题',
        descLabel: '组件详述 (CN/EN)',
        descZhPlaceholder: '中文介绍...',
        testScenarios: '测试用例场景'
      },
      drawer: {
        logic: '底层逻辑 (Logic)',
        env: '执行环境 (Env)',
        css: '样式底座 (Styles)',
        coreArchitecture: '核心工程架构',
        collapseConsole: '收起控制台',
        viewArchitecture: '查看源码架构',
        wrapperHint: '获取外层包裹样例',
        cssHint: '获取CSS样式样例'
      },
      modals: {
        newFile: '新建文件',
        cancel: '取消',
        confirmCreate: '确定创建',
        deleteConfirm: '删除确认',
        confirmDelete: '确认删除',
        deleteWarning: '你正在极其危险地彻底抹除代码资产：',
        deleteLoseWarning: '一旦删除，本地将丢失该文件的源码结构，是否强行覆盖执行？',
        deleteScenarioConfirm: '删除场景',
        deleteScenarioWarning: '确定删除以下测试场景吗：',
        deleteScenarioLoseWarning: '删除后该场景的演示代码将无法恢复。',
        keepOneScenario: '至少需要保留一个场景',
        presetSamples: '预置样例库',
        oneClickLoad: '一键装载',
        helpIntro: '这是一项开发向导功能。点击下方按钮后，我们将为您本环节自动填入',
        helpMeta: '该操作将会为您填入 Toast 组件的完整基本信息（中英文名称、描述及版本），跳过繁杂的手动录入。',
        helpScenario: '该操作将会一键填充一份同时包含了 { 成功态 / 失败态 / 进度流 } 等交互机制的完整 React DOM 运行场景。',
        helpLogic: '该操作将会为您直接写入 ToastContext、ToastItem 和 ToastContainer 三个具备相互依赖关系的核心架构文件。',
        helpEnv: '该操作将会为您填入 <ToastProvider /> 等全量外层上下文节点，使您的演示代码能够正常接管全局路由或顶层依赖。',
        helpCss: '该操作将会为您补充 Toast 高性能进退场的 CSS Keyframes 等基底渲染数据。',
        editScenario: '修改测试场景信息',
        saveChanges: '保存修改',
        chineseName: '中文名称',
        chineseNamePlaceholder: '输入场景中文名...',
        welcomeTitle: '欢迎访问系统实验室',
        welcomeReject: '我已熟悉，残忍拒绝',
        startTour: '启动教学向导',
        welcomeDesc: '侦测到系统架构池处于初始完全清空状态，且您是第一次进入 Xander-Lab Workspace。为了帮助您最快熟悉这个"四合一"热重载沙盒，我们为您内置了一整套全局通知系统（Toast）的骨架。是否愿意花 30 秒的世界时间，跟随强光指引，一点点体验如何无脑将组件拼装、编译并最终发射运作？',
        fileExtensionHint: '推荐使用标准的前端扩展名如'
      }
    }
  },
  http: {
    errors: {
      badRequest: '请求参数错误',
      unauthorized: '登录已过期，请重新登录',
      forbidden: '您没有权限执行此操作',
      notFound: '请求的资源不存在',
      methodNotAllowed: '请求方法不被允许',
      requestTimeout: '请求超时，请稍后重试',
      conflict: '数据冲突，请刷新后重试',
      unprocessable: '请求数据验证失败',
      tooManyRequests: '请求过于频繁，请稍后重试',
      internalError: '服务器内部错误',
      badGateway: '网关错误，请稍后重试',
      serviceUnavailable: '服务暂时不可用',
      gatewayTimeout: '网关超时，请稍后重试',
      bizDefault: '业务处理失败',
      invalidCredentials: '用户名或密码错误',
      accountDisabled: '账号已被禁用',
      codeExpired: '验证码已过期',
      dataNotFound: '数据不存在',
      noPermission: '无操作权限',
      serverBusy: '服务器繁忙，请稍后重试',
      networkError: '网络请求失败，请检查网络连接',
      noRefreshToken: '无刷新令牌，请重新登录',
      retryPrefix: '[HTTP] 重试',
      retrySuffix: '延迟',
      cancelled: '请求已取消'
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
