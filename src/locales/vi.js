/**
 * Vietnamese translations
 * Bản dịch tiếng Việt
 */

export default {
  nav: {
    infra: 'Hạ tầng',
    modules: 'Mô-đun',
    components: 'Thành phần',
    blog: 'Blog',
    studio: 'Xưởng',
    about: 'Giới thiệu',
    home: 'Trang chủ',
    logout: 'Đăng xuất',
    login: 'Đăng nhập',
    skipToMain: 'Bỏ qua đến nội dung chính',
    accountLogin: 'Đăng nhập tài khoản'
  },
  blog: {
    description: 'Ghi lại hành trình học tập, chia sẻ hiểu biết kỹ thuật và thực tiễn tốt nhất.',
    search: 'Tìm kiếm',
    searchPlaceholder: 'Tìm bài viết...',
    categories: 'Danh mục',
    allCategories: 'Tất cả bài viết',
    recentPosts: 'Bài viết gần đây',
    latestPosts: 'Bài viết mới nhất',
    categoryLabel: 'Danh mục',
    searchLabel: 'Kết quả tìm kiếm',
    loading: 'Đang tải...',
    foundArticles: 'Tìm thấy {{count}} bài viết',
    clearFilters: 'Xóa bộ lọc',
    gridView: 'Chế độ lưới',
    listView: 'Chế độ danh sách',
    noArticles: 'Không tìm thấy bài viết',
    noArticlesHint: 'Thử điều chỉnh từ khóa hoặc chọn danh mục khác.',
    viewAll: 'Xem tất cả',
    articleNotFound: 'Bài viết không tồn tại hoặc đã bị xóa.',
    backToBlog: 'Quay lại Blog',
    tagLabel: 'Thẻ',
    popularTags: 'Thẻ phổ biến',
    viewAllTags: 'Tất cả thẻ',
    allTags: 'Tất cả thẻ',
    tagsCount: 'Tổng {{count}} thẻ',
    tagArticles: 'Bài viết gắn thẻ «{{tag}}»',
    noMoreArticles: 'Không còn bài viết nào',
    publish: 'Xuất bản bài viết',
    publishTitle: 'Xuất bản bài viết mới',
    publishSuccess: 'Bài viết đã được xuất bản thành công',
    publishError: 'Xuất bản thất bại, vui lòng thử lại',
    titleLabel: 'Tiêu đề',
    titlePlaceholder: 'Nhập tiêu đề hấp dẫn...',
    categoryPlaceholder: 'Chọn danh mục',
    summaryLabel: 'Tóm tắt',
    summaryPlaceholder: 'Viết tóm tắt ngắn gọn...',
    contentLabel: 'Nội dung (Markdown)',
    contentPlaceholder: 'Thể hiện suy nghĩ bằng Markdown...',
    tagsPlaceholder: 'Nhấn Enter để thêm thẻ...',
    saveDraft: 'Lưu nháp',
    publishNow: 'Xuất bản ngay',
    publishing: 'Đang xuất bản...',
    fillRequired: 'Vui lòng điền tiêu đề, nội dung và danh mục',
    publishSettings: 'Cài đặt tài liệu',
    edit: 'Chỉnh sửa',
    preview: 'Xem trước',
    noContent: 'Chưa nhập nội dung'
  },
  common: {
    backHome: 'Về trang chủ',
    backToInfra: 'Quay lại Hạ tầng',
    backToComponents: 'Quay lại Thành phần',
    goBack: 'Quay lại',
    pageNotFound: 'Không tìm thấy trang',
    pageNotFoundDesc: 'Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.',
    technicalNarrative: 'Mô tả kỹ thuật',
    codeImplementation: 'Triển khai mã',
    involvedFiles: 'Tệp liên quan',
    implementationDetails: 'Chi tiết triển khai',
    viewDetails: 'Xem chi tiết',
    viewSource: 'Xem mã nguồn',
    viewDeepDive: 'Phân tích chuyên sâu',
    comingSoon: 'Sắp ra mắt',
    notFound: '404 - Không tìm thấy trang',
    detailComingSoon: 'Chi tiết (sắp ra mắt)',
    exploreInfra: 'Khám phá hạ tầng',
    selectModule: 'Chọn hệ thống để khám phá',
    liveScenarios: 'Kịch bản trực tiếp',
    viewTheory: 'Xem nguyên lý',
    exploreModules: 'Khám phá tính năng',
    selectModuleToExplore: 'Chọn mô-đun để xem mẫu tương tác',
    componentSource: 'Mã nguồn thành phần',
    coreFeatures: 'Tính năng cốt lõi',
    logicLayer: 'Lớp logic',
    logicLayerDesc: 'Triển khai thành phần chính xử lý trạng thái và tương tác.',
    styleLayer: 'Lớp kiểu',
    styleLayerDesc: 'CSS Modules cho kiểu phạm vi và hoạt ảnh.',
    errorBoundary: {
      title: 'Đã xảy ra lỗi',
      description: 'Đã xảy ra lỗi không mong đợi. Thử tải lại trang hoặc quay về trang chủ.',
      errorDetails: 'Chi tiết lỗi',
      reload: 'Tải lại',
      backToHome: 'Về trang chủ'
    },
    aria: {
      mainNav: 'Điều hướng chính',
      openMenu: 'Mở menu',
      closeMenu: 'Đóng menu',
      openSidebar: 'Mở thanh bên',
      closeSidebar: 'Đóng thanh bên',
      gridView: 'Chế độ lưới',
      listView: 'Chế độ danh sách',
      close: 'Đóng',
      closeNotification: 'Đóng thông báo'
    }
  },
  auth: {
    sessionExpired: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
    login: {
      invalidEmail: 'Vui lòng nhập email hợp lệ',
      codeSent: 'Mã xác minh đã được gửi đến email của bạn',
      codeSendFailed: 'Gửi mã thất bại, kiểm tra kết nối mạng',
      authSuccess: 'Xác thực thành công, chào mừng',
      authFailed: 'Xác thực thất bại, kiểm tra thông tin đăng nhập',
      loginAccess: 'Truy cập đăng nhập',
      loginDesc: 'Nhận quyền truy cập đầy đủ vào Xander Lab, quản lý blog và dữ liệu đa chiều.',
      passwordAuth: 'Xác thực bằng mật khẩu',
      codeAuth: 'Mã xác minh',
      getCode: 'Lấy mã',
      login: 'Đăng nhập',
      backToLobby: 'Quay lại',
      techBlog: 'Blog kỹ thuật'
    }
  },
  hero: {
    badge: 'v1.0.0 Đang phát triển',
    title: 'Chia sẻ',
    gradient: 'Học hỏi và phát triển',
    desc: 'Ghi lại kinh nghiệm thực tiễn từ dự án, chia sẻ thành phần tự phát triển, Hooks và ghi chú học tập. Tất cả mã nguồn đầy đủ để tái sử dụng trực tiếp.',
    performance: 'Hiệu suất'
  },
  features: {
    title: 'Tại sao xây dựng Xander Lab?',
    desc: 'Trong phát triển dự án, chúng ta thường gặp vấn đề lặp lại. Bằng cách ghi lại kinh nghiệm thực tiễn, chúng ta giúp bản thân ôn tập và củng cố kiến thức, đồng thời cung cấp tham khảo cho các nhà phát triển khác.',
    composable: {
      title: 'Sẵn sàng sử dụng',
      desc: 'Tất cả thành phần và Hooks cung cấp mã nguồn đầy đủ có thể sao chép trực tiếp vào dự án.'
    },
    themable: {
      title: 'Tài nguyên học tập',
      desc: 'Ghi lại kiến thức và điểm kỹ thuật mới học được, kèm ý tưởng triển khai và chú thích mã.'
    },
    performant: {
      title: 'Hướng thực tiễn',
      desc: 'Tất cả nội dung đến từ thực tiễn dự án thực tế, là giải pháp đã được kiểm chứng.'
    }
  },
  infra: {
    title: 'Hạ tầng',
    subtitle: 'Hệ thống cốt lõi',
    anchored: {
      title: 'Anchored Overlay',
      tag: 'Định vị và Vật lý',
      desc: 'Hệ thống định vị cơ bản cho phần tử nổi so với neo.',
      phases: {
        theory: {
          title: 'I. Lý thuyết (Vật lý định vị)',
          desc: 'Nền tảng toán học về vị trí.',
          points: ['Định nghĩa trục chính và trục chéo', 'Ngữ nghĩa Placement (top/start/...)', 'Chiến lược Absolute vs Fixed']
        },
        hook: {
          title: 'II. Động cơ (useAnchorPosition)',
          desc: 'Hook cấp thấp quản lý: ResizeObserver, sự kiện cuộn và double-RAF.',
          points: ['Theo dõi cuộn và thay đổi kích thước', 'Đồng bộ hóa double-RAF', 'Hiệu suất dựa trên Transform']
        },
        container: {
          title: 'III. Trừu tượng (OverlayContainer)',
          desc: 'Container hành vi không kiểu dáng đóng gói mô hình tương tác.',
          points: ['Chiến lược Flip / Shift / Padding', 'Quản lý Focus Trap và Backdrop', 'Ngữ nghĩa tương thích ARIA']
        }
      },
      files: [
        { name: 'useAnchorPosition.ts', role: 'Động cơ tính toán' },
        { name: 'OverlayContainer.tsx', role: 'Bao bọc hành vi' },
        { name: 'PositioningUtils.ts', role: 'Tiện ích toán học' },
        { name: 'types.ts', role: 'Định nghĩa giao diện' }
      ]
    }
  },
  modules: {
    title: 'Mô-đun tính năng',
    subtitle: 'Mẫu UI',
    popover: {
      title: 'Popover',
      tag: 'Tương tác cơ bản',
      desc: 'Container nổi chung với placement và offset mặc định.'
    },
    dropdown: {
      title: 'Menu thả xuống',
      tag: 'Tương tác menu',
      desc: 'Ngữ nghĩa menu với điều hướng bàn phím.'
    },
    tooltip: {
      title: 'Chú thích',
      tag: 'Phản hồi',
      desc: 'Lớp phủ thông tin kích hoạt bởi hover/focus.'
    },
    context: {
      title: 'Menu ngữ cảnh',
      tag: 'Tương tác ngữ cảnh',
      desc: 'Định vị tương đối dựa trên con trỏ.'
    },
    dragdrop: {
      title: 'Kéo thả',
      tag: 'Tương tác kéo',
      desc: 'Kéo thả tùy chỉnh với xem trước nâng cao và hệ thống gợi ý.',
      phases: {
        theory: {
          title: 'I. Động cơ (useDragDrop)',
          desc: 'Nền tảng kỹ thuật của mô hình tương tác kéo thả.',
          points: ['Tích hợp HTML5 Drag & Drop API', 'Quản lý phần tử xem trước tùy chỉnh', 'Kiểm soát trạng thái và tính hợp lệ']
        },
        hook: {
          title: 'II. Xem trước (DragPreview)',
          desc: 'Xử lý phản hồi hình ảnh trong thao tác kéo.',
          points: ['Kỹ thuật hình ảnh bóng mờ trong suốt', 'Theo dõi phần tử DOM nổi', 'Hệ thống gợi ý điều khiển bởi Controller']
        },
        container: {
          title: 'III. Tương tác (Vùng thả)',
          desc: 'Định nghĩa cách phần tử được chấp nhận và xử lý.',
          points: ['Logic xác thực linh hoạt', 'Tạo văn bản gợi ý thả', 'Cập nhật UI lạc quan']
        }
      },
      files: [
        { name: 'useDragDrop.ts', role: 'Hook tương tác cốt lõi' },
        { name: 'DragDropSystem.jsx', role: 'Trình diễn tính năng' },
        { name: 'DraggableItem.tsx', role: 'Thành phần tái sử dụng' }
      ]
    }
  },
  components: {
    desc: 'Khám phá thư viện thành phần nguyên tử của chúng tôi.',
    list: {
      atomDesc: 'Thành phần nguyên tử để xây dựng giao diện nhất quán.',
      shareMyComponents: 'Chia sẻ thành phần của tôi'
    },
    customSelect: {
      title: 'Chọn tùy chỉnh',
      desc: 'Thành phần thả xuống tùy chỉnh hỗ trợ phát hiện biên và theo dõi cuộn.',
      guideTitle: 'Hướng dẫn triển khai',
      tag: 'Định vị thông minh',
      phases: {
        boundary: {
          title: 'I. Phát hiện biên',
          desc: 'Tự động phát hiện biên viewport và điều chỉnh hướng thả xuống.',
          points: ['Logic định vị lên/xuống', 'Tính toán không gian viewport thời gian thực', 'Double-RAF cho đo lường chính xác']
        },
        scroll: {
          title: 'II. Theo dõi cuộn',
          desc: 'Liên tục giám sát sự kiện cuộn để duy trì căn chỉnh.',
          points: ['Trình lắng nghe cuộn cửa sổ và container', 'Tính toán lại vị trí khi cuộn', 'Xử lý sự kiện thay đổi kích thước']
        },
        interaction: {
          title: 'III. Tương tác người dùng',
          desc: 'Cung cấp mẫu tương tác trực quan với quản lý trạng thái phù hợp.',
          points: ['Nhấp bên ngoài để đóng', 'Hỗ trợ điều hướng bàn phím', 'Trực quan hóa trạng thái lỗi']
        }
      },
      files: [
        { name: 'CustomSelect/index.jsx', role: 'Thành phần chính' },
        { name: 'CustomSelect/index.module.css', role: 'Kiểu thành phần' },
        { name: 'demo/demo.jsx', role: 'Ví dụ sử dụng' }
      ],
      featureList: ['Phát hiện biên', 'Nhận biết cuộn', 'Điều hướng bàn phím', 'Kiểm soát căn chỉnh'],
      scenarios: {
        basic: {
          title: 'Sử dụng cơ bản',
          desc: 'Chọn đơn tiêu chuẩn với khả năng tùy chỉnh kiểu.'
        },
        alignment: {
          title: 'Căn chỉnh văn bản',
          desc: 'Hỗ trợ căn trái, giữa và phải tùy ngữ cảnh.'
        },
        states: {
          title: 'Trạng thái',
          desc: 'Phản hồi hình ảnh cho các trạng thái tương tác khác nhau.'
        },
        demo: {
          status: {
            required: 'Trường bắt buộc',
            requiredDesc: 'Nhấp gửi để kích hoạt lỗi',
            requiredPlaceholder: 'Chọn (bắt buộc)...',
            simulateSubmit: 'Mô phỏng gửi',
            errorMsg: 'Vui lòng chọn một tùy chọn',
            optional: 'Trường tùy chọn',
            optionalDesc: 'Xác thực gửi đã tắt',
            optionalPlaceholder: 'Chọn (tùy chọn)...'
          }
        }
      }
    },
    toast: {
      title: 'Thông báo Toast',
      desc: 'Hệ thống phản hồi cao cấp với tương tác dựa trên vật lý.',
      tag: 'Tương tác',
      scenarios: {
        basic: {
          title: 'Sử dụng cơ bản (Tối giản)',
          desc: 'Trạng thái thông báo thuần túy không thanh tiến trình hay nút đóng.',
          success: 'Trạng thái: logic cốt lõi sẵn sàng',
          error: 'Lỗi: vượt quá tần suất yêu cầu',
          info: 'Cập nhật: phiên bản v2.4.0 đã thêm',
          warning: 'Cảnh báo: dung lượng đĩa thấp',
          custom: 'Kích hoạt kiểu tùy chỉnh',
          customMsg: 'Kiểu bóng ma tím tùy chỉnh',
          success_btn: 'Thành công (Tối giản)',
          error_btn: 'Lỗi (Tối giản)',
          info_btn: 'Thông tin (Tối giản)',
          warning_btn: 'Cảnh báo (Tối giản)'
        },
        physics: {
          title: 'Tương tác vật lý (Tạm dừng khi di chuột)',
          desc: 'Khóa thời gian thời gian thực: di chuột đóng băng đếm ngược.',
          hint: 'Ở chế độ này, di chuột đóng băng bộ đếm; nó tiếp tục khi chuột rời đi.',
          msg: 'Quan sát thực nghiệm: với pauseOnHover: true, di chuột kéo dài thời gian đọc vô hạn.',
          btn: 'Khởi động phòng thí nghiệm tạm dừng vật lý'
        },
        manual: {
          title: 'Đóng thủ công',
          desc: 'Mô hình tương tác rõ ràng với nút đóng cho cảnh báo cần xác nhận.',
          hint: 'Buộc hiển thị nút đóng, cho phép người dùng chủ động xóa hàng đợi thông báo.',
          msg: 'Phát hiện tiêm lệnh bất hợp pháp, giao thức bảo mật đã thực thi.',
          btn: 'Hiển thị cảnh báo đóng thủ công'
        },
        action: {
          title: 'JSX và hành động phong phú',
          desc: 'Vượt qua chuỗi: nhúng liên kết, nút và logic bố cục tùy chỉnh.',
          hint: 'Hỗ trợ liên kết tương tác nhúng kích hoạt điều hướng nghiệp vụ khi nhấp.',
          msg: 'Tài liệu biên dịch thành công',
          btn: 'Hiển thị liên kết hành động'
        },
        comparison: {
          title: 'So sánh hệ thống (không tạm dừng)',
          desc: 'Demo chuẩn với pauseOnHover bị tắt.',
          hint: 'So sánh: ngay cả khi di chuột, đếm ngược vẫn tiếp tục.',
          msg: 'Kiểm tra luồng cưỡng bức: dù di chuột thế nào, tôi sẽ biến mất sau 3s.',
          btn: 'Kích hoạt Toast không thể tạm dừng'
        },
        stack: {
          btn: 'Kích hoạt xếp chồng xung'
        }
      },
      guide: {
        back: 'Quay lại danh sách',
        title: 'Toast // Mã nguồn',
        subtitle: '«Hệ thống thông báo cao cấp dựa trên vật lý cho trải nghiệm C-end hiện đại.»',
        architecture: {
          engine: 'Động cơ thử nghiệm',
          physics: 'Động lực học và Động học',
          logic: 'Tổng quan logic cốt lõi',
          logicDesc: 'Quản lý trạng thái tách rời đảm bảo thông báo tồn tại qua điều hướng.'
        },
        sections: {
          physics: {
            title: '01. Logic phần tử vật lý',
            desc: 'Xử lý trạng thái di chuột, đếm ngược mili-giây và đồng bộ hoạt ảnh CSS.'
          },
          orchestration: {
            title: '02. Điều phối trạng thái',
            desc: 'Nhà cung cấp ngữ cảnh toàn cầu quản lý vòng đời hàng đợi thông báo.'
          },
          portal: {
            title: '03. Hạ tầng Portal',
            desc: 'Kết xuất chồng thông báo bên ngoài cây DOM chính.'
          },
          entry: {
            title: '04. Terminal đầu vào',
            desc: 'Xuất thống nhất để tích hợp dễ dàng vào các mô-đun tính năng.'
          }
        }
      }
    },
    detail: {
      loading: 'Đang tải chi tiết thành phần...',
      error: 'Tải thất bại hoặc thành phần không tồn tại.',
      loadingPage: 'Đang tải trang...'
    },
    content: {
      architectureDeepDive: 'Phân tích chuyên sâu kiến trúc',
      implementationOverview: 'Tổng quan triển khai',
      implementationHint: 'Thành phần này bao gồm lớp logic tùy chỉnh. Nhấp nút góc trên bên phải.',
      understandTitle: 'Hiểu sâu cơ chế của thành phần này',
      understandDesc: 'Hơn cả demo UI. Xem cách chúng tôi xây dựng hệ thống tương tác này bằng Context API và Hooks tùy chỉnh.',
      viewGuide: 'Xem hướng dẫn triển khai đầy đủ',
      sourceCode: 'Mã nguồn thành phần',
      sourceCodeDesc: 'Cấu trúc tệp đầy đủ và tham chiếu triển khai',
      coreLogic: 'Logic cốt lõi (Lib)',
      stylesDef: 'Định nghĩa kiểu (CSS)'
    },
    guide: {
      parsingArchitecture: 'Đang phân tích chi tiết kiến trúc...',
      loadFailed: 'Không thể tải mã nguồn thành phần.',
      defaultDesc: 'Thành phần được triển khai qua động cơ sandbox động, bao gồm lớp logic và lớp môi trường.'
    },
    share: {
      header: {
        title: 'Xưởng thành phần',
        restartTour: 'Khởi động lại hướng dẫn',
        tour: 'Hướng dẫn',
        publish: 'Xuất bản vào thư viện'
      },
      sidebar: {
        registerMeta: 'Đăng ký siêu dữ liệu',
        titleZh: 'Tiêu đề tiếng Trung',
        descLabel: 'Mô tả thành phần (CN/EN)',
        descZhPlaceholder: 'Mô tả tiếng Trung...',
        testScenarios: 'Kịch bản kiểm thử'
      },
      drawer: {
        logic: 'Logic cốt lõi (Logic)',
        env: 'Môi trường thực thi (Env)',
        css: 'Nền tảng kiểu (Styles)',
        coreArchitecture: 'Kiến trúc kỹ thuật cốt lõi',
        collapseConsole: 'Thu gọn bảng điều khiển',
        viewArchitecture: 'Xem kiến trúc nguồn',
        wrapperHint: 'Lấy ví dụ wrapper',
        cssHint: 'Lấy ví dụ kiểu CSS'
      },
      modals: {
        newFile: 'Tệp mới',
        cancel: 'Hủy',
        confirmCreate: 'Xác nhận tạo',
        deleteConfirm: 'Xác nhận xóa',
        confirmDelete: 'Xác nhận xóa',
        deleteWarning: 'Bạn sắp xóa vĩnh viễn một tài sản mã:',
        deleteLoseWarning: 'Sau khi xóa, cấu trúc mã nguồn sẽ bị mất cục bộ. Tiếp tục?',
        presetSamples: 'Thư viện mẫu cài sẵn',
        oneClickLoad: 'Tải một nhấp',
        helpIntro: 'Đây là tính năng trình hướng dẫn phát triển. Nhấp nút bên dưới sẽ tự động điền',
        helpMeta: 'Thao tác này sẽ điền thông tin cơ bản đầy đủ của thành phần Toast (tên CN/EN, mô tả và phiên bản).',
        helpScenario: 'Thao tác này sẽ điền một kịch bản React DOM đầy đủ bao gồm cơ chế tương tác { thành công / thất bại / tiến trình }.',
        helpLogic: 'Thao tác này sẽ ghi trực tiếp ba tệp kiến trúc chính: ToastContext, ToastItem và ToastContainer.',
        helpEnv: 'Thao tác này sẽ điền tất cả các nút ngữ cảnh bên ngoài như <ToastProvider />.',
        helpCss: 'Thao tác này sẽ bổ sung CSS Keyframes và dữ liệu kết xuất cơ bản cho hoạt ảnh vào/ra của Toast.',
        editScenario: 'Chỉnh sửa thông tin kịch bản kiểm thử',
        saveChanges: 'Lưu thay đổi',
        chineseName: 'Tên tiếng Trung',
        chineseNamePlaceholder: 'Nhập tên tiếng Trung...',
        welcomeTitle: 'Chào mừng đến phòng thí nghiệm hệ thống',
        welcomeReject: 'Tôi đã quen, từ chối',
        startTour: 'Bắt đầu hướng dẫn',
        welcomeDesc: 'Bể kiến trúc hệ thống đang ở trạng thái trống ban đầu và đây là lần truy cập đầu tiên. Để giúp bạn làm quen với sandbox "4-trong-1" này, chúng tôi đã tích hợp khung hệ thống thông báo toàn cầu (Toast). Bạn có muốn dành 30 giây để trải nghiệm không?',
        fileExtensionHint: 'Khuyến nghị sử dụng phần mở rộng frontend tiêu chuẩn như'
      }
    }
  },
  http: {
    errors: {
      badRequest: 'Tham số yêu cầu không hợp lệ',
      unauthorized: 'Phiên đã hết hạn, vui lòng đăng nhập lại',
      forbidden: 'Bạn không có quyền thực hiện hành động này',
      notFound: 'Tài nguyên yêu cầu không tồn tại',
      methodNotAllowed: 'Phương thức yêu cầu không được phép',
      requestTimeout: 'Hết thời gian chờ, vui lòng thử lại',
      conflict: 'Xung đột dữ liệu, vui lòng làm mới và thử lại',
      unprocessable: 'Xác thực dữ liệu yêu cầu thất bại',
      tooManyRequests: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      internalError: 'Lỗi máy chủ nội bộ',
      badGateway: 'Lỗi cổng, vui lòng thử lại sau',
      serviceUnavailable: 'Dịch vụ tạm thời không khả dụng',
      gatewayTimeout: 'Hết thời gian chờ cổng',
      bizDefault: 'Xử lý thất bại',
      invalidCredentials: 'Tên đăng nhập hoặc mật khẩu không đúng',
      accountDisabled: 'Tài khoản đã bị vô hiệu hóa',
      codeExpired: 'Mã xác minh đã hết hạn',
      dataNotFound: 'Dữ liệu không tồn tại',
      noPermission: 'Không có quyền cho thao tác này',
      serverBusy: 'Máy chủ bận, vui lòng thử lại sau',
      networkError: 'Yêu cầu mạng thất bại, kiểm tra kết nối',
      noRefreshToken: 'Không có token làm mới, vui lòng đăng nhập lại',
      retryPrefix: '[HTTP] Thử lại',
      retrySuffix: 'độ trễ',
      cancelled: 'Yêu cầu đã bị hủy'
    }
  },
  footer: {
    desc: 'Nền tảng chia sẻ kiến thức ghi lại kinh nghiệm dự án và cung cấp thành phần tái sử dụng, Hooks và tài nguyên học tập.',
    resources: 'Tài nguyên',
    Infrastructure: 'Hạ tầng',
    Modules: 'Mô-đun',
    components: 'Thành phần',
    hooks: 'Hooks',
    docs: 'Tài liệu',
    connect: 'Kết nối',
    rights: 'Bảo lưu mọi quyền.',
    feedback: 'Chào đón mọi góp ý và đề xuất!'
  }
};
