/**
 * French translations
 * Traductions françaises
 */

export default {
  nav: {
    infra: 'Infrastructure',
    modules: 'Modules',
    components: 'Composants',
    blog: 'Blog',
    img2three: 'Img2Three',
    studio: 'Studio',
    about: 'À propos',
    home: 'Accueil',
    logout: 'Déconnexion',
    login: 'Connexion',
    skipToMain: 'Aller au contenu principal',
    accountLogin: 'Connexion au compte'
  },
  blog: {
    description: 'Documenter le parcours d\'apprentissage, partager les idées techniques et les bonnes pratiques.',
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher des articles...',
    categories: 'Catégories',
    allCategories: 'Tous les articles',
    recentPosts: 'Articles récents',
    latestPosts: 'Derniers articles',
    categoryLabel: 'Catégorie',
    searchLabel: 'Résultats de recherche',
    loading: 'Chargement...',
    foundArticles: '{{count}} articles trouvés',
    clearFilters: 'Effacer les filtres',
    gridView: 'Vue en grille',
    listView: 'Vue en liste',
    noArticles: 'Aucun article trouvé',
    noArticlesHint: 'Essayez d\'ajuster vos termes de recherche ou de sélectionner une autre catégorie.',
    viewAll: 'Voir tous les articles',
    articleNotFound: 'Article introuvable ou supprimé.',
    backToBlog: 'Retour au blog',
    pureReading: 'Lecture pure',
    exitPureReading: 'Quitter la lecture pure',
    pureReadingHint: 'Mode lecture pure (Appuyez sur Échap pour quitter)',
    tagLabel: 'Étiquette',
    popularTags: 'Étiquettes populaires',
    viewAllTags: 'Toutes les étiquettes',
    allTags: 'Toutes les étiquettes',
    tagsCount: '{{count}} étiquettes au total',
    tagArticles: 'Articles avec l\'étiquette « {{tag}} »',
    noMoreArticles: 'Plus d\'articles',
    publish: 'Publier un article',
    publishTitle: 'Publier un nouvel article',
    editTitle: 'Modifier l\'article',
    backToManage: 'Retour à la gestion du blog',
    publishSuccess: 'Article publié avec succès',
    publishError: 'Échec de la publication, veuillez réessayer',
    publishStatusUnknown: 'La publication est encore en cours de confirmation. Le brouillon est conservé ; ne soumettez pas à nouveau.',
    titleLabel: 'Titre de l\'article',
    titlePlaceholder: 'Entrez un titre accrocheur...',
    categoryPlaceholder: 'Sélectionner une catégorie',
    summaryLabel: 'Résumé',
    summaryPlaceholder: 'Rédigez un bref résumé...',
    contentLabel: 'Contenu (Markdown)',
    contentPlaceholder: 'Exprimez vos idées en Markdown...',
    tagsPlaceholder: 'Appuyez sur Entrée pour ajouter des étiquettes...',
    saveDraft: 'Sauvegarder le brouillon',
    saveDraftSuccess: 'Brouillon enregistré sur cet appareil',
    saveDraftServerSuccess: 'Brouillon enregistré',
    saveDraftLocalFallback: 'Échec de l\'enregistrement serveur ; brouillon conservé sur cet appareil',
    saveDraftError: 'Impossible d’enregistrer le brouillon. Vérifiez les autorisations de stockage.',
    publishNow: 'Publier maintenant',
    publishing: 'Publication...',
    fillRequired: 'Veuillez remplir le titre, le contenu et la catégorie',
    publishSettings: 'Paramètres du document',
    edit: 'Modifier',
    preview: 'Aperçu',
    noContent: 'Aucun contenu saisi',
    media: { insertImage: 'Insérer une image', dropImage: 'Déposez ou choisissez une image / un GIF, puis insérez-le au curseur.', uploadingImage: 'Importation', imageInserted: 'Image insérée dans l’article', imageUploadFailed: 'Impossible d’importer l’image. Réessayez.', invalidImage: 'Choisissez une image ou un GIF', imageTooLarge: 'Les images doivent faire 10 Mo maximum', altText: 'Description de l’image', addToArticle: 'Insérer dans l’article', libraryTitle: 'Insérer une image', uploadImage: 'Importer', uploadSuccess: 'Image ajoutée à votre bibliothèque', searchPlaceholder: 'Rechercher une image', scopes: { recent: 'Récentes', mine: 'Mes images', gif: 'GIF' }, emptyTitle: 'Aucune image', emptyHint: 'Importez une image dans votre bibliothèque privée', selectHint: 'Sélectionnez une image pour voir ses détails', selectedCount: '{{count}} image sélectionnée', cancel: 'Annuler', insertAtCursor: 'Insérer ici' },
    editor: { toolbar: 'Outils d’écriture', addBlock: 'Ajouter un bloc', text: 'Texte', h1: 'H1', h2: 'H2', todo: 'Tâche', list: 'Liste', quote: 'Citation', code: 'Code', insertContent: 'Insérer du contenu', imageGif: 'Image / GIF', video: 'Vidéo (bientôt)', divider: 'Séparateur', table: 'Tableau', codeBlock: 'Bloc de code', quoteBlock: 'Bloc de citation' },
    agent: {
      title: 'Agent de blog', back: 'Retour au blog', headline: 'Transformez une idée en article publiable', description: 'Saisissez un thème ou un journal. L’agent recherche, rédige et vérifie un article avec ses sources.', inputLabel: 'Votre thème ou journal', inputPlaceholder: 'Décrivez votre idée, votre expérience ou votre réflexion…', inputType: 'Type de saisie', audience: 'Public', tone: 'Ton', defaultAudience: 'Lecteurs intéressés par ce sujet', defaultTone: 'Clair, sincère et pratique', generate: 'Rechercher et rédiger', running: 'Recherche et rédaction…', waiting: 'En attente de votre saisie', ready: 'Prêt à relire', failed: 'L’agent n’a pas terminé cette tâche', complete: 'Article prêt à être relu', workflow: 'Flux de l’agent', guardrail: 'Les expériences personnelles restent attribuées à leur auteur. Les affirmations externes doivent avoir une source traçable et ne sont jamais publiées automatiquement.', stages: { analyze: 'Cadrer l’article', research: 'Rechercher et vérifier', write: 'Rédiger l’article', illustrate: 'Créer les illustrations', review: 'Relire avant publication' }, stageDescriptions: { analyze: 'Définit le lecteur, l’angle et les manques.', research: 'Vérifie les affirmations externes sur le web.', write: 'Produit un article Markdown complet.', illustrate: 'Crée des visuels utiles dans votre bibliothèque.', review: 'Vérifie les preuves et la clarté.' }, article: 'Article généré', toDraft: 'Ouvrir dans l’éditeur', draftCreated: 'Brouillon créé. Vous pouvez le modifier et le publier.', sources: 'Sources de recherche', noSources: 'Aucune source externe conservée.', review: 'Révision éditoriale', reviewPending: 'La révision apparaîtra une fois le travail terminé.', inputRequired: 'Saisissez d’abord un thème ou un journal.', contentFocus: 'Périmètre du contenu', mustCover: 'Sujet principal', relatedExpansion: 'Extensions directes', outOfScope: 'Non développé', knowledgeGraph: 'Graphe de connaissances', illustrations: 'Illustrations', illustrationStatuses: { running: 'Création des illustrations.', complete: 'Illustrations ajoutées à l’article et à votre bibliothèque.', partial: 'Certaines illustrations ont été créées.', failed: 'La création a échoué, mais l’article reste disponible.', disabled: 'Aucun modèle d’image configuré.', none: 'Aucune illustration supplémentaire n’est nécessaire.' },
      processing: 'Traitement {{duration}}', processed: 'Traité {{duration}}', processedDone: 'Traité', processFailed: 'Échec du traitement', openPreview: 'Cliquer pour prévisualiser', previewEmpty: 'Sélectionnez un article à prévisualiser', untitled: 'Article sans titre', newTask: 'Nouvelle tâche', newConversation: 'Nouvelle conversation', conversations: 'Conversations', noConversations: 'Aucune conversation', restoring: 'Restauration de la tâche…', multiTurnHint: 'Décrivez une modification pour créer une nouvelle version.', revise: 'Modifier l’article', revisionComplete: 'Article mis à jour', waitingForStage: 'Préparation de l’étape suivante…', inputLockedPlaceholder: 'L’agent travaille…', confirmPublish: 'Publier', viewArticle: 'Voir l’article', showMeta: 'Afficher recherche et révision', hideMeta: 'Masquer recherche et révision'
    }
  },
  common: {
    confirm: 'Confirmer',
    cancel: 'Annuler',
    pagination: {
      pageInfo: '{{from}}-{{to}} sur {{total}}',
      pageSizeOption: '{{size}} par page',
      prevPage: 'Précédent',
      nextPage: 'Suivant'
    },
    backHome: 'Retour à l\'accueil',
    backToInfra: 'Retour à l\'infrastructure',
    backToComponents: 'Retour aux composants',
    goBack: 'Retour',
    pageNotFound: 'Page non trouvée',
    pageNotFoundDesc: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
    technicalNarrative: 'Récit technique',
    codeImplementation: 'Implémentation',
    involvedFiles: 'Fichiers impliqués',
    implementationDetails: 'Détails d\'implémentation',
    viewDetails: 'Voir les détails',
    viewSource: 'Voir le code source',
    viewDeepDive: 'Voir l\'analyse approfondie',
    comingSoon: 'Bientôt disponible',
    notFound: '404 - Page introuvable',
    detailComingSoon: 'Détails (bientôt disponible)',
    exploreInfra: 'Explorateur d\'infrastructure',
    selectModule: 'Sélectionnez un système pour explorer ses capacités',
    liveScenarios: 'Scénarios en direct',
    viewTheory: 'Voir l\'implémentation',
    exploreModules: 'Explorateur de fonctionnalités',
    selectModuleToExplore: 'Sélectionnez un module pour voir ses modèles d\'interaction',
    componentSource: 'Code source du composant',
    coreFeatures: 'Fonctionnalités principales',
    logicLayer: 'Couche logique',
    logicLayerDesc: 'Implémentation principale du composant gérant l\'état et l\'interaction.',
    styleLayer: 'Couche de style',
    styleLayerDesc: 'CSS Modules pour le style scopé et les animations.',
    codeBlock: {
      showCode: 'Voir le code',
      showPreview: 'Aperçu',
      copy: 'Copier le code',
      copied: 'Copié',
      previewFrame: 'Aperçu {{language}}',
    },
    errorBoundary: {
      title: 'Une erreur est survenue',
      description: 'Une erreur inattendue s\'est produite. Vous pouvez essayer de recharger la page ou retourner à l\'accueil.',
      errorDetails: 'Détails de l\'erreur',
      reload: 'Recharger',
      backToHome: 'Retour à l\'accueil'
    },
    aria: {
      mainNav: 'Navigation principale',
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      openSidebar: 'Ouvrir la barre latérale',
      closeSidebar: 'Fermer la barre latérale',
      gridView: 'Vue en grille',
      listView: 'Vue en liste',
      close: 'Fermer',
      closeNotification: 'Fermer la notification'
    }
  },
  auth: {
    sessionExpired: 'Session expirée, veuillez vous reconnecter',
    login: {
      invalidEmail: 'Veuillez entrer un email valide',
      codeSent: 'Le code de vérification a été envoyé à votre email',
      codeSendFailed: 'Échec de l\'envoi du code, vérifiez votre réseau',
      authSuccess: 'Authentification réussie, bienvenue',
      authFailed: 'Échec de l\'authentification, vérifiez vos identifiants',
      loginAccess: 'Accès par connexion',
      loginDesc: 'Obtenez l\'accès complet à Xander Lab, la gestion du blog et les données multidimensionnelles.',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'Entrez votre adresse email',
      codeLabel: 'Code de vérification',
      codePlaceholder: 'Code à 6 chiffres',
      sendCode: 'Envoyer le code',
      autoRegisterHint: 'Les nouveaux utilisateurs seront automatiquement inscrits. En continuant, vous acceptez nos conditions.',
      submit: 'Connexion / Inscription',
      accountLabel: 'Compte',
      accountPlaceholder: 'Nom d\'utilisateur ou email',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      passwordAuth: 'Mot de passe',
      codeAuth: 'Code de v\u00e9rification',
      login: 'Connexion',
      backToLobby: 'Retour à l\'accueil',
      techBlog: 'Blog technique'
    }
  },
  profile: {
    title: 'Espace personnel',
    subtitle: 'Gérez votre compte et vos flux d’automatisation',
    open: 'Ouvrir l’espace personnel',
    account: 'Compte connecté',
    loading: 'Chargement de l\'espace personnel…',
    comingSoon: 'Bientôt disponible',
    comingSoonHint: 'Ce module est en préparation. Vous pouvez utiliser la gestion du blog et l\'e-mail programmé pour l\'instant.',
    logoutConfirmTitle: 'Déconnexion',
    logoutConfirmMessage: 'Voulez-vous vraiment vous déconnecter de ce compte ?',
    nav: {
      account: 'Informations du compte',
      security: 'Sécurité',
      notifications: 'Notifications',
      blogManage: 'Gestion du blog',
      emailReminders: 'E-mail programmé',
      templates: 'Modèles d’e-mail',
      history: 'Historique des tâches',
      apiKeys: 'Clés API',
      preferences: 'Préférences',
      mcp: 'Autorisation MCP'
    },
    blogManage: {
      title: 'Gestion du blog',
      description: 'Gérez vos articles : modifier, brouillon, publier et corbeille',
      createNew: 'Nouvel article',
      tabs: { all: 'Tous', published: 'Publiés', draft: 'Brouillons', trash: 'Corbeille' },
      searchPlaceholder: 'Rechercher par titre ou résumé',
      loading: 'Chargement des articles…',
      loadError: 'Échec du chargement des articles',
      retry: 'Recharger',
      emptyTitle: 'Aucun article',
      emptyHint: 'Créez un nouvel article d\'ici ou depuis la page d\'accueil du blog.',
      emptyTrash: 'La corbeille est vide',
      emptyTrashHint: 'Les articles supprimés apparaissent ici.',
      untitled: 'Sans titre',
      status: { draft: 'Brouillon', published: 'Publié', trash: 'Corbeille' },
      actions: { edit: 'Modifier', publish: 'Publier', unpublish: 'Passer en brouillon', trash: 'Mettre à la corbeille', restore: 'Restaurer en brouillon', permanentDelete: 'Supprimer définitivement', view: 'Voir', syncCsdn: 'Synchroniser avec CSDN' },
      csdn: {
        dialogTitle: 'Synchroniser avec CSDN',
        syncing: 'Publication sur CSDN en cours...',
        checking: 'Vérification de l\'autorisation CSDN...',
        scanHint: 'Scannez pour autoriser. L\'article sera synchronisé automatiquement après la connexion.',
        synced: 'Synchronisé avec CSDN',
        viewPost: 'Voir l\'article CSDN',
        syncFailed: 'Impossible de synchroniser cet article avec CSDN',
        authorizationFailed: 'Impossible de démarrer l\'autorisation CSDN',
        qrAlt: 'Code QR de connexion CSDN'
      },
      confirmTrashTitle: 'Mettre à la corbeille',
      confirmTrashMessage: 'Mettre « {{title}} » à la corbeille ? Vous pourrez le restaurer plus tard.',
      confirmPermanentTitle: 'Supprimer définitivement',
      confirmPermanentMessage: 'Supprimer définitivement « {{title}} » ? Cette action est irréversible.',
      trashed: 'Déplacé vers la corbeille',
      permanentlyDeleted: 'Supprimé définitivement',
      restored: 'Restauré en brouillon',
      published: 'Publié',
      unpublished: 'Passé en brouillon',
      pageInfo: '{{from}}-{{to}} sur {{total}}',
      pageSizeOption: '{{size}} par page',
      prevPage: 'Précédent',
      nextPage: 'Suivant'
    },
    mcp: {
      title: 'Autorisation MCP',
      description: 'Autorisez le client MCP à créer, lire, mettre à jour et publier le contenu de votre blog.',
      checking: 'Vérification de l\'autorisation...',
      authorized: 'Autorisé',
      unavailable: 'Serveur MCP indisponible',
      notAuthorized: 'Non autorisé',
      authorizedHint: 'Votre client MCP peut utiliser les outils de blog.',
      notAuthorizedHint: 'Effectuez l\'autorisation unique dans le navigateur avant d\'utiliser les outils MCP.',
      authorize: 'Autoriser MCP',
      endpointsTitle: 'URL de connexion MCP',
      blogEndpoint: 'MCP du blog',
      csdnEndpoint: 'MCP CSDN',
      dualEndpoint: 'MCP publication double',
      consentTitle: 'Autoriser le client MCP',
      consentDescription: 'Le client « {{client}} » demande les capacités suivantes. Il ne pourra accéder qu’au contenu de ce compte.',
      consentApprove: 'Autoriser',
      consentDeny: 'Refuser',
      consentLoadFailed: 'Impossible de charger la demande MCP',
      consentFailed: 'Échec de l’autorisation MCP',
      clientsTitle: 'Clients MCP autorisés',
      revokeClient: 'Révoquer l’accès du client',
      clientRevoked: 'Accès du client révoqué',
      clientRevokeFailed: 'Impossible de révoquer l’accès du client',
      endpointLabel: 'Point d\'accès MCP',
      copyEndpoint: 'Copier le point d\'accès',
      endpointCopied: 'Point d\'accès MCP copié',
      copyFailed: 'Impossible de copier le point d\'accès MCP'
    },
    csdn: {
      title: 'Publication CSDN',
      description: 'Connectez CSDN une fois pour activer la publication programmée pour votre compte.',
      authorized: 'CSDN connecté',
      checking: 'Vérification de l\'état de la connexion...',
      generatingQr: 'Génération du code QR de connexion CSDN...',
      startFailed: 'Impossible de démarrer l\'autorisation CSDN',
      disconnected: 'CSDN déconnecté',
      disconnectFailed: 'Impossible de déconnecter CSDN',
      qrAlt: 'Code QR de connexion CSDN',
      scanHint: 'Scannez avec l\'application CSDN ou WeChat. Ce code QR expire rapidement.',
      waiting: 'En attente d\'autorisation',
      expired: 'Le code QR a expiré. Veuillez réessayer.',
      queued: 'En file d\'attente',
      queuePosition: 'Vous êtes n°{{position}} dans la file',
      estimatedWait: 'Attente estimée : environ {{wait}} s',
      connect: 'Connecter CSDN',
      disconnect: 'Déconnecter',
      unavailable: 'Service d\'autorisation CSDN indisponible.'
    },
    emailReminders: {
      title: 'E-mail programmé',
      description: 'Planifiez des e-mails et automatisez vos envois',
      createNew: 'Nouvel e-mail programmé',
      taskList: 'Liste des tâches planifiées',
      taskName: 'Nom de la tâche',
      statusLabel: 'État',
      actions: 'Actions',
      taskCount: '{{count}} tâches',
      filterAll: 'Tous les états',
      searchPlaceholder: 'Rechercher par nom ou destinataire',
      pageInfo: '{{from}}-{{to}} sur {{total}}',
      pageSizeOption: '{{size}} / page',
      prevPage: 'Page précédente',
      nextPage: 'Page suivante',
      refresh: 'Actualiser',
      loading: 'Chargement des tâches…',
      loadError: 'Impossible de charger les tâches',
      retry: 'Réessayer',
      emptyTitle: 'Aucun e-mail programmé',
      emptyHint: 'Créez un e-mail programmé, choisissez l’heure et rédigez le message.',
      addTitle: 'Nouvel e-mail programmé',
      sideIntro: 'Créez une fois et touchez les destinataires à l’heure prévue.',
      senderHint: 'Les messages sont envoyés depuis le compte de vérification Xander Lab.',
      recipientEmail: 'E-mail du destinataire',
      recipientPlaceholder: 'nom@exemple.com',
      scheduledAt: 'Heure d’envoi',
      subject: 'Objet',
      subjectPlaceholder: 'Par exemple : penser au bilan de ce soir',
      message: 'Votre message',
      messagePlaceholder: 'Écrivez ce que vous souhaitez recevoir plus tard…',
      messageHtmlPlaceholder: 'Écrivez du HTML, ex. <p>Bonjour</p><strong>gras</strong>',
      previewTitle: 'Aperçu de l’e-mail',
      safePreview: 'Aperçu',
      previewSubject: 'L’objet de votre e-mail apparaîtra ici',
      previewMessage: 'Choisissez un modèle pour prévisualiser la mise en page.',
      contentType: 'Format du contenu',
      contentTypes: {
        plain: 'Texte brut',
        html: 'HTML'
      },
      template: 'Modèle d’e-mail',
      templates: {
        classic: 'Lettre aube',
        minimal: 'Papier calme',
        card: 'Rappel coucher',
        notice: 'Avis sarcelle'
      },
      templateSubjects: {
        classic: 'Une note pour plus tard',
        minimal: 'Rappel du jour',
        card: 'Rappel horaire',
        notice: 'Avis important'
      },
      selectTemplate: 'Choisir un modèle',
      templatePickerTitle: 'Choisir un modèle d’e-mail',
      templatePickerHint: 'Le choix insère du HTML dans le corps. Sinon, l’envoi reste en texte brut.',
      useThisTemplate: 'Utiliser',
      clearToPlain: 'Revenir au texte brut',
      applyTemplateStarter: 'Insérer un exemple HTML',
      messageInputHint: 'Saisie libre. HTML personnalisé pris en charge. Utilisez « Choisir un modèle » pour une mise en page.',
      plainContentHint: 'Saisie libre. HTML personnalisé pris en charge.',
      htmlContentHint: 'Mise en page « {{template}} » ; le corps est envoyé en HTML.',
      plainPreviewBadge: 'Corps',
      htmlPreviewBadge: 'HTML',
      customPreviewBadge: 'Perso',
      htmlSafetyHint: 'HTML personnalisé pris en charge ; modèles optionnels.',
      create: 'Créer un e-mail programmé',
      createAndSave: 'Créer et enregistrer',
      creating: 'Création…',
      created: 'E-mail programmé créé',
      statusUpdated: 'État de la tâche mis à jour',
      deleted: 'E-mail programmé supprimé',
      fieldsRequired: 'Renseignez le destinataire, l’heure, l’objet et le message',
      invalidEmail: 'Saisissez une adresse e-mail valide',
      futureTimeRequired: 'L’heure d’envoi doit être dans le futur',
      sendTimeRequired: 'Choisissez une heure d’envoi',
      intervalDaysInvalid: 'L’intervalle personnalisé doit être entre 1 et 365 jours',
      errorLabel: 'Cause de l’échec',
      pause: 'Suspendre',
      resume: 'Reprendre',
      delete: 'Supprimer',
      confirmDelete: 'Confirmer',
      confirmDeleteTitle: 'Supprimer l\'e-mail programmé',
      confirmDeleteMessage: 'Supprimer « {{name}} » ? Cette action est irréversible.',
      cancelDelete: 'Annuler',
      tipTitle: 'Astuce',
      tipBody: 'Les e-mails programmés sont envoyés automatiquement à l’heure prévue. Vérifiez le destinataire et le contenu.',
      viewHelp: 'Voir l’aide',
      helpTitle: 'Aide',
      sectionRecipient: 'Destinataire',
      sectionContent: 'Contenu de l’e-mail',
      sectionSchedule: 'Paramètres d’envoi',
      timezone: 'Fuseau horaire',
      frequency: 'Fréquence',
      sendTime: 'Heure d’envoi',
      weekday: 'Jour de la semaine',
      monthDayLabel: 'Jour du mois',
      monthDay: 'Jour {{day}}',
      intervalDays: 'Tous les N jours',
      scheduleColumn: 'Planification',
      nextRun: 'Prochain {{time}}',
      notSet: 'Non défini',
      overviewTitle: 'Aperçu de la tâche',
      scheduleDaily: 'Tous les jours à {{time}}',
      scheduleWeekly: 'Chaque {{weekday}} à {{time}}',
      scheduleMonthly: 'Le {{day}} de chaque mois à {{time}}',
      scheduleCustom: 'Tous les {{days}} jours à {{time}}',
      frequencies: {
        once: 'Une fois',
        daily: 'Quotidien',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuel',
        custom: 'Personnalisé'
      },
      weekdays: {
        1: 'Lun',
        2: 'Mar',
        3: 'Mer',
        4: 'Jeu',
        5: 'Ven',
        6: 'Sam',
        7: 'Dim'
      },
      stats: {
        total: 'Tâches planifiées',
        totalHint: 'Toutes les tâches',
        active: 'Actives',
        activeHint: 'En cours',
        sent: 'Envoyés',
        sentHint: 'Total des e-mails',
        pending: 'En attente',
        pendingHint: 'À venir'
      },
      features: {
        flexibleTime: 'Horaires flexibles (une fois / heure précise)',
        templates: 'Support des modèles d’e-mail',
        variables: 'Variables intelligentes ({name}, {date})',
        stats: 'Statistiques d’envoi en direct'
      },
      help: {
        create: 'Créer un e-mail programmé',
        templates: 'Configurer les modèles',
        variables: 'Utiliser les variables',
        faq: 'FAQ'
      },
      status: {
        pending: 'Actif',
        paused: 'Suspendu',
        sending: 'Envoi en cours',
        sent: 'Envoyé',
        failed: 'Échec'
      }
    }
  },
  hero: {
    badge: 'v1.0.0 En développement',
    title: 'Partager',
    gradient: 'Apprendre et grandir',
    desc: 'Documenter les expériences pratiques des projets, partager les composants développés, les Hooks et les notes d\'apprentissage. Tout le code est fourni avec le code source complet pour une réutilisation directe.',
    performance: 'Performance'
  },
  features: {
    title: 'Pourquoi créer Xander Lab ?',
    desc: 'Dans le développement de projets, nous rencontrons souvent des problèmes et des besoins répétitifs. En documentant ces expériences pratiques, nous pouvons nous aider à réviser et consolider nos connaissances, tout en fournissant des références à d\'autres développeurs.',
    composable: {
      title: 'Prêt à l\'emploi',
      desc: 'Tous les composants et Hooks fournissent le code source complet qui peut être directement copié dans votre projet.'
    },
    themable: {
      title: 'Ressources d\'apprentissage',
      desc: 'Documenter les nouvelles connaissances et points techniques appris, avec des idées d\'implémentation et des commentaires de code.'
    },
    performant: {
      title: 'Orienté pratique',
      desc: 'Tout le contenu provient de pratiques de projets réels, ce sont des solutions vérifiées, pas de la théorie.'
    }
  },
  infra: {
    title: 'Infrastructure',
    subtitle: 'Systèmes principaux',
    anchored: {
      title: 'Anchored Overlay (overlay ancré)',
      tag: 'Positionnement et physique',
      desc: 'Le système fondamental de positionnement des éléments flottants par rapport aux ancres.',
      phases: {
        theory: {
          title: 'I. La théorie (physique du positionnement)',
          desc: 'Les fondements mathématiques de l\'emplacement.',
          points: ['Définitions des axes principal et transversal', 'Sémantique de placement (top/start/...)', 'Stratégie Absolute vs Fixed']
        },
        hook: {
          title: 'II. Le moteur (useAnchorPosition)',
          desc: 'Le hook de bas niveau qui gère le travail : ResizeObserver, événements de défilement et double RAF.',
          points: ['Suivi du défilement et du redimensionnement', 'Synchronisation double-RAF', 'Performance basée sur Transform']
        },
        container: {
          title: 'III. L\'abstraction (OverlayContainer)',
          desc: 'Un conteneur comportemental sans style qui encapsule le modèle d\'interaction.',
          points: ['Stratégies Flip / Shift / Padding', 'Gestion Focus Trap et Backdrop', 'Sémantique conforme ARIA']
        }
      },
      files: [
        { name: 'useAnchorPosition.ts', role: 'Moteur de calcul' },
        { name: 'OverlayContainer.tsx', role: 'Enveloppe comportementale' },
        { name: 'PositioningUtils.ts', role: 'Aides mathématiques' },
        { name: 'types.ts', role: 'Définitions d\'interface' }
      ]
    }
  },
  modules: {
    title: 'Modules fonctionnels',
    subtitle: 'Modèles UI',
    popover: {
      title: 'Popover',
      tag: 'Interaction de base',
      desc: 'Conteneur flottant général avec placements et décalages par défaut.'
    },
    dropdown: {
      title: 'Menu déroulant',
      tag: 'Interaction de menu',
      desc: 'Sémantique de menu avec navigation au clavier.'
    },
    tooltip: {
      title: 'Info-bulle',
      tag: 'Retour d\'information',
      desc: 'Superpositions informatives déclenchées par survol/focus.'
    },
    context: {
      title: 'Menu contextuel',
      tag: 'Interaction contextuelle',
      desc: 'Positionnement relatif basé sur le pointeur.'
    },
    dragdrop: {
      title: 'Glisser-déposer',
      tag: 'Interaction de glissement',
      desc: 'Glisser-déposer personnalisable avec aperçu avancé et systèmes d\'indication.',
      phases: {
        theory: {
          title: 'I. Le moteur (useDragDrop)',
          desc: 'Le fondement technique du modèle d\'interaction de glisser-déposer.',
          points: ['Intégration de l\'API HTML5 Drag & Drop', 'Gestion des éléments d\'aperçu personnalisés', 'Contrôle de l\'état et de la validité du glissement']
        },
        hook: {
          title: 'II. L\'aperçu (DragPreview)',
          desc: 'Gestion du retour visuel pendant les opérations de glissement.',
          points: ['Technique d\'image fantôme transparente', 'Suivi des éléments DOM flottants', 'Système d\'indication piloté par contrôleur']
        },
        container: {
          title: 'III. L\'interaction (Zones de dépôt)',
          desc: 'Définir comment les éléments sont acceptés et traités.',
          points: ['Logique de validation flexible', 'Génération de texte d\'indication de dépôt', 'Mises à jour UI optimistes']
        }
      },
      files: [
        { name: 'useDragDrop.ts', role: 'Hook d\'interaction principal' },
        { name: 'DragDropSystem.jsx', role: 'Présentation des fonctionnalités' },
        { name: 'DraggableItem.tsx', role: 'Composant réutilisable' }
      ]
    }
  },
  components: {
    desc: 'Explorez notre bibliothèque de composants atomiques.',
    list: {
      atomDesc: 'Composants atomiques pour construire des interfaces cohérentes.',
      shareMyComponents: 'Partager mes composants'
    },
    customSelect: {
      title: 'Sélection personnalisée',
      desc: 'Un composant déroulant personnalisé qui prend en charge la détection des limites et le suivi du défilement.',
      guideTitle: 'Guide d\'implémentation',
      tag: 'Positionnement intelligent',
      phases: {
        boundary: {
          title: 'I. Détection des limites',
          desc: 'Détecte automatiquement les limites du viewport et ajuste la direction du menu déroulant.',
          points: ['Logique de positionnement haut/bas', 'Calcul en temps réel de l\'espace du viewport', 'Double-RAF pour des mesures précises']
        },
        scroll: {
          title: 'II. Suivi du défilement',
          desc: 'Surveille en continu les événements de défilement pour maintenir l\'alignement.',
          points: ['Écouteurs de défilement fenêtre et conteneur', 'Recalcul de la position au défilement', 'Gestion des événements de redimensionnement']
        },
        interaction: {
          title: 'III. Interaction utilisateur',
          desc: 'Fournit des modèles d\'interaction intuitifs avec une gestion d\'état appropriée.',
          points: ['Clic extérieur pour fermer', 'Support de la navigation au clavier', 'Visualisation de l\'état d\'erreur']
        }
      },
      files: [
        { name: 'CustomSelect/index.jsx', role: 'Composant principal' },
        { name: 'CustomSelect/index.module.css', role: 'Styles du composant' },
        { name: 'demo/demo.jsx', role: 'Exemples d\'utilisation' }
      ],
      featureList: ['Détection des limites', 'Conscience du défilement', 'Navigation au clavier', 'Contrôle d\'alignement'],
      scenarios: {
        basic: {
          title: 'Utilisation de base',
          desc: 'Sélection unique standard avec capacités de style personnalisé.'
        },
        alignment: {
          title: 'Alignement du texte',
          desc: 'Support de l\'alignement gauche, centre et droit selon le contexte.'
        },
        states: {
          title: 'États',
          desc: 'Retour visuel pour différents états d\'interaction, y compris l\'erreur.'
        },
        demo: {
          status: {
            required: 'Champ requis',
            requiredDesc: 'Cliquez sur soumettre pour déclencher l\'erreur',
            requiredPlaceholder: 'Sélectionner (requis)...',
            simulateSubmit: 'Simuler la soumission',
            errorMsg: 'Veuillez sélectionner une option',
            optional: 'Champ optionnel',
            optionalDesc: 'Validation de soumission désactivée',
            optionalPlaceholder: 'Sélectionner (optionnel)...'
          }
        }
      }
    },
    toast: {
      title: 'Notifications Toast',
      desc: 'Système de retour premium avec interactions basées sur la physique.',
      tag: 'Interaction',
      scenarios: {
        basic: {
          title: 'Utilisation de base (Minimal)',
          desc: 'État de notification pur sans barres de progression ni boutons de fermeture.',
          success: 'Statut : logique centrale prête',
          error: 'Erreur : limite de fréquence de requête dépassée',
          info: 'Mise à jour : version v2.4.0 ajoutée',
          warning: 'Attention : espace disque faible',
          custom: 'Déclencher le style personnalisé',
          customMsg: 'Style fantôme violet personnalisé',
          success_btn: 'Succès (Minimal)',
          error_btn: 'Erreur (Minimal)',
          info_btn: 'Info (Minimal)',
          warning_btn: 'Attention (Minimal)'
        },
        physics: {
          title: 'Physique interactive (Pause au survol)',
          desc: 'Verrouillage temporel en temps réel : le survol gèle le compte à rebours.',
          hint: 'Dans ce mode, le survol gèle le minuteur ; il reprend une fois la souris retirée.',
          msg: 'Observation expérimentale : avec pauseOnHover: true, le survol prolonge le temps de lecture indéfiniment.',
          btn: 'Démarrer le laboratoire de pause physique'
        },
        manual: {
          title: 'Fermeture manuelle',
          desc: 'Modèle d\'interaction explicite avec boutons de fermeture pour les alertes nécessitant une confirmation.',
          hint: 'Force les boutons de fermeture, permettant aux utilisateurs de nettoyer activement la file de notification.',
          msg: 'Injection d\'instruction illégale détectée, protocole de sécurité exécuté.',
          btn: 'Alerte avec fermeture manuelle'
        },
        action: {
          title: 'JSX et actions riches',
          desc: 'Au-delà des chaînes : intégrez des liens, boutons et logique de mise en page personnalisée.',
          hint: 'Supporte les liens interactifs intégrés qui déclenchent la navigation métier au clic.',
          msg: 'Document compilé avec succès',
          btn: 'Afficher le lien d\'action'
        },
        comparison: {
          title: 'Comparaison système (sans pause)',
          desc: 'Démo de référence où pauseOnHover est désactivé.',
          hint: 'Comparaison : même en survolant, le compte à rebours continue.',
          msg: 'Test de flux forcé : peu importe le survol, je disparaîtrai dans 3s.',
          btn: 'Déclencher le Toast non-pausable'
        },
        stack: {
          btn: 'Déclencher l\'empilement pulsé'
        }
      },
      guide: {
        back: 'Retour à la liste',
        title: 'Toast // Code source',
        subtitle: '« Un système de notification premium basé sur la physique, conçu pour les expériences C-end modernes. »',
        architecture: {
          engine: 'Moteur expérimental',
          physics: 'Dynamique et cinématique',
          logic: 'Aperçu de la logique centrale',
          logicDesc: 'La gestion d\'état découplée garantit que les notifications persistent à travers la navigation.'
        },
        sections: {
          physics: {
            title: '01. Logique des éléments physiques',
            desc: 'Gère les états de survol, les compte à rebours au milliseconde et la synchronisation des animations CSS.'
          },
          orchestration: {
            title: '02. Orchestration d\'état',
            desc: 'Fournisseur de contexte global gérant le cycle de vie de la file de notification.'
          },
          portal: {
            title: '03. Infrastructure Portal',
            desc: 'Rend la pile de notifications en dehors de l\'arbre DOM principal.'
          },
          entry: {
            title: '04. Terminal d\'entrée',
            desc: 'Exports unifiés pour une intégration facile dans les modules fonctionnels.'
          }
        }
      }
    },
    detail: {
      loading: 'Chargement des détails du composant...',
      error: 'Échec du chargement ou composant inexistant.',
      loadingPage: 'Chargement de la page...'
    },
    content: {
      architectureDeepDive: 'Analyse approfondie de l\'architecture',
      implementationOverview: 'Aperçu de l\'implémentation',
      implementationHint: 'Ce composant inclut une couche logique personnalisée. Cliquez sur le bouton en haut à droite.',
      understandTitle: 'Comprendre en profondeur le mécanisme de ce composant',
      understandDesc: 'Plus qu\'une démo UI. Voyez comment nous avons construit ce système d\'interaction avec Context API et des Hooks personnalisés.',
      viewGuide: 'Voir le guide d\'implémentation complet',
      sourceCode: 'Code source du composant',
      sourceCodeDesc: 'Structure de fichiers complète et référence d\'implémentation',
      coreLogic: 'Logique centrale (Lib)',
      stylesDef: 'Définitions de style (CSS)'
    },
    guide: {
      parsingArchitecture: 'Analyse des détails de l\'architecture...',
      loadFailed: 'Impossible de charger le code source du composant.',
      defaultDesc: 'Ce composant est implémenté via un moteur sandbox dynamique, incluant la couche logique et la couche d\'environnement.'
    },
    share: {
      header: {
        title: 'Studio de composants',
        restartTour: 'Redémarrer le tutoriel',
        tour: 'Tutoriel',
        publish: 'Publier dans la bibliothèque'
      },
      sidebar: {
        registerMeta: 'Enregistrer les métadonnées',
        titleZh: 'Titre en chinois',
        descLabel: 'Description du composant (CN/EN)',
        descZhPlaceholder: 'Description en chinois...',
        testScenarios: 'Scénarios de test'
      },
      drawer: {
        logic: 'Logique centrale (Logic)',
        env: 'Environnement d\'exécution (Env)',
        css: 'Base de style (Styles)',
        coreArchitecture: 'Architecture technique centrale',
        collapseConsole: 'Réduire la console',
        viewArchitecture: 'Voir l\'architecture source',
        wrapperHint: 'Obtenir l\'exemple d\'emballage',
        cssHint: 'Obtenir l\'exemple de style CSS'
      },
      modals: {
        newFile: 'Nouveau fichier',
        cancel: 'Annuler',
        confirmCreate: 'Confirmer la création',
        deleteConfirm: 'Confirmation de suppression',
        confirmDelete: 'Confirmer la suppression',
        deleteWarning: 'Vous êtes sur le point de supprimer définitivement un actif de code :',
        deleteLoseWarning: 'Une fois supprimé, la structure du code source sera perdue localement. Voulez-vous forcer ?',
        deleteScenarioConfirm: 'Supprimer le scénario',
        deleteScenarioWarning: 'Vous êtes sur le point de supprimer ce scénario de test :',
        deleteScenarioLoseWarning: 'Le code de démonstration de ce scénario ne pourra pas être récupéré après suppression.',
        keepOneScenario: 'Conservez au moins un scénario',
        presetSamples: 'Bibliothèque d\'exemples prédéfinis',
        oneClickLoad: 'Chargement en un clic',
        helpIntro: 'Ceci est une fonctionnalité d\'assistant de développement. En cliquant sur le bouton ci-dessous, nous remplirons automatiquement',
        helpMeta: 'Cette opération remplira les informations de base complètes du composant Toast (noms CN/EN, description et version).',
        helpScenario: 'Cette opération remplira en un clic un scénario React DOM complet incluant les mécanismes d\'interaction { succès / échec / progression }.',
        helpLogic: 'Cette opération écrira directement les trois fichiers d\'architecture principaux : ToastContext, ToastItem et ToastContainer.',
        helpEnv: 'Cette opération remplira tous les nœuds de contexte externes comme <ToastProvider />.',
        helpCss: 'Cette opération complétera les CSS Keyframes et autres données de rendu de base pour les animations d\'entrée/sortie du Toast.',
        editScenario: 'Modifier les informations du scénario de test',
        saveChanges: 'Enregistrer les modifications',
        chineseName: 'Nom en chinois',
        chineseNamePlaceholder: 'Entrez le nom en chinois...',
        welcomeTitle: 'Bienvenue dans le laboratoire système',
        welcomeReject: 'Je suis familiarisé, refuser',
        startTour: 'Démarrer le tutoriel',
        welcomeDesc: 'Le pool d\'architecture système est dans un état initial vide et c\'est votre première visite. Pour vous aider à vous familiariser avec ce sandbox "4-en-1", nous avons intégré un squelette complet du système de notification global (Toast). Voulez-vous suivre le guide pendant 30 secondes ?',
        fileExtensionHint: 'Il est recommandé d\'utiliser des extensions frontend standard comme'
      }
    }
  },
  http: {
    errors: {
      badRequest: 'Paramètres de requête invalides',
      unauthorized: 'Session expirée, veuillez vous reconnecter',
      forbidden: 'Vous n\'avez pas la permission d\'effectuer cette action',
      notFound: 'La ressource demandée n\'existe pas',
      methodNotAllowed: 'Méthode de requête non autorisée',
      requestTimeout: 'Délai d\'attente dépassé, veuillez réessayer',
      conflict: 'Conflit de données, veuillez actualiser',
      unprocessable: 'Échec de la validation des données',
      tooManyRequests: 'Trop de requêtes, veuillez réessayer plus tard',
      internalError: 'Erreur interne du serveur',
      badGateway: 'Mauvaise passerelle, veuillez réessayer',
      serviceUnavailable: 'Service temporairement indisponible',
      gatewayTimeout: 'Délai de passerelle dépassé',
      bizDefault: 'Échec du traitement',
      invalidCredentials: 'Nom d\'utilisateur ou mot de passe incorrect',
      accountDisabled: 'Le compte a été désactivé',
      codeExpired: 'Le code de vérification a expiré',
      dataNotFound: 'Les données n\'existent pas',
      noPermission: 'Pas de permission pour cette opération',
      serverBusy: 'Serveur occupé, veuillez réessayer',
      networkError: 'Échec de la requête réseau, vérifiez votre connexion',
      noRefreshToken: 'Pas de token de rafraîchissement, veuillez vous reconnecter',
      retryPrefix: '[HTTP] Réessai',
      retrySuffix: 'délai',
      cancelled: 'Requête annulée'
    }
  },
  img2three: {
    title: 'Image vers scène 3D',
    subtitle: 'Téléversez une image de référence et générez une spécification Three.js contrainte avec aperçu et téléchargements.',
    uploadHint: 'Déposez une image ici ou cliquez pour choisir',
    chooseImage: 'Choisir une image',
    generate: 'Générer la scène 3D',
    generating: 'Génération…',
    restoring: 'Restauration de la tâche…',
    stageAnalyze: 'Analyse de l’image de référence et de la structure',
    stageSpec: 'Génération de la spécification de scène contrainte',
    stageFactory: 'Préparation de la fabrique TypeScript téléchargeable',
    ready: 'La scène est prête',
    failed: 'Échec de la génération',
    downloadSpec: 'Télécharger spec.json',
    downloadFactory: 'Télécharger createModel.ts',
    downloadGlb: 'Télécharger GLB',
    exportingGlb: 'Exportation du GLB…',
    reference: 'Image de référence',
    preview: 'Aperçu 3D',
    previewFailed: 'Impossible de charger l’aperçu 3D',
    attribution: 'Propulsé par img2threejs — voir sur GitHub',
    loginRequired: 'La connexion est requise pour générer et enregistrer des tâches.',
    invalidImage: 'Veuillez choisir une image JPEG, PNG, WebP ou GIF',
    fileTooLarge: 'L’image ne doit pas dépasser 10 Mo',
    dropHint: 'JPG, PNG, WebP et GIF pris en charge, jusqu’à 10 Mo',
    newTask: 'Nouvelle tâche',
    history: 'Historique des générations',
    historyLoading: 'Chargement de l’historique',
    historyEmpty: 'Aucune génération pour le moment.',
    historyLoadFailed: 'Impossible de charger l’historique',
    untitledTask: 'Modèle sans titre',
    status: { created: 'En attente', running: 'Génération', ready: 'Terminé', failed: 'Échec' },
    back: 'Retour',
  }
};
