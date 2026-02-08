/**
 * 博客数据模拟服务
 * Mock Blog Data Service
 * @module blog/services
 */

const MOCK_CATEGORIES = [
  { id: 'frontend', name: '前端开发', count: 12 },
  { id: 'backend', name: '后端技术', count: 8 },
  { id: 'devops', name: 'DevOps', count: 5 },
  { id: 'career', name: '职场成长', count: 3 },
  { id: 'architecture', name: '架构设计', count: 7 }
];

const MOCK_BLOGS = [
  {
    id: '1',
    title: '深入理解 React Hooks 原理',
    summary: '本文将深入探讨 React Hooks 的内部实现机制，包括 Fiber 架构、链表结构以及状态更新流程。我们还将讨论在使用 Hooks 时常见陷阱及其解决方案。',
    content: `
      React Hooks 是 React 16.8 引入的新特性，它允许你在不编写 class 的情况下使用 state 以及其他的 React 特性。

      ### Fiber 架构与 Hooks
      Hooks 的实现严重依赖于 React 的 Fiber 架构。每个组件实例对应一个 Fiber 节点，而 Hooks 的状态则是存储在 Fiber 节点的 memoizedState 链表中的。

      ### 为什么顺序很重要？
      因为 React 依赖 Hooks 调用的顺序来确定哪个 state 对应哪个 useState。如果在循环、条件或嵌套函数中调用 Hooks，可能会导致状态错乱。

      ### 最佳实践
      1. 只在顶层调用 Hooks
      2. 只在 React 函数中调用 Hooks
      3. 使用 ESLint 插件强制执行规则
    `,
    tags: ['React', 'Hooks', '原理'],
    category: 'frontend',
    author: 'Xander',
    date: '2026-02-08',
    readTime: '10 min',
    views: 1205
  },
  {
    id: '2',
    title: '前端性能优化实战指南',
    summary: '从网络请求、资源加载、代码执行等多个维度，详细介绍前端性能优化的策略和实践技巧。包含 Web Vitals 指标分析和工具使用。',
    content: '性能优化是前端开发中不可或缺的一环...',
    tags: ['Performance', 'Optimization', 'Web'],
    category: 'frontend',
    author: 'Xander',
    date: '2026-02-05',
    readTime: '15 min',
    views: 890
  },
  {
    id: '3',
    title: 'TypeScript 高级类型体操',
    summary: '通过一系列实战案例，讲解 TypeScript 中的高级类型特性，如条件类型、映射类型、模板字面量类型等。适合有一定 TS 基础的开发者。',
    content: 'TypeScript 的类型系统非常强大...',
    tags: ['TypeScript', 'Types', 'Advanced'],
    category: 'frontend',
    author: 'Xander',
    date: '2026-02-01',
    readTime: '20 min',
    views: 1500
  },
  {
    id: '4',
    title: 'CSS Grid 布局完全指南',
    summary: '全面解析 CSS Grid 布局的各个属性和概念，助你轻松掌握现代网页布局利器。包含大量图解和实战布局案例。',
    content: 'CSS Grid 是最强大的 CSS 布局系统...',
    tags: ['CSS', 'Grid', 'Layout'],
    category: 'frontend',
    author: 'Xander',
    date: '2026-01-28',
    readTime: '12 min',
    views: 600
  },
  {
    id: '5',
    title: 'Node.js 事件循环详解',
    summary: '深入剖析 Node.js 事件循环机制，理解宏任务、微任务以及各个阶段的执行顺序。对比浏览器事件循环的异同。',
    content: '事件循环是 Node.js 异步非阻塞 I/O 的核心...',
    tags: ['Node.js', 'Event Loop', 'Backend'],
    category: 'backend',
    author: 'Xander',
    date: '2026-01-25',
    readTime: '18 min',
    views: 950
  },
  {
    id: '6',
    title: 'Docker 容器化部署最佳实践',
    summary: '从 Dockerfile 编写优化到多阶段构建，再到 Docker Compose 编排，手把手教你如何高效容器化你的应用。',
    content: 'Docker 改变了软件交付的方式...',
    tags: ['Docker', 'DevOps', 'Deployment'],
    category: 'devops',
    author: 'Xander',
    date: '2026-01-20',
    readTime: '14 min',
    views: 780
  },
  {
    id: '7',
    title: '微前端架构设计与落地',
    summary: '探讨微前端架构的几种主流实现方案（qiankun, micro-app, webpack5 module federation），以及在大型项目中的落地经验。',
    content: '随着前端项目规模的扩大，微前端成为了一种趋势...',
    tags: ['Microfrontend', 'Architecture', 'Webpack'],
    category: 'architecture',
    author: 'Xander',
    date: '2026-01-15',
    readTime: '25 min',
    views: 2100
  },
  {
    id: '8',
    title: '程序员的职业规划思考',
    summary: '技术专家还是管理路线？大厂螺丝钉还是创业公司多面手？分享一些关于技术人职业发展的思考和建议。',
    content: '职业规划是一个持续的过程...',
    tags: ['Career', 'Growth', 'Life'],
    category: 'career',
    author: 'Xander',
    date: '2026-01-10',
    readTime: '8 min',
    views: 3200
  }
];

export const blogService = {
  /**
   * 获取博客列表（支持搜索、分类、标签筛选）
   * @param {Object} params - 查询参数 { search, category, tag }
   * @returns {Promise<Array>}
   */
  getBlogs: ({ search = '', category = '', tag = '' } = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let results = [...MOCK_BLOGS];
        
        // 分类筛选
        if (category) {
          results = results.filter(blog => blog.category === category);
        }

        // 标签精确筛选
        if (tag) {
          results = results.filter(blog =>
            blog.tags.some(t => t.toLowerCase() === tag.toLowerCase())
          );
        }

        // 搜索筛选
        if (search) {
          const lowerSearch = search.toLowerCase();
          results = results.filter(blog => 
            blog.title.toLowerCase().includes(lowerSearch) || 
            blog.summary.toLowerCase().includes(lowerSearch) ||
            blog.tags.some(t => t.toLowerCase().includes(lowerSearch))
          );
        }

        // 按日期降序
        results.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        resolve(results);
      }, 300); // 模拟网络延迟
    });
  },

  /**
   * 获取最新发布的文章（前N条）
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  getRecentBlogs: (limit = 5) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sorted = [...MOCK_BLOGS].sort((a, b) => new Date(b.date) - new Date(a.date));
        resolve(sorted.slice(0, limit));
      }, 200);
    });
  },

  /**
   * 获取博客详情
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  getBlogById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const blog = MOCK_BLOGS.find(b => b.id === id);
        if (blog) {
          resolve(blog);
        } else {
          reject(new Error('Blog not found'));
        }
      }, 200);
    });
  },

  /**
   * 获取所有分类
   * @returns {Promise<Array>}
   */
  getCategories: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_CATEGORIES);
      }, 100);
    });
  },

  /**
   * 获取所有标签（含文章数量）
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getAllTags: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tagMap = {};
        MOCK_BLOGS.forEach(blog => {
          blog.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        });
        const tags = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        resolve(tags);
      }, 150);
    });
  },

  /**
   * 获取热门标签（前N个）
   * @param {number} limit
   * @returns {Promise<Array<{ name: string, count: number }>>}
   */
  getPopularTags: (limit = 8) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tagMap = {};
        MOCK_BLOGS.forEach(blog => {
          blog.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        });
        const tags = Object.entries(tagMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
        resolve(tags);
      }, 100);
    });
  }
};
