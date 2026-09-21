/**
 * 国际化配置
 * 统一管理多语言资源
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 默认语言保留在入口，避免应用启动时出现无资源状态。
import zh from "./zh";

const resources = {
    zh: { translation: zh },
};

const localeLoaders = {
    en: () => import("./en"),
    fr: () => import("./fr"),
    ja: () => import("./ja"),
    ru: () => import("./ru"),
    vi: () => import("./vi"),
};

const localePromises = new Map();

const normalizeLanguage = (language) =>
    String(language || "zh")
        .split("-")[0]
        .toLowerCase();

/**
 * 加载并注册指定语言资源。
 * 同一语言只会发起一次动态导入，避免切换语言时重复下载。
 */
export function loadLocale(language) {
    const locale = normalizeLanguage(language);
    const loader = localeLoaders[locale];

    if (!loader) return Promise.resolve();

    if (!localePromises.has(locale)) {
        localePromises.set(
            locale,
            loader().then(({ default: translation }) => {
                i18n.addResourceBundle(
                    locale,
                    "translation",
                    translation,
                    true,
                    true,
                );
            }),
        );
    }

    return localePromises.get(locale);
}

const i18nInitPromise = i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        // load: 'languageOnly' 只影响资源加载层级，并不会把 i18n.language 归一为纯语言代码
        load: "languageOnly",
        // 显式声明受支持的语言
        supportedLngs: ["en", "zh", "fr", "ja", "ru", "vi"],
        nonExplicitSupportedLngs: false,
        fallbackLng: "zh",
        detection: {
            order: ["localStorage", "navigator"],
            // 与 languageService 共用同一 localStorage key，避免两套状态脱节
            lookupLocalStorage: "language",
            caches: ["localStorage"],
            // 关键：把检测到的 zh-CN/en-US 归一为 zh/en。
            // 否则 i18n.language 仍是 'zh-CN'，LANG_LABELS['zh-CN'] 取不到值，
            // MainLayout 的语言标签会回落成 'EN'。
            convertDetectedLanguage: (lng) => lng.split("-")[0].toLowerCase(),
        },
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

// 先完成语言检测，再加载当前语言，避免首屏短暂回退到中文。
export const i18nReady = i18nInitPromise
    .then(() => loadLocale(i18n.language))
    .catch(() => i18n.changeLanguage("zh"));

export default i18n;
