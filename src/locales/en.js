/**
 * English translations
 * 英语翻译资源
 */

export default {
  nav: {
    infra: 'Infrastructure',
    modules: 'Modules',
    components: 'Components',
    blog: 'Blog',
    about: 'About',
    home: 'Home'
  },
  blog: {
    description: 'Documenting the learning journey, sharing technical insights and best practices.',
    search: 'Search',
    searchPlaceholder: 'Search articles...',
    categories: 'Categories',
    allCategories: 'All Posts',
    recentPosts: 'Recent Posts',
    latestPosts: 'Latest Posts',
    categoryLabel: 'Category',
    searchLabel: 'Search Results',
    loading: 'Loading...',
    foundArticles: '{{count}} articles found',
    clearFilters: 'Clear Filters',
    gridView: 'Grid View',
    listView: 'List View',
    noArticles: 'No articles found',
    noArticlesHint: 'Try adjusting your search terms or selecting a different category.',
    viewAll: 'View All Posts',
    articleNotFound: 'Article not found or has been removed.',
    backToBlog: 'Back to Blog',
    tagLabel: 'Tag',
    popularTags: 'Popular Tags',
    viewAllTags: 'All Tags',
    allTags: 'All Tags',
    tagsCount: '{{count}} tags in total',
    tagArticles: 'Articles tagged "{{tag}}"',
    noMoreArticles: 'No more articles'
  },
  common: {
    backToInfra: 'Back to Infrastructure',
    backToComponents: 'Back to Components',
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
    selectModuleToExplore: 'Select a module to view its patterns and interactions',
    componentSource: 'Component Source',
    coreFeatures: 'Core Features',
    logicLayer: 'Logic Layer',
    logicLayerDesc: 'Main component implementation handling state and interaction.',
    styleLayer: 'Style Layer',
    styleLayerDesc: 'CSS Modules for scoped styling and animations.'
  },
  hero: {
    badge: 'v1.0.0 In Development',
    title: 'Share',
    gradient: 'Learn & Grow',
    desc: 'Document practical experiences from projects, share self-developed components, Hooks, and learning notes. All code includes complete source code for direct reuse, reducing repetitive development. Also helps with review and provides learning resources for beginners.',
    performance: 'Performance'
  },
  features: {
    title: 'Why Build Xander Lab?',
    desc: 'In project development, we often encounter repetitive problems and requirements. By documenting and organizing these practical experiences, we can help ourselves review and consolidate knowledge, while also providing references for other developers. All content comes from real projects, including complete source code and implementation ideas.',
    composable: {
      title: 'Ready to Use',
      desc: 'All components and Hooks provide complete source code that can be directly copied into your project, reducing repetitive development work.'
    },
    themable: {
      title: 'Learning Resources',
      desc: 'Document newly learned knowledge and technical points with implementation ideas and code comments, suitable for beginners to learn and review.'
    },
    performant: {
      title: 'Practice-Oriented',
      desc: 'All content comes from real project practices, not theoretical, but verified solutions.'
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
      tag: 'Basic Interaction',
      desc: 'General floating container with default placements and offsets.'
    },
    dropdown: {
      title: 'Dropdown Menu',
      tag: 'Menu Interaction',
      desc: 'Menu semantics with keyboard navigation.'
    },
    tooltip: {
      title: 'Tooltip',
      tag: 'Feedback',
      desc: 'Hover/focus triggered informational overlays.'
    },
    context: {
      title: 'Context Menu',
      tag: 'Context Interaction',
      desc: 'Pointer-based relative positioning.'
    },
    dragdrop: {
      title: 'Drag & Drop',
      tag: 'Drag Interaction',
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
  components: {
    customSelect: {
      title: 'Custom Select',
      desc: 'A custom dropdown component that supports boundary detection and scroll tracking. Standard dropdowns often fail to handle viewport constraints properly - this component automatically adjusts its position to stay visible and follows scroll events to maintain alignment with its trigger element.',
      guideTitle: 'Implementation Guide',
      tag: 'Smart Positioning',
      phases: {
        boundary: {
          title: 'I. Boundary Detection',
          desc: 'Automatically detects viewport boundaries and adjusts dropdown direction to ensure visibility.',
          points: ['Upward/Downward positioning logic', 'Real-time viewport space calculation', 'Dual-RAF for accurate measurements']
        },
        scroll: {
          title: 'II. Scroll Tracking',
          desc: 'Continuously monitors scroll events to maintain alignment with the trigger element.',
          points: ['Window and container scroll listeners', 'Position recalculation on scroll', 'Resize event handling']
        },
        interaction: {
          title: 'III. User Interaction',
          desc: 'Provides intuitive interaction patterns with proper state management.',
          points: ['Click outside to close', 'Keyboard navigation support', 'Error state visualization']
        }
      },
      files: [
        { name: 'CustomSelect/index.jsx', role: 'Main Component' },
        { name: 'CustomSelect/index.module.css', role: 'Component Styles' },
        { name: 'demo/demo.jsx', role: 'Usage Examples' }
      ],
      featureList: ['Boundary Detection', 'Scroll Awareness', 'Keyboard Navigation', 'Alignment Control'],
      scenarios: {
        basic: {
          title: 'Basic Usage',
          desc: 'Standard single selection with custom styling capabilities.'
        },
        alignment: {
          title: 'Text Alignment',
          desc: 'Support for Left, Center, and Right text alignment depending on context.'
        },
        states: {
          title: 'States',
          desc: 'Visual feedback for different interaction states including Error.'
        },
        demo: {
          status: {
            required: 'Required Field',
            requiredDesc: 'Click submit to trigger error',
            requiredPlaceholder: 'Select required...',
            simulateSubmit: 'Simulate Submit',
            errorMsg: 'Please select an option',
            optional: 'Optional Field',
            optionalDesc: 'Submit validation disabled',
            optionalPlaceholder: 'Select optional...'
          }
        }
      }
    },
    toast: {
      title: 'Toast Notifications',
      desc: 'Premium feedback system with physics-based interactions, providing fluid state alerts.',
      tag: 'Interaction',
      scenarios: {
        basic: {
          title: 'Basic Usage (Minimal)',
          desc: 'Pure notification state without progress bars or close buttons for a clean, non-intrusive UI.',
          success: 'Status: Core logic ready',
          error: 'Error: Request rate limit exceeded',
          info: 'Update: Version v2.4.0 joined',
          warning: 'Warning: Low disk space',
          custom: 'Trigger Custom Style',
          customMsg: 'Custom Purple Phantom Style',
          success_btn: 'Success (Minimal)',
          error_btn: 'Error (Minimal)',
          info_btn: 'Info (Minimal)',
          warning_btn: 'Warning (Minimal)'
        },
        physics: {
          title: 'Interactive Physics (Pause on Hover)',
          desc: 'Real-time temporal locking: hovering freezes the countdown, allowing users infinite reading time.',
          hint: 'In this mode, hovering freezes the timer; it resumes once the mouse leaves.',
          msg: 'Experimental Observation: With pauseOnHover: true, hovering extends reading time indefinitely.',
          btn: 'Start Physics Pause Lab'
        },
        manual: {
          title: 'Manual Dismissal',
          desc: 'Explicit interaction model showing close buttons for alerts that require acknowledgment.',
          hint: 'Forces close buttons, allowing users to actively clear the notification track.',
          msg: 'Illegal instruction injection detected, security protocol enforced cleanup.',
          btn: 'Manual Close Alert'
        },
        action: {
          title: 'JSX & Rich Actions',
          desc: 'Beyond strings: embed links, buttons, and custom layout logic directly into the feedback stream.',
          hint: 'Supports embedded interactive links that trigger business navigation on click.',
          msg: 'Document compiled successfully',
          btn: 'Pop Action Link'
        },
        comparison: {
          title: 'System Comparison (No Pause)',
          desc: 'A benchmark demo where pauseOnHover is disabled, forcing the notification to disappear regardless of focus.',
          hint: 'Comparison: Even when hovered, the countdown will continue to flow.',
          msg: 'Forced Flow Test: No matter how you hover, I will disappear in 3s.',
          btn: 'Trigger Non-pausable Toast'
        },
        stack: {
          btn: 'Trigger Pulse Stack'
        }
      },
      guide: {
        back: 'Back to List',
        title: 'Toast // Source Code',
        subtitle: '"A premium, physics-based notification system designed for modern C-end experiences. Precise temporal control meets hardware-accelerated fluid motion."',
        architecture: {
          engine: 'Experimental Engine',
          physics: 'Dynamics & Kinematics',
          logic: 'Core Logic Overview',
          logicDesc: 'Decoupled state management ensures notifications persist across navigation while maintaining pixel-perfect timing accuracy.'
        },
        sections: {
          physics: {
            title: '01. Physics Item Logic',
            desc: 'Handles hover-states, millisecond-perfect countdowns, and CSS animation synchronization.'
          },
          orchestration: {
            title: '02. State Orchestration',
            desc: 'Global context provider managing the lifecycle and property mapping of the notification queue.'
          },
          portal: {
            title: '03. Portal Infrastructure',
            desc: 'Renders the notification stack outside the main DOM tree to ensure consistent depth and layout.'
          },
          entry: {
            title: '04. Entry Terminal',
            desc: 'Unified exports for easy integration across the feature modules.'
          }
        }
      }
    }
  },
  footer: {
    desc: 'A knowledge sharing and learning platform that documents project experiences and provides reusable components, Hooks, and learning resources. Welcome to point out errors and suggestions for improvement!',
    resources: 'Resources',
    components: 'Components',
    hooks: 'Hooks',
    docs: 'Documentation',
    connect: 'Connect',
    rights: 'All rights reserved.',
    feedback: 'Welcome to point out errors and suggestions!'
  }
};

