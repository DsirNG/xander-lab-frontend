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
    tagLabel: 'Étiquette',
    popularTags: 'Étiquettes populaires',
    viewAllTags: 'Toutes les étiquettes',
    allTags: 'Toutes les étiquettes',
    tagsCount: '{{count}} étiquettes au total',
    tagArticles: 'Articles avec l\'étiquette « {{tag}} »',
    noMoreArticles: 'Plus d\'articles',
    publish: 'Publier un article',
    publishTitle: 'Publier un nouvel article',
    publishSuccess: 'Article publié avec succès',
    publishError: 'Échec de la publication, veuillez réessayer',
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
    saveDraftError: 'Impossible d’enregistrer le brouillon. Vérifiez les autorisations de stockage.',
    publishNow: 'Publier maintenant',
    publishing: 'Publication...',
    fillRequired: 'Veuillez remplir le titre, le contenu et la catégorie',
    publishSettings: 'Paramètres du document',
    edit: 'Modifier',
    preview: 'Aperçu',
    noContent: 'Aucun contenu saisi'
  },
  common: {
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
      title: 'Anchored Overlay',
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
  footer: {
    desc: 'Une plateforme de partage de connaissances qui documente les expériences de projet et fournit des composants réutilisables, des Hooks et des ressources d\'apprentissage.',
    resources: 'Ressources',
    Infrastructure: 'Infrastructure',
    Modules: 'Modules',
    components: 'Composants',
    hooks: 'Hooks',
    docs: 'Documentation',
    connect: 'Connecter',
    rights: 'Tous droits réservés.',
    feedback: 'Bienvenue pour signaler les erreurs et suggestions !'
  }
};
