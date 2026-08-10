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
    plans: '定期投稿',
    img2three: '画像→3D',
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
    pureReading: '集中読書',
    exitPureReading: '集中読書を終了',
    pureReadingHint: '集中読書モード (Escキーで終了)',
    tagLabel: 'タグ',
    popularTags: '人気タグ',
    viewAllTags: 'すべてのタグ',
    allTags: 'すべてのタグ',
    tagsCount: '合計 {{count}} 個のタグ',
    tagArticles: '「{{tag}}」 tagged 記事',
    noMoreArticles: 'これ以上の記事はありません',
    publish: 'ブログを投稿',
    publishTitle: '新しい記事を投稿',
    editTitle: '記事を編集',
    backToManage: 'ブログ管理に戻る',
    publishSuccess: 'ブログが正常に投稿されました',
    publishError: '投稿に失敗しました。もう一度お試しください',
    publishStatusUnknown: '投稿状況を確認中です。下書きは保持されていますので、再送信しないでください。',
    titleLabel: '記事タイトル',
    titlePlaceholder: '魅力的なタイトルを入力...',
    categoryPlaceholder: 'カテゴリーを選択',
    summaryLabel: '概要',
    summaryPlaceholder: '簡単な概要を書く...',
    contentLabel: '本文 (Markdown)',
    contentPlaceholder: 'Markdownで考えを記述...',
    tagsPlaceholder: 'Enterキーでタグを追加...',
    saveDraft: '下書きを保存',
    saveDraftSuccess: 'この端末に下書きを保存しました',
    saveDraftServerSuccess: '下書きを保存しました',
    saveDraftLocalFallback: 'サーバーへの保存に失敗しました。この端末に下書きを保持しています',
    saveDraftError: '下書きを保存できませんでした。ブラウザの保存権限を確認してください。',
    publishNow: '今すぐ投稿',
    publishing: '投稿中...',
    fillRequired: 'タイトル、本文、カテゴリーを入力してください',
    publishSettings: 'ドキュメント設定',
    edit: '編集',
    preview: 'プレビュー',
    noContent: 'まだ内容が入力されていません',
    media: { insertImage: '画像を挿入', dropImage: '画像・GIF をドロップまたは選択し、カーソル位置に挿入します。', uploadingImage: 'アップロード中', imageInserted: '本文に画像を挿入しました', imageUploadFailed: '画像をアップロードできませんでした。もう一度お試しください。', invalidImage: '画像または GIF ファイルを選択してください', imageTooLarge: '画像は 10MB 以下にしてください', altText: '画像の説明', addToArticle: '本文に挿入', libraryTitle: '画像を挿入', uploadImage: '画像をアップロード', uploadSuccess: '画像をライブラリに追加しました', searchPlaceholder: '画像名を検索', scopes: { recent: '最近', mine: '自分の画像', gif: 'GIF' }, emptyTitle: '画像がありません', emptyHint: '画像をアップロードすると個人ライブラリに保存されます', selectHint: '画像を選択して詳細を表示', selectedCount: '{{count}} 枚選択', cancel: 'キャンセル', insertAtCursor: '現在位置に挿入' },
    editor: { toolbar: '執筆ツール', addBlock: 'ブロックを追加', text: 'テキスト', h1: 'H1', h2: 'H2', todo: 'To-do', list: 'リスト', quote: '引用', code: 'コード', insertContent: 'コンテンツを挿入', imageGif: '画像 / GIF', video: '動画（近日対応）', divider: '区切り線', table: '表', codeBlock: 'コードブロック', quoteBlock: '引用ブロック' },
    agent: {
      title: 'ブログエージェント', back: 'ブログに戻る', headline: 'アイデアを公開可能な記事に', description: 'テーマまたは日記を入力してください。エージェントが調査、執筆、検証を行い、出典付きの記事を作成します。', inputLabel: 'テーマまたは日記', inputPlaceholder: '考え、経験、気づきを入力してください…', inputType: '入力タイプ', audience: '読者', tone: '文体', defaultAudience: 'このテーマに関心のある読者', defaultTone: '明快で誠実、実用的', generate: '調査して執筆', running: '調査・執筆中…', waiting: '入力待ち', ready: 'レビュー待ち', failed: 'エージェントはこのタスクを完了できませんでした', complete: '記事をレビューできます', workflow: 'エージェントの流れ', guardrail: '個人の経験は著者の経験として扱います。外部の主張には追跡可能な出典が必要で、自動公開はされません。', stages: { analyze: '記事の方向を決める', research: '調査と検証', write: '記事を執筆', illustrate: '知識画像を生成', review: '公開前レビュー' }, stageDescriptions: { analyze: '読者、視点、情報不足を整理します。', research: '外部の主張をウェブで検証します。', write: '完全な Markdown 記事を作成します。', illustrate: '必要な画像を生成してライブラリに保存します。', review: '根拠と明瞭さを確認します。' }, article: '生成された記事', toDraft: 'エディターで開く', draftCreated: '下書きを作成しました。編集して公開できます。', sources: '調査ソース', noSources: '外部ソースは保存されていません。', review: '編集レビュー', reviewPending: '完了後にレビューが表示されます。', inputRequired: 'まずテーマまたは日記を入力してください。', contentFocus: '内容の範囲', mustCover: '記事の主題', relatedExpansion: '直接の補足', outOfScope: '追加しない内容', knowledgeGraph: '知識関係グラフ', illustrations: '知識画像', illustrationStatuses: { running: '画像を生成中です。', complete: '画像を記事と個人ライブラリに追加しました。', partial: '一部の画像を生成しました。', failed: '画像生成に失敗しましたが、記事は確認できます。', disabled: '画像モデルが設定されていません。', none: '追加画像は不要と判断しました。' },
      processing: '処理中 {{duration}}', processed: '処理済み {{duration}}', processedDone: '処理済み', processFailed: '処理に失敗しました', openPreview: 'クリックしてプレビュー', previewEmpty: '生成記事を選択してプレビュー', untitled: '無題の記事', newTask: '新しいタスク', newConversation: '新しい会話', conversations: '会話一覧', noConversations: '履歴はありません', restoring: 'エージェントタスクを復元中…', multiTurnHint: '変更内容を入力すると新しい記事バージョンを作成します。', revise: '記事を更新', revisionComplete: '記事を更新しました', waitingForStage: '次の段階を準備中…', inputLockedPlaceholder: 'エージェントが処理中です…', confirmPublish: '公開する', viewArticle: '記事を見る', showMeta: '調査とレビューを表示', hideMeta: '調査とレビューを隠す'
    }
  },
  blogPlans: {
    title: '定期投稿',
    subtitle: 'テーマと毎日の実行時刻を設定し、記事の生成・審査・公開を自動化します',
    create: 'プラン作成',
    createTitle: '新規定期投稿プラン',
    editTitle: 'プランを編集',
    loadFailed: 'プランの読み込みに失敗しました',
    saveFailed: '保存に失敗しました。再試行してください',
    created: 'プランを作成しました',
    updated: 'プランを更新しました',
    deleted: 'プランを削除しました',
    deleteFailed: '削除に失敗しました。再試行してください',
    deleteConfirm: 'プラン「{{topic}}」を削除しますか？この操作は取り消せません。',
    actionFailed: '操作に失敗しました。再試行してください',
    triggered: '実行を開始しました。記事を生成中です',
    triggerFailed: '実行に失敗しました。プランの状態を確認してください',
    paused: 'プランを一時停止しました',
    resumed: 'プランを再開しました',
    cancelled: 'プランをキャンセルしました',
    empty: '定期投稿プランはありません',
    emptyHint: '右上の「プラン作成」からテーマと毎日の実行時刻を設定してください',
    topic: '記事のテーマ',
    topicPlaceholder: '例：Kubernetes 入門ガイド',
    topicRequired: '記事のテーマを入力してください',
    triggerTime: '毎日の実行時刻',
    timeInvalid: '実行時刻は HH:mm 形式にしてください',
    timezone: 'タイムゾーン',
    audience: '対象読者',
    audiencePlaceholder: '例：Docker に興味のある開発者（任意）',
    tone: '文体',
    tonePlaceholder: '例：明快で親しみやすく実用的（任意）',
    syncCsdn: '生成後に CSDN にも公開する',
    yes: 'はい',
    no: 'いいえ',
    nextRun: '次回実行',
    triggerNow: '今すぐ実行',
    pause: '一時停止',
    resume: '再開',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    runHistory: '実行履歴',
    noRuns: '実行履歴はありません',
    time: '実行時刻',
    status: '状態',
    result: '結果',
    viewPost: '記事を見る',
    statusActive: '実行中',
    statusRunning: '処理中',
    statusPaused: '一時停止中',
    statusCancelled: 'キャンセル済み',
    detail: '詳細',
    viewDetail: '詳細を見る',
    totalRuns: '合計 {{count}} 件',
    notFound: 'プランが見つからないか削除されました',
    backToList: '一覧に戻る',
    lastError: '最新のエラー',
    lastRunAt: '最近の実行',
    runDetailTitle: '実行記録の詳細',
    triggerType: 'トリガー',
    triggerAuto: '自動',
    triggerManual: '手動',
    scheduledAt: '予定時刻',
    startedAt: '開始時刻',
    finishedAt: '終了時刻',
    agentTaskId: 'エージェントタスク ID',
    localPost: 'ローカル記事',
    reviewResult: '審査結果',
    reviewPassed: '合格',
    reviewRejected: '不合格',
    reviewReason: '不合格理由',
    csdnExternalId: 'CSDN 外部 ID',
    csdnErrorCode: 'CSDN エラーコード',
    csdnLink: 'CSDN リンク',
    error: 'エラー',
    runStatus: {
      GENERATING: '生成中',
      REVIEWING: '審査中',
      PUBLISHING: '公開中',
      SUCCEEDED: '成功',
      FAILED: '失敗',
      REVIEW_REJECTED: '審査不合格'
    }
  },
  notifications: {
    title: 'お知らせ',
    empty: 'お知らせはありません',
    loading: '読み込み中…',
    markAll: 'すべて既読にする',
    markedAll: 'すべて既読にしました',
    viewPlans: '定期投稿プランを見る'
  },
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    pagination: {
      pageInfo: '{{from}}-{{to}} / 全 {{total}} 件',
      pageSizeOption: '{{size}} 件/ページ',
      prevPage: '前へ',
      nextPage: '次へ'
    },
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
    codeBlock: {
      showCode: 'コードを表示',
      showPreview: 'プレビュー',
      copy: 'コードをコピー',
      copied: 'コピーしました',
      previewFrame: '{{language}} プレビュー',
    },
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
      emailLabel: 'メールアドレス',
      emailPlaceholder: 'メールアドレスを入力',
      codeLabel: '確認コード',
      codePlaceholder: '6桁のコード',
      sendCode: 'コードを送信',
      autoRegisterHint: '新規ユーザーは自動的に登録されます。続行することで、利用規約に同意したものとみなされます。',
      submit: 'ログイン / 登録',
      accountLabel: 'アカウント',
      accountPlaceholder: 'ユーザー名 / メール',
      passwordLabel: 'パスワード',
      passwordPlaceholder: 'パスワードを入力',
      passwordAuth: 'パスワード',
      codeAuth: '確認コード',
      login: 'ログイン',
      backToLobby: 'ロビーに戻る',
      techBlog: '技術ブログ'
    }
  },
  workspace: {
    title: 'ワークスペース',
    subtitle: '予約投稿、画像→3D、スタジオ、ブログ管理、予約メールなど、自動化・作成ツールを一元管理します。',
    settings: '個人設定',
  },
  profile: {
    title: '個人センター',
    subtitle: 'アカウントと自動化フローを管理',
    open: '個人センターを開く',
    account: 'ログイン中のアカウント',
    loading: '個人センターを読み込み中…',
    comingSoon: '近日公開',
    comingSoonHint: 'このモジュールは準備中です。機能ツールはワークスペースからご利用ください。',
    logoutConfirmTitle: 'ログアウト',
    logoutConfirmMessage: 'このアカウントからログアウトしてもよろしいですか？',
    nav: {
      account: 'アカウント情報',
      security: 'セキュリティ',
      notifications: '通知設定',
      blogManage: 'ブログ管理',
      emailReminders: '予約メール',
      templates: 'メールテンプレート',
      history: 'タスク履歴',
      apiKeys: 'API キー',
      preferences: '環境設定',
      mcp: 'MCP 認証'
    },
    blogManage: {
      title: 'ブログ管理',
      description: '記事の編集、下書き、公開、ゴミ箱を管理',
      createNew: '新しい記事',
      tabs: { all: 'すべて', published: '公開済み', draft: '下書き', trash: 'ゴミ箱' },
      searchPlaceholder: 'タイトルまたは概要で検索',
      loading: '記事を読み込み中…',
      loadError: '記事の読み込みに失敗しました',
      retry: '再読み込み',
      emptyTitle: '記事がありません',
      emptyHint: 'ここまたはブログホームから新しい記事を作成してください。',
      emptyTrash: 'ゴミ箱は空です',
      emptyTrashHint: '削除した記事はここに表示されます。',
      untitled: '無題',
      status: { draft: '下書き', published: '公開済み', trash: 'ゴミ箱' },
      actions: { edit: '編集', publish: '公開', unpublish: '下書きに戻す', trash: 'ゴミ箱へ', restore: '下書きとして復元', permanentDelete: '完全に削除', view: '表示', syncCsdn: 'CSDN へ同期' },
      csdn: {
        dialogTitle: 'CSDN へ記事を同期',
        syncing: 'CSDN へ投稿中...',
        checking: 'CSDN 認証状態を確認中...',
        scanHint: 'スキャンして認証してください。ログイン後、記事が自動同期されます。',
        synced: 'CSDN へ同期完了',
        viewPost: 'CSDN 記事を表示',
        syncFailed: 'この記事を CSDN に同期できません',
        authorizationFailed: 'CSDN 認証を開始できません',
        qrAlt: 'CSDN ログイン QR コード'
      },
      confirmTrashTitle: 'ゴミ箱へ移動',
      confirmTrashMessage: '「{{title}}」をゴミ箱に移動しますか？後で復元できます。',
      confirmPermanentTitle: '完全に削除',
      confirmPermanentMessage: '「{{title}}」を完全に削除しますか？この操作は取り消せません。',
      trashed: 'ゴミ箱に移動しました',
      permanentlyDeleted: '完全に削除しました',
      restored: '下書きとして復元しました',
      published: '公開しました',
      unpublished: '下書きに戻しました',
      pageInfo: '{{from}}-{{to}} / {{total}} 件',
      pageSizeOption: '1ページ {{size}} 件',
      prevPage: '前へ',
      nextPage: '次へ'
    },
    mcp: {
      title: 'MCP 認証',
      description: 'MCP クライアントを認証し、ブログ記事の作成・読み取り・更新・公開を許可します。',
      checking: '認証状態を確認中...',
      authorized: '認証済み',
      unavailable: 'MCP サーバー利用不可',
      notAuthorized: '未認証',
      authorizedHint: 'MCP クライアントでブログツールを利用できます。',
      notAuthorizedHint: 'MCP ツールを使用する前に、ブラウザでワンタイム認証を完了してください。',
      authorize: 'MCP を認証',
      endpointsTitle: 'MCP 接続 URL',
      blogEndpoint: 'ブログ MCP',
      csdnEndpoint: 'CSDN MCP',
      dualEndpoint: '両端公開 MCP',
      consentTitle: 'MCP クライアントを認証',
      consentDescription: 'クライアント「{{client}}」が次の権限を要求しています。このアカウントの所有コンテンツのみ利用できます。',
      consentApprove: '許可する',
      consentDeny: '拒否',
      consentLoadFailed: 'MCP 認証リクエストを読み込めません',
      consentFailed: 'MCP 認証に失敗しました',
      clientsTitle: '認証済み MCP クライアント',
      revokeClient: 'クライアントのアクセスを取り消す',
      clientRevoked: 'クライアントのアクセスを取り消しました',
      clientRevokeFailed: 'クライアントのアクセスを取り消せません',
      endpointLabel: 'MCP エンドポイント',
      copyEndpoint: 'エンドポイントをコピー',
      endpointCopied: 'MCP エンドポイントをコピーしました',
      copyFailed: 'MCP エンドポイントのコピーに失敗しました'
    },
    csdn: {
      title: 'CSDN 同期設定',
      description: 'CSDN アカウントを連携すると、記事の一括・予約投稿が可能になります。',
      authorized: 'CSDN 連携済み',
      checking: '接続状態を確認中...',
      generatingQr: 'CSDN ログイン QR コードを生成中...',
      startFailed: 'CSDN 認証を開始できません',
      disconnected: 'CSDN 連携解除',
      disconnectFailed: 'CSDN 連携解除に失敗しました',
      qrAlt: 'CSDN ログイン QR コード',
      scanHint: 'CSDN アプリまたは WeChat でスキャンしてください。QR コードはまもなく期限切れになります。',
      waiting: '認証待ち中',
      expired: 'QR コードの有効期限が切れました。もう一度お試しください。',
      queued: '待機中',
      queuePosition: '現在 {{position}} 番目です',
      estimatedWait: '推定待ち時間：約 {{wait}} 秒',
      connect: 'CSDN に連携',
      disconnect: '連携解除',
      unavailable: 'CSDN 認証サービスは利用できません'
    },
    emailReminders: {
      title: '予約メール',
      description: 'メールの予約送信を設定し、メッセージ配信を自動化',
      createNew: '予約メールを作成',
      taskList: '予約タスク一覧',
      taskName: 'タスク名',
      statusLabel: '状態',
      actions: '操作',
      taskCount: '{{count}} 件のタスク',
      filterAll: 'すべての状態',
      searchPlaceholder: 'タスク名または宛先で検索',
      pageInfo: '{{from}}-{{to}} / {{total}} 件',
      pageSizeOption: '{{size}} 件/ページ',
      prevPage: '前のページ',
      nextPage: '次のページ',
      refresh: '更新',
      loading: 'メールタスクを読み込み中…',
      loadError: 'タスクを読み込めませんでした',
      retry: '再読み込み',
      emptyTitle: '予約メールはまだありません',
      emptyHint: '予約メールを作成し、送信時刻と内容を設定してください。',
      addTitle: '予約メールを作成',
      sideIntro: '一度作成すれば、予定どおりに宛先へ届きます。',
      senderHint: 'Xander Lab の認証メールアカウントから送信されます。',
      recipientEmail: '送信先メール',
      recipientPlaceholder: 'name@example.com',
      scheduledAt: '送信時刻',
      subject: '件名',
      subjectPlaceholder: '例：今夜の振り返りを忘れずに',
      message: '伝えたいこと',
      messagePlaceholder: 'あとで受け取りたいメッセージを入力…',
      messageHtmlPlaceholder: 'HTML を入力できます。例：<p>こんにちは</p><strong>太字</strong>',
      previewTitle: 'メールプレビュー',
      safePreview: 'プレビュー',
      previewSubject: 'メールの件名がここに表示されます',
      previewMessage: 'テンプレートを選ぶと実際のレイアウトでプレビューされます。',
      contentType: 'コンテンツ形式',
      contentTypes: {
        plain: 'プレーンテキスト',
        html: 'HTML'
      },
      template: 'メールテンプレート',
      templates: {
        classic: '夜明けの便箋',
        minimal: '余白の紙',
        card: '夕暮れリマインダー',
        notice: '青磁の通知'
      },
      templateSubjects: {
        classic: '未来への手紙',
        minimal: '今日のリマインダー',
        card: '時間リマインダー',
        notice: '重要なお知らせ'
      },
      selectTemplate: 'テンプレートを選択',
      templatePickerTitle: 'メールテンプレートを選択',
      templatePickerHint: '選択すると本文に HTML が挿入されます。選ばなければプレーンテキストのままです。',
      useThisTemplate: '使用',
      clearToPlain: 'プレーンテキストに戻す',
      applyTemplateStarter: 'HTML サンプルを挿入',
      messageInputHint: '自由に入力できます。カスタム HTML も可。「テンプレートを選択」で版面を適用します。',
      plainContentHint: '自由入力。カスタム HTML 対応。',
      htmlContentHint: '「{{template}}」レイアウトを使用。本文は HTML として送信されます。',
      plainPreviewBadge: '本文',
      htmlPreviewBadge: 'HTML',
      customPreviewBadge: 'カスタム',
      htmlSafetyHint: 'カスタム HTML 対応。テンプレートは任意です。',
      create: '予約メールを作成',
      createAndSave: '作成して保存',
      creating: '作成中…',
      created: '予約メールを作成しました',
      statusUpdated: 'タスクの状態を更新しました',
      deleted: '予約メールを削除しました',
      fieldsRequired: '送信先、時刻、件名、メッセージをすべて入力してください',
      invalidEmail: '有効なメールアドレスを入力してください',
      futureTimeRequired: '送信時刻は現在より後に設定してください',
      sendTimeRequired: '送信時刻を設定してください',
      intervalDaysInvalid: 'カスタム間隔は 1〜365 日で指定してください',
      errorLabel: '失敗理由',
      pause: '一時停止',
      resume: '再開',
      delete: '削除',
      confirmDelete: '削除を確定',
      confirmDeleteTitle: '予約メールを削除',
      confirmDeleteMessage: '「{{name}}」を削除しますか？この操作は取り消せません。',
      cancelDelete: 'キャンセル',
      tipTitle: 'ヒント',
      tipBody: '予約メールは設定時刻になると自動送信されます。宛先と内容を確認してください。',
      viewHelp: 'ヘルプを見る',
      helpTitle: '使い方',
      sectionRecipient: '宛先',
      sectionContent: 'メール内容',
      sectionSchedule: '送信設定',
      timezone: 'タイムゾーン',
      frequency: '送信頻度',
      sendTime: '送信時刻',
      weekday: '曜日',
      monthDayLabel: '毎月の日付',
      monthDay: '{{day}} 日',
      intervalDays: '間隔日数',
      scheduleColumn: '送信計画',
      nextRun: '次回 {{time}}',
      notSet: '未設定',
      overviewTitle: 'タスク概要',
      scheduleDaily: '毎日 {{time}}',
      scheduleWeekly: '毎週{{weekday}} {{time}}',
      scheduleMonthly: '毎月 {{day}} 日 {{time}}',
      scheduleCustom: '{{days}} 日ごと {{time}}',
      frequencies: {
        once: '1回のみ',
        daily: '毎日',
        weekly: '毎週',
        monthly: '毎月',
        custom: 'カスタム'
      },
      weekdays: {
        1: '月',
        2: '火',
        3: '水',
        4: '木',
        5: '金',
        6: '土',
        7: '日'
      },
      stats: {
        total: '予約タスク',
        totalHint: 'すべてのタスク',
        active: '有効',
        activeHint: '実行中',
        sent: '送信済み',
        sentHint: 'メール総数',
        pending: '送信待ち',
        pendingHint: 'まもなく実行'
      },
      features: {
        flexibleTime: '柔軟な時刻設定（一度 / 指定時刻）',
        templates: 'メールテンプレート対応',
        variables: 'スマート変数（{name}、{date} など）',
        stats: '送信結果をリアルタイム集計'
      },
      help: {
        create: '予約メールの作り方',
        templates: 'テンプレート設定',
        variables: '変数の使い方',
        faq: 'よくある質問'
      },
      status: {
        pending: '有効',
        paused: '一時停止中',
        sending: '送信中',
        sent: '送信済み',
        failed: '送信失敗'
      }
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
      title: 'Anchored Overlay (アンカー・オーバーレイ)',
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
        deleteScenarioConfirm: 'シナリオを削除',
        deleteScenarioWarning: '次のテストシナリオを削除しようとしています：',
        deleteScenarioLoseWarning: '削除後、このシナリオのデモコードは復元できません。',
        keepOneScenario: '少なくとも1つのシナリオを残してください',
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
  img2three: {
    title: '画像から3Dシーンへ',
    subtitle: '参考画像をアップロードし、制限付き Three.js シーン仕様を生成してプレビューとダウンロードができます。',
    uploadHint: 'ここに画像をドロップするか、クリックして選択',
    chooseImage: '画像を選択',
    generate: '3Dシーンを生成',
    generating: '生成中…',
    restoring: 'タスクを復元中…',
    stageAnalyze: '参考画像と構造を分析中',
    stageSpec: '制限付きシーン仕様を生成中',
    stageFactory: 'ダウンロード可能な TypeScript ファクトリを準備中',
    ready: 'シーンの準備が完了しました',
    failed: '生成に失敗しました',
    downloadSpec: 'spec.json をダウンロード',
    downloadFactory: 'createModel.ts をダウンロード',
    downloadGlb: 'GLB をダウンロード',
    exportingGlb: 'GLB を書き出し中…',
    reference: '参考画像',
    preview: '3Dプレビュー',
    previewFailed: '3Dプレビューを読み込めませんでした',
    attribution: 'img2threejs を利用 — GitHub で見る',
    loginRequired: '生成と保存にはログインが必要です。',
    invalidImage: 'JPEG、PNG、WebP、GIF 画像を選択してください',
    fileTooLarge: '画像サイズは 10MB 以下にしてください',
    dropHint: 'JPG、PNG、WebP、GIF に対応（最大 10MB）',
    newTask: '新しいタスク',
    history: '生成履歴',
    historyLoading: '生成履歴を読み込み中',
    historyEmpty: '生成履歴はまだありません。',
    historyLoadFailed: '生成履歴を読み込めませんでした',
    untitledTask: '無題のモデル',
    status: { created: '待機中', running: '生成中', ready: '完了', failed: '失敗' },
    back: '戻る',
  },

  home: {
    version: 'v1.0.0 開発中',
    hero: { filled: 'つくる', outline: '共有と自動化', description: 'フロントエンドのデモを共有し、ブログ生成・公開を予約し、日々のリマインダーを時間通りに届けます。', explore: 'ツールを見る', studio: 'Studio を開く' },
    tools: {
      agent: { label: 'ブログ Agent', title: '予約ブログ Agent', description: 'テーマと実行時刻を設定すると、Agent が記事を生成し、接続済みのプラットフォームへ同期します。', action: 'ブログ Agent を見る' },
      email: { label: 'メールタスク', title: '予約メール', description: '繰り返しリマインダーや予約メールを個別に作成し、決めた時刻に送信できます。', action: '予約メールを見る' },
      demo: { label: 'コンポーネント Demo', title: 'コンポーネント Demo を共有', description: '再利用可能なコンポーネントにソース、実行可能なプレビュー、共有リンクを添えられます。', action: 'Demo を見る' }
    },
    previews: {
      agent: { newTask: '新しいタスク', saved: '保存済み', topic: 'テーマ', topicValue: 'アクセシブルなコンポーネントを作る', schedule: 'スケジュール', scheduleValue: '毎週月曜 · 09:00', article: '記事', generating: '生成中', nextRun: '● 次回実行：2026年5月26日', synced: '同期済み' },
      email: { to: '宛先', subscribers: '購読者', subject: 'Xander Lab 週間アップデート', greeting: 'こんにちは、', body: '今週のアップデートをお届けします。', signature: 'Xander Lab チーム', schedule: '毎週金曜' },
      demo: { preview: 'プレビュー', code: 'コード', button: 'ボタン', primary: 'プライマリ', secondary: 'セカンダリ', ghost: 'ゴースト' }
    },
    articles: { title: '最新記事', all: 'すべての記事を見る', items: { accessibility: { date: '2026年5月18日', title: 'アクセシブルなコンポーネントを作る', tag: '開発' }, designTokens: { date: '2026年5月11日', title: 'デザイントークンの実践', tag: 'デザイン' }, automation: { date: '2026年5月4日', title: '予約で日常業務を自動化する', tag: '生産性' } } }
  }
};
