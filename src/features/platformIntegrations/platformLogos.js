const PLATFORM_LOGO_FILES = {
    csdn: "csdn",
    juejin: "juejin",
    wechat_mp: "wechat",
    weibo: "sinaweibo",
    zhihu: "zhihu",
    xiaohongshu: "xiaohongshu",
    bilibili: "bilibili",
    aliyun_dev: "alibabacloud",
};

const PLATFORM_FAVICONS = {
    baijiahao: "https://baijiahao.baidu.com/favicon.ico",
    cnblogs: "https://www.cnblogs.com/favicon.ico",
    douyin: "https://www.douyin.com/favicon.ico",
    toutiao: "https://www.toutiao.com/favicon.ico",
    "51cto": "https://www.51cto.com/favicon.ico",
    jianshu: "https://www.jianshu.com/favicon.ico",
    segmentfault: "https://segmentfault.com/favicon.ico",
    oschina: "https://www.oschina.net/favicon.ico",
    tencent_dev: "https://cloud.tencent.com/favicon.ico",
};

export const getPlatformLogoSrc = (platformId) => {
    if (platformId === "local") return "/assets/workspace/workspace-logo.svg";

    const logoFile = PLATFORM_LOGO_FILES[platformId];
    if (logoFile) return `/assets/platform-logos/${logoFile}.svg`;

    return PLATFORM_FAVICONS[platformId] || null;
};
