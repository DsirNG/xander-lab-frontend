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
    studio: 'Studio',
    about: 'About',
    home: 'Home',
    logout: 'Log Out',
    login: 'Log In',
    skipToMain: 'Skip to main content',
    accountLogin: 'Account Login'
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
    noMoreArticles: 'No more articles',
    publish: 'Publish Blog',
    publishTitle: 'Publish New Article',
    publishSuccess: 'Blog published successfully',
    publishError: 'Failed to publish, please try again',
    publishStatusUnknown: 'Publication is still being confirmed. Your draft was kept; please do not submit again.',
    titleLabel: 'Post Title',
    titlePlaceholder: 'Enter a compelling title...',
    categoryPlaceholder: 'Select Category',
    summaryLabel: 'Abstract',
    summaryPlaceholder: 'Write a brief summary...',
    contentLabel: 'Content (Markdown)',
    contentPlaceholder: 'Pour your thoughts here using Markdown...',
    tagsPlaceholder: 'Press Enter to add tags...',
    saveDraft: 'Save Draft',
    saveDraftSuccess: 'Draft saved on this device',
    saveDraftError: 'Could not save the draft. Check browser storage permissions.',
    publishNow: 'Publish Now',
    publishing: 'Publishing...',
    fillRequired: 'Please fill in title, content and category',
    publishSettings: 'Document Settings',
    edit: 'Edit',
    preview: 'Preview',
    noContent: 'No content yet',
    media: { insertImage: 'Insert image', dropImage: 'Drop or choose an image / GIF, then insert it at the cursor.', uploadingImage: 'Uploading', imageInserted: 'Image inserted into the article', imageUploadFailed: 'Could not upload the image. Try again.', invalidImage: 'Choose an image or GIF file', imageTooLarge: 'Images must be 10MB or smaller', altText: 'Image description', addToArticle: 'Insert into article', libraryTitle: 'Insert image', uploadImage: 'Upload image', uploadSuccess: 'Image added to your library', searchPlaceholder: 'Search image names', scopes: { recent: 'Recent', mine: 'My images', gif: 'GIF' }, emptyTitle: 'No images yet', emptyHint: 'Upload an image to save it in your private library', selectHint: 'Select an image to view its details', selectedCount: '{{count}} image selected', cancel: 'Cancel', insertAtCursor: 'Insert at cursor' },
    editor: { toolbar: 'Writing tools', addBlock: 'Add block', text: 'Text', h1: 'H1', h2: 'H2', todo: 'To-do', list: 'List', quote: 'Quote', code: 'Code', insertContent: 'Insert content', imageGif: 'Image / GIF', video: 'Video (coming soon)', divider: 'Divider', table: 'Table', codeBlock: 'Code block', quoteBlock: 'Quote block' },
    agent: {
      title: 'Blog Agent', back: 'Back to blog', headline: 'Turn an idea into a publishable article',
      description: 'Give the agent a topic or a diary entry. It researches, writes, and checks a complete knowledge article with traceable sources.',
      inputLabel: 'Your topic or diary entry', inputPlaceholder: 'For example: I have begun using AI to code faster, but I worry my understanding of the code is getting weaker…',
      inputType: 'Input type', audience: 'Audience', tone: 'Tone', defaultAudience: 'Readers curious about this topic', defaultTone: 'Clear, sincere, and practical',
      generate: 'Research and write', running: 'Researching and writing…', waiting: 'Waiting for your input', ready: 'Ready to review', failed: 'The agent could not finish this task', complete: 'Article is ready to review',
      workflow: 'Agent workflow', guardrail: 'Personal experience remains attributed to its author. External claims must have a traceable source and are never published automatically.',
      stages: { analyze: 'Frame the article', research: 'Research and verify', write: 'Write the full article', illustrate: 'Create knowledge visuals', review: 'Review before publishing' },
      stageDescriptions: { analyze: 'Finds the reader, point of view, and evidence gaps.', research: 'Uses web research to verify external claims.', write: 'Builds a complete Markdown knowledge article.', illustrate: 'Creates useful visuals and saves them to your library.', review: 'Checks evidence, clarity, and publish readiness.' },
      article: 'Generated article', toDraft: 'Open in editor', draftCreated: 'Draft created. You can now edit and publish it.', sources: 'Research sources', noSources: 'No external sources were retained for this article.', review: 'Editorial review', reviewPending: 'The review will appear when the agent completes its work.', inputRequired: 'Enter a topic or diary entry first.', contentFocus: 'Content focus', mustCover: 'Article backbone', relatedExpansion: 'Direct extensions', outOfScope: 'Not expanded', knowledgeGraph: 'Knowledge graph', illustrations: 'Knowledge visuals', illustrationStatuses: { running: 'Creating and saving visuals.', complete: 'Visuals were added to the article and your private library.', partial: 'Some visuals were created; the remaining ones can be added later.', failed: 'Visual generation failed, but the article is ready to review.', disabled: 'No image model is configured, so visuals were skipped.', none: 'The agent determined that this article does not need extra visuals.' },
      processing: 'Processing {{duration}}', processed: 'Processed {{duration}}', processedDone: 'Processed', processFailed: 'Processing failed', openPreview: 'Click to preview', previewEmpty: 'Select a generated blog to preview', untitled: 'Untitled article', newTask: 'New task', newConversation: 'New conversation', conversations: 'Conversations', noConversations: 'No previous conversations', restoring: 'Restoring agent task…', multiTurnHint: 'Describe another change and the agent will create a new article version.', revise: 'Update article', revisionComplete: 'Article updated for this turn', waitingForStage: 'Preparing the next stage…', inputLockedPlaceholder: 'The agent is working…', confirmPublish: 'Publish', viewArticle: 'View article', showMeta: 'Show research and review details', hideMeta: 'Hide research and review details'
    }
  },
  common: {
    backHome: 'Back to Home',
    backToInfra: 'Back to Infrastructure',
    backToComponents: 'Back to Components',
    goBack: 'Go Back',
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: 'The page you are looking for does not exist or has been moved.',
    technicalNarrative: 'Technical Narrative',
    codeImplementation: 'Code Implementation',
    involvedFiles: 'Involved Files',
    implementationDetails: 'Implementation Details',
    viewDetails: 'View Details',
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
    styleLayerDesc: 'CSS Modules for scoped styling and animations.',
    errorBoundary: {
      title: 'Something went wrong',
      description: 'An unexpected error occurred. You can try reloading the page or returning to the home page.',
      errorDetails: 'Error Details',
      reload: 'Reload',
      backToHome: 'Back to Home'
    },
    aria: {
      mainNav: 'Main navigation',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      openSidebar: 'Open sidebar',
      closeSidebar: 'Close sidebar',
      gridView: 'Grid view',
      listView: 'List view',
      close: 'Close',
      closeNotification: 'Close notification'
    }
  },
  auth: {
    sessionExpired: 'Session expired, please log in again',
    login: {
      invalidEmail: 'Please enter a valid email',
      codeSent: 'Verification code has been sent to your email',
      codeSendFailed: 'Failed to send verification code, please check your network',
      authSuccess: 'Authentication successful, welcome through the security gateway',
      authFailed: 'Authentication failed, please check your credentials',
      loginAccess: 'Login Access',
      loginDesc: 'Get access to Xander Lab full features, blog management, and multi-dimensional data.',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email address',
      codeLabel: 'Verification Code',
      codePlaceholder: '6-digit code',
      sendCode: 'Send Code',
      autoRegisterHint: 'New users will be automatically registered. By continuing, you agree to our terms.',
      submit: 'Sign In / Sign Up',
      accountLabel: 'Account',
      accountPlaceholder: 'Username or email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter your password',
      passwordAuth: 'Password',
      codeAuth: 'Verification Code',
      login: 'Log In',
      backToLobby: 'Back to Lobby',
      techBlog: 'Tech Blog'
    }
  },
  profile: {
    title: 'Personal Center',
    subtitle: 'Manage your account and automation workflows',
    open: 'Open personal center',
    account: 'Signed-in account',
    comingSoon: 'Coming soon',
    comingSoonHint: 'This module is being prepared. You can manage automated reminders with Scheduled Email for now.',
    nav: {
      account: 'Account',
      security: 'Security',
      notifications: 'Notifications',
      emailReminders: 'Scheduled Email',
      templates: 'Email Templates',
      history: 'Task History',
      apiKeys: 'API Keys',
      preferences: 'Preferences'
    },
    emailReminders: {
      title: 'Scheduled Email',
      description: 'Schedule emails and automate your outreach',
      createNew: 'New scheduled email',
      taskList: 'Scheduled task list',
      taskName: 'Task name',
      statusLabel: 'Status',
      actions: 'Actions',
      taskCount: '{{count}} tasks',
      filterAll: 'All statuses',
      searchPlaceholder: 'Search by task name or recipient',
      pageInfo: '{{from}}-{{to}} of {{total}}',
      prevPage: 'Previous page',
      nextPage: 'Next page',
      refresh: 'Refresh',
      loading: 'Loading email tasks…',
      loadError: 'Could not load tasks',
      retry: 'Try again',
      emptyTitle: 'No scheduled emails yet',
      emptyHint: 'Create a scheduled email, choose a delivery time, and write your message.',
      addTitle: 'New scheduled email',
      sideIntro: 'Create once and reach recipients on schedule.',
      senderHint: 'Messages are sent from the Xander Lab verification email account.',
      recipientEmail: 'Recipient email',
      recipientPlaceholder: 'name@example.com',
      scheduledAt: 'Delivery time',
      subject: 'Subject',
      subjectPlaceholder: 'For example: Remember tonight’s review',
      message: 'Your message',
      messagePlaceholder: 'Write what you would like to receive later…',
      messageHtmlPlaceholder: 'Write HTML, e.g. <p>Hello</p><strong>bold</strong>',
      previewTitle: 'Email preview',
      safePreview: 'Preview',
      previewSubject: 'Your email subject appears here',
      previewMessage: 'Pick a template to preview the real email layout.',
      contentType: 'Content format',
      contentTypes: {
        plain: 'Plain text',
        html: 'HTML'
      },
      template: 'Email template',
      templates: {
        classic: 'Classic',
        minimal: 'Minimal',
        card: 'Reminder card',
        notice: 'Notice'
      },
      applyTemplateStarter: 'Insert HTML sample',
      plainContentHint: 'Plain text is wrapped in the selected template; line breaks are kept.',
      htmlContentHint: 'HTML is rendered in the selected template; scripts and risky tags are filtered.',
      plainPreviewBadge: 'Plain text',
      htmlPreviewBadge: 'HTML render',
      htmlSafetyHint: 'Supports plain text and HTML, with multiple layout templates.',
      create: 'Create scheduled email',
      createAndSave: 'Create & save',
      creating: 'Creating…',
      created: 'Scheduled email created',
      statusUpdated: 'Task status updated',
      deleted: 'Scheduled email deleted',
      fieldsRequired: 'Complete the recipient, time, subject, and message',
      invalidEmail: 'Enter a valid recipient email',
      futureTimeRequired: 'The delivery time must be in the future',
      sendTimeRequired: 'Choose a send time',
      intervalDaysInvalid: 'Custom interval must be between 1 and 365 days',
      errorLabel: 'Failure reason',
      pause: 'Pause',
      resume: 'Resume',
      delete: 'Delete',
      confirmDelete: 'Confirm delete',
      cancelDelete: 'Cancel',
      tipTitle: 'Tip',
      tipBody: 'Scheduled emails send automatically at the set time. Double-check the recipient and content.',
      viewHelp: 'View help docs',
      helpTitle: 'Help',
      sectionRecipient: 'Recipient',
      sectionContent: 'Email content',
      sectionSchedule: 'Send settings',
      timezone: 'Timezone',
      frequency: 'Frequency',
      sendTime: 'Send time',
      weekday: 'Day of week',
      monthDayLabel: 'Day of month',
      monthDay: 'Day {{day}}',
      intervalDays: 'Every N days',
      scheduleColumn: 'Schedule',
      nextRun: 'Next {{time}}',
      notSet: 'Not set',
      overviewTitle: 'Task overview',
      scheduleDaily: 'Daily at {{time}}',
      scheduleWeekly: 'Every {{weekday}} at {{time}}',
      scheduleMonthly: 'Monthly on day {{day}} at {{time}}',
      scheduleCustom: 'Every {{days}} days at {{time}}',
      frequencies: {
        once: 'Once',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        custom: 'Custom'
      },
      weekdays: {
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat',
        7: 'Sun'
      },
      stats: {
        total: 'Scheduled tasks',
        totalHint: 'All tasks',
        active: 'Active',
        activeHint: 'Running',
        sent: 'Sent',
        sentHint: 'Total emails',
        pending: 'Pending',
        pendingHint: 'Upcoming'
      },
      features: {
        flexibleTime: 'Flexible timing (once / specific time)',
        templates: 'Email template support',
        variables: 'Smart variables reserved (e.g. {name}, {date})',
        stats: 'Live send statistics'
      },
      help: {
        create: 'How to create a scheduled email',
        templates: 'Template setup',
        variables: 'Using variables',
        faq: 'FAQ'
      },
      status: {
        pending: 'Active',
        paused: 'Paused',
        sending: 'Sending',
        sent: 'Sent',
        failed: 'Failed'
      }
    }
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
    desc: 'Explore our atomic component library.',
    list: {
      atomDesc: 'Atomic components for building consistent interfaces.',
      shareMyComponents: 'Share My Components'
    },
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
    },
    detail: {
      loading: 'Loading component details...',
      error: 'Failed to load or component does not exist.',
      loadingPage: 'Loading page...'
    },
    content: {
      architectureDeepDive: 'Architecture Deep Dive',
      implementationOverview: 'Implementation Overview',
      implementationHint: 'This component includes a custom logic layer. Click the button in the top right to view the full architecture analysis.',
      understandTitle: 'Deeply understand this component\'s mechanism',
      understandDesc: 'More than just a UI demo. See how we built this interaction system using the Context API and custom Hooks.',
      viewGuide: 'View Full Implementation Guide',
      sourceCode: 'Component Source Code',
      sourceCodeDesc: 'Complete file structure and implementation reference',
      coreLogic: 'Core Logic (Lib)',
      stylesDef: 'Style Definitions (CSS)'
    },
    guide: {
      parsingArchitecture: 'Parsing architecture details...',
      loadFailed: 'Unable to load component source code.',
      defaultDesc: 'This component is implemented through a dynamic sandbox engine, including complete component logic layer and environment wrapper layer.'
    },
    share: {
      header: {
        title: 'Component Studio',
        restartTour: 'Restart Tutorial',
        tour: 'Tutorial',
        publish: 'Publish to Library'
      },
      sidebar: {
        registerMeta: 'Register Metadata',
        titleZh: 'Chinese Title',
        descLabel: 'Component Description (CN/EN)',
        descZhPlaceholder: 'Chinese description...',
        testScenarios: 'Test Scenarios'
      },
      drawer: {
        logic: 'Core Logic (Logic)',
        env: 'Execution Environment (Env)',
        css: 'Style Foundation (Styles)',
        coreArchitecture: 'Core Engineering Architecture',
        collapseConsole: 'Collapse Console',
        viewArchitecture: 'View Source Architecture',
        wrapperHint: 'Get wrapper example',
        cssHint: 'Get CSS style example'
      },
      modals: {
        newFile: 'New File',
        cancel: 'Cancel',
        confirmCreate: 'Confirm Create',
        deleteConfirm: 'Delete Confirmation',
        confirmDelete: 'Confirm Delete',
        deleteWarning: 'You are about to permanently delete a code asset:',
        deleteLoseWarning: 'Once deleted, the source code structure will be lost locally. Do you want to force overwrite?',
        presetSamples: 'Preset Sample Library',
        oneClickLoad: 'One-Click Load',
        helpIntro: 'This is a development wizard feature. By clicking the button below, we will automatically fill in the standard engineering test data for',
        helpMeta: 'This will fill in the complete basic information for the Toast component (Chinese/English names, description, and version), skipping tedious manual entry.',
        helpScenario: 'This will one-click fill a complete React DOM scenario that includes { success / failure / progress flow } interaction mechanisms.',
        helpLogic: 'This will directly write three core architecture files with mutual dependencies: ToastContext, ToastItem, and ToastContainer.',
        helpEnv: 'This will fill in the full outer context nodes such as <ToastProvider />, allowing your demo code to properly take over global routing or top-level dependencies.',
        helpCss: 'This will supplement the CSS Keyframes and other base rendering data for high-performance Toast entry and exit animations.',
        editScenario: 'Edit Test Scenario Info',
        saveChanges: 'Save Changes',
        chineseName: 'Chinese Name',
        chineseNamePlaceholder: 'Enter Chinese name...',
        welcomeTitle: 'Welcome to System Lab',
        welcomeReject: 'I\'m familiar, decline',
        startTour: 'Start Tutorial',
        welcomeDesc: 'Detected that the system architecture pool is in its initial empty state, and this is your first time entering Xander-Lab Workspace. To help you get familiar with this "4-in-1" hot-reload sandbox, we have built in a complete skeleton of the global notification system (Toast). Would you like to spend 30 seconds of real time following the spotlight to experience how to assemble, compile, and launch components?',
        fileExtensionHint: 'It is recommended to use standard frontend extensions such as'
      }
    }
  },
  http: {
    errors: {
      badRequest: 'Invalid request parameters',
      unauthorized: 'Session expired, please log in again',
      forbidden: 'You do not have permission to perform this action',
      notFound: 'The requested resource does not exist',
      methodNotAllowed: 'Request method is not allowed',
      requestTimeout: 'Request timed out, please try again later',
      conflict: 'Data conflict, please refresh and try again',
      unprocessable: 'Request data validation failed',
      tooManyRequests: 'Too many requests, please try again later',
      internalError: 'Internal server error',
      badGateway: 'Bad gateway, please try again later',
      serviceUnavailable: 'Service temporarily unavailable',
      gatewayTimeout: 'Gateway timeout, please try again later',
      bizDefault: 'Business processing failed',
      invalidCredentials: 'Invalid username or password',
      accountDisabled: 'Account has been disabled',
      codeExpired: 'Verification code has expired',
      dataNotFound: 'Data does not exist',
      noPermission: 'No permission for this operation',
      serverBusy: 'Server is busy, please try again later',
      networkError: 'Network request failed, please check your connection',
      noRefreshToken: 'No refresh token, please log in again',
      retryPrefix: '[HTTP] Retry',
      retrySuffix: 'delay',
      cancelled: 'Request cancelled'
    }
  },
  footer: {
    desc: 'A knowledge sharing and learning platform that documents project experiences and provides reusable components, Hooks, and learning resources. Welcome to point out errors and suggestions for improvement!',
    resources: 'Resources',
    Infrastructure: 'Infrastructure',
    Modules: 'Modules',
    components: 'Components',
    hooks: 'Hooks',
    docs: 'Documentation',
    connect: 'Connect',
    rights: 'All rights reserved.',
    feedback: 'Welcome to point out errors and suggestions!'
  }
};

