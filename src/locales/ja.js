/**
 * Japanese translations
 * 日本語翻訳リソース
 */

export default {
  nav: {
    infra: 'インフラ',
    modules: 'モジュール',
    components: 'コンポーネント',
    blog: 'ブログ',
    studio: 'スタジオ',
    about: 'について',
    home: 'ホーム',
    logout: 'ログアウト',
    login: 'ログイン',
    skipToMain: 'メインコンテンツへスキップ',
    accountLogin: 'アカウントログイン'
  },
  blog: {
    description: '学習の記録、技術的洞察、ベストプラクティスを共有します。',
    search: '検索',
    searchPlaceholder: '記事を検索...',
    categories: 'カテゴリー',
    allCategories: 'すべての記事',
    recentPosts: '最近の投稿',
    latestPosts: '最新記事',
    categoryLabel: 'カテゴリー',
    searchLabel: '検索結果',
    loading: '読み込み中...',
    foundArticles: '{{count}} 件の記事が見つかりました',
    clearFilters: 'フィルターをクリア',
    gridView: 'グリッド表示',
    listView: 'リスト表示',
    noArticles: '記事が見つかりません',
    noArticlesHint: '検索キーワードを変更するか、別のカテゴリーを選択してください。',
    viewAll: 'すべての記事を見る',
    articleNotFound: '記事が見つからないか削除されました。',
    backToBlog: 'ブログに戻る',
    tagLabel: 'タグ',
    popularTags: '人気タグ',
    viewAllTags: 'すべてのタグ',
    allTags: 'すべてのタグ',
    tagsCount: '合計 {{count}} 個のタグ',
    tagArticles: '「{{tag}}」 tagged 記事',
    noMoreArticles: 'これ以上の記事はありません',
    publish: 'ブログを投稿',
    publishTitle: '新しい記事を投稿',
    publishSuccess: 'ブログが正常に投稿されました',
    publishError: '投稿に失敗しました。もう一度お試しください',
    titleLabel: '記事タイトル',
    titlePlaceholder: '魅力的なタイトルを入力...',
    categoryPlaceholder: 'カテゴリーを選択',
    summaryLabel: '概要',
    summaryPlaceholder: '簡単な概要を書く...',
    contentLabel: '本文 (Markdown)',
    contentPlaceholder: 'Markdownで考えを記述...',
    tagsPlaceholder: 'Enterキーでタグを追加...',
    saveDraft: '下書きを保存',
    publishNow: '今すぐ投稿',
    publishing: '投稿中...',
    fillRequired: 'タイトル、本文、カテゴリーを入力してください',
    publishSettings: 'ドキュメント設定',
    edit: '編集',
    preview: 'プレビュー',
    noContent: 'まだ内容が入力されていません'
  },
  common: {
    backHome: 'ホームに戻る',
    backToInfra: 'インフラに戻る',
    backToComponents: 'コンポーネントに戻る',
    goBack: '戻る',
    pageNotFound: 'ページが見つかりません',
    pageNotFoundDesc: 'お探しのページは存在しないか、移動された可能性があります。',
    technicalNarrative: '技術的説明',
    codeImplementation: 'コード実装',
    involvedFiles: '関連ファイル',
    implementationDetails: '実装詳細',
    viewDetails: '詳細を見る',
    viewSource: 'ソースを見る',
    viewDeepDive: '詳細分析を見る',
    comingSoon: '近日公開',
    notFound: '404 - ページが見つかりません',
    detailComingSoon: '詳細（近日公開）',
    exploreInfra: 'インフラエクスプローラー',
    selectModule: 'システムを選択して機能を探る',
    liveScenarios: 'ライブシナリオ',
    viewTheory: '実装原理を見る',
    exploreModules: '機能エクスプローラー',
    selectModuleToExplore: 'モジュールを選択してインタラクションパターンを見る',
    componentSource: 'コンポーネントソース',
    coreFeatures: 'コア機能',
    logicLayer: 'ロジック層',
    logicLayerDesc: '状態とインタラクションを処理するメインコンポーネント実装。',
    styleLayer: 'スタイル層',
    styleLayerDesc: 'スコープ付きスタイリングとアニメーションのCSS Modules。',
    errorBoundary: {
      title: 'エラーが発生しました',
      description: '予期しないエラーが発生しました。ページを再読み込みするか、ホームに戻ってください。',
      errorDetails: 'エラー詳細',
      reload: '再読み込み',
      backToHome: 'ホームに戻る'
    },
    aria: {
      mainNav: 'メインナビゲーション',
      openMenu: 'メニューを開く',
      closeMenu: 'メニューを閉じる',
      openSidebar: 'サイドバーを開く',
      closeSidebar: 'サイドバーを閉じる',
      gridView: 'グリッド表示',
      listView: 'リスト表示',
      close: '閉じる',
      closeNotification: '通知を閉じる'
    }
  },
  auth: {
    sessionExpired: 'ログインの有効期限が切れました。再度ログインしてください',
    login: {
      invalidEmail: '有効なメールアドレスを入力してください',
      codeSent: '確認コードがメールに送信されました',
      codeSendFailed: 'コード送信に失敗しました。ネットワークを確認してください',
      authSuccess: '認証成功、ようこそ',
      authFailed: '認証に失敗しました。認証情報を確認してください',
      loginAccess: 'ログインアクセス',
      loginDesc: 'Xander Labの全機能、ブログ管理、多次元データへのアクセスを取得。',
      passwordAuth: 'パスワード認証',
      codeAuth: '確認コード',
      getCode: 'コードを取得',
      login: 'ログイン',
      backToLobby: 'ロビーに戻る',
      techBlog: '技術ブログ'
    }
  },
  hero: {
    badge: 'v1.0.0 開発中',
    title: '共有',
    gradient: '学びと成長',
    desc: 'プロジェクトの実践経験を記録し、自作コンポーネント、Hooks、学習ノートを共有します。すべてのコードは完全なソースコード付きで直接再利用可能です。',
    performance: 'パフォーマンス'
  },
  features: {
    title: 'なぜ Xander Lab を作るのか？',
    desc: 'プロジェクト開発では、繰り返し発生する問題や要件に直面します。これらの実践経験を記録・整理することで、知識の復習と定着を助け、他の開発者にも参考を提供します。',
    composable: {
      title: 'すぐに使える',
      desc: 'すべてのコンポーネントとHooksは完全なソースコードを提供し、プロジェクトに直接コピーして使用できます。'
    },
    themable: {
      title: '学習リソース',
      desc: '新たに学んだ知識や技術ポイントを、実装思路とコードコメント付きで記録します。'
    },
    performant: {
      title: '実践志向',
      desc: 'すべての内容は実際のプロジェクト実践から来ており、理論ではなく検証済みのソリューションです。'
    }
  },
  infra: {
    title: 'インフラ',
    subtitle: 'コアシステム',
    anchored: {
      title: 'Anchored Overlay',
      tag: 'ポジショニングと物理学',
      desc: 'アンカーに対する浮動要素の位置決めを行う基盤システム。',
      phases: {
        theory: {
          title: 'I. 理論層（ポジショニング物理学）',
          desc: '「どこにあるか」の数学的基盤。',
          points: ['主軸と交差軸の定義', '配置セマンティクス (top/start/...)', 'Absolute vs Fixed の選択']
        },
        hook: {
          title: 'II. エンジン層 (useAnchorPosition)',
          desc: 'ResizeObserver、スクロールイベント、ダブルRAF処理を管理する低レベルフック。',
          points: ['スクロールとリサイズ追跡', 'ダブルRAF同期', 'Transformベースのパフォーマンス']
        },
        container: {
          title: 'III. 抽象層 (OverlayContainer)',
          desc: '「インタラクションモデル」をカプセル化するヘッドレス動作コンテナ。',
          points: ['Flip / Shift / Padding 戦略', 'フォーカストラップとバックドロップ管理', 'ARIA準拠セマンティクス']
        }
      },
      files: [
        { name: 'useAnchorPosition.ts', role: '計算エンジン' },
        { name: 'OverlayContainer.tsx', role: '動作ラッパー' },
        { name: 'PositioningUtils.ts', role: '数学ヘルパー' },
        { name: 'types.ts', role: 'インターフェース定義' }
      ]
    }
  },
  modules: {
    title: '機能モジュール',
    subtitle: 'UIパターン',
    popover: {
      title: 'ポップオーバー',
      tag: '基本インタラクション',
      desc: 'デフォルト配置とオフセットを持つ一般的な浮動コンテナ。'
    },
    dropdown: {
      title: 'ドロップダウンメニュー',
      tag: 'メニューインタラクション',
      desc: 'キーボードナビゲーション付きメニューセマンティクス。'
    },
    tooltip: {
      title: 'ツールチップ',
      tag: 'フィードバック',
      desc: 'ホバー/フォーカスでトリガーされる情報オーバーレイ。'
    },
    context: {
      title: 'コンテキストメニュー',
      tag: 'コンテキストインタラクション',
      desc: 'ポインターベースの相対位置決め。'
    },
    dragdrop: {
      title: 'ドラッグ＆ドロップ',
      tag: 'ドラッグインタラクション',
      desc: '高度なプレビューとヒントシステムを備えたカスタマイズ可能なドラッグ＆ドロップ。',
      phases: {
        theory: {
          title: 'I. エンジン層 (useDragDrop)',
          desc: 'ドラッグ＆ドロップインタラクションモデルの技術的基盤。',
          points: ['HTML5 Drag & Drop API統合', 'カスタムプレビュー要素管理', 'ドラッグ状態と有効性制御']
        },
        hook: {
          title: 'II. プレビュー層 (DragPreview)',
          desc: 'ドラッグ操作中の視覚フィードバックを処理。',
          points: ['透明ゴーストイメージ技術', '浮動DOM要素追跡', 'コントローラー駆動ヒントシステム']
        },
        container: {
          title: 'III. インタラクション層 (ドロップゾーン)',
          desc: '要素の受け入れと処理方法を定義。',
          points: ['柔軟なバリデーションロジック', 'ドロップヒントテキスト生成', '楽観的UI更新']
        }
      },
      files: [
        { name: 'useDragDrop.ts', role: 'コアインタラクションフック' },
        { name: 'DragDropSystem.jsx', role: '機能ショーケース' },
        { name: 'DraggableItem.tsx', role: '再利用可能コンポーネント' }
      ]
    }
  },
  components: {
    desc: 'アトミックコンポーネントライブラリを探索。',
    list: {
      atomDesc: '一貫性のあるUIを構築するためのアトミックコンポーネント。',
      shareMyComponents: 'コンポーネントを共有'
    },
    customSelect: {
      title: 'カスタムセレクト',
      desc: '境界検出とスクロール追跡をサポートするカスタムドロップダウンコンポーネント。',
      guideTitle: '実装ガイド',
      tag: 'スマートポジショニング',
      phases: {
        boundary: {
          title: 'I. 境界検出',
          desc: 'ビューポート境界を自動検出し、ドロップダウンの方向を調整して表示を確保。',
          points: ['上/下位置決めロジック', 'リアルタイムビューポート空間計算', '正確な測定のためのダブルRAF']
        },
        scroll: {
          title: 'II. スクロール追跡',
          desc: 'トリガー要素との整列を維持するためにスクロールイベントを継続的に監視。',
          points: ['ウィンドウとコンテナのスクロールリスナー', 'スクロール時の位置再計算', 'リサイズイベント処理']
        },
        interaction: {
          title: 'III. ユーザーインタラクション',
          desc: '適切な状態管理を備えた直感的なインタラクションパターンを提供。',
          points: ['外部クリックで閉じる', 'キーボードナビゲーションサポート', 'エラーステートの可視化']
        }
      },
      files: [
        { name: 'CustomSelect/index.jsx', role: 'メインコンポーネント' },
        { name: 'CustomSelect/index.module.css', role: 'コンポーネントスタイル' },
        { name: 'demo/demo.jsx', role: '使用例' }
      ],
      featureList: ['境界検出', 'スクロール認識', 'キーボードナビゲーション', '整列制御'],
      scenarios: {
        basic: {
          title: '基本使用',
          desc: 'カスタムスタイリング機能を備えた標準的な単一選択。'
        },
        alignment: {
          title: 'テキスト整列',
          desc: 'コンテキストに応じた左、中央、右のテキスト整列をサポート。'
        },
        states: {
          title: 'ステート',
          desc: 'エラーを含む異なるインタラクションステートの視覚フィードバック。'
        },
        demo: {
          status: {
            required: '必須フィールド',
            requiredDesc: '送信をクリックしてエラーをトリガー',
            requiredPlaceholder: '選択してください（必須）...',
            simulateSubmit: '送信をシミュレート',
            errorMsg: 'オプションを選択してください',
            optional: 'オプションフィールド',
            optionalDesc: '送信バリデーション無効',
            optionalPlaceholder: '選択してください（任意）...'
          }
        }
      }
    },
    toast: {
      title: 'Toast通知',
      desc: '物理ベースのインタラクションを備えたプレミアムフィードバックシステム。',
      tag: 'インタラクション',
      scenarios: {
        basic: {
          title: '基本使用（ミニマル）',
          desc: 'プログレスバーや閉じるボタンなしの純粋な通知ステート。',
          success: 'ステータス：コアロジック準備完了',
          error: 'エラー：リクエスト頻度制限超過',
          info: '更新：バージョン v2.4.0 追加',
          warning: '警告：ディスク空き容量不足',
          custom: 'カスタムスタイルをトリガー',
          customMsg: 'カスタムパープルファントムスタイル',
          success_btn: '成功（ミニマル）',
          error_btn: 'エラー（ミニマル）',
          info_btn: '情報（ミニマル）',
          warning_btn: '警告（ミニマル）'
        },
        physics: {
          title: '物理インタラクション（ホバーで一時停止）',
          desc: 'リアルタイム時間ロック：ホバーでカウントダウンをフリーズ。',
          hint: 'このモードでは、ホバーでタイマーがフリーズし、マウスを離すと再開します。',
          msg: '実験観察：pauseOnHover: true により、ホバーで読書時間を無制限に延長。',
          btn: '物理一時停止ラボを開始'
        },
        manual: {
          title: '手動閉じる',
          desc: '確認が必要なアラート用の閉じるボタンを表示する明示的インタラクションモデル。',
          hint: '閉じるボタンを強制表示し、ユーザーが通知トラックを積極的にクリアできるようにします。',
          msg: '不正な命令インジェクションを検出、セキュリティプロトコル実行済み。',
          btn: '手動閉じるアラートを表示'
        },
        action: {
          title: 'JSXとリッチアクション',
          desc: '文字列以上：リンク、ボタン、カスタムレイアウトロジックを直接埋め込み。',
          hint: 'クリック時にビジネスナビゲーションをトリガーするインタラクティブリンクをサポート。',
          msg: 'ドキュメントコンパイル成功',
          btn: 'アクションリンクを表示'
        },
        comparison: {
          title: 'システム比較（一時停止なし）',
          desc: 'pauseOnHoverが無効化されたベンチマークデモ。',
          hint: '比較：ホバーしてもカウントダウンは続行します。',
          msg: '強制フローテスト：どれだけホバーしても3秒後に消えます。',
          btn: '一時停止不可Toastをトリガー'
        },
        stack: {
          btn: 'パルススタックをトリガー'
        }
      },
      guide: {
        back: 'リストに戻る',
        title: 'Toast // ソースコード',
        subtitle: '「モダンCエンド体験のために設計されたプレミアム物理ベース通知システム。」',
        architecture: {
          engine: '実験的エンジン',
          physics: 'ダイナミクスとキネマティクス',
          logic: 'コアロジック概要',
          logicDesc: 'デカップリングされた状態管理により、ナビゲーション間で通知が持続します。'
        },
        sections: {
          physics: {
            title: '01. 物理アイテムロジック',
            desc: 'ホバー状態、ミリ秒単位のカウントダウン、CSSアニメーション同期を処理。'
          },
          orchestration: {
            title: '02. 状態オーケストレーション',
            desc: '通知キューのライフサイクルとプロパティマッピングを管理するグローバルContextプロバイダー。'
          },
          portal: {
            title: '03. Portalインフラストラクチャ',
            desc: 'メインDOMツリーの外側で通知スタックをレンダリング。'
          },
          entry: {
            title: '04. エントリーターミナル',
            desc: '機能モジュール間での簡単な統合のための統一エクスポート。'
          }
        }
      }
    },
    detail: {
      loading: 'コンポーネント詳細を読み込み中...',
      error: '読み込みに失敗したか、コンポーネントが存在しません。',
      loadingPage: 'ページを読み込み中...'
    },
    content: {
      architectureDeepDive: 'アーキテクチャ詳細分析',
      implementationOverview: '実装概要',
      implementationHint: 'このコンポーネントにはカスタムロジック層が含まれます。右上のボタンをクリックしてください。',
      understandTitle: 'このコンポーネントの仕組みを深く理解する',
      understandDesc: 'UIデモ以上。Context APIとカスタムHooksでこのインタラクションシステムをどのように構築したかをご覧ください。',
      viewGuide: '完全な実装ガイドを見る',
      sourceCode: 'コンポーネント実装ソースコード',
      sourceCodeDesc: '完全なファイル構造と実装リファレンス',
      coreLogic: 'コアロジック (Lib)',
      stylesDef: 'スタイル定義 (CSS)'
    },
    guide: {
      parsingArchitecture: 'アーキテクチャ詳細を解析中...',
      loadFailed: 'コンポーネントソースコードを読み込めません。',
      defaultDesc: 'このコンポーネントは動的サンドボックスエンジンで実装されており、完全なコンポーネントロジック層と環境ラッパー層を含みます。'
    },
    share: {
      header: {
        title: 'コンポーネントスタジオ',
        restartTour: 'チュートリアルを再開',
        tour: 'チュートリアル',
        publish: 'ライブラリに公開'
      },
      sidebar: {
        registerMeta: 'メタデータを登録',
        titleZh: '中国語タイトル',
        descLabel: 'コンポーネント説明 (CN/EN)',
        descZhPlaceholder: '中国語の説明...',
        testScenarios: 'テストシナリオ'
      },
      drawer: {
        logic: 'コアロジック (Logic)',
        env: '実行環境 (Env)',
        css: 'スタイル基盤 (Styles)',
        coreArchitecture: 'コアエンジニアリングアーキテクチャ',
        collapseConsole: 'コンソールを折りたたむ',
        viewArchitecture: 'ソースアーキテクチャを見る',
        wrapperHint: 'ラッパー例を取得',
        cssHint: 'CSSスタイル例を取得'
      },
      modals: {
        newFile: '新規ファイル',
        cancel: 'キャンセル',
        confirmCreate: '作成を確認',
        deleteConfirm: '削除確認',
        confirmDelete: '削除を確認',
        deleteWarning: 'コードアセットを完全に削除しようとしています：',
        deleteLoseWarning: '削除すると、ローカルでソースコード構造が失われます。強制実行しますか？',
        presetSamples: 'プリセットサンプルライブラリ',
        oneClickLoad: 'ワンクリックロード',
        helpIntro: 'これは開発ウィザード機能です。下のボタンをクリックすると、自動的に',
        helpMeta: 'この操作により、Toastコンポーネントの完全な基本情報（中英文名称、説明、バージョン）が入力されます。',
        helpScenario: 'この操作により、{ 成功 / 失敗 / 進行 } インタラクションメカニズムを含む完全なReact DOMシナリオがワンクリックで入力されます。',
        helpLogic: 'この操作により、ToastContext、ToastItem、ToastContainerの3つの相互依存アーキテクチャファイルが直接書き込まれます。',
        helpEnv: 'この操作により、<ToastProvider /> などの外部コンテキストノードが入力されます。',
        helpCss: 'この操作により、Toastの高パフォーマンス出入場アニメーションのCSS Keyframesが補完されます。',
        editScenario: 'テストシナリオ情報を編集',
        saveChanges: '変更を保存',
        chineseName: '中国語名',
        chineseNamePlaceholder: '中国語名を入力...',
        welcomeTitle: 'システムラボへようこそ',
        welcomeReject: '慣れているのでスキップ',
        startTour: 'チュートリアルを開始',
        welcomeDesc: 'システムアーキテクチャプールが初期空状態であり、Xander-Lab Workspaceへの初回訪問です。「4-in-1」ホットリロードサンドボックスに慣れるため、グローバル通知システム（Toast）の骨格を内蔵しました。30秒間スポットライトに従って体験しますか？',
        fileExtensionHint: '標準的なフロントエンド拡張子を使用することをお勧めします'
      }
    }
  },
  http: {
    errors: {
      badRequest: 'リクエストパラメータが無効です',
      unauthorized: 'セッションが期限切れです。再度ログインしてください',
      forbidden: 'この操作を行う権限がありません',
      notFound: 'リクエストされたリソースは存在しません',
      methodNotAllowed: 'リクエストメソッドは許可されていません',
      requestTimeout: 'リクエストがタイムアウトしました。後でもう一度お試しください',
      conflict: 'データの競合が発生しました。更新してやり直してください',
      unprocessable: 'リクエストデータの検証に失敗しました',
      tooManyRequests: 'リクエストが多すぎます。後でもう一度お試しください',
      internalError: '内部サーバーエラー',
      badGateway: '不正なゲートウェイ。後でもう一度お試しください',
      serviceUnavailable: 'サービスは一時的に利用できません',
      gatewayTimeout: 'ゲートウェイタイムアウト',
      bizDefault: '処理に失敗しました',
      invalidCredentials: 'ユーザー名またはパスワードが正しくありません',
      accountDisabled: 'アカウントが無効化されています',
      codeExpired: '確認コードの有効期限が切れました',
      dataNotFound: 'データが存在しません',
      noPermission: 'この操作を行う権限がありません',
      serverBusy: 'サーバーが混雑しています。後でもう一度お試しください',
      networkError: 'ネットワークリクエストに失敗しました。接続を確認してください',
      noRefreshToken: 'リフレッシュトークンがありません。再度ログインしてください',
      retryPrefix: '[HTTP] リトライ',
      retrySuffix: '遅延',
      cancelled: 'リクエストがキャンセルされました'
    }
  },
  footer: {
    desc: 'プロジェクト経験を記録し、再利用可能なコンポーネント、Hooks、学習リソースを提供する知識共有プラットフォーム。',
    resources: 'リソース',
    Infrastructure: 'インフラ',
    Modules: 'モジュール',
    components: 'コンポーネント',
    hooks: 'Hooks',
    docs: 'ドキュメント',
    connect: '接続',
    rights: '全著作権所有。',
    feedback: 'エラーや提案をお気軽にお知らせください！'
  }
};
